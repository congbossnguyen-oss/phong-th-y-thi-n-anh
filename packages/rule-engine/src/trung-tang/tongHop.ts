/**
 * TRÙNG TANG — hàm tổng hợp: chạy đủ Bước 1-2-3-5 và gộp kết quả trong 1 lần gọi. Bước 4
 * (chọn giờ liệm/hạ huyệt tối ưu) và Bước 7 (hóa giải/trấn trùng cụ thể) KHÔNG tự động hóa ở
 * đây — cả hai đòi hỏi cân nhắc từng ca cụ thể (sàng lọc thần sát, tình trạng gia đình...),
 * tầng hiển thị phải chuyển sang mời liên hệ tư vấn trực tiếp thay vì tự quyết định.
 */
import type { Data } from "@thien-anh/calendar-core";
import { tinhBonCungTrungTang, type BonCungTrungTang, type GioiTinh } from "./chuongPhap.js";
import { tinhMucDoNangNhe, kiemTraChiThucTeTrungTang, type MucDoKetQua, type KiemTraChiThucTe } from "./mucDoNangNhe.js";
import { tinhNgayTrungKy, getChiThangCoDinh, type NgayTrungKyKetQua } from "./ngayTrungKy.js";
import { tinhTuoiCanTranh, type TuoiCanTranhKetQua, type Nhom6ThanQuyen } from "./tuoiCanTranh.js";
import { getHanhNienThaiTue } from "./hanhNienThaiTue.js";

type Can = Data.Can;
type Chi = Data.Chi;

export const TUOI_TOI_THIEU_TINH_TRUNG_TANG = 10;

export interface LuanTrungTangInput {
  gioiTinh: GioiTinh;
  tuoiMat: number;
  thangMatAmLich: number;
  ngayMatAmLich: number;
  gioMat: Chi | null;
  /** Can/Chi của NGÀY mất (đã quy đổi từ ngày âm lịch sang dương lịch rồi tính Can Chi). */
  canNgayMat: Can;
  chiNgayMat: Chi;
  /** Can/Chi của NĂM mất (âm lịch). */
  canNamMat: Can;
  chiNamMat: Chi;
  /** Chi năm sinh (tuổi ta) của vong — dùng cho Kiếp Sát và các nhóm tuổi tránh. */
  chiTuoiVong: Chi;
  /** Tuổi thân quyến (tùy chọn) cho Nhóm 6 — bỏ trống nếu chưa có thông tin. */
  thanQuyen?: Nhom6ThanQuyen;
}

export interface LuanTrungTangResult {
  duoi10Tuoi: boolean;
  bonCung: BonCungTrungTang;
  mucDo: MucDoKetQua;
  chiThucTe: KiemTraChiThucTe;
  ngayTrungKy: NgayTrungKyKetQua;
  tuoiCanTranh: TuoiCanTranhKetQua;
  hanhNienThaiTue: readonly string[];
  /** Kết luận "có phạm" tổng hợp — true nếu chưởng pháp phạm HOẶC Trùng nhật/Phục nhật/Kiếp Sát/Thần Trùng phạm. */
  coPham: boolean;
}

export function luanTrungTang(input: LuanTrungTangInput): LuanTrungTangResult | { duoi10Tuoi: true } {
  if (input.tuoiMat < TUOI_TOI_THIEU_TINH_TRUNG_TANG) {
    return { duoi10Tuoi: true };
  }

  const bonCung = tinhBonCungTrungTang(input.gioiTinh, input.tuoiMat, input.thangMatAmLich, input.ngayMatAmLich, input.gioMat);
  const mucDo = tinhMucDoNangNhe(bonCung);

  const chiThangCoDinh = getChiThangCoDinh(input.thangMatAmLich);
  const chiThucTe = kiemTraChiThucTeTrungTang(input.chiNamMat, chiThangCoDinh, input.chiNgayMat, input.gioMat);

  const ngayTrungKy = tinhNgayTrungKy(input.canNgayMat, input.chiNgayMat, input.thangMatAmLich, input.chiTuoiVong);

  const cacCungPham = mucDo.cacCungDaXet.filter((c) => c.phanLoai === "trung-tang").map((c) => c.chi);
  const tuoiCanTranh = tinhTuoiCanTranh(cacCungPham, input.chiTuoiVong, input.thanQuyen);

  const hanhNienThaiTue = getHanhNienThaiTue(input.canNamMat, input.chiNamMat);

  // "khong-du-du-lieu" (thiếu giờ mất) không được tự kết luận phạm/không phạm theo bàn tay,
  // đúng cảnh báo của skill nguồn — chỉ 4 phép tra Bước 3 (không phụ thuộc giờ) mới tính ở đây.
  const phamTheoBanTay = mucDo.mucDo !== "khong-pham" && mucDo.mucDo !== "khong-du-du-lieu";
  const coPham = phamTheoBanTay || ngayTrungKy.trungNhat || ngayTrungKy.phucNhat || ngayTrungKy.kiepSat || ngayTrungKy.thanTrung !== null;

  return { duoi10Tuoi: false, bonCung, mucDo, chiThucTe, ngayTrungKy, tuoiCanTranh, hanhNienThaiTue, coPham };
}
