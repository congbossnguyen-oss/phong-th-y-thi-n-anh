/**
 * MODULE CƯỚI HỎI — facade quét khoảng ngày cho một nghi lễ, chấm điểm và xếp hạng.
 *
 * Vai trò: nhận năm sinh cô dâu/chú rể + khoảng ngày + nghi lễ, quét từng ngày, tính mọi Can Chi /
 * hoàng đạo / trực / thần sát / tiết khí THẬT rồi gọi các hàm thuần trong `CuoiHoi.*` để chấm.
 *
 * ⚠️ Dùng lại toàn bộ tầng dùng chung (Scoring, TrachNhat, getSolarTerms) — không số hoá lại. Xem
 * ghi chú khảo sát ở `packages/rule-engine/src/cuoi-hoi/cuoiHoi.ts`.
 */
import { getSolarTerms, getSolarDateFromLunar, getLunarDate, Data } from "@thien-anh/calendar-core";
import { CuoiHoi, Scoring, TrachNhat } from "@thien-anh/rule-engine";
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

/** Khung giờ dương lịch của 12 giờ Địa Chi (index 0=Tý ... 11=Hợi). */
const KHUNG_GIO: readonly string[] = [
  "23:00–01:00", "01:00–03:00", "03:00–05:00", "05:00–07:00",
  "07:00–09:00", "09:00–11:00", "11:00–13:00", "13:00–15:00",
  "15:00–17:00", "17:00–19:00", "19:00–21:00", "21:00–23:00",
];

export interface CuoiHoiGioInput {
  namSinhCoDau: number;
  namSinhChuRe: number;
  /** Ngày cưới đã chọn (dương lịch) — thường là một ngày lấy từ kết quả tầng ngày. */
  solarDate: { year: number; month: number; day: number };
  nghiLe: CuoiHoi.NghiLeCuoiHoi;
  uuTien?: CuoiHoi.UuTienCuoiHoi;
  timeZone: string;
  /** Số giờ trả về sau xếp hạng, mặc định 12 (đủ cả ngày). */
  soGioTraVe?: number;
}

export interface CuoiHoiGio {
  chiGio: Chi;
  khungGio: string;
  diemCoDau: number;
  diemChuRe: number;
  /** Điểm cặp đôi chỉ tính riêng phần GIỜ (0-10). */
  diemGio: number;
  /** Điểm tổng hợp đã gộp ngày + giờ theo tỷ trọng nghi lễ (0-10). */
  diemTongHop: number;
  hang: CuoiHoi.HangCuoiHoi;
  tenHang: string;
  ghiChu: string[];
}

export interface CuoiHoiGioResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  chiNgay: Chi;
  tenNghiLe: string;
  /** Điểm cặp đôi của NGÀY (0-10) — nền để gộp với từng giờ. */
  diemNgay: number;
  /** Ngày này có phạm đại kỵ (loại thẳng ở tầng ngày) không — để cảnh báo. */
  ngayBiLoai: boolean;
  lyDoLoaiNgay: string[];
  /** Cảnh báo của ngày (Chu Đường / Hoà Thượng Sát / Khí Vãng Vong — chỉ thành hôn). */
  canhBaoNgay: string[];
  gioXepHang: CuoiHoiGio[];
}

/**
 * Chấm điểm 12 giờ trong một ngày cưới đã chọn, gộp với điểm ngày → điểm tổng hợp.
 *
 * Dùng cho tầng "chọn giờ" sau khi khách đã chọn được ngày ở tầng trước. Mọi Can Chi / hoàng đạo
 * giờ / Tiểu Lục Nhâm tính THẬT rồi gọi hàm thuần `CuoiHoi.chamDiemGioCuoiHoi`.
 */
