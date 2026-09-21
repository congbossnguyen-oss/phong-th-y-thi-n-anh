# PHASE 11-A4 — 驛馬 (YI MA) — PRE-IMPLEMENTATION AUDIT

**Loại tài liệu**: Audit độc lập, AUDIT ONLY — KHÔNG implement, KHÔNG sửa production code, KHÔNG
commit implementation.
**Bối cảnh**: A1/A3/A2 Core/Phase 11-B đã FROZEN (commit A2: `629db3d1...` + `50e69e8`). Audit này
KHÔNG được đụng bất kỳ phase nào trong số đó.

---

## 1. Executive Summary

`computeYiMa()` đã tồn tại thật, đã public API, đã có test, và đã được DÙNG THẬT bên trong
`nine-methods/compute.ts` (nhánh 返吟-vô-賊克, dòng 343) với input là **Chi Ngày**
(`fourLessons.lesson3.lower`, xác nhận trực tiếp qua trace `four-lessons/compute.ts`: `lesson3.lower
= dayChi`). Đây là bằng chứng MẠNH cho C1 (source branch = Chi Ngày) — không chỉ là 1 lựa chọn cổ
văn trừu tượng mà là 1 CONTRACT ĐÃ VẬN HÀNH THẬT trong code đông băng (Phase 9C, nuôi Phase 11-B).

**Phát hiện quan trọng (không được bỏ qua)**: `docs/daliuren/DA_LIU_REN_PROVENANCE.md` Nút 9 tự ghi
rõ: *"Dịch Mã = chi đối xung với chi giữa của tam hợp cục chứa Chi ngày (**hoặc Chi năm tuỳ ngữ
cảnh**)"* — tức chính research của dự án ĐÃ ghi nhận ambiguity Ngày-vs-Năm trong văn bản cổ, KHÔNG
phải 1 sự thật tuyệt đối chỉ có 1 cách đọc. Tuy nhiên, vì `computeYiMa()` ĐÃ LÀ contract đang vận
hành (Phase 9C, đông băng, nuôi cascade Phase 11-B), audit này khuyến nghị: A4 PHẢI dùng lại đúng
contract Ngày hiện có (KHÔNG mở lại tranh luận Ngày-vs-Năm cho A4 — việc đó sẽ đòi hỏi sửa
`nine-methods/compute.ts` đã đông băng, ngoài phạm vi tuyệt đối cấm của task này).

`computeYiMa()` **CHƯA cung cấp `isVoid`** — 0 dòng code nào tính giá trị này ở bất kỳ đâu.
`ShenShaPlacement` (type đích) yêu cầu `{name, zhi, isVoid}` — khác hẳn shape thật của `YiMaComputation`
(`{yiMa, provenanceId}`). A2 Core (`voidBranches.pair`) nay đã FROZEN, đủ để tính `isVoid` — A4 không
còn bị block bởi A2 nữa (khác tình trạng ở audit Phase 11-A gốc, lúc đó A2 chưa tồn tại).

**Khuyến nghị chốt**: A4 nên là **1 hàm compute MỚI, RIÊNG** (vd `computeYiMaPlacement`, đặt ở module
mới `src/shen-sha/`, khớp tên `types/shen-sha.ts`) — nhận `dayChi: Chi` + `voidBranches: VoidBranches`
(giá trị A2 đã tính sẵn, KHÔNG tự gọi lại `computeVoidBranches`) làm input, trả về
`{placement: ShenShaPlacement, ...provenance ids}`. **KHÔNG sửa `computeYiMa()`** (giữ nguyên public
API cũ, `nine-methods/compute.ts` tiếp tục dùng y hệt). **KHÔNG cần provenance entry MỚI cho `isVoid`**
— tái dùng `YI_MA_PROVENANCE` (cho `zhi`) + provenance id của `voidBranches` do caller truyền vào (cho
`isVoid`), vì bản thân phép kiểm tra membership là suy luận logic tất yếu từ 2 nguồn đã có, không phải
1 khẳng định cổ văn mới.

