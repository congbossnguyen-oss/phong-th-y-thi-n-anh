# PHASE 11-A3 — FREEZE (旺相休囚死 / Wang Shuai)

**STATUS: FROZEN**

---

## Verdict

**B — PASS WITH NON-BLOCKING GAPS**

---

## Implementation

- Pure `computeWangShuai(monthChi: Chi): WangShuaiComputation`.
- Gốc quy chiếu: `Data.CHI_NGU_HANH[monthChi]` — **KHÔNG** dùng `monthPillar.napAm.element`.
- 5 `WangShuaiStage` (旺/相/休/囚/死), suy qua `TrachNhat.getNguHanhQuanHe(monthNguHanh, X)`.
- Deterministic, pure — không mutate input, không side effect, không I/O/network/LLM.
- KHÔNG có continuous strength score / numeric intensity / pseudo-precision nào.

---

## Validation

- **397/397 tests PASS** (baseline 388 + 9 mới).
- **Typecheck**: PASS.
- **Package build**: PASS.
- **Workspace build**: PASS.

---

## Audit & Decision

- Audit: `docs/daliuren/DA_LIU_REN_PHASE_11A3_INDEPENDENT_AUDIT.md`
- Decision record: `docs/daliuren/DA_LIU_REN_PHASE_11A3_DECISION_RECORD.md`

---

## Provenance

- `id`: `PROV-WANG-SHUAI-STAGE`
- Confidence: **A**
- `sourceId`: `wu-xing-wang-xiang-cycle-convention`
- `sourceLocation`: `docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §11`

---

## Non-blocking Gaps

1. `WANG_SHUAI_PROVENANCE.notes` could cite the structural-check precedent
   (`FUYIN_FANYIN_ACTIVATION_PROVENANCE`/`MAOXING_PROVENANCE`) more explicitly.
2. `computeWangShuai()` has no dedicated error type — relies on `TrachNhat.getNguHanhQuanHe()`'s
   own guard — style differs from `computeYiMa` (which has `YiMaError`).

**Neither gap requires correction before freeze.** Cả 2 đã được xác nhận qua Decision Record (Decision
3, Decision 4) là documentation/style hardening, không ảnh hưởng correctness.

---

## Architecture

- Pure primitive only — không facade mới.
- Không có `DaLiuRenChartWithWangShuai`.
- Không có `calculateDaLiuRenChartWithWangShuai`.
- Không sửa `DaLiuRenCalculationResult`/`calculateDaLiuRenChart()`.
- A1 (`ke-type/`, `da-liu-ren-chart-with-ke-type.ts`) — untouched, 0 diff.
- Phase 11-B (`r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`, `r-kientung-02/`, `registry.ts`) —
  untouched, 0 diff.

---

## Frozen Semantics

Từ thời điểm freeze này, các semantics sau được coi là ĐÃ ĐÔNG BĂNG:

1. `WangShuai`/`WangShuaiStage`/`FiveElement` schema (`types/wang-shuai.ts`) — không đổi.
2. `computeWangShuai(monthChi): WangShuaiComputation` — chữ ký và hành vi (gốc = `Data.CHI_NGU_HANH`,
   5-stage mapping theo Algorithm Spec §11, không định lượng hoá) — không đổi.
3. `WANG_SHUAI_PROVENANCE` (id, confidence A, sourceId) — không đổi trừ khi có 1 quyết định tường
   minh mới thay thế Decision Record này.
4. Error handling behavior (throw gián tiếp qua `getNguHanhQuanHe`, không có `WangShuaiError` riêng)
   — giữ nguyên cho tới khi có 1 quyết định riêng nâng cấp (không bắt buộc).
5. Frozen A1 (`calculateDaLiuRenChartWithKeType` compatibility layer) và Frozen Phase 11-B — A3
   không mở khoá lại bất kỳ mục nào trong 2 phase trước.
6. Architecture rule (chỉ pure `computeXxx()` cho A2/A3/A4, không facade mới) — A3 là ví dụ tuân thủ
   thứ 2 (sau A1's compatibility-layer exception) — áp dụng tiếp cho A2/A4.

---

**A3 FROZEN**
