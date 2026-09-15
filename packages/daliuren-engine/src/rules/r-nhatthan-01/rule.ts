/**
 * RuleDefinition (data-only) cho R-NHATTHAN-01 — theo đúng paper contract Phase 10.4 Section
 * 10, KHÔNG thêm/bớt gì. `condition` là TÀI LIỆU (prose) — logic thực thi thật nằm ở
 * evaluator.ts, đăng ký riêng qua Evaluator Registry (Phase 10.6.2).
 */
import type { RuleDefinition } from "../../interpretation/rule.js";
import { NHATTHAN_01_PROVENANCE } from "./provenance.js";

export const R_NHATTHAN_01: RuleDefinition = {
  ruleId: "R-NHATTHAN-01",
  layer: "core",
  topic: "四課",
  description: "Quan hệ sinh/khắc giữa Can/Chi Ngày và thần đóng trên chúng (Khóa 1 & Khóa 3 thượng thần)",
  condition:
    "So sánh Ngũ Hành fourLessons.lesson1.upper với calendar.dayPillar.can (trục Can), và " +
    "fourLessons.lesson3.upper với calendar.dayPillar.chi (trục Chi) — MỖI TRỤC ĐỘC LẬP, xét cả " +
    "2 chiều sinh/khắc (thượng thần sinh/khắc Can|Chi Ngày, và Can|Chi Ngày sinh/khắc ngược lại " +
    "thượng thần). KHÔNG xét quan hệ hợp-trục hay chéo-trục (xem provenance.ts).",
  provenanceId: NHATTHAN_01_PROVENANCE.id,
  confidence: "A",
  // questionTypes CỐ Ý vắng mặt — rule "core"/universal, áp dụng mọi question_type hợp lệ
  // (Phase 10.3 Section 10: "layer: core... applying regardless of question type", khớp
  // precedent R-SANCHUAN-KE-NHAT trong tests/unit/fixtures.ts). KHÔNG có bằng chứng nào trong
  // repo giới hạn rule này cho 1 nhóm question_type cụ thể — thêm giới hạn sẽ là TỰ suy diễn.
  dependencies: {
    calculationFields: ["fourLessons.lesson1", "fourLessons.lesson3", "calendar.dayPillar"],
  },
};
