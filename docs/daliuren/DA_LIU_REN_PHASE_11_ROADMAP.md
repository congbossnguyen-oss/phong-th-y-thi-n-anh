# CONG TAIYI — Đại Lục Nhâm — Phase 11 Roadmap & Dependency Decision

Tài liệu PLANNING thuần tuý, viết SAU `DA_LIU_REN_PHASE_11_DECISION_BRIEF.md`
(commit `9537799`), dựa trên baseline đông cứng `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`
(freeze commit `5b21b1e0f88233500e61607b9c76687e2c5df539`). **Không có dòng code sản xuất nào
bị sửa để viết tài liệu này.** Mục tiêu: vẽ đúng đồ thị phụ thuộc + phân loại blocker cho từng
candidate Phase 11 — KHÔNG xếp hạng, KHÔNG chọn hộ.

**Sửa 1 chi tiết từ Decision Brief trước** (đã re-verify trực tiếp source, không lặp lại nhầm
lẫn cũ): `SignalRelation` (`interpretation/signal.ts`) **ĐÃ CÓ SẴN** giá trị `"xing"` (刑) —
Decision Brief trước ghi nhầm là "cần thêm 1 giá trị vào SignalRelation" cho rule phụ của kiện
tụng. Điều này KHÔNG đúng — schema đã đủ, KHÔNG cần đổi type. Sửa lại ở mục 4/5 bên dưới.

---

## 1. Baseline điều hành (Executive Baseline)

- MVP Freeze: `5b21b1e0f88233500e61607b9c76687e2c5df539` — 295/295 test, 1 rule production
  (R-NHATTHAN-01), `conflicts` luôn `[]` (Option A).
- Phase 11 Decision Brief: `9537799` — kiểm kê 3 hướng (Calculation Expansion / Interpretation
  Expansion / App-API Integration), không xếp hạng.
- Tài liệu này KHÔNG mở lại bất kỳ quyết định nào đã đóng băng, chỉ tổ chức lại bằng chứng đã có
  thành đồ thị phụ thuộc + work package.

## 2. Ranh giới MVP đông cứng

Nhắc lại nguyên vẹn (không diễn giải lại) — xem mục 8 để biết chi tiết "regression không chấp
nhận được".

---

## 3. Kiểm kê Candidate

### INTERPRETATION

| Candidate | Calculation cần | Contract | Implementation | Provenance | Validation | Bằng chứng cổ điển | Ngữ nghĩa tất định | Rule/evaluator cần | QuestionType | Conflict dependency | Architecture dependency | Độc lập được? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| quan-chuc (前引後從格) | `threeTransmissions.{initial,final}` vs `calendar.dayPillar.can` — CẢ 2 field đã nằm trong 8-field freeze | Không — chưa có `RuleDefinition` | Không | Cần entry mới (chưa viết) | Chưa | A (毕法赋 pháp 1) | Đủ rõ (quan hệ vị trí Sơ/Mạt truyền so Can) | 1 evaluator mới, đăng ký qua registry hiện có | READY | Không | Không | **CÓ** |
| hon-nhan (Thiên Hậu/Lục Hợp) | `twelveGenerals` tại vị trí `dayPillar.{can,chi}` — trong 8-field freeze | Không | Không | Cần entry mới | Chưa | A (毕法赋 pháp 40) | Đủ rõ | 1 evaluator mới | READY | Không | Không | **CÓ** |
| tim-do (rule chính, 遙克/昴星+Huyền Vũ) | `threeTransmissions.method` + `twelveGenerals` — trong 8-field freeze | Không | Không | Cần entry mới | Chưa | A (毕法赋 pháp 35) | Đủ rõ | 1 evaluator mới | READY | Không | Không | **CÓ** |
| kien-tung (rule chính, Mộ Thần khắc Quý Nhân) | 12 Trường Sinh (Mộ Thần) — **KHÔNG tồn tại** | Không (không có contract cho 12 Trường Sinh) | Không | — | — | A cho Ý NGHĨA, nhưng phụ thuộc thành phần DO_NOT_IMPLEMENT | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** |
| kien-tung (2 rule phụ: 鬼臨三四, 支干乘刑) | `fourLessons` (pháp 70) + Ngũ-Hành-tương-đối-Can + quan hệ 刑 (Tam Hình) giữa Chi (pháp 75) — `SignalRelation.xing` **ĐÃ CÓ SẴN**, không cần đổi type | Không — chưa có `RuleDefinition` | Không | Cần entry mới | Chưa | A (毕法赋 pháp 70, 75) | Đủ rõ | 1-2 evaluator mới | PARTIAL | Không | Không | **CÓ** |
| suc-khoe (rule chính, Mộ Thần+Bạch Hổ) | 12 Trường Sinh — **KHÔNG tồn tại** | Không | Không | — | — | A, chặn cùng lý do trên | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** |
| suc-khoe (rule phụ, giới tính→用神) | `twelveGenerals` (đã có) + `ChartInput.gender` — `gender` **ĐÃ LÀ** 1 giá trị hợp lệ của `ExternalContextId`, nhưng Level 2 chặn BẤT KỲ `externalContext` không rỗng nào một cách tuyệt đối (thiết kế có chủ đích từ Phase 10.4) | Có phần — type `ExternalContextId` đã liệt kê `"gender"` | Không | Cần entry mới | Chưa | A (六壬大全 卷三) | Đủ rõ VỀ MẶT NỘI DUNG, nhưng KHÔNG thể đăng ký được ở registry hiện tại | 1 evaluator mới, nhưng KHÔNG pass được Level 2 | PARTIAL | Không | **Có — cần 1 quyết định kiến trúc: có nên cho phép ngoại lệ Level 2 cho `externalContext=["gender"]` hay không** | **KHÔNG** (bị chặn kiến trúc, không phải thiếu bằng chứng) |
| thi-cu (帘幕貴人 lâm niên mệnh/Can) | 帘幕貴人 (công thức tính) — **KHÔNG tồn tại**; có thể cần `benMing`/`xingNian` | Không | Không | — | — | A cho Ý NGHĨA, công thức TÍNH chưa từng được audit | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** |
| tai-chinh (傳財化鬼/傳鬼化財) | `threeTransmissions` + Ngũ-Hành-tương-đối-Can (財/鬼) — field tính toán đã có | Không | Không | Cần entry mới | Chưa | A (câu phú), nhưng thuật ngữ 財/鬼 **CHƯA xác định** có trùng khung 六親 đã loại hay không | **KHÔNG rõ** cho tới khi thuật ngữ được resolve | 1 evaluator mới (nếu resolve được) | PARTIAL | Không | Không | **KHÔNG** (research trước) |
| tim-do (太陽照武, rule phụ) | Có thể là `monthGeneral` (nếu referent "太陽"=月將 đúng cho câu phú này) — CHƯA XÁC NHẬN | Không | Không | — | — | A cho câu chữ, **UNRESOLVED** cho referent | **KHÔNG** | — | READY (cho rule chính; rule phụ này riêng) | Không rõ | Không | **KHÔNG** (research trước) |

