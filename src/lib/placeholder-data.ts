// Dữ liệu tạm thời để dựng giao diện trước khi kết nối Sanity CMS thật (Giai đoạn 0/3).
// Khi có SANITY_PROJECT_ID, thay các import này bằng truy vấn từ src/lib/cms/queries.ts.

export const stats = [
  { value: "1000+", label: "Khách hàng tin tưởng" },
  { value: "10", label: "Năm kinh nghiệm" },
];

export const services = [
  {
    slug: "phong-thuy-nha-o",
    name: "Phong thủy nhà ở",
    summary: "Tư vấn bố cục, hướng nhà, nội thất hợp mệnh gia chủ để đón vượng khí.",
    priceFrom: "3.000.000đ – 5.000.000đ",
    image: "/images/services/phong-thuy-nha-o.jpg",
  },
  {
    slug: "xem-ngay-cao-cap",
    name: "Xem ngày cao cấp",
    summary: "Chọn ngày giờ tốt cho khai trương, động thổ, cưới hỏi, nhập trạch.",
    priceFrom: "1.000.000đ",
    image: "/images/services/xem-ngay-cao-cap.jpg",
  },
  {
    slug: "bat-tu",
    name: "Bát tự",
    summary: "Luận giải lá số bát tự: sự nghiệp, tài lộc, hôn nhân, sức khỏe.",
    priceFrom: "2.000.000đ – 3.000.000đ",
    image: "/images/services/bat-tu.png",
  },
  {
    slug: "phong-thuy-van-phong",
    name: "Phong thủy văn phòng",
    summary: "Bố trí không gian làm việc, kinh doanh thu hút tài lộc, hanh thông.",
    priceFrom: "5.000.000đ – 10.000.000đ",
    image: "/images/services/phong-thuy-van-phong.jpg",
  },
  {
    slug: "phong-thuy-nha-chuyen-sau",
    name: "Phong thủy nhà chuyên sâu",
    summary: "Luận giải toàn diện nhà ở theo nhiều trường phái, khảo sát thực địa và báo cáo chi tiết chuyên sâu.",
    priceFrom: "15.000.000đ – 20.000.000đ",
    image: "/images/services/phong-thuy-nha-chuyen-sau.jpg",
  },
  {
    slug: "sim-so-phong-thuy",
    name: "Sim Số Phong Thủy Kích Vận Khí",
    summary: "Lựa chọn sim số hợp bản mệnh theo nguyên lý Âm Dương - Ngũ Hành, giúp hài hòa năng lượng và đồng hành trên hành trình phát triển.",
    priceFrom: "Liên hệ",
    image: "/images/services/sim-so-phong-thuy.jpg",
  },
  {
    slug: "cung-dong-tho-nhap-trach-lap-ban-than-tai",
    name: "Cúng động thổ, nhập trạch, lập bàn thần tài",
    summary: "Thực hiện nghi lễ cúng động thổ, nhập trạch và lập bàn thờ Thần Tài đúng nghi thức, chọn ngày giờ hợp mệnh gia chủ.",
    priceFrom: "5.000.000đ – 7.000.000đ",
    image: "/images/services/cung-dong-tho-nhap-trach-lap-ban-than-tai.jpg",
  },
  {
    slug: "chon-ngay-gio-sinh",
    name: "Chọn ngày giờ sinh (sinh mổ)",
    summary: "Chọn ngày giờ sinh mổ tốt dựa trên thông tin bác sĩ đưa ra, giúp con hợp mệnh và khởi đầu vận trình thuận lợi.",
    priceFrom: "1.000.000đ",
    image: "/images/services/chon-ngay-gio-sinh.jpg",
  },
  {
    slug: "luan-que-kinh-dich-ky-mon",
    name: "Luận quẻ Kinh Dịch - Kỳ Môn",
    summary: "Luận giải sự vụ, tài vận, quan vận, nhân duyên, sức khỏe... qua quẻ Kinh Dịch và Kỳ Môn Độn Giáp.",
    priceFrom: "500.000đ – 1.000.000đ",
    image: "/images/services/luan-que-kinh-dich-ky-mon.jpg",
  },
  {
    slug: "co-van-chien-luoc-toan-dien",
    name: "Cố vấn chiến lược toàn diện (dành cho doanh nghiệp)",
    summary: "Hỗ trợ tuyển dụng nhân sự, bố trí sắp xếp cán bộ cấp cao, hóa giải sự vụ, bố trí phong thủy công ty, xem ngày giờ ký kết... đồng hành cùng doanh nghiệp trong 1 năm.",
    priceFrom: "30.000.000đ – 50.000.000đ / năm",
    image: "/images/services/co-van-chien-luoc-toan-dien.jpg",
  },
];

