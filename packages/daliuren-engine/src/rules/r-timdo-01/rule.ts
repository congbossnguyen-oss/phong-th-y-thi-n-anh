/**
 * RuleDefinition (data-only) cho R-TIMDO-01 — theo đúng paper contract Phase 11-B mục C, KHÔNG
 * thêm/bớt gì. `condition` là TÀI LIỆU (prose) — logic thực thi thật nằm ở evaluator.ts.
 *
 * layer="core": đây LÀ rule CHÍNH của tim-do (task Phase 11-B gọi thẳng "TIM-DO MAIN RULE"),
 * khác kien-tung D1 (layer "secondary", rule PHỤ của 1 rule chính khác chưa build).
 *
 * topic="三傳": điều kiện GATE đầu tiên là Khóa Thể (九宗門 method đã chọn Sơ truyền) — khớp field
 * đầu tiên trong field-path contract, cùng nhóm hiển thị với `threeTransmissions`/`nine-methods`.
 */
import type { RuleDefinition } from "../../interpretation/rule.js";
import { TIMDO_01_PROVENANCE } from "./provenance.js";

export const R_TIMDO_01: RuleDefinition = {
  ruleId: "R-TIMDO-01",
  layer: "core",
  topic: "三傳",
  description: "Khóa Thể Diêu Khắc/Mão Tinh (遙克/昴星) + Huyền Vũ đóng tại Sơ truyền → xác nhận mất đồ/trộm",
  condition:
    "So threeTransmissions.method với {'yaoke','maoxing'} — nếu khớp, tra tướng Thập Nhị Thiên " +
    "Tướng tại vị trí Địa Bàn của threeTransmissions.initial (Sơ truyền); nếu tướng đó là Huyền " +
    "Vũ (xuanWu) → 1 signal inauspicious. KHÔNG implement 太陽照武 (rule phụ, ngoài phạm vi).",
  provenanceId: TIMDO_01_PROVENANCE.id,
  confidence: "A",
  questionTypes: ["tim-do"],
  dependencies: {
    calculationFields: ["threeTransmissions", "twelveGenerals"],
  },
};
