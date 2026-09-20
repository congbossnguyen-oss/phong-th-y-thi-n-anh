/**
 * Provenance cho CORE 旬空/日旬空 (Phase 11-A2, Decision A — xem
 * DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md) — Algorithm Spec §10b phần "Định nghĩa"/"Cách tính"
 * (→ `pair`) + PHẦN NỀN CHUNG của "Áp dụng đa tầng (b) từng vị trí Tam Truyền" (→ `affects`, boolean
 * thuần, không gán nhãn) — KHÔNG bao gồm phần nhãn 孤辰/寡宿 (Áp dụng đa tầng (a)), đang DEFERRED
 * theo Decision B.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const VOID_BRANCHES_PROVENANCE: ProvenanceEntry = {
  id: "PROV-VOID-BRANCHES-CORE",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation:
    "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §10b (Định nghĩa + Cách tính); docs/daliuren/research/phase2/report-5-wangshuai-xingchonghehai-kongwang.md mục C1-C2 (pair) + mục C3 (CHỈ phần nền chung cho `affects`, KHÔNG phần 孤/寡 — xem notes)",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Định nghĩa (C1) + cách tính theo Can Chi NGÀY (C2) — 2 lineage ĐỘC LẬP khớp CHÍNH XÁC cùng 1 " +
    "công thức toán học chu kỳ 60 Can-Chi: 六壬大全 quyển 9/11 + 三命通會 論空亡 (SK1610, sách Bát " +
    "Tự — KHÔNG PHẢI Lục Nhâm mượn Bát Tự, cả 2 cùng kế thừa 1 sự kiện lịch pháp chung). Quote " +
    "三命通會: '有是位而無祿，曰空；有支而無干，曰亡'. " +
    "CHƯA đạt confidence A vì: (a) report-5 CHƯA xác nhận 100% câu phát biểu tường minh 'luôn lấy " +
    "Can Chi NGÀY, không bao giờ Giờ/Tháng/Năm' — là suy luận từ ví dụ trong 六壬大全, khuyến nghị " +
    "xác minh thêm; (b) report-5 tự ghi nhận nhiều trích dẫn B của mình đến từ WebFetch tóm tắt, " +
    "chưa tự đọc 100% nguyên văn Wikisource. " +
    "PHẠM VI ENTRY NÀY: CHỈ 1 cặp Void Branches CƠ BẢN (`VoidBranches.pair`) + membership theo vị " +
    "trí Tam Truyền (`affects`) — KHÔNG bao gồm 孤辰/寡宿 (nhãn gán theo Địa Bàn/Thiên Bàn hay bất " +
    "kỳ cách đọc nào khác trong 3 cách 六壬大全 tự liệt kê '旬中孤寡有三') — phần đó ĐANG DEFERRED " +
    "theo Phase 11-A2 Decision B, KHÔNG được suy ra confidence từ entry này. " +
    "GHI CHÚ NGUỒN CHO `affects` (Independent Audit finding #1, xem " +
    "DA_LIU_REN_PHASE_11A2_INDEPENDENT_AUDIT.md mục 9): việc 'kiểm tra 1 vị trí Tam Truyền có trùng " +
    "Không Vong hay không' xuất hiện trong đoạn văn C3 ('旬中孤寡有三: 發用值旬空...一也. 發用地盤空 " +
    "為孤，天盤空為寡，二也. 發用空為孤，末傳空為寡，三也.') — NHƯNG đây CHỈ là PHẦN NỀN CHUNG mà CẢ " +
    "3 cách đọc 孤/寡 đều PRESUPPOSE trước khi gán nhãn (mọi cách đều bắt đầu bằng việc xác nhận vị " +
    "trí có trúng Tuần Không hay không, chỉ khác nhau ở TÊN GỌI gán sau đó) — `affects` CHỈ lấy đúng " +
    "phần nền chung này (boolean thuần, không gán nhãn 孤/寡 nào), KHÔNG lấy bất kỳ phần nào của 3 " +
    "cách đọc đang bị deferred. Do đó `affects` vẫn nằm trong phạm vi CONFIDENCE B của entry này " +
    "(report-5 tự chấm CẢ C3 cũng là B) — KHÔNG kéo theo mức độ tranh cãi riêng của phần 孤/寡.",
};
