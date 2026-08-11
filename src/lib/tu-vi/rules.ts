// Bảng quy tắc (rule tables) cho engine Tử Vi, profile NAM_PHAI_NGUYEN_CAT — theo đúng kiến trúc
// "tách rule khỏi hàm tính" yêu cầu bởi TuVi_Engine_V2.md (không hard-code luận suy trong renderer,
// không để AI tự tạo bảng mà không ghi rõ nguồn/mức tin cậy).
//
// MỖI BẢNG DƯỚI ĐÂY ĐƯỢC GẮN NHÃN:
//   VERIFIED — khớp trực tiếp với Golden Master #001 (sinh Dương lịch 31/8/1980 11:30, Nam,
//              Âm lịch 21/7/1980, năm Canh Thân) lấy từ TuVi_Engine_V2.md mục 37, do người dùng cung cấp.
//   DERIVED  — theo kiến thức phổ biến về Tử Vi Đẩu Số (Nam phái thường gặp), CHƯA có ví dụ độc lập
//              thứ hai để đối chiếu từng ô. Người dùng đã đồng ý dùng mức này (thay vì để trống) với
//              điều kiện ghi rõ nhãn DERIVED xuyên suốt.
//
// RULE_CONFLICT_REPORT (theo mục 48 của spec): TuVi_Engine_V2.md mục 13 ghi offset Liêm Trinh trong
// Vòng Tử Vi là -7, nhưng đối chiếu với chính Golden Master của tài liệu đó (Tử Vi tại Tuất=10,
// Liêm Trinh tại Dần=2, mục 37) thì offset đúng phải là -8. Người dùng đã xác nhận dùng -8 (khớp
// Golden Master) — xem TU_VI_RING bên dưới.

// Phase 5 (audit): tên sao chuẩn hóa (canonical) — dùng hằng số thay vì literal string rải rác để tránh
// lệch chính tả giữa các bảng đến từ nguồn khác nhau (VD spec §17 ghi "Tả Phụ" nhưng §21 và toàn bộ phần
// còn lại của spec dùng "Tả Phù" — quyết định: coi đây là 1 lỗi đánh máy trong spec, dùng "Tả Phù" làm
// tên duy nhất, KHÔNG tạo 2 định danh khác nhau cho cùng 1 sao. Không đổi nội dung Tứ Hóa của Nhâm — vẫn
// trỏ tới đúng sao này, chỉ chuẩn hóa cách viết).
export const STAR_TA_PHU = "Tả Phù";
export const STAR_HUU_BAT = "Hữu Bật";
export const STAR_VAN_XUONG = "Văn Xương";
export const STAR_VAN_KHUC = "Văn Khúc";

export const DAN = 2; // Dần trong hệ Địa Chi Tý=0 (mục 2 của spec)

export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}
export function mod10(n: number): number {
  return ((n % 10) + 10) % 10;
}

// --- Mục 3: Can Chi, Âm Dương ---
export const CAN_DUONG = new Set(["Giáp", "Bính", "Mậu", "Canh", "Nhâm"]);
export const CHI_DUONG = new Set(["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"]);

// --- Mục 7: Ngũ Hổ Độn — Can năm sinh -> Can tại cung Dần (VERIFIED, dùng lại công thức đã đối chiếu
// khớp Golden Master ở bản trước: Canh -> Giáp tại Dần, xem mục 37 "Mệnh Dần: Liêm Trinh" cần Can Giáp
// tại Dần để cho ra đúng dãy Can 12 cung, đã kiểm bằng tay). ---
export const NGU_HO_DON: Record<number, number> = {
  0: 2, 5: 2, // Giáp, Kỷ -> Bính
  1: 4, 6: 4, // Ất, Canh -> Mậu
  2: 6, 7: 6, // Bính, Tân -> Canh
  3: 8, 8: 8, // Đinh, Nhâm -> Nhâm
  4: 0, 9: 0, // Mậu, Quý -> Giáp
};

// --- Mục 6: 12 cung chức năng, an nghịch từ Mệnh (VERIFIED khớp bảng palace mapping Golden Master
// mục 37: Dần=Mệnh, Mão=Phụ Mẫu, Thìn=Phúc Đức, Tỵ=Điền Trạch, Ngọ=Quan Lộc, Mùi=Nô Bộc, Thân=Thiên Di,
// Dậu=Tật Ách, Tuất=Tài Bạch, Hợi=Tử Tức, Tý=Phu Thê, Sửu=Huynh Đệ). ---
export const CUNG_NAMES_TU_MENH_NGHICH = [
  "Mệnh", "Huynh Đệ", "Phu Thê", "Tử Tức", "Tài Bạch", "Tật Ách",
  "Thiên Di", "Nô Bộc", "Quan Lộc", "Điền Trạch", "Phúc Đức", "Phụ Mẫu",
];

