/**
 * NGÀY GIỜ NHẬN CHỨC — dịch vụ VIP (thu phí).
 *
 * Tầng "processing" ghép Calendar Core + rule-engine (`Scoring.calculateNhanChucScore`) theo đúng
 * quy trình mục 21 (chọn ngày) và mục 22 (chọn giờ) của FINAL SPEC v2.0.
 *
 * Kiến trúc bám sát `ngayKyHopDongCaoCap.ts` (module VIP chị em) — không tạo hệ lịch riêng, gọi
 * lại `tinhTuTru`/`tinhNgayInfo` đã có. Toàn bộ quy tắc cát hung nằm ở rule-engine; file này chỉ
 * lặp ngày, gom kết quả, chọn giờ và xếp hạng.
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
const CAN_THU_TU: readonly Can[] = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý",
];

/** Khung giờ dân sự của 12 Chi giờ, để hiển thị cho khách. */
const KHUNG_GIO: readonly string[] = [
  "23h–1h", "1h–3h", "3h–5h", "5h–7h", "7h–9h", "9h–11h",
  "11h–13h", "13h–15h", "15h–17h", "17h–19h", "19h–21h", "21h–23h",
];

export interface NgaySinhDayDu {
  year: number;
  month: number;
  day: number;
}

export interface NhanChucInput {
  tuNgay: { year: number; month: number; day: number };
  denNgay: { year: number; month: number; day: number };
  timeZone: string;
  /**
   * Ngày sinh dương lịch ĐẦY ĐỦ của người nhận chức. Bỏ trống thì module vẫn chạy (mục 2, mục 35:
   * "không có giờ sinh vẫn phải chạy") — chỉ mất lớp Thập Thần và tuổi/mệnh.
   */
  ngaySinhNguoiNhanChuc?: NgaySinhDayDu;
  /** Tên chức vụ (hiển thị, không ảnh hưởng tính toán). */
  tenChucVu?: string;
  /** Số ngày tốt nhất muốn lấy ra (mục 27: TOP 1..5). */
  soKetQua?: number;
  /**
   * Mục 29 — giữ khung giờ, chỉ chọn ngày có giờ tốt trong khung (24h). VD `{start:9, end:11}`.
   * Bỏ trống thì không lọc theo khung.
   */
  khungGioUuTien?: { start: number; end: number };
}

export interface GioNhanChucDeXuat {
  chiGio: Chi;
  khungGio: string;
  hoangDao: boolean;
  tenSaoGio: string;
  tieuLucNham: string;
  xungTuoi: boolean;
  diem: number;
}

export interface NhanChucNgay extends Scoring.NhanChucResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  canChiNgay: string;
  /** Giờ đẹp trong ngày — chỉ tính cho các ngày lọt vào danh sách kết quả, để đỡ tốn công. */
  gioDeXuat?: GioNhanChucDeXuat[];
}

export interface NhanChucResult {
  cheDo: "chung" | "theo_nguoi_nhan_chuc";
  tenChucVu: string | null;
  tongSoNgayQuet: number;
  soNgayDung: number;
  ketQua: NhanChucNgay[];
  /** Thống kê lý do bị loại nhiều nhất — để giải thích khi không tìm được ngày nào (mục 26). */
  lyDoLoaiPhoBien: { lyDo: string; soNgay: number }[];
  /** Gộp cảnh báo PENDING_CONFIRMATION (mục 4) từ mọi ngày trong kết quả — hiển thị minh bạch. */
  canXacNhan: string[];
  thieuDuLieu: string[];
  nhatChu: string | null;
}

function laLucXungIndex(a: number, b: number): boolean {
  return Math.abs(a - b) === 6;
}

function chiSoVong60(can: Can, chi: Chi): number {
  const ci = CAN_THU_TU.indexOf(can);
  const zi = CHI_THU_TU.indexOf(chi);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ci && i % 12 === zi) return i;
  }
  throw new Error(`Cặp Can-Chi không hợp lệ: ${can} ${chi}`);
}

