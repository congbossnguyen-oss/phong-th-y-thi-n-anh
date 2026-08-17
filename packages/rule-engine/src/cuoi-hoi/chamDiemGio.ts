/**
 * CƯỚI HỎI — chấm điểm MỘT giờ trong ngày đã chọn (đặc tả mục 22, 24).
 *
 * Lớp thuần: nhận dữ kiện đã tính sẵn của một giờ (Chi giờ, giờ hoàng đạo, Tiểu Lục Nhâm) cùng tuổi
 * cô dâu/chú rể, trả điểm hai người + điểm cặp đôi. Việc quy giờ ra Chi / hoàng đạo / Tiểu Lục Nhâm
 * là của facade `cuoiHoi.ts` (engine) — ở đây chỉ nhận kết quả.
 *
 * ⚠️ CHUẨN HOÁ TRỌNG SỐ THEO NGUYÊN TẮC 9: đặc tả mục 22 dự trù 6 thành phần cho giờ, nhưng 2 trong
 * số đó CHƯA có dữ liệu xác thực trong kho nên module BỎ QUA và chia lại trọng số cho phần còn lại,
 * thay vì cho điểm giả:
 *   - "theoNghiLe" (Nghi/Kỵ GIỜ theo nghi lễ): kho KHÔNG có bảng Nghi/Kỵ cấp giờ → bỏ.
 *   - "huongXuatHanh": `scoring/huongXuatHanh.ts` ghi rõ CHƯA có bảng phương vị Thần Tài/Hỷ Thần/
 *     Quý Thần xác thực → bỏ.
 * Ba thành phần CÓ dữ liệu thật được giữ: giờ ↔ cô dâu, giờ ↔ chú rể, Tiểu Lục Nhâm, giờ hoàng đạo.
 */
import type { Data } from "@thien-anh/calendar-core";
import { laTamHop, laLucHop, laLucXung, laLucHai, laLucPha } from "../scoring/kyHopDongCaoCap.js";
import {
  canDiemCapDoi,
  xepHangCuoiHoi,
  TRONG_SO_GIO,
  type UuTienCuoiHoi,
  type HangCuoiHoi,
} from "./cuoiHoi.js";

type Chi = Data.Chi;

/** Dữ kiện của một giờ, đã tính sẵn ở facade. */
export interface GioCuoiHoiInput {
  chiGio: Chi;
  chiNamCoDau: Chi;
  chiNamChuRe: Chi;
  /** Giờ hoàng đạo (cát) hay hắc đạo (hung) — facade tính bằng `getHoangDaoHacDaoGio`. */
  hoangDaoCat: boolean;
  /** Cung Giờ của Tiểu Lục Nhâm là cát (Đại An/Tốc Hỷ/Tiểu Cát) hay hung. */
  tieuLucNhamCat: boolean;
}

export interface KetQuaGioCuoiHoi {
  diemCoDau: number;
  diemChuRe: number;
  diemCapDoi: number;
  hang: HangCuoiHoi;
  ghiChu: string[];
}

/**
 * Điểm hợp GIỜ ↔ một người (0-10) theo quan hệ Chi giờ với Chi năm sinh.
 * Tam hợp > Lục hợp > trung tính/trùng > Lục phá ~ Lục hại > Lục xung.
 */
export function diemGioVoiNguoi(chiGio: Chi, chiNguoi: Chi): number {
  if (laTamHop(chiGio, chiNguoi)) return 10;
  if (laLucHop(chiGio, chiNguoi)) return 9;
  if (laLucXung(chiGio, chiNguoi)) return 2;
  if (laLucHai(chiGio, chiNguoi)) return 4;
  if (laLucPha(chiGio, chiNguoi)) return 4.5;
  return 6.5; // trung tính hoặc trùng Chi (bình hoà)
}

function clamp10(x: number): number {
  return Math.max(0, Math.min(10, x));
}

/**
 * Chấm điểm một giờ cho nghi lễ đã chọn trong một ngày.
 *
 * Cân điểm hai người ĐỘC LẬP rồi mới gộp (nguyên tắc 4) — giống tầng ngày. Phần chung của giờ
 * (Tiểu Lục Nhâm + hoàng đạo) cộng vào cả hai người theo trọng số đã chuẩn hoá.
 */
export function chamDiemGioCuoiHoi(input: GioCuoiHoiInput, uuTien: UuTienCuoiHoi = "can-bang"): KetQuaGioCuoiHoi {
  const W = TRONG_SO_GIO;
  const wCaNhan = W.gioVoiCoDau!; // = gioVoiChuRe, phần riêng mỗi người
  const wChung = W.tieuLucNham! + W.gioHoangDao!;

  const tlnDiem = input.tieuLucNhamCat ? 10 : 3;
  const hdDiem = input.hoangDaoCat ? 10 : 3;
  const phanChung = (tlnDiem * W.tieuLucNham! + hdDiem * W.gioHoangDao!) / wChung;

  const tyLeCaNhan = wCaNhan / (wCaNhan + wChung);

  const gioCoDau = diemGioVoiNguoi(input.chiGio, input.chiNamCoDau);
  const gioChuRe = diemGioVoiNguoi(input.chiGio, input.chiNamChuRe);

  const diemCoDau = clamp10(gioCoDau * tyLeCaNhan + phanChung * (1 - tyLeCaNhan));
  const diemChuRe = clamp10(gioChuRe * tyLeCaNhan + phanChung * (1 - tyLeCaNhan));
  const diemCapDoi = clamp10(canDiemCapDoi(diemCoDau, diemChuRe, uuTien));

  const ghiChu: string[] = [];
  if (input.hoangDaoCat) ghiChu.push("Giờ hoàng đạo");
  if (input.tieuLucNhamCat) ghiChu.push("Tiểu Lục Nhâm cát");
  if (laTamHop(input.chiGio, input.chiNamCoDau) || laLucHop(input.chiGio, input.chiNamCoDau)) ghiChu.push("Giờ hợp tuổi cô dâu");
  if (laTamHop(input.chiGio, input.chiNamChuRe) || laLucHop(input.chiGio, input.chiNamChuRe)) ghiChu.push("Giờ hợp tuổi chú rể");
  if (laLucXung(input.chiGio, input.chiNamCoDau)) ghiChu.push("Giờ xung tuổi cô dâu");
  if (laLucXung(input.chiGio, input.chiNamChuRe)) ghiChu.push("Giờ xung tuổi chú rể");

  return {
    diemCoDau: Math.round(diemCoDau * 10) / 10,
    diemChuRe: Math.round(diemChuRe * 10) / 10,
    diemCapDoi: Math.round(diemCapDoi * 10) / 10,
    hang: xepHangCuoiHoi(diemCapDoi),
    ghiChu,
  };
}
