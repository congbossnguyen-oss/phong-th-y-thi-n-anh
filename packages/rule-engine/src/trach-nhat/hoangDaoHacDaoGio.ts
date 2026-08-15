/**
 * Hoàng Đạo/Hắc Đạo theo GIỜ trong ngày (12-cycle: Thanh Long/Minh Đường/Thiên Hình/Chu
 * Tước/Kim Quỹ/Kim Đường/Bạch Hổ/Ngọc Đường/Thiên Lao/Nguyên Vũ/Tư Mệnh/Câu Trần).
 *
 * Nguồn: đặc tả `hoang-hac-dao-gio-engine.md` (chủ dự án cung cấp 2026-08-09) — Thanh Long
 * khởi tại một giờ Chi cố định theo NHÓM CHI NGÀY (không phải Can Ngày), rồi 12 thần an
 * thuận theo 12 giờ Địa Chi kể từ đó.
 *
 * ⚠️ SỬA LỖI DỮ LIỆU 2026-08-15: hàng Tỵ/Hợi trước đây ghi Thanh Long khởi tại **Hợi** — SAI.
 * Đúng phải là khởi tại **Ngọ** (nguồn cập nhật `hoang-dao-hac-dao-28-sao.md` mục A.2 do chủ dự án
 * cung cấp, đã giải mã bài quyết Hán 12 chữ 道遠幾時通達路遙何日還程 và kiểm chứng chéo 3 nguồn
 * độc lập). Kiểm lại: ngày Tỵ/Hợi → 6 giờ Hoàng Đạo đúng là Sửu, Thìn, Ngọ, Mùi, Tuất, Hợi.
 * 5 hàng còn lại (Tý/Ngọ, Sửu/Mùi, Dần/Thân, Mão/Dậu, Thìn/Tuất) vốn đã đúng, không đổi.
 * Lỗi cũ chỉ ảnh hưởng các ngày có Chi Tỵ hoặc Hợi (2/12 số ngày).
 *
 * ⚠️ Lịch sử: trước đó (cùng ngày) từng có công thức SAI dựa trên Can Ngày
 * (`offset = mod(-2×canNgày, 12)`), khớp tình cờ 4 điểm dữ liệu đầu nhưng sai ở điểm thứ 5
 * (20/8/2026: dự đoán "Thiên Lao", thực tế "Thanh Long"). Công thức Chi-ngày ở file này đã
 * verify khớp ĐÚNG TOÀN BỘ 24 mục (12 giờ × 2 ngày) đối chiếu với hocvienlyso.org/lichvansu/
 * tại 2 ngày khác nhóm Chi (Giáp Dần 8/8/2026 và Ất Mão 9/8/2026) — khớp cả thứ tự 12 thần
 * lẫn phân loại Hoàng/Hắc, chỉ khác biến thể tên gọi vùng miền ("Kim Đường"~"Thiên Đức",
 * "Nguyên Vũ"~"Huyền Vũ" — đã dùng tên biến thể theo site cho khớp 100%).
 */

import { mod } from "../utils/math.js";
import type { CatHung } from "./catHung.js";

export const HOANG_DAO_HAC_DAO_GIO_NAMES = [
  "Thanh Long", // Hoàng Đạo
  "Minh Đường", // Hoàng Đạo
  "Thiên Hình", // Hắc Đạo
  "Chu Tước", // Hắc Đạo
  "Kim Quỹ", // Hoàng Đạo
  "Kim Đường", // Hoàng Đạo
  "Bạch Hổ", // Hắc Đạo
  "Ngọc Đường", // Hoàng Đạo
  "Thiên Lao", // Hắc Đạo
  "Nguyên Vũ", // Hắc Đạo
  "Tư Mệnh", // Hoàng Đạo
  "Câu Trần", // Hắc Đạo
] as const;

export type HoangDaoHacDaoGioName = (typeof HOANG_DAO_HAC_DAO_GIO_NAMES)[number];

const HOANG_DAO_INDICES = new Set([0, 1, 4, 5, 7, 10]);

/** Địa Chi giờ Thanh Long khởi, theo Chi ngày (index 0=Tý...11=Hợi). */
const THANH_LONG_START_CHI_INDEX: readonly number[] = [
  8, // Tý  -> Thân
  10, // Sửu -> Tuất
  0, // Dần -> Tý
  2, // Mão -> Dần
  4, // Thìn -> Thìn
  6, // Tỵ  -> Ngọ
  8, // Ngọ -> Thân
  10, // Mùi -> Tuất
  0, // Thân -> Tý
  2, // Dậu -> Dần
  4, // Tuất -> Thìn
  6, // Hợi -> Ngọ
];

export interface HoangDaoHacDaoGioResult {
  index: number; // 0-11
  name: HoangDaoHacDaoGioName;
  catHung: CatHung;
}

function toResult(index: number): HoangDaoHacDaoGioResult {
  const i = mod(index, 12);
  return {
    index: i,
    name: HOANG_DAO_HAC_DAO_GIO_NAMES[i]!,
    catHung: HOANG_DAO_INDICES.has(i) ? "cát" : "hung",
  };
}

/**
 * Xác định thần Hoàng Đạo/Hắc Đạo của MỘT giờ cụ thể trong ngày.
 *
 * @param dayChiIndex Index Địa Chi của ngày (0-11, 0=Tý).
 * @param hourChiIndex Index Địa Chi của giờ (0-11, 0=Tý).
 */
export function getHoangDaoHacDaoGio(dayChiIndex: number, hourChiIndex: number): HoangDaoHacDaoGioResult {
  if (!Number.isInteger(dayChiIndex) || dayChiIndex < 0 || dayChiIndex > 11) {
    throw new Error(`dayChiIndex không hợp lệ: ${dayChiIndex} (phải 0-11).`);
  }
  if (!Number.isInteger(hourChiIndex) || hourChiIndex < 0 || hourChiIndex > 11) {
    throw new Error(`hourChiIndex không hợp lệ: ${hourChiIndex} (phải 0-11).`);
  }

  const startIndex = THANH_LONG_START_CHI_INDEX[dayChiIndex]!;
  const offset = mod(hourChiIndex - startIndex, 12);
  return toResult(offset);
}

/** Tính đủ 12 giờ Địa Chi (Tý→Hợi) trong một ngày, theo Chi ngày cho trước. */
export function getHoangDaoHacDaoGioCaNgay(dayChiIndex: number): readonly HoangDaoHacDaoGioResult[] {
  const result: HoangDaoHacDaoGioResult[] = [];
  for (let hourChiIndex = 0; hourChiIndex < 12; hourChiIndex++) {
    result.push(getHoangDaoHacDaoGio(dayChiIndex, hourChiIndex));
  }
  return result;
}
