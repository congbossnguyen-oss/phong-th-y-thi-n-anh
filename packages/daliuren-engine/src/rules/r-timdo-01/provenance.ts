/**
 * Provenance CỔ ĐIỂN cho R-TIMDO-01 — 畢法賦 pháp 35「人宅受脱俱招盗」, 卷九. Đã audit trực tiếp ở
 * docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md mục C — entry
 * này CHỈ hiện thực hoá NGUYÊN VĂN/gloss đã có sẵn, KHÔNG thêm bằng chứng mới.
 *
 * Đây là provenance CỦA RULE (bằng chứng cổ điển của chính lời khuyên luận đoán) — KHÁC
 * provenance CỦA CALCULATION LAYER (`YAOKE_PROVENANCE`/`MAOXING_PROVENANCE`,
 * `TWELVE_GENERALS_*_PROVENANCE`) mà evaluator.ts tham chiếu riêng qua
 * `Signal.calculationProvenanceIds`.
 */
import type { ProvenanceEntry } from "../../interpretation/provenance.js";

export const TIMDO_01_PROVENANCE: ProvenanceEntry = {
  id: "PROV-TIMDO-01",
  ruleId: "R-TIMDO-01",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷九, 畢法賦 pháp 35「人宅受脱俱招盗」",
  sourceType: "classical-fact",
  quote: "凡占定主失脫",
  confidence: "A",
  notes:
    "Gloss đã xác minh (Phase 11-B contract mục C): Huyền Vũ (元武/玄武) = dụng thần trộm/thất " +
    "vật; nếu Khóa Thể = 遙克 (yaoke) hoặc 昴星 (maoxing) VÀ Huyền Vũ đóng tại vị trí Sơ truyền " +
    "(phát dụng) → chắc chắn mất đồ. Evaluator R-TIMDO-01 CHỈ implement ĐÚNG rule CHÍNH này — " +
    "KHÔNG implement 太陽照武 (pháp 39, rule phụ, ngoài phạm vi Phase 11-B). Polarity=inauspicious " +
    "mang nghĩa 'xác nhận tình huống mất đồ đã xảy ra' (đã ghi nhận từ TD-1, " +
    "docs/daliuren/DA_LIU_REN_QUESTION_TEST_SPEC.md) — lựa chọn gần nhất trong 4 giá trị " +
    "SignalPolarity hiện có, không phải 'xấu cho người hỏi' theo nghĩa thông thường.",
};
