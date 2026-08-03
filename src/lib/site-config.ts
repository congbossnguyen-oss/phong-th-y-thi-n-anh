// Thông tin chung của công ty — thay bằng dữ liệu thật (hoặc chuyển sang Sanity `siteSettings`
// singleton ở Giai đoạn 0/Sanity) khi có nội dung chính thức từ khách hàng.
export const siteConfig = {
  name: "Phong Thủy Thiên Anh",
  shortName: "Thiên Anh",
  tagline: "Kiến giải phong thủy — Kiến tạo an lành",
  description:
    "Phong Thủy Thiên Anh cung cấp dịch vụ tư vấn phong thủy nhà ở, văn phòng, chọn ngày, xem tuổi và vật phẩm phong thủy chính hiệu.",
  hotline: "0836.768.768",
  email: "lienhe@phongthuythienanh.com", // TODO: kích hoạt hòm mail thật (chuyển tiếp hoặc Zoho/Google Workspace)
  address: "Ô 11, B5, KĐT Đại Kim - Định Công, TP. Hà Nội",
  workingHours: "8:00 - 17:30, tất cả các ngày trong tuần",
  businessRegistration: "0000000000", // TODO: số ĐKKD thật
  social: {
    facebook: "https://www.facebook.com/ZhiGongFengShui",
    youtube: "#",
    zalo: "https://zalo.me/0836768768",
    tiktok: "https://www.facebook.com/ZhiGongFengShui",
  },
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const mainNav: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu/ve-cong-ty" },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Vật phẩm", href: "/vat-pham" },
  { label: "Khóa học", href: "/khoa-hoc" },
  { label: "Công trình", href: "/cong-trinh" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

export const footerPolicyLinks = [
  { label: "Câu hỏi thường gặp", href: "/cau-hoi-thuong-gap" },
  { label: "Chính sách bảo mật", href: "/chinh-sach/bao-mat" },
  { label: "Chính sách thanh toán & hoàn tiền", href: "/chinh-sach/thanh-toan-hoan-tien" },
  { label: "Chính sách vận chuyển", href: "/chinh-sach/van-chuyen" },
  { label: "Chính sách đặt lịch tư vấn", href: "/chinh-sach/dat-lich-tu-van" },
  { label: "Điều khoản sử dụng", href: "/chinh-sach/dieu-khoan" },
];
