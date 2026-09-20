/**
 * Evaluator THẬT cho R-HONNHAN-01 — hàm THUẦN, đúng chữ ký frozen
 * `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` (Model A). CHỈ đọc field
 * Calculation Layer đã khai báo ở `rule.ts` `dependencies` — KHÔNG ChartInput/EngineMeta/
 * QuestionType, KHÔNG tính lại bất kỳ giá trị Calculation nào, KHÔNG I/O, KHÔNG
 * Date.now()/Math.random(), KHÔNG mutable module state. Kiến trúc/quy ước tên hàm/biến khớp
 * đúng `r-nhatthan-01/evaluator.ts` (rule đầu tiên, đã production-verified) để dễ audit chéo.
 *
 * SỬA Phase 11-B Correction Plan (P1 + P2-1, xem
 * docs/daliuren/DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md mục 7.1): rule này đọc
 * `calendar.dayPillar.{can,chi}` như GIÁ TRỊ THẬT (không chỉ tra bảng tĩnh) nên PHẢI gộp
 * `resolveDayOrHourPillarProvenance` vào `calculationConfidence` — ĐÚNG cơ chế
 * `r-nhatthan-01/evaluator.ts` đã dùng cho CHÍNH dependency này, KHÔNG tạo mechanism mới. ĐỒNG
 * THỜI gỡ `FOUR_LESSONS_PROVENANCE` (rule này KHÔNG BAO GIỜ đọc `calculation.fourLessons` —
 * `JI_GONG_TABLE` là hằng số tĩnh tự mang trích dẫn cổ điển riêng, xem `four-lessons/table.ts`,
 * cùng mức với `EARTH_PLATE` — không rule nào khác trong repo tự tạo provenance riêng khi dùng
 * hằng số tĩnh loại này).
 */
import type { DaLiuRenCalculationResult } from "../../da-liu-ren-calculation-result.js";
import type { RuleEvaluator, RuleResult, EvaluatorRegistration } from "../../interpretation/rule.js";
import type { Signal, SignalPolarity } from "../../interpretation/signal.js";
import type { TwelveGeneralName } from "../../types/twelve-generals.js";
import { worstConfidence } from "../../interpretation/confidence.js";
import { resolveDayOrHourPillarProvenance } from "../../interpretation/calendar-dependency-provenance.js";
import { JI_GONG_TABLE } from "../../four-lessons/table.js";
import { CLASSICAL_V1_PROFILE } from "../../profiles/classical-v1.js";
import {
  TWELVE_GENERALS_ORDER_PROVENANCE,
  TWELVE_GENERALS_ANCHOR_PROVENANCE,
  TWELVE_GENERALS_DIRECTION_PROVENANCE,
} from "../../twelve-generals/provenance.js";
import { R_HONNHAN_01 } from "./rule.js";
import { HONNHAN_01_PROVENANCE } from "./provenance.js";

/** Nhãn Hán tự hiển thị cho 2 tướng liên quan — CHỈ 2 tướng cần cho rule này, KHÔNG dựng bảng đủ 12 tướng (ngoài phạm vi). */
const GENERAL_LABEL: Readonly<Record<"tianHou" | "liuHe", string>> = { tianHou: "天后", liuHe: "六合" };

interface AxisOutcome {
  subject: string;
  object: string;
  polarity: SignalPolarity;
  descriptionKey: string;
}

/**
 * 1 trục (Can HOẶC Chi): tướng đóng tại vị trí Địa Bàn `zhiPosition` có phải Thiên Hậu/Lục Hợp
 * không. `null` khi KHÔNG phải (câu phú không nêu ý nghĩa ngược, KHÔNG được tự suy ra polarity).
 */
function computeAxisOutcome(general: TwelveGeneralName, subjectLabel: string, axisKey: "can_axis" | "chi_axis"): AxisOutcome | null {
  if (general !== "tianHou" && general !== "liuHe") return null;
  return {
    subject: subjectLabel,
    object: GENERAL_LABEL[general],
    polarity: "auspicious",
    descriptionKey: `honnhan.${axisKey}.${general}`,
  };
}

