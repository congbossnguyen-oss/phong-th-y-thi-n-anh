# PHASE 11-A2 — DECISION RECORD (空亡 / Không Vong)

**Loại tài liệu**: Chốt quyết định, dựa trên
`docs/daliuren/DA_LIU_REN_PHASE_11A2_PRE_IMPLEMENTATION_AUDIT.md` (verdict READY WITH DOCUMENTED GAP).
**Phạm vi**: Quyết định thuần — đây là bước MỞ KHOÁ cho implementation Core 旬空 tiếp theo trong
cùng phiên làm việc, không phải audit độc lập riêng.

---

## Decision A — Core 旬空 (日旬空)

**APPROVE implementation.**

Phạm vi approve:
- 1 cặp Void Branches (`VoidBranches.pair`, đã có sẵn ở `types/void-branches.ts` — KHÔNG sửa type).
- Tính từ Can-Chi NGÀY (cụ thể: `dayPillar.cycleIndex`, 0-59) — theo đúng C2 (Algorithm Spec §10b
  "Cách tính") — KHÔNG dùng trụ Giờ/Tháng/Năm.
- Semantics khớp evidence đã audit: định nghĩa (C1) + cách tính (C2), cả 2 CONFIDENCE B, 2 lineage
  độc lập (六壬大全 + 三命通會).
- Đủ để phục vụ A4's `isVoid` (membership check đơn giản, không cần gì thêm).

**Không mở rộng semantics** ngoài phạm vi trên — không thêm field, không thêm ý nghĩa luận giải,
không thêm điều kiện rẽ nhánh nào khác.

---

## Decision B — 孤辰/寡宿

**DEFERRED — NOT IMPLEMENTED.**

Lý do:
- 六壬大全 tự liệt kê **3 cách đọc 孤/寡 không thống nhất** ("旬中孤寡有三": Âm/Dương của chi Không;
  Địa Bàn/Thiên Bàn; Sơ truyền/Mạt truyền) — CHÍNH văn bản cổ này không chọn 1 cách là chính.
- Algorithm Spec §10b's `KongWangInfo` đã **SILENTLY chọn** cách Địa Bàn/Thiên Bàn mà KHÔNG có
  decision rationale nào được ghi lại — đây là 1 silently resolved ambiguity thật, không phải lỗi
  triển khai của Core 旬空.
- Tồn tại **name collision** với 孤辰/寡宿 như 1 hệ thống thần sát ĐỘC LẬP tính theo Chi NĂM trong
  Bát Tự/Tử Vi (xem `report-E-divination-skill.md`) — rủi ro nhầm lẫn triển khai nếu không phân
  biệt rõ 2 khái niệm dùng chung tên.

**Ghi rõ**: đây là `RESEARCH / SEMANTIC DECISION GAP` — TUYỆT ĐỐI KHÔNG tự chọn A/B/C (Âm-Dương /
Địa-Thiên Bàn / Sơ-Mạt truyền) trong bước implementation tiếp theo. Không sửa Algorithm Spec §10b để
"làm cho khớp" — spec giữ nguyên nội dung hiện tại, gap được ghi nhận ở tài liệu audit/decision,
không phải ở spec.

---

## Decision C — A4 Dependency

**XÁC NHẬN**: A4 (`ShenShaPlacement.isVoid`) CHỈ phụ thuộc Core 旬空 (Decision A) để tính membership
"Dịch Mã có trùng 1 trong 2 chi Không Vong hay không". A4 **KHÔNG phụ thuộc** việc giải quyết
孤辰/寡宿 (Decision B) — Decision B hoãn lại KHÔNG chặn A4.

---

## Decision D — Architecture

A2 **chỉ expose pure primitive** `computeVoidBranches(...)`, đúng nguyên tắc đã chốt ở A1 Freeze
(`DA_LIU_REN_PHASE_11A1_FREEZE.md` mục 4) và A3 (`DA_LIU_REN_PHASE_11A3_DECISION_RECORD.md`).

**Không tạo**:
- `DaLiuRenChartWithVoid` (hoặc tên tương đương).
- `calculateDaLiuRenChartWithVoid()`.
- Bất kỳ facade mới nào khác.

Canonical facade duy nhất vẫn là `calculateDaLiuRenChart()` — A2 KHÔNG wire vào đó, KHÔNG sửa
`DaLiuRenCalculationResult`. Việc wiring (nếu có) là 1 quyết định RIÊNG, sau khi A2 core được audit
độc lập.

---

## Kết luận (Pre-Implementation Closure)

Decision A (Core 旬空) mở khoá implementation ngay trong bước tiếp theo. Decision B (孤辰/寡宿) giữ
nguyên trạng thái DEFERRED cho tới khi có 1 quyết định tường minh riêng từ chủ dự án. Decision C/D
xác nhận ranh giới phụ thuộc và kiến trúc, không thay đổi gì so với những gì audit đã kết luận.

**A2 CORE DECISIONS CLOSED — IMPLEMENTATION APPROVED (CORE ONLY), 孤辰/寡宿 DEFERRED.**

---

# PHẦN 2 — POST-INDEPENDENT-AUDIT DECISION CLOSURE

