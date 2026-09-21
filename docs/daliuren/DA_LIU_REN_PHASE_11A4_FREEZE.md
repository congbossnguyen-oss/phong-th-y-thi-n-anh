# PHASE 11-A4 — FREEZE (驛馬 / Yi Ma Placement)

**STATUS: PHASE 11-A4 — FROZEN**

---

## Verdict

**B — PASS WITH NON-BLOCKING GAP**

---

## Implementation

Pure primitive duy nhất:

```ts
computeYiMaPlacement(
  dayChi: Chi,
  voidBranches: VoidBranches,
  voidBranchesProvenanceId: string,
): YiMaPlacementComputation
```

**Current operational contract**:

```text
dayChi
  ↓
computeYiMa(dayChi)
  ↓
Yi Ma Zhi
  ↓
A2 voidBranches.pair
  ↓
isVoid
```

---

## Frozen Semantics

1. Source branch = **Chi Ngày** (day Chi) — `dayChi = calendar.dayPillar.chi`, khớp đúng contract
   đang vận hành thật trong `nine-methods/compute.ts` (`fourLessons.lesson3.lower`).
2. `computeYiMa()` (`src/yi-ma/`, Phase 9C) = **source of truth DUY NHẤT** cho Yi Ma mapping. A4
   không duplicate bảng/logic.
3. `isVoid = voidBranches.pair.includes(yiMa)` — membership boolean thuần.
4. A2 Core (`computeVoidBranches()`) là **nguồn Void DUY NHẤT** — A4 nhận `voidBranches` đã tính sẵn
   từ caller, không tự gọi lại A2.
5. **Không** dùng hệ Không Vong thay thế nào khác (không Giờ, không hệ khác).
6. **Không** dùng `孤辰/寡宿` — vẫn DEFERRED.
7. **Không** tạo provenance mới cho `isVoid`.
8. Yi Ma provenance = **reuse** `YI_MA_PROVENANCE.id`.
9. A2 provenance = **pass-through** (`voidBranchesProvenanceId` nhận nguyên vẹn từ caller).
10. **Chỉ** pure primitive — không có gì khác được expose.
11. **Không** chart-level integration.
12. **Không** facade mới.

---

## Provenance

| Field | Giá trị |
|---|---|
| Yi Ma (`zhiProvenanceId`) | `YI_MA_PROVENANCE.id` (`PROV-YI-MA-POSITION`, reuse nguyên vẹn) |
| Void (`voidBranchesProvenanceId`) | A2's `VOID_BRANCHES_PROVENANCE.id` (`PROV-VOID-BRANCHES-CORE`, pass-through từ caller) |
| `isVoid` | **Deterministic composition** — suy luận logic tất yếu (set membership) từ 2 nguồn trên, **không có provenance riêng, không fabricate**. |

---

## C1 Documented Gap — GIỮ NGUYÊN MỞ

**Day-vs-Year ambiguity VẪN LÀ documented gap**, KHÔNG được đóng bởi Freeze này.

- Contract hiện hành dùng Chi Ngày (Decision 1, Decision Record).
- Điều này **KHÔNG tuyên bố** đây là "universal classical proof" — chỉ là contract ĐANG VẬN HÀNH,
  dựa trên bằng chứng tốt nhất hiện có (`nine-methods/compute.ts` đã đông băng dùng Chi Ngày).
- `DA_LIU_REN_PROVENANCE.md` Nút 9 vẫn ghi nhận khả năng dùng Chi Năm "tuỳ ngữ cảnh" — chưa giải
  quyết, chưa bị silently resolve.

---

## Accepted Findings (KHÔNG reopen)

| # | Mức | Nội dung | Trạng thái |
|---|---|---|---|
| 1 | P2 | `voidBranches.pair` malformed → `TypeError` thô, không phải domain error | **ACCEPTED / non-blocking** |
| 2 | P2 | Test `isVoid=true` trong suite chủ yếu dùng fixture, không golden chart | **NO CORRECTION REQUIRED** (golden chart độc lập `2024-10-15 10:00` đã đủ bằng chứng) |
| 3 | P3 | Thiếu automated test cho 2 case đã manual-verify (repeated branch, vị trí thứ 2 của pair) | **ACCEPTED / backlog** |

---

## Evidence

- **433/433 tests PASS.**
- **Typecheck**: PASS.
- **Package build**: PASS.
- **Workspace build**: PASS.
- **Independent composition verification**: 12/12 Yi Ma mapping, **0 mismatch** (script riêng, độc
  lập với test suite — Independent Audit mục 4).
- **Independent golden chart**: `2024-10-15 10:00` Asia/Shanghai — tự tìm mới, xác nhận
  `isVoid=true` khớp 100% dự đoán độc lập (Independent Audit mục 9).
- **Frozen-area diff**: 0 ở mọi khu vực (mục Regression Boundary dưới).

---

## Regression Boundary

```text
A1                       = zero diff
A2                       = zero diff
A3                       = zero diff
Phase 11-B               = zero diff
src/yi-ma/                = zero diff
DaLiuRenCalculationResult = zero diff
Algorithm Spec            = zero diff
```

---

## Architecture Rule

Governance đã chốt ở A1 vẫn là AUTHORITATIVE: **`calculateDaLiuRenChart()` là canonical Tầng-1
facade DUY NHẤT.** A4 chỉ expose 1 pure primitive (`computeYiMaPlacement`), KHÔNG tạo facade chart
mới, KHÔNG wire vào `DaLiuRenCalculationResult`. Rule này áp dụng tiếp cho bất kỳ candidate nào trong
tương lai.

---

## References

- `docs/daliuren/DA_LIU_REN_PHASE_11A4_PRE_IMPLEMENTATION_AUDIT.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A4_IMPLEMENTATION.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A4_INDEPENDENT_AUDIT.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A4_DECISION_RECORD.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A2_FREEZE.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A1_FREEZE.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11A3_FREEZE.md`
- `docs/daliuren/DA_LIU_REN_PHASE_11B_FREEZE.md`

---

## Commit

- **Hash**: `PENDING — điền sau khi commit`
- **Message**: `feat(daliuren): freeze phase 11a yi ma placement`

---

**PHASE 11-A4 — FROZEN**
