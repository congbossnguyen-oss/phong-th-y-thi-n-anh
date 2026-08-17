/**
 * CƯỚI HỎI — chấm điểm MỘT ngày cho một nghi lễ (đặc tả mục 6-10, 21, 24).
 *
 * Lớp thuần: nhận các dữ kiện đã tính sẵn của ngày (Can Chi, hoàng đạo, trực, thần sát, hỷ tinh…)
 * cùng tuổi cô dâu/chú rể, trả điểm hai người + điểm cặp đôi + cờ loại thẳng + cảnh báo. KHÔNG tự
 * đọc lịch — việc quy ngày dương ra Can Chi/âm lịch/tiết khí là của facade `cuoiHoi.ts` (engine).
 *
 * Tuân thủ nguyên tắc đặc tả mục 36:
 *   - Chấm điểm cô dâu và chú rể ĐỘC LẬP rồi mới cân (nguyên tắc 3, 4).
 *   - Hỷ tinh lưu niên KHÔNG thay được hỷ tinh cá nhân (nguyên tắc 14).
 *   - Thiếu lớp nào thì bỏ lớp đó + chuẩn hoá phần còn lại (nguyên tắc 9), không cho điểm giả.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  canDiemCapDoi,
  tinhDiemHyTinh,
  TRONG_SO_NGAY,
  CUOI_HOI_LOAI_THANG,
  apKyRiengGiaThu,
  xepHangCuoiHoi,
  type NghiLeCuoiHoi,
  type UuTienCuoiHoi,
  type HangCuoiHoi,
} from "./cuoiHoi.js";
import { xetHyTinhNgay } from "./hongLoanThienHy.js";
import { luanChuDuong } from "./chuDuong.js";
import { xetHoaThuongSat } from "./hoaThuongSat.js";
import { xetKhiVangVong } from "./khiVangVong.js";

type Chi = Data.Chi;

/** Dữ kiện của một ngày, đã tính sẵn ở facade. */
export interface NgayCuoiHoiInput {
  chiNgay: Chi;
  /** Điểm hợp NGÀY ↔ cô dâu (0-10) — facade tính bằng `Scoring.calculateXuatHanhCaNhanDayPersonal`. */
  diemNgayCoDau: number;
  /** Điểm hợp NGÀY ↔ chú rể (0-10). */
  diemNgayChuRe: number;
  /** true = hoàng đạo, false = hắc đạo. */
  hoangDao: boolean;
  /** Trực tốt cho cưới hỏi (Thành/Khai/Mãn…) — facade quyết, ở đây chỉ nhận kết quả. */
  trucTot: boolean;
  /** Sao Nhị Thập Bát Tú của ngày là cát. */
  tuCat: boolean;
  /** Tên các cát tinh hôn nhân có mặt trong ngày (Thiên Đức, Nguyệt Đức, Thiên Giải, Địa Giải…). */
  catTinhCoMat: readonly string[];
  /** Tên các sao/thần sát của ngày — để dò đại kỵ loại thẳng. */
  thanSatCoMat: readonly string[];
  /** Chi năm sinh cô dâu / chú rể (cho hỷ tinh cá nhân) và Chi của năm đang xét (lưu niên). */
  chiNamCoDau: Chi;
  chiNamChuRe: Chi;
  chiNamXet: Chi;
  /** Chi năm sinh CHÚ RỂ — cho Hoà Thượng Sát (chỉ nam mệnh). */
  chiNamSinhChuRe: Chi;
  /** Ngày âm lịch + tháng đủ/thiếu — cho Chu Đường. */
  ngayAmLich: number;
  thangDu: boolean;
  /** Tiết khí + ngày thứ mấy kể từ tiết — cho Khí Vãng Vong. Bỏ trống thì bỏ qua mục này. */
  tietKhi?: string;
  ngayThuTuTiet?: number;
}

export interface KetQuaNgayCuoiHoi {
  /** true = loại thẳng, không xếp hạng (đại kỵ hoặc nghi lễ-specific với Thành hôn). */
  loai: boolean;
  lyDoLoai: string[];
  /** Điểm 0-10 của cô dâu, chú rể và điểm cặp đôi đã cân. */
  diemCoDau: number;
  diemChuRe: number;
  diemCapDoi: number;
  hang: HangCuoiHoi;
  /** Cảnh báo mềm — không loại, để thầy cân nhắc (mục thần sát riêng Thành hôn khi có công thức). */
  canhBao: string[];
  /** Điểm cát tinh hôn nhân (0-100) và mô tả — để hiển thị. */
  catTinh: { diem: number; moTa: string[] };
}

function clamp10(x: number): number {
  return Math.max(0, Math.min(10, x));
}

/**
 * Chấm điểm một ngày cho một nghi lễ.
 *
 * @param uuTien Chế độ cân điểm hai người (mục 3).
 */
