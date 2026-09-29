/**
 * PIPELINE — nối các tầng lại, KHÔNG tự làm gì cả.
 *
 *   FeatureProfile → MeasurementContract → EligibilityGate → RuleEngine
 *                  → EvidenceBundle → Interpretation
 *
 * Mỗi mũi tên là một ranh giới thật: tầng sau chỉ thấy đúng thứ tầng trước đưa cho.
 * Pipeline không nhìn camera, không chạm phiên, không gọi mạng.
 *
 * FAIL CLOSED ở mọi mắt xích. Feature thiếu bằng chứng → bỏ luật dùng nó, không đoán.
 */

import { buildReliability, type FeatureReliability } from "./measurement-contract/reliability";
import { evaluateAll, type EligibilityVerdict } from "./measurement-contract/policy";
import type { PhysiognomyFeatureProfile } from "./features/schema";
import {
  hasVerifiedSource,
  PINNED_EVIDENCE_RESOLVER,
  type EvidenceResolver,
} from "../../knowledge/physiognomy/source";
import {
  getInterpretationsForFeature,
  type InterpretationItem,
} from "../../knowledge/physiognomy/interpretation-library";
import { PHYSIOGNOMY_RULES, type PhysiognomyRule } from "../../rules/physiognomy/rule";
import { evaluate, type EngineFeature, type RuleResult } from "../../rules/physiognomy/engine";
import {
  interpret,
  type InterpretationResult,
} from "../../interpretation/physiognomy/index";

export const PIPELINE_VERSION = "physiognomy-pipeline-v1" as const;

export interface PipelineOutput {
  pipelineVersion: typeof PIPELINE_VERSION;
  reliability: Record<string, FeatureReliability>;
  eligibility: Record<string, EligibilityVerdict>;
  ruleResults: RuleResult[];
  interpretation: InterpretationResult;
  /** Tóm tắt để bảng chẩn đoán khỏi phải tự đếm. */
  summary: {
    totalFeatures: number;
    measured: number;
    validated: number;
    eligible: number;
    rulesConsidered: number;
    rulesSkipped: number;
    rulesMatched: number;
  };
}

/**
 * Rút feature ra khỏi profile thành thứ Rule Engine được phép thấy.
 *
 * Đây là chỗ CHẶN dữ liệu thô: engine nhận đúng 7 trường dưới đây, không có landmark,
 * không có ảnh, không có phiên. Muốn engine thấy thêm gì thì phải sửa ở đây và test sẽ
 * bắt được.
 */
function toEngineFeatures(profile: PhysiognomyFeatureProfile): EngineFeature[] {
  const out: EngineFeature[] = [];
  const seen = new Set<string>();
  const walk = (v: unknown) => {
    if (v === null || typeof v !== "object" || Array.isArray(v)) return;
    const o = v as Record<string, unknown>;
    if (typeof o.key === "string" && typeof o.status === "string" && "value" in o) {
      if (seen.has(o.key)) return;
      seen.add(o.key);
      out.push({
        key: o.key,
        value: (o.value as number | null) ?? null,
        unit: String(o.unit),
        confidence: Number(o.confidence),
        status: String(o.status),
        method: String(o.method),
        sourceView: (o.sourceView as string | null) ?? null,
      });
      return;
    }
    for (const x of Object.values(o)) walk(x);
  };
  walk(profile.geometry);
  walk(profile.faceShape);
  walk(profile.threeCourts);
  walk(profile.fiveOfficials);
  walk(profile.pose);
  return out;
}

export interface RunOptions {
  /** Cho test bơm kho luật riêng. Mặc định dùng kho thật (một luật nháp). */
  rules?: readonly PhysiognomyRule[];
  /**
   * Cho test bơm cách tra nguồn riêng. Mặc định tra kho nguồn thật — vốn RỖNG, nên
   * mặc định là không feature nào có nguồn.
   */
  sourceLookup?: (featureKey: string) => boolean;
  /**
   * Bộ phân giải hiện vật. Mặc định là resolver THẬT (`PINNED_EVIDENCE_RESOLVER`) — nó chỉ
   * mở đúng các bản scan đã đối chiếu tay. Cho test bơm resolver khác để soi từng nhánh.
   */
  resolver?: EvidenceResolver;
}