// --- Mục 9: Ngũ Hành Cục (VERIFIED: Canh Thân, Mệnh Dần -> Thổ Ngũ Cục) ---
export const CUC_INFO: Record<string, { name: string; so: number }> = {
  Thủy: { name: "Thủy Nhị Cục", so: 2 },
  Mộc: { name: "Mộc Tam Cục", so: 3 },
  Kim: { name: "Kim Tứ Cục", so: 4 },
  Thổ: { name: "Thổ Ngũ Cục", so: 5 },
  Hỏa: { name: "Hỏa Lục Cục", so: 6 },
};

// --- Mục 10: Mệnh Quái (DERIVED — công thức Bát Trạch phổ biến; nhánh Nam/thế kỷ 20 VERIFIED khớp
// Golden Master: Canh Thân 1980, Nam -> Khôn. Nhánh Nữ và nhánh thế kỷ 21 chưa có ví dụ đối chiếu). ---
const MENH_QUAI_SO_TO_NAME: Record<number, string> = {
  1: "Khảm", 2: "Khôn", 3: "Chấn", 4: "Tốn", 6: "Càn", 7: "Đoài", 8: "Cấn", 9: "Ly",
};
// FIX (audit docs/TUVI_ENGINE_AUDIT.md mục E1.3): nhánh Nam trước đây chỉ dùng `if (so <= 0)`, không
// xử lý trường hợp `so > 9` (xảy ra khi 2 số cuối năm sinh là "00", ví dụ 1900/1800 — digit-sum = 0 nên
// `so = 10 - 0 = 10`, không khớp bảng tra 1-9, trả về undefined). Chuẩn hóa bằng 2 vòng lặp `while` đối
// xứng cho cả 2 nhánh giới tính, đảm bảo `so` luôn nằm trong [1,9] bất kể giá trị đầu vào.
export function tinhMenhQuai(lunarYear: number, gender: "Nam" | "Nữ"): string {
  const last2 = ((lunarYear % 100) + 100) % 100;
  let sum = last2;
  while (sum > 9) sum = String(sum).split("").reduce((a, d) => a + Number(d), 0);
  const isTheKy21 = lunarYear >= 2000;
  let so = gender === "Nam" ? (isTheKy21 ? 9 - sum : 10 - sum) : (isTheKy21 ? sum + 6 : sum + 5);
  while (so <= 0) so += 9;
  while (so > 9) so -= 9;
  if (so === 5) so = gender === "Nam" ? 2 : 8; // Khôn (Nam) / Cấn (Nữ)
  return MENH_QUAI_SO_TO_NAME[so];
}

// --- Mục 11: Chủ Mệnh / Chủ Thân — PHASE 8 (docs/TUVI_ENGINE_PHASE8_REPORT.md): khóa tra bảng đã đổi
// từ Chi cung Mệnh/Thân sang CHI NĂM SINH, theo bằng chứng thực nghiệm (docs/TUVI_RULE_FORENSICS.md
// mục B4 + docs/TuVi_Profile_NguyenCat_V1_Review.md mục 3): tra theo Chi cung Mệnh cho 0/6 Golden Master
// khớp, tra theo Chi năm sinh cho 6/6 khớp. Chỉ điền đúng 4 Chi năm sinh đã có Golden Master xác nhận
// (Thân, Ngọ, Sửu, Tỵ) — KHÔNG tự điền 8 Chi còn lại (dù nguồn Nguyên Cát có đưa giá trị candidate cho
// Mệnh Chủ, xem docs/TuVi_Profile_NguyenCat_V1_Review.md mục 3 bảng "12 Chi" — cố tình KHÔNG dùng ở đây
// theo đúng chỉ thị "không tự điền 8 giá trị chưa có evidence"). getChuMenh()/getChuThan() trả về
// "NEED_GOLDEN_MASTER_REVIEW" cho 8 Chi chưa xác nhận thay vì đoán.
//
// SOURCE_TEXT_CONFLICT = TRUE: chính văn bản TuVi_Profile_NguyenCat_V1.md mục 5 tự khẳng định "Mệnh Chủ
// is determined from the branch of Cung Mệnh... Do not use yearBranch" — NGƯỢC với bằng chứng thực tế
// (0/6 vs 6/6 ở trên). Giữ nguyên ghi chú mâu thuẫn này trong audit, không tự ý sửa lại văn bản nguồn.
export const CHU_MENH_BY_YEAR_BRANCH: Partial<Record<number, string>> = {
  8: "Liêm Trinh", // Thân — VERIFIED (GM-001, GM-002)
  6: "Phá Quân", // Ngọ — VERIFIED (GM-003)
  1: "Cự Môn", // Sửu — VERIFIED (GM-004, GM-005)
  5: "Vũ Khúc", // Tỵ — VERIFIED (GM-006)
};
export function getChuMenh(yearChiIndex: number): string {
  return CHU_MENH_BY_YEAR_BRANCH[yearChiIndex] ?? "NEED_GOLDEN_MASTER_REVIEW";
}

