# CONG TAIYI — Đại Lục Nhâm — Phase 11 Work Package Deep Audit

Audit thuần tuý, viết SAU khi đọc trực tiếp (không chỉ dựa trí nhớ):
`DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`, `DA_LIU_REN_PHASE_11_DECISION_BRIEF.md` (commit
`9537799`), và `DA_LIU_REN_PHASE_11_ROADMAP.md`. Mọi claim trong Roadmap đã được RE-VERIFY trực
tiếp trên repository trước khi viết tài liệu này (`grep`/`Read` trực tiếp file nguồn, không suy
diễn từ báo cáo cũ).

**Kết quả đối chiếu Roadmap ↔ Repository: KHÔNG có mâu thuẫn nào được phát hiện.** Mọi type
(`ke-type.ts`, `void-branches.ts`, `wang-shuai.ts`, `ben-ming-xing-nian.ts`), mọi export
(`src/index.ts`), và hành vi `computeYiMa()`/`nine-methods` đều khớp đúng như Roadmap đã mô tả.
Một điểm làm rõ thêm (không phải mâu thuẫn, chỉ là chính xác hơn): `computeYiMa` đã được export
CÔNG KHAI qua `src/index.ts` (`export * from "./yi-ma/index.js"`) — nghĩa là hàm này VỐN ĐÃ gọi
được từ bên ngoài package ngay hôm nay; điều CHƯA có là nó không nằm trong output của
`calculateDaLiuRenChart()`/`DaLiuRenCalculationResult`. Ghi rõ ở mục 11-A bên dưới.

---

## 11-A — Calculation Contract / Expansion

### A. PURPOSE
Đóng gap giữa 8-field `DaLiuRenCalculationResult` đã freeze và các FACT Calculation Layer khác
đã có type contract (`Chart`) nhưng chưa có hàm sản xuất — cụ thể 課體 (primary)/空亡/旺衰
(TÍNH)/驛馬 (top-level exposure) — 4 candidate đã xác nhận DIRECT, không chờ nghiên cứu thêm.

### B. CURRENT STATE
| Thành phần | Trạng thái |
|---|---|
| `KePrimary.method` (課體 primary) | **CONTRACT ONLY** — type có (`src/types/ke-type.ts`), producer không tồn tại |
| `KePrimary.zeikeVariant` | **CONTRACT ONLY + RESEARCH GAP** — field optional có, nguồn chỉ confidence C |
| `KeSecondaryType` (課體 phụ) | **DEFERRED** — DO_NOT_IMPLEMENT, mảng PHẢI rỗng theo type comment |
| `VoidBranches` (空亡) | **CONTRACT ONLY** — type có (`src/types/void-branches.ts`), producer không tồn tại |
| `WangShuai` (旺衰, TÍNH) | **CONTRACT ONLY** — type có (`src/types/wang-shuai.ts`), producer không tồn tại |
| `ShenShaPlacement`/`computeYiMa` (驛馬) | **PARTIALLY IMPLEMENTED** — hàm đã có/verify/export công khai, nhưng KHÔNG nằm trong `DaLiuRenCalculationResult` |
| `BenMing`/`XingNian` (本命/行年) | **CONTRACT ONLY + VALIDATION GAP** — xem 11-E riêng |
| 12 Trường Sinh | **RESEARCH GAP** — không có type nào tồn tại (đã grep xác nhận) |

### C. ACTUAL FILES
- `packages/daliuren-engine/src/types/ke-type.ts` (type, đã đọc trực tiếp)
- `packages/daliuren-engine/src/types/void-branches.ts` (type, đã đọc trực tiếp)
- `packages/daliuren-engine/src/types/wang-shuai.ts` (type, đã đọc trực tiếp)
- `packages/daliuren-engine/src/types/shen-sha.ts` (type, đã đọc trực tiếp)
- `packages/daliuren-engine/src/types/ben-ming-xing-nian.ts` (type, đã đọc trực tiếp)
- `packages/daliuren-engine/src/yi-ma/compute.ts` (implementation ĐÃ CÓ, dòng 17 `computeYiMa`)
- `packages/daliuren-engine/src/nine-methods/compute.ts` (dòng 27/343 — nơi DUY NHẤT gọi `computeYiMa` hiện tại)
- `packages/daliuren-engine/src/three-transmissions/compute.ts` (nguồn `NineMethod`/`ThreeTransmissions.method` — input cho 課體 primary)
- `packages/daliuren-engine/src/da-liu-ren-calculation-result.ts` (nơi SẼ CẦN 1 type MỚI mở rộng nếu implement — dòng 7 xác nhận rõ các field này "TẤT CẢ đều CHƯA implement")
- `packages/daliuren-engine/src/index.ts` (nơi export)

### D. DEPENDENCIES
- **Direct**: `ThreeTransmissions.method` (課體), `calendar.dayPillar`+vị trí `threeTransmissions` (空亡), `calendar.monthPillar` (旺衰), `computeYiMa()` (驛馬) — CẢ 4 đã tồn tại và verify.
- **Calculation**: không — đây CHÍNH LÀ package Calculation.
- **Interpretation**: không — Tầng 1 chỉ tính FACT, không gán ý nghĩa.
- **Provenance**: cần entry MỚI cho mỗi field (chưa tồn tại), nhưng KHÔNG cần nguồn cổ điển mới — đã có sẵn confidence grade (B/A) từ nghiên cứu trước.
- **Validation**: cần test mới (golden chart), không có gì phải cross-check trước (khác 本命/行年).
- **Architecture**: không.
- **Integration**: không.
- **Research**: không cho 4 candidate DIRECT; CÓ cho zeikeVariant/12 Trường Sinh (không thuộc phạm vi 11-A nếu giữ đúng "chỉ 4 candidate DIRECT").

### E. BLOCKERS
- **HARD BLOCKER**: không có, cho 4 candidate DIRECT.
- **NON-BLOCKING GAP**: zeikeVariant (nguồn C, có thể bỏ trống field optional mà không chặn phần primary); 12 Trường Sinh (ngoài phạm vi 11-A, không chặn 4 candidate kia).