/**
 * Mục 22 — chọn giờ nhận chức: loại giờ xung mạnh tuổi/ngày, ưu tiên giờ Hoàng Đạo và Tiểu Lục
 * Nhâm Đại An/Tốc Hỷ/Tiểu Cát.
 *
 * ⚠️ Giờ Quý Nhân Đăng Thiên Môn (mục 16) là lớp giờ ưu tiên cao nhất theo đặc tả, NHƯNG công
 * thức đầy đủ cần Nguyệt Tướng theo tiết khí + phân biệt Dương/Âm Quý mà repo CHƯA có
 * (`hoangDaoHacDao.ts` ghi rõ phần giờ chưa code được). KHÔNG tự suy diễn — đã kê vào
 * `thieuDuLieu` (gio_quy_nhan_dang_thien_mon). Ở đây chỉ dùng các lớp giờ ĐÃ CÓ công thức.
 */
function chonGioNhanChuc(
  dayChiIndex: number,
  lunarMonth: number,
  lunarDay: number,
  chiNamSinh: Chi | undefined,
  khungGio: { start: number; end: number } | undefined,
): GioNhanChucDeXuat[] {
  const gioCaNgay = TrachNhat.getHoangDaoHacDaoGioCaNgay(dayChiIndex);
  const chiNguoiIndex = chiNamSinh ? CHI_THU_TU.indexOf(chiNamSinh) : -1;

  // Khung giờ đồng hồ của từng Chi giờ: Tý 23–1, Sửu 1–3, ... Giờ Chi i phủ [2i-1, 2i+1) (Tý đặc
  // biệt phủ 23–1). Coi là "trong khung" nếu có giao với [start, end).
  const trongKhung = (hourChiIndex: number): boolean => {
    if (!khungGio) return true;
    const gioBatDau = hourChiIndex === 0 ? 23 : 2 * hourChiIndex - 1;
    const gioKetThuc = hourChiIndex === 0 ? 25 : 2 * hourChiIndex + 1; // Tý kết thúc 1h hôm sau (=25)
    const s = khungGio.start;
    const e = khungGio.end;
    // Chuẩn hóa Tý về dải 23..25 để so; các giờ khác nằm trong 1..23.
    return gioBatDau < e && gioKetThuc > s;
  };

  const ds: GioNhanChucDeXuat[] = gioCaNgay.map((g, hourChiIndex) => {
    const tlnGio = TrachNhat.getTieuLucNham(lunarMonth, lunarDay, hourChiIndex).hour;
    const xungNgay = laLucXungIndex(hourChiIndex, dayChiIndex);
    const xungTuoi = chiNguoiIndex >= 0 && laLucXungIndex(hourChiIndex, chiNguoiIndex);

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
    .filter((g, i) => g.hoangDao && !g.xungTuoi && trongKhung(i))
    .sort((a, b) => b.diem - a.diem)
    .slice(0, 4);
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  nguoiNhanChuc: Scoring.NguoiNhanChuc | undefined,
): NhanChucNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const chiNgay = tuTru.tuTru.ngay.chi as Chi;
  const canNgay = tuTru.tuTru.ngay.can as Can;

  // Thọ Tử (sách ghi "Thụ Tử") nằm trong danh sách thần sát theo tháng — tách ra cờ riêng để
  // hard-filter đọc thẳng thay vì dò tên trong mảng ở tầng rule-engine.
  const thoTu = ngayInfo.thanSat.some((t) => t.name === "Thụ Tử" || t.name === "Thọ Tử");

  const dayInput: Scoring.NhanChucDayInput = {
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
    nhapTrungCung: ngayInfo.nhapTrungCung,
    chiNgay,
    canNgay,
    napAmNgay: tuTru.napAmNgay.element,
    canNamSinhKyKimThanThatSat: ngayInfo.canNamSinhKyKimThanThatSat as Can[],
    thoTu,
    // Truyền tên các Tam Đại Cát Tinh để hard-filter biết khi nào hung tinh thường được hoá giải.
    tamDaiCatTinh: ngayInfo.tamDaiCatTinh,
    // 28 Tú cần TÊN sao (không chỉ cát/hung) cho lớp chuyên biệt — gắn kèm vào input.
    nhiThapBatTu: ngayInfo.nhiThapBatTu,
  };

  const ketQua = Scoring.calculateNhanChucScore(dayInput, nguoiNhanChuc);

  return {
    solarDate: { year, month, day },
    lunarDate: tuTru.lunarDate,
    canChiNgay: `${canNgay} ${chiNgay}`,
    ...ketQua,
  };
}

export function calculateNhanChuc(input: NhanChucInput): NhanChucResult {
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

  let nguoiNhanChuc: Scoring.NguoiNhanChuc | undefined;
  let nhatChu: string | null = null;
  let chiNamSinh: Chi | undefined;
  if (input.ngaySinhNguoiNhanChuc) {
    const ts = input.ngaySinhNguoiNhanChuc;
    const tuTruNguoi = tinhTuTru({ solarDate: { year: ts.year, month: ts.month, day: ts.day }, timeZone: input.timeZone });
    chiNamSinh = tuTruNguoi.tuTru.nam.chi as Chi;
    const napAmMenh = Data.napAmForCycleIndex(
      chiSoVong60(tuTruNguoi.tuTru.nam.can as Can, chiNamSinh),
    ).element;
    nguoiNhanChuc = {
      canNamSinh: tuTruNguoi.tuTru.nam.can as Can,
      chiNamSinh,
      canNhatChu: tuTruNguoi.tuTru.ngay.can as Can,
      napAmMenh,
    };
    nhatChu = `${tuTruNguoi.tuTru.ngay.can} ${tuTruNguoi.tuTru.ngay.chi}`;
  }

  const tatCa: NhanChucNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    tatCa.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, nguoiNhanChuc));
  }

  const dung = tatCa.filter((n) => !n.hardBlock);
  const soKetQua = input.soKetQua ?? 5;
  const ketQua = [...dung].sort((a, b) => b.diem - a.diem).slice(0, soKetQua);

  // Chỉ tính giờ cho các ngày thực sự trả về.
  for (const n of ketQua) {
    const tuTru = tinhTuTru({ solarDate: n.solarDate, timeZone: input.timeZone });
    n.gioDeXuat = chonGioNhanChuc(tuTru.dayChiIndex, n.lunarDate.month, n.lunarDate.day, chiNamSinh, input.khungGioUuTien);
    // Ghi điểm giờ tốt nhất vào breakdown để đúng khung mục 24 (score.hour).
    n.score.hour = n.gioDeXuat.length > 0 ? n.gioDeXuat[0]!.diem : null;
  }

  // Mục 29 — nếu giữ khung giờ, loại tiếp các ngày không có giờ tốt nào trong khung.
  const ketQuaLocKhung = input.khungGioUuTien ? ketQua.filter((n) => (n.gioDeXuat?.length ?? 0) > 0) : ketQua;

  const dem = new Map<string, number>();
  for (const n of tatCa) {
    for (const l of n.lyDoLoai) dem.set(l.moTa, (dem.get(l.moTa) ?? 0) + 1);
  }
  const lyDoLoaiPhoBien = [...dem.entries()]
    .map(([lyDo, soNgayLoai]) => ({ lyDo, soNgay: soNgayLoai }))
    .sort((a, b) => b.soNgay - a.soNgay)
    .slice(0, 5);

  // Gộp cảnh báo PENDING (mục 4) — dedupe, giữ thứ tự xuất hiện.
  const canXacNhanSet = new Set<string>();
  for (const n of ketQuaLocKhung) for (const c of n.canXacNhan) canXacNhanSet.add(c);

  return {
    cheDo: nguoiNhanChuc ? "theo_nguoi_nhan_chuc" : "chung",
    tenChucVu: input.tenChucVu?.trim() || null,
    tongSoNgayQuet: soNgay,
    soNgayDung: dung.length,
    ketQua: ketQuaLocKhung,
    lyDoLoaiPhoBien,
    canXacNhan: [...canXacNhanSet],
    thieuDuLieu: [...Scoring.THIEU_DU_LIEU_NHAN_CHUC],
    nhatChu,
  };
}
