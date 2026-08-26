// Danh sách 15 công cụ con của "Đại Cát Lợi" — tách ra file .ts riêng (thay vì khai báo trong
// dai-cat-loi/index.astro) để api/search.ts (endpoint .ts thuần, không qua Astro compiler) import được an
// toàn, tránh lỗi resolve module khi import trực tiếp từ file .astro.
export type DaiCatLoiTool = { href: string; icon: string; title: string; desc: string };

// Các công cụ ĐỘC LẬP (không nằm trong nhóm Đại Cát Lợi) — khai báo ở đây làm nguồn duy nhất để trang chủ
// (StatsSection/ToolsShowcase) đếm tổng số công cụ mà không bị lệch nhau khi thêm/bớt về sau.
export const STANDALONE_TOOL_PATHS = [
  "/lap-la-so-tu-vi",
  "/lap-la-so-bat-tu",
  "/gieo-que-kinh-dich",
  "/xem-ngay-tot-xau",
  "/tinh-trung-tang",
  "/tra-cuu-menh",
  "/luan-so-dien-thoai",
] as const;

export const daiCatLoiTools: DaiCatLoiTool[] = [
  {
    href: "/dai-cat-loi/ngay-dai-cat-ca-nhan",
    icon: "🌟",
    title: "Ngày Đại Cát Cá Nhân",
    desc: "Quét cả tháng, tìm 3-5 ngày tốt nhất dành riêng cho tuổi của bạn.",
  },
  {
    href: "/dai-cat-loi/ngay-ky-hop-dong",
    icon: "✍️",
    title: "Ngày Ký Hợp Đồng",
    desc: "Tìm ngày đẹp cho ký kết, giao dịch, hợp tác — có thể xét tuổi người ký.",
  },
  {
    href: "/dai-cat-loi/gio-tot-trong-ngay",
    icon: "⏰",
    title: "Giờ Tốt Trong Ngày",
    desc: "Xếp hạng đủ 12 giờ Địa Chi trong 1 ngày, có thể chọn theo mục đích.",
  },
  {
    href: "/dai-cat-loi/ngay-khai-truong",
    icon: "🏪",
    title: "Ngày Khai Trương",
    desc: "Tìm ngày đẹp để mở cửa kinh doanh, khai trương — có thể xét tuổi chủ.",
  },
  {
    href: "/dai-cat-loi/tuoi-hop-lam-an",
    icon: "🤝",
    title: "Tuổi Hợp Làm Ăn",
    desc: "Xem mức độ hợp nhau của 2 người khi hợp tác làm ăn, kinh doanh, đầu tư.",
  },
  {
    href: "/dai-cat-loi/doi-lich-am-duong",
    icon: "🌓",
    title: "Đổi Dương Lịch ↔ Âm Lịch",
    desc: "Chuyển đổi hai chiều giữa Dương lịch và Âm lịch Việt Nam, có xử lý tháng nhuận.",
  },
  {
    href: "/dai-cat-loi/hoang-oc-kim-lau",
    icon: "🏚️",
    title: "Hoàng Ốc – Kim Lâu – Tam Tai",
    desc: "Tính Hoàng Ốc, Kim Lâu, Tam Tai theo tuổi — tham khảo khi định xây/sửa nhà, việc lớn.",
  },
  {
    href: "/dai-cat-loi/chon-tuoi-ket-hon",
    icon: "❤️",
    title: "Chọn Tuổi Kết Hôn",
    desc: "So sánh 2 tuổi theo Mệnh, Can, Chi, Cung Mệnh Bát Trạch và Niên Mệnh — hoặc tìm tuổi hợp nhất.",
  },
  {
    href: "/dai-cat-loi/chon-nam-sinh-con",
    icon: "👶",
    title: "Chọn Năm Sinh Con",
    desc: "Tìm năm sinh con hợp nhất với cả cha và mẹ, quét theo khoảng năm và xếp hạng.",
  },
  {
    href: "/dai-cat-loi/xem-tuoi-xong-dat",
    icon: "🧧",
    title: "Xem Tuổi Xông Đất – Xông Nhà",
    desc: "Tìm tuổi xông đất/xông nhà đầu năm hợp gia chủ, tự loại trừ tuổi xung khắc và xếp hạng.",
  },
  {
    href: "/dai-cat-loi/chon-ngay-giao-dich",
    icon: "🏠🚗",
    title: "Chọn Ngày Giao Dịch / Nhận Tài Sản",
    desc: "Tìm ngày đẹp cho mua/nhận nhà, mua/nhận xe — xếp hạng ngày rồi xem luôn giờ tốt.",
  },
  {
    href: "/dai-cat-loi/ngay-le-vieng-mo",
    icon: "🙏",
    title: "Ngày Tốt Đi Lễ – Viếng Mộ",
    desc: "Tìm ngày tốt để đi lễ chùa/đền/phủ cầu an, hoặc viếng mộ/tảo mộ — có nhận diện tiết Thanh Minh.",
  },
  {
    href: "/dai-cat-loi/ngay-khai-quang",
    icon: "🪔",
    title: "Ngày Giờ Khai Quang",
    desc: "Tìm ngày giờ tốt để khai quang, an vị, thỉnh vật phẩm phong thủy — xét tuổi chủ và mục đích cụ thể.",
  },
  {
    href: "/dai-cat-loi/ngay-gio-xuat-hanh",
    icon: "🧭",
    title: "Ngày Giờ Xuất Hành Cá Nhân",
    desc: "Tìm ngày và giờ xuất hành tốt nhất cho riêng bạn — kết hợp Trạch Cát ngày, Tiểu Lục Nhâm giờ, tuổi và mục đích.",
  },
  {
    href: "/dai-cat-loi/sua-chua-cai-tao-nha",
    icon: "🛠️",
    title: "Chọn Ngày Giờ Sửa Chữa – Cải Tạo Nhà",
    desc: "Kiểm tra Thái Tuế/Tuế Phá/Tam Sát tại phương vị định động, Kim Lâu/Hoàng Ốc/Tam Tai của chủ, rồi tìm ngày giờ tốt nhất.",
  },
];

