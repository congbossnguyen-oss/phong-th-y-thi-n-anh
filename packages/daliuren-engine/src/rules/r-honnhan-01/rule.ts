/**
 * RuleDefinition (data-only) cho R-HONNHAN-01 — theo đúng paper contract Phase 11-B mục B,
 * KHÔNG thêm/bớt gì. `condition` là TÀI LIỆU (prose) — logic thực thi thật nằm ở evaluator.ts.
 *
 * layer="core": đây LÀ rule chính cho hôn nhân (畢法賦 tự nói "phàm xem hôn nhân đều xem ở đây"
 * — không có rule nào khác đứng trước nó trong phạm vi đã audit), khác kien-tung D1 (layer
 * "secondary", vốn là rule PHỤ của 1 rule chính khác chưa build).
 *
 * topic="十二天將": điều kiện kích hoạt DUY NHẤT của rule này là vị trí Thập Nhị Thiên Tướng tại
 * Can/Chi Ngày — không đọc trực tiếp fourLessons (JI_GONG_TABLE chỉ dùng để tra VỊ TRÍ, không
 * đọc giá trị Khóa nào).
 */
import type { RuleDefinition } from "../../interpretation/rule.js";
import { HONNHAN_01_PROVENANCE } from "./provenance.js";

export const R_HONNHAN_01: RuleDefinition = {
  ruleId: "R-HONNHAN-01",
  layer: "core",
  topic: "十二天將",
  description: "Thiên Hậu/Lục Hợp cưỡi thượng thần tại vị trí Can Ngày hoặc Chi Ngày → dấu hiệu hôn thành",
  condition:
    "Tra vị trí Thập Nhị Thiên Tướng tại vị trí Địa Bàn của Can Ngày (qua JI_GONG_TABLE) và tại " +
    "vị trí Chi Ngày (chính nó). Mỗi vị trí ĐỘC LẬP: nếu tướng đóng ở đó là Thiên Hậu (tianHou) " +
    "hoặc Lục Hợp (liuHe) → 1 signal auspicious cho vị trí đó. KHÔNG xét ý nghĩa 'tình riêng' " +
    "(應私情) — chỉ dùng điều kiện kích hoạt thuần tuý (xem provenance.ts).",
  provenanceId: HONNHAN_01_PROVENANCE.id,
  confidence: "A",
  questionTypes: ["hon-nhan"],
  dependencies: {
    calculationFields: ["calendar.dayPillar", "twelveGenerals"],
  },
};