### F. MVP RISK
| Vùng | Rủi ro |
|---|---|
| Calculation semantics (8 field freeze) | **LOW** — field mới hoàn toàn additive, type mới thay vì sửa `DaLiuRenCalculationResult` hiện có (đúng nguyên tắc Phase 9E "type mới thay thế, KHÔNG mở rộng type freeze bằng field rỗng") |
| R-NHATTHAN-01 | **LOW** — không đọc field nào trong nhóm này |
| Provenance | **LOW** — chỉ thêm entry mới, không sửa entry cũ |
| Confidence | **LOW** — không đụng Model C |
| chartId | **LOW** — không phụ thuộc field Calculation nào ngoài 4 field đã dùng (`date/hour/minute/timeZone/profileId/version`) |
| QuestionType gating | **LOW** — không đụng |
| InterpretationPackage | **LOW** — không có rule nào dùng field mới ở package này |
| conflicts=[] | **LOW** — không liên quan |
| Golden cases hiện có | **LOW** — không field nào trong 8-field freeze bị đọc lại/tính lại |

### G. SCOPE
**Trong phạm vi nếu authorize**: viết `compute*` cho 課體 (primary)/空亡/旺衰(TÍNH)/驛馬-exposure; 1 type MỚI mở rộng `DaLiuRenCalculationResult` (KHÔNG sửa type cũ); provenance entry mới cho mỗi field; test golden chart.
**NGOÀI phạm vi tường minh**: 12 Trường Sinh; zeikeVariant; 課體 phụ (DO_NOT_IMPLEMENT); 本命/行年 (chờ 11-E); BẤT KỲ ý nghĩa luận giải nào (đó là Tầng 2/11-B).

### H. ACCEPTANCE CRITERIA
- Mỗi field mới có ≥1 test dùng golden chart thật (không fabricate).
- `DaLiuRenCalculationResult` hiện tại (8 field) không bị sửa 1 ký tự nào.
- 295 test cũ vẫn PASS nguyên vẹn + test mới PASS.
- Provenance entry mới resolve đúng qua cơ chế đã có (không cần validator mới).
- `npm run typecheck`/`build` sạch.

### I. EXPECTED ARTIFACTS (chỉ liệt kê, KHÔNG tạo)
- Source: `src/ke-type/compute.ts`, `src/void-branches/compute.ts`, `src/wang-shuai/compute.ts`, mỗi thư mục kèm `provenance.ts`/`index.ts` theo đúng pattern `four-lessons/`; 1 type mới (vd `DaLiuRenChartExtended` hoặc tên tương đương) thay vì sửa `da-liu-ren-calculation-result.ts`.
- Tests: `tests/unit/ke-type/`, `tests/unit/void-branches/`, `tests/unit/wang-shuai/`.
- Docs: cập nhật provenance-tracking, không cần tài liệu freeze mới trừ khi owner muốn 1 checkpoint riêng.
- Schema: type mới (không sửa schema cũ).
- API: không.

### J. COMPLEXITY
**LOW-MEDIUM** — theo đúng 1 pattern đã chứng minh hoạt động 8 lần (`four-lessons/`, `twelve-generals/`, v.v.), input đã có sẵn, không có quyết định kiến trúc mới cần ra.

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ.** Lý do factual: khối lượng code tương đương các module Calculation đã hoàn thành
thành công trước đó trong CHÍNH dự án này (four-lessons/twelve-generals/void-branches đều cùng
1 lớp phức tạp: tra bảng + phép tính vị trí xác định), không có coupling kiến trúc mới, không
cần diễn giải văn bản cổ điển mới (bằng chứng đã có sẵn confidence grade), rủi ro regression
LOW theo mục F.

---

## 11-B — Interpretation Rule Expansion

### A. PURPOSE
Thêm 4 rule production mới (quan-chuc, hon-nhan, tim-do rule chính, kien-tung 2 rule phụ) dùng
ĐÚNG 8-field freeze hiện có, theo khuôn R-NHATTHAN-01 đã chứng minh hoạt động.

### B. CURRENT STATE
| Candidate | Trạng thái |
|---|---|
| quan-chuc (前引後從格) | **CONTRACT ONLY** — chưa có `RuleDefinition`/evaluator nào |
| hon-nhan (Thiên Hậu/Lục Hợp) | **CONTRACT ONLY** |
| tim-do (遙克/昴星+Huyền Vũ) | **CONTRACT ONLY** |
| kien-tung 2 rule phụ (鬼臨三四, 支干乘刑) | **CONTRACT ONLY** |
| kien-tung rule chính, suc-khoe rule chính | **BLOCKED BY RESEARCH** (12 Trường Sinh) — KHÔNG thuộc phạm vi 11-B |
| thi-cu, tai-chinh, tim-do rule phụ | **BLOCKED BY RESEARCH** — KHÔNG thuộc phạm vi 11-B |

### C. ACTUAL FILES
- `packages/daliuren-engine/src/rules/r-nhatthan-01/{rule,provenance,evaluator,index}.ts` — TEMPLATE THAM CHIẾU trực tiếp (đã đọc lại toàn bộ, xác nhận đúng pattern: `RuleDefinition` data-only, `ProvenanceEntry` riêng, evaluator thuần dùng `TrachNhat.getNguHanhQuanHe`/`Data.CAN_NGU_HANH` từ `@thien-anh/calendar-core`+`@thien-anh/rule-engine`).
- `packages/daliuren-engine/src/rules/registry.ts` — nơi 4 rule mới sẽ đăng ký.
- `packages/daliuren-engine/src/interpretation/{rule,signal,rule-dependencies}.ts` — contract dùng lại nguyên vẹn.
- `packages/daliuren-engine/src/types/three-transmissions.ts`, `twelve-generals.ts` — nguồn field cho quan-chuc/hon-nhan/tim-do.

