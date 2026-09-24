/**
 * 本命 (BenMing) / 行年 (XingNian) — module additive, KHÔNG merge vào `DaLiuRenCalculationResult`
 * (8-field freeze) — đúng pattern đã proven ở 11-A1-A4 (課體/空亡/旺衰/驛馬). Convention đã đóng
 * băng ở docs/daliuren/decisions/DA_LIU_REN_BENMING_XINGNIAN_CONVENTION_DECISION.md:
 * BIRTH_YEAR_CONVENTION=LICHUN, AGE_CONVENTION=XUSUI — CẢ HAI là PROJECT CONVENTION, KHÔNG PHẢI
 * cổ pháp đã chứng minh (xem provenance.ts để phân biệt đúng CLASSICAL FACT vs PROJECT CONVENTION).
 */
import { Calendar, getGanzhiYear, isValidCalendarDate } from "@thien-anh/calendar-core";
import type { BenMing, XingNian } from "../types/ben-ming-xing-nian.js";
import {
  BEN_MING_CONCEPT_PROVENANCE,
  BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE,
  XING_NIAN_FORMULA_PROVENANCE,
  XING_NIAN_AGE_CONVENTION_PROVENANCE,
} from "./provenance.js";

const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseBirthDate(birthDate: string): { year: number; month: number; day: number } {
  const match = BIRTH_DATE_PATTERN.exec(birthDate);
  if (!match) {
    throw new Error(`computeBenMing: birthDate phải đúng định dạng YYYY-MM-DD, nhận "${birthDate}".`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidCalendarDate(year, month, day)) {
    throw new Error(`computeBenMing: birthDate không tồn tại trong lịch: "${birthDate}".`);
  }
  return { year, month, day };
}

export interface BenMingComputation {
  benMing: BenMing;
  /** Vị trí trong Lục Thập Hoa Giáp (0-59) — expose để `computeXingNian()` tái dùng, KHÔNG tính lại. */
  cycleIndex: number;
  conceptProvenanceId: string;
  yearBoundaryProvenanceId: string;
}

/**
 * `birthDate`: `YYYY-MM-DD` (cùng format `ChartInput.date`/`ChartInput.birthDate`).
 * `timeZone`: TÁI DÙNG `ChartInput.timeZone` (lượt chiêm) — schema hiện tại KHÔNG có field
 * timezone riêng cho birthDate (Decision Record mục 10.3, bị ép buộc bởi schema, không phải
 * lựa chọn tự do).
 *
 * `hour:0, minute:0, second:0` — date-only convention ĐÃ CÓ SẴN của `@thien-anh/calendar-core`
 * (`DateTimeInput.hour/minute/second` mặc định 0 nếu vắng mặt, xem `resolveDateTime` trong
 * `calendar-core/src/index.ts`) — KHÔNG PHẢI convention mới phát minh ở đây (Decision Record mục
 * 10.4). Giới hạn CÒN LẠI (KHÔNG giải quyết được ở đây): với birthDate = ĐÚNG ngày Lập Xuân dương
 * lịch, mặc định giờ 0 có thể sai nếu người đó sinh SAU thời điểm Lập Xuân thật trong CHÍNH ngày
 * đó — đây là DATA LIMITATION (thiếu birth-hour trên `ChartInput.birthDate`), không phải lỗi hàm
 * `getGanzhiYear()` (hàm tính Lập Xuân ở độ chính xác timestamp đầy đủ, không làm tròn theo ngày).
 *
 * KHÔNG tự viết lại thuật toán Can Chi/Lập Xuân — gọi thẳng `getGanzhiYear()` đã proven (dùng làm
 * oracle ở chính Phase 11-E).
 */
export function computeBenMing(birthDate: string, timeZone: string): BenMingComputation {
  const { year, month, day } = parseBirthDate(birthDate);
  const pillar = getGanzhiYear({ year, month, day, hour: 0, minute: 0, second: 0, timeZone }, { yearBoundary: "lichXuan" });

  return {
    benMing: { can: pillar.can, chi: pillar.chi },
    cycleIndex: pillar.cycleIndex,
    conceptProvenanceId: BEN_MING_CONCEPT_PROVENANCE.id,
    yearBoundaryProvenanceId: BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE.id,
  };
}

export interface XingNianComputation {
  xingNian: XingNian;
  formulaProvenanceId: string;
  ageConventionProvenanceId: string;
}

/** canIndex/chiIndex CỦA năm khởi (tuổi 1) — 丙寅 Nam / 壬申 Nữ đều có canIndex=chiIndex=2/8 (trùng hợp cấu trúc Lục Thập Hoa Giáp, xem provenance.ts). */
const XING_NIAN_ANCHOR_INDEX: Record<"male" | "female", number> = { male: 2, female: 8 };
/** Nam THUẬN (+1 Can VÀ +1 Chi mỗi tuổi) — Nữ NGHỊCH (-1 Can VÀ -1 Chi mỗi tuổi), đối xứng chính xác. */
const XING_NIAN_DIRECTION: Record<"male" | "female", 1 | -1> = { male: 1, female: -1 };

/**
 * `currentCycleIndex`: `DaLiuRenCalculationResult.calendar.yearPillar.cycleIndex` (ĐÃ CÓ SẴN,
 * ĐÃ TÍNH bằng `getGanzhiYear()` với `yearBoundary:"lichXuan"` và thời điểm chiêm ĐẦY ĐỦ — KHÔNG
 * gọi lại `getGanzhiYear()` ở đây, tái dùng đúng theo Decision Record mục 10.1).
 * `birthCycleIndex`: `BenMingComputation.cycleIndex` từ `computeBenMing()` — caller PHẢI gọi
 * `computeBenMing()` trước và truyền `cycleIndex` vào đây (cùng 1 lượt chiêm).
 *
 * ⚠️ Mô hình Nữ (nghịch) là mô hình ĐỐI XỨNG toán học với Nam, tự-nhất-quán (verify đủ 60 bước) —
 * nhưng KHÔNG tái tạo được giá trị "十一歲壬午" trích trong nguồn cổ văn (xem provenance.ts
 * `XING_NIAN_FORMULA_PROVENANCE.notes` để biết đầy đủ — mâu thuẫn CHƯA GIẢI QUYẾT, không tự ý
 * chọn giá trị khác chỉ để khớp 1 mốc trích dẫn).
 */
export function computeXingNian(currentCycleIndex: number, birthCycleIndex: number, gender: "male" | "female"): XingNianComputation {
  const ageXuSui = ((currentCycleIndex - birthCycleIndex + 60) % 60) + 1;
  const step = ageXuSui - 1;
  const rawIndex = XING_NIAN_ANCHOR_INDEX[gender] + XING_NIAN_DIRECTION[gender] * step;
  const pillar = Calendar.buildPillar(rawIndex, rawIndex);

  return {
    xingNian: { can: pillar.can, chi: pillar.chi, ageXuSui },
    formulaProvenanceId: XING_NIAN_FORMULA_PROVENANCE.id,
    ageConventionProvenanceId: XING_NIAN_AGE_CONVENTION_PROVENANCE.id,
  };
}