### CALCULATION

| Candidate | Calculation cần | Contract | Implementation | Provenance | Validation | Bằng chứng cổ điển | Ngữ nghĩa tất định | Rule/evaluator cần | QuestionType | Conflict dependency | Architecture dependency | Độc lập được? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 課體/Khóa Thể (primary) | `threeTransmissions.method` (ĐÃ CÓ) | **Có** (`types/ke-type.ts`, `KePrimary.method` = 1-1 với `NineMethod`) | Không (chưa viết hàm map) | B | Chưa | B (10 loại khớp mục lục 六壬大全) | Đủ rõ — ánh xạ thuần, không cần suy luận | Không áp dụng (đây là Calculation, không phải Interpretation rule) | — | Không | Không | **CÓ** |
| 課體 — zeikeVariant (元首/重審/知一) | `threeTransmissions.method === 'zeike'` (ĐÃ CÓ) + logic phân biệt số khóa có khắc | Có (field optional trên `KePrimary`) | Không | **C** — 1 nguồn duy nhất (repo D) | Chưa | **KHÔNG đủ** | Không rõ cho tới khi có thêm nguồn | — | — | Không | Không | **KHÔNG** (research trước) |
| 空亡/Không Vong | `calendar.dayPillar` (tuần Giáp) + vị trí `threeTransmissions` (ĐÃ CÓ cả 2) | **Có** (`types/void-branches.ts`) | Không | B (tính) | Chưa | B | Đủ rõ | — | — | Không | Không | **CÓ** |
| 旺衰/Vượng Suy (TÍNH) | `calendar.monthPillar` (Ngũ Hành nguyệt lệnh, ĐÃ CÓ) | **Có** (`types/wang-shuai.ts`) | Không | A | Chưa | A (lý thuyết Ngũ Hành phổ quát) | Đủ rõ | — | — | Không | Không | **CÓ** |
| 驛馬 lộ ra top-level | Không cần tính gì mới — `computeYiMa()` **ĐÃ TỒN TẠI VÀ ĐÃ VERIFY**, chỉ dùng nội bộ `nine-methods` | Có (`types/shen-sha.ts`) | **CÓ** (nội bộ) | B | Có (test nội bộ), CHƯA có test cho exposure top-level | B | Đủ rõ | — | — | Không | Không | **CÓ** |
| 本命/Bản Mệnh | `calendar` + `ChartInput.birthDate` (input mới, optional đã có trên `ChartInput`) | **Có** (`types/ben-ming-xing-nian.ts`) | Không | B | **Chưa cross-check** 2 công thức (modulo repo D vs date-probe repo A) | B | Không đủ rõ để chấm A — 2 công thức chưa xác nhận cho cùng kết quả | — | — | Không | Có điều kiện — cần quyết định shape output khi thiếu `birthDate` | **KHÔNG** (validation trước) |
| 行年/Hành Niên | Giống 本命 + tuổi 虛歲 | **Có** | Không | B | Giống 本命 | B | Giống 本命 | — | — | Không | Giống 本命 | **KHÔNG** (validation trước) |
| 12 Trường Sinh | Không xác định — chưa có công thức đủ nguồn | **KHÔNG** — không có type nào | Không | C (nguồn thay thế) / D (nguồn D bị bác) | Không | **KHÔNG đủ** | Không | — | — | Không | Không | **KHÔNG** (research trước, mức sâu nhất trong mọi candidate) |

