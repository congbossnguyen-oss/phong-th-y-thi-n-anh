/**
 * Evaluator THẬT cho R-KIENTUNG-02 — hàm THUẦN, đúng chữ ký frozen
 * `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` (Model A). CHỈ đọc field
 * Calculation Layer đã khai báo ở `rule.ts` `dependencies` — KHÔNG ChartInput/EngineMeta/
 * QuestionType, KHÔNG tính lại bất kỳ giá trị Calculation nào, KHÔNG I/O.
 *
 * `nguHanhOfCan`/`nguHanhOfChi`/quan hệ khắc — TÁI DÙNG y hệt tiện ích đã chứng minh hoạt động
 * ở r-nhatthan-01/evaluator.ts (Data.CAN_NGU_HANH/Data.CHI_NGU_HANH + TrachNhat.getNguHanhQuanHe)
 * — KHÔNG viết lại bảng Ngũ Hành riêng, KHÔNG dùng nguồn thứ 2.
 *
 * SỬA Phase 11-B Correction Plan (P1, xem docs/daliuren/DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md
 * mục 7.2): rule này đọc `calendar.dayPillar.can` như GIÁ TRỊ THẬT (để tra Ngũ Hành Can Ngày) nên
 * PHẢI gộp `resolveDayOrHourPillarProvenance` vào `calculationConfidence`, giống hệt cơ chế
 * `r-nhatthan-01/evaluator.ts` — "không đọc `calendar.hourPillar` trực tiếp" KHÔNG miễn trừ
 * dependency này, vì độ bất định nằm ở phép DỰNG `dayPillar`, không nằm ở việc đọc `hourPillar`.
 * `FOUR_LESSONS_PROVENANCE` VẪN GIỮ NGUYÊN (fourLessons.lesson3/.lesson4 vẫn thực sự được đọc).
 */
import type { DaLiuRenCalculationResult } from "../../da-liu-ren-calculation-result.js";
import type { RuleEvaluator, RuleResult, EvaluatorRegistration } from "../../interpretation/rule.js";
import type { Signal } from "../../interpretation/signal.js";
import { worstConfidence } from "../../interpretation/confidence.js";
import { resolveDayOrHourPillarProvenance } from "../../interpretation/calendar-dependency-provenance.js";
import { FOUR_LESSONS_PROVENANCE } from "../../four-lessons/provenance.js";
import { CLASSICAL_V1_PROFILE } from "../../profiles/classical-v1.js";
import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { Can, Chi } from "../../types/ganzhi.js";
import { R_KIENTUNG_02 } from "./rule.js";
import { KIENTUNG_02_PROVENANCE } from "./provenance.js";

function nguHanhOfCan(can: Can): Data.NguHanh {
  return Data.CAN_NGU_HANH[Data.CAN.indexOf(can)]!;
}
function nguHanhOfChi(chi: Chi): Data.NguHanh {
  return Data.CHI_NGU_HANH[Data.CHI.indexOf(chi)]!;
}

export const evaluateKienTung02: RuleEvaluator = (calculation: DaLiuRenCalculationResult): RuleResult => {
  const canNguHanh = nguHanhOfCan(calculation.calendar.dayPillar.can);
  const lesson3NguHanh = nguHanhOfChi(calculation.fourLessons.lesson3.upper);
  const lesson4NguHanh = nguHanhOfChi(calculation.fourLessons.lesson4.upper);

  // "鬼" = phần tử khắc Can Ngày về Ngũ Hành, THUẦN TUÝ (xem ranh giới phạm vi ở provenance.ts).
  const lesson3IsGhost = TrachNhat.getNguHanhQuanHe(lesson3NguHanh, canNguHanh) === "a-khac-b";
  const lesson4IsGhost = TrachNhat.getNguHanhQuanHe(lesson4NguHanh, canNguHanh) === "a-khac-b";

  // Rule đọc CẢ fourLessons (lesson3/lesson4) LẪN calendar.dayPillar.can (giá trị thật, để tra
  // Ngũ Hành) → calculationConfidence = worst-of(FOUR_LESSONS_PROVENANCE, dayPillarProvenance) —
  // ĐÚNG cơ chế r-nhatthan-01/evaluator.ts, KHÔNG hard-code (Correction Plan mục 7.2).
  const representativeHour = calculation.calendar.hourPillar.chi === "Tý" ? 23 : 12;
  const dayPillarProvenance = resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE);

  const calculationConfidence = worstConfidence(FOUR_LESSONS_PROVENANCE.confidence, dayPillarProvenance.confidence);
  const calculationProvenanceIds = [FOUR_LESSONS_PROVENANCE.id, ...dayPillarProvenance.provenanceIds];

  const signals: Signal[] = [];
  if (lesson3IsGhost && lesson4IsGhost) {
    signals.push({
      signalId: `${R_KIENTUNG_02.ruleId}-0`,
      ruleId: R_KIENTUNG_02.ruleId,
      category: R_KIENTUNG_02.topic,
      subject: "三四課",
      object: "日干",
      relation: "ke",
      polarity: "inauspicious",
      descriptionKey: "kientung.lesson34_ke_can",
      triggered: true,
      layer: R_KIENTUNG_02.layer,
      ruleConfidence: R_KIENTUNG_02.confidence,
      calculationConfidence,
      provenanceId: KIENTUNG_02_PROVENANCE.id,
      calculationProvenanceIds,
    });
  }

  return {
    ruleId: R_KIENTUNG_02.ruleId,
    status: signals.length > 0 ? "triggered" : "not-triggered",
    inputs: {
      dayCan: calculation.calendar.dayPillar.can,
      lesson3Upper: calculation.fourLessons.lesson3.upper,
      lesson4Upper: calculation.fourLessons.lesson4.upper,
      lesson3IsGhost,
      lesson4IsGhost,
    },
    signals,
    provenanceId: KIENTUNG_02_PROVENANCE.id,
    ruleConfidence: R_KIENTUNG_02.confidence,
    calculationConfidence,
  };
};

/** Đăng ký evaluator thật cho R-KIENTUNG-02 — dùng bởi Evaluator Registry sản xuất (registry.ts). */
export const R_KIENTUNG_02_EVALUATOR_REGISTRATION: EvaluatorRegistration = {
  ruleId: R_KIENTUNG_02.ruleId,
  evaluate: evaluateKienTung02,
};
