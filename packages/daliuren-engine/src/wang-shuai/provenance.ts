/**
 * Provenance cho công thức TÍNH 旺相休囚死 (5 cấp, Phase 11-A3) — Algorithm Spec §11 +
 * Pre-Implementation Audit mục A3 câu 6 (cả 2 nguồn ĐỘC LẬP đều chốt confidence A cho công thức
 * TÍNH, vì là lý thuyết Ngũ Hành phổ quát, không tranh cãi giữa các trường phái — không tự hạ
 * xuống B như `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` vì lý do hạ ở đó [thiếu cross-check độc
 * lập triển khai] không áp dụng ở đây: chu kỳ sinh/khắc dùng lại `TrachNhat.getNguHanhQuanHe` đã
 * PROVEN qua Phase 9/11-B, không phải thuật toán mới chưa kiểm chứng).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const WANG_SHUAI_PROVENANCE: ProvenanceEntry = {
  id: "PROV-WANG-SHUAI-STAGE",
  sourceId: "wu-xing-wang-xiang-cycle-convention",
  sourceTitle: "旺相休囚死 (Vượng Tướng Hưu Tù Tử) — chu kỳ 5 cấp Ngũ Hành tương sinh/tương khắc lấy Ngũ Hành Chi tháng làm gốc, lý thuyết Ngũ Hành phổ quát",
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §11",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Công thức TÍNH 5 cấp (旺/相/休/囚/死 theo quan hệ sinh/khắc giữa 1 hành X và hành CỐ ĐỊNH của " +
    "Chi tháng) là lý thuyết Ngũ Hành nền tảng, không có dị bản giữa các trường phái (Algorithm " +
    "Spec §11: 'công thức TÍNH 5 cấp = hạng A, không tranh cãi vì là lý thuyết Ngũ Hành phổ quát'; " +
    "Pre-Implementation Audit A3 mục 6 xác nhận lại). Quan hệ sinh/khắc dùng lại nguyên vẹn " +
    "`TrachNhat.getNguHanhQuanHe` (@thien-anh/rule-engine) — cùng tiện ích đã PROVEN hoạt động ở " +
    "nine-methods/wuxing.ts và các evaluator Phase 11-B (R-NHATTHAN-01/R-KIENTUNG-02), KHÔNG viết " +
    "lại chu kỳ sinh/khắc riêng. Gốc quy chiếu BẮT BUỘC là Ngũ Hành CỐ ĐỊNH của Chi tháng (tra qua " +
    "`Data.CHI_NGU_HANH`) — TUYỆT ĐỐI KHÔNG phải `monthPillar.napAm.element` (Nạp Âm, 1 hệ phân " +
    "loại khác — xem Pre-Implementation Audit A3 mục 8). Ý NGHĨA luận đoán riêng của Lục Nhâm (vd " +
    "'Đế Vượng = hung') KHÔNG thuộc phạm vi entry này — chỉ confidence C (Algorithm Spec §11), " +
    "thuộc Tầng 2 (Interpretation), ngoài phạm vi Phase 11-A3.",
};
