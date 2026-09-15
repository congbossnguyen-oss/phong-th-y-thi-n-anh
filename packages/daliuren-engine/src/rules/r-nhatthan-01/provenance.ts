/**
 * Provenance CỔ ĐIỂN cho R-NHATTHAN-01 — 六壬大全 卷三「日辰」. Nguồn đã audit trực tiếp
 * (docs/daliuren/research/phase2/report-1-sike-sanchuan.md Phần 1a, xem thêm
 * docs/daliuren/DA_LIU_REN_CLASSICAL_SOURCES.md), đã đặc tả trên giấy đầy đủ ở Phase 10.3
 * Section 10 / Phase 10.4 Section 10 — entry này CHỈ hiện thực hoá NGUYÊN VĂN đã có sẵn, KHÔNG
 * thêm bằng chứng mới, KHÔNG đổi confidence.
 *
 * Đây là provenance CỦA RULE (bằng chứng cổ điển của chính lời khuyên luận đoán) — KHÁC
 * provenance CỦA CALCULATION LAYER (`FOUR_LESSONS_PROVENANCE`, `PROV-GANZHI-PILLAR-CONSTRUCTION`,
 * `PROV-PROFILE-ZIHOUR-CONFLICTING`) mà evaluator.ts tham chiếu riêng qua
 * `Signal.calculationProvenanceIds` — 2 khái niệm KHÔNG được gộp (Phase 10.4 Section 6/10.5
 * Audit #1).
 */
import type { ProvenanceEntry } from "../../interpretation/provenance.js";

export const NHATTHAN_01_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NHATTHAN-01",
  ruleId: "R-NHATTHAN-01",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷三, mục 日辰 (đứng trước mục 發用)",
  sourceType: "classical-fact",
  quote:
    "日上生日百事吉…日上尅日百不利…日生上神百費出，日尅上神事抑塞…日辰各受上神生，兩家順利有生意…" +
    "日辰各受上神尅，兩家俱傷都不利…日上脫辰我脫他，辰上脫日他脫我，日辰各受上神脫，彼此防脫俱蹉跎",
  confidence: "A",
  notes:
    "Xác minh qua research/phase2/report-1-sike-sanchuan.md Phần 1a (nguồn Wikisource, 六壬大全 " +
    "四庫全書本, 卷三). Evaluator R-NHATTHAN-01 CHỈ implement 4 vế sinh/khắc theo TỪNG TRỤC riêng " +
    "(thượng thần sinh/khắc Can|Chi Ngày, và Can|Chi Ngày sinh/khắc ngược lại thượng thần) — KHÔNG " +
    "implement các vế hợp-trục (日辰各受上神生/尅/脫, xét ĐỒNG THỜI cả 2 trục) lẫn vế thoát CHÉO trục " +
    "(日上脫辰我脫他, 辰上脫日他脫我 — quan hệ GIỮA lesson1.upper và dayPillar.chi, hoặc GIỮA " +
    "lesson3.upper và dayPillar.can) vì đó nằm ngoài phạm vi thiết kế 'signal độc lập theo từng " +
    "trục' đã chốt ở Phase 10.3 Section 10 / Phase 10.4 Section 10 — phạm vi hẹp hơn CHÍNH VĂN " +
    "đầy đủ, ghi rõ ở đây để không ai lầm tưởng entry này bao phủ toàn bộ đoạn trích.",
};
