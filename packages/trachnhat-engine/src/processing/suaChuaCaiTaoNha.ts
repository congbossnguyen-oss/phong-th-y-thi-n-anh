/**
 * CHỌN NGÀY GIỜ SỬA CHỮA – CẢI TẠO NHÀ — quét khoảng ngày (bắt buộc trong CÙNG 1 năm dương lịch,
 * vì "an toàn phương vị/năm" — Thái Tuế/Tuế Phá/Tam Sát/Kim Lâu/Hoàng Ốc/Tam Tai — chỉ tính đúng
 * cho 1 năm cụ thể) × đủ 12 giờ Địa Chi.
 *
 * finalScore = siteSafety×0.45 + ownerYear×0.15 + dayScore×0.30 + hourScore×0.10 — 2 lớp đầu
 * (siteSafety, ownerYear) CHỈ phụ thuộc năm sửa chữa + phương vị bị động, tính 1 LẦN rồi dùng
 * chung cho mọi tổ hợp ngày×giờ (không đổi theo ngày cụ thể) — đúng kiến trúc "tách bạch các
 * lớp độc lập" đã dùng ở `xuatHanhCaNhanTongHop.ts`. Nếu bất kỳ phương vị nào phạm mức
 * "critical" (Thái Tuế/Tuế Phá/Tam Sát + động thổ/sửa lớn) thì chặn trần điểm toàn bộ kết quả,
 * dù ngày/giờ có đẹp tới đâu — đúng nguyên tắc mục 20/32 của đặc tả ("không để ngày giờ đẹp cứu
 * một phương vị đại kỵ").
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring, CungMenhBatTrach, TrachNhat } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";
import { tinhGio12 } from "./gioBang.js";

type Chi = Data.Chi;
type CungBatTrach = CungMenhBatTrach.CungBatTrach;

const SO_NGAY_TOI_DA = 31;

const KHUNG_GIO: readonly string[] = [
  "23:00–01:00",
  "01:00–03:00",
  "03:00–05:00",
  "05:00–07:00",
  "07:00–09:00",
  "09:00–11:00",
  "11:00–13:00",
  "13:00–15:00",
  "15:00–17:00",
  "17:00–19:00",
  "19:00–21:00",
  "21:00–23:00",
];

export type RenovationType = Scoring.RenovationType;
export type RenovationLevel = Scoring.RenovationLevel;

const DAY_WEIGHT = 0.3;
const HOUR_WEIGHT = 0.1;
const SITE_SAFETY_WEIGHT = 0.45;
const OWNER_YEAR_WEIGHT = 0.15;
const TRAN_DIEM_NEU_PHAM_NGHIEM_TRONG = 3;

function round1(diem: number): number {
  return Math.round(diem * 10) / 10;
}
function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

export interface SuaChuaCaiTaoNhaInput {
  namSinh: number;
  renovationType: RenovationType;
  affectsStructure: boolean;
  digsGround: boolean;
  affectedCungList: readonly CungBatTrach[];
  timeZone: string;
}

export interface SuaChuaCaiTaoToHop {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  chiGio: Chi;
  canGio: string;
  khungGio: string;
  dayScore: Scoring.SuaChuaDayResult;
  hourScore: Scoring.GioTotResult;
  finalDiem: number;
  hang: Scoring.SuaChuaHang;
  nhan: string;
  /** Tiêu chí cát tinh cá nhân theo tuổi chủ (mức ngày) — để dễ lọc ngày. */
  catCaNhan: TrachNhat.CatTinhCaNhan;
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  level: RenovationLevel,
  nguoi: Scoring.NguoiTuoi,
  cungDongChinh: CungBatTrach,
  siteSafetyDiem: number,
  ownerYearDiem: number,
  phamNghiemTrong: boolean,
): SuaChuaCaiTaoToHop[] {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);

  const dayInput: Scoring.TrachCatDayBaseInput = {
    trucName: ngayInfo.truc.name,
    hoangDaoHacDao: ngayInfo.hoangDaoHacDaoNgay,
    nhiThapBatTuCatHung: ngayInfo.nhiThapBatTu.catHung,
    thanSat: ngayInfo.thanSat,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    satChu: ngayInfo.satChu,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
  };

  const dayScore = Scoring.calculateSuaChuaDayScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Chi,
    level,
    nguoi,
    cungDongChinh,
  );

  const nenTrachCatNgayDiem = Scoring.tinhTrachCatDayBase(dayInput, Scoring.GIO_SCORING_RULES.nenTrachCatNgay).diem;
  const gio12 = tinhGio12({
    julianDayNumber: tuTru.julianDayNumber,
    dayChiIndex: tuTru.dayChiIndex,
    lunarMonth: tuTru.lunarDate.month,
    lunarDay: tuTru.lunarDate.day,
  });

  // Cát tinh cá nhân mức NGÀY (chung cho 12 giờ) — chỉ đánh dấu để lọc, không đổi điểm.
  const catCaNhan = TrachNhat.tinhCatTinhCaNhan(tuTru.tuTru.ngay.can as Data.Can, tuTru.tuTru.ngay.chi as Chi, nguoi.can, nguoi.chi);

  return gio12.map((g, chiIndex) => {
    const hourScore = Scoring.calculateHourScore({
      dayCan: tuTru.tuTru.ngay.can as Data.Can,
      dayChi: tuTru.tuTru.ngay.chi as Chi,
      gioCan: g.canChiGio.can as Data.Can,
      gioChi: g.chiGio as Chi,
      hoangHacGio: g.hoangDaoHacDaoGio,
      tieuLucNhamGio: g.tieuLucNhamGio,
      nenTrachCatNgayDiem,
      purpose: "SUA_CHUA_CAI_TAO",
      nguoi,
    });

    let finalDiem = siteSafetyDiem * SITE_SAFETY_WEIGHT + ownerYearDiem * OWNER_YEAR_WEIGHT + dayScore.diem * DAY_WEIGHT + hourScore.diem * HOUR_WEIGHT;
    if (phamNghiemTrong) finalDiem = Math.min(finalDiem, TRAN_DIEM_NEU_PHAM_NGHIEM_TRONG);
    finalDiem = round1(clamp10(finalDiem));
    const hang = Scoring.getSuaChuaRating(finalDiem);

    return {
      solarDate: { year, month, day },
      lunarDate: tuTru.lunarDate,
      chiGio: g.chiGio as Chi,
      canGio: g.canChiGio.can,
      khungGio: KHUNG_GIO[chiIndex]!,
      dayScore,
      hourScore,
      finalDiem,
      hang,
      nhan: Scoring.suaChuaNhan(finalDiem),
      catCaNhan,
    };
  });
}

