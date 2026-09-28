/**
 * TẦNG LUẬN GIẢI — nhận bằng chứng đã qua cổng, KHÔNG tự sinh ra kiến thức.
 *
 * Tầng này cố ý rất mỏng. Nó không biết gì về camera, landmark, phiên hay mạng; nó chỉ
 * gói những gì Rule Engine đã chứng minh được thành một bó bằng chứng truy vết được.
 *
 * ⚠️ HIỆN KHÔNG LUẬN GIẢI ĐƯỢC GÌ. Kho nguồn rỗng nên không luật nào chạy, nên mọi lần
 * gọi đều trả `INSUFFICIENT_EVIDENCE`. Đó là trạng thái đúng của hệ ở thời điểm này.
 */

import type { RuleResult, FeatureEvidence, SourceEvidence } from "../../rules/physiognomy/engine";

export const INTERPRETATION_VERSION = "physiognomy-interpretation-v1" as const;

/**
 * Chuỗi truy vết đầy đủ cho MỘT kết luận:
 *   camera → landmark → feature → luật → nguồn → câu chữ
 * Thiếu một mắt xích thì không có kết luận.
 */
export interface EvidenceBundle {
  ruleResults: RuleResult[];
  featureEvidence: FeatureEvidence[];
  sourceEvidence: SourceEvidence[];
  /** Feature bị chặn ở cổng, kèm lý do — để nói được "vì sao chưa luận được". */
  blocked: { featureKey: string; reasons: string[] }[];
}

export type InterpretationOutcome = "ok" | "INSUFFICIENT_EVIDENCE";

export interface InterpretationResult {
  outcome: InterpretationOutcome;
  /** Rỗng khi outcome khác "ok". KHÔNG BAO GIỜ chứa câu tự nghĩ ra. */
  statements: {
    ruleId: string;
    text: string;
    confidence: number;
    sourceIds: string[];
    featureKeys: string[];
  }[];
  /** Vì sao chưa luận được, viết cho người đọc. */
  reasons: string[];
  bundle: EvidenceBundle;
  version: typeof INTERPRETATION_VERSION;
}

/**
 * Gom kết quả luật thành bó bằng chứng. Thuần, không mạng, không LLM.
 *
 * Chỉ luật `matched === true` mới sinh câu, và câu đó CHÉP từ `interpretation` của
 * luật (vốn chép từ nguồn) — tầng này không viết lại chữ nào.
 */
export function interpret(
  ruleResults: RuleResult[],
  blocked: { featureKey: string; reasons: string[] }[],
  ruleText: (ruleId: string) => string,
): InterpretationResult {
  const featureEvidence = ruleResults.flatMap((r) => r.featureEvidence);
  const sourceEvidence = ruleResults.flatMap((r) => r.sourceEvidence);
  const bundle: EvidenceBundle = { ruleResults, featureEvidence, sourceEvidence, blocked };

  const khop = ruleResults.filter((r) => r.matched === true);
  if (khop.length === 0) {
    const reasons: string[] = [];
    if (ruleResults.length === 0) reasons.push("Không có luật nào trong kho.");
    const boQua = ruleResults.filter((r) => r.skipped);
    if (boQua.length > 0) {
      const ly = [...new Set(boQua.flatMap((r) => r.skipReasons))];
      reasons.push(`${boQua.length} luật bị bỏ qua: ${ly.join(", ")}.`);
    }
    if (blocked.length > 0) {
      reasons.push(`${blocked.length} feature chưa đủ tư cách luận giải.`);
    }
    if (reasons.length === 0) reasons.push("Không luật nào khớp.");
    return { outcome: "INSUFFICIENT_EVIDENCE", statements: [], reasons, bundle, version: INTERPRETATION_VERSION };
  }

  return {
    outcome: "ok",
    statements: khop.map((r) => ({
      ruleId: r.ruleId,
      text: ruleText(r.ruleId),
      confidence: r.confidence,
      sourceIds: r.sourceEvidence.map((s) => s.sourceId),
      featureKeys: r.featureEvidence.map((f) => f.featureKey),
    })),
    reasons: [],
    bundle,
    version: INTERPRETATION_VERSION,
  };
}

// ─────────────────────────────────────────────── adapter LLM (chỉ khung)

/**
 * Chỗ cắm cho mô hình ngôn ngữ — CHƯA NỐI VỚI GÌ CẢ.
 *
 * Khi nối, mô hình chỉ được phép **diễn đạt lại bó bằng chứng được đưa cho**. Nó
 * KHÔNG được:
 *   · bịa bằng chứng, bịa luật, bịa nguồn, bịa số đo
 *   · thêm kết luận không có trong `bundle`
 *   · truy cập ảnh, landmark, phiên hay Internet
 *
 * Chữ ký hàm ép điều đó: đầu vào chỉ có `EvidenceBundle`. Không có đường nào khác để
 * dữ liệu lọt vào.
 */
export interface PhysiognomyExplanationProvider {
  readonly name: string;
  explain(bundle: EvidenceBundle): Promise<
    | { ok: true; text: string }
    | { ok: false; code: "INSUFFICIENT_EVIDENCE"; reason: string }
  >;
}

/**
 * Provider mặc định: từ chối mọi thứ.
 *
 * Cố ý để hệ chạy đầu-cuối được mà không có mô hình nào, và để nếu ai quên cắm
 * provider thật thì kết quả là "không giải thích được", chứ không phải im lặng.
 */
export const REFUSING_PROVIDER: PhysiognomyExplanationProvider = {
  name: "refusing-provider",
  async explain(bundle) {
    const khop = bundle.ruleResults.filter((r) => r.matched === true).length;
    return {
      ok: false,
      code: "INSUFFICIENT_EVIDENCE",
      reason:
        khop === 0
          ? "Không có luật nào khớp có nguồn xác minh — không có gì để diễn đạt."
          : "Chưa cắm mô hình giải thích nào.",
    };
  },
};
