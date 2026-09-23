# CONG TAIYI — Đại Lục Nhâm — Phase 11 Roadmap & Dependency Decision

**STATUS: PHASE 11 — CLOSED (2026-09-23).** Xem mục 15 (cuối tài liệu) cho tổng kết chính thức.
Tài liệu này ban đầu là PLANNING thuần tuý (xem đoạn dưới) — nội dung gốc được GIỮ NGUYÊN làm
lịch sử/provenance; các mục 3/5/6/7/8/11/13 đã được CẬP NHẬT TỐI THIỂU (không viết lại) để phản
ánh đúng trạng thái thực tế sau khi toàn bộ candidate DIRECT đã được thực thi hoặc xác nhận
BLOCKED — mỗi chỗ cập nhật đều đánh dấu rõ **[CẬP NHẬT ...]** để phân biệt với nội dung PLANNING
gốc.

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
| quan-chuc (前引後從格) | `threeTransmissions.{initial,final}` vs `calendar.dayPillar.can` — CẢ 2 field đã nằm trong 8-field freeze | Không — chưa có `RuleDefinition` | Không | Cần entry mới (chưa viết) | Chưa | A (毕法赋 pháp 1) | Đủ rõ (quan hệ vị trí Sơ/Mạt truyền so Can) | 1 evaluator mới, đăng ký qua registry hiện có | ~~READY~~ **[CẬP NHẬT] BLOCKED** — audit sau (`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` + `DA_LIU_REN_QUANCHUC_FRONT_BACK_RESEARCH.md`) phát hiện Direction/Threshold/Wrap-around của "前/後" KHÔNG xác định được từ nguồn — semantics KHÔNG đủ rõ như đánh giá ban đầu ở dòng này | Không | Không | ~~CÓ~~ **[CẬP NHẬT] KHÔNG** (độc lập về field, nhưng BLOCKED bởi semantics riêng — không đưa vào 11-B) |
| hon-nhan (Thiên Hậu/Lục Hợp) | `twelveGenerals` tại vị trí `dayPillar.{can,chi}` — trong 8-field freeze | Không | Không | Cần entry mới | Chưa | A (毕法赋 pháp 40) | Đủ rõ | 1 evaluator mới | READY | Không | Không | **CÓ** — **[CẬP NHẬT] DONE/FROZEN**: `R-HONNHAN-01`, commit `4c161bf` (11-B) |
| tim-do (rule chính, 遙克/昴星+Huyền Vũ) | `threeTransmissions.method` + `twelveGenerals` — trong 8-field freeze | Không | Không | Cần entry mới | Chưa | A (毕法赋 pháp 35) | Đủ rõ | 1 evaluator mới | READY | Không | Không | **CÓ** — **[CẬP NHẬT] DONE/FROZEN**: `R-TIMDO-01`, commit `4c161bf` (11-B) |
| kien-tung (rule chính, Mộ Thần khắc Quý Nhân) | 12 Trường Sinh (Mộ Thần) — **KHÔNG tồn tại** | Không (không có contract cho 12 Trường Sinh) | Không | — | — | A cho Ý NGHĨA, nhưng phụ thuộc thành phần DO_NOT_IMPLEMENT | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** — **[CẬP NHẬT] vẫn BLOCKED**, 11-D (R1) xác nhận lại: 12 Trường Sinh BLOCKED, không reopen |
| kien-tung (2 rule phụ: 鬼臨三四, 支干乘刑) | `fourLessons` (pháp 70) + Ngũ-Hành-tương-đối-Can + quan hệ 刑 (Tam Hình) giữa Chi (pháp 75) — `SignalRelation.xing` **ĐÃ CÓ SẴN**, không cần đổi type | Không — chưa có `RuleDefinition` | Không | Cần entry mới | Chưa | A (毕法赋 pháp 70, 75) | Đủ rõ | 1-2 evaluator mới | PARTIAL | Không | Không | **CÓ** — **[CẬP NHẬT] CHỈ 鬼臨三四 đã DONE/FROZEN**: `R-KIENTUNG-02`, commit `4c161bf` (11-B). **支干乘刑 KHÔNG nằm trong phạm vi đã duyệt** (`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` dòng 433) — vẫn BLOCKED, không reopen |
| suc-khoe (rule chính, Mộ Thần+Bạch Hổ) | 12 Trường Sinh — **KHÔNG tồn tại** | Không | Không | — | — | A, chặn cùng lý do trên | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** — **[CẬP NHẬT] vẫn BLOCKED**, 11-D (R1) xác nhận lại, không reopen |
| suc-khoe (rule phụ, giới tính→用神) | `twelveGenerals` (đã có) + `ChartInput.gender` — `gender` **ĐÃ LÀ** 1 giá trị hợp lệ của `ExternalContextId` | Có phần — type `ExternalContextId` đã liệt kê `"gender"` | Không | Cần entry mới | Chưa | A (六壬大全 卷三) — **[CẬP NHẬT] hạ xuống C/D**: research targeted sau 11-F (E1 gender→用神: NOT CONFIRMED — nguồn duy nhất là dòng tóm tắt không trích được nguyên văn, bị 2 nguồn khác trong repo không corroborate; E2 formula kích hoạt: INSUFFICIENT — hoàn toàn không có) | ~~Đủ rõ VỀ MẶT NỘI DUNG, nhưng KHÔNG thể đăng ký được ở registry hiện tại~~ **[CẬP NHẬT] KHÔNG còn đủ rõ** — xem cột Confidence | 1 evaluator mới — **[CẬP NHẬT] kiến trúc đã sẵn sàng (11-F, commit `d1b7824`)**, nhưng KHÔNG viết vì thiếu evidence | PARTIAL | Không | ~~Có — cần 1 quyết định kiến trúc...~~ **[CẬP NHẬT] ĐÃ QUYẾT (11-F, `d1b7824`)**: Level 2 exception cho `externalContext=["gender"]` đã implement | **KHÔNG** — **[CẬP NHẬT] BLOCKED — PROVENANCE/EVIDENCE INSUFFICIENT** (KHÔNG còn là architecture blocker) |
| thi-cu (帘幕貴人 lâm niên mệnh/Can) | 帘幕貴人 (công thức tính) — **KHÔNG tồn tại**; có thể cần `benMing`/`xingNian` | Không | Không | — | — | A cho Ý NGHĨA, công thức TÍNH chưa từng được audit | Chặn hoàn toàn | — | PARTIAL | Không | Không | **KHÔNG** |
| tai-chinh (傳財化鬼/傳鬼化財) | `threeTransmissions` + Ngũ-Hành-tương-đối-Can (財/鬼) — field tính toán đã có | Không | Không | Cần entry mới | Chưa | A (câu phú), nhưng thuật ngữ 財/鬼 **CHƯA xác định** có trùng khung 六親 đã loại hay không | **KHÔNG rõ** cho tới khi thuật ngữ được resolve | 1 evaluator mới (nếu resolve được) | PARTIAL | Không | Không | **KHÔNG** (research trước) |
| tim-do (太陽照武, rule phụ) | Có thể là `monthGeneral` (nếu referent "太陽"=月將 đúng cho câu phú này) — CHƯA XÁC NHẬN | Không | Không | — | — | A cho câu chữ, **UNRESOLVED** cho referent | **KHÔNG** | — | READY (cho rule chính; rule phụ này riêng) | Không rõ | Không | **KHÔNG** (research trước) |

