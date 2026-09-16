# CONG TAIYI — Đại Lục Nhâm Interpretation MVP — Completion & Freeze

Tài liệu đóng băng (freeze) chính thức cho MVP của `@thien-anh/daliuren-engine`, viết ở cuối Phase 10.6.6. Đây là tài liệu HANDOFF — tổng hợp lại trạng thái đã được audit/verify qua các Phase 10.2–10.6.6 (Interpretation Layer), dựa trên nền Calculation Layer đã freeze từ Phase 9F. Không phải tài liệu nghiên cứu mới — mọi khẳng định ở đây trỏ ngược về đúng phase/commit đã tạo ra bằng chứng đó.

**Trạng thái**: MVP VERIFIED WITH NON-BLOCKING GAPS. **Freeze**: READY (xem mục 16).

---

## 1. Kiến trúc MVP đã xác thực (Authoritative MVP State)

Pipeline sau đã được xác thực END-TO-END ở Phase 10.6.6, chạy thật qua `calculateDaLiuRenChart()` + registry sản xuất thật (KHÔNG dùng calculation giả lập ở bất kỳ test production-wiring nào):

```
ChartInput
  → calculateDaLiuRenChart()
  → DaLiuRenCalculationResult
  → ValidatedRuleRegistry           (buildRuleRegistry — Level 1 + Level 2 gating tại build time)
  → QuestionType Eligibility        (selectEligibleRules — Level 1 tại thời điểm chọn)
  → ValidatedEvaluatorRegistry      (buildEvaluatorRegistry — completeness 1-1)
  → Rule Evaluator                  (runEvaluator — evaluate(calculation): RuleResult)
  → RuleResult
  → Signals
  → Provenance                      (rule provenance ≠ calculation provenance, gộp theo id thực tham chiếu)
  → Confidence                      (Model C: ruleConfidence/calculationConfidence tách biệt)
  → InterpretationPackage           (buildInterpretationPackage())
  → validateInterpretationPackage() (self-check bên trong builder, ném lỗi nếu package sai)
```

Mỗi mũi tên tương ứng đúng 1 hàm thật, có test thật chạy qua lá số vàng (golden chart) 2024-01-01. Không có bước nào bị stub/bỏ qua/giả lập. Chi tiết audit từng bước: xem báo cáo Phase 10.6.6 (trong lịch sử phiên làm việc — không có file .md riêng, nội dung được kế thừa đầy đủ vào tài liệu này).

---

## 2. Calculation MVP

Phân biệt rõ **ĐÃ IMPLEMENT + ĐÃ VERIFY** với **TYPE TỒN TẠI NHƯNG CHƯA CÓ HÀM TÍNH** (theo đúng ranh giới Phase 9F đã đóng băng):

### ĐÃ IMPLEMENT + ĐÃ VERIFY (8 field của `DaLiuRenCalculationResult`)
- `calendar` — 4 trụ Can Chi + tiết khí (`calendar/foundation.ts`)
- `monthGeneral` — 月將
- `dayNight` — 晝/夜 theo chi giờ chiêm
- `nobleSpirit` — 貴人 (⚠️ confidence B chỉ cho Giáp, D cho 9 Can còn lại — không đổi ở MVP)
- `heavenEarthPlate` — 天地盤
- `fourLessons` — 四課
- `threeTransmissions` — 三傳 (qua Cửu Tông Môn — ⚠️ 伏吟 selection formula còn xung đột nguồn CHƯA resolve, xem mục 11)
- `twelveGenerals` — 十二天將

### TYPE TỒN TẠI NHƯNG PRODUCER CHƯA IMPLEMENT
`types/chart.ts`'s `Chart` (superset của `DaLiuRenCalculationResult`) còn khai báo `keType` (課體), `voidBranches` (空亡), `shenSha` (神煞), `wangShuai` (旺衰), `benMing`/`xingNian` (本命/行年) — **các type này TỒN TẠI trong contract nhưng KHÔNG có hàm `compute*` nào sản xuất ra giá trị thật**. `DaLiuRenCalculationResult` (output THẬT của `calculateDaLiuRenChart()`) CỐ TÌNH KHÔNG chứa các field này — đây là quyết định kiến trúc rõ ràng từ Phase 9E, không phải thiếu sót bị bỏ quên. Việc 1 type có mặt trong `types/` KHÔNG được hiểu là "đã sẵn sàng dùng".

---

## 3. Interpretation MVP

