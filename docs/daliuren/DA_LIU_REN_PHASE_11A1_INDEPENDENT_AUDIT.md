# PHASE 11-A1 — INDEPENDENT AUDIT (課體 / Khóa Thể)

**Loại tài liệu**: Audit độc lập, sau khi implementation báo cáo `A1 IMPLEMENTED`.
**Phạm vi**: AUDIT ONLY — không sửa source/test/contract, không commit/reset/rebase/stash.
**Đối chiếu với**: `docs/daliuren/DA_LIU_REN_PHASE_11A_PRE_IMPLEMENTATION_AUDIT.md` (mục "A1 — 課體 (primary)", dòng 46-71).

---

## 1. Scope

Audit độc lập toàn bộ implementation Phase 11-A1, gồm:
- `packages/daliuren-engine/src/ke-type/compute.ts` (mới)
- `packages/daliuren-engine/src/ke-type/index.ts` (mới)
- `packages/daliuren-engine/src/da-liu-ren-chart-with-ke-type.ts` (mới)
- `packages/daliuren-engine/src/index.ts` (sửa — additive: 2 export, 2 import, 1 hàm facade mới)
- `packages/daliuren-engine/tests/unit/ke-type/compute.test.ts` (mới, 11 test)

Không đọc lại toàn bộ package — chỉ audit phần A1 và các điểm nó chạm vào (frozen boundary,
provenance chain, facade cũ).

---

## 2. Contract Conformance

Đối chiếu từng mục A1 trong Pre-Implementation Audit:

| Mục | Yêu cầu | Thực tế implementation | Khớp? |
|---|---|---|---|
| 3 (schema) | `KePrimary{method: NineMethod, zeikeVariant?}`, `secondary` luôn rỗng | `computeKeType` trả `{primary: {method}, secondary: []}`, không gán `zeikeVariant` | ✅ |
| 4 (provenance) | "cần tạo mới (confidence B, ...)" | KHÔNG tạo entry mới — tái dùng `threeTransmissionsInitialProvenanceId` | ⚠️ **KHÁC** — xem mục 4 (Provenance Assessment) |
| 6 (zeikeVariant) | Ngoài phạm vi, để trống | `zeikeVariant` không bao giờ được set | ✅ |
| 7 (identity) | `keType.primary.method = threeTransmissions.method`, không suy luận | `computeKeType(method, ...)` chỉ bọc lại, 0 branch, 0 lookup table | ✅ |
| 9 (không đổi `DaLiuRenCalculationResult`) | Field mới additive | Type gốc không bị sửa 1 ký tự (xác nhận qua `git diff` — không đổi) | ✅ |
| 10 (chartId) | Không ảnh hưởng | `chartId` nằm trong `calendar`/nơi khác, chỉ bị spread nguyên vẹn | ✅ |
| 11 (deterministic) | Có | Xác nhận qua test + code review (0 random/time/env) | ✅ |
| 12 (Phase 11-B) | Không evaluator nào đọc `keType` | `git status` xác nhận 0 evaluator bị chạm | ✅ |

**NineMethod union**: `KePrimary.method: NineMethod` import trực tiếp từ `types/three-transmissions.ts`
— xác nhận đây là **CÙNG 1 type**, không phải union song song có nguy cơ lệch (đã đọc
`types/ke-type.ts` dòng 11: `import type { NineMethod } from "./three-transmissions.js";`).

**Kết luận Contract Conformance**: 7/8 mục khớp hoàn toàn. Mục 4 (provenance) có sai lệch thực
chất so với khuyến nghị gốc — xem phân tích chi tiết ở mục 4 bên dưới. Đây KHÔNG phải một lỗi rõ
ràng (có lý lẽ hợp lý ủng hộ cả 2 hướng), nhưng KHÔNG được implementation ghi nhận/giải trình ở
đâu cả (không có erratum, không có comment giải thích lý do lệch khỏi mục 4).

---

## 3. Additive Facade Assessment (mục 2 yêu cầu)

**Thiết kế đã chọn**: type mới `DaLiuRenChartWithKeType` (superset của `DaLiuRenCalculationResult`)
+ hàm facade mới `calculateDaLiuRenChartWithKeType()` gọi lại `calculateDaLiuRenChart()` rồi spread
thêm `keType`.