### CALCULATION

| Candidate | Calculation cần | Contract | Implementation | Provenance | Validation | Bằng chứng cổ điển | Ngữ nghĩa tất định | Rule/evaluator cần | QuestionType | Conflict dependency | Architecture dependency | Độc lập được? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 課體/Khóa Thể (primary) | `threeTransmissions.method` (ĐÃ CÓ) | **Có** (`types/ke-type.ts`, `KePrimary.method` = 1-1 với `NineMethod`) | ~~Không (chưa viết hàm map)~~ **[CẬP NHẬT] DONE/FROZEN — 11-A1**, `computeKeType()`, commit `ecbd6ae` | B | Chưa | B (10 loại khớp mục lục 六壬大全) | Đủ rõ — ánh xạ thuần, không cần suy luận | Không áp dụng (đây là Calculation, không phải Interpretation rule) | — | Không | Không | **CÓ** |
| 課體 — zeikeVariant (元首/重審/知一) | `threeTransmissions.method === 'zeike'` (ĐÃ CÓ) + logic phân biệt số khóa có khắc | Có (field optional trên `KePrimary`) | Không — **[CẬP NHẬT] xác nhận vẫn cố ý để trống** (`zeikeVariant?` trong `ke-type/compute.ts`), KHÔNG thuộc phạm vi 11-A1 | **C** — 1 nguồn duy nhất (repo D) | Chưa | **KHÔNG đủ** | Không rõ cho tới khi có thêm nguồn | — | — | Không | Không | **KHÔNG** (research trước, vẫn BLOCKED, không reopen) |
| 空亡/Không Vong | `calendar.dayPillar` (tuần Giáp) + vị trí `threeTransmissions` (ĐÃ CÓ cả 2) | **Có** (`types/void-branches.ts`) | ~~Không~~ **[CẬP NHẬT] DONE/FROZEN — 11-A2** (Core only, 孤辰/寡宿 deferred theo đúng Decision Record), `computeVoidBranches()`, commit `629db3d`+`50e69e8` | B (tính) | Chưa | B | Đủ rõ | — | — | Không | Không | **CÓ** |
| 旺衰/Vượng Suy (TÍNH) | `calendar.monthPillar` (Ngũ Hành nguyệt lệnh, ĐÃ CÓ) | **Có** (`types/wang-shuai.ts`) | ~~Không~~ **[CẬP NHẬT] DONE/FROZEN — 11-A3**, `computeWangShuai()`, commit `1d19d0a` | A | Chưa | A (lý thuyết Ngũ Hành phổ quát) | Đủ rõ | — | — | Không | Không | **CÓ** |
| 驛馬 lộ ra top-level | Không cần tính gì mới — `computeYiMa()` **ĐÃ TỒN TẠI VÀ ĐÃ VERIFY**, chỉ dùng nội bộ `nine-methods` | Có (`types/shen-sha.ts`) | **CÓ** (nội bộ) — **[CẬP NHẬT] DONE/FROZEN — 11-A4**, `computeYiMaPlacement()` (module `src/shen-sha/` mới, KHÔNG lộ vào 8-field freeze), commit `01f31fe`+`68b05fb`+`6243c8f` | B | Có (test nội bộ), CHƯA có test cho exposure top-level — **[CẬP NHẬT] đã có test riêng cho `shen-sha/`** | B | Đủ rõ | — | — | Không | Không | **CÓ** |
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
| quan-chuc (rule chính) | ~~**DIRECT**~~ **[CẬP NHẬT] BLOCKED** (semantics — xem mục 3, không reopen) |
| hon-nhan (rule chính) | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-B, `4c161bf`) |
| tim-do (rule chính) | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-B, `4c161bf`) |
| kien-tung (2 rule phụ) | **DIRECT** — **[CẬP NHẬT] CHỈ 鬼臨三四 DONE/FROZEN** (11-B, `4c161bf`); 支干乘刑 ngoài phạm vi, vẫn BLOCKED |
| 課體 (primary) | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-A1, `ecbd6ae`) |
| 空亡 | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-A2, `629db3d`+`50e69e8`) |
| 旺衰 (TÍNH) | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-A3, `1d19d0a`) |
| 驛馬 lộ top-level | **DIRECT** — **[CẬP NHẬT] DONE/FROZEN** (11-A4, `01f31fe`+`68b05fb`+`6243c8f`) |
| viết lại `dai-luc-nham.ts` | **INTEGRATION** — **[CẬP NHẬT] CLOSED** (11-C, `a5968fe`) — audit xác nhận route ĐÃ ĐÚNG (Option B), chỉ thêm test |
| kien-tung (rule chính) | **CALCULATION** (chặn bởi 12 Trường Sinh) — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R1, không reopen) |
| suc-khoe (rule chính) | **CALCULATION** (chặn bởi 12 Trường Sinh) — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R1, không reopen) |
| thi-cu | **CALCULATION** (chặn bởi 帘幕貴人 công thức tính) — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R2, không reopen) |
| 課體 — zeikeVariant | **RESEARCH** — **[CẬP NHẬT] vẫn BLOCKED**, không thuộc phạm vi 11-A1, không reopen |
| 12 Trường Sinh (tự thân) | **RESEARCH** — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R1, không reopen) |
| tai-chinh | **RESEARCH** (thuật ngữ 財/鬼) — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R3, không reopen) |
| tim-do (太陽照武, rule phụ) | **RESEARCH** (referent "太陽") — **[CẬP NHẬT] vẫn BLOCKED** (11-D/R4, không reopen) |
| 本命/行年 | **VALIDATION** (2 công thức chưa cross-check) — **[CẬP NHẬT] 11-E CLOSED** (`13673af`): 本命 CROSS-CHECK 78/78 MATCH, confidence B→A. 行年 KHÔNG đổi — vẫn B, ngoài phạm vi 11-E |
| suc-khoe (rule phụ) | ~~**MULTIPLE** — RESEARCH đã đủ (nội dung A), nhưng bị **ARCHITECTURE** chặn~~ **[CẬP NHẬT] ARCHITECTURE đã mở (11-F, `d1b7824`)**. Hiện **BLOCKED — PROVENANCE/EVIDENCE INSUFFICIENT** (E1 gender→用神: NOT CONFIRMED; E2 formula: INSUFFICIENT) — không reopen research |

