/**
 * Kiểu dữ liệu chung cho Tính Danh Học (Việt Danh Học).
 *
 * Nguyên tắc xuyên suốt: chỗ nào thiếu dữ liệu chuẩn thì trả cảnh báo rõ ở `canhBaoThieuDuLieu`,
 * KHÔNG âm thầm dùng giá trị đoán.
 */

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
export type GioiTinh = "nam" | "nu";

/** Mã hành trong dữ liệu JSON dùng chữ Latinh không dấu. */
export type MaHanh = "Kim" | "Moc" | "Thuy" | "Hoa" | "Tho";

/** Một trụ Can Chi. */
export interface Tru {
  can: string;
  chi: string;
  /** Ngũ hành của Thiên Can trụ này. */
  nguHanhCan: NguHanh;
}

export interface TuTru {
  nam: Tru;
  thang: Tru;
  ngay: Tru;
  /** Trụ giờ — chỉ có khi khách nhập giờ sinh. */
  gio: Tru | null;
}

/** Điểm ngũ hành trong Tứ Trụ (thấu can = 1, tàng can = 0.5). */
export type DiemNguHanh = Record<NguHanh, number>;

export interface HanhKhuyet {
  hanh: NguHanh;
  giaiThich: string;
}

export type CatHung = "cat" | "hung" | "banCatBanHung" | "binhHoa";

/** Một cục trong Tứ Đại Cục. */
export interface Cuc {
  so: number;
  ten: string | null;
  yNghia: string;
  catHung: CatHung;
}

/** Mệnh Cục gồm Tĩnh Cục (gốc) và Động Cục (ngọn). */
export interface MenhCuc {
  tinhCuc: Cuc;
  dongCuc: Cuc;
  /** Đọc kết hợp TC + ĐC. */
  luanKetHop: string;
}

export interface TuDaiCuc {
  menhCuc: MenhCuc;
  tienVan: Cuc;
  hauVan: Cuc;
  phucDucCuc: Cuc;
  tuTucCuc: Cuc;
}

/** Một tên ứng viên đã chấm điểm (chức năng gợi ý). */
export interface TenGoiY {
  hoTenDayDu: string;
  /** Chỉ phần tên riêng được gợi ý. */
  ten: string;
  hanh: NguHanh;
  yNghia: string | null;
  soNet: number | null;
  menhCuc: MenhCuc;
  diem: number;
  /** Điền Thực / Phản Thực / Bất Tương so với Hành Khuyết. */
  loaiTinhDanh: "Điền Thực" | "Bất Tương";
}

export interface GoiYTenInput {
  ho: string;
  /** Các chữ đệm (có thể rỗng). */
  dem?: string[];
  gioiTinh: GioiTinh;
  /** Ngày sinh dương lịch. */
  nam: number;
  thang: number;
  ngay: number;
  /** Giờ sinh 0-23, không nhập thì chạy 3 trụ. */
  gio?: number;
  phut?: number;
  /** Số tên muốn gợi ý, mặc định 15. */
  soLuong?: number;
}

export interface GoiYTenResult {
  ho: string;
  gioiTinh: GioiTinh;
  tuTru: TuTru;
  diemNguHanh: DiemNguHanh;
  /** Tỷ lệ % từng hành để vẽ đồ hình tròn. */
  tyLeNguHanh: Record<NguHanh, number>;
  hanhKhuyetKhaDi: HanhKhuyet[];
  danhSachTen: TenGoiY[];
  canhBaoThieuDuLieu: string[];
}
