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
  /** Điểm mức thuận -10..10 để vẽ biểu đồ sóng vận trình. */
  diem: number;
  /** Nhận xét ngắn cho giai đoạn này. */
  nhanXet: string;
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

/** Một ô cung trên lá số 12 cung — đủ dữ liệu để vẽ lưới trực quan. */
export interface CungTuViVM {
  chiIndex: number;
  chiName: string;
  canName: string;
  cungName: string;
  isMenh: boolean;
  isThan: boolean;
  chinhTinh: { ten: string; trangThai: string }[];
  catTinh: string[];
  satTinh: string[];
  tuHoa: { ten: string; loai: string }[];
  tuan: boolean;
  triet: boolean;
  daiVanTuoi: [number, number];
}

/** Luận từng cung quan trọng (Mệnh, Tài, Quan, Di, Phu Thê, Phụ Mẫu, Tử Tức, Tật Ách, Phúc Đức). */
export interface LuanCung {
  cungName: string;
  chiName: string;
  chinhTinh: string; // "Tham Lang (Vượng)" hoặc "Vô Chính Diệu"
  danhGia: "cat" | "binh" | "hung";
  diem: number; // -10..10, dùng vẽ biểu đồ
  nhanXet: string;
}

/**
 * Luận trọn BỘ TAM PHƯƠNG TỨ CHÍNH của một cung (bản cung + đối cung + 2 cung tam hợp) — anh Công
 * chốt 22/8/2026: "xét mệnh và thân thì phải xét đối cung và trong cung tam hợp tốt hay xấu".
 * Trong Tử Vi không luận cung đơn lẻ: một cung yếu vẫn khá nếu được tam phương cứu, và ngược lại.
 */
export interface LuanBoTamPhuong {
  /** "Mệnh" hoặc "Thân (cư Tài Bạch)" */
  tenBo: string;
  banCung: LuanCung;
  doiCung: LuanCung;
  /** Đúng 2 cung tam hợp (±4 vị trí Chi). */
  tamHop: LuanCung[];
  /** Điểm cả bộ -10..10 (bản cung nặng nhất, rồi đối cung, rồi tam hợp). */
  diemBo: number;
  danhGia: "cat" | "binh" | "hung";
  soCatTinh: number;
  soSatTinh: number;
  soHoaCat: number;
  soHoaKy: number;
  nhanXet: string;
}

/**
 * 4 lĩnh vực chấm RIÊNG BIỆT (anh Công chốt 27/8/2026: "gia đạo, tài vận, sức khỏe, nhân duyên").
 *
 * ⚠️ CĂN CỨ BẮT BUỘC PHẢI TÁCH RIÊNG — `luan-giai-bat-tu-manh-phai/SKILL.md` nhắc 2 lần: "kết luận
 * 'phú quý/đại nhân vật' CHỈ nói về sự nghiệp/tiền bạc — KHÔNG suy ra sức khỏe/hạnh phúc/gia đình";
 * "nếu hỏi về hôn nhân/sức khỏe/gia đình, luận riêng bằng Thập Thần lục thân + Thần Sát, không suy
 * diễn từ mức độ phú quý". Vì vậy KHÔNG được lấy 1 điểm tổng rồi chia ra 4 mặt.
 */
export type LinhVucKey = "suc_khoe" | "gia_dao" | "tai_van" | "nhan_duyen";

/** Một căn cứ đã kích hoạt khi chấm 1 lĩnh vực — luôn kèm nguồn tài liệu để anh Công truy vết. */
export interface CanCuLinhVuc {
  /** true = điểm cộng, false = điểm trừ. */
  thuanLoi: boolean;
  noiDung: string;
  /** Tên file + mục trong tài liệu gốc, vd "tai-van.md §1". */
  nguon: string;
}

export interface DiemLinhVuc {
  linhVuc: LinhVucKey;
  nhan: string; // "Sức khỏe" ...
  /** -10..10 — điểm tổng hợp của lĩnh vực này (Bát Tự + Tử Vi + Đại Vận). */
  diem: number;
  danhGia: "tot" | "kha" | "trung_binh" | "can_luu_y";
  /** Tách phần đóng góp để phụ huynh thấy 2 hệ nói giống hay khác nhau. */
  diemBatTu: number;
  diemTuVi: number;
  canCu: CanCuLinhVuc[];
  nhanXet: string;
  /**
   * true khi Bát Tự và Tử Vi đánh giá NGƯỢC CHIỀU nhau rõ rệt ở lĩnh vực này. Khi đó điểm trung bình
   * KHÔNG phản ánh đúng thực tế — phải nói thẳng với người đọc là hai hệ bất đồng, thay vì để con số
   * hoà lại thành "trung bình" một cách im lặng.
   */
  haiHeMauThuan: boolean;
}

/** So Mệnh với Thân — Mệnh chủ tiền vận, Thân chủ hậu vận (cách luận truyền thống). */
export interface SoSanhMenhThan {
  thanCuMenh: boolean;
  diemMenh: number;
  diemThan: number;
  ketLuan: "dong_cung" | "menh_troi_hon" | "than_troi_hon" | "can_bang";
  nhanXet: string;
}