- **Rule Registry**: `ValidatedRuleRegistry`, dựng qua `buildRuleRegistry()`, tự validate ngay khi module `rules/registry.ts` được import (throw ngay nếu sai, không có runtime fallback).
- **Evaluator Registry**: `ValidatedEvaluatorRegistry`, dựng qua `buildEvaluatorRegistry()`, đảm bảo completeness 1-1 giữa rule đã đăng ký và evaluator.
- **Level 1 (QuestionType gating)**: `questionTypeAllowsRules()` — chỉ READY/PARTIAL được phép gắn rule; UNVERIFIED/DO_NOT_IMPLEMENT bị chặn tại build time.
- **Level 2 (capability gating)**: `RuleDefinition.dependencies` — rule cần `unimplementedComponents`/`externalContext` khác rỗng bị từ chối đăng ký tại build time, KHÔNG runtime fallback, KHÔNG xuất hiện ở bất kỳ đâu tại runtime (kể cả `unresolved_items`).
- **R-NHATTHAN-01** — xem mục 4.
- **Signal Model C**: `Signal`/`RuleResult` có `ruleConfidence` VÀ `calculationConfidence` tách biệt (không còn 1 field `confidence` gộp).
- **Provenance separation**: provenance của RULE (`provenanceId`) và provenance của CALCULATION LAYER (`calculationProvenanceIds`) là 2 field riêng, không gộp.
- **Confidence separation**: xem mục 6.
- **chartId tất định**: `buildChartId()` — SHA-256 trên tuple thứ tự cố định (date|hour|minute|timeZone|profileId|version), loại `calculatedAt`/`gender`/`birthDate`.
- **InterpretationPackage builder**: `buildInterpretationPackage()` — nối toàn bộ pipeline mục 1.
- **Package self-validation**: builder tự gọi `validateInterpretationPackage()` trước khi trả về — không package sai nào lọt ra ngoài.

**Số lượng rule production hiện tại: 1.** Rule duy nhất: **R-NHATTHAN-01**. Không có rule production nào khác tồn tại hoặc được ngụ ý tồn tại.

---

## 4. R-NHATTHAN-01

- **Nguồn**: 六壬大全 卷三「日辰」 (xác minh qua `docs/daliuren/research/phase2/report-1-sike-sanchuan.md` Phần 1a).
- **ruleConfidence = A** (cố định, không đổi theo chart).
- **calculationConfidence**: PHÁI SINH TỪ PROVENANCE (`worstConfidence(FOUR_LESSONS_PROVENANCE.confidence, dayPillarProvenance.confidence)`) — KHÔNG hard-code.
  - Chart **KHÔNG rơi vào vùng Tý** (hourPillar.chi ≠ Tý): `calculationConfidence = B`.
  - Chart **rơi vào vùng Tý** (hourPillar.chi = Tý, tức giờ dân sự gốc ∈ {23,0}): `calculationConfidence = D` (kèm `PROV-PROFILE-ZIHOUR-CONFLICTING`).
- Chỉ implement **4 vế cùng trục** của nguyên văn (thượng thần sinh/khắc Can|Chi Ngày, và Can|Chi Ngày sinh/khắc ngược lại thượng thần) — cho MỖI trục Can/Chi ĐỘC LẬP.
- **KHÔNG implement** các vế hợp-trục (日辰各受上神生/尅/脫 — xét đồng thời cả 2 trục) lẫn vế thoát chéo-trục (日上脫辰/辰上脫日) — đây là phạm vi hẹp hơn CHÍNH VĂN đầy đủ, có chủ đích, ghi rõ trong `provenance.ts` của chính rule.
- **Tương hoà** (thượng thần và Can|Chi Ngày cùng Ngũ Hành): KHÔNG tạo signal cho trục đó — nguyên văn không bàn trường hợp này, không tự suy ra polarity.
- **2 trục (Can/Chi) hoàn toàn độc lập** — không so sánh lẫn nhau, không tạo conflict giữa chúng (xem mục 7).
- **KHÔNG dùng Tam Truyền/Twelve Generals/Noble Spirit/Heaven-Earth Plate** — evaluator chỉ đọc `fourLessons.{lesson1,lesson3}.upper` và `calendar.dayPillar.{can,chi}` (cộng `calendar.hourPillar.chi` chỉ để xác định vùng Tý).

---

## 5. Provenance

