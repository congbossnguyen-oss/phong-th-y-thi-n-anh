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
    youtube: "https://www.youtube.com/@PhongthuyThienAnh",
    zalo: "https://zalo.me/0836768768",
    tiktok: "https://www.tiktok.com/@zhigong_fengshui",
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
      { label: "Phong Thủy Thiên Anh", href: "/gioi-thieu/ve-cong-ty" },
      { label: "Chuyên gia Zhi Gong", href: "/gioi-thieu/chuyen-gia-zhi-gong" },
    ],
  },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Vật phẩm", href: "/vat-pham" },
  { label: "Khóa học", href: "/khoa-hoc" },
  { label: "Công trình", href: "/cong-trinh" },
  {
    label: "Kiến thức",
    href: "/kien-thuc",
    children: [
      { label: "Tất cả bài viết", href: "/kien-thuc" },
      { label: "Thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    label: "Công cụ",
    href: "/dai-cat-loi",
    children: [
      { label: "Đại Cát Lợi", href: "/dai-cat-loi" },
      { label: "Lập lá số Bát Tự", href: "/lap-la-so-bat-tu" },
      { label: "Lập quẻ Kinh Dịch", href: "/gieo-que-kinh-dich" },
      { label: "Lập lá số Tử Vi", href: "/lap-la-so-tu-vi" },
      { label: "Xem ngày tốt xấu", href: "/xem-ngay-tot-xau" },
      { label: "Luận số điện thoại", href: "/luan-so-dien-thoai" },
      { label: "Tính Trùng Tang", href: "/tinh-trung-tang" },
      { label: "⭐ Dịch vụ VIP", href: "/dai-cat-loi/dich-vu-thu-phi" },
    ],
  },
];

export const footerPolicyLinks = [
  { label: "Câu hỏi thường gặp", href: "/cau-hoi-thuong-gap" },
  { label: "Chính sách bảo mật", href: "/chinh-sach/bao-mat" },
  { label: "Chính sách thanh toán & hoàn tiền", href: "/chinh-sach/thanh-toan-hoan-tien" },
  { label: "Chính sách vận chuyển", href: "/chinh-sach/van-chuyen" },
  { label: "Chính sách đặt lịch tư vấn", href: "/chinh-sach/dat-lich-tu-van" },
  { label: "Điều khoản sử dụng", href: "/chinh-sach/dieu-khoan" },
];
