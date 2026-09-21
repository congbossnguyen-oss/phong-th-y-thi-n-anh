/**
 * @thien-anh/daliuren-engine — CHECKPOINT 1 (Domain Contracts) + PHASE 5B-1 (Calendar
 * Foundation) + PHASE 5B-2 (Month General 月將) + PHASE 5B-3 (Day/Night 晝夜 + Noble Spirit
 * 貴人) + PHASE 8 (CONG TAIYI v0.1 MVP facade) + PHASE 9A (Heaven/Earth Plate 天地盤 + Four
 * Lessons 四課).
 *
 * Package này export: (a) domain contracts cho lá số (types/), (b) mô hình luận giải
 * Provenance/Rule/Signal/Conflict/InterpretationPackage (interpretation/), (c) CalculationProfile
 * + profile 'classical-v1' (profiles/), (d) validator/test-harness (validation/), (e) Calendar
 * Foundation — chuẩn hóa input, adapter GanZhi (→ calendar-core), Solar Terms, `CalendarData`
 * (calendar/, Phase 5B-1), (f) Month General — `computeMonthGeneral(calendarData)` tra bảng 12
 * trung khí → Nguyệt Tướng (month-general/, Phase 5B-2), (g) Day/Night —
 * `computeDayNight(calendarData)` theo CHI giờ chiêm, ranh giới Mão-Dậu (day-night/, Phase
 * 5B-3), (h) Noble Spirit — `computeGuiRenPair`/`resolveGuiRenForDayNight`/`computeNobleSpirit`
 * tra Quý Nhân theo Can Ngày + 晝/夜 (noble-spirit/, Phase 5B-3, ⚠️ xem OPEN ISSUE về chiều
 * ngày/đêm gán cho từng Can — confidence B chỉ cho Giáp, D cho 9 Can còn lại), (i)
 * `calculateCalendarFoundation()` — facade `EngineResult` nối (e)-(h) thành 1 lần gọi, đúng
 * convention `@thien-anh/engine-contract` (Phase 8, xem `calendar-foundation-result.ts`), (j)
 * Heaven/Earth Plate — `computeHeavenEarthPlate(monthGeneral, calendarData)` dựng Thiên
 * Bàn/Địa Bàn + `heavenPlateAt()` (phép tra chính) (heaven-earth-plate/, Phase 9A), (k) Four
 * Lessons — `computeFourLessons(calendarData, heavenEarthPlate)` dựng 4 Khóa theo thứ tự
 * chuẩn hoá 1→2→3→4 (four-lessons/, Phase 9A). (j)/(k) CHƯA được nối vào
 * `calculateCalendarFoundation()` — xem CalendarFoundationResult, KHÔNG mở rộng type đó tuỳ
 * tiện, facade riêng (nếu cần) sẽ quyết định ở phase sau.
 *
 * KHÔNG có hàm `calculate()` LÁ SỐ ĐẦY ĐỦ nào ở đây — `calculateCalendarFoundation()` CHỈ trả
 * phần Lịch pháp + Nguyệt Tướng + Ngày/Đêm + Quý Nhân, CHƯA lập được `Chart` hoàn chỉnh: Tam
 * Truyền/Thập Nhị Thiên Tướng/Khóa Thể/Không Vong/Bản Mệnh/Hành Niên đều CHƯA implement — xem
 * docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md mục 14-15 và
 * docs/daliuren/DA_LIU_REN_UNIQUE_VALUE_RESEARCH.md (quyết định B — specialized module, không
 * vội mở rộng). Đừng nhầm "có facade EngineResult" với "engine có thể tính toán lá số đầy đủ".
 */
export * from "./engine-metadata.js";
export * from "./types/index.js";
export * from "./interpretation/index.js";
export * from "./profiles/index.js";
export * from "./validation/index.js";
export * from "./calendar/index.js";
export * from "./month-general/index.js";
export * from "./day-night/index.js";
export * from "./noble-spirit/index.js";
export * from "./heaven-earth-plate/index.js";
export * from "./four-lessons/index.js";
export * from "./yi-ma/index.js";
export * from "./nine-methods/index.js";
export * from "./three-transmissions/index.js";
export * from "./twelve-generals/index.js";
export * from "./calendar-foundation-result.js";
export * from "./da-liu-ren-calculation-result.js";
export * from "./ke-type/index.js";
export * from "./da-liu-ren-chart-with-ke-type.js";
export * from "./wang-shuai/index.js";
export * from "./void-branches/index.js";
export * from "./shen-sha/index.js";
export * from "./rules/index.js";
export * from "./interpretation-package-builder.js";