**Verdict: READY WITH DOCUMENTED GAP.**

---

## 2. Existing Implementation Audit

### `computeYiMa()`

| Câu hỏi | Trả lời (đã trace trực tiếp, không giả định) |
|---|---|
| 1. Input hiện nhận gì? | `chi: Chi` — 1 giá trị Chi ĐƠN, không phải `CanChiPillar` đầy đủ (giống pattern A3's `computeWangShuai(monthChi)`). |
| 2. Tính theo rule nào? | Tra bảng tĩnh `YI_MA_TABLE` (`yi-ma/table.ts`) — 4 nhóm tam hợp → xung: `寅午戌→申`, `申子辰→寅`, `巳酉丑→亥`, `亥卯未→巳`. Sao chép nguyên vẹn từ Algorithm Spec §10, đã verify khớp 12/12 Chi (xem mục 3 dưới). |
| 3. Output chính xác là gì? | `YiMaComputation = {yiMa: Chi, provenanceId: string}` — **KHÔNG có `isVoid`, KHÔNG có `name`, field vị trí tên `yiMa` (không phải `zhi`)**. |
| 4. Provenance hiện tại? | `YI_MA_PROVENANCE` (id `PROV-YI-MA-POSITION`, confidence B, sourceId `liu-ren-da-quan-siku`) — notes tự xác nhận: **"KHÔNG bao gồm bất kỳ quy tắc luận giải nào (vd '驛馬 gặp Không Vong') — CHỈ vị trí."** Xác nhận rõ ràng: provenance hiện tại KHÔNG chứng minh `isVoid`. |
| 5. Mutation/side effect? | Không — hàm thuần, tra bảng tĩnh `Readonly<Record<Chi,Chi>>`, trả object literal mới. Không I/O, không random, không time. |
| 6. Export/public API ở đâu? | `src/index.ts` → `export * from "./yi-ma/index.js"` → export `computeYiMa`, `YiMaComputation`, `YiMaError`, `YI_MA_TABLE`, `YI_MA_PROVENANCE`. **ĐÃ LÀ public API sống, gọi được từ ngoài package NGAY HÔM NAY.** |
| 7. Test hiện khoá invariant nào? | `tests/unit/yi-ma/compute.test.ts` (5 test): (a) khớp 12/12 Chi với `YI_MA_TABLE`, (b) 4 tam hợp cục map đúng 4 giá trị 孟 (Dần/Tỵ/Thân/Hợi), (c) `provenanceId` đúng + confidence B, (d) NO HIDDEN FALLBACK — Chi lạ ném `YiMaError("UNKNOWN_CHI")`, (e) determinism. **0 test cho `isVoid` hay purity (structuredClone) — vì cả 2 đều chưa tồn tại.** |

### Người gọi thật (production usage)

`src/nine-methods/compute.ts` dòng 343: `const { yiMa } = computeYiMa(fourLessons.lesson3.lower);`
— chỉ trong nhánh 返吟-vô-賊克 (khi Tứ Khóa hoàn toàn vô khắc). Trace `fourLessons.lesson3.lower`:
đọc `four-lessons/compute.ts` dòng 53 (`lesson3: { upper: lesson3UpperChi, lower: dayChi }`) — xác
nhận **`lesson3.lower` CHÍNH LÀ `dayChi`** (Chi Ngày), không qua biến đổi trung gian nào. Đây là
CONTRACT THẬT đang chạy trong code đã đông băng (Phase 9C → nuôi Phase 11-B qua `three-transmissions`).

---

## 3. Classical Semantics

### C1 — Source branch

**Evidence trong repo**:
- `DA_LIU_REN_PROVENANCE.md` Nút 9: *"Dịch Mã = chi đối xung với chi giữa của tam hợp cục chứa Chi
  ngày (**hoặc Chi năm tuỳ ngữ cảnh**)"* — ghi nhận ambiguity Ngày/Năm tồn tại trong cổ văn, KHÔNG
  chọn dứt khoát.
- Implementation THẬT (`nine-methods/compute.ts`) đã CHỌN Chi Ngày, đang chạy trong code đông băng.

**Kết luận C1**: KHÔNG có 1 câu cổ văn nào trong repo dứt khoát loại trừ Chi Năm — ambiguity CÓ
THẬT, đã ghi nhận sẵn từ trước (không phải audit này tự phát hiện, nhưng audit này XÁC NHẬN LẠI nó
còn tồn tại nguyên vẹn, chưa từng được giải quyết). **Tuy nhiên, đối với A4 cụ thể**: vì mục tiêu A4
CHỈ là "lộ ra + tính `isVoid`" cho MỘT chart đã tính (không phải research lại từ đầu Yi Ma), và vì
contract Ngày ĐÃ đang chạy thật trong Phase 9C/11-B đông băng, audit này khuyến nghị **A4 dùng lại
NGUYÊN VẸN `computeYiMa(dayChi)` đã có** — KHÔNG mở ambiguity Ngày/Năm ra làm quyết định MỚI của A4
(việc đó thuộc phạm vi research riêng, ngoài scope của việc "lộ ra field cho chart hiện có", và đòi
hỏi khả năng sửa `nine-methods/compute.ts` đã đông băng — tuyệt đối cấm ở task này).

### C2 — Yi Ma mapping

Đã tự verify `YI_MA_TABLE` khớp 12/12 với 4 nhóm tam hợp cục user yêu cầu xác minh:

| Nhóm tam hợp | Chi trong nhóm | Yi Ma (target) | Khớp bảng `YI_MA_TABLE`? |
|---|---|---|---|
| 申子辰 → 寅 | Thân, Tý, Thìn | Dần | ✅ (Thân→Dần, Tý→Dần, Thìn→Dần) |
| 寅午戌 → 申 | Dần, Ngọ, Tuất | Thân | ✅ (Dần→Thân, Ngọ→Thân, Tuất→Thân) |
| 巳酉丑 → 亥 | Tỵ, Dậu, Sửu | Hợi | ✅ (Tỵ→Hợi, Dậu→Hợi, Sửu→Hợi) |
| 亥卯未 → 巳 | Hợi, Mão, Mùi | Tỵ | ✅ (Hợi→Tỵ, Mão→Tỵ, Mùi→Tỵ) |

12/12 khớp, không lệch. Provenance (`YI_MA_PROVENANCE`) đã dẫn 2 nguồn độc lập thật (commit bug-fix
repo C `98f47f9` + hàm LIVE của `d1210182010/daliuren-web-engine`) — đã re-confirm nội dung notes
khớp đúng những gì trích dẫn, không overclaim.

### C3 — `isVoid`

- **Yi Ma branch có thực sự được kiểm tra với A2 Core `voidBranches` không?** Hiện tại: **KHÔNG** —
  0 dòng code nào làm việc này ở bất kỳ đâu (đã grep toàn bộ `src/`).
- **Có nguồn nào đòi hỏi dùng 1 loại 空亡 khác không?** Không — `types/shen-sha.ts` comment trỏ thẳng
  `DA_LIU_REN_PROVENANCE.md` Nút 10 ("馬空不能行"), và Nút 10 KHÔNG phân biệt loại Không Vong nào
  khác ngoài loại đã có ở A2 Core (không nhắc 孤辰/寡宿, không nhắc biến thể nào khác).
- **Có cần xét Tam Truyền ở A4 không?** **KHÔNG.** Yi Ma là 1 Chi ĐƠN (`zhi`), không phải 1 vị trí
  trong Tam Truyền — việc kiểm tra `isVoid` cho Yi Ma HOÀN TOÀN ĐỘC LẬP với `voidBranches.affects`
  (field đó CHỈ dành cho 3 vị trí Sơ/Trung/Mạt Truyền). A4 chỉ cần `voidBranches.pair` (2 chi Không
  Vong), KHÔNG cần `affects`.
- **`isVoid` chỉ là membership boolean, không phải 1 interpretation rule?** **ĐÚNG, xác nhận qua
  chính `types/shen-sha.ts` comment**: "Field CHỈ mô tả FACT (trùng vị trí Không Vong hay không) —
  Ý NGHĨA 'hữu danh vô thực' là việc của Tầng 2." — `isVoid = yiMa ∈ voidBranches.pair`, KHÔNG gán
  bất kỳ ý nghĩa luận giải nào (giữ đúng ranh giới Tầng 1/Tầng 2 đã áp dụng xuyên suốt A1/A2/A3).

---

## 4. Output Contract

`ShenShaPlacement` (`types/shen-sha.ts`, ĐÃ ĐÓNG BĂNG từ Checkpoint 1, KHÔNG được sửa):

```ts
export type ShenShaName = "yiMa"; // CHỈ 1 giá trị hợp lệ
export interface ShenShaPlacement {
  name: ShenShaName;
  zhi: Chi;
  isVoid: boolean;
}
```

So sánh với `YiMaComputation` hiện có (`{yiMa: Chi, provenanceId: string}`):

| Field `ShenShaPlacement` | Nguồn tương ứng | Ghi chú |
|---|---|---|
| `name: "yiMa"` | Hardcode literal | Trivial |
| `zhi: Chi` | = `computeYiMa(dayChi).yiMa` | ĐỔI TÊN field ở tầng NGOÀI (function mới), KHÔNG đổi `YiMaComputation.yiMa` gốc |
| `isVoid: boolean` | MỚI, cần tính | `= voidBranches.pair.includes(zhi)` |

**Adaptation KHÔNG phá API cũ**: `computeYiMa(chi): YiMaComputation` giữ NGUYÊN VẸN chữ ký + hành vi
+ export — `nine-methods/compute.ts` tiếp tục gọi y hệt, không ảnh hưởng. A4 thêm 1 hàm MỚI, RIÊNG,
GỌI LẠI `computeYiMa()` bên trong (không duplicate logic tra bảng) rồi lắp ráp thêm `isVoid` + đổi
tên field ở OUTPUT của chính nó — không đụng hàm gốc.

---

## 5. A2 Dependency

```text
dayChi (calendar.dayPillar.chi)
        ↓
computeYiMa(dayChi)                    ← KHÔNG ĐỔI, hàm cũ, gọi y hệt hiện tại
        ↓
{ yiMa, provenanceId }
        ↓ (function MỚI, RIÊNG bọc lại)
voidBranches (đã tính sẵn từ A2's computeVoidBranches — do CALLER truyền vào, KHÔNG tự gọi lại)
        ↓
isVoid = voidBranches.pair.includes(yiMa)
        ↓
{ name: "yiMa", zhi: yiMa, isVoid }   ← ShenShaPlacement
```

**Quan trọng**: hàm mới của A4 **KHÔNG tự gọi `computeVoidBranches()`** — nó nhận `voidBranches:
VoidBranches` (giá trị ĐÃ TÍNH, do caller cung cấp) làm tham số, giống cách `computeWangShuai` nhận
`monthChi` (giá trị đã có) thay vì tự tính lại. Điều này giữ A4 KHÔNG phụ thuộc trực tiếp vào chữ ký
của `computeVoidBranches` (`dayCycleIndex` + `transmissions`) — chỉ phụ thuộc SHAPE của
`VoidBranches` (đã FROZEN ở A2), đúng tinh thần composition thuần đã yêu cầu.

**Kiểm tra phù hợp kiến trúc**: khớp HOÀN TOÀN nguyên tắc đã chốt ở A1 Freeze + tái xác nhận A2/A3
Decision Record — không tạo facade chart-level, không sửa `calculateDaLiuRenChart()`, không sửa A1/
A3/Phase 11-B, không sửa Algorithm Spec.

---

## 6. Provenance Audit

**Hiện có**: `YI_MA_PROVENANCE` (`PROV-YI-MA-POSITION`, B) — CHỈ chứng minh vị trí Yi Ma, TỰ loại
trừ tường minh mọi quy tắc liên quan Không Vong.

**Đánh giá 3 câu hỏi bắt buộc**:
1. **Yi Ma mapping** — `YI_MA_PROVENANCE` chứng minh ĐỦ (đã re-verify 12/12, 2 nguồn độc lập thật).
2. **Source branch (Chi Ngày)** — `YI_MA_PROVENANCE` KHÔNG trực tiếp chứng minh "phải là Chi Ngày"
   (notes không nhắc điều này) — bằng chứng cho lựa chọn Ngày nằm ở CHỖ KHÁC: chính cách
   `nine-methods/compute.ts` đã dùng (`fourLessons.lesson3.lower` = dayChi) — đây là "implementation
   precedent", không phải "classical citation trực tiếp trong chính entry". Ghi nhận đây là 1
   khoảng hở nhỏ (không blocking, vì contract Ngày đã vận hành thật, xem mục 3 C1).
3. **`isVoid` dependency từ A2** — `YI_MA_PROVENANCE` KHÔNG (và KHÔNG NÊN) chứng minh — nó nằm ngoài
   phạm vi provenance này (tự loại trừ tường minh).

**Có cần provenance MỚI cho `isVoid` không? — KHÔNG, sau khi audit sâu lại (khác kết luận sơ bộ của
Phase 11-A audit gốc)**:

`isVoid = zhi ∈ voidBranches.pair` là 1 phép SUY LUẬN LOGIC TẤT YẾU (set membership), KHÔNG PHẢI 1
khẳng định cổ văn MỚI — GIVEN (a) `zhi` đúng (chứng minh bởi `YI_MA_PROVENANCE`) và (b)
`voidBranches.pair` đúng (chứng minh bởi A2's `VOID_BRANCHES_PROVENANCE`), thì `isVoid` ĐÚNG theo
NECESSITY toán học, không cần thêm 1 nguồn cổ văn thứ 3 nào để "chứng minh phép so sánh 2 giá trị đã
biết có bằng nhau hay không". Đây CHÍNH XÁC cùng loại lý luận đã áp dụng cho A2's `affects` field
(`chi ∈ pair`, không cần provenance riêng ngoài `VOID_BRANCHES_PROVENANCE`) — và khớp nguyên tắc đã
chốt ở A1 Decision Record (Option A: không tạo provenance chỉ để "có provenance" khi claim không có
nội dung evidentiary mới).

**Khuyến nghị cụ thể**: hàm A4 mới trả về (ví dụ) `{placement, zhiProvenanceId, voidBranchesProvenanceId}`
— **TÁI DÙNG** `zhiProvenanceId = YI_MA_PROVENANCE.id` và `voidBranchesProvenanceId` = chính id mà
CALLER đã nhận được từ lần gọi `computeVoidBranches()` của nó (pass-through, không tạo mới). Đây là
gợi ý CHO Decision Closure sau này cân nhắc — audit này KHÔNG tự chốt, chỉ khuyến nghị dựa trên cùng
logic đã dùng ở A1/A2.

**Lưu ý cho tương lai (không phải việc của A4)**: "馬空不能行" (Yi Ma mất tác dụng khi gặp Không
Vong) LÀ 1 khẳng định cổ văn cần provenance RIÊNG thật (đã có sẵn — Nút 10, `林烽`, confidence B) —
NHƯNG đó là 1 rule Ý NGHĨA (Tầng 2/Interpretation), không phải field `isVoid` (Tầng 1/FACT). Nút 10
sẽ cần khi 1 RULE Tầng 2 tương lai đọc `isVoid` để gán ý nghĩa — KHÔNG cần cho chính field `isVoid`.

---

## 7. Architecture Compatibility

Đối chiếu roadmap/contract hiện hành:

- `DA_LIU_REN_PHASE_11_DECISION_BRIEF.md` (tài liệu planning CŨ, trước khi có audit sâu) từng ghi
  "Không cần tính lại — chỉ cần LỘ RA... risk LOW" — **ĐÃ ĐƯỢC Phase 11-A Pre-Implementation Audit
  gốc tự sửa lại** ("CÒN THIẾU SEMANTICS, nghiêm trọng hơn 2 tài liệu planning trước đã ghi") — audit
  này KHÔNG lặp lại sai lầm của tài liệu cũ, xác nhận LẠI: `isVoid` THẬT SỰ cần tính, không phải chỉ
  "lộ ra".
- Architecture rule đã chốt ở A1 Freeze (mục 4) áp dụng CHUNG cho A2/A3/**A4**: "chỉ được thêm pure
  `computeXxx()` primitive... KHÔNG tạo `DaLiuRenChartWithXxx`/`calculateDaLiuRenChartWithXxx()`".

**Trả lời câu hỏi A/B (KHÔNG tự chọn B)**: Kiến trúc đã CHỐT SẴN từ A1 Freeze, áp dụng rõ ràng cho cả
A4 — **Option A (chỉ expose primitive) là lựa chọn BẮT BUỘC theo governance hiện hành**, KHÔNG phải 1
lựa chọn mở cho audit này tự quyết. Việc wire `shenSha` vào `DaLiuRenCalculationResult`/`Chart` (chart-
level exposure) là **OUT OF SCOPE** cho A4 — chưa có contract nào cho phép điều đó (architecture rule
hiện hành CẤM tạo facade mới, và sửa `DaLiuRenCalculationResult` cũng bị cấm tuyệt đối ở task này) —
ghi nhận rõ đây là ranh giới, KHÔNG tự mở rộng.

**Vị trí module đề xuất**: `src/shen-sha/` (module MỚI, khớp tên `types/shen-sha.ts`, KHÔNG đặt trong
`yi-ma/` để giữ `yi-ma/` nguyên vẹn không đổi) — chứa hàm mới (đề xuất tên `computeYiMaPlacement`,
khớp naming convention `computeXxx` đã dùng ở A1/A2/A3, thay vì tên `resolveYiMaPlacement` do audit
Phase 11-A gốc gợi ý sơ bộ — ưu tiên nhất quán naming).

---

## 8. Test Matrix (đề xuất, KHÔNG viết code)

1. **Mapping — đầy đủ 12/12 Địa Chi làm source branch** (loop qua `YI_MA_TABLE`, xác nhận đúng 4
   nhóm 申子辰/寅午戌/巳酉丑/亥卯未 — độc lập viết tay, không suy từ code, giống convention A1-A3).
   Test này CÓ THỂ tái dùng gần như nguyên vẹn logic của `tests/unit/yi-ma/compute.test.ts` hiện có
   (không cần viết lại từ đầu) cho phần `zhi`, cộng thêm phần `isVoid`/`name` mới.
2. **Void — không trúng**: `zhi ∉ voidBranches.pair` → `isVoid=false`.
3. **Void — trúng**: `zhi ∈ voidBranches.pair` → `isVoid=true` (cần chọn `dayCycleIndex` sao cho
   `voidBranches.pair` chứa đúng giá trị `zhi` đã biết trước — tính tay từ `YI_MA_TABLE` + 6 nhóm
   tuần Không Vong đã biết ở A2).
4. **Boundary/integration — golden chart thật**: dùng `calculateDaLiuRenChart()` + A2's
   `computeVoidBranches()` + hàm A4 mới, trace đủ chuỗi `dayChi → yiMa → voidBranches → isVoid` trên
   1 chart THẬT. **KHÔNG cần chart rơi vào nhánh fanyin-vô-khắc** — Yi Ma tính được từ BẤT KỲ chart
   nào thành công (không phụ thuộc `method` nào được chọn), vì hàm mới không gọi qua `nine-methods`.
5. **Purity**: `structuredClone` trên `voidBranches` input trước/sau — xác nhận không mutate (giống
   pattern đã dùng ở A2's `compute.test.ts`, vì `voidBranches` là object, không phải primitive).
6. **Determinism**: cùng `(dayChi, voidBranches)` → cùng output, gọi nhiều lần.
7. **Regression**: chạy lại toàn bộ 414 test hiện có + xác nhận A1 (`ke-type/`)/A3 (`wang-shuai/`)/
   A2 (`void-branches/`)/Phase 11-B (`r-nhatthan-01/` etc.) đều 0 diff + `computeYiMa()` cũ (nine-
   methods dùng) không đổi hành vi (test hiện có của `nine-methods/compute.test.ts` Test F vẫn PASS
   nguyên trạng).
8. **KHÔNG test 孤辰/寡宿** — ngoài phạm vi, vẫn DEFERRED.

---

## 9. Open Gaps / Ambiguities

1. **[Non-blocking, đã ghi nhận sẵn, không phải phát hiện mới]** C1 Source branch: cổ văn có ghi
   nhận khả năng dùng Chi Năm "tuỳ ngữ cảnh" (`DA_LIU_REN_PROVENANCE.md` Nút 9) — CHƯA có 1 quyết
   định tường minh loại trừ hẳn khả năng đó cho MỌI ngữ cảnh. A4 (theo khuyến nghị audit này) SẼ
   dùng lại contract Chi Ngày đã có sẵn trong code đông băng — KHÔNG mở lại tranh luận này, nhưng ghi
   nhận rõ đây VẪN là 1 gap nghiên cứu treo (giống các gap khác đã treo trong dự án, vd Day-vs-Hour ở
   A2). **Impact nếu sai**: nếu tương lai xác nhận cổ văn THẬT SỰ đòi Chi Năm cho 1 số ngữ cảnh câu
   hỏi cụ thể, sẽ cần 1 phase riêng (không phải A4) để bổ sung biến thể — KHÔNG ảnh hưởng tính đúng
   đắn của A4 với contract HIỆN HÀNH (Chi Ngày), vì A4 chỉ lộ ra field cho contract ĐANG DÙNG, không
   tự nhận là "đã giải quyết dứt điểm nguồn gốc cổ điển".
2. **[Non-blocking]** Provenance cho "source branch = Chi Ngày" hiện dựa vào "implementation
   precedent" (`nine-methods/compute.ts` đã dùng) hơn là 1 citation trực tiếp trong chính
   `YI_MA_PROVENANCE`. Có thể cân nhắc bổ sung 1 câu vào `YI_MA_PROVENANCE.notes` (documentation
   hardening, giống cách đã làm ở A2) khi Decision Closure diễn ra — KHÔNG bắt buộc trước khi code.
3. **[Không phải gap, chỉ là quyết định cần Decision Closure xác nhận]** Có cần provenance MỚI cho
   `isVoid` hay tái dùng 2 entry cũ (mục 6) — audit này khuyến nghị KHÔNG tạo mới, nhưng đây là 1
   khuyến nghị, không phải quyết định đã chốt.

**Không có ambiguity nào ở mức BLOCKING.**

---

## 10. Implementation Recommendation

1. Tạo module MỚI `src/shen-sha/` (khớp `types/shen-sha.ts`) — KHÔNG sửa `src/yi-ma/`.
2. 1 hàm pure primitive mới, đề xuất chữ ký:
   ```ts
   export interface YiMaPlacementComputation {
     placement: ShenShaPlacement; // {name:"yiMa", zhi, isVoid}
     zhiProvenanceId: string;         // = YI_MA_PROVENANCE.id (tái dùng)
     voidBranchesProvenanceId: string; // pass-through từ caller, KHÔNG tạo mới
   }
   export function computeYiMaPlacement(dayChi: Chi, voidBranches: VoidBranches, voidBranchesProvenanceId: string): YiMaPlacementComputation
   ```
   (Chỉ là ĐỀ XUẤT cho Decision Closure — chưa phải quyết định cuối, chưa code.)
3. GỌI LẠI `computeYiMa(dayChi)` bên trong — KHÔNG duplicate bảng tra.
4. KHÔNG tạo entry provenance mới (mục 6) — trừ khi Decision Closure quyết định khác.
5. KHÔNG wire vào `DaLiuRenCalculationResult`/`calculateDaLiuRenChart()` (mục 7) — chỉ expose qua
   `src/index.ts` giống pattern A1/A2/A3.
6. Test matrix theo mục 8.
7. KHÔNG động tới 孤辰/寡宿, KHÔNG động tới A1/A3/Phase 11-B/A2, KHÔNG sửa Algorithm Spec.

---

## 11. Verdict

**READY WITH DOCUMENTED GAP.**

- Phần LÕI (Yi Ma position + `isVoid` composition) — **READY** ngay: input/output/dependency/provenance
  đều đã rõ ràng, không cần research thêm, A2 Core đã FROZEN đủ để cung cấp `voidBranches`.
- Gap treo (mục 9, câu 1): C1 Source-branch Ngày-vs-Năm — **KHÔNG BLOCKING** cho A4 (A4 dùng lại
  contract Ngày đã vận hành thật, không tự research lại), nhưng PHẢI được ghi nhận tường minh trong
  Decision Closure (không được để trôi qua âm thầm).

---

## Files Inspected / Changed

**Files inspected** (đọc trực tiếp, không suy đoán): `yi-ma/compute.ts`, `yi-ma/table.ts`,
`yi-ma/provenance.ts`, `yi-ma/errors.ts`, `yi-ma/index.ts`, `tests/unit/yi-ma/compute.test.ts`,
`types/shen-sha.ts`, `types/chart.ts`, `da-liu-ren-calculation-result.ts`, `nine-methods/compute.ts`
(dòng 320-358), `four-lessons/compute.ts` (dòng 44-58), `types/four-lessons.ts`, `src/index.ts`,
`tests/unit/nine-methods/compute.test.ts` (Test F), `DA_LIU_REN_ALGORITHM_SPEC.md` §10,
`DA_LIU_REN_VALIDATION_REVIEW.md` (mục 驛馬), `DA_LIU_REN_PROVENANCE.md` (Nút 9-10),
`DA_LIU_REN_PHASE_11_DECISION_BRIEF.md`, `DA_LIU_REN_PHASE_11A_PRE_IMPLEMENTATION_AUDIT.md` (mục A4
gốc).

**Files changed**: **0** — chỉ tạo document này. Đã xác nhận `git status --short packages/daliuren-engine/`
rỗng trước và sau audit (không có edit nào xảy ra ở source/test).

**Tests**: chạy 1 lần để xác nhận baseline khoẻ mạnh trước audit — **414/414 PASS**, KHÔNG chạy lại
sau vì không có thay đổi code nào cần re-validate.

**Build**: KHÔNG chạy — không cần thiết cho 1 audit thuần tài liệu, không có thay đổi TypeScript nào.

**Frozen areas — zero diff xác nhận qua `git diff --stat`**: `ke-type/` (A1), `wang-shuai/` (A3),
`void-branches/` (A2), `yi-ma/` (chính module đang audit — xác nhận KHÔNG bị sửa), `rules/r-nhatthan-01/`,
`rules/r-honnhan-01/`, `rules/r-timdo-01/`, `rules/r-kientung-02/`, `rules/registry.ts` (Phase 11-B)
— **TẤT CẢ đều rỗng, 0 diff.**

---

**PHASE 11-A4 PRE-IMPLEMENTATION AUDIT COMPLETE — NO CODE CHANGES.**