export function calculateGioCuoiHoi(input: CuoiHoiGioInput): CuoiHoiGioResult {
  const coDau = Scoring.getNguoiTuoi(input.namSinhCoDau);
  const chuRe = Scoring.getNguoiTuoi(input.namSinhChuRe);
  const uuTien = input.uuTien ?? "can-bang";

  const tuTru = tinhTuTru({ solarDate: input.solarDate, timeZone: input.timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);

  const chiNgay = tuTru.tuTru.ngay.chi as Chi;
  const dayCan = tuTru.tuTru.ngay.can as Data.Can;
  const chiNgayIndex = Data.CHI.indexOf(chiNgay);

  // ── Điểm NGÀY (tái dùng đúng tầng ngày để làm nền gộp) ──
  const diemNgayCoDau = Scoring.calculateXuatHanhCaNhanDayPersonal(coDau, dayCan, chiNgay).diem;
  const diemNgayChuRe = Scoring.calculateXuatHanhCaNhanDayPersonal(chuRe, dayCan, chiNgay).diem;
  const thangDu = laThangDu(tuTru.lunarDate, input.timeZone);
  const tiet = tietVaNgayThu(input.solarDate.year, tuTru.julianDayNumber);

  const kqNgay = CuoiHoi.chamDiemNgayCuoiHoi(
    {
      chiNgay,
      diemNgayCoDau,
      diemNgayChuRe,
      hoangDao: ngayInfo.hoangDaoHacDaoNgay === "hoàng đạo",
      trucTot: ["Thành", "Khai", "Mãn", "Bình", "Định"].includes(ngayInfo.truc.name),
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
    uuTien,
  );

  // ── 12 GIỜ ──
  const gioXepHang: CuoiHoiGio[] = [];
  for (let h = 0; h < 12; h++) {
    const chiGio = Data.CHI[h]!;
    const hoangDaoCat = TrachNhat.getHoangDaoHacDaoGio(chiNgayIndex, h).catHung === "cát";
    const tieuLucNhamCat = TrachNhat.getTieuLucNham(tuTru.lunarDate.month, tuTru.lunarDate.day, h).hour.catHung === "cát";

    const kqGio = CuoiHoi.chamDiemGioCuoiHoi(
      { chiGio, chiNamCoDau: coDau.chi, chiNamChuRe: chuRe.chi, hoangDaoCat, tieuLucNhamCat },
      uuTien,
    );

    const diemTongHop = CuoiHoi.ketHopNgayGio(kqNgay.diemCapDoi, kqGio.diemCapDoi, input.nghiLe);
    gioXepHang.push({
      chiGio,
      khungGio: KHUNG_GIO[h]!,
      diemCoDau: kqGio.diemCoDau,
      diemChuRe: kqGio.diemChuRe,
      diemGio: kqGio.diemCapDoi,
      diemTongHop,
      hang: CuoiHoi.xepHangCuoiHoi(diemTongHop),
      tenHang: CuoiHoi.TEN_HANG[CuoiHoi.xepHangCuoiHoi(diemTongHop)],
      ghiChu: kqGio.ghiChu,
    });
  }

  gioXepHang.sort((a, b) => b.diemTongHop - a.diemTongHop);

  return {
    solarDate: input.solarDate,
    lunarDate: tuTru.lunarDate,
    chiNgay,
    tenNghiLe: CuoiHoi.TEN_NGHI_LE[input.nghiLe],
    diemNgay: kqNgay.diemCapDoi,
    ngayBiLoai: kqNgay.loai,
    lyDoLoaiNgay: kqNgay.lyDoLoai,
    canhBaoNgay: kqNgay.canhBao,
    gioXepHang: gioXepHang.slice(0, input.soGioTraVe ?? 12),
  };
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// LỊCH CƯỚI HỎI TRỌN GÓI — chọn ngày + giờ cho cả chuỗi 4 nghi lễ, sắp theo trình tự thời gian.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** Thứ tự nghi lễ trong một chuỗi cưới hỏi truyền thống. */
const THU_TU_NGHI_LE: readonly CuoiHoi.NghiLeCuoiHoi[] = ["an-hoi", "don-dau", "thanh-hon", "dang-ky-ket-hon"];

export interface LichCuoiHoiInput {
  namSinhCoDau: number;
  namSinhChuRe: number;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  uuTien?: CuoiHoi.UuTienCuoiHoi;
  timeZone: string;
}

export interface LichCuoiHoiMuc {
  nghiLe: CuoiHoi.NghiLeCuoiHoi;
  tenNghiLe: string;
  solarDate: { year: number; month: number; day: number } | null;
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean } | null;
  chiNgay: Chi | null;
  diemNgay: number;
  hang: CuoiHoi.HangCuoiHoi | null;
  tenHang: string;
  /** Tối đa 3 giờ đẹp nhất trong ngày đã chọn. */
  gioTot: { chiGio: Chi; khungGio: string; diem: number; tenHang: string }[];
  canhBao: string[];
  /** Không tìm được ngày phù hợp trong khoảng (vd sau ăn hỏi không còn ngày đẹp). */
  khongCoNgay: boolean;
}

export interface LichCuoiHoiResult {
  muc: LichCuoiHoiMuc[];
  ghiChu: string[];
}

function soSanhNgay(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }): number {
  return Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day);
}

/**
 * Lập lịch trọn gói: tìm ngày + giờ đẹp nhất cho từng nghi lễ, ràng buộc trình tự thời gian —
 * ăn hỏi trước; đón dâu / thành hôn phải cùng ngày hoặc sau ăn hỏi; đăng ký kết hôn linh hoạt
 * (chọn ngày đẹp nhất toàn khoảng vì mang tính thủ tục hành chính).
 *
 * Ngày phạm đại kỵ đã bị loại sẵn ở tầng ngày nên không bao giờ lọt vào lịch.
 */