import { fail, ok } from "@thien-anh/engine-contract";
import type { EngineError, EngineMeta, EngineResult } from "@thien-anh/engine-contract";
import { ENGINE_NAME, ENGINE_VERSION } from "./engine-metadata.js";
import type { ChartInput } from "./types/chart.js";
import type { CalculationProfile } from "./profiles/types.js";
import { CLASSICAL_V1_PROFILE } from "./profiles/classical-v1.js";
import { computeCalendarData } from "./calendar/foundation.js";
import { CalendarFoundationError } from "./calendar/errors.js";
import { computeMonthGeneral } from "./month-general/compute.js";
import { MonthGeneralError } from "./month-general/errors.js";
import { computeDayNight } from "./day-night/compute.js";
import { DayNightError } from "./day-night/errors.js";
import { computeNobleSpirit } from "./noble-spirit/compute.js";
import { NobleSpiritError } from "./noble-spirit/errors.js";
import type { CalendarFoundationResult } from "./calendar-foundation-result.js";
import { computeHeavenEarthPlate } from "./heaven-earth-plate/compute.js";
import { HeavenEarthPlateError } from "./heaven-earth-plate/errors.js";
import { computeFourLessons } from "./four-lessons/compute.js";
import { FourLessonsError } from "./four-lessons/errors.js";
import { computeThreeTransmissions } from "./three-transmissions/compute.js";
import { NineMethodsError } from "./nine-methods/errors.js";
import { YiMaError } from "./yi-ma/errors.js";
import { computeTwelveGenerals } from "./twelve-generals/compute.js";
import { TwelveGeneralsError } from "./twelve-generals/errors.js";
import type { DaLiuRenCalculationResult } from "./da-liu-ren-calculation-result.js";
import { computeKeType } from "./ke-type/compute.js";
import type { DaLiuRenChartWithKeType } from "./da-liu-ren-chart-with-ke-type.js";

/** Version của `@thien-anh/calendar-core` đã dùng để tính — cùng quy ước hardcode literal như `trachnhat-engine` (xem `packages/trachnhat-engine/src/index.ts`), KHÔNG đọc động từ package.json. */
const CORE_CALENDAR_VERSION = "0.1.0";