**RULE PROVENANCE ≠ CALCULATION PROVENANCE** — 2 không gian id tách biệt, không bao giờ gộp thành 1 entry, dù cùng dùng chung type `ProvenanceEntry`.

Các grade đã xác thực, KHÔNG thay đổi ở phase này:

| id | confidence |
|---|---|
| `PROV-NHATTHAN-01` (rule provenance) | **A** |
| `PROV-FOUR-LESSONS-CONSTRUCTION` (calculation provenance) | **A** |
| `PROV-GANZHI-PILLAR-CONSTRUCTION` (calculation provenance) | **B** |
| `PROV-PROFILE-ZIHOUR-CONFLICTING` (calculation provenance, áp dụng có điều kiện) | **D** |

---

## 6. Confidence (Model C)

`ruleConfidence` và `calculationConfidence` là 2 field tách biệt trên cả `Signal` lẫn `RuleResult` — không bao giờ gộp thành 1 con số hay 1 field chung.

- **Không scoring số học.** Không có field số nào (score/weight/percentage) ở bất kỳ đâu trong `Signal`/`RuleResult`/`InterpretationPackage`.
- **Không weighting, không averaging.** `worstConfidence()` là so sánh THỨ HẠNG thuần tuý (A→D), không phải phép cộng/trung bình.
- **Không hidden priority.** Không có bảng ưu tiên ẩn nào quyết định rule/signal nào "quan trọng hơn".
- **`confidence_summary.overallLowestConfidence` = `null`** khi KHÔNG có signal nào triggered — đây là giá trị BẮT BUỘC trong trường hợp đó, không phải mặc định về `"A"`.

---

## 7. Kiến trúc Conflict (Option A — ĐÃ ĐÓNG BĂNG)

**Quyết định MVP: OPTION A — KHÔNG có generic conflict detection.**

Do đó: `InterpretationPackage.conflicts = []` LUÔN LUÔN, cho mọi chart.

**Đây KHÔNG PHẢI fallback. KHÔNG PHẢI lỗi. Đây là hành vi ĐÚNG của MVP dưới bằng chứng hiện có.**

Lý do (Phase 10.6.4/10.6.4A/10.6.4B): "polarity trái dấu" đã được chứng minh KHÔNG PHẢI predicate đủ — case TD-4 (`DA_LIU_REN_QUESTION_TEST_SPEC.md`) cho thấy 1 false positive cụ thể: 2 signal polarity trái dấu (玄武 xác nhận mất đồ vs 太陽照武 xác nhận trộm tự lộ) mô tả 2 khía cạnh KHÁC NHAU của CÙNG 1 lượt chiêm, không hề mâu thuẫn thật. Không có predicate thay thế nào khác được bằng chứng dự án ủng hộ đủ mạnh (quy tắc Auxiliary-vs-Core duy nhất tìm được không áp dụng được cho registry hiện tại và tự nó chưa vận hành được — xem Phase 10.6.4A). **KHÔNG có predicate xung đột nào được phát minh thay thế** — `[]` phản ánh trung thực mức bằng chứng hiện có.

---

## 8. Unresolved Items

**Quyết định MVP: `InterpretationPackage.unresolved_items = []`** khi không có phát hiện UNRESOLVED cụ thể-theo-chart nào có bằng chứng hỗ trợ.

