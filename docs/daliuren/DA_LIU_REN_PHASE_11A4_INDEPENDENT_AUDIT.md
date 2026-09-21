# PHASE 11-A4 — INDEPENDENT AUDIT (驛馬 Yi Ma Placement)

**Loại tài liệu**: Audit độc lập, AUDIT ONLY — KHÔNG sửa implementation/test/A1/A2/A3/11-B/`src/yi-ma/`/
Algorithm Spec, KHÔNG resolve C1, KHÔNG thêm 孤辰/寡宿, KHÔNG tạo provenance, KHÔNG commit code.
**Implementation commit**: `01f31fe6c781cd13898c228214de072904bec87a`
(`feat(daliuren): add phase 11a yi ma placement`).

---

## 1. Executive Summary

Audit này KHÔNG chỉ tin báo cáo "433/433 PASS" — đã tự đọc lại toàn bộ implementation TỪ ĐẦU (đọc
`shen-sha/compute.ts`, trace ngược `yi-ma/`, `four-lessons/`, `void-branches/`), tự viết script xác
minh ĐỘC LẬP (không tái sử dụng test suite hiện có) cho: (a) mapping cổ điển 4 nhóm tam hợp, (b) tính
nhất quán byte-level giữa `computeYiMaPlacement().placement.zhi` và `computeYiMa().yiMa` cho toàn bộ
12 Chi, (c) 1 golden chart THẬT tự trace lại (2024-08-20 20:00) cộng 1 golden chart THẬT mới tự tìm
(2024-10-15 10:00, case `isVoid=true`, KHÔNG có trong test suite hiện có), (d) stress test mutation/
purity sâu hơn test suite (mutate kết quả trả về, mutate input sau khi gọi, interleave nhiều lời gọi),
(e) các edge case người dùng yêu cầu kiểm tra riêng (`voidBranches.pair` rỗng/`undefined`, Chi lặp
trong pair, Yi Ma trùng vị trí thứ 2 của pair).

**Kết quả**: KHÔNG tìm thấy correctness/architecture violation nào. Composition byte-level consistency
PASS 12/12 (0 mismatch — không có P1 nào cần đánh dấu theo tiêu chí user đề ra). Provenance reuse
đúng, không fabricate, không overclaim. Kiến trúc tuân thủ tuyệt đối (0 diff mọi khu vực đông băng,
dependency direction đúng chiều, không cycle). Purity/determinism xác nhận qua stress test sâu hơn
test suite gốc. C1 wording vẫn conservative, không bị silently resolve.

**2 finding P2, 1 finding P3** — tất cả non-blocking, không yêu cầu sửa trước freeze (chi tiết mục 11).

**Verdict: B — PASS WITH NON-BLOCKING GAP.**

---

## 2. Scope and Baseline

Files audit trực tiếp: `src/shen-sha/compute.ts`, `src/shen-sha/index.ts`, `src/index.ts` (diff),
`tests/unit/shen-sha/compute.test.ts`, `DA_LIU_REN_PHASE_11A4_PRE_IMPLEMENTATION_AUDIT.md`,
`DA_LIU_REN_PHASE_11A4_IMPLEMENTATION.md`. Trace ngược: `src/yi-ma/compute.ts`, `table.ts`,
`provenance.ts`, `errors.ts`; `src/four-lessons/compute.ts`; `src/void-branches/compute.ts`;
`src/types/shen-sha.ts`, `src/types/void-branches.ts`, `src/types/ganzhi.ts`.

Baseline xác nhận TRƯỚC khi bắt đầu phân tích sâu: `npx vitest run` → **433/433 PASS** (41 file),
`npm run typecheck`/`build` (package + workspace) → PASS. Baseline khớp đúng báo cáo implementation.

---

## 3. Independent Semantic Verification

### Yi Ma source (`dayChi`)

