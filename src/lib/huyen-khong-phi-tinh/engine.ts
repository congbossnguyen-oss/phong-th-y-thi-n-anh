/**
 * ENGINE TÍNH TOÁN HUYỀN KHÔNG PHI TINH — port TypeScript 1:1 từ scripts/engine.py gốc.
 *
 * Giữ nguyên 100% logic của bản Python. Không thêm/bớt/"cải tiến" quy tắc phong thủy nào.
 * Những gì engine CỐ TÌNH KHÔNG TÍNH (xem KHONG_TINH bên dưới) KHÔNG được tự bổ sung ở đây
 * hay ở bất kỳ lớp nào phía trên (form/route/UI).
 *
 * Python's `%` luôn trả về không âm với số chia dương; JS `%` giữ dấu số bị chia.
 * Mọi phép modulo có thể gặp số âm đều đi qua pymod() để giữ đúng ngữ nghĩa gốc.
 */

function pymod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

// ==========================================================================
// HẰNG SỐ NỀN TẢNG
// ==========================================================================

export type NguyenLong = "T" | "D" | "N";
export type AmDuong = "Âm" | "Dương";

export interface CungInfoEntry {
  ten: string;
  vt: string;
  quai: string;
  nguhanh: string;
}

// 8 cung + trung cung, theo số Lạc Thư
export const CUNG_INFO: Record<number, CungInfoEntry> = {
  5: { ten: "Trung Cung", vt: "TC", quai: "-", nguhanh: "Thổ" },
  6: { ten: "Tây Bắc", vt: "TB", quai: "Càn", nguhanh: "Kim" },
  7: { ten: "Tây", vt: "T", quai: "Đoài", nguhanh: "Kim" },
  8: { ten: "Đông Bắc", vt: "ĐB", quai: "Cấn", nguhanh: "Thổ" },
  9: { ten: "Nam", vt: "N", quai: "Ly", nguhanh: "Hỏa" },
  1: { ten: "Bắc", vt: "B", quai: "Khảm", nguhanh: "Thủy" },
  2: { ten: "Tây Nam", vt: "TN", quai: "Khôn", nguhanh: "Thổ" },
  3: { ten: "Đông", vt: "Đ", quai: "Chấn", nguhanh: "Mộc" },
  4: { ten: "Đông Nam", vt: "ĐN", quai: "Tốn", nguhanh: "Mộc" },
};

// Thứ tự bay Lượng Thiên Xích (thuận): Trung -> TB -> T -> ĐB -> N -> B -> TN -> Đ -> ĐN
export const THU_TU_BAY = [5, 6, 7, 8, 9, 1, 2, 3, 4];

export const NGU_HANH_SAO: Record<number, string> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ",
  6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};

export const TEN_SAO: Record<number, string> = {
  1: "Nhất Bạch", 2: "Nhị Hắc", 3: "Tam Bích", 4: "Tứ Lục", 5: "Ngũ Hoàng",
  6: "Lục Bạch", 7: "Thất Xích", 8: "Bát Bạch", 9: "Cửu Tử",
};

// 24 SƠN: tên -> [độ tâm sơn, cung Lạc Thư, Tam Nguyên Long, Âm/Dương]
// Nguyên Long: T=Thiên, D=Địa, N=Nhân
// Thứ tự khai báo giữ nguyên như bản Python (không dùng cho logic, chỉ để đối chiếu dễ).
export const SON_24: Record<string, [number, number, NguyenLong, AmDuong]> = {
  "Nhâm": [345, 1, "D", "Dương"], "Tý": [0, 1, "T", "Âm"], "Quý": [15, 1, "N", "Âm"],
  "Sửu": [30, 8, "D", "Âm"], "Cấn": [45, 8, "T", "Dương"], "Dần": [60, 8, "N", "Dương"],
  "Giáp": [75, 3, "D", "Dương"], "Mão": [90, 3, "T", "Âm"], "Ất": [105, 3, "N", "Âm"],
  "Thìn": [120, 4, "D", "Âm"], "Tốn": [135, 4, "T", "Dương"], "Tỵ": [150, 4, "N", "Dương"],
  "Bính": [165, 9, "D", "Dương"], "Ngọ": [180, 9, "T", "Âm"], "Đinh": [195, 9, "N", "Âm"],
  "Mùi": [210, 2, "D", "Âm"], "Khôn": [225, 2, "T", "Dương"], "Thân": [240, 2, "N", "Dương"],
  "Canh": [255, 7, "D", "Dương"], "Dậu": [270, 7, "T", "Âm"], "Tân": [285, 7, "N", "Âm"],
  "Tuất": [300, 6, "D", "Âm"], "Càn": [315, 6, "T", "Dương"], "Hợi": [330, 6, "N", "Dương"],
};

// Thế Quái (kiêm hướng): sơn -> số thế. Sơn không có trong bảng thì dùng số gốc.
export const THE_QUAI: Record<string, number> = {
  "Tý": 1, "Quý": 1, "Giáp": 1, "Thân": 1,
  "Nhâm": 2, "Mão": 2, "Ất": 2, "Mùi": 2, "Khôn": 2,
  "Tuất": 6, "Càn": 6, "Hợi": 6, "Thìn": 6, "Tốn": 6, "Tỵ": 6,
  "Tân": 7, "Dậu": 7, "Sửu": 7, "Cấn": 7, "Bính": 7,
  "Ngọ": 9, "Đinh": 9, "Dần": 9, "Canh": 9,
};

// Ranh giới giữa 2 CUNG (quái) — dùng phân biệt Đại vs Tiểu Không Vong
export const RANH_GIOI_CUNG = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

// Chính Thần / Linh Thần / Chiếu Thần theo vận (i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 4).
// Chính Thần = sao đương vận (kỵ thấy nước, nên mở cửa thu khí).
// Linh Thần  = hợp thập với đương vận (CÓ NƯỚC LÀ CÁT — "dĩ suy vi vượng"). Vận 5 không có số cố
// định (chia 2 nửa 10 năm theo quy ước riêng của nguồn) — biểu diễn bằng null.
export const CHINH_LINH_THAN: Record<number, [number, number | null]> = {
  1: [1, 9], 2: [2, 8], 3: [3, 7], 4: [4, 6],
  5: [5, null], 6: [6, 4], 7: [7, 3], 8: [8, 2], 9: [9, 1],
};
export const CHIEU_THAN: Record<number, number | null> = {
  1: 6, 2: 7, 3: 8, 4: 9, 5: null, 6: 1, 7: 2, 8: 3, 9: 4,
};

// Cặp số Tiên Thiên (Hà Đồ) — dùng cho Thành Môn và nhận diện cặp Tiên Thiên
const CAP_TIEN_THIEN_CANON: Array<[number, number]> = [[1, 6], [2, 7], [3, 8], [4, 9]];
function laCapTienThien(a: number, b: number): boolean {
  return CAP_TIEN_THIEN_CANON.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// Bộ số Tam Ban
const BO_TAM_BAN: number[][] = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];

// Phụ Mẫu Tam Ban theo ĐÚNG định nghĩa nguồn (a-nen-tang-lap-tinh-ban.md mục 10):
// bộ 1-4-7 / 2-5-8 / 3-6-9 trải trên 3 CUNG CỐ ĐỊNH. Xếp theo thứ tự mạnh dần giảm.
export const NHOM_DA_KIEP: Array<[string, number[], string, string]> = [
  ["Ly Đả Kiếp", [9, 3, 6], "Ly-Chấn-Càn", "mạnh nhất trong 3"],
  ["Khảm Đả Kiếp", [1, 4, 7], "Khảm-Tốn-Đoài", "mạnh thứ 2"],
  ["Tam Ban Xảo Quái", [8, 5, 2], "Cấn-Trung-Khôn", "yếu nhất trong 3"],
];

// Đào Hoa / Thiên Hỷ / Hồng Loan theo Chi (từ d-dao-hoa-vi.md)
export const CHI_12 = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const DAO_HOA_VALS = ["Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão", "Tý"];
const THIEN_HY_VALS = ["Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý", "Hợi", "Tuất"];
const HONG_LOAN_VALS = ["Mão", "Dần", "Sửu", "Tý", "Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn"];
export const DAO_HOA: Record<string, string> = Object.fromEntries(CHI_12.map((c, i) => [c, DAO_HOA_VALS[i]]));
export const THIEN_HY: Record<string, string> = Object.fromEntries(CHI_12.map((c, i) => [c, THIEN_HY_VALS[i]]));
export const HONG_LOAN: Record<string, string> = Object.fromEntries(CHI_12.map((c, i) => [c, HONG_LOAN_VALS[i]]));

