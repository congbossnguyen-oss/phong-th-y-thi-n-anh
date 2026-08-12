// HIỂN THỊ-ONLY: bảng màu Ngũ Hành + phân loại Cát/Hung dùng để TÔ MÀU và SẮP XẾP trái/phải trên ảnh lá
// số xuất ra. Đây KHÔNG phải dữ liệu Natal Core đã LOCKED — không ảnh hưởng vị trí an sao/tính toán nào,
// chỉ phục vụ trình bày. Ngũ Hành của 14 chính tinh theo Nạp Giáp ngũ hành tinh diệu (kiến thức phổ biến,
// thống nhất ở hầu hết trường phái).
//
// PHASE 43 — VIẾT LẠI toàn bộ Ngũ Hành phụ tinh/Tạp Diệu/Vòng Bác Sĩ/Vòng Thái Tuế theo đúng màu hiển thị
// thật trên lá số "Học Viện Lý Số Nguyên Cát" (hocvienlyso.org), theo yêu cầu Công "màu sắc các sao phụ
// tinh em cũng làm cho giống với lá số của học viện lý số". Cách làm: tải lá số Canh Thân (31/8/1980 giờ
// Ngọ, đã dùng làm ví dụ Golden Master cho Lưu Hà) làm ảnh JPEG, cắt riêng từng ô ra xem cận cảnh (tránh
// đọc nhầm màu do ảnh full-size quá nhỏ), đối chiếu với chú thích màu in sẵn ở cuối ảnh: "Kim=xám,
// Mộc=xanh lá, Thủy=đen, Hỏa=đỏ, Thổ=cam". Đây là bằng chứng trực tiếp từ 1 lá số thật, không phải suy
// diễn — thay thế hoàn toàn cho phân loại "phổ biến" chưa có nguồn cụ thể trước đây. Sao nào KHÔNG xuất
// hiện trên lá số mẫu này (không có trong ô nào của 12 cung) thì GIỮ NGUYÊN giá trị cũ, không đoán.
export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export const NGU_HANH_BY_SAO: Record<string, NguHanh> = {
  // 14 chính tinh
  "Tử Vi": "Thổ", "Thiên Phủ": "Thổ", "Thiên Lương": "Thổ",
  "Thiên Cơ": "Mộc", "Tham Lang": "Mộc",
  "Thái Dương": "Hỏa", "Liêm Trinh": "Hỏa",
  "Vũ Khúc": "Kim", "Thất Sát": "Kim",
  "Thiên Đồng": "Thủy", "Thái Âm": "Thủy", "Cự Môn": "Thủy", "Thiên Tướng": "Thủy", "Phá Quân": "Thủy",
  // Phụ tinh chính (engine.ts) — Văn Khúc, Thiên Khôi, Thiên Việt sửa theo màu thật (Phase 43).
  "Tả Phù": "Thổ", "Hữu Bật": "Thủy", "Văn Xương": "Kim", "Văn Khúc": "Kim",
  "Thiên Khôi": "Hỏa", "Thiên Việt": "Mộc", "Lộc Tồn": "Thổ", "Thiên Mã": "Hỏa",
  "Hồng Loan": "Thủy", "Thiên Hỷ": "Thủy", "Thiên Y": "Thủy", "Đào Hoa": "Mộc",
  "Kình Dương": "Kim", "Đà La": "Kim", "Địa Kiếp": "Hỏa", "Địa Không": "Hỏa",
  "Hỏa Tinh": "Hỏa", "Linh Tinh": "Hỏa", "Thiên Hình": "Hỏa", "Thiên Diêu": "Thủy",
  // Tạp Diệu — đa số sửa theo màu thật (Phase 43); Giải Thần/Thiên La/Địa Võng không xuất hiện trên lá số
  // mẫu nên giữ nguyên giá trị cũ.
  "Long Trì": "Thủy", "Phượng Các": "Mộc", "Thiên Khốc": "Kim", "Thiên Hư": "Thủy",
  "Thiên Đức": "Thổ", "Nguyệt Đức": "Hỏa", "Thiên Tài": "Thổ", "Thiên Thọ": "Thổ",
  "Cô Thần": "Thổ", "Quả Tú": "Thổ", "Phá Toái": "Hỏa", "Thiên Không": "Hỏa",
  "Thiên Giải": "Hỏa", "Địa Giải": "Thổ", "Giải Thần": "Hỏa",
  "Thiên La": "Thổ", "Địa Võng": "Thổ", "Thiên Sứ": "Thủy", "Thiên Thương": "Thổ",
  "Quốc Ấn": "Thổ", "Đường Phù": "Mộc", "Thiên Quan": "Mộc", "Thiên Phúc": "Thổ",
  "Thai Phụ": "Kim", "Phong Cáo": "Thổ",
  "Tướng Tinh": "Kim", "Phan Án": "Thủy", "Tuế Dịch": "Thủy", "Tức Thần": "Thủy",
  "Hoa Cái": "Thủy", "Kiếp Sát": "Thủy", "Tai Sát": "Thủy", "Thiên Sát": "Thủy", "Âm Sát": "Thủy",
  "Chỉ Bối": "Thủy", "Nguyệt Sát": "Thủy", "Vong Thần": "Thủy",
  // Lưu Hà — nguồn "Tử Vi Tam Hợp Phái Minh Việt" mục 46 ghi rõ "Lưu Hà hành Thủy"; khớp luôn với màu thật.
  "Lưu Hà": "Thủy",
  // Bổ sung nguồn "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt) — sửa theo màu thật (Phase 43).
  "Ân Quang": "Mộc", "Thiên Quý": "Thổ", "Tam Thai": "Thủy", "Bát Tọa": "Mộc", "Đẩu Quân": "Hỏa",
  // Vòng Bác Sĩ (Phase 32, hocvienlyso.org — "vòng Lộc Tồn") — Tấu Thư, Quan Phủ sửa theo màu thật.
  "Bác Sĩ": "Thủy", "Lực Sĩ": "Hỏa", "Thanh Long": "Thủy", "Tiểu Hao": "Hỏa",
  "Tướng Quân": "Mộc", "Tấu Thư": "Kim", "Phi Liêm": "Hỏa", "Hỷ Thần": "Hỏa",
  "Bệnh Phù": "Thủy", "Đại Hao": "Hỏa", "Phục Binh": "Thủy", "Quan Phủ": "Hỏa",
  // Vòng Thái Tuế (12 sao, Natal Core đã LOCKED — chỉ thêm màu/phân loại hiển thị ở đây) — đa số sửa theo
  // màu thật (Phase 43); Bạch Hổ không xuất hiện rõ trên lá số mẫu (chỉ thấy dạng "L.Bạch Hổ" mờ) nên giữ
  // nguyên giá trị cũ.
  "Thái Tuế": "Thủy", "Thiếu Dương": "Hỏa", "Tang Môn": "Mộc", "Thiếu Âm": "Thủy",
  "Quan Phù": "Hỏa", "Tử Phù": "Hỏa", "Tuế Phá": "Hỏa", "Long Đức": "Thủy",
  "Bạch Hổ": "Kim", "Phúc Đức": "Thổ", "Điếu Khách": "Hỏa", "Trực Phù": "Hỏa",
};

