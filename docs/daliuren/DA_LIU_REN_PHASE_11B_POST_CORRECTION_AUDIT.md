# CONG TAIYI — Phase 11-B — Independent Post-Correction Audit

Audit ĐỘC LẬP lần 2 — xác nhận (hoặc bác bỏ) claim "CORRECTION IMPLEMENTED" của phase sửa lỗi sau
audit độc lập lần 1. KHÔNG dựa vào báo cáo implementer — mọi kết luận TỰ tái tạo từ đọc lại source/
contract hiện tại + chạy code thật (script độc lập, KHÔNG tái dùng test file làm oracle duy nhất).
KHÔNG sửa source/test/doc, KHÔNG commit (xác nhận qua `git status`, mục 9).

---

## 1. SCOPE

Đọc lại: `DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md`, `DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md`,
`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` (mục D1 đã sửa). Inspect trực
tiếp: `src/rules/r-honnhan-01/evaluator.ts`, `src/rules/r-kientung-02/evaluator.ts`,
`src/rules/r-nhatthan-01/evaluator.ts` (đối chiếu), `src/rules/r-timdo-01/*` (xác nhận sạch), 4 file
test liên quan. Chạy: `npx vitest run`, `npm run typecheck`, `npm run build` (package + workspace),
cộng 4 script Node độc lập (KHÔNG lấy từ implementer) quét 2154 lá số thật trong năm 2024.

---

## 2. PREVIOUS P1/P2 (nhắc lại để đối chiếu)

- **P1** (audit lần 1): `R-HONNHAN-01`/`R-KIENTUNG-02` đọc `calendar.dayPillar` như giá trị thật
  nhưng KHÔNG fold `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE`/Zi-hour downgrade — confidence bị
  overstate (hon-nhan: B thay vì D lúc Zi-hour; kien-tung: A thay vì B/D mọi lúc).
- **P2-1**: `R-HONNHAN-01` trích `FOUR_LESSONS_PROVENANCE` dù không đọc `fourLessons`.
- **P2-2**: Contract mục D1 tự mâu thuẫn ("giống hệt trường hợp 'clean' của R-NHATTHAN-01" nhưng
  ghi A, trong khi trường hợp đó đã đóng băng là B).

---

## 3. EVIDENCE OF CORRECTION (tái tạo độc lập, KHÔNG tin báo cáo)

### 3.1 Source code — đối chiếu trực tiếp với `r-nhatthan-01/evaluator.ts`

Đọc lại CẢ 3 evaluator (`r-nhatthan-01`, `r-honnhan-01`, `r-kientung-02`) side-by-side:

- `evaluateHonNhan01` (dòng 75-87): tính `representativeHour` ĐÚNG cùng công thức
  (`hourPillar.chi === "Tý" ? 23 : 12`), gọi `resolveDayOrHourPillarProvenance(representativeHour,
  CLASSICAL_V1_PROFILE)`, gộp vào `worstConfidence` chain. `FOUR_LESSONS_PROVENANCE` KHÔNG còn
  xuất hiện ở BẤT KỲ đâu trong file (đã grep xác nhận, 0 kết quả).
- `evaluateKienTung02` (dòng 50-54): CÙNG pattern, `FOUR_LESSONS_PROVENANCE` GIỮ NGUYÊN (đúng, vì
  `fourLessons.lesson3/.lesson4` vẫn thực sự được đọc ở dòng 40-41), gộp thêm
  `dayPillarProvenance` vào `worstConfidence`.
- Cả 2 evaluator GIỐNG HỆT cơ chế `r-nhatthan-01/evaluator.ts` dòng 90-94 — không có mechanism
  mới, không hard-code chuỗi "B"/"D" nào (chỉ đọc từ `resolveDayOrHourPillarProvenance`/
  `worstConfidence`, cả 2 hàm KHÔNG bị sửa — đã đọc lại `calendar-dependency-provenance.ts`,
  100% giống các audit trước).

