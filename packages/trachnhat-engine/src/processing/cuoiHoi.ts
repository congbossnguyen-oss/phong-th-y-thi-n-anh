/**
 * MODULE CƯỚI HỎI — facade quét khoảng ngày cho một nghi lễ, chấm điểm và xếp hạng.
 *
 * Vai trò: nhận năm sinh cô dâu/chú rể + khoảng ngày + nghi lễ, quét từng ngày, tính mọi Can Chi /
 * hoàng đạo / trực / thần sát / tiết khí THẬT rồi gọi các hàm thuần trong `CuoiHoi.*` để chấm.
 *
 * ⚠️ Dùng lại toàn bộ tầng dùng chung (Scoring, TrachNhat, getSolarTerms) — không số hoá lại. Xem
 * ghi chú khảo sát ở `packages/rule-engine/src/cuoi-hoi/cuoiHoi.ts`.
 */
import { getSolarTerms, getSolarDateFromLunar, getLunarDate, type Data } from "@thien-anh/calendar-core";
import { CuoiHoi, Scoring } from "@thien-anh/rule-engine";
import { tinhTuTru } from "./tuTru.js";
import { tinhNgayInfo } from "./ngayInfo.js";

type Chi = Data.Chi;

/** Quét tối đa để tránh vòng lặp quá dài; đủ cho một mùa cưới. */
const SO_NGAY_TOI_DA = 120;

/** Trực coi là "tốt cho cưới hỏi": nhóm Thành/Khai/Mãn/Bình/Định (loại Phá/Bế/Kiến…). */
const TRUC_TOT_CUOI_HOI = new Set(["Thành", "Khai", "Mãn", "Bình", "Định"]);

export interface CuoiHoiRangeInput {
  namSinhCoDau: number;
  namSinhChuRe: number;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  nghiLe: CuoiHoi.NghiLeCuoiHoi;
  uuTien?: CuoiHoi.UuTienCuoiHoi;
  timeZone: string;
  /** Số ngày trả về sau xếp hạng, mặc định 5. */
  soNgayTraVe?: number;
}

export interface CuoiHoiNgay {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  chiNgay: Chi;
  diemCoDau: number;
  diemChuRe: number;
  diemCapDoi: number;
  hang: CuoiHoi.HangCuoiHoi;
  tenHang: string;
  canhBao: string[];
  catTinhMoTa: string[];
}

export interface CuoiHoiRangeResult {
  nghiLe: CuoiHoi.NghiLeCuoiHoi;
  tenNghiLe: string;
  ngayXepHang: CuoiHoiNgay[];
  /** Số ngày bị loại thẳng (đại kỵ) — để hiển thị "đã loại N ngày phạm đại kỵ". */
  soNgayBiLoai: number;
  /** Các mục engine chưa tính được vì thiếu dữ liệu — nói thẳng, không giấu. */
  thieuDuLieu: readonly string[];
}

/** Tìm Tiết (節) gần nhất ≤ jdn và số ngày kể từ đó (ngày vào tiết = ngày 1) — cho Khí Vãng Vong. */
function tietVaNgayThu(namDuong: number, jdn: number): { tiet: string; ngayThu: number } | null {
  const terms = [...getSolarTerms(namDuong - 1), ...getSolarTerms(namDuong)]
    .filter((t) => t.kind === "tiet") // chỉ 12 Tiết, không lấy Trung Khí
    .sort((a, b) => a.julianDay - b.julianDay);
  let current: { jd: number; name: string } | null = null;
  for (const t of terms) {
    if (Math.floor(t.julianDay) > jdn) break;
    current = { jd: Math.floor(t.julianDay), name: t.name };
  }
  if (!current) return null;
  return { tiet: current.name, ngayThu: jdn - current.jd + 1 };
}

/**
 * Tháng âm này ĐỦ (30 ngày) hay THIẾU (29 ngày) — cần cho Chu Đường.
 *
 * Cách xác định không suy đoán: lấy ngày dương của mùng 1 tháng âm này, cộng 29 ngày, rồi đọc lại
 * lịch âm. Nếu ra ngày 30 (cùng tháng) → tháng đủ; nếu đã sang mùng 1 tháng sau → tháng thiếu.
 */