export function runPhysiognomyPipeline(
  profile: PhysiognomyFeatureProfile,
  opts: RunOptions = {},
): PipelineOutput {
  return runPipelineOnFeatures(toEngineFeatures(profile), opts);
}

/**
 * Cùng pipeline, nhưng vào thẳng từ danh sách feature phẳng.
 *
 * Dành cho nơi chỉ có payload transport chứ không có profile nội bộ — cụ thể là bảng
 * chẩn đoán trên máy tính. Cố ý bày ra lối vào này thay vì để chỗ đó tự đấu lại
 * contract + cổng + engine: đấu lại là tạo ra một bản sao có thể trôi khác bản chính.
 */
/**
 * Câu chữ luận giải (skill-derived) được PHÉP dùng cho một feature, kèm luật đã kích hoạt.
 *
 * Chỉ sinh ra khi có LUẬT ĐÃ MATCH hợp lệ — và luật chỉ match được khi có nguồn verified
 * + feature eligible (engine lo phần đó). Thư viện luận giải là skill-derived, KHÔNG bao
 * giờ tự mở kết luận: nó chỉ cấp CÂU CHỮ SAU khi engine đã chứng minh.
 */
export interface ResolvedInterpretation {
  /** Luật đã match, nguồn kích hoạt. */
  ruleId: string;
  featureKey: string;
  /** Mục từ thư viện luận giải — tất cả skill-derived/unverified. */
  items: InterpretationItem[];
}

/**
 * Nối kết quả pipeline với THƯ VIỆN LUẬN GIẢI. FAIL-CLOSED, DETERMINISTIC, KHÔNG LLM.
 *
 * Quy tắc kích hoạt (mọi điều kiện phải đủ):
 *   1. Luật `matched === true` và không bị bỏ qua — tức đã qua verified source + eligible.
 *   2. Feature của luật `eligible === true`.
 *   3. Feature key khớp `featureConcepts` của mục thư viện.
 *
 * Hệ quả có chủ đích: KNOWLEDGE_SOURCES rỗng → 0 luật match → trả []. Thư viện có bao
 * nhiêu mục cũng không kích hoạt được gì. Đây KHÔNG phải nơi mở luật — chỉ tra câu chữ.
 */
export function resolveInterpretations(out: PipelineOutput): ResolvedInterpretation[] {
  const resolved: ResolvedInterpretation[] = [];
  for (const rr of out.ruleResults) {
    if (rr.matched !== true || rr.skipped) continue; // CHỈ luật đã match hợp lệ
    for (const fe of rr.featureEvidence) {
      if (!fe.eligible) continue; // feature chưa đủ tư cách → bỏ
      const items = getInterpretationsForFeature(fe.featureKey);
      if (items.length > 0) resolved.push({ ruleId: rr.ruleId, featureKey: fe.featureKey, items });
    }
  }
  return resolved;
}

export function runPipelineOnFeatures(
  features: EngineFeature[],
  opts: RunOptions = {},
): PipelineOutput {
  const rules = opts.rules ?? PHYSIOGNOMY_RULES;
  const resolver = opts.resolver ?? PINNED_EVIDENCE_RESOLVER;

  // 1. Hợp đồng đo — đo được gì, và đã kiểm chứng tới đâu.
  const reliability = buildReliability(
    features.map((f) => ({ key: f.key, status: f.status as never, confidence: f.confidence })),
  );

  // 2. Cổng — feature nào đủ tư cách. Nguồn tra theo luật nào đang dùng feature đó.
  const sourceLookup =
    opts.sourceLookup ??
    ((featureKey: string) =>
      rules.some(
        (r) =>
          r.featureRequirements.includes(featureKey) && hasVerifiedSource(r.sourceRefs, resolver),
      ));
  const eligibility = evaluateAll(reliability, sourceLookup);

  // 3. Luật — chỉ chạy trên feature đã qua cổng.
  const ruleResults = evaluate({ features, eligibility, rules, resolver });

  // 4. Luận giải — chỉ gói lại thứ luật đã chứng minh.
  const blocked = Object.values(eligibility)
    .filter((v) => !v.eligible)
    .map((v) => ({ featureKey: v.featureKey, reasons: v.reasons as string[] }));
  const ruleText = (id: string) => rules.find((r) => r.ruleId === id)?.interpretation ?? "";
  const interpretation = interpret(ruleResults, blocked, ruleText);

  return {
    pipelineVersion: PIPELINE_VERSION,
    reliability,
    eligibility,
    ruleResults,
    interpretation,
    summary: {
      totalFeatures: features.length,
      measured: features.filter((f) => f.status === "measured").length,
      validated: Object.values(reliability).filter((r) => r.validationStatus === "validated").length,
      eligible: Object.values(eligibility).filter((v) => v.eligible).length,
      rulesConsidered: rules.length,
      rulesSkipped: ruleResults.filter((r) => r.skipped).length,
      rulesMatched: ruleResults.filter((r) => r.matched === true).length,
    },
  };
}