### D. DEPENDENCIES (đối chiếu field path CHÍNH XÁC)
| Candidate | Field path | `SignalRelation` cần | QuestionType gate | Provenance | Confidence | Conflict? | Bằng chứng đủ? | Ngữ nghĩa tất định đủ? |
|---|---|---|---|---|---|---|---|---|
| quan-chuc | `threeTransmissions.initial`, `threeTransmissions.final`, `calendar.dayPillar.can` | Không cần sinh/khắc — quan hệ VỊ TRÍ (trước/sau Can), có thể dùng `"presence"` hoặc field mới thuần positional (cần xác nhận cụ thể khi thiết kế evaluator — đây là 1 chi tiết CHƯA quyết định, không phải blocker) | READY | Cần entry mới | A (毕法赋 pháp 1) | Không | Đủ | Đủ |
| hon-nhan | `twelveGenerals` (tra theo `dayPillar.can`/`dayPillar.chi`) | `"presence"` (kiểm tra Thiên Hậu/Lục Hợp có mặt tại vị trí) | READY | Cần entry mới | A (毕法赋 pháp 40) | Không | Đủ | Đủ |
| tim-do (chính) | `threeTransmissions.method`, `twelveGenerals` (Huyền Vũ tại Sơ truyền) | `"presence"` | READY | Cần entry mới | A (毕法赋 pháp 35) | Không | Đủ | Đủ |
| kien-tung (鬼臨三四) | `fourLessons` (toàn bộ 4 khóa) + Ngũ-Hành tương đối Can | `"ke"` (đã có) | PARTIAL | Cần entry mới | A (毕法赋 pháp 70) | Không | Đủ | Đủ |
| kien-tung (支干乘刑) | `calendar.dayPillar.chi` (quan hệ Tam Hình giữa Chi — cần bảng 刑 cố định, giống bảng Ngũ Hành sinh/khắc, KHÔNG cần calculation mới) | **`"xing"` — đã có sẵn trong `SignalRelation`**, re-verify: `src/interpretation/signal.ts` dòng 18 | PARTIAL | Cần entry mới | A (毕法赋 pháp 75) | Không | Đủ | Đủ — NHƯNG cần xác nhận bảng 刑 tam hình cụ thể (寅巳申/丑戌未/子卯/辰午酉亥) có sẵn ở đâu trong repo hay cần viết mới (chưa grep thấy bảng này tồn tại — cần kiểm tra khi implement, KHÔNG chặn việc bắt đầu package) |

### E. BLOCKERS
- **HARD BLOCKER**: không, cho cả 4 candidate trong phạm vi 11-B.
- **NON-BLOCKING GAP**: bảng quan hệ Tam Hình (刑) cụ thể — CHƯA xác nhận đã tồn tại sẵn trong `@thien-anh/rule-engine` hay cần viết mới trong lúc implement 11-B (nhỏ, không chặn bắt đầu package, chỉ ảnh hưởng riêng 1 trong 4 rule).

### F. MVP RISK
| Vùng | Rủi ro |
|---|---|
| Calculation semantics | **LOW** — chỉ ĐỌC, không tính lại |
| R-NHATTHAN-01 | **LOW** — module riêng biệt, không sửa file R-NHATTHAN-01 |
| Provenance | **LOW** — thêm entry mới theo đúng khuôn |
| Confidence | **LOW** — dùng lại Model C nguyên vẹn |
| chartId | **LOW** — không liên quan |
| QuestionType gating | **LOW** — dùng `questionTypes` field có sẵn, không sửa `QUESTION_TYPE_STATUS` |
| InterpretationPackage | **MEDIUM** — `buildInterpretationPackage()` giờ xử lý >1 rule cùng lúc lần đầu tiên (hiện tại `PRODUCTION_RULE_REGISTRY` chỉ có 1 rule) — cần re-test kỹ đường `verified_rules`/`provenance` map gộp nhiều rule, dù logic hiện có ĐÃ được viết tổng quát cho N rule (không phải hard-code cho 1 rule) |
| conflicts=[] | **LOW** — Option A không đổi, nhưng đây là lần đầu có ≥2 rule cùng chạy 1 lúc — cần xác nhận KHÔNG rule nào trong 4 rule mới vô tình kích hoạt nhu cầu so sánh signal (đã audit ở mục 3 Roadmap: không rule nào yêu cầu) |
| Golden cases hiện có | **LOW** — rule mới, không sửa rule cũ |

### G. SCOPE
**Trong phạm vi**: 4 rule mới + đăng ký registry + test. **NGOÀI phạm vi tường minh**: bất kỳ rule nào phụ thuộc 12 Trường Sinh/帘幕貴人/財-鬼/太陽照武; conflict detection; SYNTHESIS; mở rộng R-NHATTHAN-01.

### H. ACCEPTANCE CRITERIA
- Mỗi rule mới: `buildRuleRegistry`/`buildEvaluatorRegistry` thật pass tại import time.
- Test qua golden chart thật (như `r-nhatthan-01.test.ts`), không fabricate.
- `buildInterpretationPackage()` trả đúng `verified_rules` cho ≥2 rule đồng thời — test MỚI riêng cho trường hợp N>1 rule (hiện chưa có, vì hiện chỉ có 1 rule).
- 295 test cũ xanh + test mới xanh.
- `conflicts` vẫn `[]` dù có nhiều rule hơn (xác nhận tường minh trong test).

### I. EXPECTED ARTIFACTS
- Source: `src/rules/r-quanchuc-01/`, `src/rules/r-honnhan-01/`, `src/rules/r-timdo-01/`, `src/rules/r-kientung-*/` (mỗi thư mục: `rule.ts`/`provenance.ts`/`evaluator.ts`/`index.ts`), sửa `src/rules/registry.ts`.
- Tests: 1 file test/rule + 1 test tổng hợp cho N-rule package builder.
- Docs: không bắt buộc, có thể cập nhật freeze doc nếu muốn checkpoint.
- Schema: không.
- API: không.

### J. COMPLEXITY
**LOW-MEDIUM** — đúng 1 pattern đã chứng minh (R-NHATTHAN-01), nhưng có 1 điểm MỚI thật sự (package builder lần đầu xử lý N>1 rule) cần kiểm tra kỹ hơn 1 module Calculation đơn lẻ.

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ.** Cùng lý do 11-A — pattern đã chứng minh, dữ liệu cổ điển đã có sẵn grade rõ ràng
(A cho cả 3 rule chính + 2 rule phụ), không cần diễn giải văn bản mới. Điểm N>1-rule ở package
builder là kiểm thử tích hợp, không phải độ khó thuật toán/kiến trúc mới.

