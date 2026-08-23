/**
 * Nhãn hiển thị + kiểu dữ liệu dùng chung cho module Sim Phong Thủy Khai Vận Khí — tách riêng ra
 * `lib/` (thay vì để trong `pages/api/.../_chung.ts`) vì `lib/db/orders.ts` cần import TĨNH để dựng
 * email báo cáo cho anh Công; import ngược từ lib vào pages/api không đúng quy ước của dự án và có
 * thể không ổn định khi build production (pages/api chỉ nên được Astro router nạp).
 */

export const MONG_MUON_HOP_LE = [
  "suc-khoe-quy-nhan",
  "quy-nhan-tai-loc-thu-tai",
  "tai-loc-nhan-duyen",
  "cong-danh-su-nghiep",
  "khau-tai",
  "tri-tue-tai-hoa",
  "suc-khoe-quy-nhan-tai-loc",
  "quy-nhan-chieu-cam-bat-phuong-tai",
  "dau-tu-sinh-tai-loc",
  "sim-hoc-sinh",
  "sim-nguoi-gia",
  "khac",
] as const;

export const MANG_HOP_LE = ["vina", "mobi", "viettel", "vietnamobile"] as const;
export const DAU_SO_HOP_LE = ["09", "08", "07", "03"] as const;
export const KHOANG_GIA_HOP_LE = [
  "1tr-2tr",
  "2tr-3tr",
  "3tr-5tr",
  "5tr-7tr",
  "7tr-10tr",
  "10tr-15tr",
  "15tr-20tr",
  "tren-20tr",
] as const;

export interface SimPhongThuyInput {
  hoTen: string;
  soDienThoaiZalo: string;
  gioiTinh: "nam" | "nu";
  ngaySinh: { year: number; month: number; day: number };
  /** Giờ sinh 0-23, bỏ trống nếu khách không nhớ (form gốc cho phép bỏ qua). */
  gioSinh?: number;
  soCCCD: string;
  diaChiNhanSim: string;
  congViecHienTai: string;
  mongMuonTimSim: (typeof MONG_MUON_HOP_LE)[number];
  /** Chỉ có nghĩa khi mongMuonTimSim === "khac". */
  mongMuonKhac?: string;
  mangMongMuon: (typeof MANG_HOP_LE)[number];
  dauSoUuTien: (typeof DAU_SO_HOP_LE)[number][];
  khoangGia: (typeof KHOANG_GIA_HOP_LE)[number];
  yeuCauRieng?: string;
}

export const NHAN_MONG_MUON: Record<SimPhongThuyInput["mongMuonTimSim"], string> = {
  "suc-khoe-quy-nhan": "Sức khỏe + quý nhân",
  "quy-nhan-tai-loc-thu-tai": "Quý nhân + tài lộc + thủ tài",
  "tai-loc-nhan-duyen": "Tài lộc & nhân duyên",
  "cong-danh-su-nghiep": "Công danh sự nghiệp",
  "khau-tai": "Khẩu tài, nói ra tiền (sale, spa...)",
  "tri-tue-tai-hoa": "Trí tuệ, tài hoa sinh tài lộc (thiết kế, đồ họa, xây dựng, truyền thông...)",
  "suc-khoe-quy-nhan-tai-loc": "Sức khỏe + quý nhân + tài lộc",
  "quy-nhan-chieu-cam-bat-phuong-tai": "Quý nhân chiêu cảm bát phương tài",
  "dau-tu-sinh-tai-loc": "Đầu tư sinh tài lộc",
  "sim-hoc-sinh": "Sim học sinh",
  "sim-nguoi-gia": "Sim người già",
  khac: "Mục khác",
};

export const NHAN_MANG: Record<SimPhongThuyInput["mangMongMuon"], string> = {
  vina: "Vinaphone",
  mobi: "Mobifone",
  viettel: "Viettel",
  vietnamobile: "Vietnamobile",
};

export const NHAN_KHOANG_GIA: Record<SimPhongThuyInput["khoangGia"], string> = {
  "1tr-2tr": "1 - 2 triệu",
  "2tr-3tr": "2 - 3 triệu",
  "3tr-5tr": "3 - 5 triệu",
  "5tr-7tr": "5 - 7 triệu",
  "7tr-10tr": "7 - 10 triệu",
  "10tr-15tr": "10 - 15 triệu",
  "15tr-20tr": "15 - 20 triệu",
  "tren-20tr": "Trên 20 triệu",
};
