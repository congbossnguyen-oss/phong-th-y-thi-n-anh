/**
 * Provenance cho bảng 12 Nguyệt Tướng (Algorithm Spec §2). Theo
 * docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md dòng "月將" (READY, confidence B, nguồn
 * "六壬大全 卷五 quan hệ trung khí" + report-G mục 9) và
 * docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md mục 3.3.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const MONTH_GENERAL_TABLE_PROVENANCE: ProvenanceEntry = {
  id: "PROV-MONTH-GENERAL-TABLE",
  // Cùng sourceId với DAY_NIGHT_BOUNDARY_PROVENANCE (profiles/provenance-seed.ts) — cùng 1
  // văn bản nguồn, khác vị trí chương (quy ước ProvenanceEntry.sourceId cho phép việc này).
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷五 (quan hệ trung khí — vị trí chương theo Implementation Gate; CHƯA trích được nguyên văn cụ thể bảng 12 chi từ bản Wikisource, không bịa quote)",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Bảng 12 tên cổ (登明/河魁/從魁/傳送/小吉/勝光/太乙/天罡/太衝/功曹/大吉/神后) khớp TUYỆT ĐỐI " +
    "giữa 3 NGUỒN ĐỘC LẬP THẬT SỰ (không tính trùng lineage — xem docs/daliuren/research/" +
    "report-A-daliuren-web-engine.md, report-B-kinliuren.md, report-C-zhouyilab.md, " +
    "report-F-legacy-python.md): repo B (bảng tra tĩnh, code hoàn toàn riêng), repo C (verify " +
    "theo mốc thời gian thực qua thư viện tyme — cách làm kỹ nhất trong 5 repo), report-G mục 9 " +
    "(tổng hợp nhiều bài web tiếng Trung). Repo A và repo F CHIA SẺ CHUNG 1 dòng code gốc (repo F " +
    "kế thừa/sửa lại lỗi biên năm mà repo A cũng có) — KHÔNG được tính là 2 nguồn độc lập, chỉ " +
    "tính 1 (A/F=1). Vậy số nguồn độc lập thật sự là 3 (A/F=1, B=1, C=1), không phải 5. " +
    "CHƯA nâng hạng lên A: report-G mục 9 tự ghi nhận tồn tại 1 bài Zhihu tranh luận học thuật " +
    "thật (\"彻底终结月将争议\") về cách lấy Nguyệt Tướng mà nghiên cứu CHƯA fetch được toàn văn — " +
    "không thể loại trừ nó liên quan tới chính bảng 12 tên này. Giữ nguyên hạng B theo " +
    "DA_LIU_REN_VALIDATION_REVIEW.md mục 3.3 cho tới khi đọc được nội dung tranh luận đó.",
};

export const MONTH_GENERAL_PROVENANCE_SEED: readonly ProvenanceEntry[] = [MONTH_GENERAL_TABLE_PROVENANCE];