### 3.2 Runtime — quét ĐỘC LẬP 2154 lá số thật (năm 2024, đủ 12 tháng, 7 mốc giờ/ngày)

Script tự viết (không dùng lại test file), kiểm 5 bất biến cho MỌI lá số:

```
Tổng lá số quét: 2154 | Zi-hour: 618 | HN trigger: 659 | KT trigger: 65
Giá trị calculationConfidence PHÂN BIỆT đã thấy — HN: ['D','B'] | KT: ['D','B']
VI PHẠM PHÁT HIỆN: 0
```

5 bất biến đã kiểm cho TỪNG lá số (không mẫu con):
1. `calculationConfidence` = D khi VÀ CHỈ KHI `hourPillar.chi==="Tý"`, ngược lại = B — cho CẢ
   HON-NHAN lẫn KIEN-TUNG.
2. HON-NHAN KHÔNG BAO GIỜ trích `PROV-FOUR-LESSONS-CONSTRUCTION` (per RuleResult lẫn per-signal).
3. Mọi signal KIEN-TUNG trích ĐỦ `PROV-FOUR-LESSONS-CONSTRUCTION` + `PROV-GANZHI-PILLAR-CONSTRUCTION`
   (+ `PROV-PROFILE-ZIHOUR-CONFLICTING` CHỈ KHI Zi-hour, KHÔNG BAO GIỜ khi không Zi-hour). Mọi
   signal HON-NHAN trích ĐỦ `PROV-GANZHI-PILLAR-CONSTRUCTION` (+ Zi-hour tương tự).
4. `calculationConfidence` của HON-NHAN/KIEN-TUNG KHÔNG BAO GIỜ là "A" hay "C" (CHỈ B hoặc D) —
   0/2154 vi phạm, tức lỗi P1 gốc (KIEN-TUNG luôn báo "A") KHÔNG TÁI XUẤT HIỆN Ở BẤT KỲ lá số nào.
5. `ruleConfidence` luôn "A" cho cả 3 rule, mọi lá số.

### 3.3 Adversarial — cố tình tìm counterexample (mục 8 yêu cầu)

- Đã tìm và kiểm case HIẾM: chart Zi-hour VỚI CẢ 2 trục HON-NHAN cùng trigger (`2024-06-19
  23:00`) — `calculationConfidence="D"`, `calculationProvenanceIds` GIỐNG HỆT nhau giữa 2 signal
  — không có drift giữa các signal trong cùng 1 evaluate() call.
- Đã kiểm multi-rule package cho 9 tổ hợp (chart × questionType) khác nhau, bao gồm cả trường hợp
  rule chuyên biệt KHÔNG trigger (chỉ R-NHATTHAN-01 trigger) trên chart Zi-hour — xác nhận
  `overallLowestConfidence` vẫn đúng "D" (vì R-NHATTHAN-01 tự nó cũng D trên chart đó) — **0/9
  mismatch**, tự tính lại `worstConfidence` thủ công đối chiếu với giá trị package trả về.
- Đã kiểm TIM-DO trên mẫu quét riêng (rộng, nhiều tháng/giờ) — **KHÔNG BAO GIỜ** thấy
  `calculationConfidence="D"` (đúng, vì rule này không đọc `dayPillar`) — xác nhận KHÔNG bị lây
  lan bởi correction.
- Đã kiểm determinism: build CÙNG package 5 lần liên tiếp → JSON HỆT NHAU cả 5 lần.
- Đã kiểm purity: gọi evaluator KHÔNG mutate `calculation` đầu vào (so JSON trước/sau).

**KHÔNG tái tạo được BẤT KỲ counterexample nào cho P1/P2 cũ.**

---

## 4. CONFIDENCE MATRIX — XÁC NHẬN ĐÚNG (chạy thật, không suy diễn)

