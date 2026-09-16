# CONG TAIYI — Đại Lục Nhâm — Phase 11 Decision Brief

Tài liệu AUDIT/RESEARCH/PLANNING thuần tuý — viết SAU khi MVP đã đóng băng
(`docs/daliuren/DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`, freeze commit
`5b21b1e0f88233500e61607b9c76687e2c5df539`). **Không có dòng code sản xuất nào bị sửa để tạo
tài liệu này.** Mục tiêu: cung cấp đủ bằng chứng để chủ dự án TỰ chọn hướng đi Phase 11 —
tài liệu này KHÔNG xếp hạng, KHÔNG chọn hộ.

Baseline đông cứng được coi là BẤT BIẾN trong toàn bộ tài liệu này — mọi quyết định trước đó
chỉ bị diễn giải lại nếu có bằng chứng repository cho thấy MÂU THUẪN, không phải vì "có vẻ nên
làm khác đi".

---

## 1. Baseline đông cứng hiện tại

Đọc lại `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` — xác nhận đúng trạng thái đã ghi:
`calculateDaLiuRenChart() → DaLiuRenCalculationResult (8 field) → ValidatedRuleRegistry (1 rule:
R-NHATTHAN-01) → InterpretationPackage builder (conflicts=[] cố định, Option A)`. 295/295 test,
typecheck/build sạch tại thời điểm freeze. Không diễn giải lại bất kỳ quyết định nào ở đây.

---

## 2. Kiểm kê trạng thái hiện tại

Phân loại đúng 6 nhãn được phép: **IMPLEMENTED + VERIFIED**, **PARTIALLY IMPLEMENTED**,
**CONTRACT ONLY**, **DEFERRED**, **BLOCKED BY RESEARCH**, **BLOCKED BY ARCHITECTURE**.

### A. Calculation Layer
| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| `calendar`/`monthGeneral`/`dayNight`/`nobleSpirit`/`heavenEarthPlate`/`fourLessons`/`threeTransmissions`/`twelveGenerals` (8 field freeze) | **IMPLEMENTED + VERIFIED** | Phase 9A-9E, freeze Phase 9F |
| `keType` (課體) | **CONTRACT ONLY** | Type `KeType` tồn tại (`types/ke-type.ts`) — `primary.method` là ánh xạ 1-1 từ `NineMethod` ĐÃ CÓ, chưa viết hàm map |
| `voidBranches` (空亡) | **CONTRACT ONLY** | Type tồn tại, confidence B (tính) — chưa có hàm compute |
| `wangShuai` (旺衰) | **CONTRACT ONLY** | Type tồn tại, confidence A cho công thức TÍNH — chưa có hàm compute |
| `shenSha` (神煞, 驛馬) | **PARTIALLY IMPLEMENTED** | `computeYiMa()` (`yi-ma/compute.ts`) ĐÃ implement + verify, nhưng CHỈ dùng NỘI BỘ bởi `nine-methods` (返吟) — CHƯA lộ ra như field top-level của `DaLiuRenCalculationResult` |
| `benMing`/`xingNian` (本命/行年) | **CONTRACT ONLY** | Type tồn tại, confidence B cho cả 2 công thức, CHƯA cross-check giữa công thức modulo (D) và date-probe (A) |
| 12 Trường Sinh | **BLOCKED BY RESEARCH** | KHÔNG có type/contract nào tồn tại — công thức duy nhất tìm được (repo D, kiểu Bát Tự) đã bị XÁC NHẬN SAI; nguồn thay thế (report-G, "Ngũ Hành không đảo chiều") chỉ confidence C |

### B. Interpretation Layer
| Thành phần | Trạng thái |
|---|---|
| Rule contract (`RuleDefinition`, `dependencies`) | **IMPLEMENTED + VERIFIED** |
| Evaluator contract + registry | **IMPLEMENTED + VERIFIED** |
| R-NHATTHAN-01 (rule production duy nhất) | **IMPLEMENTED + VERIFIED** (phạm vi hẹp — chỉ 4 vế đồng-trục, xem freeze doc mục 4) |
| Rule khác (bất kỳ) | **DEFERRED** — không có rule production thứ 2 nào tồn tại |
| Conflict detection | **BLOCKED BY RESEARCH** (Option A, Phase 10.6.4A — không phải thiếu công sức, thiếu bằng chứng) |
| SYNTHESIS (tổng hợp thành 1 kết luận) | **BLOCKED BY ARCHITECTURE** — `DA_LIU_REN_INTERPRETATION_GAPS.md` mục 3 xác nhận: không có công thức trọng số nào cổ thư cung cấp; thiết kế hiện tại CHỦ ĐÍCH đẩy bước này sang Tầng 3 (AI, chưa xây) |

### C. Provenance Layer
**IMPLEMENTED + VERIFIED** — 2 không gian id tách biệt (rule vs calculation), mọi id referenced đều resolve, self-validate trong builder.