### INTEGRATION

| Candidate | Trạng thái hiện tại | Contract | Implementation | Cần thay đổi engine? | Độc lập được? |
|---|---|---|---|---|---|
| `src/pages/api/dai-luc-nham.ts` | Gọi `calculateCalendarFoundation()` (Phase 8, 4 field) | N/A (route, không phải engine contract) | Lỗi thời | **KHÔNG** | **CÓ** |
| `calculateCalendarFoundation()` | Facade cũ hơn, vẫn hoạt động đúng, KHÔNG bị Phase 9E-10.6.6 thay thế/xoá | Ổn định | Đã verify | — | — |
| `calculateDaLiuRenChart()` | Facade đầy đủ (8 field), đã freeze | Ổn định | Đã verify | — | — |
| `buildInterpretationPackage()` | Đã freeze, tự validate | Ổn định | Đã verify | — | — |

---

## 4. Đồ thị phụ thuộc

```
[12 Trường Sinh — KHÔNG có contract, nguồn C/D]
   → kien-tung (rule chính)
   → suc-khoe (rule chính)

[帘幕貴人 — KHÔNG có công thức tính, ý nghĩa A]
   → thi-cu (rule duy nhất còn treo)

[財/鬼 thuật ngữ — chưa resolve có trùng 六親 hay không]
   → tai-chinh (mọi rule)

[太陽照武 referent — chưa resolve, có thể = monthGeneral (ĐÃ CÓ)]
   → tim-do (rule phụ) — LƯU Ý: rule CHÍNH của tim-do KHÔNG phụ thuộc mục này

[gender là externalContext — Level 2 chặn tuyệt đối theo thiết kế]
   → suc-khoe (rule phụ) — cần quyết định kiến trúc, KHÔNG phải thiếu bằng chứng

[8-field Calculation freeze — ĐÃ CÓ, KHÔNG cần gì thêm]
   → quan-chuc (rule chính)     [ĐỘC LẬP HOÀN TOÀN]
   → hon-nhan (rule chính)      [ĐỘC LẬP HOÀN TOÀN]
   → tim-do (rule chính)        [ĐỘC LẬP HOÀN TOÀN]
   → kien-tung (2 rule phụ)     [ĐỘC LẬP HOÀN TOÀN — SignalRelation.xing đã có sẵn]

[computeYiMa() — ĐÃ CÓ, chỉ cần export top-level]
   → 驛馬 lộ ra DaLiuRenCalculationResult mở rộng   [ĐỘC LẬP HOÀN TOÀN]

[ThreeTransmissions.method — ĐÃ CÓ]
   → 課體 (primary)             [ĐỘC LẬP HOÀN TOÀN]

[calendar.dayPillar + threeTransmissions positions — ĐÃ CÓ]
   → 空亡                       [ĐỘC LẬP HOÀN TOÀN]

[calendar.monthPillar — ĐÃ CÓ]
   → 旺衰 (TÍNH)                [ĐỘC LẬP HOÀN TOÀN]

[ChartInput.birthDate — ĐÃ CÓ (optional), nhưng 2 công thức chưa cross-check]
   → 本命/行年                  [CẦN validation, không cần research/calculation mới]

[calculateDaLiuRenChart() + buildInterpretationPackage() — ĐÃ FREEZE, ổn định]
   → viết lại dai-luc-nham.ts   [ĐỘC LẬP HOÀN TOÀN với MỌI candidate khác]
```

---

## 5. Phân loại phụ thuộc

| Candidate | Lớp |
|---|---|
| quan-chuc (rule chính) | **DIRECT** |
| hon-nhan (rule chính) | **DIRECT** |
| tim-do (rule chính) | **DIRECT** |
| kien-tung (2 rule phụ) | **DIRECT** |
| 課體 (primary) | **DIRECT** |
| 空亡 | **DIRECT** |
| 旺衰 (TÍNH) | **DIRECT** |
| 驛馬 lộ top-level | **DIRECT** |
| viết lại `dai-luc-nham.ts` | **INTEGRATION** |
| kien-tung (rule chính) | **CALCULATION** (chặn bởi 12 Trường Sinh) |
| suc-khoe (rule chính) | **CALCULATION** (chặn bởi 12 Trường Sinh) |
| thi-cu | **CALCULATION** (chặn bởi 帘幕貴人 công thức tính) |
| 課體 — zeikeVariant | **RESEARCH** |
| 12 Trường Sinh (tự thân) | **RESEARCH** |
| tai-chinh | **RESEARCH** (thuật ngữ 財/鬼) |
| tim-do (太陽照武, rule phụ) | **RESEARCH** (referent "太陽") |
| 本命/行年 | **VALIDATION** (2 công thức chưa cross-check) |
| suc-khoe (rule phụ) | **MULTIPLE** — RESEARCH đã đủ (nội dung A), nhưng bị **ARCHITECTURE** chặn (Level 2 blanket rule cho `externalContext`) |