export type MucCatHung = "CÁT" | "HUNG" | "ĐẠI HUNG" | "ĐẠI CÁT" | "TÙY LOAN ĐẦU" | "QUAN SÁT" | "LƯU Ý" | "CẦN NGƯỜI LUẬN TỰ XÉT";

// Song Tinh Danh Cục (song-tinh-danh-cuc.md) — khoá bằng cặp KHÔNG PHÂN THỨ TỰ
const DANH_CUC: Record<string, [string, MucCatHung, string]> = {
  "1,4": ["Tứ Nhất Đồng Cung", "CÁT", "Phát khoa danh, học hành đỗ đạt, danh tiếng văn chương"],
  "9,7": ["Cửu Thất Hợp Triệt", "HUNG", "Chủ hỏa hoạn — kỵ đặt bếp/vật dễ cháy tại đây"],
  "2,5": ["Nhị Ngũ Giao Gia", "ĐẠI HUNG", "Hung nhất trong các tổ hợp — tử vong, bệnh tật, tổn tài. Kỵ động"],
  "3,7": ["Tam Thất Điệp Chí (Xuyên Tâm Sát)", "HUNG", "Kiện tụng, tranh chấp pháp lý, trộm cướp"],
  "6,7": ["Giao Kiếm Sát", "HUNG", "Tranh chấp, kiện tụng, thương tích do dao kéo/kim loại"],
};
function layDanhCuc(a: number, b: number): [string, MucCatHung, string] | null {
  const key = [a, b].sort((x, y) => x - y).join(",");
  return DANH_CUC[key] ?? null;
}

// Ý nghĩa cặp cách cục trong Vận 9 (g-tinh-ban-24-son-huong-van9.md) — khoá CÓ THỨ TỰ (s,h)
const Y_NGHIA_CAP_VAN9: Record<string, string> = {
  "9,9": "Cặp sao cơ hội, rất tốt trong Vận 9. Lợi thời trang/mỹ phẩm/trang sức. Tài chính tốt. Cẩn thận bệnh mắt, thần kinh.",
  "8,1": "Dễ bệnh hệ sinh sản và tai. Chăm sóc tốt vẫn có thể thành công.",
  "1,8": "Giàu có, khỏe mạnh, tốt cho nghiên cứu. Thổ khắc Thủy dễ sỏi thận/vấn đề tai. Cẩn thận bệnh da.",
  "7,2": "Nguy cơ hỏa hoạn (nhất là ở Nam/Tây Nam/Tây hoặc gần sao 9, vật sắc nhọn). Vận 9 thất lệnh: thị phi, bệnh tật.",
  "2,7": "Giàu nhưng không bền, tiêu chảy, hỏa hoạn khi Sơn-Thủy xấu. Vấn đề sinh sản, mâu thuẫn mẹ chồng-nàng dâu, thị phi.",
  "4,5": "Khối u/ung thư vú, bệnh truyền nhiễm ngực, giảm hô hấp. Vấn đề vùng bụng dưới.",
  "5,4": "Mộc khắc Thổ chủ phá tài, điền sản tiêu hao. Ung thư vú. Mất tiền do đầu cơ.",
  "3,6": "Đàn ông trung niên tật ở chân; cha đối đầu con trai trưởng. Đau đầu. Dễ thương tích do vật sắc nhọn/kim loại.",
  "6,3": "Cẩn thận gãy chân, thương tích bởi kim loại. Đau đầu. Cẩn thận tai nạn xe cộ.",
};

// ==========================================================================
// BẢNG GHI NGUỒN — mỗi mục engine tính đều truy được về nguồn nào
// Mức: CHẮC = có nguồn rõ + đã kiểm chứng bằng dữ liệu
//      NGUỒN = có nguồn rõ nhưng chưa có dữ liệu đối chiếu độc lập
//      MÂU THUẪN = các nguồn nói khác nhau — engine chọn 1 và ghi rõ
// ==========================================================================

export const NGUON_GOC: Array<[string, "CHẮC" | "NGUỒN" | "MÂU THUẪN", string, string]> = [
  ["Lập Vận/Sơn/Hướng Bàn (Lượng Thiên Xích)", "CHẮC",
    "a-nen-tang-lap-tinh-ban.md mục 6-7",
    "Kiểm chứng 432/432 điểm trên 24 sơn hướng Vận 9 (file G)"],
  ["Quy tắc thuận/nghịch theo Tam Nguyên Long", "CHẮC",
    "a-nen-tang-lap-tinh-ban.md mục 7 bước 4",
    "Nằm trong 432/432 điểm trên; thêm 3 ví dụ Thành Môn trong sách Văn Hoài"],
  ["Ngưỡng độ Chính hướng/Kiêm hướng (3°/6°)", "MÂU THUẪN",
    "a-nen-tang-lap-tinh-ban.md mục 15",
    "MV_HKPT1 nói 3°/6°/7.5°; Văn Hoài nói 4°/7°. Engine dùng MV_HKPT1 (thận trọng hơn). " +
    "Ngưỡng chỉ ảnh hưởng NHÃN cảnh báo, KHÔNG đổi tinh bàn (vì Thế Quái đã tắt mặc định)"],
  ["Phân biệt Tiểu vs Đại Không Vong", "NGUỒN",
    "a-nen-tang-lap-tinh-ban.md mục 15",
    "Nguồn định nghĩa Tiểu = lằn ranh 2 sơn, Đại = lằn ranh 2 quẻ. Engine hiện thực đúng " +
    "định nghĩa đó bằng 8 mốc ranh giới cung; 8/8 ca biên khớp"],
  ["Vượng/Sinh/Suy/Tử của sao theo vận", "NGUỒN",
    "quy-trinh-luan-khi-co-tinh-ban.md Bước 3",
    "Nguồn định nghĩa rõ 4 mức. 'Tiến khí' được nhắc trong thứ tự nhưng KHÔNG gán số cụ thể " +
    "-> engine không tự suy, trả 'TỬ/XA' cho phần ngoài 4 mức"],
  ["Vượng Sơn Vượng Hướng / Thượng Sơn Hạ Thủy / Song Tinh", "CHẮC",
    "a-nen-tang-lap-tinh-ban.md mục 10",
    "Đối chiếu nhãn cách cục của file G (vd mục 1 = Song Tinh Đáo Tọa) — khớp"],
  ["Phụ Mẫu Tam Ban / Đả Kiếp", "MÂU THUẪN",
    "a-nen-tang-lap-tinh-ban.md mục 10",
    "KHÔNG tự nhận diện. Mô tả trong nguồn đã kiểm chứng là đúng với 54/54 tổ hợp tinh bàn " +
    "-> là tính chất cấu trúc Lạc Thư, không phải điều kiện phân biệt. Cần bổ sung điều kiện " +
    "đầy đủ trước khi code hóa"],
  ["Phục Ngâm / Phản Ngâm", "NGUỒN",
    "a-nen-tang-lap-tinh-ban.md mục 10",
    "Hiện thực theo đúng định nghĩa cấu trúc (trùng địa bàn = Phục; đối xung địa bàn = Phản), " +
    "không dùng dấu hiệu gián tiếp 'Ngũ Hoàng nhập trung'"],
  ["Thành Môn Chính/Phụ/Ngầm + mở cửa phụ", "CHẮC",
    "thanh-mon.md mục 2-3, 7",
    "Khớp 3/3 ví dụ có lời giải trong sách Văn Hoài (Tý vận 8 không dùng được, " +
    "Tý vận 9 dùng được, Dậu vận 8 đắc vượng khí)"],
  ["Song Tinh Danh Cục (5 tổ hợp có tên)", "NGUỒN",
    "song-tinh-danh-cuc.md (Tứ Bạch Quyết) + c-hoa-giai-sat-khi.md (Giao Kiếm Sát)",
    "Trích trực tiếp từ nguồn, chưa có dữ liệu số để đối chiếu độc lập"],
  ["Ý nghĩa 9 cặp cách cục", "CHẮC",
    "g-tinh-ban-24-son-huong-van9.md",
    "CHỈ ÁP DỤNG VẬN 9 — engine tự tắt mục này khi vận khác"],
  ["Niên tinh nhập trung", "CHẮC",
    "b-tinh-chat-van-9-va-24-son-huong.md mục 5",
    "Mốc 2024=3; khớp 3 mốc lịch sử trong Tứ Bạch Quyết (1870=4, 1930=7, 1992=8)"],
  ["Nguyệt tinh nhập trung", "NGUỒN",
    "b-tinh-chat-van-9-va-24-son-huong.md mục 5.5",
    "Công thức cổ điển, khớp các mảnh OCR đọc được của Bình Nguyên Quân. " +
    "Chi của năm tính gần đúng theo năm dương lịch (mốc 1984=Giáp Tý) — " +
    "cần đối chiếu lịch vạn niên nếu sát Lập Xuân"],
  ["Đào Hoa / Thiên Hỷ / Hồng Loan", "CHẮC",
    "d-dao-hoa-vi.md mục 2",
    "Bảng Đào Hoa khớp đúng công thức Tam Hợp cổ điển"],
  ["Chính Thần / Linh Thần / Chiếu Thần theo vận", "CHẮC",
    "i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 4",
    "Bảng khôi phục từ OCR lỗi cột, đã đối chiếu bằng logic hợp thập (Chính Thần + Linh Thần = 10) " +
    "— khớp đủ cả 9 vận: 1↔9, 2↔8, 3↔7, 4↔6, 6↔4, 7↔3, 8↔2, 9↔1, riêng vận 5 theo quy ước riêng"],
  ["Thu Sơn Xuất Sát (4 quy tắc gốc)", "CHẮC",
    "i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 1",
    "Trích nguyên văn quy tắc gốc MV_HKPT1: vượng/sinh khí trên Sơn Bàn -> cần cao; " +
    "vượng/sinh khí trên Hướng Bàn -> cần thấp/có nước; ngược lại cho tử/sát khí"],
  ["Điều kiện Chân Thành Môn (3 điều kiện)", "NGUỒN",
    "i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 2.3",
    "Bổ sung mới cho thanh-mon.md — thêm điều kiện 3 (Sơn tinh phải thoái/sát tinh, nếu vượng/sinh " +
    "thì thành môn là thủy khẩu mở cửa ắt tổn đinh). Chưa có ví dụ sách đối chiếu riêng cho điều " +
    "kiện 3 này (khác 3 ví dụ Thành Môn gốc trong self-test, vốn chỉ kiểm điều kiện 1)"],
];

