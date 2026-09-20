# PHASE 11-A2 — IMPLEMENTATION (空亡 / Không Vong, CORE ONLY)

**Loại tài liệu**: Ghi lại implementation Core 旬空 sau
`docs/daliuren/DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md` (Decision A approved).
**Trạng thái**: Implemented, **CHƯA audit độc lập, CHƯA freeze, CHƯA commit.**

---

## 1. Core 旬空 — Implemented

Đúng phạm vi Decision A: 1 cặp Không Vong tính từ `dayPillar.cycleIndex` (0-59, chu kỳ 60 Can-Chi
Lục Thập Hoa Giáp) + membership theo 3 vị trí Tam Truyền. Không mở rộng thêm bất kỳ semantics nào.

## 2. 孤辰/寡宿 — DEFERRED

**KHÔNG implement.** Không có field `earthPlateVoid`/`heavenPlateVoid`/`gu`/`gua` hay tương đương
nào trong code. Đúng Decision B — 3 cách đọc cổ văn ("旬中孤寡有三") chưa được chủ dự án chọn, và
Algorithm Spec §10b giữ nguyên KHÔNG bị sửa.

---

## 3. Exact Contract

### Files mới
- `src/void-branches/errors.ts` — `VoidBranchesError` (`code: "INVALID_CYCLE_INDEX"`).
- `src/void-branches/provenance.ts` — `VOID_BRANCHES_PROVENANCE`.
- `src/void-branches/compute.ts` — `computeVoidBranches(dayCycleIndex, transmissions)`.
- `src/void-branches/index.ts` — re-export.
- `tests/unit/void-branches/compute.test.ts` — 15 test.

### File sửa (additive only)
- `src/index.ts` — **+1 dòng**: `export * from "./void-branches/index.js";`.

### Signature

```ts
export interface VoidBranchesComputation {
  voidBranches: VoidBranches; // type ĐÃ CÓ SẴN ở types/void-branches.ts, KHÔNG sửa
  provenanceId: string;
}

export function computeVoidBranches(
  dayCycleIndex: number, // calendar.dayPillar.cycleIndex — BẮT BUỘC trụ NGÀY
  transmissions: Pick<ThreeTransmissions, "initial" | "middle" | "final">,
): VoidBranchesComputation;
```

### Công thức

Với `decade = Math.floor(dayCycleIndex / 10)` (0-5) và `decadeStartChiIndex = (decade*10) mod 12`:
2 chi Không Vong = `Data.CHI[(decadeStartChiIndex+10) mod 12]` và `Data.CHI[(decadeStartChiIndex+11) mod 12]`.
Đã verify khớp 100% bảng 六甲旬空 chuẩn (60/60 giá trị, xem mục 5).

`affects.{initial,middle,final}` = mỗi vị trí Tam Truyền có trùng 1 trong 2 chi Không Vong hay không
(membership boolean đơn giản — KHÔNG phụ thuộc cách đọc 孤/寡 nào).

**Validation**: `dayCycleIndex` phải là số nguyên 0-59, ngoài phạm vi → ném `VoidBranchesError`
(`INVALID_CYCLE_INDEX`) — KHÔNG silently trả kết quả sai (khác `Chi`, `number` không có compile-time
guard nên cần validate runtime tường minh, theo đúng "NO HIDDEN FALLBACK" đã áp dụng ở `computeYiMa`).

---

## 4. Provenance Decision

