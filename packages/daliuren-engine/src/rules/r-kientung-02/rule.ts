/**
 * RuleDefinition (data-only) cho R-KIENTUNG-02 — theo đúng paper contract Phase 11-B mục D1,
 * KHÔNG thêm/bớt gì. `condition` là TÀI LIỆU (prose) — logic thực thi thật nằm ở evaluator.ts.
 *
 * ruleId "R-KIENTUNG-02" (không phải "-01"): rule CHÍNH của kiện tụng (Mộ Thần, phụ thuộc 12
 * Trường Sinh) vẫn NGOÀI PHẠM VI — số thứ tự "02" dành riêng cho rule PHỤ này, tránh chiếm chỗ
 * "01" của rule chính khi nó được implement sau (đúng "quyết định đặt tên" đã chốt ở contract,
 * xem Signal Contract tổng hợp).
 *
 * layer="secondary": đây là 1 trong "HAI RULE PHỤ" (畢法賦 pháp 70) của kiện tụng — khác
 * hon-nhan/tim-do (mỗi rule LÀ rule chính của question_type tương ứng).
 */
import type { RuleDefinition } from "../../interpretation/rule.js";
import { KIENTUNG_02_PROVENANCE } from "./provenance.js";

export const R_KIENTUNG_02: RuleDefinition = {
  ruleId: "R-KIENTUNG-02",
  layer: "secondary",
  topic: "四課",
  description: "Khóa 3 và Khóa 4 thượng thần CÙNG khắc Can Ngày (Ngũ Hành) → kiện tụng/tai họa liên tiếp",
  condition:
    "So Ngũ Hành fourLessons.lesson3.upper và fourLessons.lesson4.upper với Ngũ Hành calendar." +
    "dayPillar.can (qua TrachNhat.getNguHanhQuanHe) — CHỈ tính quan hệ khắc THUẦN TUÝ (a-khac-b), " +
    "KHÔNG suy diễn thêm ý nghĩa 六親/官鬼 nào (xem ranh giới phạm vi ở provenance.ts). Trigger " +
    "CHỈ khi CẢ 2 khóa CÙNG khắc Can Ngày — 1/2 hoặc 0/2 đều KHÔNG signal (câu phú yêu cầu CẢ " +
    "3-4, không phải 1 trong 2).",
  provenanceId: KIENTUNG_02_PROVENANCE.id,
  confidence: "A",
  questionTypes: ["kien-tung"],
  dependencies: {
    calculationFields: ["fourLessons.lesson3", "fourLessons.lesson4", "calendar.dayPillar"],
  },
};