// Những gì engine CỐ TÌNH KHÔNG LÀM (vì không đủ căn cứ) — KHÔNG được lấp bằng suy đoán
// ở bất kỳ lớp nào phía trên (form/route/UI/AI).
export const KHONG_TINH: Array<[string, string]> = [
  ["Đắc cách / thất cách", "Cần loan đầu thực tế (núi/nước/đường ở đâu) — engine không có dữ liệu này"],
  ["Kết luận cát hung cuối cùng từng cung", "Phụ thuộc đắc/thất cách ở trên"],
  ["Thế Quái tự động", "Ngưỡng độ còn mâu thuẫn giữa nguồn; là quyết định của người luận (Tá Khố). " +
    "Bật thủ công bằng dungTheQuai=true"],
  ["Đào Hoa theo NHÀ (theo tinh bàn)", "Công thức gốc của Nguyễn Thành Phương không còn trong " +
    "phần OCR đọc được — chỉ có Đào Hoa theo NGƯỜI (Chi sinh)"],
  ["Ý nghĩa cặp sao ở vận KHÁC vận 9 (bảng tra cứu tĩnh Y_NGHIA_CAP_VAN9)",
    "Bảng 9 cặp trong engine chỉ đúng cho Vận 9; chưa mã hoá 81 tổ hợp mọi vận thành tra cứu tĩnh. " +
    "Dữ liệu 81 cặp + hóa giải theo từng sao ĐÃ có ở h-81-cap-sao-va-hoa-giai.md (nhúng trong " +
    "tri-thuc-ai.ts) dành cho lớp AI luận — không đưa vào engine vì cần đọc kèm điều kiện Thời/" +
    "Hình/Khí theo đúng cảnh báo của chính tác giả nguồn, không phải tra bảng máy móc"],
  ["Bát Sát / Hoàng Tuyền / Sát Long / Ám Ngũ Hoàng theo sơn hướng",
    "Dữ liệu trong nguồn bị OCR xáo trộn, đã bỏ qua thay vì đoán"],
  ["Phụ Mẫu Tam Ban / Thất Tinh Đả Kiếp (tự động)",
    "Mô tả nguồn ('3 cung Ly-Chấn-Càn đủ bộ 1-4-7/2-5-8/3-6-9') đúng với 54/54 tổ hợp tinh bàn " +
    "-> là tính chất cấu trúc Lạc Thư, không phải điều kiện phân biệt. Người luận tự xét."],
];

// ==========================================================================
// HÀM NỀN TẢNG
// ==========================================================================

/** Đưa độ về khoảng [0, 360). */
export function chuanHoaDo(do_: number): number {
  return pymod(do_, 360);
}

/** Từ độ la bàn -> {son, lech}. Độ lệch dương = lệch theo chiều tăng độ; âm = lệch ngược. */
export function timSon(do_: number): { son: string; lech: number } {
  const do0 = chuanHoaDo(do_);
  let best: string | null = null;
  let bestLech = 999;
  for (const ten of Object.keys(SON_24)) {
    const tam = SON_24[ten][0];
    const lech = pymod(do0 - tam + 180, 360) - 180;
    if (Math.abs(lech) < Math.abs(bestLech)) {
      best = ten;
      bestLech = lech;
    }
  }
  return { son: best as string, lech: round2(bestLech) };
}

/** Bay 1 số qua 9 cung theo Lượng Thiên Xích. Trả về {cung_lac_thu: sao}. */
export function bayTinh(soNhapTrung: number, thuan: boolean = true): Record<number, number> {
  const ketQua: Record<number, number> = {};
  THU_TU_BAY.forEach((cung, buoc) => {
    const sao = thuan
      ? pymod(soNhapTrung - 1 + buoc, 9) + 1
      : pymod(soNhapTrung - 1 - buoc, 9) + 1;
    ketQua[cung] = sao;
  });
  return ketQua;
}

/**
 * Quy tắc rút gọn (a-nen-tang-lap-tinh-ban.md mục 7 bước 4).
 * Địa Nguyên Long: chẵn -> nghịch, lẻ -> thuận.
 * Thiên/Nhân Nguyên Long: chẵn -> thuận, lẻ -> nghịch.
 * Trả về true nếu bay thuận.
 */
export function xacDinhChieuBay(soVanTinh: number, nguyenLong: NguyenLong): boolean {
  const chan = soVanTinh % 2 === 0;
  if (nguyenLong === "D") return !chan;
  return chan;
}

/**
 * Trả về số dùng nhập trung khi kiêm hướng (Thế Quái).
 * Tra "sơn gốc" ứng với số vận tinh trong cùng Nguyên Long, rồi tra bảng Thế Quái.
 */
export function soTheQuai(
  _tenSon: string,
  soVanTinh: number,
  nguyenLong: NguyenLong
): { so: number; sonGoc: string | null } {
  let sonGoc: string | null = null;
  for (const ten of Object.keys(SON_24)) {
    const [, cung, nl] = SON_24[ten];
    if (cung === soVanTinh && nl === nguyenLong) {
      sonGoc = ten;
      break;
    }
  }
  if (sonGoc === null) return { so: soVanTinh, sonGoc: null };
  return { so: THE_QUAI[sonGoc] ?? soVanTinh, sonGoc };
}

// ==========================================================================
// LẬP TINH BÀN
// ==========================================================================

export type MucDoLech = "tot" | "canh_bao" | "xau" | "nguy_hiem";

export interface PhanLoaiDoLech {
  loai: "CHÍNH HƯỚNG" | "KIÊM HƯỚNG" | "TIỂU KHÔNG VONG" | "ĐẠI KHÔNG VONG";
  muc: MucDoLech;
  mo_ta: string;
  son: string;
  lech: number;
  kc_ranh_cung?: number;
}

/**
 * Phân loại 1 độ la bàn: Chính hướng / Kiêm hướng / Tiểu Không Vong / Đại Không Vong.
 *
 * Nguyên tắc phân biệt 2 loại Không Vong (a-nen-tang-lap-tinh-ban.md mục 15):
 *   - Cùng nằm sát lằn ranh 2 sơn (trong 1.5° tính từ ranh giới).
 *   - Nếu lằn ranh đó nằm TRONG CÙNG 1 CUNG  -> TIỂU Không Vong.
 *   - Nếu là ranh giới GIỮA 2 CUNG/QUÁI      -> ĐẠI Không Vong (nặng hơn nhiều).
 */