Trace lại TỪ ĐẦU (không tin lại report): đọc trực tiếp `four-lessons/compute.ts` dòng 37
(`const dayChi = calendarData.dayPillar.chi;`) và dòng 53 (`lesson3: { upper: lesson3UpperChi, lower:
dayChi }`) — xác nhận **`fourLessons.lesson3.lower` CHÍNH LÀ `calendar.dayPillar.chi`**, KHÔNG qua
biến đổi trung gian nào (gán trực tiếp, không hàm biến đổi). Đọc `shen-sha/compute.ts` — tham số
`dayChi: Chi` được đưa THẲNG vào `computeYiMa(dayChi)` (dòng 47), KHÔNG có bước biến đổi/fallback nào
ở giữa. **Không có hidden fallback sang year/month/hour** — đã grep `shen-sha/compute.ts` toàn bộ,
0 tham chiếu tới `yearPillar`/`monthPillar`/`hourPillar`. **Không có mutation** — `dayChi` là string
primitive (bất biến theo ngữ nghĩa JS), và code không gán lại biến này ở bất kỳ đâu.

### Yi Ma mapping (12 source Chi)

Đã tự viết script ĐỘC LẬP (hardcode 4 nhóm tam hợp từ chính đặc tả user đưa ra, KHÔNG đọc từ
`YI_MA_TABLE`) và so sánh với `computeYiMa()` thật:

```
--- Independent classical mapping vs computeYiMa() ---
mismatches: 0 / 12
```

12/12 khớp: `申子辰{申,子,辰}→寅`, `寅午戌{寅,午,戌}→申`, `巳酉丑{巳,酉,丑}→亥`, `亥卯未{亥,卯,未}→巳`.
Đọc TRỰC TIẾP implementation (`yi-ma/table.ts`), không chỉ đọc test — bảng khớp đúng 4 nhóm, không
lệch thứ tự/giá trị.

### Void

`shen-sha/compute.ts` dòng 48: `const isVoid = voidBranches.pair.includes(yiMa);` — xác nhận ĐÚNG
`voidBranches.pair` (A2 Core), KHÔNG có tham chiếu nào tới `voidBranches.affects` (Tam Truyền — đã
grep xác nhận), KHÔNG có literal `孤辰`/`寡宿`/`earthPlateVoid`/`heavenPlateVoid` ở bất kỳ đâu trong
`src/shen-sha/`, KHÔNG có logic Không Vong theo Giờ (hàm chỉ nhận `voidBranches` đã tính sẵn, không tự
tính lại từ bất kỳ trụ nào khác), KHÔNG gán ý nghĩa luận giải nào (chỉ trả `boolean`).

**Kết luận mục 3: PASS trên mọi điểm.**

---

## 4. Composition Verification

**Trọng tâm audit theo yêu cầu.** Đã tự viết script kiểm tra byte-level consistency giữa
`computeYiMaPlacement(chi, ...).placement.zhi` và `computeYiMa(chi).yiMa` cho **toàn bộ 12 Chi**,
độc lập với test suite:

```
--- Composition byte-level consistency: computeYiMaPlacement().placement.zhi vs computeYiMa().yiMa for all 12 ---
composition mismatches: 0 / 12
```

Đọc trực tiếp `shen-sha/compute.ts` dòng 47: `const { yiMa } = computeYiMa(dayChi);` — xác nhận
**GỌI LẠI `computeYiMa()` thật**, KHÔNG có bảng tra hay logic tam hợp cục nào được viết lại/duplicate
trong `shen-sha/`. Đã grep `src/shen-sha/` cho `寅|午|戌|申|子|辰|巳|酉|丑|亥|卯|未` xuất hiện dưới
dạng literal mapping — **0 kết quả** ngoài docstring mô tả (không phải code logic).

**0 mismatch → KHÔNG có P1 nào cần đánh dấu theo tiêu chí đã cho.**

---

## 5. Provenance Audit

