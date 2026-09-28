/**
 * RULE ENGINE — hàm thuần, chạy luật trên feature đã qua cổng.
 *
 * Engine KHÔNG được và KHÔNG THỂ:
 *   · nhìn ảnh/video/âm thanh     — chữ ký hàm chỉ nhận feature đã trích
 *   · gọi LLM hay mạng            — không import gì ngoài schema
 *   · tự suy diễn ngoài luật      — chỉ so số với khoảng đã khai
 *   · tự tạo luật                 — kho luật truyền từ ngoài vào
 *   · dùng feature low_confidence / unsupported — cổng chặn trước khi tới đây
 *
 * FAIL CLOSED: thiếu bất cứ thứ gì thì BỎ QUA luật và ghi lý do, không đoán.
 */

import type { EligibilityVerdict } from "../../features/physiognomy/measurement-contract/policy";
import { getSource, isUsableSource, type KnowledgeSource } from "../../knowledge/physiognomy/source";
import { isRunnable, type PhysiognomyRule } from "./rule";

export const ENGINE_VERSION = "physiognomy-engine-v1" as const;

/** Giá trị feature mà engine được phép thấy. KHÔNG có landmark, KHÔNG có ảnh. */
export interface EngineFeature {
  key: string;
  value: number | null;
  unit: string;
  confidence: number;
  status: string;
  method: string;
  sourceView: string | null;
}

export interface FeatureEvidence {
  featureKey: string;
  value: number | null;
  confidence: number;
  measurementStatus: string;
  method: string;
  sourceView: string | null;
  eligible: boolean;
}

export interface SourceEvidence {
  sourceId: string;
  title: string;
  citation: string;
  locator: KnowledgeSource["locator"];
  verificationStatus: KnowledgeSource["verificationStatus"];
}

export type SkipReason =
  | "rule_not_runnable"
  | "feature_missing"
  | "feature_not_eligible"
  | "feature_value_null"
  | "source_not_verified";

export interface RuleResult {
  ruleId: string;
  /** null khi luật bị BỎ QUA — khác hẳn với `false` nghĩa là đã chạy và không khớp. */
  matched: boolean | null;
  skipped: boolean;
  skipReasons: SkipReason[];
  featureEvidence: FeatureEvidence[];
  sourceEvidence: SourceEvidence[];
  /** Độ tin của luật × độ tin thấp nhất trong các feature nó dùng. */
  confidence: number;
  limitations: string[];
  engineVersion: typeof ENGINE_VERSION;
}

export interface EvaluateInput {
  features: EngineFeature[];
  eligibility: Record<string, EligibilityVerdict>;
  rules: readonly PhysiognomyRule[];
}

/**
 * Chạy toàn bộ kho luật.
 *
 * Thứ tự kiểm cố ý: hình dạng luật → nguồn → feature. Kiểm nguồn trước feature để
 * một luật không có provenance bị chặn ngay, kể cả khi phép đo hoàn hảo.
 */
export function evaluate(input: EvaluateInput): RuleResult[] {
  const byKey = new Map(input.features.map((f) => [f.key, f]));
  const out: RuleResult[] = [];

  for (const rule of input.rules) {
    const skipReasons: SkipReason[] = [];
    const featureEvidence: FeatureEvidence[] = [];
    const sourceEvidence: SourceEvidence[] = [];

    if (!isRunnable(rule)) skipReasons.push("rule_not_runnable");

    // ── nguồn
    for (const id of rule.sourceRefs) {
      const s = getSource(id);
      if (!isUsableSource(s)) continue;
      sourceEvidence.push({
        sourceId: s.sourceId,
        title: s.title,
        citation: s.citation,
        locator: s.locator,
        verificationStatus: s.verificationStatus,
      });
    }
    if (sourceEvidence.length === 0) skipReasons.push("source_not_verified");

    // ── feature
    let confFeature = 1;
    for (const key of rule.featureRequirements) {
      const f = byKey.get(key);
      const verdict = input.eligibility[key];
      if (!f) {
        skipReasons.push("feature_missing");
        continue;
      }
      const eligible = verdict?.eligible === true;
      featureEvidence.push({
        featureKey: f.key,
        value: f.value,
        confidence: f.confidence,
        measurementStatus: f.status,
        method: f.method,
        sourceView: f.sourceView,
        eligible,
      });
      if (!eligible) skipReasons.push("feature_not_eligible");
      if (f.value === null) skipReasons.push("feature_value_null");
      confFeature = Math.min(confFeature, f.confidence);
    }

    if (skipReasons.length > 0) {
      out.push({
        ruleId: rule.ruleId,
        matched: null,
        skipped: true,
        // Bỏ trùng nhưng giữ nguyên thứ tự phát hiện.
        skipReasons: [...new Set(skipReasons)],
        featureEvidence,
        sourceEvidence,
        confidence: 0,
        limitations: rule.limitations,
        engineVersion: ENGINE_VERSION,
      });
      continue;
    }

    // ── so số với khoảng. Chỉ tới đây khi MỌI cổng đã qua.
    let matched = true;
    for (const c of rule.conditions) {
      const f = byKey.get(c.featureKey);
      const v = f?.value;
      if (typeof v !== "number") {
        matched = false;
        break;
      }
      if (c.min !== null && v < c.min) matched = false;
      if (c.max !== null && v > c.max) matched = false;
    }

    out.push({
      ruleId: rule.ruleId,
      matched,
      skipped: false,
      skipReasons: [],
      featureEvidence,
      sourceEvidence,
      confidence: Math.round(rule.confidence * confFeature * 10_000) / 10_000,
      limitations: rule.limitations,
      engineVersion: ENGINE_VERSION,
    });
  }

  return out;
}