export function phanLoaiDoLech(do_: number): PhanLoaiDoLech {
  const do0 = chuanHoaDo(do_);
  const { son: tenSon, lech } = timSon(do0);
  const absLech = Math.abs(lech);

  const kcRanhCung = Math.min(...RANH_GIOI_CUNG.map((b) => Math.abs(pymod(do0 - b + 180, 360) - 180)));

  if (absLech <= 3) {
    return {
      loai: "CHÍNH HƯỚNG", muc: "tot",
      mo_ta: "Thuần khí — điều kiện cần để phát phúc.",
      son: tenSon, lech,
    };
  }
  if (absLech <= 6) {
    return {
      loai: "KIÊM HƯỚNG", muc: "canh_bao",
      mo_ta: "Khí đã pha tạp, mức tốt giảm. Kiêm sang sơn nào thì mang thêm " +
        "tính chất sơn đó. (Engine dùng Hạ Quái bàn — xem ghi chú Thế Quái.)",
      son: tenSon, lech,
    };
  }

  // absLech > 6 -> sát lằn ranh 2 sơn
  if (kcRanhCung <= 1.5) {
    return {
      loai: "ĐẠI KHÔNG VONG", muc: "nguy_hiem",
      mo_ta: "Hướng trùng ranh giới GIỮA 2 QUÁI — nặng hơn Tiểu Không Vong nhiều. " +
        "Chủ cô quả, tuyệt tự, lao tù, phá sản, gia chủ biến đổi tính nết, ác mộng. " +
        "KHUYẾN NGHỊ: đổi hướng, nghiêng hẳn về 1 sơn có vượng tinh.",
      son: tenSon, lech, kc_ranh_cung: round2(kcRanhCung),
    };
  }

  return {
    loai: "TIỂU KHÔNG VONG", muc: "xau",
    mo_ta: "Hướng trùng lằn ranh 2 sơn (trong cùng 1 cung). Chủ khó đắc tài lộc, " +
      "sức khỏe kém, gia đạo lủng củng. " +
      "KHUYẾN NGHỊ: chỉnh hướng nghiêng hẳn về sơn có vượng tinh để đạt thuần khí.",
    son: tenSon, lech,
  };
}

export interface TinhBan {
  van: number;
  do_huong: number;
  do_toa: number;
  son_huong: string;
  son_toa: string;
  lech_huong: number;
  lech_toa: number;
  phan_loai_huong: PhanLoaiDoLech;
  phan_loai_toa: PhanLoaiDoLech;
  dung_the_quai: boolean;
  cung_huong: number;
  cung_toa: number;
  nguyen_long_huong: NguyenLong;
  nguyen_long_toa: NguyenLong;
  van_ban: Record<number, number>;
  son_ban: Record<number, number>;
  huong_ban: Record<number, number>;
  nhap_trung_huong: number;
  nhap_trung_son: number;
  chieu_huong: "thuận" | "nghịch";
  chieu_son: "thuận" | "nghịch";
  son_goc_the_quai_huong: string | null;
  son_goc_the_quai_son: string | null;
}

/**
 * Lập tinh bàn đầy đủ.
 * doHuong: độ la bàn của HƯỚNG nhà. van: 1-9.
 * dungTheQuai: MẶC ĐỊNH false — engine luôn dùng Hạ Quái bàn. Thế Quái là quyết định
 * của người luận (Tá Khố), không phải phép tính tự động — chỉ bật khi người luận
 * chủ động yêu cầu (xem KHONG_TINH).
 */
export function lapTinhBan(doHuong: number, van: number, dungTheQuai: boolean = false): TinhBan {
  const doHuong0 = chuanHoaDo(doHuong);
  const doToa = chuanHoaDo(doHuong0 + 180);

  const { son: sonHuong, lech: lechHuong } = timSon(doHuong0);
  const { son: sonToa, lech: lechToa } = timSon(doToa);

  const cungHuong = SON_24[sonHuong][1];
  const cungToa = SON_24[sonToa][1];
  const nlHuong = SON_24[sonHuong][2];
  const nlToa = SON_24[sonToa][2];

  const plHuong = phanLoaiDoLech(doHuong0);
  const plToa = phanLoaiDoLech(doToa);

  const kiem = dungTheQuai;

  // 1. VẬN BÀN — vận nhập trung, bay thuận
  const vanBan = bayTinh(van, true);

  // 2. HƯỚNG BÀN
  const vtHuong = vanBan[cungHuong];
  const [soNhapH, gocH] = kiem
    ? ((r) => [r.so, r.sonGoc] as const)(soTheQuai(sonHuong, vtHuong, nlHuong))
    : ([vtHuong, null] as const);
  const thuanH = xacDinhChieuBay(soNhapH, nlHuong);
  const huongBan = bayTinh(soNhapH, thuanH);

  // 3. SƠN BÀN
  const vtToa = vanBan[cungToa];
  const [soNhapS, gocS] = kiem
    ? ((r) => [r.so, r.sonGoc] as const)(soTheQuai(sonToa, vtToa, nlToa))
    : ([vtToa, null] as const);
  const thuanS = xacDinhChieuBay(soNhapS, nlToa);
  const sonBan = bayTinh(soNhapS, thuanS);

  return {
    van,
    do_huong: doHuong0, do_toa: doToa,
    son_huong: sonHuong, son_toa: sonToa,
    lech_huong: lechHuong, lech_toa: lechToa,
    phan_loai_huong: plHuong, phan_loai_toa: plToa,
    dung_the_quai: kiem,
    cung_huong: cungHuong, cung_toa: cungToa,
    nguyen_long_huong: nlHuong, nguyen_long_toa: nlToa,
    van_ban: vanBan, son_ban: sonBan, huong_ban: huongBan,
    nhap_trung_huong: soNhapH, nhap_trung_son: soNhapS,
    chieu_huong: thuanH ? "thuận" : "nghịch",
    chieu_son: thuanS ? "thuận" : "nghịch",
    son_goc_the_quai_huong: gocH, son_goc_the_quai_son: gocS,
  };
}

// ==========================================================================
// VƯỢNG / SUY THEO VẬN
// ==========================================================================

export type TrangThaiKhi = "VƯỢNG" | "SINH" | "SUY" | "TỬ" | "TỬ/XA";

/**
 * Phân loại khí của 1 sao theo vận hiện tại.
 *
 * NGUỒN (quy-trinh-luan-khi-co-tinh-ban.md Bước 3) định nghĩa RÕ 4 mức:
 *   VƯỢNG = sao đương vận        SINH = vận kế tiếp (vận+1)
 *   SUY   = vận vừa qua (vận-1)  TỬ   = 2 vận trước (vận-2)
 * Nguồn có nhắc "tiến khí" trong thứ tự xếp hạng nhưng KHÔNG định nghĩa nó ứng với
 * số nào -> engine KHÔNG tự gán, trả về "TỬ/XA" cho các sao còn lại.
 */
export function trangThaiSao(sao: number, van: number): TrangThaiKhi {
  if (sao === van) return "VƯỢNG";
  if (sao === pymod(van, 9) + 1) return "SINH";
  if (sao === pymod(van - 2, 9) + 1) return "SUY";
  if (sao === pymod(van - 3, 9) + 1) return "TỬ";
  return "TỬ/XA";
}

// ==========================================================================
// NHẬN DIỆN CÁCH CỤC
// ==========================================================================

export type CachCuc = [string, MucCatHung, string];