export type CatHung = "Cát" | "Hung";

export const CAT_HUNG_BY_SAO: Record<string, CatHung> = {
  "Tả Phù": "Cát", "Hữu Bật": "Cát", "Văn Xương": "Cát", "Văn Khúc": "Cát",
  "Thiên Khôi": "Cát", "Thiên Việt": "Cát", "Lộc Tồn": "Cát", "Thiên Mã": "Cát",
  "Hồng Loan": "Cát", "Thiên Hỷ": "Cát", "Thiên Y": "Cát", "Đào Hoa": "Cát",
  "Kình Dương": "Hung", "Đà La": "Hung", "Địa Kiếp": "Hung", "Địa Không": "Hung",
  "Hỏa Tinh": "Hung", "Linh Tinh": "Hung", "Thiên Hình": "Hung", "Thiên Diêu": "Hung",
  "Long Trì": "Cát", "Phượng Các": "Cát", "Thiên Khốc": "Hung", "Thiên Hư": "Hung",
  "Thiên Đức": "Cát", "Nguyệt Đức": "Cát", "Thiên Tài": "Cát", "Thiên Thọ": "Cát",
  "Cô Thần": "Hung", "Quả Tú": "Hung", "Phá Toái": "Hung", "Thiên Không": "Hung",
  "Thiên Giải": "Cát", "Địa Giải": "Cát", "Giải Thần": "Cát",
  "Thiên La": "Hung", "Địa Võng": "Hung", "Thiên Sứ": "Hung", "Thiên Thương": "Hung",
  "Quốc Ấn": "Cát", "Đường Phù": "Cát", "Thiên Quan": "Cát", "Thiên Phúc": "Cát",
  "Thai Phụ": "Cát", "Phong Cáo": "Cát",
  "Tướng Tinh": "Cát", "Phan Án": "Hung", "Tuế Dịch": "Hung", "Tức Thần": "Cát",
  "Hoa Cái": "Cát", "Kiếp Sát": "Hung", "Tai Sát": "Hung", "Thiên Sát": "Hung",
  "Chỉ Bối": "Hung", "Nguyệt Sát": "Hung", "Vong Thần": "Hung", "Âm Sát": "Hung",
  "Lưu Hà": "Hung",
  "Ân Quang": "Cát", "Thiên Quý": "Cát", "Tam Thai": "Cát", "Bát Tọa": "Cát", "Đẩu Quân": "Cát",
  // Vòng Bác Sĩ — Bác Sĩ/Lực Sĩ/Thanh Long/Tướng Quân/Tấu Thư/Hỷ Thần: Cát (trí tuệ, quyền uy, tin vui).
  // Tiểu Hao/Phi Liêm/Bệnh Phù/Đại Hao/Phục Binh/Quan Phủ: Hung (hao tài, thị phi, bệnh, kiện tụng).
  "Bác Sĩ": "Cát", "Lực Sĩ": "Cát", "Thanh Long": "Cát", "Tướng Quân": "Cát", "Tấu Thư": "Cát", "Hỷ Thần": "Cát",
  "Tiểu Hao": "Hung", "Phi Liêm": "Hung", "Bệnh Phù": "Hung", "Đại Hao": "Hung", "Phục Binh": "Hung", "Quan Phủ": "Hung",
  // Vòng Thái Tuế — Thiếu Dương/Thiếu Âm/Long Đức/Phúc Đức/Trực Phù: Cát. Thái Tuế/Tang Môn/Quan Phù/Tử
  // Phù/Tuế Phá/Bạch Hổ/Điếu Khách: Hung (phân loại phổ biến).
  "Thiếu Dương": "Cát", "Thiếu Âm": "Cát", "Long Đức": "Cát", "Phúc Đức": "Cát", "Trực Phù": "Cát",
  "Thái Tuế": "Hung", "Tang Môn": "Hung", "Quan Phù": "Hung", "Tử Phù": "Hung", "Tuế Phá": "Hung",
  "Bạch Hổ": "Hung", "Điếu Khách": "Hung",
};

// Yêu cầu Công: Thủy trước đây dùng #1c1c1c (gần đen) — gần như không phân biệt được với màu chữ thường
// (#2b2116 ở LIGHT.text bên trang lá số), nhìn như "không đổ màu". Đổi sang xanh dương đậm (#2c4a7c —
// trùng màu nền badge TRIỆT sẵn có trong lá số, giữ nhất quán bảng màu) để rõ ràng là có tô màu Ngũ Hành.
export const ELEMENT_COLOR: Record<NguHanh, string> = {
  "Kim": "#8a8a8a",
  "Mộc": "#2f7a3f",
  "Thủy": "#2c4a7c",
  "Hỏa": "#b3311f",
  "Thổ": "#c07a1e",
};

export function colorOfSao(name: string, fallback: string): string {
  const el = NGU_HANH_BY_SAO[name];
  return el ? ELEMENT_COLOR[el] : fallback;
}

// Mặc định coi là Cát nếu chưa phân loại — tránh rơi mất sao khỏi cả 2 cột khi thêm sao mới sau này.
export function isCat(name: string): boolean {
  return CAT_HUNG_BY_SAO[name] !== "Hung";
}
