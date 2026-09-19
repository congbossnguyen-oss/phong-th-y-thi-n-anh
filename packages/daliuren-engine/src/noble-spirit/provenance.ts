/**
 * Provenance cho 貴人 (Quý Nhân) — TÁCH RÕ 2 trục bằng chứng khác nhau, đúng yêu cầu Phase
 * 5B-3 mục 6/8/13 (không được gộp thành 1 con số confidence chung):
 *
 * (A) `GUI_REN_PAIR_PROVENANCE` — CẶP VỊ TRÍ theo nhóm Can (khẩu quyết "甲戊庚牛羊，乙己鼠猴
 *     乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎" xác định CAN NÀO dùng CẶP CHI NÀO — vd 甲/戊/庚
 *     dùng cặp {丑,未}). Trích dẫn nhất quán ở ≥2 nguồn ĐỘC LẬP (report-G mục 8 + comment
 *     trong code gốc repo B) — CONFIDENCE B, xem DA_LIU_REN_VALIDATION_REVIEW.md dòng 5.
 *
 * (B) `GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE` — trong CẶP đã có, CHI NÀO là 晝 (ngày) và CHI
 *     NÀO là 夜 (đêm) CHO TỪNG CAN CỤ THỂ (vd 甲: 未=ngày hay 丑=ngày?). Đây là trục YẾU HƠN
 *     NHIỀU — xem cảnh báo dưới.
 *
 * CẬP NHẬT Phase 5B-3R (audit giải quyết blocker (B)): đọc trực tiếp 六壬大全 卷一 xác nhận
 * Giáp SAI trong bảng cũ — đã sửa (table.ts) — 9 Can còn lại vẫn UNRESOLVED (confidence D). Xem
 * docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md cho toàn bộ audit log (OLD vs NEW evidence).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";
import type { Can } from "../types/ganzhi.js";

export const GUI_REN_PAIR_PROVENANCE: ProvenanceEntry = {
  id: "PROV-GUIREN-PAIR-MNEMONIC",
  sourceId: "report-g-guiren-mnemonic",
  sourceTitle: "report-G mục 8 (tổng hợp khẩu quyết Quý Nhân) + comment khẩu quyết trong code gốc repo B (kinliuren)",
  sourceLocation: "report-G mục 8; repo B sky_pan_list()",
  sourceType: "modern-interpretation",
  quote: "甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎，此是贵人方",
  confidence: "B",
  notes:
    "Khẩu quyết xác định CẶP CHI theo NHÓM CAN (甲戊庚→{丑,未}, 乙己→{子,申}, 丙丁→{亥,酉}, " +
    "壬癸→{卯,巳}, 辛→{寅,午}) — trích dẫn NHẤT QUÁN ở 2 nguồn thật sự độc lập (report-G tổng " +
    "hợp nhiều bài web + comment trong code gốc, khác dòng, của repo B) — xem " +
    "DA_LIU_REN_VALIDATION_REVIEW.md dòng 5 ('Giữ B cho phần cặp vị trí'). KHÔNG bao gồm việc " +
    "CHI NÀO trong cặp là ngày/đêm — xem GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE cho trục đó.",
};

export const GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE: ProvenanceEntry = {
  id: "PROV-GUIREN-DAYNIGHT-ASSIGNMENT",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle:
    "六壬大全 卷一 「貴神」 (đọc trực tiếp, Phase 5B-3R) cho Giáp; " +
    "Bảng 'đã sửa' (repo A/F, cùng 1 dòng code gốc) cho 9 Can còn lại (CHƯA có nguồn cổ trực tiếp)",
  sourceLocation:
    "六壬大全 (四庫全書本) 卷01 + bản Wikisource 'zh-hant/六壬大全/1' (2 bản độc lập, cùng văn bản) — " +
    "xem docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md",
  sourceType: "classical-fact",
  quote: "此貴神晝順行，夜逆行。不坐辰戌牢獄之地...如晝貴甲從子起，為諸干之首...故晝寄丑宮，夜寄未宮。",
  confidence: "C",
  notes:
    "=== OLD EVIDENCE (Phase 5B-3, GIỮ NGUYÊN không xóa) ===\n" +
    "⚠️ TRỤC YẾU NHẤT trong toàn bộ 貴人 — Validation Review dòng 5b: 'Không có nguồn cổ độc " +
    "lập nào xác nhận trực tiếp — chỉ suy từ việc A/F đã sửa. Chỉ 1 dòng nguồn (A/F cùng gốc).' " +
    "Repo A và repo F CHIA SẺ CHUNG 1 dòng code (xem Phase 5B-2 provenance cho cùng phát hiện " +
    "lineage này) — KHÔNG được tính là 2 nguồn độc lập, chỉ tính 1. " +
    "\n\nPHÁT HIỆN Phase 5B-3 (cross-check bắt buộc mục 10): khi đối chiếu ĐỘC LẬP 2 nguồn khác " +
    "— (1) chính report-G mục 8 tự diễn giải khẩu quyết thành \"Giáp/Mậu/Canh → ngày Sửu, đêm " +
    "Mùi; Ất/Kỷ → ngày Tý, đêm Thân; Bính/Đinh → ngày Hợi, đêm Dậu; Nhâm/Quý → ngày Tị, đêm " +
    "Mão; Tân → ngày Ngọ, đêm Dần\" và (2) 《黃帝授三子玄女經》(Đạo Tạng chính thống, đã được " +
    "Phase 4 xếp CLASSICAL FACT/CONFIDENCE B ở trục 晝夜 khác — xem docs/daliuren/research/" +
    "phase4/report-C-nightday.md RULE 3) — CẢ HAI nguồn này ĐỀU CHO KẾT QUẢ NGƯỢC với bảng repo " +
    "A/F đang dùng cho 7/10 Can (甲,戊,乙,己,丙,壬,辛) — chỉ 3/10 Can (庚,丁,癸) trùng khớp (do " +
    "repo A/F áp dụng quy tắc 'đảo chiều trong nhóm' khiến Can thứ 2 mỗi nhóm tình cờ trùng phía " +
    "với 黃帝經). Tại Phase 5B-3, KHÔNG tự sửa bảng (ngoài phạm vi lúc đó) — chỉ ghi OPEN ISSUE.\n\n" +
    "=== NEW EVIDENCE (Phase 5B-3R — audit giải quyết blocker, xem " +
    "docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md để biết đầy đủ) ===\n" +
    "Đọc TRỰC TIẾP 六壬大全 卷一 「貴神」 qua 2 bản Wikisource độc lập (四庫全書本 + bản khác) — " +
    "CẢ 2 cho cùng văn bản, xác nhận rõ ràng: \"如晝貴甲從子起，為諸干之首...故晝寄丑宮，夜寄未" +
    "宮\" — TỨC GIÁP: ngày=丑(Sửu), đêm=未(Mùi). Đây là nguồn cổ TRỰC TIẾP, không mơ hồ, ĐỦ " +
    "MẠNH để nâng status theo đúng yêu cầu Phase 5B-3R mục 5 — ĐÃ SỬA dòng Giáp trong " +
    "`GUI_REN_TRADITIONAL_TABLE` (table.ts) để khớp; CONFIDENCE riêng cho Giáp = B.\n\n" +
    "Đoạn văn KHÔNG liệt kê tường minh 9 Can còn lại (chỉ nêu Giáp làm ví dụ) — bảng đầy đủ tồn " +
    "tại dưới dạng 2 HÌNH VẼ (\"先天陽貴圖\"/\"後天陰貴圖\") ngay sau đoạn văn, đã thử đọc qua " +
    "text-extraction (Wikisource) và OCR bản scan (Internet Archive 06054168.cn) nhưng CẢ HAI " +
    "đều KHÔNG đủ tin cậy để tái dựng đúng 10 dòng (xem audit doc mục 3/5/7 — phân loại đây là " +
    "'transcription/OCR conflict'). Cũng xác nhận thêm 1 nguồn thứ 3 — công thức phái 曹震圭 " +
    "(\"陽貴以甲加丑逆行，陰貴以甲加未順行\", qua 三命通會/御定星曆考原 — shidianguji) — ĐỒNG " +
    "THUẬN với Giáp nhưng công thức áp dụng cho 9 Can còn lại trích xuất KHÔNG NHẤT QUÁN giữa 2 " +
    "lần thử, không đủ tin cậy để dùng.\n\n" +
    "QUYẾT ĐỊNH (không resolve bằng bình chọn — xem audit doc mục 9): CHỈ sửa Giáp (bằng chứng " +
    "trực tiếp, không mơ hồ). 9 Can còn lại GIỮ NGUYÊN giá trị cũ (repo A/F) nhưng HẠ confidence " +
    "xuống D (từ C) — vì nay ĐÃ BIẾT có ≥2 nguồn nói ngược, không còn là 'chỉ thiếu nguồn khác' " +
    "mà là 'có bằng chứng phủ định nhưng chưa đủ để biết thay bằng gì'. status TỔNG THỂ vẫn " +
    "PARTIAL, KHÔNG nâng lên READY dù 1/10 Can đã được xác nhận.",
};

/**
 * Confidence RIÊNG cho 9/10 Can CHƯA sửa (Mậu/Canh/Ất/Kỷ/Bính/Đinh/Nhâm/Quý/Tân) sau Phase
 * 5B-3R — HẠ từ C xuống D so với `GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE.confidence` (vốn phản
 * ánh mức của dòng Giáp đã sửa, B). Tách riêng field này vì `ProvenanceEntry` không có cấu trúc
 * per-Can — xem `notes` ở trên và docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md mục 6 để
 * biết đầy đủ lý do từng dòng. KHÔNG dùng field này để tính toán — chỉ để tài liệu hoá tường minh.
 */
export const GUIREN_DAYNIGHT_UNRESOLVED_CANS: readonly Can[] = ["Mậu", "Canh", "Ất", "Kỷ", "Bính", "Đinh", "Nhâm", "Quý", "Tân"];

export const NOBLE_SPIRIT_PROVENANCE_SEED: readonly ProvenanceEntry[] = [
  GUI_REN_PAIR_PROVENANCE,
  GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE,
];