/** Nhận diện toàn bộ cách cục lớn của tinh bàn. */
export function nhanDienCachCuc(tb: TinhBan): CachCuc[] {
  const van = tb.van;
  const ch = tb.cung_huong;
  const ct = tb.cung_toa;
  const sb = tb.son_ban;
  const hb = tb.huong_ban;
  const vb = tb.van_ban;
  const kq: CachCuc[] = [];

  const sonTaiToa = sb[ct];
  const huongTaiHuong = hb[ch];
  const sonTaiHuong = sb[ch];
  const huongTaiToa = hb[ct];

  if (sonTaiToa === van && huongTaiHuong === van) {
    kq.push(["Vượng Sơn Vượng Hướng", "CÁT",
      "Vượng tinh Sơn đáo Tọa, vượng tinh Hướng đáo Hướng. Cần Tọa có núi/nhà cao, " +
      "Hướng có thủy/thoáng mới phát huy."]);
  } else if (sonTaiHuong === van && huongTaiToa === van) {
    kq.push(["Thượng Sơn Hạ Thủy", "HUNG",
      "Vượng tinh đảo ngược — tổn đinh hại tài. Chỉ cứu được nếu loan đầu 'đảo kỵ' " +
      "(trước cao sau thấp) hoặc có Phụ Mẫu Tam Ban."]);
  } else if (sonTaiHuong === van && huongTaiHuong === van) {
    kq.push(["Song Tinh Đáo Hướng", "TÙY LOAN ĐẦU",
      "Cả Sơn tinh và Hướng tinh vượng đều tụ ở Hướng. Cần Hướng có thủy, " +
      "phía sau thủy lại có núi/nhà cao thì vượng cả đinh lẫn tài."]);
  } else if (sonTaiToa === van && huongTaiToa === van) {
    kq.push(["Song Tinh Đáo Tọa", "TÙY LOAN ĐẦU",
      "Cả Sơn tinh và Hướng tinh vượng đều tụ ở Tọa. Cần Tọa có núi, " +
      "trước núi có thủy thì mới vượng đủ."]);
  }

  // Phục Ngâm / Phản Ngâm (so với địa bàn Lạc Thư)
  const pnSon = THU_TU_BAY.every((c) => sb[c] === c);
  const pnHuong = THU_TU_BAY.every((c) => hb[c] === c);
  if (pnSon) {
    kq.push(["Phục Ngâm Sơn Bàn (toàn bàn)", "HUNG",
      "Sơn Bàn trùng khít địa bàn Lạc Thư — khuếch đại lực, xấu thì càng xấu."]);
  }
  if (pnHuong) {
    kq.push(["Phục Ngâm Hướng Bàn (toàn bàn)", "HUNG",
      "Hướng Bàn trùng khít địa bàn Lạc Thư — khuếch đại lực."]);
  }
  // Phản Ngâm: số phi tinh nằm ở cung ĐỐI DIỆN số địa bàn gốc (cặp đối xung tổng = 10)
  const pnghichSon = THU_TU_BAY.filter((c) => c !== 5).every((c) => sb[c] + c === 10);
  const pnghichHuong = THU_TU_BAY.filter((c) => c !== 5).every((c) => hb[c] + c === 10);
  if (pnghichSon) {
    kq.push(["Phản Ngâm Sơn Bàn (toàn bàn)", "HUNG",
      "Mỗi cung có Sơn tinh nằm đối xung với số địa bàn gốc — khuếch đại lực."]);
  }
  if (pnghichHuong) {
    kq.push(["Phản Ngâm Hướng Bàn (toàn bàn)", "HUNG",
      "Mỗi cung có Hướng tinh nằm đối xung với số địa bàn gốc — khuếch đại lực."]);
  }
  // Phản/Phục Ngâm cục bộ: CHỈ báo khi rơi đúng cung Tọa hoặc Hướng (2 vị trí trọng yếu).
  // Không quét cả 8 cung vì gần như chart nào cũng dính ít nhất 1 cung -> thành nhiễu.
  const pnTrongYeu: string[] = [];
  for (const [c, nhan] of [[ct, "Tọa"], [ch, "Hướng"]] as Array<[number, string]>) {
    if (c === 5) continue;
    const dau: string[] = [];
    if (sb[c] === c) dau.push("Sơn tinh trùng địa bàn (Phục Ngâm)");
    if (hb[c] === c) dau.push("Hướng tinh trùng địa bàn (Phục Ngâm)");
    if (sb[c] + c === 10) dau.push("Sơn tinh đối xung địa bàn (Phản Ngâm)");
    if (hb[c] + c === 10) dau.push("Hướng tinh đối xung địa bàn (Phản Ngâm)");
    if (dau.length) pnTrongYeu.push(`${nhan} (${CUNG_INFO[c].ten}): ${dau.join(", ")}`);
  }
  if (pnTrongYeu.length && !(pnSon || pnHuong || pnghichSon || pnghichHuong)) {
    kq.push(["Phản/Phục Ngâm cục bộ tại vị trí trọng yếu", "LƯU Ý",
      pnTrongYeu.join(" | ") + ". Mức ảnh hưởng nhẹ hơn toàn bàn nhưng nằm đúng " +
      "trục Tọa-Hướng nên cần cân nhắc theo loan đầu."]);
  }

  // Hợp Thập toàn bàn
  const htSon = THU_TU_BAY.every((c) => sb[c] + vb[c] === 10);
  const htHuong = THU_TU_BAY.every((c) => hb[c] + vb[c] === 10);
  if (htSon) {
    kq.push(["Hợp Thập toàn bàn (Sơn + Vận)", "ĐẠI CÁT",
      "Sơn tinh hợp thập với Vận tinh ở mọi cung — cách cục bền, không hết theo vận."]);
  }
  if (htHuong) {
    kq.push(["Hợp Thập toàn bàn (Hướng + Vận)", "ĐẠI CÁT",
      "Hướng tinh hợp thập với Vận tinh ở mọi cung — cách cục bền."]);
  }

  // --- PHỤ MẪU TAM BAN / ĐẢ KIẾP: ENGINE KHÔNG TỰ NHẬN DIỆN ---
  // Xem canhBaoDaKiep() — mô tả nguồn đã kiểm chứng đúng 54/54 tổ hợp -> tính chất
  // cấu trúc Lạc Thư, không phải điều kiện phân biệt. Không tự suy ra điều kiện đầy đủ.

  // --- Quan sát bổ sung: từng cung có bộ 3 số tam ban / liên châu ---
  // LƯU Ý: nguồn KHÔNG đặt tên cho dạng này (nguồn dành tên "Phụ Mẫu Tam Ban" cho dạng
  // 3-cung ở trên). Engine chỉ mô tả cấu trúc, không tự gán tên cách cục.
  const tamBanCung: number[] = [];
  const lienChauCung: number[] = [];
  for (const c of THU_TU_BAY) {
    const bo = Array.from(new Set([sb[c], vb[c], hb[c]]));
    if (bo.length === 3) {
      const sorted = [...bo].sort((a, b) => a - b);
      if (BO_TAM_BAN.some((t) => t[0] === sorted[0] && t[1] === sorted[1] && t[2] === sorted[2])) {
        tamBanCung.push(c);
      }
      if (sorted[1] - sorted[0] === 1 && sorted[2] - sorted[1] === 1) {
        lienChauCung.push(c);
      }
    }
  }
  if (tamBanCung.length === 9) {
    kq.push(["Cả 9 cung đều có bộ 3 số 1-4-7 / 2-5-8 / 3-6-9 (Sơn-Vận-Hướng)", "QUAN SÁT",
      "Cấu trúc hiếm gặp. Nhiều trường phái gọi đây là Phụ Mẫu Tam Ban Quái, " +
      "NHƯNG nguồn của skill này dành tên đó cho dạng 3-cung ở trên — " +
      "engine chỉ mô tả cấu trúc, không tự gán tên. Người luận tự quyết theo phái mình dùng."]);
  } else if (tamBanCung.length) {
    const ten = tamBanCung.map((c) => CUNG_INFO[c].ten).join(", ");
    kq.push([`Có bộ 3 số tam ban trong từng cung tại: ${ten}`, "QUAN SÁT",
      "Chỉ là ghi nhận cấu trúc số, chưa phải cách cục có tên trong nguồn."]);
  }
  if (lienChauCung.length === 9) {
    kq.push(["Liên Châu Tam Ban (cả 9 cung đều 3 số liên tiếp)", "CÁT",
      "3 số liên tiếp trong mỗi cung — theo quy-trinh-luan-khi-co-tinh-ban.md Bước 2."]);
  }

  // Nhập Tù — vượng tinh Hướng rơi vào trung cung
  if (hb[5] === van) {
    kq.push(["Nhập Tù (Hướng tinh vượng tại Trung Cung)", "HUNG",
      "Vượng khí bị giam ở trung cung. Ngoại lệ: nếu trung cung/giếng trời thông thoáng " +
      "hoặc có thủy hợp loan đầu thì là 'tù giả', không luận hung."]);
  }

  return kq;
}

export interface KiemTraSonResult {
  son: string;
  cung: number;
  cung_ten: string;
  nguyen_long: NguyenLong;
  am_duong: AmDuong;
  van_tinh: number;
  chieu: "thuận" | "nghịch";
  sao_ve_cung: number;
  dac_vuong: boolean;
}

/**
 * Kiểm tra 1 sơn bất kỳ: vượng tinh của vận có bay tới cung của sơn đó không?
 * Đây là lõi của "bí quyết Thành Môn" — cũng dùng để xét mở cửa phụ.
 * (thanh-mon.md mục 7): lấy Vận tinh tại CUNG của sơn đó nhập trung, bay thuận/nghịch
 * theo Âm Dương của chính SƠN đó, xem vượng tinh có về cung đó không.
 */
export function kiemTraSon(tenSon: string, van: number, vanBan: Record<number, number>): KiemTraSonResult {
  const [, cung, nl, amDuong] = SON_24[tenSon];
  const vt = vanBan[cung];
  const thuan = xacDinhChieuBay(vt, nl);
  const saoVe = bayTinh(vt, thuan)[cung];
  return {
    son: tenSon, cung, cung_ten: CUNG_INFO[cung].ten,
    nguyen_long: nl, am_duong: amDuong,
    van_tinh: vt, chieu: thuan ? "thuận" : "nghịch",
    sao_ve_cung: saoVe, dac_vuong: saoVe === van,
  };
}