/**
 * Tổng số công cụ tra cứu của site = nhóm Đại Cát Lợi + các công cụ độc lập.
 * Khai báo SAU mảng daiCatLoiTools (không thể đặt trên đầu file vì sẽ đọc biến khi chưa khởi tạo).
 * KHÔNG cộng `paidTools` vào đây — con số này gắn với thông điệp "miễn phí" trên trang chủ.
 */
export const TOTAL_TOOL_COUNT = daiCatLoiTools.length + STANDALONE_TOOL_PATHS.length;

// Nhóm "Dịch vụ VIP" (trước tên "Dịch vụ thu phí") — tách riêng khỏi daiCatLoiTools (miễn phí) theo yêu cầu Công, có hub
// riêng (/dai-cat-loi/dich-vu-thu-phi) và badge giá tiền nổi bật trên từng thẻ.
export type PaidTool = {
  href: string;
  icon: string;
  title: string;
  desc: string;
  priceLabel: string;
  /** true = đang thử nghiệm nội bộ, CHỈ hiện thẻ cho tài khoản quản trị (khách không thấy). */
  adminOnly?: boolean;
  /** true = gắn nhãn "BEST ⭐" nổi bật trên thẻ (dịch vụ đề cử). */
  best?: boolean;
};

export const paidTools: PaidTool[] = [
  // "Định Hướng Nghề Nghiệp" KHÔNG lặp lại ở đây — chỉ vào qua menu chính "Công cụ" (nhãn BEST ⭐,
  // xem site-config.ts) để tránh hiện trùng cả ở Đại Cát Lợi lẫn Dịch vụ VIP (yêu cầu anh Công).
  {
    href: "/dai-cat-loi/gio-liem-ha-huyet",
    icon: "🕯️",
    title: "Chọn Giờ Liệm – Đóng Quan – Ngày Giờ Hạ Huyệt",
    desc: "Dành cho trường hợp KHÔNG phạm Trùng Tang — xếp hạng giờ liệm/đóng quan và ngày giờ hạ huyệt theo Chưởng Pháp Nhập Mộ – Thiên Di, có sàng thần sát an táng và xét tuổi thân quyến.",
    priceLabel: "499.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/xem-ngay-cao-cap",
    icon: "🧭",
    title: "Xem Ngày Cao Cấp – Động Thổ / Nhập Trạch",
    desc: "Giám định ngày theo Huyền Không Đại Quái: lọc Ngũ Hoàng/Tam Sát/Bát Sát/Thái Tuế trước, rồi luận cách cục Tam Tài Thiên – Địa – Nhân giao.",
    priceLabel: "999.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/ngay-ky-hop-dong-cao-cap",
    icon: "✍️",
    title: "Ngày Giờ Ký Kết Hợp Đồng – Bản Cao Cấp",
    desc: "Lọc loại ngày đại kỵ trước, rồi chấm điểm theo Thập Nhị Trực, 28 Tú, Tiểu Lục Nhâm và lớp Thập Thần theo Nhật Chủ người ký. Chọn luôn giờ ký trong ngày.",
    priceLabel: "299.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/ngay-cuoi-hoi",
    icon: "💍",
    title: "Xem Ngày Cưới Hỏi Trọn Gói",
    desc: "Chọn ngày & giờ đẹp cho cả chuỗi cưới hỏi (ăn hỏi, đón dâu, thành hôn, đăng ký) — chấm điểm riêng cô dâu, chú rể rồi cân cặp đôi, lập lịch cả 4 nghi lễ theo trình tự thời gian.",
    priceLabel: "499.000đ / lượt",
    // Khách THẤY thẻ này bình thường nhưng CHƯA dùng được — trang tự hiện "sắp ra mắt" cho khách,
    // chỉ tài khoản quản trị mới chạy được (đang thử nghiệm). Khi phát hành thì bỏ khoá ở trang.
  },
  {
    href: "/dai-cat-loi/dat-ten-cho-con",
    icon: "🍼",
    title: "Đặt Tên Cho Con Theo Việt Danh Học",
    desc: "Từ ngày giờ sinh của bé, hệ thống lập Tứ Trụ theo tiết khí, chỉ ra ngũ hành còn thiếu cần bổ, rồi gợi ý danh sách tên đẹp hợp mệnh — mỗi tên chấm điểm theo Tứ Đại Cục 81 số.",
    priceLabel: "499.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/nhan-chuc",
    icon: "🎖️",
    title: "Chọn Ngày Giờ Nhận Chức",
    desc: "Tìm ngày & giờ tốt để nhận chức, nhậm chức, bổ nhiệm — lọc hung sát trước (Kim Thần, Sát Chủ, Thọ Tử, Lục Xung tuổi), ưu tiên công danh theo 28 Tú, Thập Nhị Trực và lớp Thập Thần Chính Quan.",
    priceLabel: "499.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/ngay-khai-truong-cao-cap",
    icon: "🏪",
    title: "Chọn Ngày Khai Trương Cao Cấp (Bát Tự Mệnh Chủ)",
    desc: "Bản nâng cấp của Khai Trương thường: giữ nguyên điểm nền rồi chồng thêm lớp Bát Tự mệnh chủ — Thập Thần hợp cầu tài (Thê Tài/Thực Thương), xét cả Tứ Trụ (Nhật Chi, Tam Hình/Lục Hại) và Dụng Thần theo vượng suy (khi có giờ sinh).",
    priceLabel: "499.000đ / lượt",
  },
  {
    href: "/dai-cat-loi/trach-nhat-sinh-no",
    icon: "👶",
    title: "Chọn Ngày Giờ Sinh Cho Bé",
    desc: "Lập toàn bộ ứng viên trong khung bác sĩ cho phép, kết hợp Bát Tự (xếp hạng ngày: vượng suy, gốc, Ấn tinh, ngũ hành lưu thông, Đại Vận) và Tử Vi (chọn giờ: Mệnh/Thân/Cục, Tuần–Triệt, sát tinh) — trả phương án chính + 2 dự phòng, luôn nêu rõ khuyết điểm.",
    priceLabel: "499.000đ / lượt",
    // ⏸️ THỬ NGHIỆM NỘI BỘ (mới xây, chưa kiểm chứng nhiều ca thật + quyết định giờ sinh mổ có rủi
    // ro cao) — trang tự hiện "đang thử nghiệm" cho khách, chỉ admin dùng được. Mở khi anh Công duyệt.
  },
  {
    href: "/dai-cat-loi/trach-cat-ky-mon",
    icon: "🧿",
    title: "Trạch Cát Kỳ Môn (Chọn Ngày Giờ Theo Bàn Mệnh)",
    desc: "Khác các công cụ chọn ngày dùng lịch chung: lập riêng bàn Kỳ Môn Mệnh của chính chủ sự làm mẫu cục, nên hai người khác tuổi hỏi cùng một việc sẽ ra hai bộ ngày khác nhau. Lọc Kỳ Môn Tứ Hại, đối chiếu dụng thần riêng của từng việc (động thổ, nhập trạch, khai trương, xuất hành, an táng…), rồi xét 12 Kiến Tinh và 12 Trực Thần. Bấm vào một ngày sẽ lập tử cục để chọn luôn khung giờ.",
    priceLabel: "499.000đ / lượt",
    best: true,
    // ✅ Đã mở bán cho khách từ 26/8/2026 (anh Công duyệt).
  },
  {
    href: "/dai-cat-loi/sim-phong-thuy-khai-van",
    icon: "📱",
    title: "Sim Phong Thủy Khai Vận Khí",
    desc: "Đặt dịch vụ tìm sim hợp mệnh: gửi ngày giờ sinh, mục đích (tài lộc, công danh, quý nhân…), đầu số và ngân sách mong muốn — chuyên gia đối chiếu Bát Tự rồi chọn tay dãy số phù hợp, liên hệ qua Zalo/SĐT.",
    priceLabel: "999.999đ / lượt",
    // Dịch vụ THỦ CÔNG (không phải công cụ tính tự động): chuyên gia tìm sim thật từ kho số theo
    // Bát Tự khách cung cấp — không có "kết quả" trả ngay như các công cụ khác. Xem _chung.ts.
  },
];