---

## 11-C — API Integration

### A. PURPOSE
Thay route `dai-luc-nham.ts` (hiện gọi facade Phase 8) bằng pipeline đã đóng băng
(`calculateDaLiuRenChart` + `buildInterpretationPackage`).

### B. CURRENT STATE
**INTEGRATION GAP** — route tồn tại, hoạt động đúng CHO PHẠM VI CŨ, nhưng lỗi thời so với pipeline hiện tại.

### C. ACTUAL FILES
- `src/pages/api/dai-luc-nham.ts` (51 dòng, đã đọc toàn bộ — gọi `calculateCalendarFoundation({date,hour,minute,timeZone})`, GET-only, validate tham số hình thức, trả `jsonResponse(result, 200)`).
- `packages/daliuren-engine/src/index.ts` (`calculateCalendarFoundation`, `calculateDaLiuRenChart`, `buildInterpretationPackage` — cả 3 đã export).

### D. DEPENDENCIES
- **Direct**: 100% — mọi hàm cần đã export sẵn.
- **Calculation/Interpretation**: không cần thêm gì — hoạt động đúng với ĐÚNG 1 rule hiện có (R-NHATTHAN-01).
- **Provenance/Validation**: tự động qua `buildInterpretationPackage()`'s self-validate.
- **Architecture**: không.
- **Integration**: chính package này LÀ integration — quyết định route trả gì, `questionType` lấy từ đâu (query param mới CHƯA tồn tại trong route hiện tại).
- **Research**: không.

### E. BLOCKERS
- **HARD BLOCKER**: không.
- **NON-BLOCKING GAP**: quyết định sản phẩm (route trả `DaLiuRenCalculationResult` thô/`InterpretationPackage`/cả 2; `questionType` param mới) — đây là quyết định OWNER, không phải kỹ thuật.

### F. MVP RISK
Toàn bộ **LOW** — route nằm NGOÀI package `daliuren-engine`, không đụng bất kỳ hạng mục nào ở mục 12 (regression boundary). Rủi ro DUY NHẤT: nếu route MỚI thay thế hoàn toàn route CŨ (thay vì thêm route mới/query param mới), client hiện tại (nếu có) gọi route cũ sẽ nhận response SHAPE khác — đây là rủi ro SẢN PHẨM/tích hợp ngược, không phải rủi ro MVP kỹ thuật.

### G. SCOPE
**Trong phạm vi**: 1 route. **NGOÀI phạm vi**: sửa engine; thêm rule chỉ để route "có gì trả về".

### H. ACCEPTANCE CRITERIA
- Route mới gọi đúng `calculateDaLiuRenChart` → (nếu cần) `buildInterpretationPackage`.
- `EngineResult.ok=false` → response 200 với `errors[]` (giữ đúng convention cũ).
- `buildInterpretationPackage()` throw → response lỗi 5xx tường minh (route MỚI cần 1 nhánh `try/catch` mà route cũ KHÔNG có, vì `calculateCalendarFoundation()` không throw).
- Test route xác nhận cả 2 nhánh `ok`/lỗi.

### I. EXPECTED ARTIFACTS
- Source: `src/pages/api/dai-luc-nham.ts` (sửa), có thể thêm route mới thay vì sửa route cũ tuỳ quyết định owner.
- Tests: test route (ngoài `daliuren-engine` package).
- Docs: không bắt buộc.
- API: CÓ — đây chính là thay đổi API.

### J. COMPLEXITY
**LOW** — 1 file, không có logic domain, đã có mọi hàm cần dùng.

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ** — công việc thuần wiring, không có phán đoán kiến trúc/nghiên cứu nào.

---

## 11-D — Research Closure

### A. PURPOSE
Đóng 5 gap RESEARCH (không phải code): 12 Trường Sinh, 帘幕貴人 công thức tính, 財/鬼 thuật ngữ, 太陽照武 referent, zeikeVariant.

### B. CURRENT STATE
Toàn bộ 5 mục: **RESEARCH GAP**. Phân loại chính xác theo 4 loại yêu cầu:

| Mục | SOURCE MISSING | SEMANTICS UNCLEAR | IMPLEMENTATION MISSING | VALIDATION MISSING |
|---|---|---|---|---|
| 12 Trường Sinh | Một phần — nguồn khớp (report-G) chỉ confidence C, nguồn có implementation (repo D) đã bị phản chứng | — | Có (hệ quả của source gap) | — |
| 帘幕貴人 | **CÓ** — công thức TÍNH (vị trí) chưa từng được audit ở bất kỳ đâu trong 7 report nghiên cứu đã có | — (Ý NGHĨA đã rõ, confidence A) | Có (hệ quả) | — |
| 財/鬼 (tai-chinh) | Không hẳn thiếu nguồn (câu phú đã có, confidence A cho câu chữ) | **CÓ** — chưa xác định 財/鬼 dùng khung nào (六親 đã loại, hay Ngũ-Hành-thuần) | — | — |
| 太陽照武 (tim-do) | Không hẳn thiếu nguồn (câu phú đã có) | **CÓ** — referent "太陽" chưa xác nhận trỏ tới field nào | — | — |
| zeikeVariant | **CÓ** — chỉ 1 nguồn (repo D), chưa có nguồn độc lập thứ 2 | — | — | **CÓ** — chưa cross-check nguồn D với bất kỳ nguồn nào khác |

### C. ACTUAL FILES
- `docs/daliuren/research/phase2/report-7-question-types.md` (nguồn tai-chinh/thi-cu).
- `docs/daliuren/DA_LIU_REN_QUESTION_TYPES_RESEARCH.md`, `DA_LIU_REN_QUESTION_TEST_SPEC.md` (kien-tung/suc-khoe/thi-cu dependency).
- `docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md` mục 8c/11b (12 Trường Sinh, zeikeVariant nguồn).
- `docs/daliuren/research/report-G-classical-sources.md` (太陽=月將 general terminology, dùng ở nơi khác chứ chưa xác nhận cho riêng pháp 39).
- KHÔNG có file source code nào liên quan (đúng bản chất "research", không phải "code").

