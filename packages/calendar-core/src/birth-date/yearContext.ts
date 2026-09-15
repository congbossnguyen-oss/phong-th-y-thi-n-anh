/**
 * YEAR CONTEXT (V3-07B, Phase A/B) — DẪN XUẤT "năm theo 1 quy ước lịch" từ 1 BirthDate.
 *
 * Đây là tầng CUNG CẤP DỮ KIỆN LỊCH, methodology-neutral: nó chỉ trả lời "năm theo quy ước X của
 * ngày sinh này là gì", KHÔNG biết phương pháp nào cần quy ước nào (đó là việc của MethodYearContract).
 *
 * 4 quy ước năm hợp lệ trong hệ thống (V306_CALENDAR_CORE_AUDIT.md — xác nhận bằng khảo sát code thật,
 * không phải suy đoán):
 *   - GREGORIAN                : nhãn năm Dương lịch thô (ranh giới 1/1). Chỉ cần năm.
 *   - GANZHI_CALENDAR_BOUNDARY : Can Chi năm theo "năm con giáp đại chúng" (ranh giới 1/1). Chỉ cần năm.
 *   - GANZHI_LICH_XUAN         : Can Chi năm chuẩn Tứ Trụ/Bát Tự (ranh giới Lập Xuân ~4/2). CẦN đủ ngày.
 *   - LUNAR_TET                : năm Âm lịch (ranh giới Mùng 1 Tết). CẦN đủ ngày.
 *
 * Nguồn tính toán CANONICAL:
 *   - Ganzhi (cả 2 ranh giới): `getGanzhiYear` của chính calendar-core — đã xác nhận tương đương
 *     1000/1000 với bản Lập Xuân thứ 2 (`src/lib/bat-tu.ts`) ở V3-06 Track 2; calendar-core được chọn
 *     làm CANONICAL vì có timezone tường minh + dùng chung nhiều domain.
 *   - Âm lịch/Tết: `getLunarDate` của calendar-core.
 *
 * NGUYÊN TẮC "KHÔNG ÂM THẦM FALLBACK": nếu 1 BirthDate chỉ có năm (precision "year") mà bị yêu cầu 1
 * quy ước PHỤ THUỘC NGÀY (Lập Xuân/Tết), hàm NÉM LỖI rõ ràng — KHÔNG bịa 1/1 rồi trả 1 giá trị sai
 * lặng lẽ. Đây chính là bài học cốt lõi của CF-01 (V3-04/V3-05): một `number` "năm" trần đi qua ranh
 * giới quy ước mà không ai biết nó thuộc quy ước nào.
 */
import { type GanzhiPillar, buildPillar } from "../calendar/ganzhi.js";
import type { LunarDate } from "../calendar/lunarCalendar.js";
import { getGanzhiYear, getLunarDate } from "../index.js";
import { mod } from "../utils/math.js";
import { type BirthDate, hasCalendarDate } from "./birthDate.js";

export type YearConvention =
  | "GREGORIAN"
  | "GANZHI_CALENDAR_BOUNDARY"
  | "GANZHI_LICH_XUAN"
  | "GANZHI_LUNAR_TET"
  | "LUNAR_TET";

/** Tập giá trị hợp lệ (để validate runtime khi convention đến từ dữ liệu ngoài). */
export const YEAR_CONVENTIONS: readonly YearConvention[] = [
  "GREGORIAN",
  "GANZHI_CALENDAR_BOUNDARY",
  "GANZHI_LICH_XUAN",
  "GANZHI_LUNAR_TET",
  "LUNAR_TET",
];

/** Kết quả DẪN XUẤT năm theo 1 quy ước. Bất biến. */
export interface ResolvedYearContext {
  readonly convention: YearConvention;
  /** Giá trị năm (số nguyên) sau khi áp đúng ranh giới của quy ước. */
  readonly year: number;
  /** Trụ Can Chi năm — CÓ MẶT cho 3 quy ước Ganzhi (1/1, Lập Xuân, Lập Xuân Tết), null cho GREGORIAN/LUNAR_TET. */
  readonly pillar: GanzhiPillar | null;
  /** Ngày Âm lịch đầy đủ — CÓ MẶT cho LUNAR_TET và GANZHI_LUNAR_TET, null cho các quy ước khác. */
  readonly lunarDate: LunarDate | null;
  /** Mô tả ranh giới (phục vụ audit/hiển thị). */
  readonly boundaryRule: string;
  /** Implementation nào tính ra giá trị này (provenance kỹ thuật, KHÔNG phải provenance cổ văn). */
  readonly sourceImplementation: string;
}