function laThangDu(lunar: { year: number; month: number; day: number; isLeapMonth: boolean }, timeZone: string): boolean {
  const mung1 = getSolarDateFromLunar({ year: lunar.year, month: lunar.month, day: 1, isLeapMonth: lunar.isLeapMonth }, timeZone);
  const jdMung1 = Date.UTC(mung1.year, mung1.month - 1, mung1.day);
  const sau29 = new Date(jdMung1 + 29 * 86_400_000);
  const lunarSau29 = getLunarDate({ year: sau29.getUTCFullYear(), month: sau29.getUTCMonth() + 1, day: sau29.getUTCDate(), hour: 12, timeZone });
  return lunarSau29.day === 30;
}

export function calculateCuoiHoiRange(input: CuoiHoiRangeInput): CuoiHoiRangeResult {
  const coDau = Scoring.getNguoiTuoi(input.namSinhCoDau);
  const chuRe = Scoring.getNguoiTuoi(input.namSinhChuRe);

  const start = new Date(Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day));
  const end = new Date(Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day));
  const soNgay = Math.min(SO_NGAY_TOI_DA, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);

  const ngayXepHang: CuoiHoiNgay[] = [];
  let soNgayBiLoai = 0;

  for (let i = 0; i < soNgay; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    const solarDate = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    const tuTru = tinhTuTru({ solarDate, timeZone: input.timeZone });
    const ngayInfo = tinhNgayInfo(tuTru);

    const chiNgay = tuTru.tuTru.ngay.chi as Chi;
    const dayCan = tuTru.tuTru.ngay.can as Data.Can;

    const diemNgayCoDau = Scoring.calculateXuatHanhCaNhanDayPersonal(coDau, dayCan, chiNgay).diem;
    const diemNgayChuRe = Scoring.calculateXuatHanhCaNhanDayPersonal(chuRe, dayCan, chiNgay).diem;

    const thangDu = laThangDu(tuTru.lunarDate, input.timeZone);
    const tiet = tietVaNgayThu(solarDate.year, tuTru.julianDayNumber);

    const kq = CuoiHoi.chamDiemNgayCuoiHoi(
      {
        chiNgay,
        diemNgayCoDau,
        diemNgayChuRe,
        hoangDao: ngayInfo.hoangDaoHacDaoNgay === "hoàng đạo",
        trucTot: TRUC_TOT_CUOI_HOI.has(ngayInfo.truc.name),
        tuCat: ngayInfo.nhiThapBatTu.catHung === "cát",
        catTinhCoMat: ngayInfo.thanSat.filter((t) => t.catHung === "cát").map((t) => t.name),
        thanSatCoMat: ngayInfo.thanSat.map((t) => t.name),
        chiNamCoDau: coDau.chi,
        chiNamChuRe: chuRe.chi,
        chiNamXet: tuTru.tuTru.nam.chi as Chi,
        chiNamSinhChuRe: chuRe.chi,
        ngayAmLich: tuTru.lunarDate.day,
        thangDu,
        ...(tiet ? { tietKhi: tiet.tiet, ngayThuTuTiet: tiet.ngayThu } : {}),
      },
      input.nghiLe,
      input.uuTien ?? "can-bang",
    );

    if (kq.loai) {
      soNgayBiLoai++;
      continue;
    }

    ngayXepHang.push({
      solarDate,
      lunarDate: tuTru.lunarDate,
      chiNgay,
      diemCoDau: kq.diemCoDau,
      diemChuRe: kq.diemChuRe,
      diemCapDoi: kq.diemCapDoi,
      hang: kq.hang,
      tenHang: CuoiHoi.TEN_HANG[kq.hang],
      canhBao: kq.canhBao,
      catTinhMoTa: kq.catTinh.moTa,
    });
  }

  ngayXepHang.sort((a, b) => b.diemCapDoi - a.diemCapDoi);

  return {
    nghiLe: input.nghiLe,
    tenNghiLe: CuoiHoi.TEN_NGHI_LE[input.nghiLe],
    ngayXepHang: ngayXepHang.slice(0, input.soNgayTraVe ?? 5),
    soNgayBiLoai,
    thieuDuLieu: CuoiHoi.THIEU_DU_LIEU_CUOI_HOI,
  };
}