**Cập nhật sau khi implementation hoàn tất + Independent Audit hoàn tất**
(`docs/daliuren/DA_LIU_REN_PHASE_11A2_INDEPENDENT_AUDIT.md`, verdict **B — PASS WITH NON-BLOCKING GAP**).
Đây là bước chốt quyết định CUỐI trước Freeze + Commit — không tạo file mới, cập nhật ngay tại đây.

---

## Decision 1 — Core Semantics

**KEEP**: 1 cặp 日旬空/旬空, derive từ `dayPillar.cycleIndex`. Không mở rộng sang `hourPillar`.

**Wording chính xác (BẮT BUỘC dùng đúng mức độ chắc chắn này, không phóng đại)**:

> **`DAY SELECTED / CURRENT CONTRACT`** — KHÔNG viết `DAY ABSOLUTELY PROVEN IN ALL CLASSICAL VARIANTS`.

Lý do:
- Tất cả evidence hiện có (C1, C2, toàn bộ ví dụ cổ văn đã trích, cross-check 三命通會) đều ủng hộ
  Ngày.
- Independent Audit đã tự tìm kiếm thêm (grep toàn bộ docs cho biến thể "Giờ Không Vong") — **0 kết
  quả** ủng hộ Giờ/Tháng/Năm.
- NHƯNG bản thân research (report-5 + Algorithm Spec §10b) CHƯA đủ để tuyên bố 100% tính phổ quát cổ
  điển — thiếu 1 câu phát biểu tường minh loại trừ Giờ/Tháng/Năm. Đây là CONTRACT ĐÃ CHỌN dựa trên
  bằng chứng tốt nhất hiện có, KHÔNG PHẢI 1 sự thật cổ điển đã được chứng minh tuyệt đối.

## Decision 2 — Confidence

**KEEP**: `PROV-VOID-BRANCHES-CORE = B`. Không nâng A.

Lý do:
- Evidence mạnh (2 lineage độc lập, khớp tuyệt đối, verify qua 3 phương pháp độc lập trong Independent
  Audit — 0/60 mismatch).
- Implementation deterministic, đã re-verify 60/60.
- NHƯNG Day-vs-Hour vẫn là documented research gap (Decision 1) — chưa đóng.
- Citation chain chưa hoàn toàn primary-text-complete: report-5 tự ghi nhận nhiều trích dẫn của mình
  đến từ WebFetch tóm tắt, chưa tự đọc 100% nguyên văn Wikisource.

## Decision 3 — Provenance Source

**KEEP** `sourceId: "liu-ren-da-quan-siku"` — Independent Audit mục 9 đã xác nhận: không overclaim
(C1/C2 trích trực tiếp 六壬大全 quyển 9/11, không phải lý thuyết "phổ quát không riêng sách nào" như
WangShuai), đúng convention `FOUR_LESSONS_PROVENANCE` (primary source qua `sourceId`, cross-check qua
`notes`). Không đổi provenance chỉ để "đẹp" hơn về mặt style.

## Decision 4 — `affects`

**GIỮ semantics**: `initial/middle/final branch ∈ voidBranches` — thuần membership, không interpretation.

**APPROVE documentation hardening** (Phần 3 bên dưới): bổ sung citation C3 làm nguồn PHẦN NỀN
(common-ground, KHÔNG PHẢI phần 孤/寡 bị deferred) cho `affects`, theo đúng Finding #1 của Independent
Audit — chỉ sửa `notes`, KHÔNG đổi `confidence`/`sourceId`/semantics code.

## Decision 5 — 孤辰/寡宿

**KEEP: `DEFERRED`.** Không field. Không logic. Không provenance. Không schema expansion. Không sửa
Algorithm Spec §10b.

Lý do (không đổi từ Decision B gốc):
- "旬中孤寡有三" — 3 cách đọc cổ văn không thống nhất trong CHÍNH 六壬大全.
- Chưa có quyết định tường minh của chủ dự án chọn 1/3 cách (hoặc bỏ hẳn).
- Name collision với hệ thống 孤辰/寡宿 độc lập (thần sát theo Chi Năm, Bát Tự/Tử Vi).

## Decision 6 — A4 Dependency

A4 **CHỈ** phụ thuộc Core `voidBranches` (cụ thể `pair`) để xác định `isVoid` — membership đơn giản.
A4 **KHÔNG phụ thuộc** 孤辰/寡宿 (Decision 5). Việc sửa `computeYiMa()` hay tạo hàm phụ riêng cho A4 là
quyết định RIÊNG của A4 audit sau, không quyết định ở đây.

---

## Kết luận (Post-Audit Closure)

Cả 6 decision đều GIỮ NGUYÊN implementation/provenance hiện tại (không có quyết định nào yêu cầu sửa
code/semantics). Duy nhất 1 thay đổi được APPROVE: bổ sung citation C3 vào `notes` của
`VOID_BRANCHES_PROVENANCE` (documentation hardening thuần, không đổi confidence/sourceId/code) + bổ
sung 2 regression test (all-void, repeated-chi) vào test suite.

**A2 POST-AUDIT DECISIONS CLOSED — READY FOR FREEZE.**
