// Thông tin chung của công ty — thay bằng dữ liệu thật (hoặc chuyển sang Sanity `siteSettings`
// singleton ở Giai đoạn 0/Sanity) khi có nội dung chính thức từ khách hàng.
export const siteConfig = {
  name: "Phong Thủy Thiên Anh",
  shortName: "Thiên Anh",
  tagline: "Kiến giải phong thủy — Kiến tạo an lành",
  description:
    "Phong Thủy Thiên Anh cung cấp dịch vụ tư vấn phong thủy nhà ở, văn phòng, chọn ngày, xem tuổi và vật phẩm phong thủy chính hiệu.",
  hotline: "0900 000 000", // TODO: thay số hotline thật
  email: "lienhe@phongthuythienanh.vn", // TODO
  address: "Số 1, Đường ABC, Quận XYZ, Hà Nội", // TODO
  workingHours: "8:00 - 17:30, tất cả các ngày trong tuần",
  businessRegistration: "0000000000", // TODO: số ĐKKD thật
  social: {
    facebook: "#",
    youtube: "#",
    zalo: "#",
    tiktok: "#",
  },
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const mainNav: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Giới thiệu",
    href: "/gioi-thieu/ve-cong-ty",
    children: [
      { label: "Về Thiên Anh", href: "/gioi-thieu/ve-cong-ty" },
      { label: "Đội ngũ chuyên gia", href: "/gioi-thieu/doi-ngu" },
      { label: "Tuyển dụng", href: "/gioi-thieu/tuyen-dung" },
    ],
  },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Vật phẩm", href: "/vat-pham" },
  { label: "Khóa học", href: "/khoa-hoc" },
  { label: "Công trình", href: "/cong-trinh" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

export const footerPolicyLinks = [
  { label: "Chính sách bảo mật", href: "/chinh-sach/bao-mat" },
  { label: "Chính sách đổi trả", href: "/chinh-sach/doi-tra" },
  { label: "Chính sách vận chuyển", href: "/chinh-sach/van-chuyen" },
  { label: "Điều khoản sử dụng", href: "/chinh-sach/dieu-khoan" },
];