**Không có candidate nào được gọi là "code task" khi blocker thật là research/architecture** — bảng trên tách rõ theo đúng 7 lớp yêu cầu.

---

## 6. Candidate độc lập (không chờ 12 Trường Sinh / conflict semantics / calculation expansion khác / profile thứ 2)

Xác nhận TRỰC TIẾP qua repository (không giả định): quan-chuc, hon-nhan, và tim-do (rule
chính) — cả 3 đều được kiểm tra field-by-field ở mục 3, xác nhận CHỈ dùng field đã có trong
`DaLiuRenCalculationResult` (`threeTransmissions`, `twelveGenerals`, `calendar.dayPillar`) —
KHÔNG field nào trong 3 rule này đụng tới 12 Trường Sinh, 帘幕貴人, hay bất kỳ calculation chưa
implement nào. Đúng như Decision Brief đã nêu, VÀ đã re-verify ở đây.

Danh sách đầy đủ candidate ĐỘC LẬP HOÀN TOÀN (không chờ bất kỳ điều gì ở mục 12 Trường
Sinh/conflict/calculation khác/profile thứ 2):

- quan-chuc (rule chính)
- hon-nhan (rule chính)
- tim-do (rule chính)
- kien-tung (2 rule phụ — SignalRelation.xing đã sẵn có)
- 課體 (primary)
- 空亡
- 旺衰 (TÍNH)
- 驛馬 lộ top-level
- Viết lại `dai-luc-nham.ts`

---

## 7. Hard Blocker vs Non-Blocking Gap

| Candidate | Loại | Lý do |
|---|---|---|
| kien-tung/suc-khoe (rule chính) | **HARD BLOCKER** | Field Calculation cần (Mộ Thần, từ 12 Trường Sinh) hoàn toàn không tồn tại — không có cách nào evaluate tất định nếu thiếu |
| thi-cu | **HARD BLOCKER** | Công thức tính 帘幕貴人 chưa từng được audit — không có FACT nào để đọc |
| tai-chinh | **HARD BLOCKER cho tới khi resolve thuật ngữ** | Không rõ 財/鬼 nghĩa là gì trong khung Lục Nhâm — implement bây giờ sẽ là suy đoán, không phải luận giải có nguồn |
| tim-do (太陽照武, rule phụ) | **NON-BLOCKING GAP cho rule CHÍNH của tim-do** / HARD BLOCKER cho riêng rule phụ này | Rule chính của tim-do (遙克/昴星+Huyền Vũ) không phụ thuộc referent "太陽" — hoàn toàn tách biệt |
| suc-khoe (rule phụ, gender) | **HARD BLOCKER kiến trúc** (không phải thiếu bằng chứng) | Nội dung đã đủ nguồn (A), nhưng Level 2 CHẶN TUYỆT ĐỐI mọi `externalContext` không rỗng theo thiết kế đã đóng băng — cần 1 quyết định kiến trúc RIÊNG (có nên mở ngoại lệ hay không), không phải nghiên cứu thêm |
| 12 Trường Sinh (tự thân) | **HARD BLOCKER** | Không có contract, không có nguồn đủ mạnh |
| 課體 — zeikeVariant | **NON-BLOCKING GAP cho phần primary** | `KePrimary.method` (phần chính) hoàn toàn độc lập với `zeikeVariant` (field optional) — có thể implement primary mà bỏ trống zeikeVariant |
| 本命 (công thức Can Chi năm sinh) | **RESOLVED — Phase 11-E, VALIDATED MATCH** (78/78, 0 mismatch, xem Algorithm Spec §13) | Đã nâng CONFIDENCE A — không còn là gap |
| 行年 | **KHÔNG đổi — ngoài phạm vi Phase 11-E** | Công thức riêng (Nam/Nữ thuận/nghịch), vẫn confidence B, quy ước tính tuổi vẫn D — chưa cross-check, không phải việc 11-E đã làm |
| CalculationProfile trong evaluator (mục 11) | **NON-BLOCKING GAP** (hiện tại) | Chỉ tồn tại 1 profile — không ảnh hưởng bất kỳ candidate nào ở phase này (xem mục 11) |
| Conflict semantics (Option A) | **KHÔNG PHẢI blocker cho bất kỳ candidate nào ở đây** | Không có 2 rule production nào (hiện tại hoặc candidate) yêu cầu so sánh signal với nhau — mọi candidate đều là rule ĐỘC LẬP, tự đứng 1 mình |

Không blocker nào bị dựng lên giả tạo — mỗi dòng trên trỏ ngược về bằng chứng cụ thể ở mục 3.

---

## 8. Định nghĩa Work Package (đề xuất, KHÔNG thực thi)

