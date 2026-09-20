# PHASE 11-A2 — FREEZE (空亡 Core / 旬空)

**STATUS: FROZEN**

---

## Verdict

**B — PASS WITH NON-BLOCKING GAP**

---

## Commit

- **Hash**: `629db3d15b7f4e65edd2aa0e3fb4b27e493aa03c`
- **Message**: `feat(daliuren): add phase 11a void branches`
- **Files**: 11 files changed, 1535 insertions(+)

---

## Core Semantics

- 1 cặp Void Branches (日旬空/旬空), derive từ **`calendar.dayPillar.cycleIndex`** (0-59, chu kỳ 60
  Can-Chi Lục Thập Hoa Giáp).
- `affects.{initial,middle,final}` = membership thuần (`transmission branch ∈ voidBranches.pair`) —
  không interpretation, không gán nhãn 孤/寡.
- **Wording mức độ chắc chắn (BẮT BUỘC, theo Decision Record Phần 2 Decision 1)**:
  `DAY SELECTED / CURRENT CONTRACT` — **KHÔNG PHẢI** `DAY ABSOLUTELY PROVEN IN ALL CLASSICAL VARIANTS`.
  Tất cả evidence hiện có ủng hộ Ngày, 0 evidence ủng hộ Giờ/Tháng/Năm, nhưng chưa có 1 câu cổ văn
  tường minh loại trừ hoàn toàn Giờ/Tháng/Năm — đây là contract ĐÃ CHỌN dựa trên bằng chứng tốt nhất
  hiện có, không phải 1 sự thật cổ điển đã chứng minh tuyệt đối.

---

## Provenance

- `id`: `PROV-VOID-BRANCHES-CORE`
- Confidence: **B** (giữ nguyên, không nâng A — xem Decision Record Decision 2)
- `sourceId`: `liu-ren-da-quan-siku` (giữ nguyên, không overclaim — xem Decision Record Decision 3)
- `sourceLocation`: Algorithm Spec §10b (Định nghĩa + Cách tính) + report-5 mục C1-C2 (`pair`) + mục
  C3 phần nền chung (`affects`, đã hardening documentation theo Decision Record Decision 4)

---

## Validation

- **60/60 cycleIndex verification**: PASS — re-verify qua 3 phương pháp độc lập (formula gốc,
  set-complement tự viết trong Independent Audit, bảng 六甲旬空 cổ điển đã biết) — 0 mismatch.
- **Tests**: **414/414 PASS** (baseline 412 + 2 regression test mới: all-void, repeated-chi).
- **Typecheck**: PASS.
- **Package build**: PASS.
- **Workspace build**: PASS.

---

## References

- Pre-Implementation Audit: `docs/daliuren/DA_LIU_REN_PHASE_11A2_PRE_IMPLEMENTATION_AUDIT.md`
- Implementation: `docs/daliuren/DA_LIU_REN_PHASE_11A2_IMPLEMENTATION.md`
- Independent Audit: `docs/daliuren/DA_LIU_REN_PHASE_11A2_INDEPENDENT_AUDIT.md`
- Decision Record: `docs/daliuren/DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md`

---

## 孤辰/寡宿

**DEFERRED.** Không field, không logic, không provenance, không schema expansion trong Core A2.
Algorithm Spec §10b KHÔNG bị sửa. Lý do (không đổi): "旬中孤寡有三" (3 cách đọc cổ văn không thống
nhất — Âm/Dương, Địa Bàn/Thiên Bàn, Sơ/Mạt truyền), chưa có quyết định tường minh của chủ dự án, và
tồn tại name collision với hệ thống thần sát 孤辰/寡宿 độc lập (Chi Năm, Bát Tự/Tử Vi).

---

## A4 Dependency

A4 (`ShenShaPlacement.isVoid`) **CHỈ** phụ thuộc `voidBranches.pair` (Core A2) để tính membership đơn
giản — **KHÔNG phụ thuộc** 孤辰/寡宿. Việc sửa `computeYiMa()` hay tạo hàm phụ riêng cho A4 là quyết
định RIÊNG của A4 audit sau.

---

## Architecture Boundary

- Pure primitive only: `computeVoidBranches(dayCycleIndex, transmissions)`.
- Không `DaLiuRenChartWithVoid`/`calculateDaLiuRenChartWithVoid()`/facade nào khác.
- Không sửa `DaLiuRenCalculationResult`/thân hàm `calculateDaLiuRenChart()`.
- `src/index.ts`: +1 dòng export, không gì khác.
- A1 (`ke-type/`) — 0 diff.
- A3 (`wang-shuai/`) — 0 diff.
- Phase 11-B (`r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`, `r-kientung-02/`, `registry.ts`) —
  0 diff.

---

## Non-Blocking Gaps (ghi nhận, đã hardening 1 phần)

1. ~~Provenance notes chưa cite C3 làm nguồn nền cho `affects`~~ — **ĐÃ HARDENING** (Decision Record
   Decision 4): bổ sung citation C3 (chỉ phần nền chung) vào `notes`/`sourceLocation`, KHÔNG đổi
   confidence/sourceId/semantics code.
2. ~~Thiếu 2 regression test cố định (all-void, repeated-chi)~~ — **ĐÃ BỔ SUNG**: `Test A` và `Test B`
   trong `compute.test.ts`.

Không còn gap non-blocking nào mở sau bước này.

---

## Frozen Semantics

Từ thời điểm freeze này, các semantics sau ĐÃ ĐÔNG BĂNG — phase tương lai (A4 và bất kỳ rule Tầng 2
nào) KHÔNG được âm thầm sửa:

1. `VoidBranches` schema (`types/void-branches.ts`) — không đổi (chưa từng bị sửa xuyên suốt A2).
2. `computeVoidBranches(dayCycleIndex, transmissions): VoidBranchesComputation` — chữ ký và hành vi
   (gốc = `dayPillar.cycleIndex`, 60-cycle formula, `affects` membership thuần) — không đổi.
3. `VOID_BRANCHES_PROVENANCE` (id, confidence B, sourceId) — không đổi trừ khi có 1 quyết định tường
   minh mới thay thế Decision Record này.
4. `VoidBranchesError`/`INVALID_CYCLE_INDEX` — hành vi validation (integer 0-59) — không đổi.
5. 孤辰/寡宿 = DEFERRED — không mở khoá lại mà không có quyết định tường minh riêng.
6. Frozen A1/A3/Phase 11-B — A2 không mở khoá lại bất kỳ mục nào trong các phase trước.
7. Architecture rule (chỉ pure `computeXxx()`, không facade mới) — A2 là ví dụ tuân thủ thứ 3 (sau
   A1's compatibility-layer exception, A3), áp dụng tiếp cho A4.

---

**A2 FROZEN**