**Không có candidate nào được gọi là "code task" khi blocker thật là research/architecture** — bảng trên tách rõ theo đúng 7 lớp yêu cầu.

---

## 6. Candidate độc lập (không chờ 12 Trường Sinh / conflict semantics / calculation expansion khác / profile thứ 2)

Xác nhận TRỰC TIẾP qua repository (không giả định): quan-chuc, hon-nhan, và tim-do (rule
chính) — cả 3 đều được kiểm tra field-by-field ở mục 3, xác nhận CHỈ dùng field đã có trong
`DaLiuRenCalculationResult` (`threeTransmissions`, `twelveGenerals`, `calendar.dayPillar`) —
KHÔNG field nào trong 3 rule này đụng tới 12 Trường Sinh, 帘幕貴人, hay bất kỳ calculation chưa
implement nào. Đúng như Decision Brief đã nêu, VÀ đã re-verify ở đây.

**[CẬP NHẬT] Độc lập về FIELD calculation KHÔNG đồng nghĩa "sẵn sàng implement"**: quan-chuc sau
đó được phát hiện BLOCKED bởi 1 loại phụ thuộc KHÁC — semantics chưa xác định của chính câu phú
(Direction/Threshold/Wrap-around, xem mục 3) — nên KHÔNG được đưa vào 11-B dù độc lập về field.
hon-nhan và tim-do (rule chính) không gặp vấn đề tương tự — cả 2 đã DONE/FROZEN qua 11-B.

