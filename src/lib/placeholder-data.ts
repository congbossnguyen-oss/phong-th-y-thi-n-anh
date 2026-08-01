// Dữ liệu tạm thời để dựng giao diện trước khi kết nối Sanity CMS thật (Giai đoạn 0/3).
// Khi có SANITY_PROJECT_ID, thay các import này bằng truy vấn từ src/lib/cms/queries.ts.

export const stats = [
  { value: "9.000+", label: "Khách hàng tin tưởng" },
  { value: "600+", label: "Công trình đã tư vấn" },
  { value: "10+", label: "Chuyên gia phong thủy" },
  { value: "15", label: "Năm kinh nghiệm" },
];

export const services = [
  {
    slug: "phong-thuy-nha-o",
    name: "Phong thủy nhà ở",
    summary: "Tư vấn bố cục, hướng nhà, nội thất hợp mệnh gia chủ để đón vượng khí.",
    priceFrom: "3.000.000đ",
  },
  {
    slug: "ho-so-trach-nhat",
    name: "Hồ sơ trạch nhật",
    summary: "Chọn ngày giờ tốt cho khai trương, động thổ, cưới hỏi, nhập trạch.",
    priceFrom: "1.500.000đ",
  },
  {
    slug: "ho-so-bat-tu",
    name: "Hồ sơ bát tự",
    summary: "Luận giải lá số bát tự: sự nghiệp, tài lộc, hôn nhân, sức khỏe.",
    priceFrom: "2.500.000đ",
  },
  {
    slug: "phong-thuy-van-phong",
    name: "Phong thủy văn phòng",
    summary: "Bố trí không gian làm việc, kinh doanh thu hút tài lộc, hanh thông.",
    priceFrom: "5.000.000đ",
  },
];

export const products = [
  {
    slug: "ty-huu-phong-thuy",
    name: "Tỳ Hưu Chiêu Tài",
    category: "Chiêu Tài - Kích Lộc",
    price: 1868000,
  },
  {
    slug: "thap-van-xuong",
    name: "Tháp Văn Xương",
    category: "Công Danh - Sự Nghiệp",
    price: 968000,
  },
  {
    slug: "guong-bat-quai",
    name: "Gương Bát Quái Trấn Trạch",
    category: "Hóa Sát - Trấn Trạch",
    price: 568000,
    image: "/images/products/guong-bat-quai.jpg",
  },
  {
    slug: "vong-tay-tram-huong",
    name: "Vòng Tay Trầm Hương",
    category: "Hoá Giải Vận Hạn",
    price: 2468000,
  },
];

export const testimonials = [
  {
    name: "Anh Minh Tuấn",
    role: "Chủ doanh nghiệp, Hà Nội",
    quote:
      "Sau khi được Thiên Anh tư vấn lại bố cục văn phòng, công việc kinh doanh của tôi thuận lợi hẳn, đối tác tự tìm đến nhiều hơn.",
    rating: 5,
  },
  {
    name: "Chị Thu Hà",
    role: "Khách hàng cá nhân, TP.HCM",
    quote:
      "Đội ngũ chuyên gia rất tận tâm, giải thích cặn kẽ từng luận điểm chứ không chung chung. Rất an tâm khi nhờ tư vấn nhà mới.",
    rating: 5,
  },
  {
    name: "Anh Quang Huy",
    role: "Chủ đầu tư dự án, Đà Nẵng",
    quote:
      "Thiên Anh hỗ trợ chọn ngày động thổ và bố trí tổng thể dự án rất chuyên nghiệp, đúng tiến độ và cát lợi.",
    rating: 5,
  },
];

export const posts = [
  {
    slug: "phong-thuy-nam-2026",
    title: "Luận đoán phong thủy năm 2026: Những điều cần lưu ý",
    excerpt: "Tổng quan vận khí năm mới và những lưu ý quan trọng cho từng mệnh cung.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
  },
  {
    slug: "cach-bai-tri-ban-tho",
    title: "Cách bài trí bàn thờ gia tiên hợp phong thủy",
    excerpt: "Hướng dẫn chi tiết vị trí, hướng đặt và các vật phẩm cần thiết trên bàn thờ.",
    category: "Nhà ở",
    categorySlug: "nha-o",
  },
  {
    slug: "chon-huong-nha-hop-menh",
    title: "Bí quyết chọn hướng nhà hợp mệnh gia chủ",
    excerpt: "Phân tích Đông Tứ Trạch – Tây Tứ Trạch và cách áp dụng thực tế.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
  },
];

export const portfolio = [
  { slug: "biet-thu-vinhomes", title: "Biệt thự Vinhomes Ocean Park", location: "Hà Nội" },
  { slug: "van-phong-abc-tower", title: "Văn phòng ABC Tower", location: "TP.HCM" },
  { slug: "nha-pho-lien-ke", title: "Nhà phố liền kề Ecopark", location: "Hưng Yên" },
];