- **`zhiProvenanceId`**: đọc trực tiếp dòng 52, gán CỨNG `YI_MA_PROVENANCE.id` — xác nhận qua test
  độc lập (script riêng, không dùng test suite): `zhiProvenanceId === YI_MA_PROVENANCE.id` → `true`.
- **`voidBranchesProvenanceId`**: đọc dòng 53 — tham số đầu vào được TRẢ NGUYÊN VẸN, không qua biến
  đổi. Xác nhận qua test độc lập: truyền chuỗi tuỳ ý `"CALLER-SUPPLIED-VOID-PROV-ID"` → output khớp
  CHÍNH XÁC chuỗi đó — xác nhận đây LÀ pass-through thật, KHÔNG bị hardcode/ghi đè/tự tạo mới.
- **`isVoid` provenance**: đã grep toàn bộ `src/shen-sha/` — **0 provenance entry mới**, 0 lời gọi
  tới bất kỳ `ProvenanceEntry` constructor nào ngoài import 2 id đã có (`YI_MA_PROVENANCE`, và
  `voidBranchesProvenanceId` do caller cung cấp). Khớp đúng tuyên bố của docstring.
- **Traceability**: `Yi Ma → YI_MA_PROVENANCE` (B) — đủ. `Void → A2 VOID_BRANCHES_PROVENANCE` (B,
  qua pass-through) — đủ. `isVoid → deterministic composition` — ĐÚNG, vì `isVoid` là phép suy luận
  logic tất yếu (set membership) từ 2 giá trị đã có provenance riêng, không phải 1 khẳng định cổ văn
  mới cần nguồn thứ 3 — khớp đúng nguyên tắc đã dùng ở A1 (không tạo provenance chỉ để có).
- **Overclaim check**: đọc lại toàn bộ docstring + comment trong `compute.ts` — không tìm thấy câu
  nào gán confidence cao hơn những gì 2 entry gốc thực sự chứng minh, không có câu nào tuyên bố
  `isVoid` "đã được cổ văn xác nhận trực tiếp" (nó KHÔNG được — nó là suy luận logic, ghi đúng vậy).

**Kết luận mục 5: PASS, không có finding.**

---

## 6. Architecture/API Audit

- `computeYiMa()` public API: đọc `yi-ma/compute.ts` fresh — chữ ký + hành vi **giữ nguyên 100%**.
  `git diff --stat -- src/yi-ma/` → **rỗng**.
- Pure primitive only: `computeYiMaPlacement` không side-effect, không I/O.
- Không facade mới: `grep "calculateDaLiuRenChartWithYiMa\|DaLiuRenChartWithYiMa"` → **0 kết quả**.
- Không wire vào `DaLiuRenCalculationResult`: `git diff --stat -- da-liu-ren-calculation-result.ts`
  → **rỗng**.
- Không phá canonical chart facade: `calculateDaLiuRenChart()` thân hàm không đổi (chỉ `index.ts`
  +1 dòng export, đã xác nhận qua `git show` commit `01f31fe6...` — đúng 6 file, 668 dòng, không có
  file nào ngoài dự kiến).
- **Dependency direction**: đọc trực tiếp import trong `shen-sha/compute.ts` — `shen-sha → yi-ma`
  (value + type) và `shen-sha → types/void-branches` (**CHỈ type**, KHÔNG import
  `void-branches/compute.js` — tức `shen-sha` thậm chí KHÔNG phụ thuộc module GIÁ TRỊ của A2, chỉ
  phụ thuộc SHAPE của nó — decoupling chặt hơn cả yêu cầu tối thiểu). Đã grep ngược `yi-ma/`,
  `void-branches/`, `three-transmissions/`, `four-lessons/` cho chuỗi `"shen-sha"` — **0 kết quả** →
  xác nhận KHÔNG có reverse dependency, KHÔNG có cycle.

**Kết luận mục 6: PASS, không có finding — decoupling thực tế còn chặt hơn yêu cầu tối thiểu.**

---

## 7. Purity/Determinism Audit