### Câu hỏi A — Additive facade có phù hợp Phase 11-A contract không?

**Có, về mặt "không sửa frozen type"** — mục 9 chỉ yêu cầu "field mới additive", và convention đã
thiết lập từ Phase 9E (comment gốc trong `da-liu-ren-calculation-result.ts`: "khi implement xong,
tạo type MỚI thay thế/mở rộng") xác nhận hướng "tạo type mới" là đúng quy ước. Facade thoả điều
kiện tối thiểu này.

### Câu hỏi B — Có tạo ra output song song dễ nhầm là 2 chart khác nhau không?

**Có, đây là rủi ro thật, không phải giả thuyết.** `calculateDaLiuRenChart()` và
`calculateDaLiuRenChartWithKeType()` đều public, đều nhận cùng `ChartInput`, đều trả
`EngineResult<...>` với gần như toàn bộ field trùng nhau (khác biệt duy nhất: có/không có `keType`
và `provenance.keTypeProvenanceId`). Một consumer không nắm lịch sử implementation có thể:
- Gọi CẢ HAI cho cùng 1 input (double tính toán baseline 8-field, vì
  `calculateDaLiuRenChartWithKeType` gọi lại `calculateDaLiuRenChart` từ đầu — xem adversarial case
  #7 mục 9).
- Không rõ nên coi cái nào là "nguồn sự thật" nếu cả 2 đang được dùng song song ở 2 chỗ khác nhau
  trong codebase.

### Câu hỏi C — Có cách đơn giản hơn, vẫn giữ frozen boundary, không tạo duplicate facade semantics?

**Có, một cách đơn giản hơn ĐÃ tồn tại sẵn và không cần code thêm gì:** `computeKeType()` (hàm
thuần, đã public qua `export * from "./ke-type/index.js"`) có thể được consumer gọi trực tiếp trên
kết quả của `calculateDaLiuRenChart()` đã có sẵn:

```ts
const base = calculateDaLiuRenChart(input);
const { keType } = computeKeType(base.data.threeTransmissions.method, base.data.provenance.threeTransmissionsInitialProvenanceId);
```

Cách này KHÔNG cần `DaLiuRenChartWithKeType`/`calculateDaLiuRenChartWithKeType()` ở tất cả — tránh
hoàn toàn rủi ro ở Câu hỏi B, và tránh double-tính-toán. Cái giá phải trả: consumer cần 2 lời gọi
thay vì 1. Facade hiện tại vẫn ĐÚNG và AN TOÀN, nhưng không phải lựa chọn tối giản nhất.

**Rủi ro mở rộng (quan trọng hơn cho A2/A3/A4 sắp tới)**: nếu mỗi candidate còn lại (A2 空亡, A3
旺衰, A4 驛馬) đều lặp lại đúng pattern này (mỗi cái 1 `DaLiuRenChartWithXxx` + 1
`calculateDaLiuRenChartWithXxx()` riêng), sẽ có tới 4 facade "full chart + 1 field" song song,
không compose được với nhau (muốn `keType` + `wangShuai` cùng lúc → phải tạo thêm 1 facade tổ hợp
mới, hoặc gọi 2 facade riêng → tính base 2 lần). Nên cân nhắc TRƯỚC KHI làm A2: hoặc (a) gộp lại
thành 1 facade "enriched" duy nhất nhận flags, hoặc (b) bỏ hẳn pattern full-chart-facade, chỉ export
các hàm `computeXxx()` thuần để consumer tự compose (giống Câu hỏi C).

### Câu hỏi D — `keType` có cần nằm trực tiếp trong `DaLiuRenCalculationResult` không?

**Không** — mục 9 của contract xác nhận rõ field mới là additive, KHÔNG được sửa frozen type; quy
ước Phase 9E cũng cấm mở rộng type cũ bằng field mới. Việc tạo type mới (`DaLiuRenChartWithKeType`)
thay vì sửa `DaLiuRenCalculationResult` là ĐÚNG và BẮT BUỘC theo contract — không phải 1 lựa chọn
tuỳ ý.

**Kết luận mục 3**: Thiết kế additive facade hiện tại AN TOÀN và ĐÚNG contract (Câu hỏi A, D), nhưng
có rủi ro API-surface thật (Câu hỏi B) và có 1 lựa chọn đơn giản hơn đã sẵn có mà không được dùng
(Câu hỏi C) — **finding kiến trúc, không blocking cho A1 (vì A1 tự nó vẫn đúng/an toàn), nhưng nên
quyết định TRƯỚC KHI làm A2** để tránh nhân bản pattern có vấn đề.

---

## 4. Provenance Assessment

**Kiểm tra chuỗi provenance thực tế** (không chỉ nhìn tên biến):

`provenance.keTypeProvenanceId` = `provenance.threeTransmissionsInitialProvenanceId`, mà theo
`three-transmissions/compute.ts:56` (`initialProvenanceId: selection.provenanceId`) và
`nine-methods/compute.ts` (mỗi method trả `provenanceId` riêng, vd `SHEHAI_PROVENANCE.id`,
`ZEIKE_BIYONG_PROVENANCE.id`, `YAOKE_PROVENANCE.id`, ...) — đây là provenance của **THUẬT TOÁN CHỌN
phương pháp nào trong 9 Cửu Tông Môn áp dụng cho lá số này**, KHÔNG phải provenance của khẳng định
"9 giá trị `NineMethod` này = 9/10 loại 課體 hợp lệ theo 《六壬大全》".

**Đây là 2 khẳng định khác nhau về bản chất:**
1. "Lá số này thuộc method X trong 9 Cửu Tông Môn" → CÓ provenance đầy đủ (chuỗi thuật toán, đã
   audit ở Phase 9E/11-B).
2. "Gọi tên phân loại này là 課體 (Khóa Thể) là hợp lệ, khớp mục lục 《六壬大全》 thật" → **KHÔNG
   có provenance entry nào** — claim này CHỈ tồn tại dưới dạng comment trong
   `types/ke-type.ts` (dòng 1-3: "CONFIDENCE B cho 10 loại chính (khớp mục lục thật 《六壬大全》
   qua shidianguji + Wikisource...)"), KHÔNG được wire vào bất kỳ `ProvenanceEntry` nào — đã grep
   toàn bộ `src/` xác nhận không có entry `KE_TYPE`/`課體` nào tồn tại.

Pre-Implementation Audit mục 4 đã lường trước đúng việc này ("Existing provenance? Không có entry —
**cần tạo mới**"), nhưng implementation lại chọn tái dùng thay vì tạo — đúng theo tinh thần mục 7
("PHÉP GÁN ĐỒNG NHẤT, không suy luận gì" → nếu đúng là identity thuần thì tái dùng hợp lý, tạo
provenance mới sẽ là overclaim theo đúng nguyên tắc đã rút ra ở Phase 11-B P2-1: "Không được giả tạo
dependency chỉ để giữ provenance").

**Đây là 2 mục trong CHÍNH pre-implementation audit tự mâu thuẫn nhau** (mục 4 muốn provenance mới,
mục 7 xác nhận đây là identity thuần không cần tính toán mới) — implementation đã chọn theo mục 7,
nhất quán với nguyên tắc chống-overclaim đã học từ Phase 11-B, nhưng KHÔNG ghi nhận rằng mục 4 đã bị
bỏ qua.

**Có phải fabricated/duplicate/overclaim không?** KHÔNG — giá trị `keTypeProvenanceId` trỏ đúng tới
provenance THẬT của giá trị đang được copy, không giả tạo gì. Đây không phải lỗi giống P1 (Phase
11-B) — P1 là 1 rule ĐANG dùng provenance sai để tính `calculationConfidence` SAI trong output thực
tế hiện tại; ở đây, KHÔNG có evaluator/consumer nào đang đọc `keType`/`keTypeProvenanceId` để tính
confidence gì cả (đã xác nhận qua mục 12 Contract Conformance) — nên chưa có SAI SỐ nào biểu hiện ra
output thật.

**Rủi ro tiềm ẩn (không phải bug hiện tại)**: nếu 1 rule TƯƠNG LAI đọc `keType` và coi
`keTypeProvenanceId`-resolved-confidence như một bằng chứng cho "課體 là 1 khái niệm/tên gọi hợp lệ",
điều đó sẽ lặp lại đúng dạng lỗi P1 (provenance trông có vẻ đủ nhưng chứng minh nhầm claim). Cần
quyết định TRƯỚC KHI bất kỳ rule Tầng 2 nào đọc `keType`: hoặc (a) tạo entry `PROV-KE-TYPE-PRIMARY`
như mục 4 gốc đề xuất và ghi rõ nó KHÔNG ảnh hưởng identity-value correctness (chỉ củng cố tính hợp
lệ của TÊN GỌI "課體"), hoặc (b) sửa comment `types/ke-type.ts` + pre-implementation audit mục 4 để
tường minh xác nhận "không cần provenance riêng, tái dùng threeTransmissions là đủ, claim B-confidence
trong comment chỉ mang tính tham khảo/background, không phải claim được máy tính chứng minh".

**Ghi chú phụ (pre-existing, không do A1 gây ra)**: comment gốc `types/ke-type.ts` nói "10 loại
chính... cả 10/10" trong khi `NineMethod` chỉ có 9 giá trị — chênh lệch 9 vs 10 đã tồn tại từ trước
A1 (type file có sẵn), không phải lỗi mới, nhưng càng củng cố việc cần 1 provenance entry chính thức
để làm rõ khẳng định này thay vì chỉ nằm trong comment.

---

## 5. Semantic Invariants

| # | Invariant | Kết quả kiểm tra |
|---|---|---|
| 1 | `keType.primary.method === threeTransmissions.method` | ✅ Đúng cấu trúc — `computeKeType` chỉ nhận 1 tham số `method` duy nhất và gán thẳng, không có đường nào để 2 giá trị lệch nhau (không phải "trùng khớp tình cờ", mà là CÙNG 1 giá trị được truyền qua) |
| 2 | `secondary === []` | ✅ Hard-coded literal, không có logic gán khác |
| 3 | `zeikeVariant === undefined` | ✅ Không bao giờ được set trong `computeKeType` |
| 4 | 9 `NineMethod` values giữ nguyên | ✅ Import trực tiếp từ `three-transmissions.ts`, không định nghĩa lại union song song |
| 5 | Error path không bị swallow | ✅ `if (!base.ok \|\| !base.data) return fail(base.errors ?? [], base.meta);` — passthrough nguyên vẹn, xác nhận qua test Scenario E |
| 6 | Deterministic | ✅ 0 random/time/env/network — xác nhận code review + test gọi 2 lần |
| 7 | Facade output không mutate chart | ✅ (code review) — `{...base.data, keType, provenance: {...base.data.provenance, keTypeProvenanceId}}` chỉ spread, không gán ngược vào `base.data`. **NHƯNG: không có regression test nào canh giữ invariant này** — xem mục 7 (Test Quality) |
| 8 | Existing calculation output không đổi | ✅ Xác nhận qua `git diff` (thân hàm `calculateDaLiuRenChart` không đổi 1 ký tự) + test field-by-field so khớp |

**Hidden transformation giữa `threeTransmissions.method` và `keType.primary.method`?** Không tìm
thấy — đã đọc toàn bộ `computeKeType` (16 dòng), không có branch/lookup/map nào, chỉ 1 phép gán trực
tiếp.

---

## 6. API / Type Surface

- **Public exports** (`src/index.ts`): `computeKeType`, `KeTypeComputation` (qua
  `ke-type/index.ts`), `DaLiuRenChartWithKeType`, `DaLiuRenCalculationProvenanceWithKeType`,
  `calculateDaLiuRenChartWithKeType` — tất cả đặt tên rõ ràng, tìm được qua search "KeType", không
  có tên gây nhầm lẫn.
- **Duplicate API surface**: có, ở mức "2 facade function cùng nhận `ChartInput`" — đã phân tích kỹ
  ở mục 3 Câu hỏi B/C.
- **Compatibility**: không phá vỡ gì — `calculateDaLiuRenChart()`/`DaLiuRenCalculationResult` giữ
  nguyên chữ ký và export vị trí cũ.
- **Thứ tự khai báo hàm trong file** (chi tiết nhỏ): `calculateDaLiuRenChartWithKeType` (dòng 178)
  được khai báo TRƯỚC `calculateDaLiuRenChart` (dòng 222) trong `src/index.ts`, dù hàm đầu GỌI hàm
  sau. Vì cả 2 đều là `function` declaration (có hoisting), điều này hoạt động ĐÚNG về mặt runtime
  (đã xác nhận qua test pass), nhưng hơi khó đọc — người đọc gặp
  `calculateDaLiuRenChartWithKeType` trước sẽ thấy nó gọi 1 hàm chưa được định nghĩa ngay bên dưới.
  **Non-blocking, thuần cosmetic.**
- **Future extensibility**: xem cảnh báo ở mục 3 Câu hỏi C (rủi ro nhân bản pattern cho A2/A3/A4).

---

## 7. Regression

- `git status --short packages/daliuren-engine/` → chỉ `M src/index.ts` (diff xác nhận additive
  thuần — 2 export, 2 import, 1 hàm mới chèn giữa `calculateCalendarFoundation` và
  `calculateDaLiuRenChart`) + 3 path mới hoàn toàn (`ke-type/`, `da-liu-ren-chart-with-ke-type.ts`,
  `tests/unit/ke-type/`). **0 thay đổi** ở `rules/r-nhatthan-01/`, `rules/r-honnhan-01/`,
  `rules/r-timdo-01/`, `rules/r-kientung-02/`, `rules/registry.ts`, hay bất kỳ file Model C nào.
- Thân hàm `calculateDaLiuRenChart()` không đổi 1 ký tự (xác nhận qua diff).
- 377 test pre-existing PASS nguyên vẹn (baseline không đổi số lượng hay assertion).
- Test "8 field gốc KHÔNG bị đổi" (mục Test Quality) xác nhận EMPIRICAL, không chỉ tĩnh qua diff,
  rằng `calculateDaLiuRenChart()` và phần 8-field của `calculateDaLiuRenChartWithKeType()` cho ra
  CÙNG kết quả với cùng input.

**Kết luận**: Frozen Phase 11-B boundary được giữ nguyên vẹn, có bằng chứng cả tĩnh (diff) lẫn động
(test).

---

## 8. Test Quality

11 test trong `tests/unit/ke-type/compute.test.ts`, review từng test:

| Test | Đánh giá |
|---|---|
| Loop 9 `NineMethod` values qua `computeKeType` thuần | Hợp lý — hàm thuần, hành vi KHÔNG phụ thuộc giá trị method (đã xác nhận code review: 0 branch theo method), nên test qua hàm thuần cho toàn bộ 9 giá trị chặt chẽ hơn là cố tìm 9 lá số thật (tốn công, không tăng độ tin cậy vì logic value-independent) |
| `secondary` luôn rỗng | Đúng invariant #2 |
| `zeikeVariant` luôn undefined | Đúng invariant #3 |
| Provenance tái dùng đúng id truyền vào | Test hàm thuần, không lẫn với chuỗi provenance thật (chuỗi thật được test riêng ở test facade "provenance.keTypeProvenanceId ===...") |
| Determinism (hàm thuần) | OK |
| Golden chart facade (zeike case) | Test hành vi thật qua `calculateDaLiuRenChartWithKeType`, KHÔNG phải implementation detail |
| Provenance facade-level | Đúng, kiểm tra đúng chuỗi thật (không phải chuỗi giả như test hàm thuần) |
| 8-field non-regression | Test tốt — so sánh field-by-field tường minh, dễ đọc, bắt được regression thật nếu facade lỡ đổi field gốc |
| Error path (Scenario E) | Đúng — dùng lại 1 case đã biết từ test suite facade gốc, xác nhận error KHÔNG bị nuốt/biến dạng |
| Determinism facade | OK |
| Serialization round-trip | OK |

**Có test implementation detail thay vì behavior không?** Không — mọi test đều gọi qua public API
(`computeKeType`/`calculateDaLiuRenChartWithKeType`), không test internal state.

**Golden chart có hợp lý không?** Chỉ dùng **1** golden chart thật (`2024-01-01 00:30`, method=zeike)
ở mức facade. Vì đã chứng minh (a) `computeKeType` không phân nhánh theo method value (mục 5), và
(b) facade không có logic method-dependent nào khác ngoài truyền thẳng — rủi ro còn lại từ việc chỉ
dùng 1 golden chart là THẤP, nhưng **không phải KHÔNG có** (vd nếu sau này `threeTransmissions.method`
field bị đổi tên/refactor mà quên cập nhật facade, 1 golden chart bổ sung với method khác vẫn sẽ có
giá trị phát hiện sớm hơn). **Non-blocking, có thể cân nhắc thêm 1-2 golden chart method khác ở facade
level** (đã có sẵn ví dụ fuyin ở `2024-02-01` dùng cho error case, có thể tìm case fanyin/bazhuan
thành công nếu cần).

**Gap thật sự — thiếu test purity/no-mutation**: Project convention đã thiết lập ở
`calculate-da-liu-ren-chart.test.ts`/nơi khác dùng pattern `structuredClone` trước/sau để canh giữ
"hàm không mutate input/output trung gian". Invariant #7 (mục 5) ("facade output không mutate chart")
hiện chỉ được đảm bảo qua code review, KHÔNG có test nào sẽ FAIL nếu 1 refactor tương lai vô tình đổi
`{...base.data, keType, ...}` thành dạng mutate trực tiếp (vd `base.data.keType = keType; return
base;`) — một lỗi hoàn toàn có thể xảy ra khi ai đó "tối ưu" đoạn code này sau này. **Đây là gap thật,
non-blocking cho A1 hiện tại (vì mutation KHÔNG xảy ra bây giờ), nhưng nên bổ sung 1 test
structuredClone-based trước khi coi test suite A1 là đầy đủ theo đúng convention đã thiết lập.**

---

## 9. Adversarial Checks

| # | Case tìm | Kết quả |
|---|---|---|
| 1 | Mismatch `KePrimary.method` vs `KeType.primary.method` | Không thể xảy ra về cấu trúc — `KeType.primary` CHÍNH LÀ 1 `KePrimary`, không phải 2 field riêng có thể lệch nhau |
| 2 | Mutation | Không tìm thấy qua code review (spread-only) — nhưng THIẾU test canh giữ (mục 8) |
| 3 | Provenance mismatch | Không có mismatch (id trỏ đúng nguồn thật) — nhưng có GAP về loại claim được chứng minh (mục 4) |
| 4 | Unsupported method | Không thể xảy ra — `computeKeType` nhận `NineMethod` đã được TypeScript + upstream validation đảm bảo hợp lệ trước khi tới đây, không có runtime validation nào bị thiếu vì không cần |
| 5 | Error swallowing | Không — xác nhận qua test Scenario E, `base.errors ?? []` passthrough nguyên vẹn |
| 6 | Facade drift (base đổi sau này mà wrapper không cập nhật) | Rủi ro THẤP — wrapper gọi lại `calculateDaLiuRenChart()` thay vì duplicate logic, nên tự động kế thừa mọi thay đổi tương lai của base facade |
| 7 | Duplicate calculation | **Có thật** — gọi cả `calculateDaLiuRenChart(input)` VÀ `calculateDaLiuRenChartWithKeType(input)` cho cùng input sẽ chạy toàn bộ pipeline 8 bước 2 lần. Không phải bug, là hệ quả trực tiếp của thiết kế ở mục 3 Câu hỏi B/C |
| 8 | Output divergence giữa 2 facade | Không — xác nhận qua test field-by-field (mục 7 Regression) |

**Không tái tạo được lỗi correctness nào.** 2 case (#2, #7) là rủi ro kiến trúc/test-hardening, không
phải lỗi có thể tái tạo ra output sai ngay bây giờ.

---

## 10. Git Scope

```
M packages/daliuren-engine/src/index.ts
?? packages/daliuren-engine/src/da-liu-ren-chart-with-ke-type.ts
?? packages/daliuren-engine/src/ke-type/
?? packages/daliuren-engine/tests/unit/ke-type/
```

Đúng như dự kiến (mục 8 của yêu cầu implementation gốc) — không có unrelated change nào trong
`packages/daliuren-engine/`. Không có gì được stage/commit (`git status` xác nhận toàn bộ vẫn ở
trạng thái unstaged/untracked).

---

## 11. Findings (tổng hợp, không tự sửa)

1. **[Non-blocking, cần quyết định trước Tầng 2]** — Provenance: mục 4 của Pre-Implementation Audit
   khuyến nghị tạo entry `ProvenanceEntry` MỚI cho claim "課體 là tên gọi hợp lệ theo 《六壬大全》",
   nhưng implementation tái dùng `threeTransmissionsInitialProvenanceId` (chỉ chứng minh "thuật toán
   chọn đúng method trong 9 Cửu Tông Môn", một claim hẹp hơn). Hợp lý theo mục 7 (identity mapping,
   chống overclaim) nhưng KHÔNG được ghi nhận/giải trình ở đâu. Rủi ro tiềm ẩn giống dạng P1
   (Phase 11-B) nếu 1 rule tương lai đọc nhầm `keTypeProvenanceId` như bằng chứng cho tính hợp lệ
   của khái niệm "課體" thay vì chỉ bằng chứng cho giá trị `method`. Cần 1 quyết định tường minh
   (tạo entry mới HOẶC sửa comment `types/ke-type.ts` để khớp thực tế) trước khi bất kỳ rule nào đọc
   `keType`.
2. **[Non-blocking, test-hardening]** — Thiếu 1 test purity/no-mutation (structuredClone-based) cho
   `calculateDaLiuRenChartWithKeType`, không nhất quán với convention đã thiết lập ở
   `calculate-da-liu-ren-chart.test.ts`. Code review xác nhận hiện tại KHÔNG mutate, nhưng không có
   regression guard.
3. **[Non-blocking, kiến trúc — nên xử lý trước A2]** — Pattern "1 facade full-chart riêng cho mỗi
   field mới" (`DaLiuRenChartWithKeType` + `calculateDaLiuRenChartWithKeType()`) tạo rủi ro duplicate
   API surface/duplicate calculation nếu lặp lại y hệt cho A2/A3/A4. 1 cách đơn giản hơn đã sẵn có
   (compose `calculateDaLiuRenChart()` + `computeKeType()` thủ công, không cần facade riêng) —
   không blocking cho A1 (A1 vẫn đúng/an toàn), nhưng nên quyết định hướng chung trước khi nhân bản
   pattern sang A2.
4. **[Non-blocking, cosmetic]** — `calculateDaLiuRenChartWithKeType` được khai báo trước
   `calculateDaLiuRenChart` trong `src/index.ts` dù gọi hàm sau; đúng nhờ hoisting nhưng hơi khó đọc.
5. **[Ghi chú, pre-existing, không do A1 gây ra]** — Comment gốc `types/ke-type.ts` nói "10 loại...
   cả 10/10" trong khi `NineMethod` chỉ có 9 giá trị — chênh lệch tồn tại từ trước A1.

**Không tìm thấy correctness violation, fabricated provenance, mutation thật, error-swallowing, hay
output divergence nào.**

---

## 12. Final Verdict

**B — PASS WITH NON-BLOCKING GAP**

A1 đúng contract ở mọi invariant correctness-critical (identity mapping, determinism, error
propagation, frozen boundary, no fabricated provenance/mutation trong code thực tế). Có 3 finding
kiến trúc/provenance-documentation/test-hardening đáng ghi nhận (mục 11, #1-#3) — không chặn việc
coi A1 "hoàn thành đúng" ở Tầng 1 hiện tại, nhưng NÊN được giải quyết (đặc biệt #1 và #3) trước khi
(a) bất kỳ rule Tầng 2 nào đọc `keType`, hoặc (b) bắt đầu implement A2/A3/A4 theo cùng pattern.

---

**A1 AUDIT COMPLETE — B (PASS WITH NON-BLOCKING GAP)**