| Rule | Normal hour | Zi-hour |
|---|---|---|
| R-NHATTHAN-01 | B *(4 golden case tái xác nhận, xem mục 6)* | D |
| R-HONNHAN-01 | **B** ✅ | **D** ✅ |
| R-KIENTUNG-02 | **B** ✅ | **D** ✅ |
| R-TIMDO-01 | B *(worst-of luôn bị Direction=B chi phối, không phụ thuộc dayPillar)* | không áp dụng *(rule không đọc dayPillar — đã quét xác nhận không có drift)* |

Khớp CHÍNH XÁC ma trận đã duyệt trong Correction Plan mục 4/8, KHÔNG có ô nào lệch.

---

## 5. PROVENANCE VERIFICATION

- **HON-NHAN**: 0/2154 lá số trích `FOUR_LESSONS_PROVENANCE` — P2-1 ĐÃ ĐÓNG hoàn toàn, không tái
  xuất hiện dưới bất kỳ điều kiện nào đã quét.
- **KIEN-TUNG**: `FOUR_LESSONS_PROVENANCE` GIỮ NGUYÊN đúng (vẫn đọc `fourLessons`), THÊM
  `resolveDayOrHourPillarProvenance` đúng điều kiện — không entry provenance MỚI nào được tạo
  (đã đọc lại `rules/registry.ts` — `PRODUCTION_CALCULATION_PROVENANCE` giữ NGUYÊN 8 entry, không
  đổi so với sau khi implement Phase 11-B gốc, KHÔNG có entry mới thêm ở phase correction này).
- **Provenance map cấp package**: đã kiểm cho chart Zi-hour đa-rule — `PROV-FOUR-LESSONS-CONSTRUCTION`
  VẪN xuất hiện trong `pkg.provenance` (hợp lệ, do R-NHATTHAN-01 trích, KHÔNG PHẢI do R-HONNHAN-01)
  — không nhầm lẫn giữa "có trong map" và "được rule này trích".
- **Không phát hiện provenance overclaim hay thiếu sót nào** trên toàn bộ 2154 lá số quét.

---

## 6. TEST VERIFICATION

**Chạy lại ĐỘC LẬP**: `npx vitest run` → **377/377 PASS** (37 file). `npm run typecheck` → PASS.
`npm run build` (package) → PASS. `npm run build -w packages/daliuren-engine` (workspace) → PASS.
Khớp CHÍNH XÁC claim "CORRECTION IMPLEMENTED" — không có sai lệch số liệu.

**Đọc lại 5 test mới (không chỉ chạy)** — xác nhận test BEHAVIOR THẬT, không chỉ implementation
detail:
- `r-honnhan-01.test.ts` "Zi-hour (golden 2024-03-05 23:00...)": gọi `evaluateHonNhan01` với
  calculation THẬT (qua `calculateDaLiuRenChart`), assert `status==="triggered"` (hành vi domain),
  `calculationConfidence==="D"` (giá trị domain), VÀ danh sách đầy đủ `calculationProvenanceIds`
  (không chỉ độ dài mảng) — đây là behavior test, không phải structural-existence test.
- `r-kientung-02.test.ts` — 3 test mới (`normal hour`, `Zi-hour không trigger`, `Zi-hour
  triggered`) đều assert cả `status` LẪN giá trị confidence cụ thể LẪN nội dung
  `calculationProvenanceIds` — cùng chất lượng.
- `multi-rule-integration.test.ts` mục `[7]`: 2 test cho `hon-nhan`/`kien-tung` trên CÙNG chart
  Zi-hour, assert `verified_rules` (2 rule cùng trigger=true), MỌI signal có
  `calculationConfidence==="D"`, VÀ `overallLowestConfidence==="D"` — test này BẮT ĐƯỢC chính xác
  kịch bản audit lần 1 đã phát hiện lỗi (package-level, không chỉ evaluator cô lập).

**Điểm mạnh cụ thể được xác nhận qua đọc test**: KHÔNG có test nào chỉ kiểm tra "hàm không throw"
hay "field tồn tại" — mọi test confidence mới đều pin GIÁ TRỊ CỤ THỂ (B/D) gắn với 1 golden chart
THẬT có thể tái tạo độc lập (đã tái tạo ở mục 3.2/3.3).