Đọc code thật (không chỉ tin test): `computeYiMaPlacement` là 1 function thuần — gọi `computeYiMa`
(đã xác nhận thuần), gọi `Array.prototype.includes` (thuần), trả object literal MỚI mỗi lần. **Không
có biến module-level nào ngoài 2 import hằng số** (`YI_MA_PROVENANCE`, đã đóng băng).

Đã tự chạy stress test SÂU HƠN test suite hiện có (test E/F chỉ dùng `structuredClone` + `toBe`/`not.toBe`
tiêu chuẩn):
1. Mutate TRỰC TIẾP kết quả trả về (`result.placement.zhi = "HACKED"`) rồi gọi lại → kết quả MỚI
   KHÔNG bị ảnh hưởng (không có state chia sẻ giữa các lần gọi).
2. Mutate input `voidBranches` SAU KHI đã nhận kết quả → kết quả ĐÃ TRẢ TRƯỚC ĐÓ không đổi (chứng
   minh tính toán eager, không lazy-evaluate giữ tham chiếu).
3. Interleave nhiều lời gọi với input khác nhau xen kẽ → không có leakage giữa các lời gọi.

**Không tìm thấy mutable module-level state, không tìm thấy cache nguy hiểm, deterministic xác nhận.**

**Kết luận mục 7: PASS.**

---

## 8. Test Quality Audit

Đánh giá CHI TIẾT 19 test hiện có (không chỉ đếm số lượng):

