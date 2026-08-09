/**
 * Input/Output của Trạch Nhật Engine — thiết kế đầy đủ ở docs/15-trach-nhat-engine.md mục
 * 2.1-2.2 (đã chủ dự án duyệt 2026-08-09). Thuần dữ liệu JSON-serializable, không chứa câu
 * luận giải (đúng Engine Contract mục 2.5).
 */

export interface TrachNhatInput {
  solarDate: { year: number; month: number; day: number };
  /** Tên múi giờ IANA, vd. "Asia/Ho_Chi_Minh". */
  timeZone: string;
}

export interface CanChiValue {
  can: string;
  chi: string;
}

export interface CatHungValue {
  name: string;
  catHung: "cát" | "hung";
}

export interface GioTrongNgay {
  /** Địa Chi giờ, Tý..Hợi. */
  chiGio: string;
  canChiGio: CanChiValue;
  hoangDaoHacDaoGio: CatHungValue;
  tieuLucNhamGio: CatHungValue;
}

export interface TrachNhatOutput {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  julianDayNumber: number;
  /** Tiết khí đang hiệu lực tại ngày này; null nếu nằm trước tiết khí đầu tiên đã biết. */
  tietKhi: { name: string } | null;
  tuTru: {
    nam: CanChiValue;
    thang: CanChiValue;
    ngay: CanChiValue;
  };
  truc: { index: number; name: string };
  nhiThapBatTu: { index: number; name: string; catHung: "cát" | "hung" };
  hoangDaoHacDaoNgay: "hoàng đạo" | "hắc đạo" | "không xác định";
  thanSat: CatHungValue[];
  tuoiXungNgay: string[];
  gio12: GioTrongNgay[];
}