/** Thông báo về Phụ Mẫu Tam Ban / Đả Kiếp — engine cố tình không tự nhận diện. */
export function canhBaoDaKiep(): CachCuc {
  return [
    "Phụ Mẫu Tam Ban / Thất Tinh Đả Kiếp",
    "CẦN NGƯỜI LUẬN TỰ XÉT",
    "Engine KHÔNG tự nhận diện cách cục này. Lý do: mô tả trong nguồn của skill " +
    "('3 cung Ly-Chấn-Càn đủ bộ 1-4-7/2-5-8/3-6-9') đã được kiểm chứng bằng code là " +
    "ĐÚNG với mọi tinh bàn (54/54 tổ hợp) — tức là tính chất cấu trúc của Lạc Thư, " +
    "không phải điều kiện phân biệt. Muốn engine tự tính, cần bổ sung điều kiện đầy đủ " +
    "(thường liên quan quan hệ giữa Vận, Hướng tinh tại cung Hướng và tọa-hướng cụ thể). " +
    "Hiện tại: người luận tự xét theo phái mình dùng.",
  ];
}

export interface ThanhMonEntry {
  son: string;
  cung: string;
  loai: "Chính" | "Phụ";
  van_tinh: number;
  chieu_bay: "thuận" | "nghịch";
  sao_ve_cung: number;
  /** true = "Chân Thành Môn" (đủ cả 3 điều kiện mục 2.3), false = "Giả Thành Môn" không nên dùng. */
  kha_dung: boolean;
  son_tinh_tai_do: number;
  trang_thai_son_tinh: TrangThaiKhi;
  thanh_mon_ngam: boolean;
  canh_bao: string | null;
  ghi_chu: string;
}

/**
 * Tìm Thành Môn ở 2 CUNG liền kề cung Hướng (thanh-mon.md + điều kiện "Chân Thành Môn" bổ sung ở
 * i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 2.3).
 * Trong mỗi cung liền kề, lấy sơn CÙNG Tam Nguyên Long với hướng nhà.
 *
 * @param vanHienTai Vận ĐANG CAI QUẢN — Thành Môn xét theo VẬN HIỆN TẠI, KHÔNG phải vận lập trạch:
 *   dùng vận bàn của vận hiện tại (bayTinh(vanHienTai)) + so vượng tinh của vận hiện tại. Nguồn
 *   thanh-mon.md có ví dụ: CÙNG sơn Tý, ở Vận 8 KHÔNG dùng được nhưng ở Vận 9 LẠI dùng được — tức
 *   Thành Môn đổi theo vận đang cai quản. Vị trí 2 sơn Thành Môn CỐ ĐỊNH theo tọa-hướng (hình học),
 *   chỉ tính khả dụng mới đổi theo vận. Mặc định = tb.van.
 *
 * "Chân Thành Môn" cần ĐỦ 3 điều kiện:
 *   1. Vượng tinh của VẬN HIỆN TẠI bay về đúng cung đó (kiemTraSon().dac_vuong).
 *   2. Hướng tinh (lá số) tại đó KHÔNG phải Ngũ Hoàng (trừ Vận 5).
 *   3. Sơn tinh (lá số) tại đó đang thoái/sát tinh theo vận hiện tại — nếu đang VƯỢNG/SINH thì
 *      thành môn là thủy khẩu, mở cửa ắt TỔN ĐINH, không dùng được dù điều kiện 1-2 đủ.
 */
export function timThanhMon(tb: TinhBan, vanHienTai: number = tb.van): ThanhMonEntry[] {
  const nlHuong = tb.nguyen_long_huong;
  const cungH = tb.cung_huong;
  // Thành Môn xét theo vận bàn của VẬN HIỆN TẠI (không phải vận bàn lá số nhà).
  const vanBanHienTai = bayTinh(vanHienTai, true);
  let doHCung: number | null = null;
  // tâm cung hướng = tâm của sơn Thiên Nguyên trong cung đó
  for (const ten of Object.keys(SON_24)) {
    const [tam, cung, nl] = SON_24[ten];
    if (cung === cungH && nl === "T") doHCung = tam;
  }
  const ketQua: ThanhMonEntry[] = [];

  for (const delta of [-45, 45]) {
    const doKe = chuanHoaDo((doHCung as number) + delta);
    const { son: sonThien } = timSon(doKe);
    const cungKe = SON_24[sonThien][1];

    // Trong cung liền kề, chọn sơn cùng Nguyên Long với hướng nhà
    let sonKe: string | null = null;
    for (const ten of Object.keys(SON_24)) {
      const [, c, nl] = SON_24[ten];
      if (c === cungKe && nl === nlHuong) {
        sonKe = ten;
        break;
      }
    }

    const kt = kiemTraSon(sonKe as string, vanHienTai, vanBanHienTai);

    // Loại Thành Môn: Chính nếu địa bàn 2 cung tạo cặp Tiên Thiên (Hà Đồ)
    const laChinh = laCapTienThien(cungKe, cungH);
    const loai: "Chính" | "Phụ" = laChinh ? "Chính" : "Phụ";

    // Thành Môn Ngầm: Hướng tinh (lá số nhà) tại cung kề + địa bàn cung đó thành cặp Tiên Thiên
    const htKe = tb.huong_ban[cungKe];
    const ngam = laCapTienThien(htKe, cungKe);

    // 3 điều kiện "Chân Thành Môn" (vượng/suy xét theo VẬN HIỆN TẠI)
    const stKe = tb.son_ban[cungKe];
    const ttSonKe = trangThaiSao(stKe, vanHienTai);
    let canhBao: string | null = null;
    let chanThanhMon = kt.dac_vuong;
    if (htKe === 5 && vanHienTai !== 5) {
      canhBao = "Hướng tinh Ngũ Hoàng tại đây — KHÔNG dùng làm Thành Môn (trừ Vận 5)";
      chanThanhMon = false;
    }
    if (ttSonKe === "VƯỢNG" || ttSonKe === "SINH") {
      canhBao = (canhBao ? canhBao + " | " : "") +
        `Sơn tinh ${stKe} tại đây đang ${ttSonKe} — thành môn là thủy khẩu, mở cửa ắt TỔN ĐINH. Không dùng.`;
      chanThanhMon = false;
    }

    ketQua.push({
      son: sonKe as string,
      cung: CUNG_INFO[cungKe].ten,
      loai,
      van_tinh: kt.van_tinh,
      chieu_bay: kt.chieu,
      sao_ve_cung: kt.sao_ve_cung,
      kha_dung: chanThanhMon,
      son_tinh_tai_do: stKe,
      trang_thai_son_tinh: ttSonKe,
      thanh_mon_ngam: ngam,
      canh_bao: canhBao,
      ghi_chu: "Cần có thủy/ao hồ/ngã ba/cổng ngõ thực tế tại đây mới phát huy",
    });
  }
  return ketQua;
}

export interface ChinhLinhThanResult {
  chinh_than_cung: string;
  chinh_than_so: number;
  quy_tac_chinh_than: string;
  linh_than_cung: string;
  linh_than_so: number | null;
  quy_tac_linh_than: string;
  chieu_than_cung: string;
  chieu_than_so: number | null;
  quy_tac_chieu_than: string;
}

/** Chính Thần / Linh Thần / Chiếu Thần của vận + quy tắc bố trí thủy. */
export function chinhLinhThan(van: number): ChinhLinhThanResult {
  const [ct, lt] = CHINH_LINH_THAN[van];
  const cht = CHIEU_THAN[van];
  return {
    chinh_than_cung: ct !== 5 ? CUNG_INFO[ct].ten : "Trung Cung",
    chinh_than_so: ct,
    quy_tac_chinh_than: "NÊN mở cửa thu khí. KỴ THẤY NƯỚC tại phương này.",
    linh_than_cung: lt !== null ? CUNG_INFO[lt].ten : "Vận 5: 10 năm đầu Đông Nam, 10 năm sau Tây Bắc",
    linh_than_so: lt,
    quy_tac_linh_than: "CÓ NƯỚC LÀ CÁT (nước vượng tài, lý 'dĩ suy vi vượng'). " +
      "Nên mở đường/mở cửa, nhưng phải chọn phía thông khí sinh khí vượng. " +
      "Sơn tinh không nên đoạt Linh Thần.",
    chieu_than_cung: cht !== null ? CUNG_INFO[cht].ten : "Vận 5: 10 năm đầu Ngọ/Đinh, sau Tý/Quý",
    chieu_than_so: cht,
    // i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 4.5: Chiếu Thần cũng là phương THỦY, có nước ở
    // đây để "thúc cát" (tăng cường thêm cát khí) — PHỤ TRỢ cho Linh Thần, không phải chính. Nguồn tự
    // ghi câu này hơi mờ/mâu thuẫn (OCR) nên coi là thứ yếu: ưu tiên bố trí Linh Thần (chính cát)
    // trước, Chiếu Thần chỉ dùng để hỗ trợ thêm khi có điều kiện.
    quy_tac_chieu_than: "PHỤ TRỢ cho Linh Thần — CÓ NƯỚC ở đây cũng tốt (dùng để 'thúc cát', tăng " +
      "cường thêm cát khí), nhưng là thứ yếu. Ưu tiên bố trí Linh Thần trước; Chiếu Thần chỉ dùng " +
      "hỗ trợ thêm. (Nguồn ghi phần này hơi mờ — xem là tham khảo.)",
  };
}

