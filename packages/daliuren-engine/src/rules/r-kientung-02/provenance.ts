/**
 * Provenance CỔ ĐIỂN cho R-KIENTUNG-02 — 畢法賦 pháp 70「鬼临三四讼灾随」, 卷九. Đã audit trực
 * tiếp ở docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md mục D1 —
 * entry này CHỈ hiện thực hoá NGUYÊN VĂN/gloss đã có sẵn, KHÔNG thêm bằng chứng mới.
 *
 * ⚠️ RANH GIỚI PHẠM VI BẮT BUỘC (Phase 11-B contract mục D1 "Ranh giới phạm vi"): chữ "鬼" ở đây
 * PHẢI hiểu THUẦN TUÝ là "phần tử Ngũ Hành khắc Can Ngày" — 1 quan hệ Ngũ-Hành nhị nguyên đơn
 * giản, y hệt cách R-NHATTHAN-01 tính quan hệ sinh/khắc (qua TrachNhat.getNguHanhQuanHe).
 * `report-4-lucthan-dungthan.md` (nguồn loại bỏ khung 六親) CHỈ đọc 卷一/卷四 — CHƯA từng đối
 * chiếu trực tiếp cách 畢法賦 (卷九-十) tự dùng chữ "鬼" — nên evaluator này TUYỆT ĐỐI KHÔNG được
 * gán thêm bất kỳ ý nghĩa "quan hệ gia đình/lục thân" nào cho "鬼" (vd KHÔNG diễn giải thành
 * "quan chức/kẻ thù/người hại" theo khung 官鬼 đầy đủ của Lục Hào).
 *
 * layer="secondary" (xem rule.ts) vì đây là 1 trong "HAI RULE PHỤ" của kiện tụng — rule CHÍNH
 * (Mộ Thần, 12 Trường Sinh) vẫn NGOÀI PHẠM VI (chưa implement).
 */
import type { ProvenanceEntry } from "../../interpretation/provenance.js";

export const KIENTUNG_02_PROVENANCE: ProvenanceEntry = {
  id: "PROV-KIENTUNG-02",
  ruleId: "R-KIENTUNG-02",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷九, 畢法賦 pháp 70「鬼临三四讼灾随」",
  sourceType: "classical-fact",
  quote: "鬼临三四讼灾随",
  confidence: "A",
  notes:
    "Dịch theo gloss đã ghi (report-7-question-types.md): 'Quỷ lâm khóa 3-4, tụng/tai theo sau' " +
    "— Quỷ (鬼, phần tử khắc Can Ngày về Ngũ Hành) chiếm CẢ Khóa 3 lẫn Khóa 4 → kiện tụng/tai họa " +
    "liên tiếp. Evaluator R-KIENTUNG-02 CHỈ implement điều kiện Ngũ-Hành-khắc-Can THUẦN TUÝ (xem " +
    "ranh giới phạm vi ở trên) — KHÔNG mở rộng '鬼' sang bất kỳ khung 六親/官鬼 nào khác. Phạm vi " +
    "hẹp hơn CHÍNH VĂN đầy đủ, ghi rõ ở đây để không ai lầm tưởng entry này bao phủ toàn bộ đoạn " +
    "trích hoặc toàn bộ khái niệm 鬼 trong Lục Nhâm cổ điển.",
};
