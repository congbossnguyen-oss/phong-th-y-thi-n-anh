# CONG TAIYI — Phase 11-B — Correction Plan (Confidence / Provenance Defects)

Tài liệu PHÂN TÍCH THUẦN TUÝ — không có dòng source/test nào bị sửa để viết tài liệu này. Dựa
trên phán quyết độc lập **C — CORRECTION REQUIRED** của
`DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md`. Mọi số liệu trong tài liệu này được TÁI XÁC MINH bằng
cách đọc lại source hiện tại + chạy code thật (không copy nguyên số liệu từ audit mà không kiểm
lại) — xem mục 2 cho bằng chứng chạy thật MỚI (khác/bổ sung so với audit).

---

## 1. P1 ROOT CAUSE

`evaluateHonNhan01` (`src/rules/r-honnhan-01/evaluator.ts`) và `evaluateKienTung02`
(`src/rules/r-kientung-02/evaluator.ts`) đều đọc `calculation.calendar.dayPillar.{can,chi}` như
1 GIÁ TRỊ THẬT (không chỉ để tra bảng tĩnh) nhưng KHÔNG tham chiếu
`GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` (confidence B, `src/calendar/provenance.ts`) hay resolver
`resolveDayOrHourPillarProvenance` (`src/interpretation/calendar-dependency-provenance.ts`) —
resolver đúng đắn, đã tồn tại sẵn, R-NHATTHAN-01 đang dùng cho CHÍNH TRƯỜNG HỢP tương tự. Do đó
`calculationConfidence` bị OVERSTATE (báo cao hơn mức bằng chứng thật cho phép).

**Bằng chứng chạy thật (tái xác minh độc lập lần 2, bổ sung golden chart MỚI so với audit gốc)**:

```
Chart 2024-01-01 00:30 (hourChi=Tý, Zi-hour):
  R-NHATTHAN-01  D  | R-HONNHAN-01  B (không trigger) | R-KIENTUNG-02  A (không trigger)

Chart 2024-03-05 23:00 / 0:30 (hourChi=Tý, Zi-hour) — MỚI TÌM THẤY, CẢ 2 RULE ĐỀU TRIGGER:
  R-HONNHAN-01   status=triggered  calculationConfidence=B   (SAI — phải là D)
  R-KIENTUNG-02  status=triggered  calculationConfidence=A   (SAI — phải là D)

Chart 2024-05-10 14:00 (hourChi=Mùi, normal-hour), R-HONNHAN-01 trigger:
  calculationConfidence=B   (ĐÚNG GIÁ TRỊ, nhưng SAI thành phần — xem P2-1)

Chart 2024-02-01 22:00 (hourChi=Hợi, normal-hour), R-KIENTUNG-02 trigger:
  calculationConfidence=A   (SAI — phải là B, ngay cả không xét Zi-hour)
```

`2024-03-05 23:00`/`0:30` là golden chart ĐẦU TIÊN tìm được nơi CẢ HAI rule lỗi cùng trigger trên
1 chart Zi-hour — giá trị cho mục 10 (validation plan) bên dưới.

---

## 2. P2 ROOT CAUSES

### P2-1 — R-HONNHAN-01 trích `FOUR_LESSONS_PROVENANCE` dù KHÔNG đọc `fourLessons`

Đã tái xác minh: `evaluateHonNhan01` KHÔNG có bất kỳ tham chiếu `calculation.fourLessons` nào
(grep xác nhận, 0 kết quả). `JI_GONG_TABLE` được import TRỰC TIẾP từ `four-lessons/table.ts` như
1 HẰNG SỐ TĨNH (10 dòng Can→Chi, không phụ thuộc chart) — KHÁC với việc đọc field
`calculation.fourLessons` (1 giá trị TÍNH RA cho từng chart cụ thể, qua toàn bộ pipeline
`heavenPlateAt` + `JI_GONG_TABLE` + cấu trúc Khóa 1→4). `FOUR_LESSONS_PROVENANCE` mô tả ĐÚNG
"Công thức lập 4 Khóa (bảng 寄宮 + phép ghép Khóa 1→2→3→4)" — tức phạm vi của nó là TOÀN BỘ pipeline
tính `fourLessons`, KHÔNG PHẢI riêng bảng `JI_GONG_TABLE` cô lập.

