/**
 * Provenance cho cơ chế lặp Trung/Mạt truyền từ Sơ truyền (Algorithm Spec §7.3) — CONFIDENCE
 * A, toán học thuần túy, "không tranh cãi giữa các nguồn" (nguyên văn Spec). Provenance của
 * chính Sơ truyền (九宗門 nào đã chọn) nằm ở `nine-methods/provenance.ts`, KHÔNG lặp lại ở đây.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const THREE_TRANSMISSIONS_CHAIN_PROVENANCE: ProvenanceEntry = {
  id: "PROV-THREE-TRANSMISSIONS-CHAIN",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.3",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Trung truyền = chữ Thiên Bàn tại vị trí Địa Bàn của Sơ truyền; Mạt truyền = chữ Thiên Bàn " +
    "tại vị trí Địa Bàn của Trung truyền — dùng lại NGUYÊN VẸN `heavenPlateAt` " +
    "(heaven-earth-plate/compute.ts), không viết lại phép tra. XÁC MINH ĐỘC LẬP (Phase 9B): " +
    "đúng với 賊克/比用/涉害/伏吟-not-implemented/返吟-delegate (repo A shipan.py dùng " +
    "`self.__天盘[__初]`/`self.__天盘[__中]` y hệt cho các pháp này). ⚠️ KHÔNG đúng cho 昴星 " +
    "trong repo A (xem nine-methods/provenance.ts MAOXING_PROVENANCE) — package này vẫn dùng " +
    "chuỗi chuẩn cho 昴星 theo đúng phạm vi đã khoá, ghi nhận sai khác thay vì tự sửa.",
};