### D. DEPENDENCIES
Không phụ thuộc bất kỳ package nào khác — có thể chạy độc lập, song song với 11-A/11-B/11-C.

### E. BLOCKERS
Không — đây LÀ package để đóng blocker cho các candidate KHÁC, bản thân nó không có blocker (ngoại trừ: cần khả năng đọc trực tiếp nguyên văn Hán văn, không qua tóm tắt web — đã là kỷ luật chuẩn của dự án, không phải "blocker" theo nghĩa kỹ thuật).

### F. MVP RISK
**LOW cho toàn bộ** — package này KHÔNG viết code, không thể regress bất kỳ thứ gì ở mục 12.

### G. SCOPE
**Trong phạm vi**: đọc nguyên văn, viết report kết luận CONFIDENCE (kể cả "vẫn không đủ"). **NGOÀI phạm vi tường minh**: implement BẤT KỲ điều gì dựa trên kết quả — đó là việc của 1 package 11-A/11-B tiếp theo.

### H. ACCEPTANCE CRITERIA
Mỗi trong 5 mục có 1 kết luận CONFIDENCE (A/B/C/D hoặc "KHÔNG ĐỦ, giữ nguyên") kèm trích dẫn chính xác (nguồn, 卷/篇, nguyên văn, dịch nghĩa) — đúng kỷ luật "Vietnamese translation + original Chinese + exact source" đã áp dụng xuyên suốt dự án.

### I. EXPECTED ARTIFACTS
- Docs: report mới hoặc cập nhật trong `docs/daliuren/research/` — KHÔNG source code.

### J. COMPLEXITY
**MEDIUM-HIGH** (về mặt NGHIÊN CỨU, không phải code) — cần đọc trực tiếp nguyên văn Hán văn cổ, đối chiếu nhiều nguồn, tránh paraphrase từ web summarizer (rủi ro đã từng bị phát hiện trong chính dự án này, vd cảnh báo "占财紧要视青龙" có thể là AI-paraphrase).

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ**, dựa trên bằng chứng thực tế: toàn bộ kỷ luật đánh giá bằng chứng cổ điển ba cấp
(CLASSICAL FACT / PROJECT RESEARCH FINDING / ENGINEERING CONVENTION), phát hiện TD-4, phát hiện
mâu thuẫn Phase 10.5A (calendar provenance "B không phải A"), và hàng chục lần phân biệt
"nguồn đủ mạnh" vs "chỉ 1 nguồn web ẩn danh" xuyên suốt TOÀN BỘ dự án này đã được thực hiện
THÀNH CÔNG bằng đúng model đang chạy phiên làm việc này. Đây là bằng chứng trực tiếp, không suy
đoán. Không có yếu tố mới nào ở 11-D (khối lượng văn bản, độ mơ hồ thuật ngữ) vượt quá những gì
đã xử lý thành công ở Phase 10.2-10.6.4A. **Lưu ý khách quan** (không phải lý do đổi model):
đây là package có "difficulty of validation" cao NHẤT trong 6 package — sự cẩn trọng cần thiết
là thuộc tính của CHÍNH CÔNG VIỆC (đọc cổ văn), không phải dấu hiệu thiếu năng lực model.

---

## 11-E — Validation Closure (本命/行年)

### A. PURPOSE
Cross-check công thức modulo (repo D) và date-probe (repo A) cho 本命/行年 — xác nhận 2 công thức có cho CÙNG kết quả hay không, trước khi nâng confidence từ B lên A (hoặc xác nhận giữ B).

### B. CURRENT STATE
**VALIDATION GAP** — cả 2 công thức đã được audit riêng lẻ (mỗi cái confidence B), nhưng CHƯA có phép thử chéo (`DA_LIU_REN_VALIDATION_REVIEW.md` dòng 16b: "CHƯA TỪNG được test chéo để xác nhận 2 công thức cho cùng kết quả").

