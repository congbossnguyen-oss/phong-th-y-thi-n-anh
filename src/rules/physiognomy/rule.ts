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

/**
 * Một phép SO SÁNH giữa hai feature — KHÔNG có ngưỡng số.
 *
 * Đây là con đường duy nhất mà cổ thư thật cho phép mà không phải bịa số: sách nói
 * 「眉長過目」 (mày dài hơn mắt), một mệnh đề SO SÁNH thuần, không nói "dài bao nhiêu".
 *
 * Ràng buộc cố ý:
 *   · chỉ có `>` (nghiêm ngặt), khớp đúng chữ 「過」 — không `>=`, không biên độ/epsilon.
 *   · hai feature phải cùng mẫu số chuẩn hoá thì phép so mới có nghĩa; điều đó KHÔNG
 *     kiểm được ở đây mà phải bảo đảm khi chọn cặp khoá (xem luật bên dưới).
 *   · `basisSource` bắt buộc: phép so này phát biểu ở nguồn nào.
 */
export interface RuleComparison {
  leftFeatureKey: string;
  op: ">";
  rightFeatureKey: string;
  /** sourceId trong `source.ts` phát biểu phép so sánh này. */
  basisSource: string;
}

export interface PhysiognomyRule {
  ruleId: string;
  domain: RuleDomain;
  /** Khoá feature bắt buộc phải có mặt và đủ tư cách. */
  featureRequirements: string[];
  conditions: RuleCondition[];
  /**
   * Phép so sánh giữa hai feature, cho luật kiểu 「過」 không có ngưỡng số. Tuỳ chọn:
   * luật cũ chỉ có `conditions`, luật so sánh chỉ có `comparisons`. Một luật phải có ÍT
   * NHẤT một trong hai thì mới chạy được (xem `isRunnable`).
   */
  comparisons?: RuleComparison[];
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

/**
 * 眉長過目 — mày dài hơn mắt. Luật SO SÁNH thật đầu tiên, và tới giờ là duy nhất.
 *
 * Vì sao luật này hợp lệ mà không cần bịa ngưỡng: nguồn (神相全編 卷三 相眉, đã xác minh
 * tận bản scan — xem `SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001`) phát biểu một phép SO SÁNH, không
 * phải một con số. Ta chỉ chép đúng phép so đó.
 *
 * Vì sao phép so có nghĩa về mặt đo: cả `eyebrows.*_length` lẫn `eyes.*_width` đều chuẩn
 * hoá theo CÙNG mẫu số faceWidth (xem landmarks.ts / SPANS), nên `mày > mắt` trên tỉ lệ
 * tương đương `mày > mắt` trên pixel — không cần khử mẫu số. So CÙNG BÊN (trái↔trái,
 * phải↔phải), không so chéo.
 *
 * Ngữ nghĩa (chép từ nguồn, thuộc về 兄弟/anh em — KHÔNG phải tài lộc): xem `interpretation`.
 *
 * ⚠️ Trong sản phẩm thật luật này VẪN không bao giờ chạy tới bước so: bốn feature nền đều
 * `low_confidence` nên trượt cổng tư cách. Nó "runnable" về hình dạng, nhưng fail-closed ở
 * cổng đo. Chỉ test bơm feature đủ tư cách mới chứng minh được nhánh khớp.
 */
export const BROW_LONGER_THAN_EYE_SIBLINGS_001: PhysiognomyRule = {
  ruleId: "BROW_LONGER_THAN_EYE_SIBLINGS_001",
  domain: "five_officials",
  featureRequirements: [
    "face.eyebrows.left_length",
    "face.eyes.left_width",
    "face.eyebrows.right_length",
    "face.eyes.right_width",
  ],
  conditions: [],
  comparisons: [
    {
      leftFeatureKey: "face.eyebrows.left_length",
      op: ">",
      rightFeatureKey: "face.eyes.left_width",
      basisSource: "SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001",
    },
    {
      leftFeatureKey: "face.eyebrows.right_length",
      op: ">",
      rightFeatureKey: "face.eyes.right_width",
      basisSource: "SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001",
    },
  ],
  // Chép nguyên văn nguồn + gắn rõ đây là mệnh đề của cổ thư, không phải kết luận của hệ.
  interpretation:
    "Nguồn 《神相全編》卷三「相眉」chép: 「眉長過眼，弟兄須五六」— tướng mày dài quá mắt, theo " +
    "sách thuộc về việc anh em (兄弟), không phải tài lộc. Đây là mệnh đề của cổ thư ứng với " +
    "phép đo «mày dài hơn mắt», KHÔNG phải suy luận của phần mềm.",
  sourceRefs: ["SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001"],
  confidence: 0.5,
  applicability:
    "Chỉ khi CẢ bốn feature (mày/mắt hai bên) đủ tư cách đo. Nguồn không giới hạn đối tượng.",
  limitations: [
    "Nguồn nói về 兄弟 (anh em ruột) — không mở rộng sang tài lộc, tính cách, sức khoẻ.",
    "Phép so cần mày và mắt cùng chuẩn hoá theo faceWidth; đúng với contract hiện tại.",
    "Feature nền mày/mắt đang low_confidence — trong sản phẩm thật luật này luôn bị cổng chặn.",
    "Câu chép từ bản render 500px; các vế số anh em (五六/家無) là dị bản vần, không phải định lượng.",
  ],
  status: "active",
  schemaVersion: RULE_SCHEMA_VERSION,
};

/** Kho luật đang có: một luật nháp (chặn), một luật so sánh đã xác minh. */
export const PHYSIOGNOMY_RULES: readonly PhysiognomyRule[] = Object.freeze([
  THREE_COURTS_MIDDLE_001,
  BROW_LONGER_THAN_EYE_SIBLINGS_001,
]);

/**
 * Luật có đủ hình dạng để CHẠY không (chưa xét tới feature hay nguồn).
 *
 * Nhận HAI kiểu: luật ngưỡng (min/max + thresholdSource) và luật so sánh (comparisons).
 * Phải có ít nhất một điều kiện thuộc một trong hai kiểu, và mọi điều kiện có mặt phải đủ.
 */
export function isRunnable(rule: PhysiognomyRule): boolean {
  if (rule.status !== "active") return false;
  if (rule.sourceRefs.length === 0) return false;
  if (rule.interpretation.trim() === "") return false;

  const comparisons = rule.comparisons ?? [];
  if (rule.conditions.length === 0 && comparisons.length === 0) return false;

  const conditionsOk = rule.conditions.every(
    (c) => (c.min !== null || c.max !== null) && c.thresholdSource !== null,
  );
  const comparisonsOk = comparisons.every(
    (c) =>
      c.leftFeatureKey.trim() !== "" &&
      c.rightFeatureKey.trim() !== "" &&
      c.basisSource.trim() !== "",
  );
  return conditionsOk && comparisonsOk;
}
