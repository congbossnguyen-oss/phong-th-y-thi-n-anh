/**
 * Provenance cho 十二天將 (Algorithm Spec §8) — TÁCH RIÊNG order/anchor/direction vì độ mạnh
 * evidence khác nhau. Quý Nhân upstream (điều kiện tiên quyết của anchor) có provenance RIÊNG
 * ở `noble-spirit/provenance.ts` — KHÔNG lặp lại ở đây, CHỈ tham chiếu qua
 * `TwelveGeneralsComputation.nobleSpiritDayNightAssignmentProvenanceId`.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

const SOURCE_TITLE = "六壬大全 (欽定四庫全書本)";
const SOURCE_ID = "liu-ren-da-quan-siku";

export const TWELVE_GENERALS_ORDER_PROVENANCE: ProvenanceEntry = {
  id: "PROV-TWELVE-GENERALS-ORDER",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §8; docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md dòng 49",
  sourceType: "classical-fact",
  confidence: "A",
  notes: "12 tên + thứ tự cố định — 'nhất quán tuyệt đối mọi nguồn' (report-A/B/C/F đều khớp, xem Validation Review mục 10 giữ A).",
};

export const TWELVE_GENERALS_ANCHOR_PROVENANCE: ProvenanceEntry = {
  id: "PROV-TWELVE-GENERALS-ANCHOR",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation:
    "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §8 mục 1; docs/daliuren/research/report-A-daliuren-web-engine.md dòng 41 (\"貴人's earth-plate seat\"); docs/daliuren/research/report-C-zhouyilab.md dòng 74 (\"from 贵人's position\")",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Anchor = vị trí Địa Bàn `e` sao cho heavenPlateAt(e) === Quý Nhân đã resolve (=" +
    "earthChiOfHeavenValue) — phép tra ngược đã CONFIDENCE A sẵn từ Phase 9A (thuần toán học " +
    "trên 天地盤). 2 audit ĐỘC LẬP (report-A tự mô tả repo A, report-C mô tả 1 codebase KHÁC " +
    "hoàn toàn — banderzhm/ZhouYiLab) đều mô tả cơ chế bằng lời là 'đặt 貴人 tại vị trí ghế của " +
    "nó trên Địa Bàn (earth-plate seat) rồi đi tiếp từ đó' — khớp ĐÚNG công thức này." +
    "\n\n⚠️ PHÁT HIỆN QUAN TRỌNG (Phase 9D, xác minh bằng CHẠY THẬT code): mã thực thi của " +
    "`d1210182010/daliuren-web-engine` shipan.py `天将盘.__getitem__`/`.临` (dòng 973-990) " +
    "KHÔNG dùng biến `guiRenDiPan` (chính là anchor đã tính đúng ở dòng 962, dùng cho phép thử " +
    "thuận/nghịch) — mà dùng THẲNG `self.__guiren` (giá trị CHI THÔ của Quý Nhân, CHƯA qua " +
    "tra ngược Thiên Bàn) làm mốc chỉ số cho `天将 + (key - guiren)`. Đã CHẠY THỰC TẾ đoạn code " +
    "này (Phase 9D) với case monthGeneral=子 hourChi=丑 dayGan=甲 (晝占): guiRenDiPan tính đúng " +
    "= 寅, nhưng `__getitem__` lại đặt 貴人 tại 丑 (=giá trị guiren thô) thay vì tại 寅 " +
    "(=guiRenDiPan) — 2 kết quả 12-vị-trí khác nhau HOÀN TOÀN. Đối chiếu lại: MÔ TẢ BẰNG LỜI " +
    "của CHÍNH report-A (viết TRƯỚC khi phát hiện này, không phải suy diễn ngược) VÀ mô tả độc " +
    "lập của report-C ĐỀU khớp với `guiRenDiPan` (anchor qua tra ngược), KHÔNG khớp với hành vi " +
    "thực thi của `__getitem__`. Kết luận: rất có khả năng đây là 1 LỖI LẬP TRÌNH thật trong " +
    "repo A (biến đã tính đúng nhưng không được dùng ở bước sau) — KHÔNG PHẢI 1 cách hiểu cổ " +
    "điển khác. Package này dùng ĐÚNG `guiRenDiPan` (qua `earthChiOfHeavenValue`), KHÔNG dùng " +
    "hành vi `__getitem__` thô của repo A. Golden case (xem tests/) được dựng từ 2 tiểu-thành-" +
    "phần ĐÃ xác minh riêng của repo A (công thức `guiRenDiPan` + phép thử thuận/nghịch, cả 2 " +
    "đã chạy khớp) cộng thứ tự 12 tướng (confidence A độc lập) — KHÔNG lấy trực tiếp output " +
    "cuối của `__getitem__`/`临` vì lý do trên.",
};

export const TWELVE_GENERALS_DIRECTION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-TWELVE-GENERALS-DIRECTION",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §8 mục 2; docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md mục 10b",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Ranh giới thuận (Hợi/Tý/Sửu/Dần/Mão/Thìn) / nghịch (Tỵ/Ngọ/Mùi/Thân/Dậu/Tuất) theo VỊ TRÍ " +
    "ĐỊA BÀN của anchor (guiRenDiPan) — 2 nguồn độc lập thật (A/F=1 dòng + repo B độc lập) đồng " +
    "ý CÙNG giá trị, nhưng CHƯA ai trích được nguyên văn cổ trực tiếp cho ranh giới này. XÁC " +
    "MINH LẠI (Phase 9D, chạy thật): phép thử `si <= guiRenDiPan <= xu` trong " +
    "`d1210182010/daliuren-web-engine` shipan.py dòng 964-967 (dùng ĐÚNG `guiRenDiPan`, KHÔNG " +
    "bị lỗi như bước indexing cuối) khớp CHÍNH XÁC ranh giới đã khoá — phần thuận/nghịch KHÔNG " +
    "bị ảnh hưởng bởi lỗi ở TWELVE_GENERALS_ANCHOR_PROVENANCE.",
};