---

## 7. REGRESSION VERIFICATION

### R-NHATTHAN-01
- Đọc lại `src/rules/r-nhatthan-01/evaluator.ts` — **0 dòng thay đổi** so với 2 lần audit trước
  (đối chiếu trực tiếp nội dung file, không chỉ tin `git status`).
- Chạy lại 28 test (`r-nhatthan-01.test.ts`) — PASS.
- Tái tạo ĐỘC LẬP (script riêng, không qua test file) cả 4 golden case đóng băng — **BYTE-IDENTICAL**
  với baseline (2024-01-01 00:30→D/1 signal; 2024-01-04 10:00→B/2 signal; 2024-01-01 10:00→B/2
  signal; 2024-01-05 10:00→B/1 signal) — **KHÔNG regression**.

### R-TIMDO-01
- Đọc lại `src/rules/r-timdo-01/evaluator.ts`, `rule.ts`, `provenance.ts` — **0 dòng thay đổi**
  (file trong `?? ` untracked từ trước, không nằm trong bất kỳ diff nào của phase correction).
- Chạy lại 17 test — PASS.
- Quét riêng biệt (nhiều tháng/giờ) — chỉ thấy `calculationConfidence="B"`, KHÔNG BAO GIỜ "D" —
  xác nhận KHÔNG bị ảnh hưởng bởi correction (đúng như Correction Plan dự đoán ở mục 12).

### Rule trigger/polarity/relation/subject/object
- HON-NHAN: `computeAxisOutcome` (điều kiện trigger + polarity="auspicious" + subject/object) —
  **0 dòng thay đổi** so với bản trước correction (chỉ phần tính `calculationConfidence`/
  `calculationProvenanceIds` bị sửa, đã đối chiếu byte-by-byte phần logic trigger).
  Object trong 2154 lá số đã quét khớp đúng nhãn Hán tự "天后"/"六合" mọi lúc, subject "日干"/"日辰"
  đúng trục — không có drift.
- KIEN-TUNG: `lesson3IsGhost`/`lesson4IsGhost`/điều kiện `&&`/subject="三四課"/object="日干"/
  relation="ke"/polarity="inauspicious" — **0 dòng thay đổi**. 65 lần trigger trong mẫu quét đều
  đúng thuộc tính này (đã in ra và soát mẫu).

---

## 8. ARCHITECTURE BOUNDARY

Xác nhận KHÔNG đổi (đọc lại trực tiếp, không suy đoán):
- **Model C**: `ruleConfidence`/`calculationConfidence` vẫn tách biệt, `worstConfidence()` vẫn so
  sánh thứ hạng thuần tuý — `interpretation/confidence.ts` không nằm trong diff.
- **Evaluator signature**: `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` — không
  đổi ở cả 2 file sửa.
- **Registry architecture**: `rules/registry.ts` — `PRODUCTION_RULE_REGISTRY`/
  `PRODUCTION_EVALUATOR_REGISTRY` cấu trúc y hệt (4 rule, đúng thứ tự), `PRODUCTION_CALCULATION_PROVENANCE`
  giữ NGUYÊN 8 entry cũ, **0 entry mới**.
- **Provenance architecture**: `ProvenanceEntry`/`calendar-dependency-provenance.ts` — không sửa.
- **`chartId`**: `buildChartId`/`chart-id.ts` — không nằm trong diff, không đọc `calculationConfidence`.
- **Conflict handling**: `conflicts` vẫn `[]` mọi lúc (đã xác nhận qua test `[4]`/`[7]` trong
  `multi-rule-integration.test.ts`).
- **QuestionType gating**: `validation/rule-registry.ts`/`question-type.ts` — không nằm trong diff.
- **CalculationProfile**: vẫn CHỈ `CLASSICAL_V1_PROFILE`, hard-code trong evaluator theo ĐÚNG ràng
  buộc kiến trúc đã biết từ trước (MVP freeze mục 12) — KHÔNG PHẢI vấn đề mới, không đổi so với
  R-NHATTHAN-01 đã có.