export function chamDiemNgayCuoiHoi(
  input: NgayCuoiHoiInput,
  nghiLe: NghiLeCuoiHoi,
  uuTien: UuTienCuoiHoi = "can-bang",
): KetQuaNgayCuoiHoi {
  // ── ĐẠI KỴ LOẠI THẲNG (mục 15) ──
  const lyDoLoai: string[] = [];
  for (const ten of input.thanSatCoMat) {
    if (CUOI_HOI_LOAI_THANG.includes(ten)) lyDoLoai.push(ten);
  }

  // ── NGHI LỄ-SPECIFIC: chỉ Thành hôn mới áp Chu Đường / Hoà Thượng Sát / Khí Vãng Vong ──
  // (mục 9, nguyên tắc 13). Ăn hỏi / đón dâu / đăng ký KHÔNG áp — đúng phân biệt đính hôn ≠ giá thú.
  const canhBao: string[] = [];
  if (apKyRiengGiaThu(nghiLe)) {
    const chuDuong = luanChuDuong(input.ngayAmLich, input.thangDu);
    if (chuDuong.batLoi) canhBao.push(chuDuong.moTa);

    const htSat = xetHoaThuongSat(input.chiNamSinhChuRe, input.chiNgay);
    // Mức độ Hoà Thượng Sát chủ dự án CHƯA chốt loại thẳng hay trừ điểm → chỉ CẢNH BÁO, không loại.
    if (htSat.pham) canhBao.push(htSat.lyDo);

    if (input.tietKhi !== undefined && input.ngayThuTuTiet !== undefined) {
      const kvv = xetKhiVangVong(input.tietKhi, input.ngayThuTuTiet);
      if (kvv.pham) canhBao.push(kvv.lyDo);
    }
  }

  // ── HỶ TINH 2 LỚP (mục 14a) ──
  const hyTinh = xetHyTinhNgay(input.chiNgay, input.chiNamCoDau, input.chiNamChuRe, input.chiNamXet);
  // "Cát tinh khác" 0-100: mỗi cát tinh hôn nhân có mặt cho một phần, tối đa 100.
  const CAT_TINH_HON_NHAN = ["Thiên Đức", "Thiên Đức Hợp", "Nguyệt Đức", "Nguyệt Đức Hợp", "Thiên Xá", "Thiên Giải", "Địa Giải", "Sinh Khí"];
  const soCatTinh = input.catTinhCoMat.filter((t) => CAT_TINH_HON_NHAN.some((c) => t.includes(c))).length;
  const diemCatTinhKhac = Math.min(100, soCatTinh * 34); // 3 cát tinh trở lên là kịch trần
  const catTinh = tinhDiemHyTinh(hyTinh, diemCatTinhKhac);

  // ── SÁU LỚP ĐIỂM NGÀY (mục 21) ──
  // Nghi/Kỵ đúng nghi lễ: chưa có bảng Nghi/Kỵ riêng cho cưới hỏi, dùng trạch cát nền (trực + sao)
  // làm đại diện HỢP LỆ — không bịa bảng. Ghi rõ để sau này thay bằng bảng riêng nếu chủ dự án cấp.
  const diemNghiKy = (input.trucTot ? 6 : 2) + (input.tuCat ? 4 : 0); // 0-10
  const diemTrachCat = ((input.hoangDao ? 6 : 2) + (input.trucTot ? 4 : 0)); // 0-10
  const diemHoangDaoTrucTu = (input.hoangDao ? 5 : 0) + (input.trucTot ? 3 : 0) + (input.tuCat ? 2 : 0);

  const W = TRONG_SO_NGAY;

  // Tính điểm mỗi người TRÊN THANG 0-10 rồi mới cân — giữ đúng "chấm độc lập" của nguyên tắc 4.
  // Mỗi người = hợp-ngày-cá-nhân (nặng nhất) + phần chung của ngày (nghi/kỵ, cát tinh, trạch cát).
  const phanChung =
    (diemNghiKy * W.nghiKyTheoNghiLe! +
      (catTinh.diem / 10) * W.catTinhHonNhan! +
      diemTrachCat * W.trachCatTongThe! +
      diemHoangDaoTrucTu * W.hoangDaoTrucTu!) /
    (W.nghiKyTheoNghiLe! + W.catTinhHonNhan! + W.trachCatTongThe! + W.hoangDaoTrucTu!);

  const tyLeCaNhan = W.ngayVoiCoDau! / (W.ngayVoiCoDau! + W.nghiKyTheoNghiLe! + W.catTinhHonNhan! + W.trachCatTongThe! + W.hoangDaoTrucTu!);
  const diemCoDau = clamp10(input.diemNgayCoDau * tyLeCaNhan + phanChung * (1 - tyLeCaNhan));
  const diemChuRe = clamp10(input.diemNgayChuRe * tyLeCaNhan + phanChung * (1 - tyLeCaNhan));
  const diemCapDoi = clamp10(canDiemCapDoi(diemCoDau, diemChuRe, uuTien));

  return {
    loai: lyDoLoai.length > 0,
    lyDoLoai,
    diemCoDau: Math.round(diemCoDau * 10) / 10,
    diemChuRe: Math.round(diemChuRe * 10) / 10,
    diemCapDoi: Math.round(diemCapDoi * 10) / 10,
    hang: xepHangCuoiHoi(diemCapDoi),
    canhBao,
    catTinh,
  };
}
