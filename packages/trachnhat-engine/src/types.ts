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
  /** Ngày Âm lịch có rơi vào mùng 5/14/23 (Nguyệt Kỵ, còn gọi Ngũ Quỷ) hay không. */
  nguyetKy: boolean;
  /** Ngày Âm lịch có rơi vào mùng 3/7/13/18/22/27 (Tam Nương Sát) hay không. */
  tamNuong: boolean;
  /** Ngày Âm lịch có phải 1 trong 13 ngày Dương Công Kỵ Nhật hay không. */
  duongCongKyNhat: boolean;
  /** (Các) nhóm tuổi (mỗi nhóm 3 Chi tam hợp) đang phạm hạn Tam Tai trong năm này. */
  nhomTuoiPhamTamTai: string[][];
  /** Ngày này có phải Sát Chủ theo mùa (Xuân/Hạ/Thu/Đông) hay không. */
  satChu: boolean;
  /** (Các) Can năm sinh bị kỵ Kim Thần Thất Sát (động thổ, tu tạo) vào đúng ngày này. */
  canNamSinhKyKimThanThatSat: string[];
  /** Ngày Bách Kỵ — kỵ theo Can/Chi của chính ngày này (0-2 kết quả, xem rule-engine/ngayBachKy.ts). */
  bachKyNgay: { nhan: string; viec: string }[];
  /** Ngày này có tốt để gội đầu hay không (theo ngày Âm lịch trong tháng hoặc Trực). */
  ngayGoiDauTot: boolean;
  /** Ngày này có đẹp để cắt tóc/cạo đầu/trang điểm hay không (Trực Trừ hoặc có Giải Thần). */
  catTocDep: boolean;
  /** Ngày này có phải Thiên Đức Hợp của tháng Âm lịch hay không. */
  thienDucHop: boolean;
  /** Ngày này có phải Thiên Xá của mùa (chia theo tháng Âm lịch) hay không. */
  thienXa: boolean;
  gio12: GioTrongNgay[];
}
