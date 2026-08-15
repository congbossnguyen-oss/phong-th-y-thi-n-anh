/**
 * NGÀY KÝ HỢP ĐỒNG — BẢN CAO CẤP (dịch vụ thu phí 299.000đ).
 *
 * Khác bản miễn phí (`ngayKyHopDong.ts`) ở 3 điểm:
 *   1. Nhận ĐỦ ngày-tháng-năm sinh người ký → tính được Nhật Chủ (Can trụ NGÀY sinh) → chạy được
 *      lớp Thập Thần / Thê Tài. Bản miễn phí chỉ có năm sinh nên không làm được lớp này.
 *   2. Có bước LỌC LOẠI (early exit) trước khi chấm điểm: ngày Trực Phá/Bế, Tam Nương, Nguyệt Kỵ,
 *      Sát Chủ, hoặc Lục Xung tuổi người ký bị loại thẳng, không chỉ trừ điểm.
 *   3. Chọn luôn GIỜ ký trong ngày (giờ Hoàng Đạo, không xung tuổi, Tiểu Lục Nhâm tốt).
 */
import { Data } from "@thien-anh/calendar-core";
import { Scoring, TrachNhat } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

type Chi = Data.Chi;
type Can = Data.Can;

/** Trần số ngày quét 1 lần — quét dài hơn thì tách nhiều lượt, tránh treo request. */
const SO_NGAY_TOI_DA = 92;

const CHI_THU_TU: readonly Chi[] = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
];

export interface NgaySinhDayDu {
  year: number;
  month: number;
  day: number;
}

export interface NgayKyHopDongCaoCapInput {
  tuNgay: { year: number; month: number; day: number };
  denNgay: { year: number; month: number; day: number };
  timeZone: string;
  /**
   * Ngày sinh dương lịch ĐẦY ĐỦ của người ký / người chủ trì. Bỏ trống thì vẫn chạy bình thường
   * (chế độ 1 — chấm điểm chung), trọng số tự phân bổ lại cho đủ 100%.
   */
  ngaySinhNguoiKy?: NgaySinhDayDu;
  /** Số ngày tốt nhất muốn lấy ra. */
  soKetQua?: number;
}

export interface GioKyDeXuat {
  chiGio: Chi;
  khungGio: string;
  hoangDao: boolean;
  tenSaoGio: string;
  tieuLucNham: string;
  xungTuoi: boolean;
  diem: number;
}

export interface NgayKyHopDongCaoCapNgay extends Scoring.KyHopDongCaoCapResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  canChiNgay: string;
  /** Giờ đẹp trong ngày — chỉ tính cho các ngày lọt vào danh sách kết quả, để đỡ tốn công. */
  gioDeXuat?: GioKyDeXuat[];
}

export interface NgayKyHopDongCaoCapResult {
  cheDo: "chung" | "theo_nguoi_ky";
  tongSoNgayQuet: number;
  soNgayDung: number;
  ketQua: NgayKyHopDongCaoCapNgay[];
  /** Thống kê lý do bị loại nhiều nhất — để giải thích khi không tìm được ngày nào. */
  lyDoLoaiPhoBien: { lyDo: string; soNgay: number }[];
  thieuDuLieu: string[];
  nhatChu: string | null;
}

/** Khung giờ dân sự của 12 Chi giờ, để hiển thị cho khách. */
const KHUNG_GIO: readonly string[] = [
  "23h–1h", "1h–3h", "3h–5h", "5h–7h", "7h–9h", "9h–11h",
  "11h–13h", "13h–15h", "15h–17h", "17h–19h", "19h–21h", "21h–23h",
];

function laLucXungIndex(a: number, b: number): boolean {
  return Math.abs(a - b) === 6;
}

const CAN_THU_TU: readonly Can[] = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý",
];

/**
 * Vị trí của một trụ Can-Chi trong vòng 60 Giáp Tý.
 *
 * Cần hàm này vì `tinhTuTru` chỉ trả sẵn Nạp Âm của trụ NGÀY, trong khi Nạp Âm MỆNH của một
 * người lấy theo trụ NĂM sinh. Lấy nhầm sang trụ ngày là sai hẳn mệnh của khách.
 */
function chiSoVong60(can: Can, chi: Chi): number {
  const ci = CAN_THU_TU.indexOf(can);
  const zi = CHI_THU_TU.indexOf(chi);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ci && i % 12 === zi) return i;
  }
  throw new Error(`Cặp Can-Chi không hợp lệ: ${can} ${chi}`);
}

/**
 * Chọn giờ ký trong ngày (đặc tả mục 9): giờ Hoàng Đạo, không xung Chi ngày và Chi tuổi người ký,
 * ưu tiên Tiểu Lục Nhâm Đại An/Tốc Hỷ/Tiểu Cát.
 */