### 11-A — Calculation Contract / Expansion
- **Mục tiêu**: implement `compute*` cho 課體 (primary)/空亡/旺衰(TÍNH)/驛馬 exposure — 4 candidate DIRECT.
- **Tiên quyết**: không có (mọi input cần đã tồn tại trong `DaLiuRenCalculationResult`).
- **File khả năng bị ảnh hưởng**: `src/ke-type/`, `src/void-branches/`, `src/wang-shuai/` (module mới, theo pattern `four-lessons/`), `src/da-liu-ren-calculation-result.ts` (type MỚI mở rộng, KHÔNG sửa type freeze hiện có — đúng nguyên tắc Phase 9E), `src/index.ts` (thêm export).
- **Bằng chứng cần**: đã đủ (bảng mục 3) — không cần nghiên cứu thêm cho 4 candidate DIRECT.
- **Phạm vi implementation**: chỉ 4 candidate DIRECT; KHÔNG 12 Trường Sinh, KHÔNG zeikeVariant, KHÔNG 本命/行年 (chờ cross-check riêng).
- **Test cần**: golden chart thật (như mọi module hiện có), không fabricate.
- **Tiêu chí freeze**: field mới có test + provenance entry + KHÔNG sửa 8 field freeze cũ.
- **Non-goal tường minh**: KHÔNG mở 12 Trường Sinh, KHÔNG viết ý nghĩa luận giải (đó là Interpretation, Tầng 2) cho bất kỳ field mới nào — Tầng 1 chỉ tính FACT.

### 11-B — Interpretation Rule Expansion
- **Mục tiêu**: implement quan-chuc/hon-nhan/tim-do (rule chính) + kien-tung (2 rule phụ) — 4 candidate DIRECT, theo đúng khuôn R-NHATTHAN-01.
- **Tiên quyết**: không có (dùng thẳng 8 field freeze).
- **File khả năng bị ảnh hưởng**: `src/rules/r-quanchuc-01/`, `src/rules/r-honnhan-01/`, `src/rules/r-timdo-01/`, `src/rules/r-kientung-*/` (module mới, mỗi rule 1 thư mục — đúng pattern đã có), `src/rules/registry.ts` (thêm rule vào `PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY`).
- **Bằng chứng cần**: đã đủ (confidence A cho cả 3 rule chính, A cho 2 rule phụ kiện tụng).
- **Phạm vi implementation**: CHỈ 4 candidate DIRECT ở trên; KHÔNG kien-tung/suc-khoe rule chính, KHÔNG thi-cu, KHÔNG tai-chinh, KHÔNG tim-do rule phụ.
- **Test cần**: golden chart thật qua `calculateDaLiuRenChart()`, giống `r-nhatthan-01.test.ts`.
- **Tiêu chí freeze**: mỗi rule mới đăng ký qua `buildRuleRegistry`/`buildEvaluatorRegistry` thật, self-validate qua `buildInterpretationPackage`, 295 test cũ vẫn xanh + test mới xanh.
- **Non-goal tường minh**: KHÔNG implement conflict detection dù nhiều rule hơn cùng tồn tại — Option A vẫn giữ nguyên; KHÔNG mở rộng R-NHATTHAN-01 sang vế hợp-trục/chéo-trục.

### 11-C — API Integration
- **Mục tiêu**: viết lại `src/pages/api/dai-luc-nham.ts` để gọi `calculateDaLiuRenChart()` + `buildInterpretationPackage()`.
- **Tiên quyết**: KHÔNG PHỤ THUỘC 11-A hay 11-B — có thể làm với ĐÚNG 1 rule hiện có (R-NHATTHAN-01).
- **File khả năng bị ảnh hưởng**: CHỈ `src/pages/api/dai-luc-nham.ts` (ngoài package `daliuren-engine`) — KHÔNG đụng engine.
- **Bằng chứng cần**: không cần nghiên cứu domain — chỉ cần quyết định sản phẩm (route trả `DaLiuRenCalculationResult` thô hay `InterpretationPackage`, `questionType` lấy từ query param nào).
- **Phạm vi implementation**: 1 route.
- **Test cần**: test route (ngoài phạm vi package `daliuren-engine`).
- **Tiêu chí freeze**: route mới không đổi hành vi `calculateCalendarFoundation()`-based cũ trừ khi được yêu cầu thay thế hẳn (quyết định sản phẩm, không phải kỹ thuật).
- **Non-goal tường minh**: KHÔNG sửa engine; KHÔNG thêm rule mới chỉ để route "có gì đó để trả về".

### 11-D — Research Closure
- **Mục tiêu**: đóng gap RESEARCH cho 12 Trường Sinh, 帘幕貴人 (công thức tính), 財/鬼 (tai-chinh), 太陽照武 referent, zeikeVariant.
- **Tiên quyết**: không có.
- **File khả năng bị ảnh hưởng**: KHÔNG source code — chỉ `docs/daliuren/research/` (report mới hoặc cập nhật report cũ).
- **Bằng chứng cần**: đọc lại nguyên văn 六壬大全/畢法賦 trực tiếp (không qua tóm tắt web), đúng kỷ luật đã áp dụng xuyên suốt dự án.
- **Phạm vi implementation**: KHÔNG có — đây là package THUẦN NGHIÊN CỨU.
- **Test cần**: không áp dụng.
- **Tiêu chí freeze**: mỗi mục có kết luận CONFIDENCE rõ ràng (kể cả kết luận "vẫn không đủ, giữ nguyên trạng").
- **Non-goal tường minh**: KHÔNG code bất cứ điều gì dựa trên kết quả nghiên cứu trong CHÍNH package này — đó là việc của 1 package 11-A/11-B kế tiếp.