export interface ThuSonXuatSatEntry {
  cung: string;
  vt: string;
  son_tinh: number;
  huong_tinh: number;
  tt_son: TrangThaiKhi;
  tt_huong: TrangThaiKhi;
  khuyen_nghi: string[];
}

/**
 * Với mỗi cung (trừ Trung Cung), tra khuyến nghị Thu Sơn / Xuất Sát theo 4 quy tắc gốc
 * (i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 1): sao vượng/sinh trên Sơn Bàn cần chỗ CAO,
 * trên Hướng Bàn cần chỗ THẤP có nước; sao suy/tử thì ngược lại.
 *
 * @param vanHienTai Vận đương lệnh dùng xét vượng/suy — Thu Sơn Xuất Sát là bố trí theo sao ĐANG
 *   vượng ở hiện tại (mặc định = tb.van, xem chú thích phanTichCung).
 */
export function thuSonXuatSat(tb: TinhBan, vanHienTai: number = tb.van): ThuSonXuatSatEntry[] {
  const ketQua: ThuSonXuatSatEntry[] = [];
  for (const c of THU_TU_BAY) {
    if (c === 5) continue;
    const s = tb.son_ban[c];
    const h = tb.huong_ban[c];
    const ttS = trangThaiSao(s, vanHienTai);
    const ttH = trangThaiSao(h, vanHienTai);
    const khuyen: string[] = [];
    if (ttS === "VƯỢNG" || ttS === "SINH") {
      khuyen.push(`THU SƠN: Sơn tinh ${s} (${ttS}) → cần chỗ CAO (núi/nhà cao/tủ cao/cây lớn)`);
    } else {
      khuyen.push(`XUẤT SÁT: Sơn tinh ${s} (${ttS}) → cần chỗ THẤP/trống, tránh vật cao`);
    }
    if (ttH === "VƯỢNG" || ttH === "SINH") {
      khuyen.push(`THU SƠN: Hướng tinh ${h} (${ttH}) → cần chỗ THẤP có nước/cửa/đường/khoảng trống`);
    } else {
      khuyen.push(`XUẤT SÁT: Hướng tinh ${h} (${ttH}) → cần chỗ CAO che chắn, tránh nước/cửa động`);
    }
    ketQua.push({
      cung: CUNG_INFO[c].ten, vt: CUNG_INFO[c].vt,
      son_tinh: s, huong_tinh: h,
      tt_son: ttS, tt_huong: ttH, khuyen_nghi: khuyen,
    });
  }
  return ketQua;
}

export interface MoCuaPhuEntry extends KiemTraSonResult {
  huong_tinh_hien_tai: number;
  canh_bao: string | null;
  cung_nguyen_long_voi_nha: boolean;
}

/**
 * Quét toàn bộ 24 sơn: sơn nào đắc vượng khí (của VẬN HIỆN TẠI) nếu mở cửa/cổng phụ tại đó.
 * Dùng khi hướng chính không có vượng khí hoặc nhà kiêm hướng (thanh-mon.md mục 7).
 *
 * @param vanHienTai Vận đương lệnh — mở cửa phụ để đón vượng khí ĐANG CAI QUẢN, nên dùng vận bàn
 *   của vận hiện tại + so vượng tinh vận hiện tại (giống timThanhMon). Mặc định = tb.van.
 */
export function xetMoCuaPhu(tb: TinhBan, vanHienTai: number = tb.van): MoCuaPhuEntry[] {
  const vanBanHienTai = bayTinh(vanHienTai, true);
  const ketQua: MoCuaPhuEntry[] = [];
  for (const ten of Object.keys(SON_24)) {
    const kt = kiemTraSon(ten, vanHienTai, vanBanHienTai);
    if (kt.dac_vuong) {
      const cung = kt.cung;
      const ht = tb.huong_ban[cung];
      ketQua.push({
        ...kt,
        huong_tinh_hien_tai: ht,
        canh_bao: ht === 5 ? "Hướng tinh Ngũ Hoàng tại cung này — không nên mở cửa" : null,
        cung_nguyen_long_voi_nha: kt.nguyen_long === tb.nguyen_long_huong,
      });
    }
  }
  return ketQua;
}

export interface PhanTichCungEntry {
  cung: string;
  vt: string;
  quai: string;
  nguhanh_cung: string;
  son_tinh: number;
  van_tinh: number;
  huong_tinh: number;
  bo_ba: string;
  tt_son: TrangThaiKhi;
  tt_huong: TrangThaiKhi;
  la_cung_toa: boolean;
  la_cung_huong: boolean;
  danh_cuc: [string, MucCatHung, string] | null;
  y_nghia_cap: string | null;
  cap_tien_thien: boolean;
  canh_bao: string[];
}

/**
 * Phân tích chi tiết từng cung: 3 sao, trạng thái khí, danh cục, cảnh báo.
 *
 * @param vanHienTai Vận ĐANG CAI QUẢN (đương lệnh) dùng để xét vượng/suy — KHÁC vận nhà (tb.van)
 *   khi nhà đã sang vận mới. Vượng/suy của sao (đắc lệnh/thất lệnh) phải xét theo vận hiện tại, còn
 *   tinh bàn (con số Sơn/Hướng tinh) thì cố định theo vận nhà. Mặc định = tb.van để giữ tương thích
 *   ngược (nhà đúng vận hiện tại thì 2 vận trùng nhau). Xem b-tinh-chat-van-9... mục 1.
 */
export function phanTichCung(tb: TinhBan, vanHienTai: number = tb.van): PhanTichCungEntry[] {
  const ketQua: PhanTichCungEntry[] = [];
  for (const c of THU_TU_BAY) {
    const s = tb.son_ban[c];
    const v = tb.van_ban[c];
    const h = tb.huong_ban[c];
    const info = CUNG_INFO[c];

    const danhCuc = layDanhCuc(s, h);
    // Ý nghĩa cặp sao chỉ đúng cho Vận 9 — gate theo VẬN HIỆN TẠI (bảng file G mô tả cặp sao ứng xử
    // TRONG Vận 9, áp dụng cho mọi nhà đang xét ở Vận 9, không phụ thuộc vận lúc lập trạch).
    const yNghia = vanHienTai === 9 ? (Y_NGHIA_CAP_VAN9[`${s},${h}`] ?? null) : null;

    const canhBao: string[] = [];
    if (s === 5 || h === 5) {
      const vai: string[] = [];
      if (s === 5) vai.push("Sơn tinh");
      if (h === 5) vai.push("Hướng tinh");
      canhBao.push(`NGŨ HOÀNG (${vai.join("+")}) — kỵ động, tránh đặt bếp/cửa/giường. ` +
        "Hóa bằng vật phẩm hành Kim (đồng), tuyệt đối không dùng Hỏa.");
    }
    if ((s === 2 || h === 2) && ["SUY", "TỬ"].includes(trangThaiSao(2, vanHienTai))) {
      canhBao.push("Nhị Hắc (Bệnh Phù) thất vận — chú ý sức khỏe, hóa bằng Kim.");
    }

    ketQua.push({
      cung: info.ten, vt: info.vt, quai: info.quai,
      nguhanh_cung: info.nguhanh,
      son_tinh: s, van_tinh: v, huong_tinh: h,
      bo_ba: `${s}-${v}-${h}`,
      tt_son: trangThaiSao(s, vanHienTai),
      tt_huong: trangThaiSao(h, vanHienTai),
      la_cung_toa: c === tb.cung_toa,
      la_cung_huong: c === tb.cung_huong,
      danh_cuc: danhCuc,
      y_nghia_cap: yNghia,
      cap_tien_thien: laCapTienThien(s, h),
      canh_bao: canhBao,
    });
  }
  return ketQua;
}

// ==========================================================================
// NIÊN TINH / NGUYỆT TINH
// ==========================================================================

/**
 * Niên tinh nhập trung cung, giảm dần 1 mỗi năm (chu kỳ 9).
 * MỐC CHUẨN: 2024 = 3 (Tam Bích) — đã kiểm chứng với 3 mốc lịch sử trong Tứ Bạch Quyết
 * (1870=4, 1930=7, 1992=8). Lưu ý: tính theo năm tiết khí (đổi năm tại Lập Xuân,
 * không phải Tết âm lịch).
 */