/** Lỗi: yêu cầu quy ước phụ thuộc ngày trên 1 BirthDate chỉ có năm. */
export class BirthDatePrecisionError extends Error {
  constructor(convention: YearConvention) {
    super(
      `Quy ước năm "${convention}" phụ thuộc NGÀY sinh cụ thể (ranh giới ` +
        `${convention === "LUNAR_TET" || convention === "GANZHI_LUNAR_TET" ? "Tết" : "Lập Xuân"}), nhưng BirthDate chỉ có NĂM (precision="year"). ` +
        `KHÔNG được âm thầm bịa 1/1 — hãy cung cấp đủ ngày/tháng sinh, hoặc chọn quy ước không phụ thuộc ngày ` +
        `(GREGORIAN / GANZHI_CALENDAR_BOUNDARY).`,
    );
    this.name = "BirthDatePrecisionError";
  }
}

/** Lỗi: convention không hợp lệ (đến từ dữ liệu ngoài / cấu hình sai). */
export class UnknownYearConventionError extends Error {
  constructor(convention: string) {
    super(`Quy ước năm không hợp lệ: ${JSON.stringify(convention)}. Hợp lệ: ${YEAR_CONVENTIONS.join(", ")}.`);
    this.name = "UnknownYearConventionError";
  }
}

/** Khôi phục năm Dương lịch hiệu dụng từ cycleIndex của trụ, không cần tính lại ranh giới Lập Xuân. */
function effectiveGregorianYearFromCycle(cycleIndex: number, gregorianYear: number): number {
  // Ranh giới chỉ dịch tối đa 1 năm (lùi 1 với Lập Xuân). Chọn năm trong {year, year-1} khớp cycleIndex.
  for (const candidate of [gregorianYear, gregorianYear - 1]) {
    if (((candidate - 4) % 60 + 60) % 60 === cycleIndex) return candidate;
  }
  // Không thể xảy ra với dữ liệu hợp lệ; ném lỗi rõ thay vì trả giá trị sai lặng lẽ.
  throw new Error(`Không khôi phục được năm Dương lịch hiệu dụng từ cycleIndex=${cycleIndex} quanh ${gregorianYear}.`);
}

/**
 * DẪN XUẤT năm theo 1 quy ước cụ thể từ BirthDate. Thuần túy (pure) — không side effect.
 * Ném `BirthDatePrecisionError` nếu quy ước phụ thuộc ngày mà BirthDate chỉ có năm.
 */