### 11-E — Validation Closure (本命/行年) — **STATUS: CLOSED (2026-09-22), VALIDATED — MATCH**
- **Mục tiêu**: cross-check công thức modulo (repo D) vs date-probe (repo A) cho 本命/行年.
- **Tiên quyết**: không có.
- **File khả năng bị ảnh hưởng**: cross-check thực hiện qua script tạm ngoài repo (KHÔNG commit) +
  hàm `getGanzhiYear()` đã có sẵn của `@thien-anh/calendar-core` (không sửa) — KHÔNG viết code
  production 本命/行年 nào (khác giả định "có thể cần 2 implementation tạm" từng nêu ở
  `DA_LIU_REN_PHASE_11_WORK_PACKAGE_AUDIT.md`).
- **Bằng chứng cần**: đã đủ (2 công thức đã có, chỉ cần chạy đối chiếu).
- **Tiêu chí freeze**: báo cáo khớp/không khớp — **KẾT QUẢ: KHỚP, 78/78 test case MATCH, 0
  mismatch** (60 năm liên tiếp 1960-2019 phủ đủ 60 tổ hợp Can-Chi + 18 mốc biên epoch/mod-10/
  mod-12/thế kỷ). 本命 (phần công thức tính) nâng CONFIDENCE B→A theo đúng tiêu chí đã định trước
  ở Algorithm Spec §13. 行年 KHÔNG đổi (ngoài phạm vi cross-check này). Chi tiết đầy đủ nằm trong
  báo cáo Phase 11-E của phiên làm việc — không có document riêng được tạo (theo đúng chỉ đạo
  "cập nhật tối thiểu", không thêm work package/artifact mới).

### 11-F — Architecture Decision (gender externalContext / CalculationProfile)
- **Mục tiêu**: RA QUYẾT ĐỊNH (không code) về (a) có nên mở ngoại lệ Level 2 cho `externalContext=["gender"]`, (b) có cần resolve `CalculationProfile`-trong-evaluator trước khi Phase 11 tiếp tục hay không (xem mục 11).
- **Tiên quyết**: không có.
- **File khả năng bị ảnh hưởng**: KHÔNG có — đây là quyết định, ghi vào 1 tài liệu quyết định riêng nếu owner chọn mở ngoại lệ.
- **Tiêu chí freeze**: có văn bản quyết định RÕ RÀNG, dù kết quả là "giữ nguyên, không mở ngoại lệ".

---

## 9. Trình tự phụ thuộc khả dĩ (KHÔNG xếp hạng)

Trình tự A (đi theo Calculation trước):
```
11-A (Calculation Contract/Expansion — 4 candidate DIRECT)
  → (field mới sẵn sàng, nhưng KHÔNG bắt buộc cho 11-B vì 11-B dùng field đã có sẵn từ trước)
  → 11-B (Interpretation Rule Expansion — vẫn có thể chạy song song, không phụ thuộc 11-A)
  → 11-C (API Integration — độc lập hoàn toàn với cả 2)
```

Trình tự B (đi theo Interpretation trước):
```
11-B (4 rule DIRECT, dùng field đã có)
  → 11-C (API giờ có nhiều rule hơn để trả về, nhưng KHÔNG BẮT BUỘC chờ 11-B)
  → 11-A (chạy song song hoặc sau, không phụ thuộc 11-B)
```

Trình tự C (đi theo Integration trước):
```
11-C (route mới, dùng ĐÚNG 1 rule hiện có — R-NHATTHAN-01)
  → 11-B (thêm rule, route tự động có nhiều signal hơn không cần sửa lại route)
  → 11-A (song song, độc lập)
```

Trình tự D (Research trước, cho các candidate BỊ CHẶN):
```
11-D (Research Closure: 12 Trường Sinh / 帘幕貴人 / 財鬼 / 太陽照武 / zeikeVariant)
  → MỞ KHOÁ kien-tung/suc-khoe (rule chính), thi-cu, tai-chinh, tim-do (rule phụ), zeikeVariant
  → (sau đó mới) 11-A mở rộng thêm (12 Trường Sinh nếu có kết luận) + 11-B mở rộng thêm
```

Trình tự E (Validation trước, riêng cho 本命/行年):
```
11-E (cross-check 2 công thức)
  → (nếu khớp) 11-A có thể thêm 本命/行年 vào cùng đợt implement
  → (nếu không khớp) giữ nguyên B, ghi rõ, không chặn các candidate khác
```

**4 trình tự trên KHÔNG loại trừ nhau** — 11-A/11-B/11-C có thể chạy HOÀN TOÀN song song vì
không có phụ thuộc chéo nào giữa chúng (xác nhận ở mục 4/6). 11-D/11-E/11-F là các nhánh
NGHIÊN CỨU/QUYẾT ĐỊNH độc lập, không chặn 11-A/11-B/11-C.

---

## 10. Nhánh tích hợp API