// Thân Chủ: khóa Chi năm sinh khớp ngay từ đầu với lời văn nguồn (không có SOURCE_TEXT_CONFLICT như
// Mệnh Chủ). Ngọ đã VERIFIED qua GM-003 (giải quyết được 1/2 mâu thuẫn "Tý/Ngọ presentation" mà nguồn tự
// khai báo — mục 6 của TuVi_Profile_NguyenCat_V1.md). Tý CỐ TÌNH giữ NEED_GOLDEN_MASTER_REVIEW, không
// suy diễn theo đối xứng với Ngọ dù nguồn gợi ý cùng giá trị "Hỏa Tinh".
export const THAN_CHU_BY_YEAR_BRANCH: Partial<Record<number, string>> = {
  8: "Thiên Lương", // Thân — VERIFIED (GM-001, GM-002)
  6: "Hỏa Tinh", // Ngọ — VERIFIED (GM-003)
  1: "Thiên Tướng", // Sửu — VERIFIED (GM-004, GM-005)
  5: "Thiên Cơ", // Tỵ — VERIFIED (GM-006)
};
export function getChuThan(yearChiIndex: number): string {
  return THAN_CHU_BY_YEAR_BRANCH[yearChiIndex] ?? "NEED_GOLDEN_MASTER_REVIEW";
}

// --- Mục 12-13: An Tử Vi + Vòng Tử Vi. Offset Liêm Trinh = -8 (đã sửa theo RULE_CONFLICT_REPORT ở
// đầu file — người dùng xác nhận dùng giá trị khớp Golden Master thay vì -7 ghi trong văn bản spec). ---
export interface RingStarDef {
  name: string;
  offset: number;
}
export const TU_VI_RING: RingStarDef[] = [
  { name: "Tử Vi", offset: 0 },
  { name: "Thiên Cơ", offset: -1 },
  { name: "Thái Dương", offset: -3 },
  { name: "Vũ Khúc", offset: -4 },
  { name: "Thiên Đồng", offset: -5 },
  { name: "Liêm Trinh", offset: -8 },
];

// --- Mục 14: Vòng Thiên Phủ ---
export const THIEN_PHU_RING: RingStarDef[] = [
  { name: "Thiên Phủ", offset: 0 },
  { name: "Thái Âm", offset: 1 },
  { name: "Tham Lang", offset: 2 },
  { name: "Cự Môn", offset: 3 },
  { name: "Thiên Tướng", offset: 4 },
  { name: "Thiên Lương", offset: 5 },
  { name: "Thất Sát", offset: 6 },
  { name: "Phá Quân", offset: 10 },
];