export function nienTinhNhapTrung(nam: number): number {
  return pymod(3 - (nam - 2024) - 1, 9) + 1;
}

/** Chi của năm âm lịch (gần đúng theo năm dương lịch, mốc 1984 = Tý). */
export function chiCuaNam(nam: number): string {
  return CHI_12[pymod(nam - 1984, 12)];
}

/**
 * Nguyệt tinh nhập trung (b-tinh-chat-van-9-va-24-son-huong.md mục 5.5).
 * thangAm: 1-12 (tháng âm lịch theo tiết khí).
 */
export function nguyetTinhNhapTrung(nam: number, thangAm: number): number {
  const chi = chiCuaNam(nam);
  let start: number;
  if (["Tý", "Ngọ", "Mão", "Dậu"].includes(chi)) start = 8;
  else if (["Thìn", "Tuất", "Sửu", "Mùi"].includes(chi)) start = 5;
  else start = 2; // Dần, Thân, Tỵ, Hợi
  return pymod(start - (thangAm - 1) - 1, 9) + 1;
}

export interface LuuNienResult {
  nien_tinh_nhap_trung: number;
  nien_ban: Record<number, number>;
  nguyet_tinh_nhap_trung: number | null;
  nguyet_ban: Record<number, number> | null;
  canh_bao: string[];
}

/**
 * Xếp Niên tinh (và Nguyệt tinh nếu có) lên tinh bàn, tìm danh cục phát sinh.
 * @param vanHienTai Vận đương lệnh — dùng xét Hướng tinh có đang thất vận (suy/tử) không để luận
 *   hợp thập lưu niên. Mặc định = tb.van.
 */
export function phanTichLuuNien(
  tb: TinhBan,
  nam: number,
  thangAm?: number | null,
  vanHienTai: number = tb.van
): LuuNienResult {
  const van = vanHienTai;
  const nt = nienTinhNhapTrung(nam);
  const nienBan = bayTinh(nt, true);
  let nguyetBan: Record<number, number> | null = null;
  let ngt: number | null = null;
  if (thangAm) {
    ngt = nguyetTinhNhapTrung(nam, thangAm);
    nguyetBan = bayTinh(ngt, true);
  }

  const canhBao: string[] = [];
  for (const c of THU_TU_BAY) {
    const s = tb.son_ban[c];
    const h = tb.huong_ban[c];
    const n = nienBan[c];
    const tenCung = CUNG_INFO[c].ten;

    if (n === 5) {
      canhBao.push(`[${nam}] NGŨ HOÀNG lưu niên đáo ${tenCung} — kỵ động thổ/sửa chữa tại đây trong năm.`);
    }
    if (n === 2) {
      canhBao.push(`[${nam}] Nhị Hắc (Bệnh Phù) lưu niên đáo ${tenCung} — chú ý sức khỏe, hóa bằng Kim.`);
    }

    for (const [goc, tenGoc] of [[s, "Sơn tinh"], [h, "Hướng tinh"]] as Array<[number, string]>) {
      const dc = layDanhCuc(goc, n);
      if (dc) {
        canhBao.push(`[${nam}] ${tenCung}: ${tenGoc} ${goc} + Niên tinh ${n} = ${dc[0]} (${dc[1]}) — ${dc[2]}`);
      }
    }

    if (h + n === 10 && ["SUY", "TỬ"].includes(trangThaiSao(h, van))) {
      canhBao.push(`[${nam}] ${tenCung}: Hướng tinh ${h} + Niên tinh ${n} hợp thập — ` +
        "tạm chuyển hung thành cát trong năm nay.");
    }

    if (nguyetBan) {
      const m = nguyetBan[c];
      if (m === 5 && n === 5) {
        canhBao.push(`[${nam}/T${thangAm}] ${tenCung}: Ngũ Hoàng NIÊN + NGUYỆT trùng — ` +
          "tháng này đặc biệt kỵ động tại đây.");
      }
    }
  }

  return {
    nien_tinh_nhap_trung: nt, nien_ban: nienBan,
    nguyet_tinh_nhap_trung: ngt,
    nguyet_ban: nguyetBan, canh_bao: canhBao,
  };
}

/**
 * Vận (1-9) suy từ năm nhập trạch — Tam Nguyên Cửu Vận, chu kỳ 180 năm bắt đầu 1864
 * (Thượng Nguyên Giáp Tý), mỗi vận 20 năm. KHÔNG có trong engine.py gốc (engine nhận --van
 * trực tiếp) — thêm cho form web theo yêu cầu Việc 2 "năm nhập trạch → suy ra Vận". Đây là
 * mốc phổ biến, không mâu thuẫn giữa các nguồn (khác các mục MÂU THUẪN đã liệt kê ở NGUON_GOC).
 * Cùng hạn chế như nienTinhNhapTrung(): tính theo năm dương lịch, chưa hiệu chỉnh Lập Xuân.
 */
export function vanTuNam(nam: number): number {
  return pymod(Math.floor((nam - 1864) / 20), 9) + 1;
}

// ==========================================================================
// KẾT QUẢ TỔNG HỢP — tương đương output --json của bản Python
// ==========================================================================

export interface KetQuaHuyenKhong {
  tinh_ban: TinhBan;
  /** Vận nhà (từ năm nhập trạch) — tinh bàn + cách cục + Thành Môn lập theo vận này (cố định). */
  van_nha: number;
  /** Vận đương lệnh (từ năm hiện tại) — vượng/suy + Chính-Linh Thần + Thu Sơn Xuất Sát xét theo vận này. */
  van_hien_tai: number;
  /** true = nhà đã sang vận mới (van_nha ≠ van_hien_tai) → các sao vượng của vận nhà nay đã thoái. */
  da_thoai_van: boolean;
  cach_cuc: CachCuc[];
  thanh_mon: ThanhMonEntry[];
  mo_cua_phu: MoCuaPhuEntry[];
  chinh_linh_than: ChinhLinhThanResult;
  thu_son_xuat_sat: ThuSonXuatSatEntry[];
  cac_cung: PhanTichCungEntry[];
  luu_nien?: LuuNienResult;
}

/**
 * @param van Vận NHÀ (từ năm nhập trạch) — dùng lập tinh bàn, nhãn cách cục, Thành Môn (cố định).
 * @param opts.vanHienTai Vận ĐANG CAI QUẢN (từ năm hiện tại) — dùng xét vượng/suy, Chính-Linh Thần,
 *   Thu Sơn Xuất Sát, ý nghĩa cặp Vận 9. Mặc định = van (nhà đúng vận hiện tại thì 2 vận trùng nhau).
 *   Tách 2 vận vì: tinh bàn cố định theo vận lập trạch, nhưng vượng/suy đổi theo vận đương lệnh —
 *   nhà Vận 7 sang Vận 9 là "thoái vận", Hướng tinh 7 lúc lập trạch vượng nay đã thành tử khí.
 */
export function tinhToanHuyenKhong(
  doHuong: number,
  van: number,
  opts: { dungTheQuai?: boolean; nam?: number; thangAm?: number; vanHienTai?: number } = {}
): KetQuaHuyenKhong {
  const vanHienTai = opts.vanHienTai ?? van;
  const tb = lapTinhBan(doHuong, van, opts.dungTheQuai ?? false);
  const out: KetQuaHuyenKhong = {
    tinh_ban: tb,
    van_nha: van,
    van_hien_tai: vanHienTai,
    da_thoai_van: vanHienTai !== van,
    // Cách cục: giữ theo VẬN NHÀ (nhãn kết cấu cố định của lá số).
    cach_cuc: [...nhanDienCachCuc(tb), canhBaoDaKiep()],
    // Thành Môn + mở cửa phụ: VỊ TRÍ cố định theo tọa-hướng, nhưng KHẢ DỤNG xét theo VẬN HIỆN TẠI
    // (đón vượng khí đang cai quản) — xem ví dụ "Tý vận 8 vs vận 9" trong thanh-mon.md.
    thanh_mon: timThanhMon(tb, vanHienTai),
    mo_cua_phu: xetMoCuaPhu(tb, vanHienTai),
    // Chính-Linh Thần + Thu Sơn Xuất Sát + phân tích cung: xét theo VẬN HIỆN TẠI (đương lệnh).
    chinh_linh_than: chinhLinhThan(vanHienTai),
    thu_son_xuat_sat: thuSonXuatSat(tb, vanHienTai),
    cac_cung: phanTichCung(tb, vanHienTai),
  };
  if (opts.nam) {
    out.luu_nien = phanTichLuuNien(tb, opts.nam, opts.thangAm ?? null, vanHienTai);
  }
  return out;
}
