/**
 * CÁT TINH CÁ NHÂN theo tuổi (Can+Chi năm sinh) — ENGINE DÙNG CHUNG cho mọi module xem ngày.
 *
 * Gộp 6 tiêu chí cát tinh của một ngày đối với một người, XẾP THEO MỨC ƯU TIÊN (cao → thấp):
 *
 *   1. Chân Lộc         (khớp cả Can+Chi trụ Lộc)          — tốt nhất cho cá nhân
 *   2. Chân Dương Quý   (khớp cả Can+Chi trụ Dương Quý)
 *   3. Chân Âm Quý      (khớp cả Can+Chi trụ Âm Quý)
 *   4. Lộc (địa chi)    (chỉ Chi ngày trùng Chi Lộc)       — "tạm được"
 *   5. Tam Hợp tuổi     (Chi ngày tam hợp Chi năm sinh)
 *   6. Lục Hợp tuổi     (Chi ngày lục hợp Chi năm sinh)
 *
 * Một ngày lấy ĐÚNG 1 tầng cao nhất mà nó trúng (các tầng có thể chồng nhau, vd Chân Lộc luôn kèm
 * Lộc-địa-chi). `diemCong` = điểm của tầng đó — cộng thẳng vào điểm ngày ở tầng chấm điểm (cộng
 * TRƯỚC trần đại kỵ để vẫn tương thích các bộ lọc/cách tính khác).
 *
 * Nguồn dữ liệu: bảng Chân Lộc Mã Quý Nhân (chanLocQuyNhan.ts) + Tam Hợp/Lục Hợp (tamHop/lucHop.ts).
 */
import type { Data } from "@thien-anh/calendar-core";
import { xetChanLocQuyNhan } from "./chanLocQuyNhan.js";
import { isTamHop } from "./tamHop.js";
import { isLucHop } from "./lucHop.js";

type Can = Data.Can;
type Chi = Data.Chi;

export type TangCatTinhCaNhan = "chan-loc" | "chan-duong-quy" | "chan-am-quy" | "loc" | "tam-hop" | "luc-hop";

export interface CatTinhCaNhan {
  chanLoc: boolean;
  chanDuongQuy: boolean;
  chanAmQuy: boolean;
  loc: boolean;
  tamHop: boolean;
  lucHop: boolean;
  /** Tầng ưu tiên CAO NHẤT ngày này trúng (null nếu không trúng gì). */
  tang: TangCatTinhCaNhan | null;
  /** Nhãn hiển thị của tầng cao nhất. */
  nhan: string;
  /** Điểm cộng theo tầng cao nhất — dùng cho module CHƯA tự chấm Tam/Lục Hợp. */
  diemCong: number;
  /**
   * Điểm cộng CHỈ phần Chân Lộc/Quý Nhân/Lộc (bỏ Tam/Lục Hợp) — dùng cho module ĐÃ tự chấm Tam/Lục
   * Hợp trong lớp hợp tuổi (vd Khai Trương, Ký Hợp Đồng) để không cộng trùng.
   */
  diemCongChanLoc: number;
}

const BAC: Record<TangCatTinhCaNhan, { diem: number; nhan: string }> = {
  "chan-loc": { diem: 2.5, nhan: "Chân Lộc" },
  "chan-duong-quy": { diem: 1.5, nhan: "Chân Dương Quý Nhân" },
  "chan-am-quy": { diem: 1.2, nhan: "Chân Âm Quý Nhân" },
  loc: { diem: 0.8, nhan: "Lộc (địa chi)" },
  "tam-hop": { diem: 0.6, nhan: "Tam Hợp tuổi" },
  "luc-hop": { diem: 0.4, nhan: "Lục Hợp tuổi" },
};

const LA_CHAN_LOC = new Set<TangCatTinhCaNhan>(["chan-loc", "chan-duong-quy", "chan-am-quy", "loc"]);

/**
 * Tính cát tinh cá nhân của một NGÀY (Can+Chi ngày) theo tuổi người (Can+Chi năm sinh).
 */
export function tinhCatTinhCaNhan(dayCan: Can, dayChi: Chi, canNam: Can, chiNam: Chi): CatTinhCaNhan {
  const chan = xetChanLocQuyNhan(dayCan, dayChi, canNam);
  const tamHop = isTamHop(dayChi, chiNam);
  const lucHop = isLucHop(dayChi, chiNam);

  let tang: TangCatTinhCaNhan | null = null;
  if (chan.chanLoc) tang = "chan-loc";
  else if (chan.chanDuongQuy) tang = "chan-duong-quy";
  else if (chan.chanAmQuy) tang = "chan-am-quy";
  else if (chan.loc) tang = "loc";
  else if (tamHop) tang = "tam-hop";
  else if (lucHop) tang = "luc-hop";

  const b = tang ? BAC[tang] : null;
  return {
    chanLoc: chan.chanLoc,
    chanDuongQuy: chan.chanDuongQuy,
    chanAmQuy: chan.chanAmQuy,
    loc: chan.loc,
    tamHop,
    lucHop,
    tang,
    nhan: b ? b.nhan : "",
    diemCong: b ? b.diem : 0,
    diemCongChanLoc: tang && LA_CHAN_LOC.has(tang) && b ? b.diem : 0,
  };
}