Danh sách đầy đủ candidate ĐỘC LẬP HOÀN TOÀN (không chờ bất kỳ điều gì ở mục 12 Trường
Sinh/conflict/calculation khác/profile thứ 2):

- quan-chuc (rule chính) — **[CẬP NHẬT] BLOCKED sau đó** (semantics, xem trên) — KHÔNG implement
- hon-nhan (rule chính) — **[CẬP NHẬT] DONE/FROZEN** (`4c161bf`)
- tim-do (rule chính) — **[CẬP NHẬT] DONE/FROZEN** (`4c161bf`)
- kien-tung (2 rule phụ — SignalRelation.xing đã sẵn có) — **[CẬP NHẬT] CHỈ 鬼臨三四 DONE/FROZEN** (`4c161bf`); 支干乘刑 ngoài phạm vi
- 課體 (primary) — **[CẬP NHẬT] DONE/FROZEN** (`ecbd6ae`)
- 空亡 — **[CẬP NHẬT] DONE/FROZEN** (`629db3d`+`50e69e8`)
- 旺衰 (TÍNH) — **[CẬP NHẬT] DONE/FROZEN** (`1d19d0a`)
- 驛馬 lộ top-level — **[CẬP NHẬT] DONE/FROZEN** (`01f31fe`+`68b05fb`+`6243c8f`)
- Viết lại `dai-luc-nham.ts` — **[CẬP NHẬT] CLOSED** (`a5968fe`) — route đã đúng, chỉ thêm test

---

## 7. Hard Blocker vs Non-Blocking Gap

| Candidate | Loại | Lý do |
|---|---|---|
| kien-tung/suc-khoe (rule chính) | **HARD BLOCKER** | Field Calculation cần (Mộ Thần, từ 12 Trường Sinh) hoàn toàn không tồn tại — không có cách nào evaluate tất định nếu thiếu |
| thi-cu | **HARD BLOCKER** | Công thức tính 帘幕貴人 chưa từng được audit — không có FACT nào để đọc |
| tai-chinh | **HARD BLOCKER cho tới khi resolve thuật ngữ** | Không rõ 財/鬼 nghĩa là gì trong khung Lục Nhâm — implement bây giờ sẽ là suy đoán, không phải luận giải có nguồn |
| tim-do (太陽照武, rule phụ) | **NON-BLOCKING GAP cho rule CHÍNH của tim-do** / HARD BLOCKER cho riêng rule phụ này | Rule chính của tim-do (遙克/昴星+Huyền Vũ) không phụ thuộc referent "太陽" — hoàn toàn tách biệt |
| suc-khoe (rule phụ, gender) | ~~**HARD BLOCKER kiến trúc**~~ **[CẬP NHẬT] Kiến trúc ĐÃ MỞ (11-F, `d1b7824`)**. Nay là **HARD BLOCKER EVIDENCE** | ~~Nội dung đã đủ nguồn (A)...~~ **[CẬP NHẬT]** Research targeted sau 11-F kết luận E1 (gender→用神) NOT CONFIRMED và E2 (formula kích hoạt) INSUFFICIENT — không đủ để implement 1 rule tất định. Không reopen research thêm |
| 12 Trường Sinh (tự thân) | **HARD BLOCKER** | Không có contract, không có nguồn đủ mạnh |
| 課體 — zeikeVariant | **NON-BLOCKING GAP cho phần primary** | `KePrimary.method` (phần chính) hoàn toàn độc lập với `zeikeVariant` (field optional) — có thể implement primary mà bỏ trống zeikeVariant |
| 本命 (công thức Can Chi năm sinh) | **RESOLVED — Phase 11-E, VALIDATED MATCH** (78/78, 0 mismatch, xem Algorithm Spec §13) | Đã nâng CONFIDENCE A — không còn là gap |
| 行年 | **KHÔNG đổi — ngoài phạm vi Phase 11-E** | Công thức riêng (Nam/Nữ thuận/nghịch), vẫn confidence B, quy ước tính tuổi vẫn D — chưa cross-check, không phải việc 11-E đã làm |
| CalculationProfile trong evaluator (mục 11) | **NON-BLOCKING GAP** (hiện tại) | Chỉ tồn tại 1 profile — không ảnh hưởng bất kỳ candidate nào ở phase này (xem mục 11) |
| Conflict semantics (Option A) | **KHÔNG PHẢI blocker cho bất kỳ candidate nào ở đây** | Không có 2 rule production nào (hiện tại hoặc candidate) yêu cầu so sánh signal với nhau — mọi candidate đều là rule ĐỘC LẬP, tự đứng 1 mình |