// --- Mục 16: Miếu/Vượng/Đắc/Bình/Hãm — 14 x 12. PHASE 16 (docs/TUVI_PHASE16_NGUYEN_CAT_STATUS_IMPLEMENTATION.md):
// khóa toàn bộ 168/168 ô theo ĐÚNG bảng TuVi_Profile_NguyenCat_V1.md §3, dùng làm SOURCE OF TRUTH duy
// nhất — không dùng Tân Biên 1956, không dùng tuvinamphai.vn, không dùng Vương Đình Chi, không suy ngược
// từ Golden Master để chọn giá trị. 5 ô trước đây khóa "Chưa xác định" (Vũ Khúc@Mão, Thiên Cơ@Ngọ,
// Thái Âm@Dần, Thất Sát@Mùi, Thiên Lương@Mùi — xem lịch sử ở Phase 8/13/15) nay nhận đúng giá trị Nguyên
// Cát: Đắc, Đắc, Hãm, Đắc, Đắc. 159/164 ô còn lại vốn đã lấy từ Nguyên Cát từ Phase 8 nên KHÔNG đổi giá
// trị, chỉ đổi ý nghĩa: trước là "91,9% khớp GM, 5 ô chờ thêm bằng chứng", nay là "168/168 dùng thẳng
// Nguyên Cát làm nguồn chính thức, xung đột với GM-003/GM-005/GM-006 ở 1 số ô được GHI NHẬN chứ không che
// giấu — xem docs/TUVI_PHASE16_NGUYEN_CAT_STATUS_IMPLEMENTATION.md mục "Golden Master conflict".
//
// Thứ tự chỉ số Chi: Tý0 Sửu1 Dần2 Mão3 Thìn4 Tỵ5 Ngọ6 Mùi7 Thân8 Dậu9 Tuất10 Hợi11.
export type TrangThaiSao = "Miếu" | "Vượng" | "Đắc" | "Bình" | "Hãm" | "Chưa xác định";
export const MAIN_STAR_STATUS: Record<string, TrangThaiSao[]> = {
  "Tử Vi": ["Bình", "Đắc", "Miếu", "Bình", "Vượng", "Miếu", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Bình"],
  "Thiên Cơ": ["Đắc", "Đắc", "Hãm", "Miếu", "Miếu", "Vượng", "Đắc", "Đắc", "Vượng", "Miếu", "Miếu", "Hãm"],
  "Thái Dương": ["Hãm", "Đắc", "Vượng", "Vượng", "Vượng", "Miếu", "Miếu", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm"],
  "Vũ Khúc": ["Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm"],
  "Thiên Đồng": ["Vượng", "Hãm", "Miếu", "Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Miếu", "Hãm", "Hãm", "Đắc"],
  "Liêm Trinh": ["Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
  "Thiên Phủ": ["Miếu", "Bình", "Miếu", "Bình", "Vượng", "Đắc", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Đắc"],
  "Thái Âm": ["Vượng", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Vượng", "Miếu", "Miếu", "Miếu"],
  "Tham Lang": ["Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm", "Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm"],
  "Cự Môn": ["Vượng", "Hãm", "Vượng", "Miếu", "Hãm", "Hãm", "Vượng", "Hãm", "Đắc", "Miếu", "Hãm", "Đắc"],
  "Thiên Tướng": ["Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc"],
  "Thiên Lương": ["Vượng", "Đắc", "Vượng", "Vượng", "Miếu", "Hãm", "Miếu", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
  "Thất Sát": ["Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng", "Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng"],
  "Phá Quân": ["Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm", "Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm"],
};

// getStarStatus: tra thẳng star + branch (chiIndex), tuyệt đối không suy luận qua ngũ hành hay công
// thức. Ném lỗi rõ ràng nếu star hoặc chiIndex ngoài phạm vi 14×12 thay vì trả về giá trị đoán.
export function getStarStatus(star: string, chiIndex: number): TrangThaiSao {
  const row = MAIN_STAR_STATUS[star];
  if (!row) throw new Error("RULE_NOT_DEFINED: MAIN_STAR_STATUS — không có sao " + star);
  if (chiIndex < 0 || chiIndex > 11) throw new Error("RULE_NOT_DEFINED: chiIndex ngoài phạm vi 0-11: " + chiIndex);
  return row[chiIndex];
}

// --- Mục 17: Tứ Hóa theo Can năm (VERIFIED nhánh Canh: Thái Dương=Lộc, Vũ Khúc=Quyền, Thái Âm=Khoa,
// Thiên Đồng=Kỵ, khớp Golden Master mục 17+37; 9 nhánh Can còn lại DERIVED). ---
export interface TuHoaResult {
  loc: string;
  quyen: string;
  khoa: string;
  ky: string;
}
export const TU_HOA_TABLE: Record<string, TuHoaResult> = {
  "Giáp": { loc: "Liêm Trinh", quyen: "Phá Quân", khoa: "Vũ Khúc", ky: "Thái Dương" },
  "Ất": { loc: "Thiên Cơ", quyen: "Thiên Lương", khoa: "Tử Vi", ky: "Thái Âm" },
  "Bính": { loc: "Thiên Đồng", quyen: "Thiên Cơ", khoa: "Văn Xương", ky: "Liêm Trinh" },
  "Đinh": { loc: "Thái Âm", quyen: "Thiên Đồng", khoa: "Thiên Cơ", ky: "Cự Môn" },
  "Mậu": { loc: "Tham Lang", quyen: "Thái Âm", khoa: "Hữu Bật", ky: "Thiên Cơ" },
  "Kỷ": { loc: "Vũ Khúc", quyen: "Tham Lang", khoa: "Thiên Lương", ky: "Văn Khúc" },
  "Canh": { loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thái Âm", ky: "Thiên Đồng" },
  "Tân": { loc: "Cự Môn", quyen: "Thái Dương", khoa: "Văn Khúc", ky: "Văn Xương" },
  "Nhâm": { loc: "Thiên Lương", quyen: "Tử Vi", khoa: STAR_TA_PHU, ky: "Vũ Khúc" },
  "Quý": { loc: "Phá Quân", quyen: "Cự Môn", khoa: "Thái Âm", ky: "Tham Lang" },
};

// --- Mục 18: Lộc Tồn theo Can năm (DERIVED, bảng phổ biến) ---
export const LOC_TON_TABLE: Record<string, number> = {
  "Giáp": 2, "Ất": 3, "Bính": 5, "Đinh": 6, "Mậu": 5, "Kỷ": 6, "Canh": 8, "Tân": 9, "Nhâm": 11, "Quý": 0,
};

// --- Mục 19: Thiên Khôi theo Can năm. PHASE 24 (docs/TUVI_PHASE24_KHOI_VIET_XUONG_KHUC_TA_HUU.md mục
// III/IV): thay bảng spec-literal cũ (TuVi_Engine_V2.md §19, nhóm Can Giáp/Ất-Bính/Đinh-Mậu/Kỷ-Canh/Tân-
// Nhâm/Quý) bằng bảng nguồn Nam Phái xác nhận qua hoc.kabala.vn, "Sai lầm về an sao lập số" — bài này cho
// CẢ Thiên Khôi lẫn Thiên Việt trong cùng 1 bảng ("Bộ Khôi Việt an theo hàng Can của năm sinh"). Đối
// chiếu phần Thiên Việt trong bài khớp NGUYÊN VĂN 100% với THIEN_VIET_TABLE đã dùng từ Phase 8 (nguồn
// Nguyên Cát) — xác nhận đây ĐÚNG LÀ cùng 1 nguồn Nam Phái đã chọn cho project, không còn là nghi ngờ.
// Nhóm Can đổi từ (Giáp/Ất, Bính/Đinh, Mậu/Kỷ, Canh/Tân, Nhâm/Quý) sang (Giáp/Mậu, Ất/Kỷ, Bính/Đinh,
// Canh/Tân, Nhâm/Quý) — ĐÚNG NHÓM đã dùng cho Thiên Việt, GIẢI QUYẾT rủi ro "2 nguồn khác nhau cho Khôi
// vs Việt" đã ghi nhận từ Phase 1/8. Không phụ thuộc giới tính (nguồn xác nhận rõ, khác Kình Dương/Đà La).
// Status: SOURCE_SUPPORTED (Level 1), GOLDEN_MASTER_VERIFIED=FALSE (0/6 GM có dữ liệu Thiên Khôi). ---
export const THIEN_KHOI_TABLE: Record<string, number> = {
  "Giáp": 1, "Mậu": 1, // Sửu
  "Ất": 0, "Kỷ": 0, // Tý
  "Bính": 11, "Đinh": 11, // Hợi
  "Canh": 6, "Tân": 6, // Ngọ
  "Nhâm": 3, "Quý": 3, // Mão
};
export function getThienKhoi(yearCanName: string): number {
  return THIEN_KHOI_TABLE[yearCanName];
}

// --- Thiên Việt — PHASE 8 (docs/TUVI_ENGINE_PHASE8_REPORT.md): thay bảng cổ điển tạm dùng ở Phase 1
// bằng bảng nguồn Học Viện Lý Số / Tử Vi Nguyên Cát ("Sai lầm về an sao lập số",
// TuVi_Profile_NguyenCat_V1.md §7). Vẫn KHÔNG dùng công thức Việt = Khôi + 6 (đối xứng tự phát, bị spec
// cấm rõ — xem RULE_CONFLICT_REPORT gốc ở mục 48 TuVi_Engine_V2.md).
//
// TRẠNG THÁI: SOURCE_SUPPORTED = TRUE (có trích dẫn nguồn cụ thể, PHASE 24 xác nhận lại — tìm độc lập
// đúng bài "Sai lầm về an sao lập số" qua hoc.kabala.vn, bảng khớp nguyên văn), GOLDEN_MASTER_VERIFIED =
// FALSE — không có Golden Master nào trong 6 GM hiện có ghi vị trí Thiên Việt để đối chiếu. Không phụ
// thuộc giới tính.
//
// RỦI RO "2 NGUỒN KHÁC NHAU CHO KHÔI/VIỆT" ĐÃ GIẢI QUYẾT Ở PHASE 24 — xem comment THIEN_KHOI_TABLE ở
// trên (nay dùng đúng cùng 1 nguồn, cùng nhóm Can, với bảng Thiên Việt dưới đây).
export const THIEN_VIET_TABLE: Record<string, number> = {
  "Giáp": 7, "Mậu": 7, // Mùi
  "Ất": 8, "Kỷ": 8, // Thân
  "Bính": 9, "Đinh": 9, // Dậu
  "Canh": 2, "Tân": 2, // Dần
  "Nhâm": 5, "Quý": 5, // Tỵ
};
export function getThienViet(yearCanName: string): number {
  return THIEN_VIET_TABLE[yearCanName];
}

// --- Mục 21: Tả Phù / Hữu Bật theo tháng âm. PHASE 24 (docs/TUVI_PHASE24_KHOI_VIET_XUONG_KHUC_TA_HUU.md
// mục VI): xác nhận qua hocvienlyso.org ("Tự học tử vi đẩu số bài 13: an các sao theo tháng sinh", Level
// 1) — nguyên văn: "Tả Phụ: khởi Thìn, kể tháng Giêng, đếm thuận, đến tháng sinh"; "Hữu Bật: khởi Tuất,
// kể tháng Giêng, đếm nghịch, đến tháng sinh". Khớp CHÍNH XÁC công thức hiện tại — không đổi gì, chỉ nâng
// nhãn DERIVED → SOURCE_SUPPORTED (Level 1). Nguồn xác nhận KHÔNG phụ thuộc giới tính. ---
export function taPhuIndex(lunarMonth: number): number {
  return mod12(4 + (lunarMonth - 1));
}
export function huuBatIndex(lunarMonth: number): number {
  return mod12(10 - (lunarMonth - 1));
}

// --- Mục 20: Văn Xương / Văn Khúc theo giờ sinh. PHASE 24 (docs/TUVI_PHASE24_KHOI_VIET_XUONG_KHUC_TA_HUU.md
// mục V): xác nhận qua hocvienlyso.org ("Tự học tử vi bài 14: an các sao theo giờ sinh", Level 1) —
// nguyên văn: "Văn Xương: khởi Tuất, kể giờ Tý, đếm nghịch, đến giờ sinh"; "Văn Khúc: khởi Thìn, kể giờ
// Tý, đếm thuận, đến giờ sinh". Khớp CHÍNH XÁC công thức hiện tại — không đổi gì, chỉ nâng nhãn DERIVED →
// SOURCE_SUPPORTED (Level 1). Nguồn xác nhận rõ KHÔNG phụ thuộc giới tính (khác hẳn Hỏa Tinh/Linh Tinh —
// chính nguồn này tự đối chiếu 2 nhóm sao để làm rõ điểm khác biệt). ---
export function vanKhucIndex(hourChiIndex: number): number {
  return mod12(4 + hourChiIndex);
}
export function vanXuongIndex(hourChiIndex: number): number {
  return mod12(10 - hourChiIndex);
}

// --- Mục 22: Địa Không / Địa Kiếp theo giờ sinh. PHASE 18B (docs/TUVI_PHASE18B_PHU_TINH_RULE_RESOLUTION.md
// mục II): spec §22 CHỈ yêu cầu "hai điểm khởi và hướng đối nghịch", KHÔNG cho điểm khởi cụ thể (không
// phải Hợi hay bất kỳ Chi nào khác — đã rà lại toàn văn §22, xác nhận không có số liệu). Điểm khởi Hợi
// dưới đây đến từ kiến thức phổ biến ngoài spec, KHÔNG có nguồn nào trong project xác nhận, 0/6 Golden
// Master có dữ liệu. Status = NEED_GOLDEN_MASTER_REVIEW — GIỮ NGUYÊN công thức (không có gì để thay thế
// mà không suy đoán), không tự đổi sang công thức khác. ---
export function diaKiepIndex(hourChiIndex: number): number {
  return mod12(11 + hourChiIndex);
}
export function diaKhongIndex(hourChiIndex: number): number {
  return mod12(11 - hourChiIndex);
}

// --- Mục 23: Hỏa Tinh / Linh Tinh theo nhóm tam hợp Chi năm sinh + giờ sinh. Spec §23 CHỈ liệt kê tên 4
// nhóm tam hợp (Dần/Ngọ/Tuất, Thân/Tý/Thìn, Tỵ/Dậu/Sửu, Hợi/Mão/Mùi), không cho bảng điểm khởi cụ thể.
// PHASE 22 (docs/TUVI_PHASE22_PHU_TINH_SOURCE_RESEARCH.md mục II): tìm được nguồn ngoài project
// (hoctuvi.blogspot.com/lyso.vn, Level 3/4, KHÔNG xác nhận cùng họ Học Viện Lý Số) — điểm khởi
// HOA_TINH_START/LINH_TINH_START dưới đây KHỚP 4/4 nhóm với nguồn đó, nhưng nguồn cũng nói orientation
// (thuận/nghịch) phải đảo theo Dương Nam/Âm Nữ giống Kình Dương/Đà La — code hiện tại KHÔNG làm vậy (luôn
// cộng). PHASE 23 (docs/TUVI_PHASE23_KINH_DA_HOA_LINH_RULE_LOCK.md mục III): CHỦ ĐỘNG KHÔNG áp dụng thay
// đổi orientation này — nguồn tự thừa nhận SCHOOL_CONFLICT giữa các phái cho riêng nhóm Tỵ/Dậu/Sửu, và
// độ tin cậy nguồn (Level 3/4) không đủ mạnh như nguồn đã khóa Kình/Đà (title trùng bài đã dùng cho Thiên
// Việt). Status = CONFLICTED (không phải chỉ thiếu bằng chứng — có bằng chứng nhưng chưa đủ mạnh + có
// xung đột trường phái) — GIỮ NGUYÊN công thức hiện tại, không tự chọn bên. ---
export function tamHopGroup(chiIndex: number): 0 | 1 | 2 | 3 {
  if ([8, 0, 4].includes(chiIndex)) return 0; // Thân Tý Thìn
  if ([2, 6, 10].includes(chiIndex)) return 1; // Dần Ngọ Tuất
  if ([5, 9, 1].includes(chiIndex)) return 2; // Tỵ Dậu Sửu
  return 3; // Hợi Mão Mùi
}
export const HOA_TINH_START = [2, 1, 3, 9]; // theo nhóm 0..3 (Dần, Sửu, Mão, Dậu)
export const LINH_TINH_START = [10, 3, 10, 10]; // Tuất, Mão, Tuất, Tuất

// --- Mục 24: Thiên Mã theo nhóm tam hợp Chi năm sinh. PHASE 29
// (docs/TUVI_PHASE29_CAN_CUNG_TRIET_THIEN_MA.md mục VI): LOCKED — tìm được nguồn Level 2 đầy đủ 4/4 nhóm:
// tuvivietnam.vn, bài "Kinh nghiệm tử vi của cụ Thiên Lương: Sao thiên mã tại mệnh, thân" (tác giả Trần
// Việt Sơn, thuật lại kinh nghiệm tác giả có tên riêng "cụ Thiên Lương") — nguyên văn: "Tuổi Dần Ngọ Tuất,
// Thiên Mã tại Thân / Tuổi Tỵ Dậu Sửu, Thiên Mã tại Hợi / Tuổi Thân Tý Thìn, Thiên Mã tại Dần / Tuổi Hợi
// Mão Mùi, Thiên Mã tại Tỵ" — khớp CHÍNH XÁC 4/4 nhóm với bảng dưới đây. Nguồn còn cho quy tắc kiểm chứng
// độc lập: "Thiên Mã ở cung ĐỐI DIỆN (xung) với Chi đứng đầu bộ tam hợp" — áp dụng đúng cho cả 4 nhóm,
// không phải suy diễn tự phát mà là nguyên văn nguồn. Không phụ thuộc giới tính/Can năm. Status:
// SOURCE_SUPPORTED (Level 2), GOLDEN_MASTER_VERIFIED=FALSE (0/6 GM). Không sửa công thức — code đã khớp
// đúng nguồn cho cả 4/4 nhóm. ---
export const THIEN_MA_START = [2, 8, 11, 5]; // theo nhóm 0..3 (Dần, Thân, Hợi, Tỵ)

// --- Mục 25: Thiên Hình — spec cho công thức cụ thể ("Dậu = tháng 1, chạy thuận"), DERIVED (spec-literal,
// chưa có Golden Master xác nhận số liệu). Phase 4 (audit): bổ sung theo đúng yêu cầu §25, trước đây
// engine bỏ sót mục này dù spec đã cho công thức sẵn. PHASE 25 (docs/TUVI_PHASE25_THIEN_DIEU_THIEN_Y.md):
// xác nhận thêm qua hocvienlyso.org ("Tự học tử vi đẩu số bài 13: an các sao theo tháng sinh", Level 1) —
// "Thiên Hình: khởi Dậu, đếm thuận theo tháng sinh" — khớp CHÍNH XÁC công thức đã có, nâng nhãn
// DERIVED → SOURCE_SUPPORTED. Bài 13 này CÙNG nguồn/CÙNG danh sách với Thiên Diêu/Thiên Y bên dưới (spec
// §25 tự gộp chung nhóm "Thiên Hình, Thiên Diêu, Thiên Y, Tả Phù, Hữu Bật" — nguồn khớp đúng cách gộp
// nhóm này của spec). ---
export function thienHinhIndex(lunarMonth: number): number {
  return mod12(9 + (lunarMonth - 1)); // Dậu = 9
}

// --- Mục 25: Thiên Diêu (Thiên Riêu) / Thiên Y. PHASE 22 (docs/TUVI_PHASE22_PHU_TINH_SOURCE_RESEARCH.md):
// tìm được công thức ở nguồn phổ thông (tuvi.vn, tuvi.lethuc.com — Level 3/4, chưa xác nhận Nam Phái) nên
// giữ NEED_SOURCE, không implement. PHASE 25: tìm lại trực tiếp trên hocvienlyso.org ("Tự học tử vi đẩu
// số bài 13: an các sao theo tháng sinh", Level 1 — CÙNG bài đã dùng cho Tả Phù/Hữu Bật ở Phase 24, và
// cho kết quả Thiên Hình khớp đúng công thức đã có ở trên — củng cố độ tin cậy nguồn) — nguyên văn:
// "Thiên Diêu (Riêu): khởi cung Sửu, đếm thuận theo tháng sinh"; "Thiên Y: Thiên Riêu ở cung nào, an
// Thiên Y ngay ở cung đó" (KHÔNG đếm độc lập — luôn đồng cung với Thiên Diêu, đúng theo nguồn, không phải
// suy diễn tự phát). Khớp với phát hiện Level 3/4 ở Phase 22 (không mâu thuẫn, chỉ nay nâng lên Level 1).
// Không phụ thuộc giới tính. Status: SOURCE_SUPPORTED (Level 1), GOLDEN_MASTER_VERIFIED=FALSE
// (0/6 GM có dữ liệu). ---
export function thienDieuIndex(lunarMonth: number): number {
  return mod12(1 + (lunarMonth - 1)); // Sửu = 1
}
export function thienYIndex(lunarMonth: number): number {
  return thienDieuIndex(lunarMonth); // luôn đồng cung với Thiên Diêu, theo đúng nguồn — không suy diễn
}

// --- Mục 25 (bổ sung, không có trong danh sách gốc nhưng thường đi kèm Thiên Mã): Đào Hoa, Hồng Loan,
// Thiên Hỷ (DERIVED, bảng phổ biến). Phase 4 (audit): giữ nguyên như hiện có, KHÔNG mở rộng thêm phụ
// tinh ngoài phạm vi spec trong đợt sửa này. ---
export const DAO_HOA_START = [9, 3, 6, 0]; // theo nhóm tam hợp 0..3
export function hongLoanIndex(yearChiIndex: number): number {
  return mod12(3 - yearChiIndex);
}
export function thienHyIndex(yearChiIndex: number): number {
  return mod12(hongLoanIndex(yearChiIndex) + 6);
}

// --- Mục 27: Vòng Tràng Sinh. PHASE 26 (docs/TUVI_PHASE26_VONG_SAO_THIEN_MA_AUDIT.md mục III): xác nhận
// LOCKED qua hocvienlyso.org ("Tự học tử vi bài 15: an các bộ sao khác", Level 1) — nguyên văn: "Khởi điểm
// theo Cục Số: Kim Tứ Cục khởi Tỵ, Mộc Tam Cục khởi Hợi, Hỏa Lục Cục khởi Dần, Thủy Nhị Cục & Thổ Ngũ Cục
// khởi Thân" — khớp CHÍNH XÁC bảng dưới đây. "Chiều di chuyển: DƯƠNG NAM – ÂM NỮ theo chiều THUẬN mà ÂM
// NAM – DƯƠNG NỮ theo chiều NGHỊCH" — khớp CHÍNH XÁC `isThuanChung` đã dùng trong `engine.ts` (cùng biến
// với Đại Vận, Kình Dương/Đà La). Cả điểm khởi lẫn chiều đều đã có nguồn Level 1 xác nhận — LOCKED, không
// đổi công thức. GOLDEN_MASTER_VERIFIED=FALSE (0/6 GM ghi vòng Tràng Sinh). ---
export const TRANG_SINH_START: Record<string, number> = {
  Thủy: 8, // Thân
  Mộc: 11, // Hợi
  Kim: 5, // Tỵ
  Thổ: 8, // Thân
  Hỏa: 2, // Dần
};
export const TRANG_SINH_STAGES = [
  "Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
];

// --- Mục 26: Vòng Thái Tuế. PHASE 26 (docs/TUVI_PHASE26_VONG_SAO_THIEN_MA_AUDIT.md mục IV): xác nhận qua
// hocvienlyso.org (bài "Tự học Tử vi đẩu số bài 12: An các sao theo chi năm sinh", Level 1) — "Thái Tuế:
// positioned tại cung khớp Chi năm sinh, 11 sao còn lại theo thứ tự THUẬN (clockwise)" — khớp điểm khởi
// (= Chi năm sinh) và chiều (luôn thuận, KHÔNG phụ thuộc giới tính — khác hẳn Tràng Sinh) đã dùng hiện
// tại. Thứ tự 12 tên sao khớp CHÍNH XÁC nguồn khác (tổng hợp qua hocvienlyso.org, nhiều trang cùng liệt kê
// đúng thứ tự này). Status: SOURCE_SUPPORTED (Level 1), GOLDEN_MASTER_VERIFIED=FALSE (0/6 GM). ---
export const THAI_TUE_STAGES = [
  "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù",
  "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
];

// --- Mục 32: Triệt theo Can năm. PHASE 29 (docs/TUVI_PHASE29_CAN_CUNG_TRIET_THIEN_MA.md mục V): LOCKED —
// hocvienlyso.org, "Nguyên lý khởi Tuần Triệt và tại sao triệt không an tại Tuất Hợi" (Level 1) — nguyên
// văn: "Giáp-Kỷ: Thân-Dậu / Ất-Canh: Ngọ-Mùi / Bính-Tân: Thìn-Tỵ / Đinh-Nhâm: Dần-Mão / Mậu-Quý: Tý-Sửu" —
// khớp CHÍNH XÁC 5/5 nhóm với bảng dưới đây, không mâu thuẫn nội bộ (khác 1 nguồn phụ khác cũng tìm được
// trên hocvienlyso.org — trang "TRIỆT LỘ KHÔNG VONG" — cho 1 bảng KHÁC dùng phương pháp đếm "Số Thái
// Huyền", bị lệch so với bảng đã khóa; nguồn đó dùng phương pháp tính khác, KHÔNG dùng để ghi đè, chỉ ghi
// nhận tồn tại 1 biến thể khác — xem docs Phase 29 mục "Source conflict phụ"). Không phụ thuộc giới tính.
// Status: SOURCE_SUPPORTED (Level 1), GOLDEN_MASTER_VERIFIED=FALSE (GM-006 chỉ ghi mơ hồ "theo bảng Can
// Ất", không đủ để làm GM độc lập). Không sửa công thức — code đã khớp đúng nguồn chính. ---
export const TRIET_TABLE: Record<string, [number, number]> = {
  "Giáp": [8, 9], "Kỷ": [8, 9], // Thân, Dậu
  "Ất": [6, 7], "Canh": [6, 7], // Ngọ, Mùi
  "Bính": [4, 5], "Tân": [4, 5], // Thìn, Tỵ
  "Đinh": [2, 3], "Nhâm": [2, 3], // Dần, Mão
  "Mậu": [0, 1], "Quý": [0, 1], // Tý, Sửu
};