// ─────────────────────────────────────────── TẦNG THAM KHẢO (advisory)

/**
 * ADVISORY — quan sát THAM KHẢO, TÁCH HẲN verified path.
 *
 * Đặt ở tầng PIPELINE (orchestrator) vì cần chạm kho tri thức — tầng `interp` là lá thuần,
 * KHÔNG được import knowledge (ranh giới ở nhan-tuong-boundary). Composer này KHÔNG dùng
 * `evaluate`/eligibility/`resolveInterpretations`, KHÔNG sinh `InterpretationResult`, KHÔNG
 * nâng `verificationStatus`. Verified path chạy độc lập và vẫn fail-closed.
 */
export const ADVISORY_VERSION = "physiognomy-advisory-v1" as const;

const ADVISORY_KEYS = {
  browL: "face.eyebrows.left_length", browR: "face.eyebrows.right_length",
  eyeL: "face.eyes.left_width", eyeR: "face.eyes.right_width",
} as const;

export interface AdvisoryReference {
  concept: string;
  text: string;
  verificationStatus: "unverified";
  attribution: string;
}

export interface AdvisoryInterpretation {
  /** KHÔNG BAO GIỜ "ok" — nhãn phân biệt với verified result. */
  status: "ADVISORY";
  confidence: "LOW";
  observation: {
    pattern: "brow_longer_than_eye";
    holds: boolean;
    observed: { key: string; value: number }[];
  };
  references: AdvisoryReference[];
  disclaimer: string;
  version: typeof ADVISORY_VERSION;
}

const ADVISORY_DISCLAIMER =
  "Đây là quan sát THAM KHẢO từ thư tịch, độ tin cậy đo lường THẤP — CHƯA phải kết luận " +
  "tướng học đã được xác thực. Nội dung là tri thức tổng hợp (chưa đối chiếu bản gốc).";

/**
 * Dựng advisory cho pattern 眉長過目 từ feature ĐÃ ĐO — KHÔNG cần eligibility, KHÔNG chạm
 * verified engine. Trả `null` khi thiếu đo (chưa quan sát được) hoặc mày không dài hơn mắt
 * ở cả hai bên (pattern không thành). Câu chữ chép nguyên từ thư viện skill-derived.
 */
export function composeBrowEyeAdvisory(features: EngineFeature[]): AdvisoryInterpretation | null {
  const byKey = new Map(features.map((f) => [f.key, f]));
  const num = (k: string) => {
    const v = byKey.get(k)?.value;
    return typeof v === "number" ? v : null;
  };
  const bL = num(ADVISORY_KEYS.browL), bR = num(ADVISORY_KEYS.browR);
  const eL = num(ADVISORY_KEYS.eyeL), eR = num(ADVISORY_KEYS.eyeR);
  if (bL === null || bR === null || eL === null || eR === null) return null;
  if (!(bL > eL && bR > eR)) return null;

  const references: AdvisoryReference[] = getInterpretationsForFeature(ADVISORY_KEYS.browL).map(
    (it) => ({
      concept: it.concept,
      text: it.interpretation,
      verificationStatus: it.provenance.verificationStatus,
      attribution: it.provenance.attribution,
    }),
  );

  return {
    status: "ADVISORY",
    confidence: "LOW",
    observation: {
      pattern: "brow_longer_than_eye",
      holds: true,
      observed: [
        { key: ADVISORY_KEYS.browL, value: bL }, { key: ADVISORY_KEYS.eyeL, value: eL },
        { key: ADVISORY_KEYS.browR, value: bR }, { key: ADVISORY_KEYS.eyeR, value: eR },
      ],
    },
    references,
    disclaimer: ADVISORY_DISCLAIMER,
    version: ADVISORY_VERSION,
  };
}