Không blocker nào bị dựng lên giả tạo — mỗi dòng trên trỏ ngược về bằng chứng cụ thể ở mục 3.

---

## 8. Định nghĩa Work Package (đề xuất, KHÔNG thực thi)

### 11-A — Calculation Contract / Expansion — **STATUS: DONE/FROZEN (thực thi thành 4 package con 11-A1..A4)**
**[CẬP NHẬT]** Thực tế triển khai TÁCH thành 4 package độc lập, mỗi package tự audit/freeze riêng:
- **11-A1 — 課體 (primary)**: `computeKeType()` — commit `ecbd6ae`.
- **11-A2 — 空亡**: `computeVoidBranches()` (Core only — 孤辰/寡宿 deferred theo Decision Record) — commit `629db3d` + `50e69e8`.
- **11-A3 — 旺衰 (TÍNH)**: `computeWangShuai()` — commit `1d19d0a`.
- **11-A4 — 驛馬 (Yi Ma Placement)**: `computeYiMaPlacement()`, module `src/shen-sha/` mới — commit `01f31fe` + `68b05fb` + `6243c8f`.

Tất cả 4 package đều: có test riêng (golden chart thật), có Independent Audit + Decision Record
+ Freeze document riêng, KHÔNG sửa 8 field freeze cũ (additive-only, đúng nguyên tắc đã định
dưới đây). 12 Trường Sinh và `zeikeVariant` KHÔNG thuộc phạm vi 4 package này — vẫn BLOCKED/
RESEARCH như mục 3/7 đã ghi, không reopen.

Nội dung PLANNING gốc (giữ nguyên làm lịch sử):
- **Mục tiêu**: implement `compute*` cho 課體 (primary)/空亡/旺衰(TÍNH)/驛馬 exposure — 4 candidate DIRECT.
- **Tiên quyết**: không có (mọi input cần đã tồn tại trong `DaLiuRenCalculationResult`).
- **File khả năng bị ảnh hưởng**: `src/ke-type/`, `src/void-branches/`, `src/wang-shuai/` (module mới, theo pattern `four-lessons/`), `src/da-liu-ren-calculation-result.ts` (type MỚI mở rộng, KHÔNG sửa type freeze hiện có — đúng nguyên tắc Phase 9E), `src/index.ts` (thêm export).
- **Bằng chứng cần**: đã đủ (bảng mục 3) — không cần nghiên cứu thêm cho 4 candidate DIRECT.
- **Phạm vi implementation**: chỉ 4 candidate DIRECT; KHÔNG 12 Trường Sinh, KHÔNG zeikeVariant, KHÔNG 本命/行年 (chờ cross-check riêng).
- **Test cần**: golden chart thật (như mọi module hiện có), không fabricate.
- **Tiêu chí freeze**: field mới có test + provenance entry + KHÔNG sửa 8 field freeze cũ.
- **Non-goal tường minh**: KHÔNG mở 12 Trường Sinh, KHÔNG viết ý nghĩa luận giải (đó là Interpretation, Tầng 2) cho bất kỳ field mới nào — Tầng 1 chỉ tính FACT.

### 11-B — Interpretation Rule Expansion — **STATUS: DONE/FROZEN (trong phạm vi đã duyệt)**
**[CẬP NHẬT]** Đã implement + freeze ĐÚNG phạm vi sau (commit `4c161bf`, provenance fix `19dd4bf`):
- `R-HONNHAN-01` (hon-nhan, rule chính, Thiên Hậu/Lục Hợp).
- `R-TIMDO-01` (tim-do, rule chính, 遙克/昴星+Huyền Vũ).
- `R-KIENTUNG-02` (kien-tung, **CHỈ rule phụ 鬼臨三四** — KHÔNG phải toàn bộ 2 rule phụ dự kiến).

**KHÔNG được implement trong 11-B** (giữ nguyên trạng thái tương ứng, không reopen):
- quan-chuc (rule chính, R-QUANCHUC-01) — BLOCKED, semantics chưa xác định (xem mục 3/6).
- kien-tung D2 (支干乘刑) — ngoài phạm vi đã duyệt (`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` dòng 433), vẫn BLOCKED.
- kien-tung/suc-khoe (rule chính), thi-cu, tai-chinh, tim-do (rule phụ) — vẫn BLOCKED bởi 12 Trường Sinh/帘幕貴人/財鬼/太陽照武 (11-D), không reopen.

`src/rules/registry.ts` tự ghi rõ đúng phạm vi này trong comment nội bộ, khớp cập nhật ở đây.