function chonGioKy(
  dayChiIndex: number,
  lunarMonth: number,
  lunarDay: number,
  chiNamSinhNguoiKy: Chi | undefined,
): GioKyDeXuat[] {
  const gioCaNgay = TrachNhat.getHoangDaoHacDaoGioCaNgay(dayChiIndex);
  const chiNguoiIndex = chiNamSinhNguoiKy ? CHI_THU_TU.indexOf(chiNamSinhNguoiKy) : -1;

  const ds: GioKyDeXuat[] = gioCaNgay.map((g, hourChiIndex) => {
    const tlnGio = TrachNhat.getTieuLucNham(lunarMonth, lunarDay, hourChiIndex).hour;
    const xungNgay = laLucXungIndex(hourChiIndex, dayChiIndex);
    const xungTuoi = chiNguoiIndex >= 0 && laLucXungIndex(hourChiIndex, chiNguoiIndex);

    // getHoangDaoHacDaoGioCaNgay trả catHung ("cát" = hoàng đạo), không có cờ boolean riêng.
    const laHoangDao = g.catHung === "cát";
    let diem = laHoangDao ? 8 : 4;
    if (["Đại An", "Tốc Hỷ", "Tiểu Cát"].includes(tlnGio.name)) diem += 2;
    if (xungNgay) diem -= 3;
    if (xungTuoi) diem -= 4;

    return {
      chiGio: CHI_THU_TU[hourChiIndex]!,
      khungGio: KHUNG_GIO[hourChiIndex]!,
      hoangDao: laHoangDao,
      tenSaoGio: g.name,
      tieuLucNham: tlnGio.name,
      xungTuoi: xungTuoi || xungNgay,
      diem: Math.max(0, Math.min(10, diem)),
    };
  });

  return ds
    .filter((g) => g.hoangDao && !g.xungTuoi)
    .sort((a, b) => b.diem - a.diem)
    .slice(0, 4);
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  nguoiKy: Scoring.NguoiKyCaoCap | undefined,
): NgayKyHopDongCaoCapNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const chiNgay = tuTru.tuTru.ngay.chi as Chi;
  const canNgay = tuTru.tuTru.ngay.can as Can;

  // Tầng NGÀY của Tiểu Lục Nhâm (tham số giờ chỉ ảnh hưởng tầng `hour`, không ảnh hưởng `day`).
  const tlnNgay = TrachNhat.getTieuLucNham(tuTru.lunarDate.month, tuTru.lunarDate.day, 0).day;

  const dayInput: Scoring.KyHopDongCaoCapDayInput = {
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
    chiNgay,
    canNgay,
    napAmNgay: tuTru.napAmNgay.element,
    tieuLucNham: tlnNgay.name,
  };

  const ketQua = Scoring.calculateKyHopDongCaoCapScore(dayInput, nguoiKy);

  return {
    solarDate: { year, month, day },
    lunarDate: tuTru.lunarDate,
    canChiNgay: `${canNgay} ${chiNgay}`,
    ...ketQua,
  };
}

export function calculateNgayKyHopDongCaoCap(
  input: NgayKyHopDongCaoCapInput,
): NgayKyHopDongCaoCapResult {
  const startMs = Date.UTC(input.tuNgay.year, input.tuNgay.month - 1, input.tuNgay.day);
  const endMs = Date.UTC(input.denNgay.year, input.denNgay.month - 1, input.denNgay.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("Ngày bắt đầu / kết thúc không hợp lệ.");
  }
  if (endMs < startMs) {
    throw new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
  }
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) {
    throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính.`);
  }

  // Nhật Chủ = Can trụ NGÀY sinh (không phải Can năm sinh) — đây là điểm khác cốt lõi so với bản
  // miễn phí, và là thứ khiến lớp Thập Thần chạy được.
  let nguoiKy: Scoring.NguoiKyCaoCap | undefined;
  let nhatChu: string | null = null;
  let chiNamSinh: Chi | undefined;
  if (input.ngaySinhNguoiKy) {
    const ts = input.ngaySinhNguoiKy;
    const tuTruNguoi = tinhTuTru({ solarDate: { year: ts.year, month: ts.month, day: ts.day }, timeZone: input.timeZone });
    chiNamSinh = tuTruNguoi.tuTru.nam.chi as Chi;
    // Nạp Âm MỆNH lấy theo trụ NĂM sinh (không phải trụ ngày như `tuTruNguoi.napAmNgay`).
    const napAmMenh = Data.napAmForCycleIndex(
      chiSoVong60(tuTruNguoi.tuTru.nam.can as Can, chiNamSinh),
    ).element;
    nguoiKy = {
      chiNamSinh,
      canNhatChu: tuTruNguoi.tuTru.ngay.can as Can,
      napAmMenh,
    };
    nhatChu = `${tuTruNguoi.tuTru.ngay.can} ${tuTruNguoi.tuTru.ngay.chi}`;
  }

  const tatCa: NgayKyHopDongCaoCapNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    tatCa.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, nguoiKy));
  }

  const dung = tatCa.filter((n) => !n.biLoai);
  const soKetQua = input.soKetQua ?? 10;
  const ketQua = [...dung].sort((a, b) => b.diem - a.diem).slice(0, soKetQua);

  // Chỉ tính giờ cho các ngày thực sự trả về — quét cả trăm ngày mà ngày nào cũng tính 12 giờ thì
  // tốn công vô ích, khách chỉ xem vài ngày đầu.
  for (const n of ketQua) {
    const tuTru = tinhTuTru({ solarDate: n.solarDate, timeZone: input.timeZone });
    n.gioDeXuat = chonGioKy(tuTru.dayChiIndex, n.lunarDate.month, n.lunarDate.day, chiNamSinh);
  }

  const dem = new Map<string, number>();
  for (const n of tatCa) {
    for (const l of n.lyDoLoai) dem.set(l.moTa, (dem.get(l.moTa) ?? 0) + 1);
  }
  const lyDoLoaiPhoBien = [...dem.entries()]
    .map(([lyDo, soNgayLoai]) => ({ lyDo, soNgay: soNgayLoai }))
    .sort((a, b) => b.soNgay - a.soNgay)
    .slice(0, 5);

  return {
    cheDo: nguoiKy ? "theo_nguoi_ky" : "chung",
    tongSoNgayQuet: soNgay,
    soNgayDung: dung.length,
    ketQua,
    lyDoLoaiPhoBien,
    thieuDuLieu: [...Scoring.THIEU_DU_LIEU_MAC_DINH],
    nhatChu,
  };
}
