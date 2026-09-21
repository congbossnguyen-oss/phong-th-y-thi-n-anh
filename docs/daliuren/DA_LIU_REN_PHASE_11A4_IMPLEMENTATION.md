# PHASE 11-A4 — IMPLEMENTATION (驛馬 / Yi Ma Placement)

**Loại tài liệu**: Ghi lại implementation sau
`docs/daliuren/DA_LIU_REN_PHASE_11A4_PRE_IMPLEMENTATION_AUDIT.md` (verdict READY WITH DOCUMENTED GAP).
**Trạng thái**: Implemented, **CHƯA audit độc lập, CHƯA freeze, CHƯA commit tại thời điểm viết tài
liệu này** (commit sẽ chạy ở bước cuối nếu mọi validation PASS).

---

## 1. Current Operational Contract

**Source branch = Chi NGÀY (day Chi).** Đây là contract HIỆN HÀNH đang vận hành thật trong
`nine-methods/compute.ts` (`computeYiMa(fourLessons.lesson3.lower)`, mà `four-lessons/compute.ts`
xác nhận `lesson3.lower = dayChi`) — A4 dùng LẠI đúng contract này, KHÔNG tự chọn lại.

**KHÔNG được coi là "đã chứng minh tuyệt đối theo mọi trường phái cổ điển"**: `DA_LIU_REN_PROVENANCE.md`
Nút 9 tự ghi nhận 六壬大全 có khả năng dùng Chi Năm "tuỳ ngữ cảnh" — ambiguity Ngày-vs-Năm **VẪN LÀ
documented gap**, chưa giải quyết, KHÔNG bị silently resolve bởi implementation này (xem mục 8).

---

## 2. Reuse `computeYiMa()`, `computeYiMaPlacement()` mới

- `src/yi-ma/` — **KHÔNG bị sửa 1 ký tự nào** (`git diff --stat` xác nhận rỗng).
- `computeYiMa(chi): YiMaComputation` — **public API giữ nguyên vẹn**, `nine-methods/compute.ts`
  tiếp tục gọi y hệt.
- `src/shen-sha/compute.ts` (MỚI) — `computeYiMaPlacement(dayChi, voidBranches, voidBranchesProvenanceId)`
  GỌI LẠI `computeYiMa(dayChi)` bên trong, KHÔNG duplicate bảng `YI_MA_TABLE`/logic tam hợp cục.

### Signature

```ts
export interface YiMaPlacementComputation {
  placement: ShenShaPlacement; // {name:"yiMa", zhi, isVoid} — type ĐÃ CÓ SẴN, KHÔNG sửa
  zhiProvenanceId: string;          // = YI_MA_PROVENANCE.id (tái dùng)
  voidBranchesProvenanceId: string; // pass-through từ caller, KHÔNG tạo mới
}

export function computeYiMaPlacement(
  dayChi: Chi,                 // calendar.dayPillar.chi — BẮT BUỘC Chi Ngày
  voidBranches: VoidBranches,  // ĐÃ TÍNH từ A2's computeVoidBranches(), KHÔNG tự gọi lại A2
  voidBranchesProvenanceId: string,
): YiMaPlacementComputation;
```

---

## 3. Void Dependency

`isVoid = voidBranches.pair.includes(yiMa)` — membership boolean THUẦN, KHÔNG dùng: 孤辰/寡宿 (vẫn
DEFERRED), Không Vong theo Giờ, hệ Không Vong nào khác, hay `voidBranches.affects` (Tam Truyền —
không liên quan tới Yi Ma, vì Yi Ma là 1 Chi đơn, không phải 1 vị trí Tam Truyền). `isVoid` KHÔNG
mang ý nghĩa luận giải "hữu danh vô thực" — đó là việc của Tầng 2 (`DA_LIU_REN_PROVENANCE.md` Nút 10),
ngoài phạm vi A4.

---

## 4. Provenance — KHÔNG tạo entry mới

- `zhiProvenanceId` = **tái dùng** `YI_MA_PROVENANCE.id` (`PROV-YI-MA-POSITION`, confidence B).
- `voidBranchesProvenanceId` = **pass-through** id mà CALLER đã nhận từ chính lần gọi
  `computeVoidBranches()` của nó (`PROV-VOID-BRANCHES-CORE`, confidence B) — KHÔNG tạo entry mới.
- Lý do: `isVoid` là suy luận logic TẤT YẾU (set membership) từ 2 nguồn đã có — GIVEN `zhi` đúng
  (chứng minh bởi `YI_MA_PROVENANCE`) và `voidBranches.pair` đúng (chứng minh bởi
  `VOID_BRANCHES_PROVENANCE`), `isVoid` đúng theo NECESSITY toán học, không cần 1 nguồn cổ văn thứ 3.
  Khớp nguyên tắc đã chốt ở A1 Decision Record: không tạo provenance chỉ để "có provenance".