**Tạo entry MỚI** (`PROV-VOID-BRANCHES-CORE`) — KHÔNG tái dùng entry có sẵn, vì đây là 1 giá trị
TÍNH MỚI thật sự (không phải identity mapping như A1's `keType`).

| Field | Giá trị |
|---|---|
| `id` | `PROV-VOID-BRANCHES-CORE` |
| `sourceId` | `liu-ren-da-quan-siku` (TÁI DÙNG — C1/C2 trích trực tiếp 六壬大全 quyển 9/11, không phải lý thuyết "phổ quát không riêng sách nào" như WangShuai) |
| `sourceType` | `classical-fact` |
| `confidence` | **B** |

**Lý do confidence B (không phải A)**: khác WangShuai (structural, 0 ambiguity) — Core 旬空 có 2
caveat CHƯA giải quyết trong chính evidence: (a) chưa xác nhận 100% "luôn Can Chi Ngày, không bao
giờ Giờ/Tháng/Năm" — suy luận từ ví dụ; (b) report-5 tự ghi nhận citation B của mình đến từ WebFetch
tóm tắt, chưa tự đọc 100% nguyên văn Wikisource. Giống loại "B vì unresolved caveat" của
`MONTH_GENERAL_TABLE_PROVENANCE`, không phải loại "A vì structural check" của `WangShuai`.

**Phạm vi entry**: CHỈ Core (pair + affects) — notes ghi rõ KHÔNG bao gồm 孤辰/寡宿, tránh tương lai
suy nhầm confidence B này áp dụng luôn cho phần đang deferred.

---

## 5. Tests

**15 test mới** (`tests/unit/void-branches/compute.test.ts`):

| Nhóm | Test |
|---|---|
| Mapping đầy đủ 60/60 | 1 test, loop toàn bộ `cycleIndex` 0-59, đối chiếu bảng 6 tuần viết tay ĐỘC LẬP (không suy từ code đang test) |
| Boundary | 1 test, cả 5 ranh giới tuần (9/10, 19/20, 29/30, 39/40, 49/50) |
| Thứ tự pair | 1 test, xác nhận quy ước triển khai (offset tăng dần), ghi rõ KHÔNG khẳng định ý nghĩa cổ văn |
| Provenance | 1 test |
| Shape (không 孤辰/寡宿) | 1 test, xác nhận output CHỈ có đúng 2 key (`pair`/`affects`) |
| Determinism | 1 test, kèm xác nhận object mới mỗi lần gọi |
| **Purity** | 1 test, `structuredClone` trước/sau — THẬT (khác A3's test vacuous vì input string; ở đây input `transmissions` là object thật) |
| Invalid input | 4 test (>59, <0, không nguyên, NaN) — đều ném `VoidBranchesError` |
| Golden chart — bẫy Ngày vs Năm/Tháng/Giờ | 2 test, dùng chart thật 2024-08-20 20:00 (4 trụ rơi 4 tuần khác nhau hoàn toàn — bẫy mạnh hơn A3's napAm case, vì loại trừ được CẢ 3 trụ sai cùng lúc, không chỉ 1) |
| `affects` — có trúng | 1 test, cùng chart trên (`initial=true`) |
| `affects` — không trúng | 1 test, chart 2024-10-15 10:00 (tái dùng từ A3) |

**Kết quả**: 412/412 PASS (baseline 397 + 15 mới).

---

## 6. Architecture Boundary

- Không tạo `DaLiuRenChartWithVoid`/`calculateDaLiuRenChartWithVoid()`/facade nào khác.
- Không sửa `DaLiuRenCalculationResult`/thân hàm `calculateDaLiuRenChart()`.
- Không sửa `interpretation-package-builder.ts`/`validation/rule-registry.ts` — `kongWang` vẫn giữ
  nguyên trong `UnimplementedComponentId` (Rule Engine coi Không Vong là chưa wire vào canonical
  facade, đúng thực tế).
- `src/index.ts` chỉ +1 dòng export — không đổi gì khác.

---

## 7. A4 Dependency

`computeVoidBranches(...)` trả `voidBranches.pair: readonly [Chi, Chi]` — đủ để A4 tính `isVoid`
(`ShenShaPlacement.isVoid`) bằng 1 membership check đơn giản (`yiMa === pair[0] || yiMa === pair[1]`),
KHÔNG cần bất kỳ phần 孤辰/寡宿 nào. Việc có sửa `computeYiMa()` hay tạo hàm phụ riêng cho A4 là
quyết định RIÊNG của A4 audit sau, KHÔNG quyết định ở đây.

---

## 8. Validation (chạy fresh ngay trước báo cáo)

- `npx vitest run` → **412/412 PASS** (40 test file).
- `npm run typecheck` → PASS, 0 lỗi.
- `npm run build` (package) → PASS, 0 lỗi.
- `npm run build -w packages/daliuren-engine` (workspace) → PASS, 0 lỗi.

---

## 9. Regression

- A1 (`ke-type/`, `da-liu-ren-chart-with-ke-type.ts`) — `git diff --stat`: rỗng, unchanged.
- A3 (`wang-shuai/`) — `git diff --stat`: rỗng, unchanged.
- Phase 11-B (`r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`, `r-kientung-02/`, `rules/registry.ts`)
  — `git diff --stat`: rỗng, unchanged.
- `git status --short packages/daliuren-engine/` — chỉ `M src/index.ts` (+1 dòng) + 2 path mới
  (`src/void-branches/`, `tests/unit/void-branches/`).

---

**Trạng thái**: IMPLEMENTED (Core only), 孤辰/寡宿 = DEFERRED. Chờ independent audit trước khi
Decision Closure/Freeze/Commit.
