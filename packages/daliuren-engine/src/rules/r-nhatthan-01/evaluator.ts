/**
 * Evaluator THẬT cho R-NHATTHAN-01 — hàm THUẦN, đúng chữ ký frozen
 * `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` (Model A, Phase 10.2/10.4
 * Section 3). CHỈ đọc field Calculation Layer đã khai báo ở `rule.ts` `dependencies` — KHÔNG
 * ChartInput/EngineMeta/QuestionType/methodSubcase, KHÔNG tính lại bất kỳ giá trị Calculation
 * nào, KHÔNG I/O, KHÔNG Date.now()/Math.random(), KHÔNG mutable module state.
 *
 * ⚠️ GIỚI HẠN KIẾN TRÚC ĐÃ BIẾT (ghi rõ, không giấu — xem Phase 10.6.3 report mục "Provenance"):
 * `resolveDayOrHourPillarProvenance` (Phase 10.6.1) cần `CalculationProfile` để tra
 * `ziHourDayBoundary` — nhưng chữ ký evaluate() CHỈ nhận `DaLiuRenCalculationResult`, vốn KHÔNG
 * mang theo profile đã dùng để tính ra nó. Evaluator này dùng `CLASSICAL_V1_PROFILE` — PROFILE
 * DUY NHẤT tồn tại ở Checkpoint 1 (xem profiles/classical-v1.ts) và CŨNG là default của chính
 * `calculateDaLiuRenChart()` — khớp precedent đã có, KHÔNG phải suy đoán tuỳ tiện. Đây là điểm
 * SẼ SAI nếu tương lai có ≥2 profile thật và evaluate() vẫn giữ nguyên chữ ký 1 tham số — ghi lại
 * làm remaining gap cho phase implement sau, KHÔNG tự ý mở rộng chữ ký evaluate() ở đây.
 */
import type { DaLiuRenCalculationResult } from "../../da-liu-ren-calculation-result.js";
import type { RuleEvaluator, RuleResult, EvaluatorRegistration } from "../../interpretation/rule.js";
import type { Signal, SignalPolarity, SignalRelation } from "../../interpretation/signal.js";
import { worstConfidence } from "../../interpretation/confidence.js";
import { resolveDayOrHourPillarProvenance } from "../../interpretation/calendar-dependency-provenance.js";
import { FOUR_LESSONS_PROVENANCE } from "../../four-lessons/provenance.js";
import { CLASSICAL_V1_PROFILE } from "../../profiles/classical-v1.js";
import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { Can, Chi } from "../../types/ganzhi.js";
import { R_NHATTHAN_01 } from "./rule.js";
import { NHATTHAN_01_PROVENANCE } from "./provenance.js";

/**
 * Tra Ngũ Hành của 1 Can/Chi qua bảng GỐC của `@thien-anh/calendar-core` (nguồn Can Chi DUY
 * NHẤT của dự án — không định nghĩa lại bảng). Non-null assertion an toàn vì `Can`/`Chi` là
 * union kiểu đóng, GIÁ TRỊ luôn nằm trong `Data.CAN`/`Data.CHI` — cùng mức an toàn với
 * `EARTH_PLATE[...]!` đã dùng ở twelve-generals/compute.ts, KHÔNG phải dữ liệu ngoài chưa kiểm.
 */
function nguHanhOfCan(can: Can): Data.NguHanh {
  return Data.CAN_NGU_HANH[Data.CAN.indexOf(can)]!;
}
function nguHanhOfChi(chi: Chi): Data.NguHanh {
  return Data.CHI_NGU_HANH[Data.CHI.indexOf(chi)]!;
}

interface AxisOutcome {
  relation: SignalRelation;
  subject: string;
  object: string;
  polarity: SignalPolarity;
  descriptionKey: string;
}

/**
 * 1 trục (Can HOẶC Chi): so Ngũ Hành `upperNguHanh` (thượng thần) với `dayNguHanh` (Can|Chi
 * Ngày) — ĐÚNG 4 vế đồng-trục của quote gốc (xem provenance.ts). `null` khi tương hoà (cùng
 * Ngũ Hành) — nguyên văn KHÔNG bàn trường hợp này, KHÔNG được tự suy ra 1 polarity nào.
 */