Cụ thể: "chưa có rule nào đăng ký cho question_type này" KHÔNG được ghi thành `unresolved_item` — đây là sự thật về TIẾN ĐỘ SẢN PHẨM, không phải phát hiện DOMAIN cho riêng lá số đó (Phase 10.5 Audit #3). `verified_rules` rỗng đã tự nói lên điều đó. KHÔNG bịa `unresolved_item` cho năng lực còn thiếu trong tương lai (12 Trường Sinh, Không Vong...) — những gap đó đã bị chặn từ Level 2 (Rule Registry), không cần lặp lại ở tầng package.

---

## 9. Trạng thái Test / Validation

Ghi nhận CHÍNH XÁC trạng thái đã xác thực ở Phase 10.6.6, không phóng đại:

| Kiểm tra | Kết quả |
|---|---|
| `daliuren-engine` tests | **295/295 PASS** |
| typecheck | **PASS** |
| standalone build | **PASS** |
| full workspace build | **PASS** tại thời điểm audit cuối (Phase 10.6.6) |
| deterministic package test | **PASS** (2 lần build cùng input → deep-equal) |
| golden charts | **PASS** (xem mục 10) |
| production wiring (không qua synthetic fixture) | **PASS** — `rules/r-nhatthan-01.test.ts` + `interpretation-package-builder.test.ts` chạy qua `calculateDaLiuRenChart()` + `PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY` thật |

Không claim coverage nào vượt quá danh sách trên.

---

## 10. Golden Cases đã xác thực

Dùng đúng thuật ngữ đã có trong test suite:

- **2024-01-01 00:30** — Zi-hour (`calculationConfidence = D`)
- **2024-01-04 10:00** — normal non-Zi-hour (`calculationConfidence = B`, cả 2 trục auspicious)
- **2024-01-01 10:00** — mixed polarity (1 trục `ke`, 1 trục `sheng`)
- **2024-01-05 10:00** — tương-hoà skip (trục Can tương hoà → chỉ 1 signal)
- **UNVERIFIED questionType** (`su-nghiep`) — package rỗng (`verified_rules=[]`, `signals=[]`, `overallLowestConfidence=null`, `unresolved_items=[]`)

---

## 11. Deferred Gaps (NGOÀI PHẠM VI MVP — KHÔNG PHẢI BUG)

Các mục sau đây được hoãn lại có chủ đích — repository KHÔNG phân loại các mục này là lỗi (bug), trừ khi ghi rõ khác:

- **12 Trường Sinh** — DO_NOT_IMPLEMENT (công thức duy nhất tìm được đã bị xác nhận sai)
- **病符/Bệnh Phù** — chưa có nguồn đủ
- **空亡/Không Vong** — chưa từng được speced ở Calculation Layer
- **課體/Khóa Thể** — chỉ có tên, chưa có bảng ý nghĩa xác nhận đủ để code
- **旺衰/Vượng Suy** — công thức TÍNH có nguồn A, nhưng công thức ĐIỀU CHỈNH LỰC định lượng đã bị gỡ khỏi SPEC (phát minh riêng của 1 repo đã loại)
- **本命/Bản Mệnh, 行年/Hành Niên** — chưa implement ở Calculation Layer hiện tại
- **Conflict semantics** — xem mục 7, BLOCKED do thiếu bằng chứng, không phải thiếu công sức
- **財/鬼 cho Tài chính** — thuật ngữ chưa xác định được có cùng khung 六親 (đã loại) hay không
- **太陽照武 cho Tìm đồ** — referent "太陽" (có khả năng = 月將 theo thuật ngữ chung của Lục Nhâm) chưa xác nhận áp dụng cho đúng câu phú này
- **`CalculationProfile` dependency bên trong evaluator** — xem mục 12 (ràng buộc kiến trúc, không phải gap nội dung)

---

## 12. Ràng buộc kiến trúc đã biết (Known Architectural Constraint)

R-NHATTHAN-01 hiện dùng `CLASSICAL_V1_PROFILE` (hard-coded) khi tra provenance vùng Tý, vì chữ ký evaluator đã đóng băng là:

```ts
evaluate(calculation: DaLiuRenCalculationResult): RuleResult
```

và `DaLiuRenCalculationResult` KHÔNG mang theo `CalculationProfile` đã dùng để tính ra nó.

**Hiện tại KHÔNG BLOCKING** vì toàn bộ repository chỉ tồn tại ĐÚNG 1 `CalculationProfile` (`CLASSICAL_V1_PROFILE`) — không có cách nào tạo ra sai lệch trong wiring sản xuất hiện tại (đã xác nhận qua grep toàn bộ `src/profiles/`).

**QUY TẮC BẮT BUỘC CHO TƯƠNG LAI**: TRƯỚC KHI thêm `CalculationProfile` thứ 2 bất kỳ, kiến trúc này PHẢI được xem xét lại (hoặc mở rộng chữ ký evaluate(), hoặc chuyển việc tra provenance vùng Tý ra khỏi evaluator). KHÔNG được sửa âm thầm — phải là 1 quyết định kiến trúc tường minh của 1 phase riêng.

---

## 13. Trạng thái Git / Release

| Phase | Commit |
|---|---|
| 10.6.1 — Interpretation foundation contracts | `ce226ea013c13cf650421865ec502872a9aa7faa` |
| 10.6.2 — Rule/Evaluator Registry infrastructure | `9ea51dca25dffb4f818a07b2595f72e5c2c9e630` |
| 10.6.3 — R-NHATTHAN-01 (rule thật đầu tiên) | `5956fb62df07b806ff3a29861b2d79d69971bb21` |
| 10.6.4 / 10.6.4A / 10.6.4B — Conflict audit + architecture decision | audit-only, không commit |
| 10.6.5 — InterpretationPackage builder | `502b683868d33fed6fba1bcce8f136961f3b14e6` |
| 10.6.6 — Final integration audit | audit-only, **NO CODE CHANGE / NO COMMIT** |

Tài liệu này (Phase MVP Freeze) được tạo dưới dạng 1 file documentation-only, commit riêng (`docs(daliuren): freeze interpretation MVP`) — không gộp với bất kỳ commit code nào.

---

## 14. Ranh giới MVP

### MVP CÓ THỂ làm gì
- Tính đúng, tất định 8 field Calculation Layer đã freeze cho 1 lá số Đại Lục Nhâm (thời điểm + `CalculationProfile`).
- Đăng ký, validate, và thực thi rule luận giải qua registry đã kiểm chứng đầy đủ (Level 1 + Level 2).
- Luận đúng 1 quy tắc cổ điển confidence A (R-NHATTHAN-01, 六壬大全 卷三「日辰」) với provenance/confidence tách bạch, tất định.
- Dựng `InterpretationPackage` hoàn chỉnh, tự kiểm tra, có chartId tất định, cho bất kỳ `QuestionType` nào (rỗng đúng cách nếu không có rule áp dụng).

### MVP CHƯA THỂ làm gì
- **Không** luận theo bất kỳ quy tắc cổ điển nào khác ngoài R-NHATTHAN-01.
- **Không** phát hiện hay giải quyết xung đột giữa các signal (Option A — xem mục 7).
- **Không** có Không Vong, Khóa Thể, Vượng Suy (ý nghĩa), 12 Trường Sinh, Bản Mệnh/Hành Niên.
- **Không** có bảng dụng thần/loại thần theo từng question_type.
- **Không** tổng hợp thành 1 kết luận cát/hung bằng văn xuôi (đó là việc của Tầng 3/AI, chưa xây).
- **Không** hỗ trợ quá 1 `CalculationProfile` một cách an toàn (xem mục 12).

Đây KHÔNG PHẢI 1 công cụ luận giải Đại Lục Nhâm hoàn chỉnh — đây là 1 nền tảng (foundation) đã đóng băng, đúng, có thể kiểm chứng, và có thể MỞ RỘNG AN TOÀN.

---

## 15. Định hướng Phase tương lai

Liệt kê THUẦN TUÝ dựa trên các gap đã ghi nhận ở mục 11-12 — KHÔNG xếp hạng ưu tiên (repository chưa có thứ tự ưu tiên chính thức nào cho các mục này):

- Nghiên cứu bổ sung + implement thêm rule cổ điển confidence A/B khác (theo đúng kỷ luật bằng chứng đã dùng cho R-NHATTHAN-01).
- Đóng gap 財/鬼 (Tài chính) và 太陽照武 (Tìm đồ) bằng cách đọc trực tiếp nguyên văn 畢法賦 liên quan.
- Thiết kế lại (nếu có bằng chứng mới) predicate xung đột signal — CHỈ khi có ≥1 cặp rule thật có bằng chứng cổ điển cụ thể.
- Giải quyết ràng buộc `CalculationProfile`-trong-evaluator TRƯỚC KHI thêm profile thứ 2.
- Không Vong, Khóa Thể, Vượng Suy (ý nghĩa), Bản Mệnh/Hành Niên — mỗi mục cần 1 vòng audit riêng trước khi implement, đúng kỷ luật đã áp dụng xuyên suốt dự án.

---

## 16. Tuyên bố Freeze

```
CONG TAIYI DA LIU REN INTERPRETATION MVP

STATUS:
MVP VERIFIED WITH NON-BLOCKING GAPS

FREEZE:
READY

FREEZE MEANING:
Pipeline Calculation + Interpretation hiện tại nhất quán nội bộ, đã test, tất định,
có ý thức provenance, và phù hợp làm baseline MVP đã đóng băng.

FREEZE KHÔNG CÓ NGHĨA:
Đã luận giải cổ điển đầy đủ (complete classical coverage).

Mọi công việc tính năng trong tương lai PHẢI bắt đầu từ baseline đã đóng băng này và
KHÔNG được âm thầm thay đổi ngữ nghĩa Calculation hoặc Interpretation hiện có.
```