export const evaluateHonNhan01: RuleEvaluator = (calculation: DaLiuRenCalculationResult): RuleResult => {
  const canPosition = JI_GONG_TABLE[calculation.calendar.dayPillar.can];
  const chiPosition = calculation.calendar.dayPillar.chi;

  // Non-null assertion an toàn: `twelveGenerals` LUÔN có đúng 12 phần tử, mỗi Địa Chi 1 tướng
  // (type 12-tuple, xem types/twelve-generals.ts) — cùng mức an toàn đã dùng ở nơi khác trong
  // package này (vd `EARTH_PLATE[...]!`).
  const canGeneral = calculation.twelveGenerals.find((p) => p.zhi === canPosition)!.general;
  const chiGeneral = calculation.twelveGenerals.find((p) => p.zhi === chiPosition)!.general;

  // Rule đọc `calendar.dayPillar.{can,chi}` như GIÁ TRỊ THẬT → PHẢI kế thừa độ bất định của phép
  // DỰNG dayPillar (GanZhi construction, B) + vùng Zi-hour tranh chấp (D nếu rơi vào đó) — ĐÚNG
  // cơ chế `r-nhatthan-01/evaluator.ts` đã dùng, KHÔNG PHẢI mechanism mới (Correction Plan mục
  // 7.1). `representativeHour` chỉ là ĐẠI DIỆN cho việc CÓ/KHÔNG nằm trong vùng tranh chấp — 23
  // vs 12 không mang ý nghĩa gì khác ngoài "trong vùng" / "ngoài vùng" (giống hệt comment gốc ở
  // r-nhatthan-01/evaluator.ts).
  const representativeHour = calculation.calendar.hourPillar.chi === "Tý" ? 23 : 12;
  const dayPillarProvenance = resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE);

  const calculationConfidence = worstConfidence(
    worstConfidence(dayPillarProvenance.confidence, TWELVE_GENERALS_ORDER_PROVENANCE.confidence),
    worstConfidence(TWELVE_GENERALS_ANCHOR_PROVENANCE.confidence, TWELVE_GENERALS_DIRECTION_PROVENANCE.confidence),
  );
  const calculationProvenanceIds = [
    ...dayPillarProvenance.provenanceIds,
    TWELVE_GENERALS_ORDER_PROVENANCE.id,
    TWELVE_GENERALS_ANCHOR_PROVENANCE.id,
    TWELVE_GENERALS_DIRECTION_PROVENANCE.id,
  ];

  const axisOutcomes: ReadonlyArray<AxisOutcome | null> = [
    computeAxisOutcome(canGeneral, "日干", "can_axis"),
    computeAxisOutcome(chiGeneral, "日辰", "chi_axis"),
  ];

  const signals: Signal[] = [];
  axisOutcomes.forEach((outcome, axisIndex) => {
    if (!outcome) return;
    signals.push({
      signalId: `${R_HONNHAN_01.ruleId}-${axisIndex}`,
      ruleId: R_HONNHAN_01.ruleId,
      category: R_HONNHAN_01.topic,
      subject: outcome.subject,
      object: outcome.object,
      relation: "presence",
      polarity: outcome.polarity,
      descriptionKey: outcome.descriptionKey,
      triggered: true,
      layer: R_HONNHAN_01.layer,
      ruleConfidence: R_HONNHAN_01.confidence,
      calculationConfidence,
      provenanceId: HONNHAN_01_PROVENANCE.id,
      calculationProvenanceIds,
    });
  });

  return {
    ruleId: R_HONNHAN_01.ruleId,
    status: signals.length > 0 ? "triggered" : "not-triggered",
    inputs: {
      dayCan: calculation.calendar.dayPillar.can,
      dayChi: calculation.calendar.dayPillar.chi,
      canGeneral,
      chiGeneral,
    },
    signals,
    provenanceId: HONNHAN_01_PROVENANCE.id,
    ruleConfidence: R_HONNHAN_01.confidence,
    calculationConfidence,
  };
};

/** Đăng ký evaluator thật cho R-HONNHAN-01 — dùng bởi Evaluator Registry sản xuất (registry.ts). */
export const R_HONNHAN_01_EVALUATOR_REGISTRATION: EvaluatorRegistration = {
  ruleId: R_HONNHAN_01.ruleId,
  evaluate: evaluateHonNhan01,
};