| Test | Đánh giá |
|---|---|
| A (mapping 12/12) | Cover ĐÚNG mục tiêu của nó ("composition không làm sai output gốc") — dùng `YI_MA_TABLE` làm oracle là HỢP LÝ ở tầng NÀY (mapping cổ điển tự nó đã được `yi-ma/compute.test.ts` audit riêng, không cần lặp lại ở A4) |
| B/C (isVoid true/false) | Rõ ràng, khác biệt thật (2 pair khác nhau, cùng 1 source) |
| D (12 case tham số hoá) | Phủ đủ 4 nhóm, MỖI case dùng source riêng — không duplicate, có ý nghĩa thật |
| E (purity) | THẬT (object mutation check, không vacuous — khác A3's string-input case) |
| F (determinism) | Đủ, có object-identity check |
| G (provenance) | Assert EXACT id (kể cả dùng giá trị "lạ" `"CALLER-SUPPLIED-VOID-PROV-ID"` để chứng minh pass-through thật, không hardcode) — chất lượng cao |
| H (golden chart) | Trace đủ chuỗi thật, assert `lesson3.lower === dayPillar.chi` tường minh ngay trong test — tốt |

**Missing edge cases đã tự kiểm tra (KHÔNG có trong suite hiện tại)**:
1. `voidBranches.pair` rỗng/`undefined`: đã tự test — `pair: []` → không throw, `isVoid=false` (an
   toàn nhưng vi phạm type contract `readonly [Chi,Chi]`); `pair: undefined` → **ném `TypeError` THÔ**
   (`Cannot read properties of undefined (reading 'includes')`), KHÔNG phải lỗi domain rõ ràng như
   `YiMaError`. **Không silently trả sai** (crash rõ ràng, không phải wrong-data-silent) nhưng thông
   điệp lỗi không hữu ích bằng các module khác trong dự án.
2. Chi lặp lại trong `pair` (`["Thân","Thân"]`): đã tự test — hoạt động ĐÚNG, `isVoid=true` khi khớp.
   Không có bug, nhưng KHÔNG có test khoá lại case này.
3. Yi Ma trùng vị trí THỨ HAI của pair (không phải vị trí đầu): đã tự test — `Array.includes` xử lý
   đúng cả 2 vị trí, không có bug "chỉ check phần tử đầu". Test D gián tiếp cover việc này (dùng
   `[expectedYiMa, "Sửu"]`, Yi Ma luôn ở vị trí ĐẦU) — **chưa có case Yi Ma ở vị trí THỨ HAI của
   pair tường minh**, dù hành vi đã xác nhận đúng qua audit này.
4. Yi Ma KHÔNG thuộc pair: Test B cover đủ.
5. Input isolation: Test E cover `voidBranches`; `dayChi` (primitive) không cần test riêng (bất biến
   theo ngữ nghĩa JS, giống nhận định đã áp dụng ở A3's audit).

**Golden chart isVoid=true**: Test H (golden chart) CHỈ demo case `isVoid=false` (chart 2024-08-20).
Đã tự tìm và xác nhận 1 golden chart THẬT khác (**2024-10-15 10:00 Asia/Shanghai**) cho case
`isVoid=true` (dayChi=Tý→yiMa=Dần, voidBranches.pair=[Dần,Mão] → Dần ∈ pair → `isVoid=true`) — chart
này ĐÃ được dùng làm golden case ở A2/A3's test suite trước đó cho mục đích khác, nhưng **chưa được
dùng để chứng minh `isVoid=true` qua real-chart integration ở A4**.

**Kết luận mục 8: Test suite chất lượng TỐT, cover đúng behavior (không phải implementation detail),
nhưng có 3 gap cụ thể ghi ở mục 11 (P2/P3) — không blocking.**

---

## 9. Independent Recomputations

### 12 dayChi mapping (đã trình bày ở mục 3-4) — 0/12 mismatch, cả 2 hướng (classical table lẫn
composition consistency).

### Golden chart #1 — 2024-08-20 20:00 Asia/Shanghai (isVoid=false, tái xác nhận từ A2)

```
dayPillar.chi: Thìn
fourLessons.lesson3.lower: Thìn (khớp dayPillar.chi)
independent expected Yi Ma (computeYiMa("Thìn")): Dần
voidBranches.pair: [Tý, Sửu]
independent expected isVoid: false
ACTUAL computeYiMaPlacement: {name:"yiMa", zhi:"Dần", isVoid:false}
zhiProvenanceId khớp YI_MA_PROVENANCE.id: true
voidBranchesProvenanceId khớp pass-through: true
```

**Khớp 100% với dự đoán độc lập.**

### Golden chart #2 — 2024-10-15 10:00 Asia/Shanghai (isVoid=true, TỰ TÌM MỚI, chưa có trong suite)

```
dayPillar.chi: Tý
computeYiMa("Tý").yiMa: Dần
voidBranches.pair: [Dần, Mão]
independent expected isVoid: true (Dần ∈ [Dần, Mão])
ACTUAL computeYiMaPlacement: {name:"yiMa", zhi:"Dần", isVoid:true}
```

**Khớp 100% với dự đoán độc lập — xác nhận case `isVoid=true` hoạt động đúng qua dữ liệu chart THẬT,
không chỉ fixture giả lập.**

---

## 10. Regression Verification

Chạy fresh, không tái sử dụng số liệu cũ:
- `npx vitest run` → **433/433 PASS** (41 file).
- `npm run typecheck` → PASS.
- `npm run build` (package) → PASS.
- `npm run build -w packages/daliuren-engine` (workspace) → PASS.
- `git diff --stat` trên: `src/yi-ma/`, `src/ke-type/` (A1), `src/wang-shuai/` (A3),
  `src/void-branches/` (A2), `rules/r-nhatthan-01/`, `rules/r-honnhan-01/`, `rules/r-timdo-01/`,
  `rules/r-kientung-02/`, `rules/registry.ts` (Phase 11-B), `da-liu-ren-calculation-result.ts` →
  **TẤT CẢ rỗng, 0 diff**.
- Algorithm Spec: vẫn untracked (không có commit nào chạm tới trong session này).
- `git show --stat` commit `01f31fe6...` → đúng 6 file, 668 dòng thêm, 0 dòng xoá, không file nào
  ngoài dự kiến.

**Kết luận mục 10: PASS toàn bộ.**

---

## 11. Findings

**P0**: Không có.

**P1**: Không có. (Composition byte-level check — tiêu chí P1 do user đề ra — cho kết quả 0/12
mismatch, đã verify độc lập qua script riêng.)

**P2** (non-blocking nhưng có thật):
1. `computeYiMaPlacement` KHÔNG validate shape của `voidBranches.pair` — khi truyền giá trị vi phạm
   type contract (`pair: undefined`), hàm ném `TypeError` THÔ (không phải `YiMaError`/error domain rõ
   ràng), khác với quy ước "NO HIDDEN FALLBACK + lỗi tường minh" đã áp dụng ở `computeYiMa`/
   `computeVoidBranches`. **Đánh giá mức độ**: KHÔNG phải correctness bug (không silently trả sai —
   crash rõ ràng), và `VoidBranches` là 1 value type có kiểm soát (theo kiến trúc đã audit, CHỈ đến
   từ A2's `computeVoidBranches()` đã tự validate ở nguồn — không phải input mở như `number` của A2).
   Vẫn ghi nhận vì user yêu cầu kiểm tra rõ case này — khuyến nghị (không bắt buộc): cân nhắc thêm
   guard tường minh nếu tương lai `computeYiMaPlacement` được public hoá rộng hơn cho caller không
   tin cậy.
2. Test H (golden chart) chỉ demo `isVoid=false` qua chart thật — case `isVoid=true` chỉ được test
   qua fixture giả lập (B/C/D), chưa qua chart thật. Audit này đã tự tìm 1 golden chart thật
   (2024-10-15 10:00) chứng minh case này hoạt động đúng (mục 9) — nhưng test suite hiện tại CHƯA
   khoá case này lại bằng 1 test permanent.

**P3** (minor, documentation/test gap):
1. Thiếu 2 regression test cụ thể (đã tự verify đúng thủ công trong audit, không phải bug): (a) Chi
   lặp lại trong `voidBranches.pair`, (b) Yi Ma trùng vị trí THỨ HAI (không phải đầu) của pair.

**Không có finding nào yêu cầu sửa TRƯỚC freeze.**

---

## 12. Verdict

**B — PASS WITH NON-BLOCKING GAP.**

Core semantics đúng (xác nhận độc lập, không chỉ tin implementation report). Composition correctness
đạt 0/12 mismatch — không có P1. Provenance reuse đúng, không fabricate, không overclaim. Kiến trúc
tuân thủ tuyệt đối, dependency direction đúng, không cycle — thậm chí decoupling CHẶT HƠN yêu cầu tối
thiểu (shen-sha không phụ thuộc module GIÁ TRỊ của A2, chỉ phụ thuộc type). Purity/determinism PASS
qua stress test sâu hơn test suite gốc. C1 wording vẫn conservative — KHÔNG bị biến thành "classically
proven", KHÔNG bị silently resolve. 2 finding P2 + 1 finding P3, tất cả non-blocking.

---

## 13. Recommendation for Decision Closure

Đủ điều kiện chuyển sang Decision Closure. Đề xuất Decision Closure nên:
1. Ghi nhận + GIỮ NGUYÊN (không sửa) 2 finding P2 (mục 11) như "documented, accepted, không cần sửa
   trước freeze" — đúng tinh thần các Decision Record trước (A1/A2/A3) đã xử lý finding non-blocking.
2. Có thể (KHÔNG bắt buộc) chấp thuận bổ sung 2-3 test mới nếu muốn hardening thêm trước Freeze
   (golden chart `isVoid=true`, repeated-branch, vị-trí-thứ-hai) — nhưng đây là optional, audit này
   KHÔNG tự thêm test (đúng hard constraint).
3. KHÔNG có correction bắt buộc nào — có thể tiến thẳng tới Freeze sau Decision Closure nếu chủ dự án
   chấp nhận giữ nguyên 3 finding như đã ghi.

---

**PHASE 11-A4 INDEPENDENT AUDIT COMPLETE — NO CODE CHANGES.**