### C. ACTUAL FILES
- `packages/daliuren-engine/src/types/ben-ming-xing-nian.ts` (type, đã đọc — `BenMing{can,chi}`, `XingNian{can,chi,ageXuSui}`).
- KHÔNG có file implementation nào tồn tại — cả 2 công thức hiện CHỈ mô tả trong docs (`DA_LIU_REN_TEST_SPEC.md` #17 theo comment trong type file), CHƯA có code Vietnamese cho cả 2 công thức trong `daliuren-engine` hiện tại.

### D. DEPENDENCIES
- **Direct**: `calendar` (đã có) + `ChartInput.birthDate` (input optional đã có).
- **Calculation/Interpretation**: không.
- **Architecture**: có điều kiện — cần quyết định shape output khi `birthDate` không được cung cấp (đã optional trên `ChartInput`, nhưng `DaLiuRenCalculationResult` hiện tại KHÔNG có field `benMing`/`xingNian` nào cả — nghĩa là package này thực ra cần CẢ implementation lẫn validation, không chỉ validation thuần, nếu muốn có bất kỳ code thật nào để cross-check).
- **Research**: không — nguồn đã đủ (B cho cả 2), chỉ thiếu bước đối chiếu.

### E. BLOCKERS
- **HARD BLOCKER**: không.
- **NON-BLOCKING GAP**: cần viết CẢ 2 công thức thành code trước khi cross-check được (hiện chưa có code nào, chỉ có mô tả trong docs) — đây là điểm CẦN LÀM RÕ: 11-E, nếu hiểu chặt là "chỉ chạy test," thực ra ngầm định 11-A đã viết code cho 本命/行年 trước. Nếu KHÔNG, 11-E cần tự viết 2 bản implementation TẠM (song song) chỉ để so sánh, trước khi merge thành 1.

### F. MVP RISK
**LOW** cho toàn bộ mục ở 12 — 本命/行年 là field HOÀN TOÀN MỚI, optional, không đụng 8-field freeze.

### G. SCOPE
**Trong phạm vi**: viết (nếu cần) + chạy cross-check 2 công thức trên nhiều ngày sinh. **NGOÀI phạm vi**: gán ý nghĩa luận giải cho 本命/行年 (Tầng 2); ép công thức khớp nếu thực tế không khớp (phải BÁO CÁO trung thực nếu lệch, không được chọn 1 bên rồi bịa lý do).

### H. ACCEPTANCE CRITERIA
- Báo cáo rõ: khớp 100% trên bộ test date đủ rộng → có thể đề xuất nâng A; KHÔNG khớp → giữ B, ghi rõ trường hợp lệch.
- Không sửa bất kỳ calculation semantics nào khác.

### I. EXPECTED ARTIFACTS
- Tests: test cross-check (test-only, hoặc kèm 2 implementation tạm nếu chưa có).
- Docs: báo cáo kết quả cross-check.

### J. COMPLEXITY
**LOW-MEDIUM** — bản thân phép so sánh đơn giản, nhưng cần LÀM RÕ trước (mục E) liệu package này có ngầm định cần viết code 本命/行年 trước hay không — đây là 1 điểm mơ hồ phạm vi cần owner làm rõ (xem mục 14).

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ** — phép so sánh 2 công thức thuần toán học/logic, không cần diễn giải cổ văn mới.

---

## 11-F — Architecture Decision (gender externalContext / CalculationProfile)

### A. PURPOSE
RA QUYẾT ĐỊNH (không code) cho 2 ràng buộc kiến trúc độc lập đã biết.

### B. CURRENT STATE
Cả 2: **ARCHITECTURE GAP** — không phải thiếu bằng chứng, mà là cần 1 quyết định kiến trúc tường minh.

#### B1. gender như `externalContext`
- **Quy tắc hiện tại**: `validateRuleRegistry` (`src/validation/rule-registry.ts` dòng 70-77) từ chối BẤT KỲ rule nào có `dependencies.externalContext` khác rỗng — KHÔNG phân biệt giá trị cụ thể là gì.
- **Điều kiện chặn chính xác**: `(rule.dependencies.externalContext?.length ?? 0) > 0` → throw `RULE_DEPENDENCY_UNAVAILABLE`.
- **Quyết định kiến trúc trước đó**: Phase 10.4 Section 4 / Phase 10.5 Audit #2 (Option A) — quyết định CÓ CHỦ ĐÍCH, không phải sơ suất.
- **Các lựa chọn tồn tại** (liệt kê, KHÔNG chọn): (a) giữ nguyên tuyệt đối; (b) thêm ngoại lệ CHỈ cho `"gender"` (danh sách trắng nhỏ trong `validateRuleRegistry`); (c) đổi `gender` từ optional trên `ChartInput` thành 1 phần của `DaLiuRenCalculationResult` (biến nó thành "AVAILABLE" theo đúng nghĩa Level 2, không cần ngoại lệ nào — nhưng đây lại là 1 thay đổi kiến trúc LỚN HƠN, ảnh hưởng định nghĩa "8 field freeze").
- **Tương thích ngược**: lựa chọn (b) không ảnh hưởng bất kỳ rule hiện có nào (R-NHATTHAN-01 không dùng `externalContext`). Lựa chọn (c) có khả năng đụng vào chính định nghĩa "8-field freeze" — RỦI RO CAO hơn hẳn (b).
- **Có cần resolve NGAY không?** KHÔNG — chỉ 1 rule phụ của suc-khoe bị ảnh hưởng, KHÔNG chặn bất kỳ candidate DIRECT nào.
- **Điều gì sẽ KÍCH HOẠT nhu cầu resolve?** Owner muốn implement rule phụ suc-khoe (giới tính→用神) cụ thể.

#### B2. `CalculationProfile` trong evaluator
- **Quy tắc hiện tại**: `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` — 1 tham số duy nhất, đã freeze từ Phase 10.2 (Model A).
- **Điều kiện chặn chính xác**: `resolveDayOrHourPillarProvenance` (`src/interpretation/calendar-dependency-provenance.ts`) cần `CalculationProfile` để tra `ziHourDayBoundary` — evaluator KHÔNG có cách nhận tham số này ngoài hard-code `CLASSICAL_V1_PROFILE`.
- **Quyết định kiến trúc trước đó**: Phase 10.2 (Model A frozen), phát hiện gap ở Phase 10.6.3, tái xác nhận non-blocking ở Phase 10.6.6/Decision Brief/Roadmap.
- **Các lựa chọn tồn tại** (liệt kê, KHÔNG chọn — đã liệt kê ở Roadmap mục 11, nhắc lại chính xác): (a) mở rộng chữ ký `evaluate()` — ảnh hưởng MỌI evaluator hiện có/tương lai; (b) chuyển việc tra provenance phụ-thuộc-profile ra `buildInterpretationPackage` (đã có quyền truy cập profile); (c) giữ nguyên vĩnh viễn cho tới khi cần thật.
- **Tương thích ngược**: (a) là breaking change cho R-NHATTHAN-01 VÀ mọi rule mới ở 11-B; (b) không breaking nếu thiết kế đúng (evaluator trả FACT thô, builder tự gắn provenance) nhưng cần 1 vòng thiết kế lại `RuleResult`/`Signal.calculationConfidence` (ai tính, ở đâu); (c) zero thay đổi.
- **Có cần resolve TRƯỚC Calculation Expansion (11-A) không?** **KHÔNG** — đã xác nhận lại: KHÔNG có candidate DIRECT nào ở 11-A cần `CalculationProfile` (課體/空亡/旺衰/驛馬 đều không có logic phụ thuộc profile).
- **Điều gì sẽ KÍCH HOẠT nhu cầu resolve?** Bất kỳ ai thêm `CalculationProfile` THỨ 2 thật (khác `CLASSICAL_V1_PROFILE`) — hiện KHÔNG có candidate nào ở Phase 11 tạo ra nhu cầu này.

### C. ACTUAL FILES
- `src/validation/rule-registry.ts` (dòng 70-77, gating `externalContext`).
- `src/interpretation/rule-dependencies.ts` (`ExternalContextId = "gender" | "birthDateBeyondCalendar"`).
- `src/rules/r-nhatthan-01/evaluator.ts` (dòng 8-15, comment tường minh ghi lại giới hạn `CalculationProfile`).
- `src/interpretation/calendar-dependency-provenance.ts` (nơi cần `CalculationProfile`).
- `src/profiles/classical-v1.ts` (`CLASSICAL_V1_PROFILE` — PROFILE DUY NHẤT tồn tại, xác nhận lại qua grep).

### D. DEPENDENCIES
Không phụ thuộc package nào khác. B1 CÓ THỂ ảnh hưởng khả năng implement rule phụ suc-khoe trong 11-B (nếu 11-B mở rộng sau này); B2 KHÔNG ảnh hưởng bất kỳ candidate Phase 11 nào hiện biết.

### E. BLOCKERS
Không — bản thân 11-F là 1 QUYẾT ĐỊNH, không tự nó bị chặn.

### F. MVP RISK
**LOW cho việc RA quyết định** (không code). Nếu SAU NÀY thực thi lựa chọn (a) cho B1 hoặc (a) cho B2, rủi ro sẽ là **HIGH** (ảnh hưởng MỌI evaluator) — nhưng đó là rủi ro của 1 package THỰC THI khác, không phải của 11-F (ra quyết định).

### G. SCOPE
**Trong phạm vi**: viết rõ các lựa chọn + hệ quả (đã làm ở đây); RA quyết định bằng văn bản. **NGOÀI phạm vi tường minh**: code bất kỳ lựa chọn nào đã liệt kê.

### H. ACCEPTANCE CRITERIA
Có văn bản quyết định rõ ràng cho CẢ 2 câu hỏi (B1, B2), dù kết quả là "giữ nguyên, không đổi gì".

### I. EXPECTED ARTIFACTS
- Docs: 1 quyết định kiến trúc (có thể là bổ sung vào chính tài liệu này hoặc 1 file quyết định riêng nếu owner chọn mở ngoại lệ) — KHÔNG code.

### J. COMPLEXITY
**LOW** (ra quyết định) — nhưng lựa chọn (a) ở CẢ B1 lẫn B2, NẾU được chọn thực thi sau này, có độ phức tạp **HIGH** (ảnh hưởng kiến trúc rộng).

### K. CLAUDE MODEL REQUIREMENT
**SONNET đủ** cho việc RA quyết định/viết tài liệu (đã chứng minh qua chính Phase 10.6.4B — quyết định kiến trúc Option A cho conflict, cùng độ phức tạp, đã hoàn thành thành công bằng model hiện tại). Nếu owner sau này CHỌN thực thi lựa chọn (a) cho B2 (mở rộng chữ ký `evaluate()`), đây sẽ là 1 package THỰC THI riêng, có độ coupling kiến trúc cao (ảnh hưởng MỌI evaluator + registry) — việc đánh giá model cho package thực thi ĐÓ cần làm lại riêng, không suy diễn từ đây.

---

## 10. Ma trận phụ thuộc chéo (cross-package)

| Package | Phụ thuộc 11-A | 11-B | 11-C | 11-D | 11-E | 11-F |
|---|---|---|---|---|---|---|
| 11-A | — | NO | NO | **CONDITIONAL** — chỉ nếu muốn mở rộng 11-A sang 12 Trường Sinh/zeikeVariant (4 candidate DIRECT hiện tại KHÔNG cần) | NO | NO |
| 11-B | NO | — | NO | **CONDITIONAL** — chỉ nếu muốn mở rộng 11-B sang kien-tung/suc-khoe rule chính, thi-cu, tai-chinh, tim-do rule phụ (4 candidate DIRECT hiện tại KHÔNG cần) | NO | **CONDITIONAL** — CHỈ nếu muốn implement rule phụ suc-khoe (gender) cụ thể |
| 11-C | NO | NO | — | NO | NO | NO |
| 11-D | NO | NO | NO | — | NO | NO |
| 11-E | **CONDITIONAL** — nếu owner muốn 11-A "trọn gói" gồm cả 本命/行年 sau khi cross-check xong | NO | NO | NO | — | NO |
| 11-F | NO | NO | NO | NO | NO | — |

---

## 11. Phân tích song song hoá (Parallelization)

- **API Integration (11-C) vs Calculation Expansion (11-A)**: **KHÔNG chạm nhau** — file khác nhau hoàn toàn (`src/pages/api/` vs `packages/daliuren-engine/src/`), có thể chạy song song tuyệt đối.
- **Research Closure (11-D) vs API Integration (11-C)**: **KHÔNG chạm nhau** — 11-D không đụng code nào, 11-C không đụng research nào.
- **Interpretation rule độc lập (11-B, 4 candidate DIRECT) vs 12 Trường Sinh (thuộc 11-D/tương lai 11-A mở rộng)**: **KHÔNG chạm nhau về code** — 4 rule DIRECT của 11-B không đọc field nào liên quan 12 Trường Sinh. CÓ 1 điểm CHUNG CẦN CHÚ Ý: cả 11-A và 11-B đều ghi vào `src/index.ts` (thêm export) — nếu chạy THẬT SỰ song song (2 người/phiên khác nhau cùng lúc), cần merge cẩn thận file này, KHÔNG phải xung đột ngữ nghĩa, chỉ là xung đột file text thông thường.
- **Validation Closure (11-E) vs Interpretation Expansion (11-B)**: **KHÔNG chạm nhau** — 11-E làm việc trên `benMing`/`xingNian`, 11-B (phạm vi hiện tại) không đọc 2 field này.
- **11-A vs 11-B**: **KHÔNG chạm nhau về mặt SEMANTIC** (11-A ghi field Calculation mới, 11-B đọc field Calculation ĐÃ CÓ SẴN từ trước — không phải field 11-A tạo ra) — nhưng cả 2 đều thêm rule/module mới vào `src/rules/registry.ts` NẾU 11-B chạy, và `src/index.ts` NẾU 11-A chạy — cùng loại xung đột file-text như trên, không phải xung đột thiết kế.
- **11-F (quyết định) vs bất kỳ package nào khác**: không xung đột — 11-F không viết code.

**Kết luận**: 11-A, 11-B, 11-C có thể triển khai HOÀN TOÀN song song về mặt kiến trúc/ngữ nghĩa; rủi ro DUY NHẤT khi chạy đồng thời là xung đột merge file thông thường (`src/index.ts`, `src/rules/registry.ts`), không phải xung đột thiết kế.

---

## 12. Ranh giới bảo vệ MVP đông cứng — test regression bắt buộc

Mọi package PHẢI giữ nguyên (nhắc lại từ Roadmap, không đổi):

| Hạng mục | 11-A chạm? | 11-B chạm? | 11-C chạm? | 11-D chạm? | 11-E chạm? | 11-F chạm? |
|---|---|---|---|---|---|---|
| 295/295 baseline | Phải PASS thêm test mới | Phải PASS thêm test mới | Không liên quan (test route riêng) | Không | Phải PASS thêm test mới (nếu viết code) | Không |
| R-NHATTHAN-01 golden cases | KHÔNG chạm | KHÔNG chạm (module riêng) | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm (trừ khi B2 lựa chọn (a) được thực thi sau này) |
| chartId tất định | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm |
| Provenance grades hiện có | KHÔNG sửa, chỉ THÊM | KHÔNG sửa, chỉ THÊM | KHÔNG chạm | KHÔNG chạm (chỉ nghiên cứu) | KHÔNG sửa, chỉ THÊM (nếu có) | KHÔNG chạm |
| Confidence Model C | Dùng lại nguyên vẹn | Dùng lại nguyên vẹn | KHÔNG chạm | KHÔNG chạm | Dùng lại nguyên vẹn | KHÔNG chạm |
| QuestionType gating | KHÔNG chạm | Dùng lại nguyên vẹn (Level 1+2) | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | **CÓ THỂ chạm** nếu B1 chọn mở ngoại lệ Level 2 — đây CHÍNH LÀ quyết định cần owner duyệt |
| InterpretationPackage validation | KHÔNG chạm | **Test MỞ RỘNG cần thiết** (N>1 rule lần đầu) | Gián tiếp (route tiêu thụ) | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm |
| conflicts=[] | KHÔNG chạm | Phải xác nhận vẫn `[]` với N>1 rule | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm | KHÔNG chạm |

---

## 13. Ma trận quyết định (thông tin thuần tuý, KHÔNG xếp hạng)

| Package | Readiness | Loại Blocker | Quy mô | Complexity | MVP Risk | Research Dependency | Architecture Dependency |
|---|---|---|---|---|---|---|---|
| 11-A | READY FOR DETAILED SPEC (4 candidate DIRECT) | Không (cho phạm vi DIRECT) | 4 module Calculation mới | LOW-MEDIUM | LOW | Không (cho DIRECT) | Không |
| 11-B | READY FOR DETAILED SPEC (4 candidate DIRECT) | Không (cho phạm vi DIRECT) | 4 rule Interpretation mới + 1 test N-rule mới | LOW-MEDIUM | LOW-MEDIUM (do điểm N>1-rule) | Không (cho DIRECT) | Không |
| 11-C | READY FOR DETAILED SPEC | Không (kỹ thuật) — có quyết định sản phẩm cần chốt | 1 route | LOW | LOW | Không | Không |
| 11-D | READY FOR DETAILED SPEC (là công việc nghiên cứu, không chờ gì) | Không (tự thân) | 5 chủ đề nghiên cứu | MEDIUM-HIGH (nghiên cứu) | LOW (không code) | Có — CHÍNH nó là research | Không |
| 11-E | NEEDS SCOPE CLARIFICATION (mục B/E — có ngầm định cần code trước không?) | Không (kỹ thuật) | 1 phép cross-check (+ có thể 2 implementation tạm) | LOW-MEDIUM | LOW | Không | Không |
| 11-F | READY FOR DETAILED SPEC (là quyết định, không chờ gì) | Không (tự thân) | 2 câu hỏi kiến trúc | LOW (ra quyết định) | LOW | Không | Có — CHÍNH nó là architecture decision |

---

## 14. Câu hỏi tối thiểu chủ dự án cần trả lời cho từng package

- **11-A**: Phê duyệt implement 4 candidate DIRECT (課體 primary/空亡/旺衰-TÍNH/驛馬 exposure)? Có muốn gộp luôn 本命/行年 vào cùng đợt (phụ thuộc câu trả lời 11-E) hay tách riêng?
- **11-B**: Phê duyệt implement 4 rule DIRECT (quan-chuc/hon-nhan/tim-do chính/kien-tung 2 phụ)?
- **11-C**: Route mới nên trả `DaLiuRenCalculationResult` thô, `InterpretationPackage`, hay cả 2 (theo query param)? `questionType` lấy từ đâu? Route CŨ có bị thay thế hoàn toàn hay giữ song song?
- **11-D**: Phê duyệt đầu tư 1 vòng nghiên cứu (đọc nguyên văn) cho 5 chủ đề đã liệt kê?
- **11-E**: Làm rõ phạm vi — 11-E có bao gồm việc VIẾT code 本命/行年 lần đầu (để có gì cross-check), hay giả định code đó đã tồn tại từ 1 package khác (hiện KHÔNG tồn tại)? Phê duyệt phương pháp cross-check (bao nhiêu ngày sinh test, tiêu chí "khớp")?
- **11-F**: (B1) Có phê duyệt mở ngoại lệ Level 2 cho `externalContext=["gender"]`? (B2) Có cần resolve ràng buộc `CalculationProfile`-trong-evaluator NGAY, hay tiếp tục hoãn (Roadmap đã xác nhận không có candidate nào cần nó hiện tại)?

Không câu hỏi nào ở trên được trả lời thay chủ dự án trong tài liệu này.

---

Tài liệu này KHÔNG thay đổi bất kỳ trạng thái đông cứng nào đã có. Không rule, calculation,
route, hay quyết định kiến trúc nào được thực thi khi viết tài liệu này.
