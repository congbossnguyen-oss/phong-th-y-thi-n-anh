// HIỂN THỊ-ONLY: bảng màu Ngũ Hành + phân loại Cát/Hung dùng để TÔ MÀU và SẮP XẾP trái/phải trên ảnh lá
// số xuất ra. Đây KHÔNG phải dữ liệu Natal Core đã LOCKED — không ảnh hưởng vị trí an sao/tính toán nào,
// chỉ phục vụ trình bày. Ngũ Hành của 14 chính tinh theo Nạp Giáp ngũ hành tinh diệu (kiến thức phổ biến,
// thống nhất ở hầu hết trường phái). Ngũ Hành/Cát Hung của phụ tinh và Tạp Diệu theo phân loại phổ biến —
// nếu star đã có cột C/H trực tiếp từ nguồn "Tử Vi Hàm Số" (xem tap-dieu.ts) thì dùng đúng theo đó.

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export const NGU_HANH_BY_SAO: Record<string, NguHanh> = {
  // 14 chính tinh
  "Tử Vi": "Thổ", "Thiên Phủ": "Thổ", "Thiên Lương": "Thổ",
  "Thiên Cơ": "Mộc", "Tham Lang": "Mộc",
  "Thái Dương": "Hỏa", "Liêm Trinh": "Hỏa",
  "Vũ Khúc": "Kim", "Thất Sát": "Kim",
  "Thiên Đồng": "Thủy", "Thái Âm": "Thủy", "Cự Môn": "Thủy", "Thiên Tướng": "Thủy", "Phá Quân": "Thủy",
  // Phụ tinh chính (engine.ts)
  "Tả Phù": "Thổ", "Hữu Bật": "Thủy", "Văn Xương": "Kim", "Văn Khúc": "Thủy",
  "Thiên Khôi": "Hỏa", "Thiên Việt": "Hỏa", "Lộc Tồn": "Thổ", "Thiên Mã": "Hỏa",
  "Hồng Loan": "Thủy", "Thiên Hỷ": "Thủy", "Thiên Y": "Thủy", "Đào Hoa": "Mộc",
  "Kình Dương": "Kim", "Đà La": "Kim", "Địa Kiếp": "Hỏa", "Địa Không": "Hỏa",
  "Hỏa Tinh": "Hỏa", "Linh Tinh": "Hỏa", "Thiên Hình": "Hỏa", "Thiên Diêu": "Thủy",
  // Tạp Diệu (Phase 38 + bổ sung nguồn "Tử Vi Hàm Số")
  "Long Trì": "Thủy", "Phượng Các": "Hỏa", "Thiên Khốc": "Kim", "Thiên Hư": "Kim",
  "Thiên Đức": "Thổ", "Nguyệt Đức": "Thổ", "Thiên Tài": "Mộc", "Thiên Thọ": "Thổ",
  "Cô Thần": "Hỏa", "Quả Tú": "Hỏa", "Phá Toái": "Kim", "Thiên Không": "Thổ",
  "Thiên Giải": "Thổ", "Địa Giải": "Thổ", "Giải Thần": "Hỏa",
  "Thiên La": "Thổ", "Địa Võng": "Thổ", "Thiên Sứ": "Thủy", "Thiên Thương": "Mộc",
  "Quốc Ấn": "Thổ", "Đường Phù": "Hỏa", "Thiên Quan": "Thổ", "Thiên Phúc": "Thổ",
  "Thai Phụ": "Hỏa", "Phong Cáo": "Hỏa",
  "Tướng Tinh": "Kim", "Phan Án": "Kim", "Tuế Dịch": "Hỏa", "Tức Thần": "Thổ",
  "Hoa Cái": "Mộc", "Kiếp Sát": "Hỏa", "Tai Sát": "Hỏa", "Thiên Sát": "Hỏa",
  "Chỉ Bối": "Kim", "Nguyệt Sát": "Thủy", "Vong Thần": "Thủy",
  // Bổ sung nguồn "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt)
  "Ân Quang": "Hỏa", "Thiên Quý": "Hỏa", "Tam Thai": "Thổ", "Bát Tọa": "Thổ", "Đẩu Quân": "Thổ",
  // Vòng Bác Sĩ (Phase 32, hocvienlyso.org — "vòng Lộc Tồn")
  "Bác Sĩ": "Thủy", "Lực Sĩ": "Hỏa", "Thanh Long": "Thủy", "Tiểu Hao": "Hỏa",
  "Tướng Quân": "Mộc", "Tấu Thư": "Mộc", "Phi Liêm": "Hỏa", "Hỷ Thần": "Hỏa",
  "Bệnh Phù": "Thủy", "Đại Hao": "Hỏa", "Phục Binh": "Thủy", "Quan Phủ": "Thổ",
  // Vòng Thái Tuế (12 sao, Natal Core đã LOCKED — chỉ thêm màu/phân loại hiển thị ở đây)
  "Thái Tuế": "Mộc", "Thiếu Dương": "Hỏa", "Tang Môn": "Mộc", "Thiếu Âm": "Thủy",
  "Quan Phù": "Thổ", "Tử Phù": "Hỏa", "Tuế Phá": "Kim", "Long Đức": "Thủy",
  "Bạch Hổ": "Kim", "Phúc Đức": "Thổ", "Điếu Khách": "Thủy", "Trực Phù": "Mộc",
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
  "Chỉ Bối": "Hung", "Nguyệt Sát": "Hung", "Vong Thần": "Hung",
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

export const ELEMENT_COLOR: Record<NguHanh, string> = {
  "Kim": "#8a8a8a",
  "Mộc": "#2f7a3f",
  "Thủy": "#1c1c1c",
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
