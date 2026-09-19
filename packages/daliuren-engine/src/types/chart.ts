/**
 * ChartInput / Chart — điểm lắp ráp toàn bộ domain contract thành 1 lá số Đại Lục Nhâm.
 * Đây là type CONTRACT (Checkpoint 1) — hàm `calculate()` thực sự dựng `Chart` từ
 * `ChartInput` thuộc Calendar Layer, CHƯA implement (xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md).
 */
import type { CalendarData } from "./calendar-data.js";
import type { MonthGeneral } from "./month-general.js";
import type { DayNightDetermination } from "./day-night.js";
import type { NobleSpirit } from "./noble-spirit.js";
import type { HeavenEarthPlate } from "./plates.js";
import type { FourLessons } from "./four-lessons.js";
import type { ThreeTransmissions } from "./three-transmissions.js";
import type { TwelveGenerals } from "./twelve-generals.js";
import type { KeType } from "./ke-type.js";
import type { VoidBranches } from "./void-branches.js";
import type { ShenShaPlacement } from "./shen-sha.js";
import type { WangShuai } from "./wang-shuai.js";
import type { BenMing, XingNian } from "./ben-ming-xing-nian.js";

export interface ChartInput {
  /** YYYY-MM-DD, dương lịch. */
  date: string;
  /** 0-23, giờ dân sự tại `timeZone`. */
  hour: number;
  minute?: number;
  /** Tên múi giờ IANA — BẮT BUỘC tường minh, không suy đoán ngầm (Algorithm Spec §0). */
  timeZone: string;
  gender?: "male" | "female";
  /** Bắt buộc nếu cần Bản Mệnh/Hành Niên. */
  birthDate?: string;
  /** Mặc định 'classical-v1' — xem profiles/classical-v1.ts. */
  calculationProfileId?: string;
}

/**
 * Chart — output Tầng 1, tương ứng `DaLiuRenChart` trong DA_LIU_REN_DATA_SCHEMA.md.
 * `yingQi` (應期) CỐ TÌNH không có field nào — DO_NOT_IMPLEMENT, xem Algorithm Spec §14.
 * `sixRelations` (六親) CỐ TÌNH không có field nào — DO_NOT_IMPLEMENT, xem Interpretation Gaps.
 */
export interface Chart {
  input: Required<Pick<ChartInput, "date" | "hour" | "timeZone">> & ChartInput;
  calendar: CalendarData;
  monthGeneral: MonthGeneral;
  dayNight: DayNightDetermination;
  nobleSpirit: NobleSpirit;
  heavenEarthPlate: HeavenEarthPlate;
  fourLessons: FourLessons;
  threeTransmissions: ThreeTransmissions;
  twelveGenerals: TwelveGenerals;
  keType: KeType;
  voidBranches: VoidBranches;
  /** LUÔN đúng 0 hoặc 1 phần tử (`yiMa`) ở Checkpoint 1 — xem shen-sha.ts. */
  shenSha: readonly ShenShaPlacement[];
  wangShuai: WangShuai;
  /** Chỉ có khi `input.birthDate` được cung cấp. */
  benMing?: BenMing;
  xingNian?: XingNian;
}