Nội dung PLANNING gốc (giữ nguyên làm lịch sử):
- **Mục tiêu**: implement quan-chuc/hon-nhan/tim-do (rule chính) + kien-tung (2 rule phụ) — 4 candidate DIRECT, theo đúng khuôn R-NHATTHAN-01.
- **Tiên quyết**: không có (dùng thẳng 8 field freeze).
- **File khả năng bị ảnh hưởng**: `src/rules/r-quanchuc-01/`, `src/rules/r-honnhan-01/`, `src/rules/r-timdo-01/`, `src/rules/r-kientung-*/` (module mới, mỗi rule 1 thư mục — đúng pattern đã có), `src/rules/registry.ts` (thêm rule vào `PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY`).
- **Bằng chứng cần**: đã đủ (confidence A cho cả 3 rule chính, A cho 2 rule phụ kiện tụng).
- **Phạm vi implementation**: CHỈ 4 candidate DIRECT ở trên; KHÔNG kien-tung/suc-khoe rule chính, KHÔNG thi-cu, KHÔNG tai-chinh, KHÔNG tim-do rule phụ.
- **Test cần**: golden chart thật qua `calculateDaLiuRenChart()`, giống `r-nhatthan-01.test.ts`.
- **Tiêu chí freeze**: mỗi rule mới đăng ký qua `buildRuleRegistry`/`buildEvaluatorRegistry` thật, self-validate qua `buildInterpretationPackage`, 295 test cũ vẫn xanh + test mới xanh.
- **Non-goal tường minh**: KHÔNG implement conflict detection dù nhiều rule hơn cùng tồn tại — Option A vẫn giữ nguyên; KHÔNG mở rộng R-NHATTHAN-01 sang vế hợp-trục/chéo-trục.

### 11-C — API Integration — **STATUS: CLOSED (commit `a5968fe`)**
**[CẬP NHẬT]** Audit trực tiếp `src/pages/api/dai-luc-nham.ts` xác nhận route **ĐÃ ĐÚNG** (gọi
đúng `calculateDaLiuRenChart()`/pipeline hiện đại — Option B trong audit, KHÔNG phải Option A/
legacy-pipeline-bypass như nghi ngờ ban đầu). KHÔNG cần viết lại route. Chỉ thêm
`tests/dai-luc-nham-api.test.ts` (7 test) để validate — route file bản thân KHÔNG có diff nên
KHÔNG được commit riêng (đúng theo `git diff` rỗng, xác nhận tại thời điểm audit).

Nội dung PLANNING gốc (giữ nguyên làm lịch sử):
- **Mục tiêu**: viết lại `src/pages/api/dai-luc-nham.ts` để gọi `calculateDaLiuRenChart()` + `buildInterpretationPackage()`.
- **Tiên quyết**: KHÔNG PHỤ THUỘC 11-A hay 11-B — có thể làm với ĐÚNG 1 rule hiện có (R-NHATTHAN-01).
- **File khả năng bị ảnh hưởng**: CHỈ `src/pages/api/dai-luc-nham.ts` (ngoài package `daliuren-engine`) — KHÔNG đụng engine.
- **Bằng chứng cần**: không cần nghiên cứu domain — chỉ cần quyết định sản phẩm (route trả `DaLiuRenCalculationResult` thô hay `InterpretationPackage`, `questionType` lấy từ query param nào).
- **Phạm vi implementation**: 1 route.
- **Test cần**: test route (ngoài phạm vi package `daliuren-engine`).
- **Tiêu chí freeze**: route mới không đổi hành vi `calculateCalendarFoundation()`-based cũ trừ khi được yêu cầu thay thế hẳn (quyết định sản phẩm, không phải kỹ thuật).
- **Non-goal tường minh**: KHÔNG sửa engine; KHÔNG thêm rule mới chỉ để route "có gì đó để trả về".

### 11-D — Research Closure — **STATUS: CLOSED (research-only, không có production commit)**
**[CẬP NHẬT]** Đã research targeted đúng 4 blocker (R1-R4), kết luận đều **BLOCKED**, không
reopen:
- **R1 — 12 Trường Sinh**: BLOCKED — không đủ nguồn cổ điển đáng tin.
- **R2 — 帘幕貴人 (công thức tính)**: BLOCKED — chưa từng được audit công thức, chỉ có ý nghĩa.
- **R3 — 財/鬼 hóa (tai-chinh)**: BLOCKED — thuật ngữ chưa xác định có trùng khung 六親 hay không.
- **R4 — 太陽照武宜擒賊 (tim-do, rule phụ)**: BLOCKED — referent "太陽" chưa xác nhận.

`zeikeVariant` KHÔNG thuộc phạm vi vòng research R1-R4 này — vẫn giữ nguyên trạng thái RESEARCH/
BLOCKED cũ (Confidence C, 1 nguồn) như mục 3 đã ghi, chưa có vòng research riêng cho nó.

