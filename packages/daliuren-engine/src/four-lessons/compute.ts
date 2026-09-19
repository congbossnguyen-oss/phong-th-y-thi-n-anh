/**
 * Four Lessons (四課 Tứ Khóa) — Phase 9A. Thuật toán: Algorithm Spec §6 — chuẩn hoá thứ tự
 * trả về 1→2→3→4 (KHÔNG theo thứ tự ngược của repo B). Input = `CalendarData.dayPillar`
 * (Can/Chi Ngày) + `HeavenEarthPlate` đã dựng (heaven-earth-plate/compute.ts) — KHÔNG tính
 * lại Thiên/Địa Bàn ở đây, chỉ TRA qua `heavenPlateAt`.
 *
 * PHẠM VI: đây CHỈ là bước dựng CẤU TRÚC 4 khóa (calculation layer). KHÔNG thêm luận giải
 * ("日主外兮辰主內" hay bất kỳ diễn giải ý nghĩa nào) vào output — vai trò luận đoán độc lập
 * của 四課 (đã xác nhận CONFIDENCE A, xem docs/daliuren/DA_LIU_REN_UNIQUE_VALUE_RESEARCH.md
 * §3) thuộc về Interpretation Engine (chưa xây), không phải Calculation Layer này.
 */
import type { Chi } from "../types/ganzhi.js";
import type { CalendarData } from "../types/calendar-data.js";
import type { HeavenEarthPlate } from "../types/plates.js";
import type { FourLessons } from "../types/four-lessons.js";
import { heavenPlateAt } from "../heaven-earth-plate/compute.js";
import { JI_GONG_TABLE } from "./table.js";
import { FOUR_LESSONS_PROVENANCE } from "./provenance.js";
import { FourLessonsError } from "./errors.js";

export interface FourLessonsComputation {
  fourLessons: FourLessons;
  /** → ProvenanceEntry.id (four-lessons/provenance.ts). */
  provenanceId: string;
}

/**
 * Dựng 4 Khóa từ `CalendarData.dayPillar` + `HeavenEarthPlate` đã dựng. NO HIDDEN FALLBACK:
 * nếu `dayPillar.can` không phải 1 trong 10 Thiên Can hợp lệ (dữ liệu từ nguồn khác
 * `computeCalendarData`, vd JSON deserialize hỏng), ném lỗi tường minh — KHÔNG đoán cung ký
 * thác. `dayPillar.chi` KHÔNG cần tra bảng riêng (Khóa 3 dùng thẳng Chi Ngày làm `lower`), nên
 * không có lỗi tương ứng cho Chi Ngày — sai lệch Chi (nếu có) sẽ tự lộ ra ở `heavenPlateAt`
 * (ném `HeavenEarthPlateError`, KHÔNG nuốt lỗi ở đây).
 */
export function computeFourLessons(calendarData: CalendarData, heavenEarthPlate: HeavenEarthPlate): FourLessonsComputation {
  const dayCan = calendarData.dayPillar.can;
  const dayChi = calendarData.dayPillar.chi;

  const jiGong: Chi | undefined = JI_GONG_TABLE[dayCan];
  if (!jiGong) {
    throw new FourLessonsError("UNKNOWN_DAY_CAN", `Can Ngày không hợp lệ: "${dayCan}" — không có trong bảng 寄宮 10 dòng.`);
  }

  const lesson1UpperChi = heavenPlateAt(heavenEarthPlate, jiGong);
  const lesson2UpperChi = heavenPlateAt(heavenEarthPlate, lesson1UpperChi);
  const lesson3UpperChi = heavenPlateAt(heavenEarthPlate, dayChi);
  const lesson4UpperChi = heavenPlateAt(heavenEarthPlate, lesson3UpperChi);

  return {
    fourLessons: {
      lesson1: { upper: lesson1UpperChi, lower: dayCan },
      lesson2: { upper: lesson2UpperChi, lower: lesson1UpperChi },
      lesson3: { upper: lesson3UpperChi, lower: dayChi },
      lesson4: { upper: lesson4UpperChi, lower: lesson3UpperChi },
    },
    provenanceId: FOUR_LESSONS_PROVENANCE.id,
  };
}