- **HIỆN TẠI**: `dai-luc-nham.ts` gọi `calculateCalendarFoundation()` — trả 4 field (Lịch pháp/Nguyệt Tướng/Ngày-Đêm/Quý Nhân), KHÔNG có Tứ Khóa/Tam Truyền/Thập Nhị Thiên Tướng, KHÔNG có Interpretation.
- **MỤC TIÊU**: `calculateDaLiuRenChart()` (8 field) → `buildInterpretationPackage()` (nếu route muốn trả cả luận giải).
- **Ranh giới tích hợp chính xác**: route hiện tại đã đúng convention `EngineResult` (`ok`/`data`/`errors`/`meta`) — CHUYỂN sang `calculateDaLiuRenChart()` chỉ cần đổi tên hàm gọi, KHÔNG đổi cấu trúc response envelope.
- **API có tiêu thụ được kết quả đã freeze NGAY HÔM NAY không?** **CÓ** — cả `DaLiuRenCalculationResult` lẫn `InterpretationPackage` đều JSON-serializable, đã có test round-trip (`serialization.test.ts`).
- **Rủi ro serialization**: không tìm thấy — không có `Date`/`Map`/`Set`/circular reference nào trong 2 type output này (đã xác nhận qua đọc trực tiếp type definition).
- **Xử lý lỗi**: `EngineResult.ok=false` → route hiện tại đã map đúng qua `jsonResponse(result, 200)` (200 vì lỗi nghiệp vụ, không phải lỗi request — convention đã có, không cần đổi). `buildInterpretationPackage()` có thể `throw` (lỗi hạ tầng, vd thiếu provenance) — route MỚI cần thêm 1 nhánh `try/catch` mà route HIỆN TẠI chưa cần (vì `calculateCalendarFoundation()` không throw).
- **Có cần đổi engine không?** **KHÔNG.**
- **Có cô lập được khỏi Interpretation Expansion (11-B) không?** **CÓ HOÀN TOÀN** — route mới hoạt động đúng với ĐÚNG 1 rule (R-NHATTHAN-01) hiện có, không cần chờ rule nào khác.

Không sửa file `dai-luc-nham.ts` ở phase này.

---

## 11. Ràng buộc CalculationProfile

Nhắc lại đúng theo `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` mục 12: R-NHATTHAN-01 dùng
`CLASSICAL_V1_PROFILE` hard-code vì `evaluate(calculation)` không nhận `CalculationProfile`.

Đối chiếu TỪNG candidate Phase 11:

| Candidate | Ảnh hưởng bởi ràng buộc này? |
|---|---|
| quan-chuc/hon-nhan/tim-do (rule chính) | **KHÔNG ảnh hưởng** — không đọc `calendar.hourPillar`/Zi-hour, không gọi `resolveDayOrHourPillarProvenance` |
| kien-tung (2 rule phụ) | **KHÔNG ảnh hưởng** — cùng lý do trên |
| suc-khoe (rule phụ) | **KHÔNG ảnh hưởng** trực tiếp — nhưng bị chặn kiến trúc riêng (mục 7) |
| 課體/空亡/旺衰/驛馬 (Calculation) | **KHÔNG ảnh hưởng** — đây là Tầng 1, không dùng `evaluate(calculation)` |
| 本命/行年 | **KHÔNG ảnh hưởng trực tiếp**, nhưng NẾU sau này có rule Interpretation đọc `benMing`/`xingNian` VÀ cần tra provenance phụ thuộc profile, sẽ THỪA HƯỞNG cùng giới hạn |
| kien-tung/suc-khoe (rule chính, sau khi có 12 Trường Sinh) | **CÓ THỂ thừa hưởng** nếu công thức 12 Trường Sinh có bất kỳ quyết định profile-phụ-thuộc nào (chưa biết, vì công thức chưa tồn tại) |
| thi-cu | Tương tự — chưa biết cho tới khi có công thức 帘幕貴人 |
| API Integration (11-C) | **KHÔNG ảnh hưởng** — route không tự viết evaluator |

**Kết luận**: KHÔNG có candidate DIRECT nào (quan-chuc/hon-nhan/tim-do/kien-tung phụ/課體/空亡/旺衰/驛馬/API)
bị ảnh hưởng bởi ràng buộc này — có thể **hoãn an toàn** cho tới khi có nhu cầu thêm
`CalculationProfile` thứ 2 thật sự, đúng như đã kết luận ở Decision Brief. Không có candidate
nào ở Phase 11 (kể cả các candidate CALCULATION/RESEARCH) hiện được biết là cần profile
injection — vì KHÔNG có candidate nào (kể cả 12 Trường Sinh/帘幕貴人, do công thức của chúng
chưa tồn tại nên chưa thể biết chúng có phụ thuộc profile hay không).

---

## 12. Ranh giới Regression (Frozen MVP)

Mọi implementation Phase 11 PHẢI giữ nguyên:
- Ngữ nghĩa 8 field Calculation freeze.
- Hành vi R-NHATTHAN-01 (không mở rộng vế hợp-trục/chéo-trục).
- Grade provenance hiện có (`PROV-NHATTHAN-01`=A, `PROV-FOUR-LESSONS-CONSTRUCTION`=A, `PROV-GANZHI-PILLAR-CONSTRUCTION`=B, `PROV-PROFILE-ZIHOUR-CONFLICTING`=D).
- Ngữ nghĩa Confidence (Model C, không scoring, `overallLowestConfidence=null` khi rỗng).
- Tính tất định `chartId`.
- Hành vi `QuestionType` (Level 1 + Level 2, không mở rộng compatibility âm thầm).
- `conflicts = []` (Option A).
- `validateInterpretationPackage()` — không nới lỏng bất kỳ điều kiện IP-1..IP-6 nào.
- Bộ regression baseline 295/295 hiện tại.

