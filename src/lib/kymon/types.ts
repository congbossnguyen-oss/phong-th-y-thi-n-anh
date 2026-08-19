// Kiểu dữ liệu cho engine lập lá bàn Kỳ Môn Độn Giáp.
// Xem SPEC_cho_Claude_Code.md (Công đã gửi) để biết đầy đủ ngữ nghĩa từng trường.

export type AmDuong = "+" | "-";

export type CanChiPillar = {
  can: string;
  chi: string;
};

export type TuTru = {
  gio: CanChiPillar;
  ngay: CanChiPillar;
  thang: CanChiPillar;
  nam: CanChiPillar;
};

export type CungInfo = {
  soCung: number;
  huong: string;
  saoThienBan: string;
  mon: string;
  than: string;
  thienBanCan: string;
  diaBanCan: string;
  diaChi: string[];
  KV: boolean;
  Ma: boolean;
};

export type LapLaBanInput = {
  nam: number;
  thang: number;
  ngay: number;
  gio: number;
  phut: number;
};

export type LapLaBanResult = {
  tuTru: TuTru;
  cuc: number;
  amDuong: AmDuong;
  phuDau: string;
  tuanKhongChi: [string, string];
  trucPhu: string;
  trucPhuCung: number;
  trucSu: string;
  trucSuCung: number;
  cungList: CungInfo[];
  /** Cờ cảnh báo các phần chưa chắc chắn 100% — xem báo cáo kèm theo. */
  ghiChu: string[];
  /** Các giá trị trung gian của công thức Trực Phù/Trực Sử (mục 5 SPEC) — để đối chiếu tay
   * với Excel khi có sai lệch, tránh phải đoán lại từ đầu. */
  debugTrucSu: {
    W62: string;
    X62: string;
    W63: number;
    X63: number;
    Y63: number;
    traNguon: "bang_chinh_xac" | "xap_xi_du_phong";
    tra: number;
    X64: number;
    cuc: number;
    amDuong: AmDuong;
    X65: number;
    X66: number;
  };
};