### D. Confidence Layer
**IMPLEMENTED + VERIFIED** — Model C (`ruleConfidence`/`calculationConfidence` tách biệt), `worstConfidence()` rank-only, `overallLowestConfidence` = `null` khi rỗng.

### E. QuestionType gating
**IMPLEMENTED + VERIFIED** cho Level 1 (`questionTypeAllowsRules`) + Level 2 (`dependencies` capability check). **Trạng thái từng `QuestionType` cụ thể** (READY/PARTIAL/UNVERIFIED) — xem mục 3B, nhiều loại vẫn **PARTIALLY IMPLEMENTED**/**BLOCKED BY RESEARCH** do phụ thuộc calculation chưa có.

### F. Rule Registry
**IMPLEMENTED + VERIFIED** — `buildRuleRegistry`, tự validate tại import time, đúng 1 rule.

### G. Evaluator Registry
**IMPLEMENTED + VERIFIED** — `buildEvaluatorRegistry`, completeness 1-1.

### H. Output / InterpretationPackage
**IMPLEMENTED + VERIFIED** cho shape hiện tại. **`conflicts`**: BLOCKED BY RESEARCH (luôn `[]`, có chủ đích). **`unresolved_items`**: IMPLEMENTED (luôn `[]` ở v1, đúng quyết định Phase 10.5).

### I. Validation / test coverage
**IMPLEMENTED + VERIFIED** — 295/295, production wiring qua golden chart thật, không synthetic-only cho phần rule thật.

### J. Deferred gaps đã biết
Xem mục 3A/3B chi tiết từng mục; danh sách gốc đã có trong freeze doc mục 11.

---

## 3. Ba hướng Phase 11

### A — CALCULATION EXPANSION

| Candidate | 漢字 | Trạng thái repo | Contract? | Implementation? | Provenance | Validation | Dependencies | Bằng chứng cổ điển đủ? | Có phá vỡ MVP đông cứng? | Impact |
|---|---|---|---|---|---|---|---|---|---|---|
| Khóa Thể (chính) | 課體 | CONTRACT ONLY | Có (`KeType`) | Không | B (10 loại) | Chưa | `ThreeTransmissions.method` (ĐÃ CÓ) | Đủ cho `primary` (ánh xạ 1-1, không cần dữ liệu mới) | KHÔNG — field mới, thêm vào type MỚI (không phải `DaLiuRenCalculationResult` hiện tại) | **LOW** |
| Khóa Thể — 元首/重審/知一 (zeikeVariant) | 元首/重審/知一 | CONTRACT ONLY | Có (field optional) | Không | **C** (1 nguồn — repo D) | Chưa | — | **KHÔNG đủ** — cần thêm nguồn độc lập | KHÔNG | **LOW** (nhưng research-gated) |
| Khóa Thể phụ | 鑄印/軒蓋/連珠… | DO_NOT_IMPLEMENT | Có (type, mảng PHẢI rỗng) | Không | D | Chưa | — | **KHÔNG** — chỉ biết tên | KHÔNG | N/A — bị cấm |
| Không Vong | 空亡 | CONTRACT ONLY | Có (`VoidBranches`) | Không | B (tính) / A (ý nghĩa theo vị trí Tam Truyền, Tầng 2) | Chưa | `calendar.dayPillar` + `threeTransmissions` positions (ĐÃ CÓ) | Đủ cho FACT (2 chi Không Vong + cờ vị trí) | KHÔNG — xác nhận KHÔNG ảnh hưởng lựa chọn Cửu Tông Môn (đã audit trực tiếp, ghi trong chính type file) | **LOW-MEDIUM** |
| Vượng Suy (TÍNH) | 旺相休囚死 | CONTRACT ONLY | Có (`WangShuai`) | Không | **A** (lý thuyết Ngũ Hành phổ quát) | Chưa | `calendar.monthPillar` (Ngũ Hành nguyệt lệnh) | Đủ | KHÔNG | **LOW-MEDIUM** |
| Vượng Suy (điều chỉnh lực định lượng) | — | **ĐÃ GỠ KHỎI SPEC vĩnh viễn** | Không, cố ý không có field | Không | D, nguồn đã loại (phát minh riêng repo E) | — | — | **KHÔNG** | N/A — bị cấm | N/A |
| Bản Mệnh/Hành Niên | 本命/行年 | CONTRACT ONLY | Có (`BenMing`/`XingNian`) | Không | B cho cả 2 công thức | **Chưa cross-check 2 công thức** (modulo vs date-probe) | `birthDate`/`gender` (đã optional trên `ChartInput`) — **input MỚI cần thiết ở runtime, không chỉ tính từ dữ liệu đã có** | Đủ để bắt đầu, nhưng cần validation trước khi lên A | KHÔNG, nhưng là field CÓ ĐIỀU KIỆN (chỉ có khi `birthDate`) — cần quyết định rõ shape output khi thiếu | **MEDIUM** |
| Thần sát — 驛馬 (lộ ra top-level) | 驛馬 | **PARTIALLY IMPLEMENTED** | Có (`ShenShaPlacement`) | **CÓ** (`computeYiMa`, nội bộ) | B | Đã có test nội bộ (nine-methods), chưa có test cho top-level exposure | Không cần tính lại — chỉ cần LỘ RA | Đủ | KHÔNG — chỉ thêm field, không đổi field cũ | **LOW** |
| 12 Trường Sinh | 十二長生 | **BLOCKED BY RESEARCH** | **KHÔNG** — không tồn tại type nào | Không | C (nguồn thay thế) / D (nguồn D bị bác) | Không | — | **KHÔNG** — nguồn duy nhất khớp bị phản chứng | N/A | N/A — cần 1 vòng nghiên cứu riêng trước khi có bất kỳ contract nào |
| 帘幕貴人 (Liêm Mạc Quý Nhân, phát hiện phụ) | 帘幕貴人 | **BLOCKED BY RESEARCH** | Không | Không | A cho Ý NGHĨA (毕法赋 pháp 3), **công thức TÍNH chưa từng được audit** | Không | — | Ý nghĩa đủ, CÔNG THỨC TÍNH thì KHÔNG | N/A | Cần 1 vòng audit công thức tính riêng — đây là lý do `thi-cu` (考试) đang PARTIAL, không phải READY |

Không có candidate nào trong bảng trên được implement ở phase này.

### B — CLASSICAL INTERPRETATION EXPANSION

| Candidate | Nguồn cổ điển | Vị trí nguồn | Dependency chính xác | Field Calculation cần | Provenance cần | Confidence | QuestionType ảnh hưởng | Ngữ nghĩa tất định đủ rõ? | Cần conflict semantics? | Cô lập được thành 1 signal độc lập? | Rủi ro | Research gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Quan chức — 前引後從格 | 毕法赋 pháp 1 | 卷九 | `threeTransmissions.{initial,final}` vs `calendar.dayPillar.can` | Có sẵn trong 8 field freeze | Cần entry mới (chưa viết) | A | quan-chuc (READY) | Có — "Sơ truyền trước/sau Can" là quan hệ vị trí rõ ràng | Không bắt buộc (rule độc lập) | Có | LOW | Không — sẵn sàng đặc tả |
| Hôn nhân — Thiên Hậu/Lục Hợp | 毕法赋 pháp 40 | 卷九 | `twelveGenerals` tại vị trí `dayPillar.{can,chi}` | Có sẵn | Cần entry mới | A | hon-nhan (READY) | Có | Không bắt buộc | Có | LOW | Không |
| Tìm đồ — 遙克/昴星 + Huyền Vũ | 毕法赋 pháp 35 | 卷九 | `threeTransmissions.method` + `twelveGenerals` (Huyền Vũ tại Sơ truyền) | Có sẵn | Cần entry mới | A | tim-do (READY) | Có | Không bắt buộc | Có | LOW | Không |
| Tìm đồ — 太陽照武 (bổ trợ) | 毕法赋 pháp 39 | 卷九 | Chưa xác định "太陽" trỏ tới field nào | **CHƯA XÁC ĐỊNH** | — | A (cho câu chữ), **UNRESOLVED** (cho referent) | tim-do | **KHÔNG** — referent chưa xác nhận (có khả năng = `monthGeneral`, nhưng CHƯA CÓ nguồn xác nhận áp dụng đúng câu phú này, xem Phase 10.3 mục 4) | Không rõ | Không rõ cho tới khi resolve referent | MEDIUM | **Có — đọc lại nguyên văn xung quanh pháp 39** |
| Kiện tụng — 2 rule phụ (鬼臨三四, 刑) | 毕法赋 pháp 70, 75 | 卷九 | `fourLessons` + quan hệ 刑 (Tam Hình, chưa có `SignalRelation` value) | Có sẵn (trừ 刑 relation) | Cần entry mới | A | kien-tung (PARTIAL) | Phần lớn có, 刑 relation cần thêm 1 giá trị vào `SignalRelation` (thay đổi contract nhỏ) | Không bắt buộc | Có | LOW-MEDIUM | Nhỏ — cần xác nhận `SignalRelation` đủ hay cần mở rộng |
| Kiện tụng — rule chính (Mộ Thần khắc Quý Nhân) | 毕法赋 pháp 43 | 卷九 | 12 Trường Sinh (Mộ Thần) | **KHÔNG CÓ** | — | A (ý nghĩa), nhưng phụ thuộc thành phần DO_NOT_IMPLEMENT | kien-tung | Không — chặn bởi 3A | — | Không | — | **Phụ thuộc 3A (12 Trường Sinh) trước** |
| Sức khỏe — rule chính (Mộ Thần + Bạch Hổ) | 毕法赋 pháp 61 | 卷九 | 12 Trường Sinh | **KHÔNG CÓ** | — | A, chặn bởi cùng lý do trên | suc-khoe | — | — | — | — | **Phụ thuộc 3A** |
| Sức khỏe — rule phụ (giới tính→用神) | 六壬大全 卷三 | 卷三 | `twelveGenerals` (Bạch Hổ/Thiên Hậu/Đằng Xà) + `ChartInput.gender` | Có sẵn nhưng `gender` KHÔNG nằm trong 8 field freeze — cần đưa vào dependency như `externalContext` | Cần entry mới | A | suc-khoe (PARTIAL) | Có | Không bắt buộc | Có | LOW | Cần quyết định: `gender` có nên trở thành 1 `ExternalContextId` mới hợp lệ, hay tiếp tục bị Level 2 chặn |
| Tài chính — 傳財化鬼/傳鬼化財 | 毕法赋 pháp 14, 27, 28 | 卷九 | `threeTransmissions` + Ngũ-Hành-tương-đối-Can (財/鬼) | Có sẵn về mặt tính toán | Cần entry mới | A (câu phú), nhưng **thuật ngữ 財/鬼 CHƯA xác định** có trùng khung 六親 đã loại hay không | tai-chinh (PARTIAL) | **KHÔNG** — Phase 10.6.4A/Phase 10.3 để ngỏ | Không rõ | Không rõ | MEDIUM | **Có — đọc trực tiếp 畢法賦 卷九-十 nguyên văn xem 財/鬼 định nghĩa thế nào tại chỗ** |
| Thi cử — 帘幕貴人 lâm niên mệnh/Can | 毕法赋 pháp 3 | 卷九 | 帘幕貴人 (chưa có công thức tính) + có thể cần `benMing`/`xingNian` | **KHÔNG CÓ** (công thức tính) | — | A (ý nghĩa), chặn bởi thiếu công thức tính | thi-cu (PARTIAL) | — | — | — | — | **Phụ thuộc 3A (帘幕貴人)** |

Không rule nào ở bảng trên được implement ở phase này. Không có nội dung cổ điển nào bị bịa thêm.

### C — APP / API INTEGRATION

**Phát hiện quan trọng nhất (evidence, không phải giả định)**: đã tồn tại 1 route thật —
`src/pages/api/dai-luc-nham.ts` — NHƯNG route này gọi `calculateCalendarFoundation()` (facade
Phase 8, chỉ 4 field: Lịch pháp/Nguyệt Tướng/Ngày-Đêm/Quý Nhân), **KHÔNG PHẢI**
`calculateDaLiuRenChart()` (8 field, Phase 9E) và **KHÔNG hề gọi** `buildInterpretationPackage()`
(Phase 10.6.5). Route này là di sản Phase 8C, chưa từng được cập nhật theo pipeline đã đóng
băng — đây là 1 GAP TÍCH HỢP có thật, không phải giả thuyết.

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Public facade | Tồn tại, ổn định (`calculateDaLiuRenChart`, `buildInterpretationPackage`) | Cả 2 đã export qua `src/index.ts` |
| Input contract | `ChartInput` (date/hour/minute?/timeZone/gender?/birthDate?/calculationProfileId?) + `CalculationProfile` | `calculationProfileId` KHAI BÁO trên `ChartInput` nhưng **facade không thực sự đọc field này** (profile luôn truyền tay qua tham số thứ 2) — gap nhỏ, có thể gây hiểu lầm cho người tích hợp |
| Output contract | `EngineResult<DaLiuRenCalculationResult>` (calculation) + `InterpretationPackage` (interpretation) | Ổn định, JSON-serializable (đã có test round-trip ở `serialization.test.ts`) |
| Error boundary | `EngineResult.ok`/`errors[]`, `DaLiuRenValidationError` với `code` ổn định | Rõ ràng, không silent fallback |
| Deterministic chartId | `buildChartId()` — SHA-256, tách biệt khỏi output | Sẵn sàng cho API caching/dedup |
| Serialization | JSON-safe, đã test | Sẵn sàng |
| Provenance representation | `Record<string, ProvenanceEntry>`, đầy đủ | Sẵn sàng |
| Confidence representation | `Confidence \| null`, không số | Sẵn sàng, KHÔNG có rủi ro bị API tầng trên hiểu nhầm là % |
| QuestionType handling | `QuestionType` union 16 giá trị, `buildInterpretationPackage` nhận trực tiếp | Sẵn sàng, nhưng CHỈ 1 questionType nào cho kết quả khác rỗng (`R-NHATTHAN-01` universal, nên MỌI question_type hợp lệ đều trả cùng 1 rule) |
| Registry initialization | `PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY` tự validate tại import time | An toàn cho serverless cold-start (throw sớm, không throw giữa request) |
| Profile dependency | Chỉ `CLASSICAL_V1_PROFILE` tồn tại | Xem mục 8 |
| Package validation | Tự động bên trong `buildInterpretationPackage` | Sẵn sàng |
| Testability | Cao — mọi hàm thuần, không I/O | Sẵn sàng |
| API stability | Chưa có SemVer/versioning chính thức cho package `@thien-anh/daliuren-engine` (vẫn `0.1.0`) | Ngoài phạm vi engine, thuộc quy ước monorepo chung |

**Integration blockers (phải giải quyết TRƯỚC KHI tích hợp đầy đủ)**: KHÔNG có blocker kỹ
thuật nào ở tầng engine — API contract đã ổn định, tất định, self-validating.

**Non-blocking integration tasks (việc CẦN LÀM nhưng KHÔNG chặn về mặt kiến trúc engine)**:
route `dai-luc-nham.ts` cần được viết lại để gọi đúng pipeline đã đóng băng (`calculateDaLiuRenChart`
+ `buildInterpretationPackage`); cần quyết định route trả `DaLiuRenCalculationResult` thô,
`InterpretationPackage`, hay cả 2; cần quyết định `questionType` lấy từ đâu (query param mới,
hiện chưa có). Đây là việc App/API, KHÔNG phải việc engine — không thực hiện ở phase này.

---

## 4. Ma trận so sánh trung lập (KHÔNG xếp hạng)

| Hướng | Độ sẵn sàng hiện tại | Dependency chính | Blocker chính | Cần nghiên cứu? | Impact kiến trúc | Rủi ro cho MVP đông cứng | Loại deliverable |
|---|---|---|---|---|---|---|---|
| A — Calculation Expansion | Contract đã có cho 5/6 candidate chính; 12 Trường Sinh không có contract | `ThreeTransmissions`/`calendar` đã có (cho 課體/空亡/旺衰); `birthDate`/`gender` input (cho 本命/行年) | 12 Trường Sinh: nguồn cổ điển mâu thuẫn/yếu | Có, mức độ khác nhau theo candidate | LOW→MEDIUM (đa số), N/A cho 12 Trường Sinh (research trước) | Thấp — mọi field mới đều ADDITIVE, không sửa 8 field freeze | Type mới + hàm `compute*` mới + test + provenance entry |
| B — Interpretation Expansion | 3 rule (quan-chuc/hon-nhan/tim-do chính) có đủ bằng chứng để đặc tả ngay; nhiều rule khác bị chặn bởi 3A | Phụ thuộc TRỰC TIẾP vào 1 số candidate của hướng A (kiện tụng/sức khỏe/thi cử chính) | 12 Trường Sinh, 帘幕貴人 (đều thuộc hướng A); 財/鬼 và 太陽照武 cần đọc lại nguyên văn | Có | LOW cho rule độc lập; đổi `SignalRelation` (nhỏ) nếu thêm 刑 | Thấp nếu theo đúng kỷ luật đã dùng cho R-NHATTHAN-01; registry/evaluator infra đã sẵn sàng chịu tải thêm rule | Rule mới (RuleDefinition + Provenance + Evaluator + test), theo khuôn R-NHATTHAN-01 |
| C — App/API Integration | Engine contract đã ổn định, route hiện có (`dai-luc-nham.ts`) đã LỖI THỜI (gọi facade Phase 8) | Không phụ thuộc A hay B — có thể tích hợp NGAY với đúng 1 rule hiện có | Không có blocker kiến trúc; chỉ là việc viết lại route | Không cần nghiên cứu domain, chỉ cần quyết định sản phẩm (route trả gì) | LOW — hoàn toàn ở tầng App, không đụng engine | Thấp nhất trong 3 hướng — engine không đổi gì | Route/API code (ngoài package `daliuren-engine`) |

---

## 5. Đề xuất Work Package (CHỈ đề xuất, KHÔNG thực thi)

### 11.A — Calculation Expansion
- **11.A.1 — Audit/Contract**: rà lại chính xác từng candidate ở mục 3A, xác nhận contract hiện có (đã có ở phần lớn) còn thiếu gì.
  - *Tiên quyết*: không có. *Sản phẩm*: bảng gap chi tiết hơn mục 3A. *Tiêu chí xong*: mọi field trong `KeType`/`VoidBranches`/`WangShuai`/`BenMing`/`XingNian` có 1 dòng "sẵn sàng implement" hoặc "cần nghiên cứu thêm" rõ ràng. *Ngoài phạm vi*: viết hàm `compute*` bất kỳ.
- **11.A.2 — Research Closure**: đọc lại nguyên văn cho 12 Trường Sinh + 帘幕貴人 công thức tính + zeikeVariant nguồn thứ 2.
  - *Tiên quyết*: 11.A.1. *Sản phẩm*: report mới trong `research/` hoặc cập nhật report cũ. *Tiêu chí xong*: mỗi mục có kết luận CONFIDENCE rõ ràng (kể cả kết luận "vẫn không đủ"). *Ngoài phạm vi*: implement.
- **11.A.3 — Implementation**: viết `compute*` cho các mục đã đủ bằng chứng (課體 primary, 空亡, 旺衰 TÍNH, lộ `shenSha` top-level, 本命/行年 sau cross-check).
  - *Tiên quyết*: 11.A.1 (+11.A.2 cho riêng zeikeVariant/12 Trường Sinh nếu muốn mở rộng thêm). *Sản phẩm*: module mới theo đúng pattern `four-lessons/`/`twelve-generals/`. *Tiêu chí xong*: test + provenance + KHÔNG sửa 8 field freeze (chỉ thêm field/type mới). *Ngoài phạm vi*: sửa `DaLiuRenCalculationResult` hiện tại thay vì tạo type mới (đúng nguyên tắc đã áp dụng từ Phase 9E).
- **11.A.4 — Validation**: cross-check 本命/行年 (modulo vs date-probe), test biên cho 空亡/旺衰.
- **11.A.5 — Freeze**: đóng băng phần Calculation MỞ RỘNG như 1 checkpoint mới, tương tự Phase 9F.

### 11.B — Interpretation Expansion
- **11.B.1 — Audit/Contract**: xác nhận Signal/RuleDefinition contract đủ cho từng rule candidate (đặc biệt: có cần thêm giá trị `SignalRelation` cho 刑 không).
- **11.B.2 — Research Closure**: đọc lại 畢法賦 cho 財/鬼 (tai-chinh) và 太陽照武 (tim-do) — CHỈ 2 mục này còn treo trong số các candidate đã liệt kê.
- **11.B.3 — Implementation**: viết rule mới theo ĐÚNG khuôn R-NHATTHAN-01 (RuleDefinition data-only + Provenance + evaluator thuần + registration), MỖI rule 1 module riêng dưới `src/rules/`.
- **11.B.4 — Validation**: test qua golden chart thật (không fabricate), giống `r-nhatthan-01.test.ts`.
- **11.B.5 — Freeze**: đóng băng batch rule mới, cập nhật `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` hoặc tài liệu freeze kế tiếp.

### 11.C — App/API Integration
- **11.C.1 — Audit/Contract**: xác nhận chính xác route `dai-luc-nham.ts` hiện tại làm gì (đã làm ở mục 3C).
- **11.C.2 — Research Closure**: KHÔNG áp dụng — đây là quyết định sản phẩm (route trả field nào), không phải nghiên cứu cổ điển.
- **11.C.3 — Implementation**: viết lại route gọi `calculateDaLiuRenChart` + `buildInterpretationPackage`, quyết định `questionType` lấy từ đâu.
- **11.C.4 — Validation**: test route (ngoài phạm vi `daliuren-engine` package, thuộc site chính).
- **11.C.5 — Freeze**: không áp dụng theo nghĩa "đóng băng nghiên cứu" — đây là release app bình thường.

---

## 6. Đồ thị phụ thuộc (dependency-oriented)

```
Calculation capability (課體 primary)     → CHỈ cần: ThreeTransmissions.method (ĐÃ CÓ)
Calculation capability (空亡)             → CHỈ cần: calendar.dayPillar + threeTransmissions positions (ĐÃ CÓ)
Calculation capability (旺衰 TÍNH)        → CHỈ cần: calendar.monthPillar (ĐÃ CÓ)
Calculation capability (shenSha lộ ra)    → CHỈ cần: computeYiMa() (ĐÃ CÓ, chỉ cần export)
Calculation capability (本命/行年)         → CẦN: birthDate/gender (input mới) + cross-check 2 công thức
Calculation capability (12 Trường Sinh)   → CẦN: 1 vòng nghiên cứu classical mới, KHÔNG có gì để implement ngay

Interpretation rule (quan-chuc/hon-nhan/tim-do chính) → KHÔNG phụ thuộc calculation mở rộng nào — dùng thẳng 8 field freeze
Interpretation rule (kien-tung rule chính, suc-khoe rule chính) → PHỤ THUỘC 12 Trường Sinh (chưa có)
Interpretation rule (thi-cu) → PHỤ THUỘC 帘幕貴人 công thức tính (chưa có)
Interpretation rule (tai-chinh) → PHỤ THUỘC nghiên cứu thuật ngữ (財/鬼), KHÔNG phụ thuộc calculation mới
Interpretation rule (tim-do 太陽照武, bổ trợ) → PHỤ THUỘC nghiên cứu referent "太陽", CÓ THỂ không cần calculation mới nếu referent = monthGeneral (đã có)

App/API Integration → KHÔNG phụ thuộc Calculation Expansion hay Interpretation Expansion — có thể làm SONG SONG hoặc TRƯỚC cả 2 hướng kia, dùng đúng 1 rule hiện có
```

**Kết luận quan trọng (dựa trên bằng chứng, không giả định)**: KHÔNG PHẢI mọi gap Interpretation
đều cần Calculation mở rộng trước. 3/8 rule candidate ở mục 3B (quan-chuc, hon-nhan, tim-do
chính) dùng được NGAY với 8 field đã freeze — chỉ 2/8 (kien-tung, suc-khoe rule chính, thi-cu)
thực sự bị chặn bởi Calculation Expansion (cụ thể là 12 Trường Sinh/帘幕貴人).

---

## 7. Quy tắc an toàn cho MVP đông cứng (Phase 11)

Áp dụng cho MỌI hướng được chọn:

1. Ngữ nghĩa Calculation hiện có (8 field freeze) PHẢI giữ nguyên trừ khi có 1 quyết định breaking change được duyệt CHÍNH THỨC, riêng biệt.
2. Hành vi R-NHATTHAN-01 hiện có PHẢI giữ nguyên (không mở rộng sang vế hợp-trục/chéo-trục mà không có phase riêng).
3. Grade provenance hiện có (`PROV-NHATTHAN-01`=A, `PROV-FOUR-LESSONS-CONSTRUCTION`=A, `PROV-GANZHI-PILLAR-CONSTRUCTION`=B, `PROV-PROFILE-ZIHOUR-CONFLICTING`=D) KHÔNG được âm thầm đổi.
4. Ngữ nghĩa Confidence (Model C, không scoring) PHẢI giữ nguyên.
5. `conflicts` Option A (`[]` cố định) giữ nguyên cho tới khi có 1 phase RIÊNG duyệt lại — quyết định này KHÔNG được xét lại ngầm trong lúc làm việc khác.
6. File untracked lịch sử từ các phase trước (Phase 9A-9E) KHÔNG được vô tình stage.
7. Thay đổi KHÔNG liên quan ở `astrology-core` KHÔNG được đụng tới.

**Yêu cầu regression bắt buộc**: mọi implementation Phase 11 PHẢI chứng minh bộ test regression MVP đông cứng (295 test hiện tại) VẪN XANH trước khi coi là hoàn thành — không có ngoại lệ.

---

## 8. Kiến trúc Profile

Ràng buộc đã biết (freeze doc mục 12): R-NHATTHAN-01 dùng `CLASSICAL_V1_PROFILE` hard-code vì
`evaluate(calculation)` không nhận `CalculationProfile`.

- **Vì sao hiện KHÔNG blocking**: đã xác nhận (grep toàn bộ `src/profiles/`) chỉ tồn tại ĐÚNG 1
  `CalculationProfile` trong toàn repository — không có cách nào tạo ra sai lệch trong wiring
  sản xuất hiện tại.
- **Điều gì sẽ vỡ/mơ hồ nếu có profile thứ 2**: bất kỳ evaluator nào (kể cả R-NHATTHAN-01 hiện
  tại) cần tra `ziHourDayBoundary`/quyết định phụ thuộc profile sẽ ÂM THẦM dùng sai profile nếu
  `calculation` được tính từ 1 profile khác `CLASSICAL_V1_PROFILE` — không có cơ chế nào phát
  hiện sai lệch này ở runtime hiện tại.
- **Các lựa chọn kiến trúc tồn tại (liệt kê, KHÔNG chọn)**:
  (a) mở rộng chữ ký `evaluate()` để nhận thêm profile identity — ảnh hưởng MỌI evaluator hiện
  có và tương lai, vi phạm "Model A" đã đóng băng, cần 1 quyết định kiến trúc riêng;
  (b) chuyển việc tra provenance phụ-thuộc-profile ra khỏi evaluator, sang tầng
  `buildInterpretationPackage` (vốn ĐÃ có quyền truy cập input/profile) — evaluator chỉ trả
  facts thô, builder tự gắn provenance theo profile thật đã dùng;
  (c) giữ nguyên, chấp nhận giới hạn 1-profile vĩnh viễn cho tới khi có nhu cầu thật.
- **Có cần giải quyết TRƯỚC Phase 11 Calculation Expansion không?** KHÔNG bắt buộc — không
  candidate nào ở mục 3A cần `CalculationProfile` thứ 2. Chỉ trở thành bắt buộc NẾU 1 phase
  tương lai chủ động thêm profile mới (vd 1 trường phái tính khác).
- **Có thể tiếp tục hoãn không?** CÓ, an toàn, với điều kiện: bất kỳ ai thêm profile thứ 2 PHẢI
  đọc mục này trước.

Không có giải pháp nào được implement ở đây.

---

## 9. Phân loại Research Gap (bắt buộc tách 5 loại)

**A. Thiếu implementation repo** (đã CÓ đủ bằng chứng, chỉ chưa viết code):
課體 (primary), 空亡, 旺衰 (TÍNH), `shenSha` lộ top-level, quan-chuc/hon-nhan/tim-do (rule chính).

**B. Thiếu bằng chứng cổ điển** (chưa có nguồn đủ mạnh, KHÔNG PHẢI vấn đề code):
12 Trường Sinh (nguồn khớp chỉ C, nguồn D bị phản chứng), Khóa Thể phụ (chỉ biết tên), 財/鬼 cho
tài chính (chưa xác định có trùng 六親 hay không), 太陽照武 cho tìm đồ (referent chưa xác nhận).

**C. Thiếu ngữ nghĩa tất định** (có domain evidence nhưng chưa đủ RÕ RÀNG để lập trình không cần đoán):
Conflict predicate (Option A — TD-4 đã bác bỏ predicate duy nhất từng đề xuất); bước SYNTHESIS
(cổ thư không cho công thức trọng số).

**D. Thiếu validation/cross-check** (có ≥2 công thức nhưng chưa xác nhận chúng khớp nhau):
本命/行年 (modulo vs date-probe).

**E. Giới hạn kiến trúc** (không phải thiếu bằng chứng, mà là ràng buộc kỹ thuật của chính contract):
`CalculationProfile` không lọt vào `evaluate()` (mục 8); `gender` không phải 1 field trong 8
field freeze nên hiện bị Level 2 coi là `externalContext` cấm (ảnh hưởng rule phụ của suc-khoe).

Không mục nào ở trên bị mô tả sai thành "việc code" nếu bản chất là A/B/C/D/E khác.

---

## 10. Trạng thái sẵn sàng Phase 11 theo từng hướng

- **A — Calculation Expansion**: **NEEDS RESEARCH CLOSURE** cho 12 Trường Sinh/帘幕貴人/zeikeVariant; **READY FOR DETAILED SPEC** cho Khóa Thể (primary)/Không Vong/Vượng Suy (TÍNH)/驛馬 lộ ra; **NEEDS ARCHITECTURE DECISION** không bắt buộc (Profile, mục 8) trừ khi phạm vi mở rộng sang 2 profile.
- **B — Interpretation Expansion**: **READY FOR DETAILED SPEC** cho quan-chuc/hon-nhan/tim-do (rule chính); **NEEDS RESEARCH CLOSURE** cho tai-chinh (財/鬼) và tim-do (太陽照武, bổ trợ); **NOT READY** cho kien-tung/suc-khoe (rule chính)/thi-cu cho tới khi hướng A đóng được 12 Trường Sinh/帘幕貴人.
- **C — App/API Integration**: **READY FOR DETAILED SPEC** — không có nghiên cứu domain nào cần đóng; chỉ cần quyết định sản phẩm (route trả gì, questionType lấy từ đâu).

Không có 1 "trạng thái tổng" duy nhất gộp cả 3 hướng.

---

## 11. DECISION INPUT FOR PROJECT OWNER

**Đã an toàn để xây ngay** (không cần nghiên cứu thêm, chỉ cần quyết định phạm vi công việc):
- Khóa Thể (primary), Không Vong, Vượng Suy (TÍNH), lộ `shenSha`/驛馬 ra top-level (hướng A).
- Rule quan-chuc/hon-nhan/tim-do (rule chính) (hướng B).
- Viết lại route `dai-luc-nham.ts` để gọi đúng pipeline đã đóng băng (hướng C).

**Cần nghiên cứu trước khi code**:
- 12 Trường Sinh (nguồn cổ điển yếu/mâu thuẫn) — chặn kien-tung/suc-khoe rule chính.
- 帘幕貴人 công thức tính (ý nghĩa đã có, công thức chưa từng audit) — chặn thi-cu.
- 財/鬼 cho tài chính, 太陽照武 cho tìm đồ — cần đọc lại nguyên văn 畢法賦.
- zeikeVariant (元首/重審/知一) nếu muốn Khóa Thể đầy đủ hơn phần primary.

**Cần quyết định kiến trúc trước** (không phải nghiên cứu domain):
- `CalculationProfile` bên trong evaluator (mục 8) — CHỈ bắt buộc nếu định thêm profile thứ 2.
- `gender` có nên trở thành 1 `ExternalContextId` hợp lệ hay tiếp tục bị chặn (ảnh hưởng 1 rule phụ của sức khỏe).
- `SignalRelation` có cần thêm giá trị `刑`/Hình hay không (ảnh hưởng 2 rule phụ của kiện tụng).

**Nên giữ nguyên đông cứng** (không động vào trong Phase 11 trừ khi có phase riêng):
- 8 field Calculation freeze, R-NHATTHAN-01 hiện có, mọi grade provenance, Model C confidence, Option A conflicts.

**Thông tin chủ dự án cần để chọn hướng tiếp theo**: mục tiêu ưu tiên là (a) MỞ RỘNG chiều sâu
tính toán (hướng A) để sau này Interpretation có nhiều nền hơn để dùng, (b) MỞ RỘNG chiều rộng
luận giải (hướng B) để có nhiều rule production hơn dùng 8 field đã có sẵn, hay (c) ĐƯA CÁI ĐÃ
CÓ ra sản phẩm thật (hướng C) trước khi mở rộng thêm bất kỳ điều gì. Cả 3 hướng đều khả thi kỹ
thuật ngay bây giờ, không hướng nào bị NOT READY hoàn toàn — sự khác biệt nằm ở LOẠI công việc
(nghiên cứu cổ văn vs. viết code tính toán vs. quyết định sản phẩm), không nằm ở mức độ sẵn sàng
kỹ thuật.

---

## Freeze / phạm vi tài liệu

Tài liệu này KHÔNG thay đổi bất kỳ trạng thái đông cứng nào đã có trong
`DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`. Không có rule mới, calculation mới, hay route mới
nào được tạo ra khi viết tài liệu này.