function buildMeta(): EngineMeta {
  return {
    engine: ENGINE_NAME,
    engineVersion: ENGINE_VERSION,
    coreCalendarVersion: CORE_CALENDAR_VERSION,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Gộp lỗi từ các module con (mỗi module tự định nghĩa `code` riêng, xem `calendar/errors.ts`,
 * `month-general/errors.ts`, `day-night/errors.ts`, `noble-spirit/errors.ts`,
 * `heaven-earth-plate/errors.ts`, `four-lessons/errors.ts`, `nine-methods/errors.ts`,
 * `yi-ma/errors.ts`, `twelve-generals/errors.ts`) thành 1 `EngineError` đúng contract chung.
 * MỖI lớp lỗi trong repo đều CÙNG 1 shape (`{code, message}`, xem constructor từng class) nên
 * việc mở rộng danh sách `instanceof` (Phase 9E, thêm 5 lớp mới) là CƠ HỌC đúng nghĩa — không
 * cần đổi cơ chế. KHÔNG nuốt lỗi lạ — nếu gặp lỗi KHÔNG PHẢI 1 trong các lớp đã biết (bug thật,
 * không phải input xấu), vẫn trả về qua `EngineError` với code riêng để phân biệt, KHÔNG throw
 * (đúng convention `EngineResult`), KHÔNG giả vờ đó là lỗi input. Đặc biệt giữ NGUYÊN semantics
 * của `NineMethodsError` (vd `INSUFFICIENT_EVIDENCE_FUYIN_SELECTION`) — KHÔNG downgrade thành
 * lỗi chung, KHÔNG thay message.
 */
function toEngineError(error: unknown): EngineError {
  if (
    error instanceof CalendarFoundationError ||
    error instanceof MonthGeneralError ||
    error instanceof DayNightError ||
    error instanceof NobleSpiritError ||
    error instanceof HeavenEarthPlateError ||
    error instanceof FourLessonsError ||
    error instanceof NineMethodsError ||
    error instanceof YiMaError ||
    error instanceof TwelveGeneralsError
  ) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "UNEXPECTED_ERROR",
    message: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Facade tối thiểu CONG TAIYI v0.1 (Phase 8B) — nối 4 phép tính ĐÃ VERIFIED (Calendar
 * Foundation, Month General, Day/Night, Noble Spirit) thành 1 `EngineResult` duy nhất, đúng
 * convention `@thien-anh/engine-contract` mà các package khác trong monorepo đã dùng (vd
 * `trachnhat-engine`).
 *
 * KHÔNG PHẢI `calculate()` lá số đầy đủ — CHƯA có 四課/三傳/九宗門/十二天將/課體 (xem comment đầu
 * file + `calendar-foundation-result.ts`). KHÔNG throw cho input không hợp lệ (thiếu timeZone,
 * ngày ảo, profile không hỗ trợ...) — mọi lỗi trả về qua `EngineResult.errors`, KHÔNG silent
 * fallback sang giá trị mặc định nào.
 */
export function calculateCalendarFoundation(
  input: ChartInput,
  profile: CalculationProfile = CLASSICAL_V1_PROFILE,
): EngineResult<CalendarFoundationResult> {
  const meta = buildMeta();

  try {
    const calendar = computeCalendarData(input, profile);
    const monthGeneral = computeMonthGeneral(calendar);
    const dayNight = computeDayNight(calendar);
    const nobleSpirit = computeNobleSpirit(calendar.dayPillar.can, dayNight.dayNight.value, profile);

    return ok<CalendarFoundationResult>(
      {
        calendar,
        monthGeneral: monthGeneral.monthGeneral,
        dayNight: dayNight.dayNight,
        nobleSpirit: nobleSpirit.nobleSpirit,
        provenance: {
          monthGeneralProvenanceId: monthGeneral.provenanceId,
          dayNightProvenanceId: dayNight.provenanceId,
          nobleSpiritPairProvenanceId: nobleSpirit.pairProvenanceId,
          nobleSpiritDayNightAssignmentProvenanceId: nobleSpirit.dayNightAssignmentProvenanceId,
        },
      },
      meta,
    );
  } catch (error) {
    return fail([toEngineError(error)], meta);
  }
}

/**
 * Facade Phase 11-A1 — `calculateDaLiuRenChart()` + 課體 (`keType`). KHÔNG sửa
 * `calculateDaLiuRenChart()` (đã đông băng cho Phase 11-B) — chỉ GỌI nó rồi bổ sung field
 * ADDITIVE, đúng khuyến nghị Phase 11-A Pre-Implementation Audit mục "Schema/API Impact".
 * `keType.primary.method` là ĐỒNG NHẤT (identity) với `threeTransmissions.method` — không tính
 * lại, không suy luận gì mới (xem `ke-type/compute.ts`).
 */
export function calculateDaLiuRenChartWithKeType(
  input: ChartInput,
  profile: CalculationProfile = CLASSICAL_V1_PROFILE,
): EngineResult<DaLiuRenChartWithKeType> {
  const base = calculateDaLiuRenChart(input, profile);
  if (!base.ok || !base.data) {
    return fail(base.errors ?? [], base.meta);
  }

  const { keType, provenanceId } = computeKeType(base.data.threeTransmissions.method, base.data.provenance.threeTransmissionsInitialProvenanceId);

  return ok<DaLiuRenChartWithKeType>(
    {
      ...base.data,
      keType,
      provenance: {
        ...base.data.provenance,
        keTypeProvenanceId: provenanceId,
      },
    },
    base.meta,
  );
}

/**
 * Facade Phase 9E — nối 8 phép tính ĐÃ VERIFIED (Calendar Foundation, Nguyệt Tướng, Ngày/Đêm,
 * Quý Nhân, Thiên Địa Bàn, Tứ Khóa, Tam Truyền [qua Cửu Tông Môn], Thập Nhị Thiên Tướng) thành
 * 1 `EngineResult` duy nhất — KHÔNG phải Core/orchestrator mới, chỉ compose tuần tự các hàm
 * `compute*` ĐÃ CÓ theo ĐÚNG dependency graph thật (xem docs Phase 9E preflight): 天地盤 tách
 * thành 2 nhánh độc lập sau khi dựng xong — (四課→三傳) và (十二天將, chỉ cần Quý Nhân, KHÔNG
 * cần 四課/三傳) — KHÔNG tính lại bất kỳ giá trị nào đã có từ tầng trước.
 *
 * `computeYiMa` KHÔNG được gọi trực tiếp ở đây — chỉ `computeThreeTransmissions` (qua
 * `computeNineMethodSelection` nội bộ) mới gọi khi đúng trường hợp 返吟 vô 賊克.
 *
 * KHÔNG PHẢI `calculate()` lá số đầy đủ — CHƯA có 課體/空亡/神煞/旺衰/本命/行年 (xem
 * `da-liu-ren-calculation-result.ts`). KHÔNG throw cho input không hợp lệ hay bất kỳ nhánh
 * 九宗門/伏吟 chưa đủ evidence nào — mọi lỗi (kể cả `NineMethodsError` như
 * `INSUFFICIENT_EVIDENCE_FUYIN_SELECTION`) trả nguyên trạng qua `EngineResult.errors`, KHÔNG
 * downgrade thành partial success, KHÔNG silent fallback. Provenance KHÔNG bị collapse thành 1
 * confidence tổng — mỗi id trong `DaLiuRenCalculationProvenance` giữ nguyên confidence riêng
 * (xem type đó), đặc biệt `nobleSpiritDayNightAssignmentProvenanceId` (B cho Giáp, D cho 9 Can
 * còn lại) PHẢI luôn có mặt trong kết quả thành công.
 */
export function calculateDaLiuRenChart(
  input: ChartInput,
  profile: CalculationProfile = CLASSICAL_V1_PROFILE,
): EngineResult<DaLiuRenCalculationResult> {
  const meta = buildMeta();

  try {
    const calendar = computeCalendarData(input, profile);
    const monthGeneral = computeMonthGeneral(calendar);
    const dayNight = computeDayNight(calendar);
    const nobleSpirit = computeNobleSpirit(calendar.dayPillar.can, dayNight.dayNight.value, profile);
    const heavenEarthPlate = computeHeavenEarthPlate(monthGeneral.monthGeneral, calendar);
    const fourLessons = computeFourLessons(calendar, heavenEarthPlate.heavenEarthPlate);
    const threeTransmissions = computeThreeTransmissions(fourLessons.fourLessons, heavenEarthPlate.heavenEarthPlate, calendar.dayPillar.can);
    const twelveGenerals = computeTwelveGenerals(heavenEarthPlate.heavenEarthPlate, nobleSpirit);

    return ok<DaLiuRenCalculationResult>(
      {
        calendar,
        monthGeneral: monthGeneral.monthGeneral,
        dayNight: dayNight.dayNight,
        nobleSpirit: nobleSpirit.nobleSpirit,
        heavenEarthPlate: heavenEarthPlate.heavenEarthPlate,
        fourLessons: fourLessons.fourLessons,
        threeTransmissions: threeTransmissions.threeTransmissions,
        twelveGenerals: twelveGenerals.twelveGenerals,
        provenance: {
          monthGeneralProvenanceId: monthGeneral.provenanceId,
          dayNightProvenanceId: dayNight.provenanceId,
          nobleSpiritPairProvenanceId: nobleSpirit.pairProvenanceId,
          nobleSpiritDayNightAssignmentProvenanceId: nobleSpirit.dayNightAssignmentProvenanceId,
          heavenEarthPlateProvenanceId: heavenEarthPlate.provenanceId,
          fourLessonsProvenanceId: fourLessons.provenanceId,
          threeTransmissionsInitialProvenanceId: threeTransmissions.initialProvenanceId,
          ...(threeTransmissions.chainProvenanceId !== undefined ? { threeTransmissionsChainProvenanceId: threeTransmissions.chainProvenanceId } : {}),
          twelveGeneralsOrderProvenanceId: twelveGenerals.orderProvenanceId,
          twelveGeneralsAnchorProvenanceId: twelveGenerals.anchorProvenanceId,
          twelveGeneralsDirectionProvenanceId: twelveGenerals.directionProvenanceId,
        },
      },
      meta,
    );
  } catch (error) {
    return fail([toEngineError(error)], meta);
  }
}