export interface TuViAnalysis {
  cungMenh: string;
  cungThan: string;
  than_cu: string; // Thân cư cung nào (Mệnh/Quan Lộc/Phúc Đức/Tài Bạch/Thiên Di/Phu Thê)
  cuc: string;
  tuoiKhoiHan: number;
  chinhTinhMenh: { ten: string; trangThai: string }[];
  /** Bước 4 — quy-trinh-chon-gio-sinh-mo-tu-vi.md */
  tamPhuongTuChinh: TamPhuongTuChinhResult;
  /** Bước 1 — luận trọn bộ tam phương tứ chính của cung MỆNH. */
  boMenh: LuanBoTamPhuong;
  /** Bước 2 — luận trọn bộ tam phương tứ chính của cung THÂN. */
  boThan: LuanBoTamPhuong;
  /** Bước 3 — Mệnh trội hơn hay Thân trội hơn. */
  soSanhMenhThan: SoSanhMenhThan;
  /** Bước 5 — Mệnh cường Thân cường là tổ hợp tốt nhất. */
  cuongNhuocMenh: MucCuongNhuoc;
  cuongNhuocThan: MucCuongNhuoc;
  /**
   * Trọn bộ Tam Phương Tứ Chính của cung đại diện từng lĩnh vực (Tật Ách/Tài Bạch/Phụ Mẫu/Phu Thê)
   * — nguyên liệu phần Tử Vi cho `bon-linh-vuc.ts`. Khóa là `LinhVucKey`.
   */
  boLinhVuc: Partial<Record<LinhVucKey, LuanBoTamPhuong>>;
  veto: TuViVetoResult;
  daiHan: TuViDaiHanBandItem[];
  /** 12 cung đầy đủ — để vẽ lá số trực quan. */
  cungs: CungTuViVM[];
  /** Luận từng cung quan trọng cho phụ huynh đọc. */
  luanCacCung: LuanCung[];
  /** Kết luận tổng phần Tử Vi (3-6 câu). */
  ketLuan: string[];
}

// --- Bổ sung 22/8/2026 (anh Công gửi 3 mẫu dashboard làm chuẩn giao diện) ------------------------

/** Một bước trong phễu lọc — để vẽ đồ hình "84 ứng viên rụng dần còn 3". */
export interface BuocPhezuLoc {
  ten: string;
  giaiThich: string;
  conLai: number;
  loai: number;
}

/**
 * Điểm quy về thang 0–100 CHỈ ĐỂ HIỂN THỊ (gauge + thanh trong bảng so sánh). Việc XẾP HẠNG vẫn
 * dùng điểm thô của hai hệ riêng biệt, không cộng chéo — đây chỉ là phép quy đổi tuyến tính từ điểm
 * thô sang thang dễ đọc cho phụ huynh.
 * ⚠️ Biên quy đổi là DRAFT, chờ calibrate trên ≥20 lá số thật.
 */
export interface DiemPhuongAn {
  batTu: number; // 0-50
  tuVi: number; // 0-50
  tong: number; // 0-100
  mucNhan: string; // "Rất tốt" | "Tốt" | "Tạm được" | "Nên cân nhắc thêm"
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
  /**
   * Luôn `true` từ 27/8/2026 — công cụ chấm đủ 12 canh giờ, không loại giờ nào vì lịch bệnh viện
   * (anh Công chốt). Giữ trường để không phá code cũ đang đọc nó.
   */
  medicalEligible: boolean;
  /** Chỉ để GẮN NHÃN tham khảo: giờ này nằm ngoài khung mổ gia đình khai. Không ảnh hưởng lọc/xếp hạng. */
  ngoaiKhungGioBenhVien?: boolean;
  hardFilterRejections: HardFilterReason[];
  baziAnalysis?: BaziAnalysis;
  tuViAnalysis?: TuViAnalysis;
  /** Chấm riêng 4 mặt: Sức khỏe · Gia đạo · Tài vận · Nhân duyên (xem `bon-linh-vuc.ts`). */
  bonLinhVuc?: DiemLinhVuc[];
  redFlags: RedFlag[];
}

export type SelectionStatus = "strong_recommendation" | "recommendation" | "limited_options" | "no_good_option";

export interface DecisionFactor {
  label: string;
  detail: string;
}

export interface CandidateSummaryCard {
  candidateId: string;
  /** Điểm quy đổi 0-100 để hiển thị (gauge, thanh so sánh). */
  diem: DiemPhuongAn;
  ngayDuongLich: string; // "22/08/2026"
  khungGio: string;
  tuTru: string; // "Bính Ngọ / Bính Thân / Mậu Thìn / Đinh Tỵ"
  vuongSuy: string;
  dungThan: string;
  cungMenh: string;
  cuc: string;
  diemNoiBat: string[]; // ✓ ...
  diemCanLuuY: string[]; // △ ...
  /** Chấm riêng 4 mặt, đã sắp theo thứ tự ưu tiên của gia đình (cao → thấp trong bảng trọng số). */
  bonLinhVuc: DiemLinhVuc[];
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
  /** Phễu lọc từng bước — dùng vẽ đồ hình "sinh ra bao nhiêu, rụng ở đâu, còn mấy". */
  phezuLoc: BuocPhezuLoc[];
  /** Top lý do loại nhiều ứng viên nhất, đã đổi mã L1-L8 sang tiếng Việt. */
  lyDoLoaiHangDau: { nhan: string; so: number }[];
  disclaimer: { medical: string; metaphysics: string };
}