Nội dung PLANNING gốc (giữ nguyên làm lịch sử):
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
- **[CẬP NHẬT] Commit**: `13673af78e2cdcc963704daa4f56264059536b7c` (chỉ sửa `DA_LIU_REN_ALGORITHM_SPEC.md` §13 + mục 7/8/13 của chính roadmap này).
- **[CẬP NHẬT] Ngoài phạm vi, vẫn mở**: câu hỏi riêng biệt "`ChartInput.birthDate` cụ thể map
  sang năm Y nào" (trước/sau Lập Xuân) KHÔNG được 11-E giải quyết — 11-E CHỈ cross-check công
  thức Can-Chi cho 1 năm Y đã biết, không cross-check bước birthDate→Y. Vẫn ngoài phạm vi.

### 11-F — Architecture Decision (gender externalContext / CalculationProfile) — **STATUS: IMPLEMENTED/COMMITTED (`d1b7824`)**
**[CẬP NHẬT]** Owner đã quyết định VÀ đã implement (không chỉ dừng ở quyết định như PLANNING gốc
dự kiến):
- **Gender = Option A — ĐÃ IMPLEMENT**: `validateRuleRegistry` (Level 2) nay cho phép ĐÚNG
  `externalContext: ["gender"]`; mọi context khác (vd `birthDateBeyondCalendar`) vẫn bị chặn
  tuyệt đối. `RuleEvaluator` mở rộng backward-compatible với `context?: RuleEvaluationContext`
  (chỉ mang `gender`). `BuildInterpretationPackageInput.gender` truyền xuống evaluator qua
  `runEvaluator`. 4 evaluator production hiện có KHÔNG cần sửa.
- **CalculationProfile = Option P2 — GIỮ NGUYÊN (deferred)**: KHÔNG sửa 3 evaluator đang hardcode
  `CLASSICAL_V1_PROFILE`, KHÔNG đổi `RuleEvaluator` chỉ vì lý do profile. Technical debt vẫn giữ
  nguyên, chỉ resolve khi có `CalculationProfile` thứ 2 thật hoặc requirement mới bắt buộc.
- **KHÔNG có business rule sức khỏe gender nào được implement trong 11-F** — package này CHỈ mở
  kiến trúc. Rule thật (nếu có) là 1 package RIÊNG, hiện BLOCKED bởi evidence (xem mục 3/7 dòng
  suc-khoe rule phụ).
- Test: Level 2 cho phép đúng `["gender"]`/vẫn chặn context khác; backward-compat 4 evaluator;
  đường truyền gender từ input→evaluator; không schema/migration. Tất cả PASS trước khi commit.

Nội dung PLANNING gốc (giữ nguyên làm lịch sử):
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
| suc-khoe (rule phụ) | **KHÔNG ảnh hưởng** trực tiếp. **[CẬP NHẬT]** Kiến trúc đã mở (11-F, `d1b7824`) — hiện BLOCKED bởi evidence riêng, KHÔNG PHẢI kiến trúc/CalculationProfile (xem mục 7) |
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
3. ~~Có muốn mở ngoại lệ kiến trúc cho Level 2 gating để cho phép `externalContext=["gender"]`...~~ **ĐÃ TRẢ LỜI (11-F, commit `d1b7824`, 2026-09-23)**: CÓ, đã mở — CHỈ cho đúng `"gender"`, mọi context khác vẫn chặn tuyệt đối. Quyết định CÒN LẠI (chưa trả lời, KHÔNG thuộc phạm vi 11-F): rule sức khỏe gender cụ thể vẫn KHÔNG implement được — không phải vì kiến trúc nữa, mà vì **evidence không đủ** (E1 NOT CONFIRMED, E2 INSUFFICIENT — research targeted sau 11-F, không reopen).
4. ~~Có muốn chạy 11-E (cross-check 本命/行年) trước khi coi 2 field này "sẵn sàng implement", hay chấp nhận confidence B mãi mãi cho tới khi có nhu cầu thật.~~ **ĐÃ TRẢ LỜI (11-E CLOSED, 2026-09-22)**: đã chạy, KHỚP 78/78 — 本命 nâng A. Quyết định CÒN LẠI (chưa trả lời, KHÔNG thuộc phạm vi 11-E): có muốn gộp 本命/行年 vào 1 đợt implement Calculation Layer mới hay không — đây là quyết định implementation RIÊNG, ngoài phạm vi validation-only của 11-E.
5. Route `dai-luc-nham.ts` nên trả `DaLiuRenCalculationResult` thô, `InterpretationPackage`, hay cả 2 — và `questionType` nên lấy từ đâu (query param mới, giá trị mặc định, hay bắt buộc client truyền) — đây là quyết định SẢN PHẨM, không phải kỹ thuật.
6. Có cần resolve ràng buộc `CalculationProfile`-trong-evaluator TRƯỚC Phase 11, hay tiếp tục hoãn — mục 11 kết luận KHÔNG có candidate nào hiện tại cần nó, nhưng đây vẫn là 1 quyết định chủ dự án có thể muốn xử lý dứt điểm sớm để tránh nợ kỹ thuật tích luỹ. **[CẬP NHẬT] Vẫn MỞ** — 11-F đã chọn P2 (giữ nguyên), nhưng đó là quyết định CHO RIÊNG 11-F; câu hỏi tổng quát hơn "có nên resolve dứt điểm luôn hay không" vẫn chưa được trả lời.
7. **[MỚI, phát sinh sau khi Phase 11 đóng]** Có cần tiếp tục duy trì/cập nhật tài liệu roadmap/checkpoint theo từng phase tiếp theo (nếu owner mở thêm package mới trong tương lai), hay coi bộ tài liệu Phase 11 là đủ và dừng cập nhật cho tới khi có nhu cầu thật — đây thuần là quyết định quy trình làm việc, không ảnh hưởng code/kiến trúc.

