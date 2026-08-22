/**
 * TRẠCH NHẬT SINH NỞ — Giai đoạn 1: type contract của động cơ quyết định.
 * Nguồn quy trình: SKILL-trach-nhat-sinh-no.md + handoff/trach-nhat-sinh-no/references/*.md (9 tiêu
 * chí do anh Công chốt + phương pháp luan-giai-bat-tu chạy ngược + an Mệnh/Thân/Cục Tử Vi).
 *
 * ⚠️ Giới tính bé là trường BẮT BUỘC — không tính chi tiết (chiều Đại Vận Bát Tự, cách an Cung Thân
 * Tử Vi) nếu thiếu. Không suy đoán giới tính thay khách.
 */
import type { Gender } from "../bat-tu";
import type { NguHanh } from "../menh-nap-am";

export interface BirthSelectionInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  babyGender: Gender; // "Nam" | "Nữ" — BẮT BUỘC
  deliveryMode: "scheduled_c_section" | "labor" | "unknown";
  /** Khung giờ bệnh viện cho phép mổ — nếu để trống, xét đủ 12 giờ mỗi ngày (chỉ hợp lý khi sinh thường/chưa rõ). */
  hospitalTimeWindows?: { date?: { year: number; month: number; day: number }; startHour: number; endHour: number }[];
  timeZone: string; // vd "Asia/Ho_Chi_Minh"
  familyPriority: "health" | "wealth" | "career" | "academic" | "balanced";
}

// --- Ứng viên -----------------------------------------------------------------------------------

export interface CanChiSimple { can: string; chi: string }

export type CandidateStatus =
  | "GENERATED"
  | "MEDICAL_REJECTED"
  | "BAZI_REJECTED"
  | "BAZI_SURVIVOR"
  | "ZIWEI_REJECTED"
  | "FINALIST"
  | "RANKED"
  | "RECOMMENDED";

export interface HardFilterReason {
  code: "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8";
  title: string;
  explanation: string;
}

export interface GocResult {
  lop: "A" | "B" | "C" | "D" | null; // null = không có gốc nào đạt (đã bị L3 loại từ trước)
  diemThongCan: number;
  chiGoc: string | null; // Chi nơi có gốc tốt nhất
  biXung: boolean;
  biHopHoaMat: boolean;
  duoiHanhKhac: boolean;
  dienGiai: string[];
}

export type AnTinhMuc = "thieu" | "du" | "dep" | "thua" | "qua_thua";

export interface AnTinhResult {
  muc: AnTinhMuc;
  soPhan: number;
  coCan: boolean;
  hoaDuocQuanSat: boolean; // Ấn hóa Quan Sát — cấu trúc đáng săn nhất theo tài liệu
  dienGiai: string;
}

export interface NguHanhLuuThongResult {
  chuoi: { hanh: NguHanh; coMat: boolean; viTri: "thau_can" | "chinh_khi" | "tang_can" | "khong_co" }[];
  matXichDut: NguHanh[];
  matXichNghen: NguHanh[];
  vaiTroNhatChu: "dau_nhan" | "dau_tac_dong" | "dung_ngoai";
  dienGiai: string[];
}

export interface DaiVanBandItem {
  tuTuoi: number;
  denTuoi: number;
  namDuongLich: number; // năm dương lịch ứng với tuTuoi
  canChi: string;
  band: "rat_thuan" | "thuan" | "trung_binh" | "thu_thach" | "nghich";
  trongSo: "cao_nhat" | "cao" | "trung_binh" | "thap"; // giai đoạn 25-45t = cao_nhat theo 05§3
  xungNhatChi: boolean;
  xungNguyetChi: boolean;
  dienGiai: string;
}

/** §4 — Dụng Thần phải CÓ MẶT trong nguyên cục VÀ CÓ CĂN mới dùng được. */
export interface DungThanChatLuong {
  coMat: boolean;
  coCan: boolean;
  /** true khi Kỵ Thần vừa thấu can vừa nắm lệnh (tài liệu: "trừ nặng"). */
  kyThanThauCanDacLenh: boolean;
  dienGiai: string;
}