export function calculateLichCuoiHoi(input: LichCuoiHoiInput): LichCuoiHoiResult {
  const uuTien = input.uuTien ?? "can-bang";
  const baseRange = { namSinhCoDau: input.namSinhCoDau, namSinhChuRe: input.namSinhChuRe, startDate: input.startDate, endDate: input.endDate, uuTien, timeZone: input.timeZone };

  // Lấy toàn bộ ngày đạt (đã lọc đại kỵ), xếp theo điểm giảm dần, cho từng nghi lễ.
  const xepHangTheoNghiLe = new Map<CuoiHoi.NghiLeCuoiHoi, CuoiHoiNgay[]>();
  for (const nghiLe of THU_TU_NGHI_LE) {
    const r = calculateCuoiHoiRange({ ...baseRange, nghiLe, soNgayTraVe: 400 });
    xepHangTheoNghiLe.set(nghiLe, r.ngayXepHang);
  }

  // Chọn ngày tốt nhất cho một nghi lễ (danh sách đã xếp theo điểm giảm dần).
  const totNhat = (nghiLe: CuoiHoi.NghiLeCuoiHoi): CuoiHoiNgay | null => (xepHangTheoNghiLe.get(nghiLe) ?? [])[0] ?? null;
  // Ngày tốt nhất phải SỚM HƠN HẲN một mốc (cho ăn hỏi phải trước ngày cưới).
  const totNhatTruoc = (nghiLe: CuoiHoi.NghiLeCuoiHoi, moc: { year: number; month: number; day: number }): CuoiHoiNgay | null =>
    (xepHangTheoNghiLe.get(nghiLe) ?? []).find((n) => soSanhNgay(n.solarDate, moc) < 0) ?? null;
  // Bản ghi của một nghi lễ đúng vào một ngày cụ thể (cho đón dâu = cùng ngày thành hôn).
  const dungNgay = (nghiLe: CuoiHoi.NghiLeCuoiHoi, ngay: { year: number; month: number; day: number }): CuoiHoiNgay | null =>
    (xepHangTheoNghiLe.get(nghiLe) ?? []).find((n) => soSanhNgay(n.solarDate, ngay) === 0) ?? null;

  // 1) Ngày cưới = ngày tốt nhất cho THÀNH HÔN (mốc chính của cả chuỗi).
  const thanhHon = totNhat("thanh-hon");
  // 2) Đón dâu = cùng ngày cưới (buổi sáng cùng ngày); nếu ngày đó đại kỵ với đón dâu thì lấy ngày đón dâu tốt nhất.
  const donDau = thanhHon ? (dungNgay("don-dau", thanhHon.solarDate) ?? totNhat("don-dau")) : totNhat("don-dau");
  // 3) Ăn hỏi = ngày tốt nhất TRƯỚC ngày cưới; nếu khoảng không còn ngày trước thì lấy tốt nhất toàn khoảng.
  const anHoi = thanhHon ? (totNhatTruoc("an-hoi", thanhHon.solarDate) ?? totNhat("an-hoi")) : totNhat("an-hoi");
  // 4) Đăng ký kết hôn = thủ tục, chọn ngày đẹp nhất toàn khoảng.
  const dangKy = totNhat("dang-ky-ket-hon");

  const daChon: Record<CuoiHoi.NghiLeCuoiHoi, CuoiHoiNgay | null> = {
    "an-hoi": anHoi,
    "don-dau": donDau,
    "thanh-hon": thanhHon,
    "dang-ky-ket-hon": dangKy,
  };

  const muc: LichCuoiHoiMuc[] = THU_TU_NGHI_LE.map((nghiLe) => {
    const ngay = daChon[nghiLe];
    if (!ngay) {
      return {
        nghiLe,
        tenNghiLe: CuoiHoi.TEN_NGHI_LE[nghiLe],
        solarDate: null, lunarDate: null, chiNgay: null,
        diemNgay: 0, hang: null, tenHang: "",
        gioTot: [], canhBao: [], khongCoNgay: true,
      };
    }
    const gio = calculateGioCuoiHoi({
      namSinhCoDau: input.namSinhCoDau,
      namSinhChuRe: input.namSinhChuRe,
      solarDate: ngay.solarDate,
      nghiLe,
      uuTien,
      timeZone: input.timeZone,
    });
    return {
      nghiLe,
      tenNghiLe: CuoiHoi.TEN_NGHI_LE[nghiLe],
      solarDate: ngay.solarDate,
      lunarDate: ngay.lunarDate,
      chiNgay: ngay.chiNgay,
      diemNgay: ngay.diemCapDoi,
      hang: ngay.hang,
      tenHang: ngay.tenHang,
      gioTot: gio.gioXepHang.slice(0, 3).map((g) => ({ chiGio: g.chiGio, khungGio: g.khungGio, diem: g.diemTongHop, tenHang: g.tenHang })),
      canhBao: ngay.canhBao,
      khongCoNgay: false,
    };
  });

  // Sắp theo trình tự thời gian: nghi lễ có ngày đứng trước; nghi lễ không có ngày xuống cuối.
  muc.sort((a, b) => {
    if (!a.solarDate) return 1;
    if (!b.solarDate) return -1;
    return soSanhNgay(a.solarDate, b.solarDate);
  });

  const ghiChu: string[] = [
    "Đón dâu và thành hôn thường diễn ra cùng một ngày (đón dâu buổi sáng, thành hôn trong ngày) — nếu hai ngày trùng nhau là hợp lệ.",
    "Đăng ký kết hôn mang tính thủ tục nên chọn ngày đẹp nhất toàn khoảng, không ràng buộc trước/sau lễ.",
  ];

  return { muc, ghiChu };
}
