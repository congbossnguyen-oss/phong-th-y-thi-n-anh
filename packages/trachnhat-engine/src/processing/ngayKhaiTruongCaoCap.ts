/**
 * NGÀY KHAI TRƯƠNG CAO CẤP — quét khoảng ngày, chấm NỀN bằng đúng hàm bản thường
 * (`Scoring.calculateKhaiTruongScore`), rồi chồng lớp Bát Tự mệnh chủ
 * (`Scoring.calculateKhaiTruongCaoCapScore`). Xếp hạng theo điểm TỔNG (nền 65% + Bát Tự 35%).
 *
 * BAO TRÙM: điểm nền của 1 ngày ở bản cao cấp = bản thường (gọi lại cùng hàm). Ngày bị bản thường
 * loại (xung tuổi chủ) → cao cấp cũng loại.
 */
import { getCanChi, type Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export interface NgayKhaiTruongCaoCapInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Ngày sinh dương lịch chủ — bỏ trống → chạy y hệt bản thường (không có lớp Bát Tự). */
  chuNgaySinh?: { year: number; month: number; day: number };
  /** Giờ sinh chủ 0-23 — có → bật thêm Lõi 3 (Dụng Thần/vượng suy). */
  chuGioSinh?: number;
}

export interface NgayKhaiTruongCaoCapNgay {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  canChiNgay: string;
  diemNen: number;
  diemBatTu: number;
  diemTong: number;
  hang: string;
  thapThan: string | null;
  yeuTo: string[];
}

export interface NgayKhaiTruongCaoCapResult {
  cheDo: "co-ban" | "cao-cap"; // cao-cap khi có nhập ngày sinh chủ
  nhatChu: string | null; // Can Chi ngày sinh chủ (Nhật Chủ) — null nếu chưa nhập
  vuongSuy: string | null; // "vượng"/"nhược"/null (thiếu giờ)
  ngayXepHang: NgayKhaiTruongCaoCapNgay[];
  thieuDuLieu: string[];
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  chu: Scoring.NguoiTuoi | undefined,
  nguoiChu: Scoring.NguoiChuKhaiTruong | null,
): { ngay: NgayKhaiTruongCaoCapNgay; xungTuoiNen: boolean } {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const dayCan = tuTru.tuTru.ngay.can as Data.Can;
  const dayChi = tuTru.tuTru.ngay.chi as Data.Chi;

  const dayInput = {
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

  // NỀN — gọi đúng hàm bản thường (điểm nền trùng khít bản thường).
  const base = Scoring.calculateKhaiTruongScore(dayInput, dayCan, dayChi, tuTru.napAmNgay.element, chu);
  // Ràng buộc đồng bộ: ngày xung Chi năm tuổi chủ bị bản thường loại → cao cấp cũng loại.
  const xungTuoiNen = !!base.tuoiChu?.chi.xung;

  // CAO CẤP — chồng lớp Bát Tự.
  const cao = Scoring.calculateKhaiTruongCaoCapScore(base, dayCan, dayChi, nguoiChu);

  return {
    ngay: {
      solarDate: { year, month, day },
      lunarDate: tuTru.lunarDate,
      canChiNgay: `${dayCan} ${dayChi}`,
      diemNen: cao.diemNen,
      diemBatTu: cao.diemBatTu,
      diemTong: cao.diemTong,
      hang: base.hang,
      thapThan: cao.thapThan,
      yeuTo: cao.yeuTo,
    },
    xungTuoiNen,
  };
}

export function calculateNgayKhaiTruongCaoCap(input: NgayKhaiTruongCaoCapInput): NgayKhaiTruongCaoCapResult {
  const startMs = Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day);
  const endMs = Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) throw new Error("startDate/endDate không hợp lệ.");
  if (endMs < startMs) throw new Error("endDate phải sau hoặc bằng startDate.");
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính.`);

  const thieuDuLieu: string[] = [];
  let chu: Scoring.NguoiTuoi | undefined;
  let nguoiChu: Scoring.NguoiChuKhaiTruong | null = null;
  let nhatChu: string | null = null;
  let vuongSuyStr: string | null = null;

  if (input.chuNgaySinh) {
    const c = input.chuNgaySinh;
    chu = Scoring.getNguoiTuoi(c.year);
    // Tứ Trụ chủ đầy đủ (có giờ nếu nhập) qua calendar-core.
    const coGio = Number.isInteger(input.chuGioSinh) && input.chuGioSinh! >= 0 && input.chuGioSinh! <= 23;
    const tt = getCanChi({ year: c.year, month: c.month, day: c.day, hour: coGio ? input.chuGioSinh! : 12, timeZone: input.timeZone });
    const tuTruChu = {
      canNam: tt.year.can as Data.Can, chiNam: tt.year.chi as Data.Chi,
      canThang: tt.month.can as Data.Can, chiThang: tt.month.chi as Data.Chi,
      canNgay: tt.day.can as Data.Can, chiNgay: tt.day.chi as Data.Chi,
      ...(coGio ? { canGio: tt.hour.can as Data.Can, chiGio: tt.hour.chi as Data.Chi } : {}),
    };
    const vs = Scoring.xacDinhVuongSuy(tuTruChu);
    vuongSuyStr = vs?.vuongSuy ?? null;
    nhatChu = `${tt.day.can} ${tt.day.chi}`;
    nguoiChu = {
      canNhatChu: tt.day.can as Data.Can,
      chiNamSinh: tt.year.chi as Data.Chi,
      chiNgaySinh: tt.day.chi as Data.Chi,
      vuongSuy: vs?.vuongSuy ?? null,
    };
    if (!coGio) thieuDuLieu.push("Chưa nhập giờ sinh chủ — chưa chạy Lõi 3 Dụng Thần (vượng suy), chỉ chạy Lõi 1-2.");
  }

  const days: NgayKhaiTruongCaoCapNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    const { ngay, xungTuoiNen } = tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, chu, nguoiChu);
    // Ngày xung Chi năm tuổi chủ bị bản thường loại → cao cấp cũng loại (chỉ khi có tuổi chủ).
    if (chu && xungTuoiNen) continue;
    days.push(ngay);
  }

  const ngayXepHang = days.sort((a, b) => b.diemTong - a.diemTong);
  return {
    cheDo: input.chuNgaySinh ? "cao-cap" : "co-ban",
    nhatChu,
    vuongSuy: vuongSuyStr,
    ngayXepHang,
    thieuDuLieu,
  };
}
