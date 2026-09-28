/**
 * LUẬT NHÂN TƯỚNG — hình dạng của một luật, và kho luật đang có.
 *
 * Luật CHỈ nhận khoá feature. Không nhận ảnh, không nhận landmark, không nhận session.
 * Ranh giới đó được khoá bằng test.
 *
 * ⚠️ KHO LUẬT HIỆN CHỈ CÓ MỘT LUẬT NHÁP, KHÔNG CÓ NGƯỠNG VÀ KHÔNG CÓ NGUỒN.
 * Nó tồn tại để chứng minh hình dạng schema và để test chứng minh cổng chặn được nó —
 * chứ không phải để dùng. Ngưỡng cổ truyền (ví dụ "trung đình chiếm 1/3") phải lấy từ
 * bản in thật rồi mới điền, xem `src/knowledge/physiognomy/source.ts`.
 */

export const RULE_SCHEMA_VERSION = "physiognomy-rule-v1" as const;

/**
 *  draft      — đang phác, thiếu nguồn hoặc thiếu ngưỡng. KHÔNG BAO GIỜ được chạy.
 *  proposed   — đã có nguồn nhưng chưa ai rà lại.
 *  active     — đã rà, được phép chạy nếu feature cũng đủ tư cách.
 *  retired    — đã bỏ, giữ lại để đọc lịch sử.
 */
export type RuleStatus = "draft" | "proposed" | "active" | "retired";

export type RuleDomain =
  | "three_courts"
  | "five_officials"
  | "face_shape"
  | "twelve_palaces"
  | "other";

/**
 * Một điều kiện trên MỘT feature.
 *
 * `min`/`max` là khoảng tỉ lệ đã chuẩn hoá. `null` nghĩa là CHƯA CÓ NGƯỠNG — luật mang
 * điều kiện như vậy không thể `active`, và engine sẽ từ chối chạy.
 */
export interface RuleCondition {
  featureKey: string;
  min: number | null;
  max: number | null;
  /** Ngưỡng này lấy từ đâu. Bắt buộc khi min/max khác null. */
  thresholdSource: string | null;
}

export interface PhysiognomyRule {
  ruleId: string;
  domain: RuleDomain;
  /** Khoá feature bắt buộc phải có mặt và đủ tư cách. */
  featureRequirements: string[];
  conditions: RuleCondition[];
  /**
   * Câu luận giải, chép từ nguồn. KHÔNG được tự viết lại cho "hay hơn".
   * Rỗng khi luật còn ở trạng thái nháp.
   */
  interpretation: string;
  /** sourceId trong `src/knowledge/physiognomy/source.ts`. Rỗng = không có provenance. */
  sourceRefs: string[];
  /** 0..1 — độ tin của CHÍNH LUẬT, khác với độ tin của phép đo. */
  confidence: number;
  /** Luật áp dụng cho ai, trong hoàn cảnh nào. Không rõ thì ghi rõ là không rõ. */
  applicability: string;
  limitations: string[];
  status: RuleStatus;
  schemaVersion: typeof RULE_SCHEMA_VERSION;
}

/**
 * Luật nháp DUY NHẤT. Cố ý thiếu ngưỡng và thiếu nguồn.
 *
 * Giữ nó lại vì ba lý do: minh hoạ schema, cho test chứng minh cổng chặn được luật
 * thiếu provenance, và làm chỗ điền khi có bản in thật trong tay.
 */
export const THREE_COURTS_MIDDLE_001: PhysiognomyRule = {
  ruleId: "THREE_COURTS_MIDDLE_001",
  domain: "three_courts",
  featureRequirements: ["face.three_courts.middle"],
  conditions: [
    {
      featureKey: "face.three_courts.middle",
      // CHƯA CÓ NGƯỠNG. Con số cổ truyền phải đọc từ bản in, không suy từ trí nhớ.
      min: null,
      max: null,
      thresholdSource: null,
    },
  ],
  interpretation: "",
  sourceRefs: [],
  confidence: 0,
  applicability: "Chưa xác định — cần nguồn nói rõ luật áp dụng cho ai.",
  limitations: [
    "Chưa có ngưỡng lấy từ nguồn thật.",
    "Chưa có nguồn cổ thư đã xác minh.",
    "Feature nền (face.three_courts.middle) mới ở mức provisional, 1 người / 1 máy.",
  ],
  status: "draft",
  schemaVersion: RULE_SCHEMA_VERSION,
};

/** Kho luật đang có. Một luật, trạng thái nháp, không chạy được. */
export const PHYSIOGNOMY_RULES: readonly PhysiognomyRule[] = Object.freeze([
  THREE_COURTS_MIDDLE_001,
]);

/** Luật có đủ hình dạng để CHẠY không (chưa xét tới feature hay nguồn). */
export function isRunnable(rule: PhysiognomyRule): boolean {
  if (rule.status !== "active") return false;
  if (rule.conditions.length === 0) return false;
  if (rule.sourceRefs.length === 0) return false;
  if (rule.interpretation.trim() === "") return false;
  return rule.conditions.every(
    (c) => (c.min !== null || c.max !== null) && c.thresholdSource !== null,
  );
}
