/**
 * Provenance cho bảng 寄宮 + thuật toán dựng 4 Khóa (Algorithm Spec §6). Theo
 * docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md dòng "四課" (READY, confidence A, "Định
 * nghĩa toán học, đồng thuận tuyệt đối") và
 * docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md mục 1 dòng #7 ("A+B+C+F", giữ A).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const FOUR_LESSONS_PROVENANCE: ProvenanceEntry = {
  id: "PROV-FOUR-LESSONS-CONSTRUCTION",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §6 (tổng hợp cross-check; xem thêm docs/daliuren/research/phase2/report-1-sike-sanchuan.md cho phần vai trò luận đoán độc lập của 四課, KHÔNG thuộc phạm vi provenance công thức lập này)",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Công thức lập 4 Khóa (bảng 寄宮 + phép ghép Khóa 1→2→3→4) ĐỒNG THUẬN TUYỆT ĐỐI giữa 4 " +
    "nguồn độc lập đã audit (report-A mục 7 `SiKe`, report-B mục 2 `all_sike`, report-C, " +
    "report-F) — bao gồm cả thứ tự trả về chuẩn hoá 1→2→3→4 do dự án tự quy ước (repo B trả " +
    "về thứ tự ngược `[四課,三課,二課,一課]`, ĐÃ chuẩn hoá lại ở compute.ts, KHÔNG giữ nguyên " +
    "thứ tự gốc của bất kỳ repo nào). " +
    "XÁC MINH ĐỘC LẬP THÊM (Phase 9A, golden case): đã dò tay qua source code thật của repo B " +
    "(`kentang2017/kinliuren`, commit 3ba45a9, hàm `all_sike` dòng 199-205) với input " +
    "dayCan=甲(Giáp), dayChi=子(Tý), monthGeneral=丑(Sửu), hourChi=子(Tý) — cả 4 khóa khớp " +
    "CHÍNH XÁC với kết quả implement ở compute.ts (Khóa1={upper:卯,lower:甲}, " +
    "Khóa2={upper:辰,lower:卯}, Khóa3={upper:丑,lower:子}, Khóa4={upper:寅,lower:丑}).",
};