**Regression KHÔNG CHẤP NHẬN ĐƯỢC** = bất kỳ thay đổi nào làm: (a) 1 trong 295 test hiện tại
FAIL, (b) 1 grade provenance hiện có ĐỔI mà không qua 1 phase audit riêng như Phase 10.5A đã
làm, (c) `R-NHATTHAN-01` trả kết quả KHÁC cho CÙNG 1 golden chart đã test, (d) `conflicts`
khác `[]` xuất hiện mà không qua 1 quyết định kiến trúc riêng thay thế Option A, (e) chữ ký
`evaluate(calculation)` bị đổi âm thầm để "tiện" thêm 1 rule mới.

---

## 13. Điểm cần quyết định của chủ dự án (không xếp hạng, không đề xuất "tốt nhất")

**DECISIONS REQUIRED FROM PROJECT OWNER**

1. Có muốn bắt đầu 11-A, 11-B, 11-C đồng thời hay tuần tự — cả 3 KHÔNG phụ thuộc lẫn nhau về mặt kỹ thuật, đây thuần tuý là quyết định phân bổ công sức.
2. Có muốn đầu tư 11-D (Research Closure) cho 12 Trường Sinh/帘幕貴人/財鬼/太陽照武/zeikeVariant trước, hay để candidate liên quan (kien-tung/suc-khoe rule chính, thi-cu, tai-chinh, tim-do rule phụ, zeikeVariant) tiếp tục ở trạng thái BLOCKED vô thời hạn.
3. Có muốn mở ngoại lệ kiến trúc cho Level 2 gating để cho phép `externalContext=["gender"]` (chỉ ảnh hưởng 1 rule phụ của sức khỏe) — đây là 1 thay đổi CÓ CHỦ ĐÍCH vào 1 quyết định đã đóng băng từ Phase 10.4, cần phê duyệt riêng, KHÔNG tự động đi kèm bất kỳ package nào khác.
4. ~~Có muốn chạy 11-E (cross-check 本命/行年) trước khi coi 2 field này "sẵn sàng implement", hay chấp nhận confidence B mãi mãi cho tới khi có nhu cầu thật.~~ **ĐÃ TRẢ LỜI (11-E CLOSED, 2026-09-22)**: đã chạy, KHỚP 78/78 — 本命 nâng A. Quyết định CÒN LẠI (chưa trả lời, KHÔNG thuộc phạm vi 11-E): có muốn gộp 本命/行年 vào 1 đợt implement Calculation Layer mới hay không — đây là quyết định implementation RIÊNG, ngoài phạm vi validation-only của 11-E.
5. Route `dai-luc-nham.ts` nên trả `DaLiuRenCalculationResult` thô, `InterpretationPackage`, hay cả 2 — và `questionType` nên lấy từ đâu (query param mới, giá trị mặc định, hay bắt buộc client truyền) — đây là quyết định SẢN PHẨM, không phải kỹ thuật.
6. Có cần resolve ràng buộc `CalculationProfile`-trong-evaluator TRƯỚC Phase 11, hay tiếp tục hoãn — mục 11 kết luận KHÔNG có candidate nào hiện tại cần nó, nhưng đây vẫn là 1 quyết định chủ dự án có thể muốn xử lý dứt điểm sớm để tránh nợ kỹ thuật tích luỹ.

---

## 14. Mục phải giữ nguyên đông cứng (deferred, tường minh)

- 12 Trường Sinh (tự thân, không phải các rule phụ thuộc nó) — RESEARCH, không có gì để code.
- Khóa Thể phụ (鑄印/軒蓋/連珠…) — DO_NOT_IMPLEMENT, không đổi.
- Công thức điều chỉnh lực Vượng Suy định lượng — đã gỡ khỏi SPEC vĩnh viễn, không được khôi phục.
- Conflict semantics (Option A) — không được xét lại ngầm trong bất kỳ package Phase 11 nào; chỉ có thể đổi qua 1 phase riêng, tương tự Phase 10.6.4/10.6.4A/10.6.4B.
- Bước SYNTHESIS (tổng hợp cát/hung cuối cùng) — vẫn thuộc Tầng 3 (AI, chưa xây), không code cứng ở Tầng 2.
- 6 loại question_type còn PARTIAL khác chưa nêu ở đây (財/nhà đất/mua bán/hợp tác/xuất hành/nhân sự) — ngoài phạm vi candidate đã audit ở tài liệu này, chưa có đánh giá Phase 11 riêng.

---

Tài liệu này KHÔNG thay đổi bất kỳ trạng thái đông cứng nào đã có. Không có rule, calculation,
hay route mới nào được tạo ra khi viết tài liệu này.