---

## 14. Mục phải giữ nguyên đông cứng (deferred, tường minh)

- 12 Trường Sinh (tự thân, không phải các rule phụ thuộc nó) — RESEARCH, không có gì để code.
- Khóa Thể phụ (鑄印/軒蓋/連珠…) — DO_NOT_IMPLEMENT, không đổi.
- Công thức điều chỉnh lực Vượng Suy định lượng — đã gỡ khỏi SPEC vĩnh viễn, không được khôi phục.
- Conflict semantics (Option A) — không được xét lại ngầm trong bất kỳ package Phase 11 nào; chỉ có thể đổi qua 1 phase riêng, tương tự Phase 10.6.4/10.6.4A/10.6.4B.
- Bước SYNTHESIS (tổng hợp cát/hung cuối cùng) — vẫn thuộc Tầng 3 (AI, chưa xây), không code cứng ở Tầng 2.
- 6 loại question_type còn PARTIAL khác chưa nêu ở đây (財/nhà đất/mua bán/hợp tác/xuất hành/nhân sự) — ngoài phạm vi candidate đã audit ở tài liệu này, chưa có đánh giá Phase 11 riêng.

---

## 15. PHASE 11 — FINAL STATUS

**[MỤC MỚI, thêm khi đóng Phase 11 — 2026-09-23]**

### Status: **CLOSED — NO READY WORK PACKAGE REMAINS**

Mọi work package định nghĩa ở mục 8 đã kết thúc ở đúng 1 trong 2 trạng thái:

**DONE/CLOSED/FROZEN** (có commit thật, đã audit/test):
- 11-A1 (課體 primary) — `ecbd6ae`
- 11-A2 (空亡) — `629db3d`, `50e69e8`
- 11-A3 (旺衰 TÍNH) — `1d19d0a`
- 11-A4 (驛馬) — `01f31fe`, `68b05fb`, `6243c8f`
- 11-B (đúng phạm vi: R-HONNHAN-01/R-TIMDO-01/R-KIENTUNG-02) — `19dd4bf`, `4c161bf`
- 11-C (API integration, route đã đúng) — `a5968fe`
- 11-D (Research Closure R1-R4) — research-only, không production commit
- 11-E (Validation Closure 本命) — `13673af`
- 11-F (Architecture Decision gender) — `d1b7824`

**BLOCKED** (blocker đã xác định rõ, có nguồn trích dẫn, KHÔNG reopen):
- quan-chuc (rule chính) — semantics 前引後從 chưa xác định.
- kien-tung (rule chính), suc-khoe (rule chính) — 12 Trường Sinh (R1).
- kien-tung D2 (支干乘刑) — ngoài phạm vi đã duyệt, chưa có contract.
- thi-cu — 帘幕貴人 công thức tính (R2).
- tai-chinh — thuật ngữ 財/鬼 (R3).
- tim-do (rule phụ, 太陽照武) — referent chưa xác nhận (R4).
- suc-khoe (rule phụ, gender) — evidence insufficient (E1/E2), KHÔNG còn là architecture blocker.
- 課體 zeikeVariant — Confidence C, 1 nguồn.
- 12 Trường Sinh (tự thân) — không có contract.

**Không còn candidate ĐỘC LẬP nào chưa được động tới.** Những gì còn mở CHỈ là owner decisions
(mục 13) — phân bổ nguồn lực, có đầu tư thêm 1 vòng research nữa hay không, quyết định sản phẩm
cho route, dọn nợ kỹ thuật `CalculationProfile`, và quy trình duy trì tài liệu — KHÔNG phải công
việc kỹ thuật còn treo.

**Xác nhận rõ**: KHÔNG có Phase 12 nào được tạo. KHÔNG có package BLOCKED nào bị mở lại. KHÔNG có
production code nào bị sửa để đóng Phase 11 — toàn bộ việc đóng này thuần là tổng hợp lại trạng
thái đã có từ các commit/báo cáo thật, không phát sinh quyết định implementation mới nào.

---

Tài liệu này KHÔNG thay đổi bất kỳ trạng thái đông cứng nào đã có. Không có rule, calculation,
hay route mới nào được tạo ra khi viết tài liệu này.