**Root cause**: mâu thuẫn nội tại giữa mục C (field-path table) và mục E-K (tóm tắt) của contract
— mục C gán provenance "FOUR_LESSONS_PROVENANCE" cho dòng JI_GONG_TABLE, mục E-K lại viết "tái
dùng 3 id" (không có Four Lessons). Implementer đã chọn theo mục C mà không gắn cờ mâu thuẫn.

**Quyết định (theo đúng yêu cầu "không thêm field đọc giả để chiều theo provenance")**:
`dependencies.calculationFields` của R-HONNHAN-01 (`rule.ts`) **ĐÃ ĐÚNG** — `["calendar.dayPillar",
"twelveGenerals"]`, không có `"fourLessons"`, khớp CHÍNH XÁC những gì evaluator thực sự đọc.
**KHÔNG được thêm `"fourLessons"` vào đây** (đó sẽ là "thêm field đọc giả"). Thay vào đó, PHẢI GỠ
`FOUR_LESSONS_PROVENANCE` khỏi `calculationProvenanceIds`/`calculationConfidence` của evaluator —
`JI_GONG_TABLE` là hằng số tĩnh đã tự mang trích dẫn cổ điển riêng trong file header của chính nó
(`four-lessons/table.ts`, đã cross-verify độc lập 2 repo) — CÙNG MỨC ĐỘ với `EARTH_PLATE`
(`Data.CHI`), vốn KHÔNG rule nào trong repo tự tạo provenance riêng khi dùng nó. Không cần entry
provenance mới cho JI_GONG_TABLE.

### P2-2 — Mâu thuẫn trong CHÍNH contract mục D1

Trích nguyên văn 2 chỗ mâu thuẫn TRONG CÙNG 1 tài liệu
(`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md`):

- **"NÓI A"** — mục "D1. 鬼臨三四 (pháp 70)", phần E-K tóm tắt:
  > *"Confidence: ruleConfidence=A; calculationConfidence=A (chỉ phụ thuộc fourLessons, giống hệt
  > trường hợp 'clean' của R-NHATTHAN-01 khi không rơi vào vùng Tý — ở đây KHÔNG có dayPillar phụ
  > thuộc Zi-hour vì rule này không đọc calendar.hourPillar)."*

- **"NÓI B"** — mục "R-NHATTHAN-01 REGRESSION CONTRACT" (cùng file này):
  > *"2024-01-04 10:00: 2 signal (cả 2 'sheng', auspicious), `calculationConfidence=B`."*

  Đây CHÍNH LÀ trường hợp "clean" (non-Zi-hour) của R-NHATTHAN-01 mà mục D1 tự so sánh — và giá
  trị đã đóng băng là **B**, không phải A. Cùng xác nhận ở
  `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` mục 4: *"Chart KHÔNG rơi vào vùng Tý ... :
  calculationConfidence = B."*

- **R-NHATTHAN precedent thực sự thiết lập gì**: BẤT KỲ field nào đọc `calendar.dayPillar` (dù
  không đọc `hourPillar` trực tiếp) đều kế thừa độ bất định của phép DỰNG `dayPillar`
  (`GANZHI_PILLAR_CONSTRUCTION_PROVENANCE`, confidence B) — lý do "không đọc `hourPillar`" mà mục
  D1 dùng để miễn trừ dependency này là NGỤY BIỆN, vì sự mơ hồ Zi-hour nằm ở CHÍNH GIÁ TRỊ
  `dayPillar` (được dựng theo 1 trong 3 policy tranh cãi tuỳ giờ), không nằm ở việc có đọc
  `hourPillar` hay không.