- **Không tăng confidence chỉ vì composition** — cả 2 id reused giữ NGUYÊN confidence B gốc của
  chúng, không có confidence tổng hợp mới nào được suy ra.

---

## 5. Không Chart-Level Integration

Đúng Pre-Implementation Audit mục 7 (đã xác nhận Option A bắt buộc theo architecture rule A1 Freeze):
- **KHÔNG** tạo `calculateDaLiuRenChartWithYiMa()`.
- **KHÔNG** wire `shenSha`/`ShenShaPlacement` vào `DaLiuRenCalculationResult`.
- **KHÔNG** sửa `calculateDaLiuRenChart()`.
- Chỉ expose `computeYiMaPlacement` qua `src/index.ts` (additive export), giống pattern A1/A2/A3.

---

## 6. Files Changed

### Mới
- `src/shen-sha/compute.ts` — `computeYiMaPlacement`.
- `src/shen-sha/index.ts` — re-export.
- `tests/unit/shen-sha/compute.test.ts` — 19 test (A-H theo đúng test matrix yêu cầu).

### Sửa (additive only)
- `src/index.ts` — **+1 dòng**: `export * from "./shen-sha/index.js";`.

---

## 7. Tests

**19 test mới** (`tests/unit/shen-sha/compute.test.ts`):

| Nhóm | Nội dung |
|---|---|
| A | Mapping đầy đủ 12/12 Chi nguồn — xác nhận composition không làm sai output `computeYiMa()` gốc |
| B | `isVoid=false` khi `voidBranches.pair` không chứa Yi Ma |
| C | `isVoid=true` khi `voidBranches.pair` chứa Yi Ma |
| D | 12 case tham số hoá (`it.each`), phủ đủ cả 4 nhóm tam hợp (申子辰/寅午戌/巳酉丑/亥卯未), mỗi case tự xác nhận `isVoid=true` khi trúng đúng Yi Ma của chính nhóm đó |
| E | Purity — `structuredClone` `voidBranches` trước/sau |
| F | Determinism — object mới mỗi lần gọi, không share reference |
| G | Provenance — xác nhận reuse `YI_MA_PROVENANCE.id` + pass-through đúng id caller truyền, không fabricate |
| H | Golden chart thật (2024-08-20 20:00, tái dùng từ A2) — trace đủ chuỗi `chart → fourLessons.lesson3.lower(=dayChi) → computeYiMa → A2 voidBranches → computeYiMaPlacement`, xác nhận tường minh `lesson3.lower === dayPillar.chi` ngay trong test (không giả định) |

**Kết quả**: 433/433 PASS (baseline 414 + 19 mới).

---

## 8. C1 Day-vs-Year — VẪN LÀ Documented Gap

**KHÔNG bị silently resolve.** Implementation này CHỈ tuân theo CURRENT OPERATIONAL CONTRACT (Chi
Ngày, đã vận hành thật trong code đông băng) — KHÔNG tuyên bố đây là "đã chứng minh cổ điển tuyệt
đối", KHÔNG mở nghiên cứu mới để thay đổi contract, KHÔNG thêm fallback tự động sang Chi Năm/Tháng/
Giờ, KHÔNG thêm tham số `sourceType`. Nếu tương lai có quyết định tường minh đổi contract, đó là 1
quyết định RIÊNG (không phải việc âm thầm sửa trong A4).

---

## 9. 孤辰/寡宿 — Vẫn DEFERRED

Không có field/logic nào cho 孤辰/寡宿 trong A4. `isVoid` chỉ dùng đúng A2 Core `voidBranches.pair`
(旬空 cơ bản), không mở rộng.

---

## 10. Architecture Compliance

- Pure primitive only — không facade mới.
- `src/yi-ma/`, A1 (`ke-type/`), A2 (`void-branches/`), A3 (`wang-shuai/`), Phase 11-B
  (`r-nhatthan-01/` etc.), `DaLiuRenCalculationResult`, `calculateDaLiuRenChart()` — **TẤT CẢ 0 diff**
  (xác nhận qua `git diff --stat`).
- Algorithm Spec — không bị sửa (untracked, không đụng).

---

## 11. Validation (chạy fresh)

- `npx vitest run` → **433/433 PASS** (41 test file).
- `npm run typecheck` → PASS, 0 lỗi.
- `npm run build` (package) → PASS, 0 lỗi.
- `npm run build -w packages/daliuren-engine` (workspace) → PASS, 0 lỗi.

---

**Trạng thái**: IMPLEMENTED. Chờ independent audit trước khi Decision Closure/Freeze.
