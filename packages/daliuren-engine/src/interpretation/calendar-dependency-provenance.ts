/**
 * Dependency-provenance resolution nền tảng cho `calendar.dayPillar`/`calendar.hourPillar` —
 * Phase 10.5 Section 6 (contract) / Phase 10.5A (đóng gap `PROV-GANZHI-PILLAR-CONSTRUCTION`) /
 * Phase 10.6.1 (implement). CHỈ áp dụng cho `dayPillar`/`hourPillar` — 2 trụ DUY NHẤT phụ thuộc
 * `CalculationProfile.ziHourDayBoundary` (xem `calendar/ganzhi-adapter.ts`
 * `resolveGoverningDateTimeInput`). `yearPillar`/`monthPillar` KHÔNG bị chi phối bởi quyết định
 * này — dùng thẳng `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE`, không cần hàm resolve riêng.
 *
 * TUYỆT ĐỐI KHÔNG dùng `EngineMeta` — resolver này CHỈ cần `hour` (do caller tự trích từ
 * `ChartInput`, KHÔNG nhận cả `ChartInput` để tránh vô tình rò rỉ `gender`/`birthDate` vào
 * đường đi provenance) và `CalculationProfile` đang dùng.
 */
import type { Confidence } from "./confidence.js";
import { worstConfidence } from "./confidence.js";
import type { CalculationProfile } from "../profiles/types.js";
import { GANZHI_PILLAR_CONSTRUCTION_PROVENANCE } from "../calendar/provenance.js";

/**
 * `hour === 23 || hour === 0` — vùng mà ÍT NHẤT 1 trong 3 `ZiHourDayBoundaryPolicy` đã biết
 * (`no-shift`/`shift-both-halves`/`shift-late-half-only`, xem `profiles/types.ts` và
 * `calendar/ganzhi-adapter.ts` `resolveGoverningDateTimeInput`) cho kết quả KHÁC nhau — tranh
 * chấp tồn tại vì 3 trường phái bất đồng, BẤT KỂ profile hiện tại đang cấu hình giá trị nào (đổi
 * profile sang 1 trong 2 policy còn lại sẽ đổi trụ Ngày/Giờ CHO CHÍNH GIỜ NÀY). Không phụ thuộc
 * `minute` — `resolveGoverningDateTimeInput` chỉ rẽ nhánh theo `hour` nguyên giờ (Phase 10.5A).
 */
export function isWithinZiHourAmbiguityWindow(hour: number): boolean {
  return hour === 23 || hour === 0;
}

export interface CalendarPillarProvenanceResolution {
  /** id của MỌI ProvenanceEntry (Calculation Layer + profile-decision) đã quyết định `confidence` — GIỮ RIÊNG từng id, KHÔNG gộp thành 1 entry mới (Phase 10.5A). */
  readonly provenanceIds: readonly string[];
  /** worst-of (xem `worstConfidence`) giữa các provenance liên quan — KHÔNG PHẢI suy diễn bắc cầu từ field Calculation khác. */
  readonly confidence: Confidence;
}

/**
 * Resolve provenance cho `calendar.dayPillar` HOẶC `calendar.hourPillar` (CÙNG công thức, xem
 * `ganzhi-adapter.ts` — cả 2 dùng chung `resolveGoverningDateTimeInput`). KHÔNG dùng cho
 * `yearPillar`/`monthPillar`.
 */
export function resolveDayOrHourPillarProvenance(hour: number, profile: CalculationProfile): CalendarPillarProvenanceResolution {
  const base = GANZHI_PILLAR_CONSTRUCTION_PROVENANCE;

  if (!isWithinZiHourAmbiguityWindow(hour)) {
    return { provenanceIds: [base.id], confidence: base.confidence };
  }

  const ziHour = profile.ziHourDayBoundary;
  return {
    provenanceIds: [base.id, ...ziHour.provenanceIds],
    confidence: worstConfidence(base.confidence, ziHour.confidence),
  };
}