export interface SuaChuaCaiTaoNhaRangeInput extends SuaChuaCaiTaoNhaInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
}

export interface SuaChuaCaiTaoNhaRangeResult {
  renovationLevel: RenovationLevel;
  siteSafety: Scoring.SiteSafetyResult;
  ownerYear: Scoring.OwnerYearResult;
  xepHang: SuaChuaCaiTaoToHop[];
}

function tinhSiteSafetyVaOwnerYear(input: SuaChuaCaiTaoNhaInput, namSuaChua: number) {
  if (!Number.isInteger(input.namSinh) || input.namSinh < 1900 || input.namSinh > 2100) {
    throw new Error("Năm sinh không hợp lệ.");
  }
  if (input.affectedCungList.length === 0) {
    throw new Error("Cần chọn ít nhất 1 phương vị bị động.");
  }
  const level = Scoring.classifyRenovationLevel({
    type: input.renovationType,
    affectsStructure: input.affectsStructure,
    digsGround: input.digsGround,
  });
  const siteSafety = Scoring.calculateSiteSafety(namSuaChua, input.affectedCungList, level);
  const ownerYear = Scoring.calculateOwnerYearCompatibility(input.namSinh, namSuaChua);
  const nguoi = Scoring.getNguoiTuoi(input.namSinh);
  return { level, siteSafety, ownerYear, nguoi };
}

/** Quét cả khoảng ngày (PHẢI cùng 1 năm dương lịch) × 12 giờ, xếp hạng giảm dần. */
export function calculateSuaChuaCaiTaoNhaRange(input: SuaChuaCaiTaoNhaRangeInput): SuaChuaCaiTaoNhaRangeResult {
  const startMs = Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day);
  const endMs = Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("startDate/endDate không hợp lệ.");
  }
  if (endMs < startMs) {
    throw new Error("endDate phải sau hoặc bằng startDate.");
  }
  if (input.startDate.year !== input.endDate.year) {
    throw new Error("Khoảng ngày phải nằm trong cùng 1 năm dương lịch (Thái Tuế/Tam Sát/Kim Lâu/Hoàng Ốc tính theo năm).");
  }
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) {
    throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính (mỗi ngày quét đủ 12 giờ).`);
  }

  const namSuaChua = input.startDate.year;
  const { level, siteSafety, ownerYear, nguoi } = tinhSiteSafetyVaOwnerYear(input, namSuaChua);
  const cungDongChinh = input.affectedCungList[0]!;

  const toHop: SuaChuaCaiTaoToHop[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    toHop.push(
      ...tinhMotNgay(
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        input.timeZone,
        level,
        nguoi,
        cungDongChinh,
        siteSafety.diem,
        ownerYear.diem,
        siteSafety.phamNghiemTrong,
      ),
    );
  }

  const xepHang = [...toHop].sort((a, b) => b.finalDiem - a.finalDiem);
  return { renovationLevel: level, siteSafety, ownerYear, xepHang };
}

export interface SuaChuaCaiTaoNhaMotNgayInput extends SuaChuaCaiTaoNhaInput {
  solarDate: { year: number; month: number; day: number };
}

/** Đã có sẵn 1 ngày cụ thể — chỉ xếp hạng 12 giờ trong ngày đó. */
export function calculateSuaChuaCaiTaoNhaMotNgay(input: SuaChuaCaiTaoNhaMotNgayInput): SuaChuaCaiTaoToHop[] {
  const { level, siteSafety, ownerYear, nguoi } = tinhSiteSafetyVaOwnerYear(input, input.solarDate.year);
  const cungDongChinh = input.affectedCungList[0]!;
  const toHop = tinhMotNgay(
    input.solarDate.year,
    input.solarDate.month,
    input.solarDate.day,
    input.timeZone,
    level,
    nguoi,
    cungDongChinh,
    siteSafety.diem,
    ownerYear.diem,
    siteSafety.phamNghiemTrong,
  );
  return [...toHop].sort((a, b) => b.finalDiem - a.finalDiem);
}