export interface BaziAnalysis {
  tuTru: { nam: CanChiSimple; thang: CanChiSimple; ngay: CanChiSimple; gio: CanChiSimple };
  nhatChu: { can: string; nguHanh: NguHanh };
  vuongSuy: string; // capDo từ bat-tu-engine
  dungThan: NguHanh;
  hyThan: NguHanh;
  kyThan: NguHanh;
  dungThanChatLuong: DungThanChatLuong;
  goc: GocResult;
  anTinh: AnTinhResult;
  luuThong: NguHanhLuuThongResult;
  tuHinhTuTruHinh: string[]; // tự hình / tam hình phát hiện được, "trừ nặng"
  daiVan: DaiVanBandItem[];
}

export interface TuViVetoResult {
  menhBiTuanTriet: boolean;
  tatAchBiTuanTriet: boolean;
  phuMauBiTuanTriet: boolean;
  soSatTinhHoiMenh: number; // Kình/Đà/Hỏa/Linh/Không/Kiếp
  satTinhHoiMenh: string[];
  hoaKyThuMenh: boolean;
  hoaKyThuTatAch: boolean;
  menhVoChinhDieu: boolean;
}

export interface TuViDaiHanBandItem {
  tuTuoi: number;
  denTuoi: number;
  cungName: string;
  soSatTinhTuTap: number;
  bietTuanTriet: boolean;
}

/** Bước 4 — Tam Phương Tứ Chính (Mệnh + Di + Tài + Quan), đếm trên CẢ 4 cung. */
export interface TamPhuongTuChinhResult {
  soCatTinh: number;
  soSatTinh: number;
  soHoaCat: number; // Hóa Lộc/Quyền/Khoa
  soHoaKy: number;
  chiTiet: string[];
}

export type MucCuongNhuoc = "cuong" | "trung_binh" | "nhuoc";

export interface TuViAnalysis {
  cungMenh: string;
  cungThan: string;
  than_cu: string; // Thân cư cung nào (Mệnh/Quan Lộc/Phúc Đức/Tài Bạch/Thiên Di/Phu Thê)
  cuc: string;
  tuoiKhoiHan: number;
  chinhTinhMenh: { ten: string; trangThai: string }[];
  /** Bước 4 — quy-trinh-chon-gio-sinh-mo-tu-vi.md */
  tamPhuongTuChinh: TamPhuongTuChinhResult;
  /** Bước 5 — Mệnh cường Thân cường là tổ hợp tốt nhất. */
  cuongNhuocMenh: MucCuongNhuoc;
  cuongNhuocThan: MucCuongNhuoc;
  veto: TuViVetoResult;
  daiHan: TuViDaiHanBandItem[];
}

export interface RedFlag {
  source: "bazi" | "ziwei" | "medical";
  severity: "critical" | "high" | "medium" | "low";
  code: string;
  title: string;
  explanation: string;
}

export interface BirthCandidate {
  id: string; // "YYYY-MM-DD-HHhChi" vd "2026-08-22-09hTy"
  date: { year: number; month: number; day: number };
  chiGio: string; // Tý..Hợi
  khungGio: string; // "23h–01h"
  hourRepr: number; // giờ đại diện dùng để tính (0-23)
  status: CandidateStatus;
  medicalEligible: boolean;
  hardFilterRejections: HardFilterReason[];
  baziAnalysis?: BaziAnalysis;
  tuViAnalysis?: TuViAnalysis;
  redFlags: RedFlag[];
}

export type SelectionStatus = "strong_recommendation" | "recommendation" | "limited_options" | "no_good_option";

export interface DecisionFactor {
  label: string;
  detail: string;
}

export interface CandidateSummaryCard {
  candidateId: string;
  ngayDuongLich: string; // "22/08/2026"
  khungGio: string;
  tuTru: string; // "Bính Ngọ / Bính Thân / Mậu Thìn / Đinh Tỵ"
  vuongSuy: string;
  dungThan: string;
  cungMenh: string;
  cuc: string;
  diemNoiBat: string[]; // ✓ ...
  diemCanLuuY: string[]; // △ ...
}

export interface FinalBirthRecommendation {
  primary?: CandidateSummaryCard;
  alternatives: CandidateSummaryCard[];
  selectionStatus: SelectionStatus;
  decisiveFactors: DecisionFactor[]; // "Vì sao chọn phương án này?"
  unresolvedRisks: string[]; // Khuyết điểm không gỡ được — LUÔN nêu
  soUngVienSinhRa: number;
  soUngVienConLaiSauLoc: number;
  medicalConstraintSummary: string;
  disclaimer: { medical: string; metaphysics: string };
}
