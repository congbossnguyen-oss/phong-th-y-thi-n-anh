/**
 * CHÂN LỘC – CHÂN DƯƠNG QUÝ NHÂN – CHÂN ÂM QUÝ NHÂN.
 *
 * Nguồn: bảng "Chân Lộc Mã Quý Nhân" do chủ dự án cung cấp 2026-08-19.
 *
 * Khác với Lộc Tồn / Thiên Ất Quý Nhân thường (chỉ tra theo ĐỊA CHI — xem
 * `xem-tuoi-xong-dat/locQuyNhanDichMa.ts`): bản "CHÂN" khớp CẢ Can lẫn Chi của ngày (một trụ
 * Giáp Tý cụ thể), tra theo CAN của NĂM SINH người dùng. Vì vậy mỗi Can chỉ có đúng 1 ngày
 * Chân Lộc / 1 ngày Chân Dương Quý / 1 ngày Chân Âm Quý trong mỗi vòng 60 ngày.
 *
 * Bảng này CÓ tách Dương/Âm Quý Nhân (theo đúng nguồn chủ dự án đưa), nên không rơi vào vấn đề
 * dị bản mà file locQuyNhanDichMa.ts đã ghi chú.
 */
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export interface TruCanChi {
  can: Can;
  chi: Chi;
}

export interface ChanCatTinh {
  chanLoc: TruCanChi;
  chanDuongQuy: TruCanChi;
  chanAmQuy: TruCanChi;
}

/** Tra theo CAN NĂM SINH của người → 3 trụ ngày (Can+Chi) là Chân Lộc / Chân Dương Quý / Chân Âm Quý. */
export const CHAN_LOC_QUY_NHAN: Record<Can, ChanCatTinh> = {
  Giáp: { chanLoc: { can: "Bính", chi: "Dần" }, chanDuongQuy: { can: "Đinh", chi: "Sửu" }, chanAmQuy: { can: "Tân", chi: "Mùi" } },
  Ất: { chanLoc: { can: "Kỷ", chi: "Mão" }, chanDuongQuy: { can: "Mậu", chi: "Tý" }, chanAmQuy: { can: "Giáp", chi: "Thân" } },
  Bính: { chanLoc: { can: "Quý", chi: "Tỵ" }, chanDuongQuy: { can: "Kỷ", chi: "Hợi" }, chanAmQuy: { can: "Đinh", chi: "Dậu" } },
  Đinh: { chanLoc: { can: "Bính", chi: "Ngọ" }, chanDuongQuy: { can: "Tân", chi: "Hợi" }, chanAmQuy: { can: "Kỷ", chi: "Dậu" } },
  Mậu: { chanLoc: { can: "Đinh", chi: "Tỵ" }, chanDuongQuy: { can: "Ất", chi: "Sửu" }, chanAmQuy: { can: "Kỷ", chi: "Mùi" } },
  Kỷ: { chanLoc: { can: "Canh", chi: "Ngọ" }, chanDuongQuy: { can: "Bính", chi: "Tý" }, chanAmQuy: { can: "Nhâm", chi: "Thân" } },
  Canh: { chanLoc: { can: "Giáp", chi: "Thân" }, chanDuongQuy: { can: "Kỷ", chi: "Sửu" }, chanAmQuy: { can: "Quý", chi: "Mùi" } },
  Tân: { chanLoc: { can: "Đinh", chi: "Dậu" }, chanDuongQuy: { can: "Canh", chi: "Dần" }, chanAmQuy: { can: "Giáp", chi: "Ngọ" } },
  Nhâm: { chanLoc: { can: "Tân", chi: "Hợi" }, chanDuongQuy: { can: "Quý", chi: "Mão" }, chanAmQuy: { can: "Ất", chi: "Tỵ" } },
  Quý: { chanLoc: { can: "Giáp", chi: "Tý" }, chanDuongQuy: { can: "Ất", chi: "Mão" }, chanAmQuy: { can: "Đinh", chi: "Tỵ" } },
};

export function getChanLocQuyNhan(canNam: Can): ChanCatTinh {
  return CHAN_LOC_QUY_NHAN[canNam];
}

export interface KetQuaChanCatTinh {
  /** Khớp CẢ Can+Chi trụ Chân Lộc — tốt nhất. */
  chanLoc: boolean;
  chanDuongQuy: boolean;
  chanAmQuy: boolean;
  /**
   * Lộc theo ĐỊA CHI (Lộc Tồn) — chỉ cần Chi ngày trùng Chi Lộc, không cần đúng Can. "Tạm được"
   * khi không có Chân Lộc. `chanLoc` là tập con của `loc` (Chân Lộc thì đương nhiên đúng chi Lộc).
   */
  loc: boolean;
}

/**
 * Xét một NGÀY (Can+Chi ngày) theo Can năm sinh `canNam`:
 * - `chanLoc`/`chanDuongQuy`/`chanAmQuy`: khớp đủ CẢ Can lẫn Chi của trụ tương ứng.
 * - `loc`: chỉ cần Chi ngày trùng Chi của trụ Chân Lộc (chi Lộc Tồn) — mức "tạm được".
 */
export function xetChanLocQuyNhan(dayCan: Can, dayChi: Chi, canNam: Can): KetQuaChanCatTinh {
  const t = CHAN_LOC_QUY_NHAN[canNam];
  const khop = (p: TruCanChi) => p.can === dayCan && p.chi === dayChi;
  return {
    chanLoc: khop(t.chanLoc),
    chanDuongQuy: khop(t.chanDuongQuy),
    chanAmQuy: khop(t.chanAmQuy),
    loc: dayChi === t.chanLoc.chi,
  };
}