export const products = [
  {
    slug: "ty-huu-phong-thuy",
    name: "Tỳ Hưu Chiêu Tài",
    category: "Chiêu Tài - Kích Lộc",
    price: 1868000,
    image: "/images/products/ty-huu-phong-thuy.jpeg",
    description: "Tỳ Hưu là linh vật phong thủy giúp chiêu tài, giữ lộc và trấn trạch trừ tà khí cho gia chủ.",
    benefits: [
      {
        title: "Hút tiền tài",
        desc: "Giúp công việc kinh doanh buôn bán thuận lợi, hồng phát và thu hút nguồn vượng khí lớn cho gia chủ.",
      },
      {
        title: "Giữ của cải",
        desc: "Ngăn không cho tiền bạc thất thoát ra ngoài, phù hợp cho người làm ăn, buôn bán lớn.",
      },
      {
        title: "Xua đuổi tà ma",
        desc: "Đặt tượng tỳ hưu trong nhà giúp bảo vệ bình yên cho các thành viên, ngăn chặn năng lượng xấu.",
      },
      {
        title: "Hóa giải sát khí",
        desc: "Giảm bớt vận hạn và những hướng nhà xấu theo quan niệm phong thủy.",
      },
    ],
  },
  {
    slug: "thap-van-xuong",
    name: "Tháp Văn Xương",
    category: "Công Danh - Sự Nghiệp",
    price: 968000,
    image: "/images/products/thap-van-xuong.jpg",
    description: "Tháp Văn Xương hỗ trợ khai mở trí tuệ, thúc đẩy công danh và mang lại bình an, may mắn cho gia chủ.",
    benefits: [
      {
        title: "Khai mở trí tuệ",
        desc: "Giúp người học tăng cường sự tập trung, ghi nhớ tốt hơn và sáng suốt trong các kỳ thi cử.",
      },
      {
        title: "Thúc đẩy công danh",
        desc: "Hỗ trợ người đi làm phát triển sự nghiệp, dễ thăng quan tiến chức hoặc đạt thành tựu cao trong nghiên cứu, quản lý.",
      },
      {
        title: "Xua đuổi uế khí",
        desc: "Trừ tà ma, xui rủi và thanh lọc các nguồn năng lượng tiêu cực xung quanh chủ nhân.",
      },
      {
        title: "Thu hút may mắn",
        desc: "Mang lại vượng khí, tài lộc và sự hanh thông cho người làm ăn, kinh doanh.",
      },
      {
        title: "Biểu tượng bình an",
        desc: "Giúp tâm tính bình tĩnh, từ bi và hướng thiện hơn trong cuộc sống.",
      },
    ],
  },
  {
    slug: "guong-bat-quai",
    name: "Gương Bát Quái Ma Phương",
    category: "Hóa Sát - Trấn Trạch",
    price: 1000000,
    image: "/images/products/guong-bat-quai.jpg",
    description:
      "Vật phẩm được lựa chọn kỹ lưỡng, phù hợp cho mục đích hóa sát - trấn trạch. Hóa giải hướng xấu ngũ quỷ, tuyệt mạng, họa hại lục sát, không vong.",
  },
  {
    slug: "vong-tay-tram-huong",
    name: "Vòng Tay Trầm Hương",
    category: "Hoá Giải Vận Hạn",
    price: 2468000,
    image: "/images/products/vong-tay-tram-huong.jpg",
    description:
      "Vòng Tay Trầm Hương mang ý nghĩa phong thủy và tâm linh sâu sắc, giúp xua đuổi tà khí, thu hút tài lộc và cân bằng năng lượng cho người đeo.",
    benefits: [
      {
        title: "Xua đuổi tà khí",
        desc: "Vòng được xem là vật phẩm giúp loại bỏ uế khí, tạp khí và bảo vệ chủ nhân.",
      },
      {
        title: "Thu hút tài lộc",
        desc: "Mang lại may mắn, bình an và thuận lợi cho người làm ăn, kinh doanh.",
      },
      {
        title: "Cân bằng năng lượng",
        desc: "Tượng trưng cho linh khí đất trời, giúp tinh thần người đeo luôn lạc quan và an yên.",
      },
    ],
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
  {
    slug: "biet-thu-vinhomes-riverside",
    title: "Biệt thự Vinhomes Riverside",
    location: "Hà Nội",
    image: "/images/portfolio/biet-thu-vinhomes-riverside.jpg",
  },
  {
    slug: "van-phong-lanh-dao-agribank",
    title: "Phòng làm việc lãnh đạo Agribank",
    location: "Hà Nội",
    image: "/images/portfolio/van-phong-agribank.jpg",
  },
  {
    slug: "showroom-oto-hai-phong",
    title: "Showroom ô tô",
    location: "Hải Phòng",
    image: "/images/portfolio/showroom-oto-hai-phong.jpg",
  },
];