- **Interpretation nào khớp kiến trúc Model C đã đóng băng**: "NÓI B" (worst-of thật, không hard-
  code) — đây CHÍNH LÀ nguyên tắc Model C ("calculationConfidence PHẢI phản ánh MỌI provenance mà
  field ĐÃ ĐỌC THỰC SỰ chạm tới", `interpretation/rule.ts` doc comment). "NÓI A" vi phạm nguyên tắc
  này.

**Đề xuất sửa TỐI THIỂU cho contract** (CHƯA thực hiện — chỉ đề xuất câu chữ, theo đúng yêu cầu
"không tự ý viết lại contract"):

> Thay đoạn "Confidence" của mục D1 thành: *"Confidence: ruleConfidence=A; calculationConfidence
> = worst-of(FOUR_LESSONS_PROVENANCE=A, GANZHI_PILLAR_CONSTRUCTION_PROVENANCE=B) = **B** cho chart
> không rơi vùng Tý (rule NÀY VẪN đọc `calendar.dayPillar.can` để tra Ngũ Hành Can Ngày, nên KHÔNG
> được miễn trừ dependency GanZhi-construction chỉ vì không đọc `calendar.hourPillar` trực tiếp —
> đính chính so với bản gốc, xem Phase 11-B Correction Plan); = **D** nếu chart rơi vùng Tý (dùng
> lại đúng `resolveDayOrHourPillarProvenance` qua proxy `hourPillar.chi==='Tý'`, giống
> R-NHATTHAN-01)."*
> Đồng thời sửa dòng field-path "Can Ngày" ở mục C để ghi thêm: *"Provenance: `worstConfidence`
> chain qua `resolveDayOrHourPillarProvenance`, KHÔNG PHẢI chỉ `fourLessonsProvenanceId` đơn lẻ."*

---

## 3. P3 TEST-GAP ASSESSMENT

| # | Finding | Bắt buộc trước commit? | Lý do |
|---|---|---|---|
| 1 | Không có test Zi-hour + TRIGGERED cho HON-NHAN | **BẮT BUỘC** | Chính xác kịch bản làm lộ P1 — không có test này, bản sửa KHÔNG có regression-proof. |
| 2 | Không có test Zi-hour + TRIGGERED cho KIEN-TUNG | **BẮT BUỘC** | Tương tự #1 — kien-tung còn nghiêm trọng hơn (sai cả ở normal-hour). |
| 3 | TIM-DO: test âm không cô lập "method sai nhưng Huyền Vũ đúng vị trí" | Có ích, KHÔNG bắt buộc | Không liên quan tới P1/P2 — TIM-DO không có defect. Gap mutation-coverage độc lập. |
| 4 | HON-NHAN: thiếu test "Can/Chi trùng vị trí Địa Bàn" | Có ích, KHÔNG bắt buộc | Edge case lý thuyết, không có bằng chứng đang sai; không liên quan P1/P2. |
| 5 | Thiếu test tường minh "evaluator không đọc field cấm" | **Được thoả MỘT PHẦN qua #1/#2** | #1/#2 (assert `calculationConfidence` đổi theo `hourPillar.chi`) chính LÀ dạng cụ thể của loại test này cho 2 rule có lỗi. Không cần thêm test riêng biệt "forbidden field" tổng quát — chưa có bằng chứng field cấm nào khác (gender/externalContext) bị đọc sai. |

**Case cụ thể cần cho #1/#2**: chart `2024-03-05 23:00` (hoặc `0:30`) — ĐÃ xác nhận (mục 1) CẢ
HON-NHAN lẫn KIEN-TUNG đều trigger trên chart này, hourChi=Tý — 1 golden chart DUY NHẤT phủ cả 2
gap cùng lúc.

---

## 4. CORRECT CONFIDENCE MATRIX (đã xác nhận bằng chứng, không phần nào "unresolved")

| Rule | Normal hour (không Zi-hour) | Zi-hour (`hourPillar.chi==="Tý"`) | Cơ chế |
|---|---|---|---|
| R-NHATTHAN-01 | B *(baseline hiện có, KHÔNG đổi)* | D *(baseline hiện có, KHÔNG đổi)* | `resolveDayOrHourPillarProvenance` (đã có, không sửa) |
| R-HONNHAN-01 | **B** *(giá trị KHÔNG đổi so với hiện tại, nhưng nguồn provenance đổi — xem mục 2)* | **D** *(đổi từ B sai → D đúng)* | worst-of(`resolveDayOrHourPillarProvenance`, 3× `TWELVE_GENERALS_*`) |
| R-KIENTUNG-02 | **B** *(đổi từ A sai → B đúng)* | **D** *(đổi từ A sai → D đúng)* | worst-of(`FOUR_LESSONS_PROVENANCE`, `resolveDayOrHourPillarProvenance`) |
| R-TIMDO-01 | B/A tuỳ pháp *(KHÔNG đổi — rule này không đọc `calendar.dayPillar`, đã xác nhận sạch)* | *(không áp dụng — rule không phụ thuộc dayPillar)* | Không cần sửa |

Toàn bộ giá trị trên có căn cứ TRỰC TIẾP từ: (a) code `resolveDayOrHourPillarProvenance` đã tồn
tại + đã verify hành vi qua R-NHATTHAN-01, (b) `worstConfidence` là so sánh thứ hạng thuần tuý,
tất định. **Không có ô nào "unresolved"** — mọi giá trị đều suy ra được từ provenance ĐÃ CÓ SẴN
trong repo, không cần bằng chứng mới.

---

## 5. CORRECT PROVENANCE DEPENDENCIES (sau khi sửa)

### R-HONNHAN-01
```
calculationProvenanceIds =
  [...resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE).provenanceIds,
   TWELVE_GENERALS_ORDER_PROVENANCE.id,
   TWELVE_GENERALS_ANCHOR_PROVENANCE.id,
   TWELVE_GENERALS_DIRECTION_PROVENANCE.id]
```
(GỠ `FOUR_LESSONS_PROVENANCE.id` — không còn trong danh sách; XEM mục 2 P2-1.)
`representativeHour` tính giống hệt R-NHATTHAN-01:
`calculation.calendar.hourPillar.chi === "Tý" ? 23 : 12`.

### R-KIENTUNG-02
```
calculationProvenanceIds =
  [FOUR_LESSONS_PROVENANCE.id,
   ...resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE).provenanceIds]
```
(THÊM chuỗi GanZhi/Zi-hour — GIỮ NGUYÊN `FOUR_LESSONS_PROVENANCE.id` vì `fourLessons.lesson3`/
`.lesson4` VẪN thực sự được đọc, không đổi.)

### R-TIMDO-01
Không đổi — đã xác nhận KHÔNG đọc `calendar.dayPillar`/`.hourPillar` ở bất kỳ đâu.

Cả 2 danh sách trên dùng ĐÚNG hàm `resolveDayOrHourPillarProvenance` đã có sẵn
(`interpretation/calendar-dependency-provenance.ts`) — KHÔNG cần hàm mới, KHÔNG cần entry
provenance mới (`GANZHI_PILLAR_CONSTRUCTION_PROVENANCE`/`ZI_HOUR_POLICY_PROVENANCE` đã có mặt sẵn
trong `PRODUCTION_CALCULATION_PROVENANCE`, kế thừa từ khi R-NHATTHAN-01 được đăng ký — đã xác nhận
đọc lại `rules/registry.ts` dòng 48-49).

---

## 6. CONTRACT CONTRADICTION

Xem mục 2 (P2-2) — đã trích nguyên văn "nói A"/"nói B", xác định "nói B" đúng theo Model C, và đề
xuất câu chữ sửa tối thiểu. KHÔNG tự sửa file contract ở đây.

---

## 7. MINIMUM SAFE CORRECTION

**Nguyên tắc**: TÁI SỬ DỤNG 100% cơ chế đã có (`resolveDayOrHourPillarProvenance`,
`worstConfidence`) — không tạo hàm/khái niệm/field mới nào.

### 7.1 `src/rules/r-honnhan-01/evaluator.ts` (mô tả thay đổi, CHƯA áp dụng)
- Thêm import: `resolveDayOrHourPillarProvenance` (từ `interpretation/calendar-dependency-provenance.ts`), `CLASSICAL_V1_PROFILE` (từ `profiles/classical-v1.ts`) — ĐÚNG 2 import R-NHATTHAN-01 đã dùng, không gì khác.
- XOÁ import `FOUR_LESSONS_PROVENANCE`.
- Thêm dòng tính `representativeHour` (copy nguyên logic từ R-NHATTHAN-01, có comment giải thích y hệt).
- Đổi `calculationConfidence`/`calculationProvenanceIds` sang worst-of với `dayPillarProvenance` thay cho `FOUR_LESSONS_PROVENANCE` (xem công thức mục 5).
- **KHÔNG đổi** bất kỳ dòng nào liên quan `computeAxisOutcome`/`axisOutcomes`/subject/object/relation/polarity/descriptionKey — 0 thay đổi ngữ nghĩa cổ điển.

### 7.2 `src/rules/r-kientung-02/evaluator.ts` (mô tả thay đổi, CHƯA áp dụng)
- Thêm 2 import giống trên.
- Thêm dòng `representativeHour`.
- Đổi `calculationConfidence`/`calculationProvenanceIds` sang worst-of(FOUR_LESSONS, dayPillarProvenance) — GIỮ `FOUR_LESSONS_PROVENANCE` (vẫn đúng, không gỡ).
- **KHÔNG đổi** `lesson3IsGhost`/`lesson4IsGhost`/subject/object/relation/polarity — 0 thay đổi ngữ nghĩa cổ điển, 0 thay đổi điều kiện trigger.

### 7.3 `src/rules/r-honnhan-01/rule.ts`, `src/rules/r-kientung-02/rule.ts`
Không cần sửa — `dependencies.calculationFields` của cả 2 file ĐÃ khai đúng `"calendar.dayPillar"`
từ trước (đã tự kiểm tra lại, mục 2). Có thể (MAY, không bắt buộc) thêm 1 dòng comment giải thích
rõ hơn lý do cần `resolveDayOrHourPillarProvenance`.

### 7.4 Tài liệu
- `DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` mục D1: sửa theo đề xuất mục 2
  P2-2 (KHÔNG thực hiện trong phase này).

**Xác nhận KHÔNG vi phạm ràng buộc**: correction này KHÔNG đổi classical semantics (điều kiện
trigger/polarity/relation giữ nguyên 100%), KHÔNG đổi signal polarity/relation, KHÔNG đổi
QuestionType gating, KHÔNG đổi kiến trúc conflict (`conflicts=[]` không liên quan), KHÔNG đổi
`chartId` (hàm `buildChartId` không đọc `calculationConfidence`), KHÔNG đổi bất kỳ dòng nào của
R-NHATTHAN-01, KHÔNG đổi thuật toán Calculation Layer (chỉ đổi CÁCH RULE ĐỌC provenance đã có sẵn,
không tính lại field nào).

---

## 8. REGRESSION MATRIX

Xem mục 4 — đầy đủ, có căn cứ, không ô nào unresolved.

---

## 9. FILE CHANGE PLAN

### MUST CHANGE
- `packages/daliuren-engine/src/rules/r-honnhan-01/evaluator.ts` — sửa P1 + P2-1 (mục 7.1).
- `packages/daliuren-engine/src/rules/r-kientung-02/evaluator.ts` — sửa P1 (mục 7.2).
- `packages/daliuren-engine/tests/unit/rules/r-honnhan-01.test.ts` — cập nhật assertion
  `calculationProvenanceIds` (mục [E]); thêm case Zi-hour triggered (P3 #1).
- `packages/daliuren-engine/tests/unit/rules/r-kientung-02.test.ts` — **SỬA** test hiện đang
  khẳng định hành vi SAI (mục [E], dòng *"calculationConfidence='A' KHÔNG đổi kể cả ở chart rơi
  vào vùng Tý"*) thành đúng; cập nhật assertion `calculationProvenanceIds`; thêm case Zi-hour
  triggered + case normal-hour trigger xác nhận B (P3 #2).

### MAY CHANGE (không bắt buộc cho việc sửa P1/P2)
- `packages/daliuren-engine/src/rules/r-honnhan-01/rule.ts`,
  `packages/daliuren-engine/src/rules/r-kientung-02/rule.ts` — comment giải thích, không đổi field.
- `packages/daliuren-engine/tests/unit/rules/multi-rule-integration.test.ts` — thêm 1 case
  chéo-rule trên chart `2024-03-05 23:00` (cả hon-nhan lẫn kien-tung cùng trigger, cùng Zi-hour) để
  có 1 regression-proof cấp package-builder, không chỉ cấp evaluator đơn lẻ.
- `packages/daliuren-engine/tests/unit/rules/r-timdo-01.test.ts` — đóng P3 #3.
- `packages/daliuren-engine/tests/unit/rules/r-honnhan-01.test.ts` — đóng P3 #4 (case trùng vị trí).
- `docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` — sửa mục D1
  (mục 2 P2-2) — tài liệu, không phải code, nhưng vẫn NGOÀI PHẠM VI phase phân tích này.

### MUST NOT CHANGE
- `packages/daliuren-engine/src/rules/r-nhatthan-01/**` (frozen, đã re-verify KHÔNG cần sửa).
- `packages/daliuren-engine/src/rules/r-timdo-01/**` (sạch, không có defect).
- `packages/daliuren-engine/src/interpretation/**` (Model C, `chart-id.ts`, `signal.ts`,
  `confidence.ts`, `calendar-dependency-provenance.ts`, `rule.ts` — TÁI DÙNG nguyên trạng).
- `packages/daliuren-engine/src/validation/**` (Level 1/2 gating, registry validators).
- `packages/daliuren-engine/src/rules/registry.ts` (provenance cần thiết ĐÃ có sẵn trong
  `PRODUCTION_CALCULATION_PROVENANCE`, không cần entry mới).
- `packages/daliuren-engine/tests/unit/rules/r-nhatthan-01.test.ts`,
  `packages/daliuren-engine/tests/unit/interpretation-package-builder.test.ts` (đã đúng, không
  liên quan P1/P2).
- `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` (baseline đóng băng).
- Mọi file ngoài `packages/daliuren-engine/` (website, `cloudflare-migration`, `astrology-core`).

---

## 10. TESTS TO ADD/UPDATE (validation plan cho lần sửa thật, KHÔNG chạy ở phase này)

Sau khi sửa (phase implement riêng, KHÔNG PHẢI phase này), các mục sau PHẢI pass — không được
claim pass trước khi thực sự chạy:

1. **372 test baseline** — chỉ 2 assertion được phép đổi giá trị kỳ vọng (đúng lý do đã nêu, không
   phải vá lỗi tuỳ tiện): `r-honnhan-01.test.ts` mục [E] (`calculationProvenanceIds`),
   `r-kientung-02.test.ts` mục [E] (cả `calculationProvenanceIds` LẪN dòng test hiện đang khẳng
   định sai — đây là sửa 1 test ĐANG SAI, không phải làm yếu 1 test ĐANG ĐÚNG).
2. **Zi-hour HON-NHAN** (chart 2024-03-05 23:00 hoặc 0:30): `status=triggered`,
   `calculationConfidence="D"`, `calculationProvenanceIds` chứa `PROV-GANZHI-PILLAR-CONSTRUCTION` +
   `PROV-PROFILE-ZIHOUR-CONFLICTING` (KHÔNG còn `PROV-FOUR-LESSONS-CONSTRUCTION`).
3. **Normal-hour HON-NHAN** (chart 2024-05-10 14:00, đã có sẵn): `calculationConfidence="B"`
   KHÔNG đổi giá trị, NHƯNG `calculationProvenanceIds` đổi thành
   `["PROV-GANZHI-PILLAR-CONSTRUCTION", "PROV-TWELVE-GENERALS-ORDER", "PROV-TWELVE-GENERALS-ANCHOR", "PROV-TWELVE-GENERALS-DIRECTION"]`.
4. **Zi-hour KIEN-TUNG** (chart 2024-03-05 23:00 hoặc 0:30): `status=triggered`,
   `calculationConfidence="D"`.
5. **Normal-hour KIEN-TUNG** (chart 2024-02-01 22:00, đã có sẵn): `calculationConfidence` đổi từ
   `"A"` → `"B"`, `calculationProvenanceIds` đổi từ `["PROV-FOUR-LESSONS-CONSTRUCTION"]` →
   `["PROV-FOUR-LESSONS-CONSTRUCTION", "PROV-GANZHI-PILLAR-CONSTRUCTION"]`.
6. **R-NHATTHAN golden cases** (4 case đóng băng) — PHẢI KHÔNG đổi 1 ký tự nào (rule này không bị
   sửa).
7. **Provenance integrity** — `validateInterpretationPackage` (IP-2/IP-2b) vẫn PASS cho mọi
   package dựng từ 2 rule đã sửa (registry.ts không đổi nên mọi id vẫn resolve được).
8. **Confidence integrity** — `overallLowestConfidence` trong `multi-rule-integration.test.ts` cho
   chart hon-nhan hiện có (2024-05-10, non-Zi-hour) KHÔNG đổi giá trị ("B") dù nguồn thành phần đổi
   — cần re-chạy để xác nhận (không giả định).
9. **Multi-rule integration** — case MỚI (MAY CHANGE, mục 9) trên chart Zi-hour đa-rule.
10. **Deterministic output** — 2 evaluator sau khi sửa vẫn PHẢI pure (không Date.now/random),
    xác nhận lại qua test "gọi 2 lần cùng input".
11. **Typecheck** (`npm run typecheck`) — PASS.
12. **Build** (`npm run build`) — PASS.

**KHÔNG claim bất kỳ mục nào ở trên đã PASS — đây là kế hoạch, chưa thực thi.**

---

## 11. REGRESSION BOUNDARY

Ranh giới ảnh hưởng ĐÃ XÁC NHẬN chỉ gồm:
- `Signal.calculationConfidence`/`RuleResult.calculationConfidence`/
  `Signal.calculationProvenanceIds` của R-HONNHAN-01 và R-KIENTUNG-02 — CHỈ 2 rule này.
- `InterpretationPackage.confidence_summary.overallLowestConfidence` CHỈ đổi cho package nào có
  ÍT NHẤT 1 signal triggered từ 2 rule này TRÊN 1 chart Zi-hour (rất hẹp — hầu hết chart không rơi
  Zi-hour sẽ KHÔNG đổi `overallLowestConfidence` vì B vẫn là B).
- KHÔNG ảnh hưởng: `verified_rules` (trigger/not-triggered không đổi), `signals[].subject/object/
  relation/polarity/descriptionKey`, `provenance` map keys hợp lệ (chỉ đổi THÀNH PHẦN nào được
  tham chiếu, không đổi cấu trúc map), `conflicts`, `chart_reference`, `forbidden_inferences`.

---

## 12. ARCHITECTURE IMPACT

**KHÔNG CÓ.** Xác nhận từng mục STOP CONDITION của brief:
- Không đổi kiến trúc đóng băng (`evaluate(calculation): RuleResult` giữ nguyên chữ ký).
- Không đổi Model C (vẫn `ruleConfidence`/`calculationConfidence` tách biệt, vẫn `worstConfidence`
  thuần thứ hạng).
- Không đổi `chartId`/`buildChartId` (không đọc `calculationConfidence`).
- Không đổi ngữ nghĩa Calculation Layer (không sửa bất kỳ file `compute.ts`/`*.table.ts` nào).
- Không đổi ngữ nghĩa R-NHATTHAN-01 (0 dòng trong `r-nhatthan-01/` bị chạm).
- Không cần generic conflict detection (`conflicts=[]` không liên quan tới confidence).
- Không cần calculation capability mới (`resolveDayOrHourPillarProvenance` ĐÃ TỒN TẠI, chỉ được
  GỌI THÊM từ 2 evaluator, không viết logic mới).

Đây là bản sửa GỌN NHẤT có thể — 100% tái sử dụng cơ chế đã kiểm chứng qua R-NHATTHAN-01.

---

## 13. TÓM TẮT — KHÔNG THỰC HIỆN Ở PHASE NÀY

Phase này CHỈ phân tích. Không file source/test nào bị sửa (xác nhận qua `git status`, mục cuối
báo cáo). Việc thực thi correction (nếu được uỷ quyền) là 1 phase RIÊNG, sau khi tài liệu này được
duyệt.
