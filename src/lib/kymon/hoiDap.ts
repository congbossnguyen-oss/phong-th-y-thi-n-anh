// Đăng ký hàm luận cho module Hỏi Đáp Kỳ Môn — DÙNG CHUNG cho cả checkout và result.
//
// ⚠️ Vì sao phải tách ra file riêng: từ khi mở bán cho khách (26/8/2026), checkout BẮT BUỘC phải
// tính thử được câu trả lời TRƯỚC khi tạo đơn. Vẫn còn vài tình huống chưa có luật (Đi Lại:
// "an toàn dọc đường", "khi nào về"; Phong Thủy: "chọn hướng đặt vật") — nguồn không đủ rõ nên cố
// tình để trống thay vì đoán bừa. Nếu không chặn, khách chọn đúng mấy tình huống đó sẽ trả tiền
// rồi nhận về "đang cập nhật" — tức là thu tiền mà không giao hàng.

import type { LapLaBanResult } from "./types";
import type { QuanHeCauHoi } from "./danhMucCauHoi";
import { luanHoiDapTaiChinh } from "./hoiDapTaiChinh";
import { luanHoiDapTinhCam } from "./hoiDapTinhCam";
import { luanHoiDapCongViec } from "./hoiDapCongViec";
import { luanHoiDapHocHanh } from "./hoiDapHocHanh";
import { luanHoiDapDiLai } from "./hoiDapDiLai";
import { luanHoiDapTimKiem } from "./hoiDapTimKiem";
import { luanHoiDapThoiTiet } from "./hoiDapThoiTiet";
import { luanHoiDapPhapLy } from "./hoiDapPhapLy";
import { luanHoiDapSucKhoe } from "./hoiDapSucKhoe";
import { luanHoiDapPhongThuy } from "./hoiDapPhongThuy";

/** Mọi module chủ đề đều trả cùng shape này (hoặc null nếu tình huống chưa có luật). */
export type KetQuaHoiDapChung = {
  hopLe: boolean;
  xuHuong: string;
  vanBan: string;
  chiTiet: string;
};

/**
 * Chữ ký chung nhận cả `quanHe` (Học Hành/Tìm Kiếm — hỏi cho ai) và `thongTinBoSung` (Đi Lại —
 * nhận diện phương tiện) dù không phải hàm nào cũng dùng hết; JS bỏ qua tham số thừa.
 */
const LUAN_THEO_CHU_DE: Record<
  string,
  (laBan: LapLaBanResult, tinhHuongId: string, quanHe: QuanHeCauHoi, thongTinBoSung: string) => KetQuaHoiDapChung | null
> = {
  tai_chinh: luanHoiDapTaiChinh,
  tinh_cam: luanHoiDapTinhCam,
  cong_viec: luanHoiDapCongViec,
  hoc_hanh: luanHoiDapHocHanh,
  di_lai: luanHoiDapDiLai,
  tim_kiem: luanHoiDapTimKiem,
  thoi_tiet: luanHoiDapThoiTiet,
  phap_ly: luanHoiDapPhapLy,
  suc_khoe: luanHoiDapSucKhoe,
  phong_thuy: luanHoiDapPhongThuy,
};

/**
 * Luận một câu hỏi. Trả `null` khi chủ đề/tình huống chưa có luật — người gọi phải tự xử lý,
 * KHÔNG được coi null là "không sao".
 */
export function luanHoiDap(
  laBan: LapLaBanResult,
  chuDeId: string,
  tinhHuongId: string,
  quanHe: QuanHeCauHoi,
  thongTinBoSung: string,
): KetQuaHoiDapChung | null {
  const ham = LUAN_THEO_CHU_DE[chuDeId];
  if (!ham) return null;
  const kq = ham(laBan, tinhHuongId, quanHe, thongTinBoSung);
  return kq?.hopLe ? kq : null;
}
