/**
 * Heaven/Earth Plate (天地盤 Thiên Bàn / Địa Bàn) — Phase 9A. Thuật toán: Algorithm Spec §5 —
 * "đặt chi Nguyệt Tướng vào vị trí Địa Bàn của chi giờ chiêm; các vị trí còn lại dịch chuyển
 * tương ứng theo thứ tự tự nhiên Tý→Sửu→Dần…". KHÔNG tự suy diễn công thức khác — công thức
 * này đã "đồng thuận tuyệt đối" giữa 4 nguồn độc lập (xem provenance.ts) và được xác minh
 * thêm bằng cách dò tay qua source code thật của repo B (kinliuren) cho 1 golden case cụ thể
 * (xem tests/unit/heaven-earth-plate/compute.test.ts).
 *
 * Input = `MonthGeneral` (đã tính ở month-general/compute.ts) + `CalendarData.hourPillar.chi`
 * (占時) — KHÔNG tính lại Nguyệt Tướng hay Can Chi giờ ở đây, chỉ TRA/XOAY.
 */
import type { CalendarData } from "../types/calendar-data.js";
import type { Chi } from "../types/ganzhi.js";
import type { MonthGeneral } from "../types/month-general.js";
import type { EarthPlate, HeavenEarthPlate, HeavenPlate } from "../types/plates.js";
import { EARTH_PLATE } from "./table.js";
import { HEAVEN_EARTH_PLATE_PROVENANCE } from "./provenance.js";
import { HeavenEarthPlateError } from "./errors.js";

export interface HeavenEarthPlateComputation {
  heavenEarthPlate: HeavenEarthPlate;
  /** → ProvenanceEntry.id (heaven-earth-plate/provenance.ts). */
  provenanceId: string;
}

function indexOfChi(
  plate: EarthPlate,
  chi: Chi,
  errorCode: "UNKNOWN_MONTH_GENERAL_ZHI" | "UNKNOWN_HOUR_CHI" | "UNKNOWN_EARTH_CHI",
  label: string,
): number {
  const index = plate.indexOf(chi);
  if (index === -1) {
    throw new HeavenEarthPlateError(errorCode, `${label} không hợp lệ: "${chi}" — không thuộc 12 địa chi cố định của Địa Bàn.`);
  }
  return index;
}

/** mod luôn không âm, kể cả khi `n` âm — tránh lỗi dấu của toán tử `%` gốc của JS với số âm. */
function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/**
 * Tra "chữ Thiên Bàn tại vị trí Chi X của Địa Bàn" (Algorithm Spec §5 mục 3) — phép tra CHÍNH
 * dùng xuyên suốt engine (four-lessons/ và mọi module sau dùng 天地盤 đều PHẢI gọi qua đây,
 * KHÔNG tự viết lại phép tra vị trí ở nơi khác).
 */
export function heavenPlateAt(heavenEarthPlate: HeavenEarthPlate, earthChi: Chi): Chi {
  const index = indexOfChi(heavenEarthPlate.earthPlate, earthChi, "UNKNOWN_EARTH_CHI", "Chi tra cứu trên Địa Bàn");
  return heavenEarthPlate.heavenPlate[index]!;
}

/**
 * Tra NGƯỢC: vị trí Địa Bàn (trả về dưới dạng Chi của chính vị trí đó) đang MANG chữ Thiên Bàn
 * `heavenValue` cho trước — nghịch đảo của `heavenPlateAt` (Thiên Bàn là 1 song ánh của Địa
 * Bàn nên luôn tồn tại ĐÚNG 1 vị trí thỏa). Cần cho 九宗門 pháp 涉害 (xem
 * nine-methods/compute.ts) — KHÔNG dùng cho mục đích nào khác ngoài đó, tránh nhân bản khái
 * niệm "vị trí" không cần thiết ở nơi khác.
 */
export function earthChiOfHeavenValue(heavenEarthPlate: HeavenEarthPlate, heavenValue: Chi): Chi {
  const index = heavenEarthPlate.heavenPlate.indexOf(heavenValue);
  if (index === -1) {
    throw new HeavenEarthPlateError("UNKNOWN_EARTH_CHI", `Giá trị Thiên Bàn không hợp lệ: "${heavenValue}" — không thuộc 12 địa chi cố định.`);
  }
  return heavenEarthPlate.earthPlate[index]!;
}

/**
 * Dựng Thiên Bàn/Địa Bàn từ Nguyệt Tướng + Chi giờ chiêm. NO HIDDEN FALLBACK: nếu
 * `monthGeneral.zhi`/`hourChi` không phải 1 trong 12 địa chi hợp lệ (dữ liệu từ nguồn khác
 * `computeMonthGeneral`/`computeCalendarData`, vd JSON deserialize hỏng), ném lỗi tường minh.
 */
export function computeHeavenEarthPlate(monthGeneral: MonthGeneral, calendarData: CalendarData): HeavenEarthPlateComputation {
  const hourChi = calendarData.hourPillar.chi;

  const monthGeneralIndex = indexOfChi(EARTH_PLATE, monthGeneral.zhi, "UNKNOWN_MONTH_GENERAL_ZHI", "Nguyệt Tướng");
  const hourIndex = indexOfChi(EARTH_PLATE, hourChi, "UNKNOWN_HOUR_CHI", "Chi giờ chiêm");

  const heavenPlate = EARTH_PLATE.map((_earthChi, position) => EARTH_PLATE[mod12(monthGeneralIndex + (position - hourIndex))]!) as unknown as HeavenPlate;

  return {
    heavenEarthPlate: { earthPlate: EARTH_PLATE, heavenPlate },
    provenanceId: HEAVEN_EARTH_PLATE_PROVENANCE.id,
  };
}
