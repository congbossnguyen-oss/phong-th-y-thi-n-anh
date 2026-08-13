/**
 * CHỌN NGÀY & GIỜ XUẤT HÀNH CÁ NHÂN – TỔNG HỢP TRẠCH CÁT — quét khoảng ngày × đủ 12 giờ Địa
 * Chi, chấm `dayScore` (rule-engine `xuatHanhCaNhanTongHop.ts`) và `hourScore` (rule-engine
 * `gioTotTrongNgay.ts`, TÁI DÙNG NGUYÊN hàm `calculateHourScore` đã có Tiểu Lục Nhâm + Hoàng
 * Đạo giờ + Giờ↔người, đã kiểm thử qua ~9 module khác) TÁCH BẠCH, rồi gộp:
 *
 *   finalScore = dayScore × 0.45 + hourScore × 0.55 + directionBonus
 *
 * đúng mục 5 và 18 của đặc tả module (không để ngày đẹp cứu giờ xấu và ngược lại).
 *
 * ⚠️ Hướng xuất hành (mục 13): đặc tả gốc muốn tính hướng như "10% trọng số trong hourScore",
 * nhưng `calculateHourScore` là hàm DÙNG CHUNG cho ~9 module khác đang chạy production — sửa
 * chữ ký/trọng số của nó để nhét thêm 1 tham số hướng sẽ rủi ro hồi quy trên toàn bộ các module
 * đó. Thay vào đó, hướng được cộng như một LỚP ĐIỀU CHỈNH RIÊNG (`directionBonus`), CỘNG THÊM
 * (không nhân trọng số) vào finalScore, biên độ giới hạn nhỏ (±1) để không đủ sức lật kết quả từ
 * 1 ngày/giờ xấu sang tốt — nếu không nhập hướng thì `directionBonus = 0` (đúng mục 13: "Không
 * tự đoán hướng người dùng đi").
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";
import { tinhGio12 } from "./gioBang.js";

type Chi = Data.Chi;

const SO_NGAY_TOI_DA = 31; // mỗi ngày quét đủ 12 giờ (tối đa 31×12=372 tổ hợp/lần gọi)

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

export type XuatHanhCaNhanPurpose = Scoring.XuatHanhCaNhanPurpose;
export type HuongXuatHanh = Scoring.HuongXuatHanh;
export type XuatHanhCaNhanGioiTinh = "Nam" | "Nữ";

const DAY_WEIGHT = 0.45;
const HOUR_WEIGHT = 0.55;
const DIRECTION_BONUS_MAX = 1;

function round1(diem: number): number {
  return Math.round(diem * 10) / 10;
}
function clamp(diem: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, diem));
}

export interface XuatHanhCaNhanToHop {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  chiGio: Chi;
  canGio: string;
  khungGio: string;
  dayScore: Scoring.XuatHanhCaNhanDayResult;
  hourScore: Scoring.GioTotResult;
  huong: Scoring.HuongCompatibilityResult | null;
  finalDiem: number;
  hang: Scoring.XuatHanhCaNhanHang;
  nhan: string;
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  purpose: XuatHanhCaNhanPurpose,
  nguoi: Scoring.NguoiTuoi,
  huongResult: Scoring.HuongCompatibilityResult | null,
): XuatHanhCaNhanToHop[] {
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

  const dayScore = Scoring.calculateXuatHanhCaNhanDayScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Chi,
    purpose,
    nguoi,
  );

  const gioPurpose = Scoring.XUAT_HANH_CA_NHAN_TO_GIO_PURPOSE[purpose];
  const nenTrachCatNgayDiem = Scoring.tinhTrachCatDayBase(dayInput, Scoring.GIO_SCORING_RULES.nenTrachCatNgay).diem;

  const gio12 = tinhGio12({
    julianDayNumber: tuTru.julianDayNumber,
    dayChiIndex: tuTru.dayChiIndex,
    lunarMonth: tuTru.lunarDate.month,
    lunarDay: tuTru.lunarDate.day,
  });

  const directionBonus = huongResult ? round1(clamp(((huongResult.diem - 5) / 5) * DIRECTION_BONUS_MAX, -DIRECTION_BONUS_MAX, DIRECTION_BONUS_MAX)) : 0;

  return gio12.map((g, chiIndex) => {
    const hourScore = Scoring.calculateHourScore({
      dayCan: tuTru.tuTru.ngay.can as Data.Can,
      dayChi: tuTru.tuTru.ngay.chi as Chi,
      gioCan: g.canChiGio.can as Data.Can,
      gioChi: g.chiGio as Chi,
      hoangHacGio: g.hoangDaoHacDaoGio,
      tieuLucNhamGio: g.tieuLucNhamGio,
      nenTrachCatNgayDiem,
      purpose: gioPurpose,
      nguoi,
    });

    const finalDiem = round1(clamp(dayScore.diem * DAY_WEIGHT + hourScore.diem * HOUR_WEIGHT + directionBonus, 0, 10));
    const hang = Scoring.getXuatHanhCaNhanRating(finalDiem);

    return {
      solarDate: { year, month, day },
      lunarDate: tuTru.lunarDate,
      chiGio: g.chiGio as Chi,
      canGio: g.canChiGio.can,
      khungGio: KHUNG_GIO[chiIndex]!,
      dayScore,
      hourScore,
      huong: huongResult,
      finalDiem,
      hang,
      nhan: Scoring.xuatHanhCaNhanNhan(finalDiem),
    };
  });
}

function chuanBiNguoiVaHuong(namSinh: number, gioiTinh: XuatHanhCaNhanGioiTinh, huong: HuongXuatHanh | undefined) {
  if (!Number.isInteger(namSinh) || namSinh < 1900 || namSinh > 2100) {
    throw new Error("Năm sinh không hợp lệ.");
  }
  const nguoi = Scoring.getNguoiTuoi(namSinh);
  const huongResult = huong ? Scoring.calculateHuongCompatibility(namSinh, gioiTinh === "Nam" ? "nam" : "nu", huong) : null;
  return { nguoi, huongResult };
}

export interface XuatHanhCaNhanRangeInput {
  namSinh: number;
  gioiTinh: XuatHanhCaNhanGioiTinh;
  purpose: XuatHanhCaNhanPurpose;
  huong?: HuongXuatHanh | undefined;
  timeZone: string;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
}

export interface XuatHanhCaNhanRangeResult {
  purpose: XuatHanhCaNhanPurpose;
  huong: HuongXuatHanh | null;
  xepHang: XuatHanhCaNhanToHop[];
}

/** Chế độ "Tìm ngày + giờ" (mục 26 đặc tả) — quét cả khoảng ngày × 12 giờ, trả về xếp hạng giảm dần. */
export function calculateXuatHanhCaNhanRange(input: XuatHanhCaNhanRangeInput): XuatHanhCaNhanRangeResult {
  const startMs = Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day);
  const endMs = Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("startDate/endDate không hợp lệ.");
  }
  if (endMs < startMs) {
    throw new Error("endDate phải sau hoặc bằng startDate.");
  }
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) {
    throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính (mỗi ngày quét đủ 12 giờ).`);
  }

  const { nguoi, huongResult } = chuanBiNguoiVaHuong(input.namSinh, input.gioiTinh, input.huong);

  const toHop: XuatHanhCaNhanToHop[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    toHop.push(...tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.purpose, nguoi, huongResult));
  }

  const xepHang = [...toHop].sort((a, b) => b.finalDiem - a.finalDiem);
  return { purpose: input.purpose, huong: input.huong ?? null, xepHang };
}

export interface XuatHanhCaNhanMotNgayInput {
  namSinh: number;
  gioiTinh: XuatHanhCaNhanGioiTinh;
  purpose: XuatHanhCaNhanPurpose;
  huong?: HuongXuatHanh | undefined;
  timeZone: string;
  solarDate: { year: number; month: number; day: number };
}

/** Chế độ "Chỉ xem giờ" (mục 25 đặc tả) — đã chọn sẵn 1 ngày, chỉ xếp hạng 12 giờ trong ngày đó. */
export function calculateXuatHanhCaNhanMotNgay(input: XuatHanhCaNhanMotNgayInput): XuatHanhCaNhanToHop[] {
  const { nguoi, huongResult } = chuanBiNguoiVaHuong(input.namSinh, input.gioiTinh, input.huong);
  const toHop = tinhMotNgay(
    input.solarDate.year,
    input.solarDate.month,
    input.solarDate.day,
    input.timeZone,
    input.purpose,
    nguoi,
    huongResult,
  );
  return [...toHop].sort((a, b) => b.finalDiem - a.finalDiem);
}
