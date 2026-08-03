// "Bạn sẽ học được gì" riêng cho từng khóa học — trước đây dùng chung 4 gạch đầu dòng cho cả
// 26 khóa, đây cũng là một dạng nội dung tự sinh hàng loạt cần khắc phục theo audit SEO.
export const courseOutcomes: Record<string, string[]> = {
  "bat-tu-nhap-mon": [
    "Hiểu hệ thống Can Chi, Ngũ Hành tương sinh - tương khắc",
    "Biết cách lập lá số Tứ Trụ từ ngày giờ sinh",
    "Đọc hiểu vượng suy sơ bộ của Nhật Chủ",
    "Làm quen với 10 Thần (Thực Thần, Thương Quan, Tài, Quan, Ấn...)",
  ],
  "bat-tu-trung-cap": [
    "Xác định vượng suy Nhật Chủ có hiệu chỉnh theo mùa, theo vị trí",
    "Tìm Dụng Thần - Hỷ Thần cho từng lá số cụ thể",
    "Luận giải các cách cục Tài Quan Ấn phổ biến",
    "Thực hành trên lá số thật của học viên",
  ],
  "bat-tu-chuyen-sau": [
    "Luận Đại Vận, Lưu Niên và các mốc chuyển vận quan trọng",
    "Phân tích Thần Sát và ảnh hưởng thực tế",
    "Luận giải các cách cục đặc biệt, Tứ Mộ Khố",
    "Thực hành luận giải trọn vẹn một lá số từ đầu đến cuối",
  ],

  "bat-trach-nhap-mon": [
    "Hiểu nguyên lý Bát Quái, Đông Tứ Trạch - Tây Tứ Trạch",
    "Tính mệnh quái từ năm sinh",
    "Xác định hướng nhà, hướng cửa hợp mệnh cơ bản",
    "Nhận biết các hướng tốt - xấu theo Du Niên",
  ],
  "bat-trach-trung-cap": [
    "Áp dụng Dương Trạch Tam Yếu: Cửa - Chủ - Bếp",
    "Luận giải phối hợp nhiều yếu tố trong một căn nhà",
    "Xử lý các trường hợp nhà không vuông vắn, nhà ống",
    "Thực hành trên sơ đồ nhà thật",
  ],
  "bat-trach-cao-cap": [
    "Luận nhà nhiều tầng, căn hộ chung cư theo Bát Trạch",
    "Xử lý nhà nhiều cửa, nhà lô góc",
    "Kết hợp Bát Trạch với yếu tố loan đầu xung quanh",
    "Đưa ra phương án hóa giải khi nhà phạm hướng xấu",
  ],
  "bat-trach-chan-phap": [
    "Tiếp cận các bí quyết Bát Trạch chân truyền",
    "Phân biệt Bát Trạch chân pháp và các dị bản phổ biến",
    "Luận giải case thực chiến từ chuyên gia",
    "Nâng cao độ chính xác khi tư vấn thực tế",
  ],

  "huyen-khong-phi-tinh-nhap-mon": [
    "Hiểu hệ thống Tam Nguyên Cửu Vận",
    "Lập tinh bàn 9 cung cơ bản",
    "Nhận biết Sơn tinh, Hướng tinh, Vận tinh",
    "Đọc hiểu ý nghĩa cơ bản của 9 sao",
  ],
  "huyen-khong-phi-tinh-trung-cap": [
    "Phân biệt Vượng Sơn Vượng Hướng và Thượng Sơn Hạ Thủy",
    "Luận cát hung từng cung trong tinh bàn",
    "Xác định vị trí nên và không nên đặt cửa, bếp, phòng ngủ",
    "Thực hành lập tinh bàn cho nhà thật",
  ],
  "huyen-khong-phi-tinh-cao-cap": [
    "Ứng dụng Thất Tinh Đả Kiếp trong luận giải",
    "Kỹ thuật kích hoạt sao tốt, hóa giải sao xấu",
    "Luận nhà kiêm hướng, nhà lệch tâm",
    "Luận giải case thực chiến nâng cao",
  ],

  "trach-nhat-co-ban": [
    "Hiểu hệ thống Can Chi ứng dụng trong trạch nhật",
    "Lọc ngày phạm Tam Tai, Không Vong, Nguyệt Kỵ",
    "Xét 12 Kiến Trừ (12 Trực Thần) cho từng việc",
    "Thực hành chọn ngày cho các việc thông dụng",
  ],
  "trach-nhat-nang-cao": [
    "Đối chiếu ngày giờ với mệnh cục riêng từng người",
    "Trạch nhật chuyên sâu cho động thổ, nhập trạch, an táng",
    "Xử lý xung đột khi nhiều người liên quan có mệnh khác nhau",
    "Thực hành trạch nhật trọn vẹn một sự việc thực tế",
  ],

  "huyen-khong-luc-phap-co-ban": [
    "Hiểu hệ Lưỡng Nguyên Bát Vận, khác biệt với Tam Nguyên Cửu Vận",
    "Nắm nguyên lý Nhất Tâm, xác định tâm nhà",
    "Làm quen khái niệm Thư Hùng, Kim Long",
    "Phân biệt Huyền Không Lục Pháp và Phi Tinh",
  ],
  "huyen-khong-luc-phap-trung-cap": [
    "Thực hành quy trình Xem - Nhận - Lấy - Lập",
    "Định cục Thư Hùng cho nhà thật",
    "Luận Kim Long động hay tĩnh",
    "Xác định Thành Môn theo Lục Pháp",
  ],
  "huyen-khong-luc-phap-nang-cao": [
    "Ứng dụng Thành Môn Quyết trong luận giải",
    "Nắm vững Tứ Quyết của Lục Pháp",
    "Luận case thực chiến phức tạp",
    "Đối chiếu kết quả Lục Pháp với Phi Tinh",
  ],

  "ky-mon-nhap-mon": [
    "Hiểu cấu trúc Cửu Cung, Bát Môn, Cửu Tinh",
    "Lập lá bàn Kỳ Môn Độn Giáp cơ bản",
    "Đọc hiểu Thiên Bàn - Địa Bàn - Nhân Bàn",
    "Làm quen Trực Phù, Trực Sử",
  ],
  "ky-mon-phong-thuy": [
    "Ứng dụng Kỳ Môn vào luận nhà ở, văn phòng",
    "Xác định phương vị cát - hung trọng yếu",
    "Kết hợp Kỳ Môn với chọn hướng bố trí nội thất",
    "Thực hành luận case nhà thật",
  ],
  "ky-mon-menh": [
    "Lập Mệnh Cung theo Kỳ Môn từ Tứ Trụ",
    "Luận tổng quát cuộc đời qua lá bàn Kỳ Môn",
    "Luận theo lĩnh vực: tài vận, công việc, hôn nhân, sức khỏe",
    "Đối chiếu Kỳ Môn Mệnh với Bát Tự truyền thống",
  ],

  "tu-vi-nhap-mon": [
    "Hiểu nguyên lý và cách an sao Tử Vi",
    "Nhận diện 14 chính tinh và ý nghĩa cơ bản",
    "Đọc hiểu sơ bộ 12 cung trên lá số",
    "Luận cung Mệnh cơ bản",
  ],
  "tu-vi-trung-cap": [
    "Luận chi tiết cung Quan Lộc, Tài Bạch, Phu Thê",
    "Xử lý cung Vô Chính Diệu",
    "Nhận diện các cách cục phổ biến",
    "Luận ảnh hưởng của Tuần - Triệt",
  ],
  "tu-vi-nang-cao": [
    "Luận Đại Hạn, Tiểu Hạn, Lưu Niên",
    "Áp dụng các phương pháp lượng giá cát hung",
    "Tổng luận trọn vẹn một lá số theo quy trình chuẩn",
    "Thực hành trên lá số thật của học viên",
  ],

  "kinh-dich-co-ban": [
    "Hiểu nguồn gốc và cấu trúc 64 quẻ Kinh Dịch",
    "Nắm ý nghĩa 8 quẻ đơn (Bát Quái)",
    "Thực hành gieo quẻ bằng đồng xu",
    "Đọc hiểu quẻ chính và hào động cơ bản",
  ],
  "kinh-dich-trung-cap": [
    "Xác định Dụng Thần theo từng loại câu hỏi",
    "An Lục Thân, Lục Thần cho quẻ",
    "Phân tích sinh khắc giữa các hào",
    "Luận Không Vong, Nguyệt Phá trong quẻ",
  ],
  "kinh-dich-nang-cao": [
    "Luận các quẻ có nhiều hào động phức tạp",
    "Tìm nguyên nhân cốt lõi qua thủ tượng",
    "Đối chiếu nhiều lớp thông tin trong một quẻ",
    "Thực hành luận case thực chiến",
  ],
  "kinh-dich-phong-thuy": [
    "Ứng dụng quẻ Dịch vào luận phong thủy nhà ở",
    "Kết hợp Kinh Dịch với yếu tố hình thế, loan đầu",
    "Luận hướng, vị trí qua lăng kính Kinh Dịch",
    "Thực hành case nhà ở thực tế",
  ],
  "kinh-dich-hoa-giai": [
    "Xác định nguyên nhân cốt lõi trước khi hóa giải",
    "Các phương pháp hóa giải theo từng loại quẻ",
    "Kết hợp hóa giải bằng hành động và vật phẩm",
    "Thực hành đưa ra giải pháp cho case thật",
  ],
};

export const defaultCourseOutcomes = [
  "Nắm vững nguyên lý nền tảng, áp dụng thực tế ngay sau khóa học",
  "Bài tập/case study thực chiến cùng chuyên gia",
  "Tài liệu tổng hợp kèm theo khóa học",
  "Cộng đồng học viên hỗ trợ trao đổi lâu dài",
];