function computeAxisOutcome(
  upperNguHanh: Data.NguHanh,
  dayNguHanh: Data.NguHanh,
  upperLabel: string,
  dayLabel: string,
  axisKey: "can_axis" | "chi_axis",
): AxisOutcome | null {
  const quanHe = TrachNhat.getNguHanhQuanHe(upperNguHanh, dayNguHanh);
  switch (quanHe) {
    case "a-sinh-b": // thượng thần sinh Can|Chi Ngày → 日上生日: 百事吉
      return { relation: "sheng", subject: upperLabel, object: dayLabel, polarity: "auspicious", descriptionKey: `nhatthan.${axisKey}.upper_sheng_day` };
    case "b-sinh-a": // Can|Chi Ngày sinh thượng thần → 日生上神: 百費出
      return { relation: "sheng", subject: dayLabel, object: upperLabel, polarity: "inauspicious", descriptionKey: `nhatthan.${axisKey}.day_sheng_upper` };
    case "a-khac-b": // thượng thần khắc Can|Chi Ngày → 日上尅日: 百不利
      return { relation: "ke", subject: upperLabel, object: dayLabel, polarity: "inauspicious", descriptionKey: `nhatthan.${axisKey}.upper_ke_day` };
    case "b-khac-a": // Can|Chi Ngày khắc thượng thần → 日尅上神: 事抑塞
      return { relation: "ke", subject: dayLabel, object: upperLabel, polarity: "inauspicious", descriptionKey: `nhatthan.${axisKey}.day_ke_upper` };
    case "tuong-hoa": // cùng Ngũ Hành — KHÔNG có trong nguyên văn, KHÔNG tạo signal
      return null;
  }
}

export const evaluateNhatThan01: RuleEvaluator = (calculation: DaLiuRenCalculationResult): RuleResult => {
  const dayCanNguHanh = nguHanhOfCan(calculation.calendar.dayPillar.can);
  const dayChiNguHanh = nguHanhOfChi(calculation.calendar.dayPillar.chi);
  const lesson1UpperNguHanh = nguHanhOfChi(calculation.fourLessons.lesson1.upper);
  const lesson3UpperNguHanh = nguHanhOfChi(calculation.fourLessons.lesson3.upper);

  // Chỉ CẦN biết có đang ở vùng tranh chấp Tý hay không — calculation.calendar.hourPillar.chi
  // ĐÃ tính từ giờ dân sự gốc (ganzhi-adapter.ts KHÔNG dịch `hour`, chỉ dịch NGÀY), nên "Tý" ở
  // đây tương đương chính xác hour∈{23,0} — không cần ChartInput/EngineMeta. Giá trị cụ thể
  // 23 vs 12 chỉ là ĐẠI DIỆN cho việc CÓ/KHÔNG nằm trong vùng — resolver chỉ phân biệt 2 vùng đó
  // (xem calendar-dependency-provenance.ts `isWithinZiHourAmbiguityWindow`), không phân biệt
  // hour cụ thể bên trong từng vùng.
  const representativeHour = calculation.calendar.hourPillar.chi === "Tý" ? 23 : 12;
  const dayPillarProvenance = resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE);

  const calculationConfidence = worstConfidence(FOUR_LESSONS_PROVENANCE.confidence, dayPillarProvenance.confidence);
  const calculationProvenanceIds = [FOUR_LESSONS_PROVENANCE.id, ...dayPillarProvenance.provenanceIds];

  const axisOutcomes: ReadonlyArray<AxisOutcome | null> = [
    computeAxisOutcome(lesson1UpperNguHanh, dayCanNguHanh, "日上神", "日干", "can_axis"),
    computeAxisOutcome(lesson3UpperNguHanh, dayChiNguHanh, "辰上神", "日辰", "chi_axis"),
  ];

  const signals: Signal[] = [];
  axisOutcomes.forEach((outcome, axisIndex) => {
    if (!outcome) return;
    signals.push({
      signalId: `${R_NHATTHAN_01.ruleId}-${axisIndex}`,
      ruleId: R_NHATTHAN_01.ruleId,
      category: R_NHATTHAN_01.topic,
      subject: outcome.subject,
      object: outcome.object,
      relation: outcome.relation,
      polarity: outcome.polarity,
      descriptionKey: outcome.descriptionKey,
      triggered: true,
      layer: R_NHATTHAN_01.layer,
      ruleConfidence: R_NHATTHAN_01.confidence,
      calculationConfidence,
      provenanceId: NHATTHAN_01_PROVENANCE.id,
      calculationProvenanceIds,
    });
  });

  return {
    ruleId: R_NHATTHAN_01.ruleId,
    status: signals.length > 0 ? "triggered" : "not-triggered",
    inputs: {
      dayCan: calculation.calendar.dayPillar.can,
      dayChi: calculation.calendar.dayPillar.chi,
      lesson1Upper: calculation.fourLessons.lesson1.upper,
      lesson3Upper: calculation.fourLessons.lesson3.upper,
    },
    signals,
    provenanceId: NHATTHAN_01_PROVENANCE.id,
    ruleConfidence: R_NHATTHAN_01.confidence,
    calculationConfidence,
  };
};

/** Đăng ký evaluator thật cho R-NHATTHAN-01 — dùng bởi Evaluator Registry sản xuất (registry.ts). */
export const R_NHATTHAN_01_EVALUATOR_REGISTRATION: EvaluatorRegistration = {
  ruleId: R_NHATTHAN_01.ruleId,
  evaluate: evaluateNhatThan01,
};