export function resolveYearContext(birthDate: BirthDate, convention: YearConvention): ResolvedYearContext {
  switch (convention) {
    case "GREGORIAN":
      return {
        convention,
        year: birthDate.gregorianYear,
        pillar: null,
        lunarDate: null,
        boundaryRule: "Dương lịch — nhãn năm thô, ranh giới 1/1.",
        sourceImplementation: "calendar-core: nhãn năm gốc (không quy đổi).",
      };

    case "GANZHI_CALENDAR_BOUNDARY": {
      // Ranh giới 1/1: chỉ phụ thuộc NHÃN NĂM, độc lập ngày/tháng/giờ. Dùng 1/1 12:00 làm mốc đại diện
      // (bất kỳ ngày nào trong năm cũng cho cùng trụ với ranh giới "calendar").
      const pillar = getGanzhiYear(
        { year: birthDate.gregorianYear, month: 1, day: 1, hour: 12, timeZone: birthDate.timeZone },
        { yearBoundary: "calendar" },
      );
      return {
        convention,
        year: birthDate.gregorianYear,
        pillar,
        lunarDate: null,
        boundaryRule: "Ganzhi ranh giới 1/1 dương lịch (năm con giáp đại chúng).",
        sourceImplementation: "calendar-core::getGanzhiYear{ yearBoundary: 'calendar' }.",
      };
    }

    case "GANZHI_LICH_XUAN": {
      if (!hasCalendarDate(birthDate)) throw new BirthDatePrecisionError(convention);
      const pillar = getGanzhiYear(
        {
          year: birthDate.gregorianYear,
          month: birthDate.gregorianMonth as number,
          day: birthDate.gregorianDay as number,
          hour: birthDate.hour ?? 12,
          minute: birthDate.minute ?? 0,
          timeZone: birthDate.timeZone,
        },
        { yearBoundary: "lichXuan" },
      );
      return {
        convention,
        year: effectiveGregorianYearFromCycle(pillar.cycleIndex, birthDate.gregorianYear),
        pillar,
        lunarDate: null,
        boundaryRule: "Ganzhi ranh giới Lập Xuân (kinh độ mặt trời 315°, chuẩn Tứ Trụ/Bát Tự).",
        sourceImplementation: "calendar-core::getGanzhiYear{ yearBoundary: 'lichXuan' }.",
      };
    }

    case "GANZHI_LUNAR_TET": {
      // V3-17 (D8=B): trụ Can Chi NĂM theo ranh giới Mùng 1 Tết (âm lịch) — dùng cho Tử Vi Natal.
      // KHÁC LUNAR_TET (chỉ trả số năm + lunarDate, pillar=null): quy ước này TRẢ VỀ trụ Can Chi.
      // KHÔNG nhân bản thuật toán lịch: lấy năm âm lịch từ getLunarDate rồi suy trụ bằng công thức
      // Lục Thập Hoa Giáp chuẩn (năm 4 = Giáp Tý), y hệt getGanzhiYear — chỉ khác ranh giới (Tết).
      if (!hasCalendarDate(birthDate)) throw new BirthDatePrecisionError(convention);
      const lunar = getLunarDate({
        year: birthDate.gregorianYear,
        month: birthDate.gregorianMonth as number,
        day: birthDate.gregorianDay as number,
        hour: birthDate.hour ?? 12,
        minute: birthDate.minute ?? 0,
        timeZone: birthDate.timeZone,
      });
      const cycleIndex = mod(lunar.year - 4, 60);
      return {
        convention,
        year: lunar.year,
        pillar: buildPillar(cycleIndex, cycleIndex),
        lunarDate: lunar,
        boundaryRule: "Ganzhi ranh giới Mùng 1 Tết (âm lịch) — trụ năm Can Chi theo năm âm lịch.",
        sourceImplementation: "calendar-core::getLunarDate + buildPillar((namÂmLịch-4) mod 60).",
      };
    }

    case "LUNAR_TET": {
      if (!hasCalendarDate(birthDate)) throw new BirthDatePrecisionError(convention);
      const lunar = getLunarDate({
        year: birthDate.gregorianYear,
        month: birthDate.gregorianMonth as number,
        day: birthDate.gregorianDay as number,
        hour: birthDate.hour ?? 12,
        minute: birthDate.minute ?? 0,
        timeZone: birthDate.timeZone,
      });
      return {
        convention,
        year: lunar.year,
        pillar: null,
        lunarDate: lunar,
        boundaryRule: "Âm lịch — ranh giới Mùng 1 tháng Giêng (Tết Nguyên Đán).",
        sourceImplementation: "calendar-core::getLunarDate (điểm Sóc + Đông Chí + quy tắc tháng nhuận).",
      };
    }

    default:
      throw new UnknownYearConventionError(convention);
  }
}

/**
 * DẪN XUẤT TẤT CẢ các context lịch KHẢ DỤNG cho 1 BirthDate (bỏ qua các quy ước phụ thuộc ngày nếu
 * BirthDate chỉ có năm — KHÔNG ném lỗi ở đây, chỉ trả những cái resolve được). Dùng để chứng minh
 * "1 BirthDate sinh ra NHIỀU context năm khác nhau" và cho mục đích hiển thị/audit.
 */
export function resolveAllAvailableYearContexts(birthDate: BirthDate): ResolvedYearContext[] {
  const result: ResolvedYearContext[] = [];
  for (const convention of YEAR_CONVENTIONS) {
    if (
      !hasCalendarDate(birthDate) &&
      (convention === "GANZHI_LICH_XUAN" || convention === "GANZHI_LUNAR_TET" || convention === "LUNAR_TET")
    ) {
      continue; // không đủ độ chính xác — bỏ qua thay vì bịa
    }
    result.push(resolveYearContext(birthDate, convention));
  }
  return result;
}