- **Calculation engine**: không file `compute.ts`/`*.table.ts` nào nằm trong diff.
- **Provenance ID mới**: **0** — xác nhận qua đọc `rules/registry.ts` (không entry mới) và qua
  toàn bộ script quét (không id lạ nào xuất hiện ngoài tập đã biết).

---

## 9. GIT SCOPE

```
git status --short packages/daliuren-engine/ docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md
```
cho kết quả GIỐNG HỆT trạng thái cuối phase correction (đã đối chiếu) — **audit này KHÔNG tạo
thêm thay đổi nào** (chỉ đọc + chạy script/test/build, không Edit/Write nào ngoài chính tài liệu
audit này). Phạm vi thay đổi hiện có (kế thừa từ phase correction, KHÔNG PHẢI audit này tạo ra):
- `packages/daliuren-engine/src/rules/r-honnhan-01/evaluator.ts` (sửa)
- `packages/daliuren-engine/src/rules/r-kientung-02/evaluator.ts` (sửa)
- `packages/daliuren-engine/tests/unit/rules/r-honnhan-01.test.ts`,
  `r-kientung-02.test.ts`, `multi-rule-integration.test.ts` (test cập nhật/mới)
- `docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` (erratum mục D1)

**KHÔNG có thay đổi ngoài phạm vi correction** — không website, không `cloudflare-migration`,
không `astrology-core`, không package nào khác ngoài `daliuren-engine`. **KHÔNG COMMIT.**

---

## 10. FINDINGS

### P0 / P1 / P2
**Không có.** Không tái tạo được counterexample nào cho P1/P2 gốc sau khi quét 2154 lá số +
kiểm tra adversarial theo 8 hạng mục yêu cầu (mục 3.3).

### P3 (non-blocking, KẾ THỪA từ audit/plan trước, KHÔNG PHẢI phát hiện mới)
- Correction Plan đã chủ động KHÔNG đóng 2 gap test P3 cũ (đúng phạm vi đã khoanh: "optional,
  không bắt buộc trước commit"): (a) TIM-DO thiếu case cô lập "method sai nhưng Huyền Vũ đúng vị
  trí"; (b) HON-NHAN thiếu case "Can/Chi trùng vị trí Địa Bàn". Cả 2 vẫn ĐÚNG như mô tả ở audit
  lần 1 — không liên quan P1/P2 đã sửa, không ảnh hưởng correctness của correction này.
- Ràng buộc kiến trúc `CalculationProfile` hard-code trong evaluator (đã biết từ MVP freeze, kế
  thừa nguyên trạng, không phải vấn đề mới do correction gây ra).

### INFO
- Cách trình bày erratum trong contract (gạch ngang câu cũ + block erratum riêng) giữ ĐÚNG 1 giá
  trị authoritative duy nhất tại mọi vị trí đã kiểm (mục C, mục E-K, bảng tóm tắt) — không tạo ra
  2 nguồn mâu thuẫn.

---

## 11. FINAL VERDICT

```
FINAL VERDICT: B — PASS WITH NON-BLOCKING GAP
```

Correction đã xử lý ĐÚNG và ĐẦY ĐỦ cả P1 lẫn P2 gốc — xác nhận bằng chạy code thật trên 2154 lá số
+ kiểm tra adversarial theo đúng 8 hạng mục yêu cầu, không tìm được bất kỳ counterexample nào.
Không regression ở R-NHATTHAN-01 (byte-identical) hay R-TIMDO-01 (hành vi không đổi). Không vi
phạm ranh giới kiến trúc. Phạm vi git đúng như dự kiến, không commit. 2 gap P3 còn lại là CHỦ Ý
hoãn lại (đã ghi rõ trong Correction Plan, không ảnh hưởng correctness) — đây là lý do verdict là
B chứ không phải A tuyệt đối, KHÔNG PHẢI vì phát hiện lỗi mới.
