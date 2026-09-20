# CONG TAIYI — Phase 11-B — Independent Adversarial Audit

Tài liệu audit ĐỘC LẬP — KHÔNG dựa vào báo cáo implementer ("3/3 rule, 372/372 test, PASS") làm
bằng chứng. Mọi kết luận dưới đây được TỰ tái tạo từ: đọc lại nguyên văn contract
(`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md`) + baseline đóng băng
(`DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`), đọc trực tiếp source code hiện tại trong working
tree, và TỰ chạy lại test/typecheck/build + script xác minh độc lập (không tái sử dụng test file
sẵn có làm oracle).

**Phạm vi audit**: 3 rule đã duyệt (R-HONNHAN-01, R-TIMDO-01, R-KIENTUNG-02) + tác động của chúng
lên R-NHATTHAN-01/kiến trúc multi-rule. KHÔNG sửa implementation, KHÔNG sửa test, KHÔNG sửa doc
khác, KHÔNG commit.

---

## 1. VERDICT

# **C — CORRECTION REQUIRED**

Kiến trúc, wiring registry, ngữ nghĩa TRIGGER (điều kiện kích hoạt), polarity, và tính tất định
của cả 3 rule đều ĐÚNG và đã re-verify độc lập. Tuy nhiên phát hiện **1 lỗi P1 thật** (confidence
bị tính THIẾU cho 2/3 rule, ảnh hưởng cụ thể tới output cho ít nhất 1 rule trên chart thật) và các
phát hiện P2 liên quan trực tiếp — đủ nghiêm trọng để KHÔNG được coi là "READY" cho tới khi sửa.
Không phải BLOCKED (D) vì phần lớn kiến trúc/ngữ nghĩa vẫn đúng và lỗi có phạm vi hẹp, đã xác định
chính xác nguyên nhân và cách sửa.

---

## 2. P0 FINDINGS

Không có. Không phát hiện lỗi làm invalid hoá toàn bộ MVP.

---

## 3. P1 FINDINGS

### P1-1 — `calculationConfidence` của R-HONNHAN-01 và R-KIENTUNG-02 THIẾU dependency GanZhi-pillar-construction (+ Zi-hour), khiến confidence bị OVERSTATE — đã xác minh THỰC TẾ bằng code chạy thật

**Bằng chứng độc lập (chạy thật, không suy diễn)**:

```
Chart 2024-01-01 00:30 Asia/Shanghai (hourChi=Tý — vùng tranh chấp Zi-hour đã biết):
  R-NHATTHAN-01  calculationConfidence = D   (ĐÚNG, đã xác nhận từ MVP freeze)
  R-HONNHAN-01   calculationConfidence = B   (SAI — cùng đọc calendar.dayPillar, phải là D)
  R-KIENTUNG-02  calculationConfidence = A   (SAI — cùng đọc calendar.dayPillar, phải ít nhất B,
                                               và D nếu chart rơi vùng Tý)
```

**Vì sao đây là lỗi thật, không phải khác biệt hợp lệ**:

`GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` (`src/calendar/provenance.ts`, confidence **B**) chấm
điểm cho chính việc "4 trụ Can Chi được DỰNG ĐÚNG từ input ngày/giờ hay chưa" — trích nguyên văn:
*"KHÔNG dùng entry này để suy ra confidence cho field Calculation Layer khác qua quan hệ phụ
thuộc"* nhưng NGƯỢC LẠI, **bất kỳ rule nào ĐỌC GIÁ TRỊ `calendar.dayPillar.can`/`.chi`** (không
chỉ R-NHATTHAN-01) đều trực tiếp phụ thuộc vào độ tin cậy của phép dựng đó — đây không phải suy
luận bắc cầu (transitive), mà là phụ thuộc TRỰC TIẾP giống hệt cách R-NHATTHAN-01 đã tự nhận
(`resolveDayOrHourPillarProvenance`).

- **R-HONNHAN-01** (`src/rules/r-honnhan-01/evaluator.ts`) đọc `calculation.calendar.dayPillar.can`
  (dòng 49, để tra `JI_GONG_TABLE`) VÀ `calculation.calendar.dayPillar.chi` (dòng 50, dùng trực
  tiếp làm vị trí) — `dependencies.calculationFields` (`rule.ts`) THẬM CHÍ ĐÃ khai báo đúng
  `"calendar.dayPillar"` là 1 field được đọc — nhưng `calculationConfidence`
  (evaluator.ts dòng 58-61) chỉ gộp `FOUR_LESSONS_PROVENANCE` + 3 `TWELVE_GENERALS_*` —
  **KHÔNG bao giờ tham chiếu `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` hay
  `resolveDayOrHourPillarProvenance`/vùng Zi-hour**, dù chính field đó đã được khai là dependency.
- **R-KIENTUNG-02** (`src/rules/r-kientung-02/evaluator.ts`) đọc `calculation.calendar.dayPillar.can`
  (dòng 29, để tra Ngũ Hành Can Ngày) — `dependencies.calculationFields` cũng khai đúng
  `"calendar.dayPillar"` — nhưng `calculationConfidence` (dòng 40) gán THẲNG
  `FOUR_LESSONS_PROVENANCE.confidence` (="A"), hoàn toàn bỏ qua GanZhi-pillar-construction.

**Với chart KHÔNG rơi vùng Tý**: lỗi này "vô hại về mặt giá trị" cho R-HONNHAN-01 (worst-of vẫn ra
B vì `TWELVE_GENERALS_DIRECTION_PROVENANCE`=B đã chi phối), nhưng **luôn sai cho R-KIENTUNG-02**
(báo A thay vì B đúng ra phải có, cho MỌI chart, kể cả chart không rơi Zi-hour).

**Với chart rơi vùng Tý (hourPillar.chi=Tý)**: cả 2 rule đều sai — phải hạ xuống **D** (giống
R-NHATTHAN-01) nhưng lại báo B (hon-nhan) và A (kien-tung).

**Gốc rễ nằm ở chính CONTRACT, không chỉ ở implementation** — mục D1 (kien-tung) của
`DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` viết: *"Confidence:
ruleConfidence=A; calculationConfidence=A (chỉ phụ thuộc fourLessons, **giống hệt trường hợp
'clean' của R-NHATTHAN-01** khi không rơi vào vùng Tý...)"* — đây là 1 mâu thuẫn nội tại: trường
hợp "clean"/non-Zi-hour CỦA CHÍNH R-NHATTHAN-01 đã được đóng băng là **B**, không phải A (xem MVP
freeze mục 4, và mục "R-NHATTHAN-01 REGRESSION CONTRACT" của CHÍNH contract này). Việc so sánh
"giống hệt trường hợp clean của R-NHATTHAN-01" rồi lại gán giá trị A là tự mâu thuẫn — nhẽ ra phải
là **B**. Implementer đã hiện thực hoá ĐÚNG THEO câu chữ contract mà không đối chiếu ngược với
chính baseline R-NHATTHAN-01 đã đóng băng — đúng loại lỗi mà quy trình "STOP nếu ngữ nghĩa cổ điển
khác contract" của Phase 11-B brief lẽ ra phải bắt được.

**Bằng chứng thêm cho thấy lỗi này đã bị "hợp thức hoá" thay vì bị phát hiện**: implementer còn tự
viết 1 test khẳng định hành vi sai này là ĐÚNG —
`tests/unit/rules/r-kientung-02.test.ts` mục `[E]`:
> *"calculationConfidence='A' KHÔNG đổi kể cả ở chart rơi vào vùng Tý giờ (khác R-NHATTHAN-01 —
> rule này không đọc calendar.hourPillar)"*

Lý do đưa ra ("rule không đọc `calendar.hourPillar`") là NGỤY BIỆN: sự mơ hồ Zi-hour KHÔNG nằm ở
việc đọc `hourPillar` trực tiếp, mà nằm ở việc **CHÍNH `dayPillar` được dựng theo 1 trong 2 quy
ước tranh cãi tuỳ giờ chiêm rơi vào đâu** — bất kỳ rule nào đọc GIÁ TRỊ `dayPillar` (dù không đọc
`hourPillar`) đều thừa hưởng sự mơ hồ đó, đúng như R-NHATTHAN-01 đã tự xử lý qua
`resolveDayOrHourPillarProvenance`.

**Mức độ nghiêm trọng**: KHÔNG ảnh hưởng quyết định TRIGGER (rule vẫn nổ/không nổ đúng lúc) —
nhưng vi phạm trực tiếp nguyên tắc cốt lõi nhất của toàn dự án ("KHÔNG được overstate confidence,
PHẢI derive từ provenance thật, KHÔNG hard-code") và SẼ khiến Tầng 3 (AI, tương lai) tin tưởng tín
hiệu kiện tụng/hôn nhân nhiều hơn mức bằng chứng thực có, đặc biệt sai cho MỌI signal kiện tụng
(không chỉ trường hợp Zi-hour).

**Cách sửa** (không tự sửa ở đây, chỉ nêu hướng, đúng yêu cầu audit-only):
`evaluateHonNhan01`/`evaluateKienTung02` cần gọi `resolveDayOrHourPillarProvenance(representativeHour, CLASSICAL_V1_PROFILE)`
y hệt R-NHATTHAN-01 (đã đọc `calendar.hourPillar.chi` để xác định `representativeHour`), gộp kết
quả đó vào chuỗi `worstConfidence` + `calculationProvenanceIds`.

---

## 4. P2 FINDINGS

### P2-1 — R-HONNHAN-01 trích dẫn `PROV-FOUR-LESSONS-CONSTRUCTION` mà KHÔNG khai `fourLessons` trong `dependencies.calculationFields`, và KHÔNG BAO GIỜ đọc field đó tại runtime

`rule.ts`: `dependencies.calculationFields = ["calendar.dayPillar", "twelveGenerals"]` — không có
`"fourLessons"`. Nhưng `evaluator.ts` vẫn đưa `FOUR_LESSONS_PROVENANCE.id`/`.confidence` vào
`calculationProvenanceIds`/`calculationConfidence` (dòng 58-67), viện lý do JI_GONG_TABLE "đã được
validate qua Four Lessons golden case" — đây là 1 tuyên bố về ĐỘ TIN CẬY CỦA BẢNG TĨNH (algorithm
correctness), KHÁC với ngữ nghĩa đã tài liệu hoá của `calculationProvenanceIds`
(`interpretation/rule.ts` doc comment `RuleResult.calculationConfidence`: *"...mà
`dependencies.calculationFields` của rule này THỰC SỰ chạm tới cho lượt evaluate() này"*) — tức
phải tương ứng 1-1 với field THỰC SỰ ĐỌC từ `calculation`, không phải "bảng tĩnh liên quan tới
module nào". R-NHATTHAN-01 (baseline) giữ đúng bất biến này: mọi id trong
`calculationProvenanceIds` đều ứng với 1 field trong `dependencies.calculationFields` thực sự đọc.

**Nguồn gốc**: mâu thuẫn nội tại trong CHÍNH contract — mục C (field-path contract) của hon-nhan
ghi provenance cho dòng "Vị trí earth-plate của Can Ngày" là `FOUR_LESSONS_PROVENANCE`, nhưng mục
E-K (tóm tắt) lại viết *"Provenance CALCULATION: tái dùng **3 id** `twelveGeneralsProvenanceId`
đã có"* — không nhắc gì tới Four Lessons. Implementer chọn theo mục C (4 id) mà không gắn cờ mâu
thuẫn với mục E-K — đúng loại việc lẽ ra phải STOP-and-report theo brief gốc.

**Tác động tới giá trị**: KHÔNG đổi (FOUR_LESSONS=A không ảnh hưởng worst-of vì Direction=B đã
thấp hơn) — nhưng phá vỡ bất biến audit-trail đã tài liệu hoá, và tạo tiền lệ xấu nếu rule tương
lai copy pattern này với 1 provenance THỰC SỰ ảnh hưởng giá trị.

### P2-2 — Bản thân tài liệu contract (`DA_LIU_REN_PHASE_11B_...CONTRACT.md`) mục D1 chứa lỗi suy luận confidence

Đã trích ở P1-1 — đây là lỗi Ở TÀI LIỆU CONTRACT (không phải chỉ ở code), nên liệt kê riêng: nội
dung *"giống hệt trường hợp 'clean' của R-NHATTHAN-01"* + giá trị "A" tự mâu thuẫn nhau. Tài liệu
contract cần 1 revision riêng (ngoài phạm vi audit này — audit chỉ được tạo 1 file mới) để không
tiếp tục đánh lừa lần implement sau nếu rule khác copy pattern D1.

---

## 5. P3 FINDINGS

### P3-1 — Test suite mới KHÔNG có case nào phơi bày P1-1

Không có test nào gọi R-HONNHAN-01/R-KIENTUNG-02 trên 1 chart rơi vùng Tý **và** assert
`calculationConfidence` cho 1 signal ĐÃ TRIGGER — test duy nhất chạm tới Zi-hour cho kien-tung
(`r-kientung-02.test.ts` mục [E]) dùng chart 2024-01-01 00:30 (không trigger D1 cho chart đó) và
**tự khẳng định hành vi sai (A không đổi) là kỳ vọng đúng** — nên test suite 372/372 xanh không hề
mâu thuẫn với P1-1 (là chính lỗi làm lộ rõ giới hạn của "test pass ≠ đúng bán chất").

### P3-2 — TIM-DO: thiếu case "method KHÔNG khớp NHƯNG Huyền Vũ VẪN ở Sơ truyền"

`r-timdo-01.test.ts` case "method KHÔNG khớp" dùng chart 2024-01-01 10:00
(`initialGeneral=baiHu`, KHÔNG phải `xuanWu`) — tức method-mismatch VÀ huyenVu-absent xảy ra ĐỒNG
THỜI trong case này. Một mutant đổi điều kiện `methodMatches && huyenVuAtInitial` thành chỉ
`huyenVuAtInitial` (bỏ qua vế method) sẽ KHÔNG bị test hiện có bắt được, vì không có golden chart
nào cô lập đúng "method sai nhưng Huyền Vũ đúng vị trí".

### P3-3 — HON-NHAN: thiếu case "Can và Chi trùng vị trí Địa Bàn"

`JI_GONG_TABLE[can]` và `dayPillar.chi` VỀ MẶT LÝ THUYẾT có thể trùng nhau (vd Can=Giáp →
`JI_GONG_TABLE[Giáp]="Dần"`; nếu Chi Ngày CŨNG là "Dần" — ngày Giáp Dần — thì 2 trục tra CÙNG 1 vị
trí `twelveGenerals`). Không có test nào cho case này — không rõ 2 signal trùng object có được coi
là hợp lệ/đã dự tính hay là 1 edge case cần xử lý riêng (rất có thể vẫn ĐÚNG theo thiết kế "1
signal/trục độc lập", nhưng chưa được xác nhận bằng test).

### P3-4 — Không có test tường minh "evaluator KHÔNG đọc field bị cấm" cho 3 rule mới

R-NHATTHAN-01 không có test dạng này cũng (không phải quy ước có sẵn của dự án), nhưng đây chính
xác là loại test lẽ ra sẽ bắt được P1-1 sớm hơn (vd assert rằng calculationConfidence PHẢI đổi
theo `hourPillar.chi` nếu rule đọc `dayPillar`).

---

## 6. RULE-BY-RULE FINDINGS

### R-HONNHAN-01
- **Classical source → semantic claim**: khớp contract (畢法賦 pháp 40 + 六壬大全 卷三), quote
  đúng nguyên văn trong `provenance.ts`.
- **Field-path**: ĐÚNG — `JI_GONG_TABLE[dayPillar.can]` cho trục Can, `dayPillar.chi` trực tiếp
  cho trục Chi — đã re-verify khớp CHÍNH XÁC cách `JI_GONG_TABLE` được dùng ở
  `four-lessons/compute.ts` (cùng 1 bảng, cùng chiều Can→vị trí Địa Bàn, KHÔNG đảo ngược) và cách
  `twelveGenerals[i].zhi` là vị trí ĐỊA BÀN thật (re-verify qua `twelve-generals/compute.ts`) —
  KHÔNG có lỗi off-by-one/đảo chiều.
- **Signal semantics**: subject="日干"/"日辰" (đúng contract), object=nhãn Hán tự tướng ("天后"/
  "六合", đúng contract), relation="presence" (đúng), polarity="auspicious" (đúng theo tóm tắt
  contract — xem lưu ý philological ở mục INFO bên dưới).
  No-signal: đúng (không tướng nào → không signal, không tự suy polarity ngược).
- **Confidence**: xem P1-1 (SAI cho chart Zi-hour) và P2-1 (thừa 1 id không tương ứng dependency
  đã khai, dù giá trị cuối không đổi).
- **Layer/topic**: `layer="core"`, `topic="十二天將"` — KHÔNG được contract chỉ định tường minh
  (contract không có field này cho hon-nhan) — suy luận hợp lý của implementer (có giải trình
  trong comment), không sai nhưng KHÔNG PHẢI trực tiếp từ contract.

### R-TIMDO-01
- **Classical source → semantic claim**: khớp contract (畢法賦 pháp 35), quote đúng.
- **Field-path**: ĐÚNG — `threeTransmissions.method ∈ {yaoke,maoxing}` + tướng tại vị trí
  `threeTransmissions.initial` = `xuanWu` — khớp contract 100%.
- **Signal semantics**: subject="初傳", object="玄武" (đúng contract), relation="presence" (đúng),
  polarity="inauspicious" (đúng, có giải trình rõ trong `provenance.ts` về ý nghĩa "xác nhận sự
  việc" thay vì "xấu cho người hỏi", khớp TD-1 gốc).
- **Không** có dấu vết implement 太陽照武 hay heuristic vị trí đồ vật nào khác — grep xác nhận
  (mục 8 bên dưới).
- **Confidence**: ĐÚNG — rule này KHÔNG đọc `calendar.dayPillar`/`hourPillar` ở bất kỳ đâu (grep
  xác nhận), nên KHÔNG có gap tương tự P1-1. Đây là rule DUY NHẤT trong 3 rule mới hoàn toàn sạch
  về vấn đề này.
- **Đây là rule audit không tìm thấy vấn đề nào đáng kể** (ngoài P3-2 test gap).

### R-KIENTUNG-02
- **Classical source → semantic claim**: khớp contract (畢法賦 pháp 70), quote đúng, và — quan
  trọng nhất — **ranh giới phạm vi "鬼" đã được tuân thủ chính xác**: evaluator CHỈ dùng
  `TrachNhat.getNguHanhQuanHe` (quan hệ Ngũ-Hành-khắc-Can thuần tuý, đã re-verify chiều `a-khac-b`
  nghĩa là "a khắc b" qua đọc trực tiếp `packages/rule-engine/src/trach-nhat/nguHanhQuanHe.ts`) —
  KHÔNG có bất kỳ tham chiếu nào tới 六親/官鬼/tài chính/Tam Hình (grep xác nhận, mục 8).
- **Field-path & direction**: ĐÚNG — `getNguHanhQuanHe(lesson3NguHanh, canNguHanh) === "a-khac-b"`
  nghĩa là "lesson3 khắc Can" (a=lesson3 là bên khắc, b=Can là bên bị khắc) — khớp chính xác
  `// Khóa3 khắc Can` trong pseudocode contract, và khớp CHIỀU đã dùng nhất quán ở R-NHATTHAN-01
  (`a`=thượng thần/tác nhân, `b`=Can|Chi Ngày/mục tiêu).
- **Signal semantics**: subject="三四課", object="日干" (đúng contract), relation="ke" (đúng),
  polarity="inauspicious" (đúng). Trigger CHỈ khi CẢ 2 khóa cùng khắc (đã xác nhận bằng `&&`, có
  test riêng cho từng trường hợp 1/2 khóa — xem mục 12).
- **Confidence**: **SAI** — xem P1-1 (finding nghiêm trọng nhất của audit này, và RÕ RÀNG NHẤT
  trên rule này vì ảnh hưởng giá trị NGAY CẢ với chart không-Zi-hour).
- **Layer**: `layer="secondary"` — suy luận hợp lý từ cách contract gọi đây là 1 trong "HAI RULE
  PHỤ" của kiện tụng, không tường minh trong contract nhưng có căn cứ rõ.

---

## 7. PROVENANCE FINDINGS

- **`PROV-HONNHAN-01`/`PROV-TIMDO-01`/`PROV-KIENTUNG-02`** (rule provenance mới): namespace đúng
  quy ước (`PROV-<RULEKEY>`), `sourceId`/`sourceTitle` khớp `六壬大全`/`liu-ren-da-quan-siku` như
  toàn bộ entry khác trong repo, `confidence="A"` khớp contract cho cả 3 (nguồn cổ điển xác định),
  `quote` khớp nguyên văn đã trích trong contract — KHÔNG bịa citation.
- **`FOUR_LESSONS_PROVENANCE`**: dùng đúng cho R-KIENTUNG-02 (field thực sự đọc). Dùng có vấn đề
  cho R-HONNHAN-01 — xem P2-1.
- **`TWELVE_GENERALS_{ORDER,ANCHOR,DIRECTION}_PROVENANCE`**: dùng đúng cho cả R-HONNHAN-01 và
  R-TIMDO-01 (cả 2 đều thực sự đọc `twelveGenerals`) — đã re-verify grade
  `TWELVE_GENERALS_DIRECTION_PROVENANCE = B` (không phải A, đúng như contract cảnh báo phải
  verify lại, KHÔNG giả định).
- **`YAOKE_PROVENANCE`/`MAOXING_PROVENANCE`**: dùng đúng, CHỈ khi method thực sự khớp (branch có
  điều kiện `if (methodMatches)`) — không bị gán nhầm cho method khác. Grade đã re-verify: YAOKE=B,
  MAOXING=A (khớp `nine-methods/provenance.ts`).
- **KHÔNG có provenance nào bị đổi grade** so với baseline (đã diff — `git diff` cho toàn bộ
  `src/*/provenance.ts` ngoài 3 thư mục rule mới trả về rỗng, xem mục 14).
- **Không có provenance CALCULATION mới nào bị tạo** — đúng "Provenance Contract tổng hợp" của
  contract (chỉ tái dùng).
- **Thiếu 1 provenance LẼ RA phải được tham chiếu**: `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` —
  xem P1-1. Bản thân entry NÀY đã có sẵn trong `PRODUCTION_CALCULATION_PROVENANCE` (registry.ts
  dòng 48, kế thừa từ R-NHATTHAN-01) nên sửa P1-1 KHÔNG cần thêm registry entry mới, chỉ cần sửa
  logic 2 evaluator.

---

## 8. CONFIDENCE FINDINGS

- **Model C (ruleConfidence/calculationConfidence tách biệt)**: giữ nguyên cho cả 3 rule — không
  gộp thành 1 field, không có field số/score/weight nào (grep `score|weight|percent` trong 3 thư
  mục rule mới: không có kết quả).
- **`ruleConfidence` luôn "A", không đổi theo chart**: ĐÚNG cho cả 3, đã re-verify qua code chạy
  thật (mục 15).
- **`calculationConfidence` derive từ `worstConfidence()` thật, không hard-code**: ĐÚNG về MẶT CƠ
  CHẾ cho cả 3 (không có literal `"A"`/`"B"` gán trực tiếp cho field trả về ngoài
  `FOUR_LESSONS_PROVENANCE.confidence`/kết quả `worstConfidence()`) — NHƯNG chuỗi input đưa vào
  `worstConfidence()` bị THIẾU cho 2/3 rule — xem P1-1. "Không hard-code" đúng theo nghĩa đen,
  nhưng KHÔNG đủ để đảm bảo giá trị cuối cùng đúng nếu input đầu vào thiếu.
- **Không averaging/weighting/hidden priority**: xác nhận — `worstConfidence` chỉ so sánh thứ
  hạng, không phép toán số học nào khác xuất hiện.
- **Không confidence upgrade nào so với baseline**: xác nhận qua diff (mục 14).

---

## 9. QUESTIONTYPE FINDINGS

- **R-HONNHAN-01** → `questionTypes: ["hon-nhan"]` (READY) — Level 1 PASS.
- **R-TIMDO-01** → `questionTypes: ["tim-do"]` (READY) — Level 1 PASS.
- **R-KIENTUNG-02** → `questionTypes: ["kien-tung"]` (PARTIAL) — Level 1 PASS (đã re-verify
  `questionTypeAllowsRules("kien-tung") === true` qua code thật, PARTIAL ∈ {READY,PARTIAL} đúng
  logic `validation/rule-registry.ts`).
- **Level 2 (capability gating)**: cả 3 rule đều để trống `unimplementedComponents`/
  `externalContext` — ĐÚNG, vì cả 3 KHÔNG cần bất kỳ thành phần chưa implement nào (đã tự kiểm tra
  từng field đọc trong evaluator đều nằm trong 8-field freeze).
- **Hành vi UNVERIFIED**: `selectEligibleRules(..., "su-nghiep")` không trả về bất kỳ rule mới nào
  — đã re-verify qua code thật (mục 15) và qua test hiện có.
- **KHÔNG có rule nào làm YẾU ĐI Level 1/Level 2** — `validation/rule-registry.ts` KHÔNG bị sửa
  (diff rỗng, xem mục 14) — cơ chế gating đóng băng nguyên vẹn.
- **KHÔNG có QuestionType nào bị thêm/sửa định nghĩa** — `interpretation/question-type.ts` không
  nằm trong diff.

---

## 10. MULTI-RULE FINDINGS

- **Registry completeness**: ĐÚNG — 4 rule, không trùng `ruleId`, mọi `provenanceId` resolve được
  (đã tự chạy `PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY` thật, mục 15).
- **Evaluator completeness**: ĐÚNG — 4/4, không thiếu không thừa.
- **Deterministic order**: ĐÚNG — `selectEligibleRules` giữ nguyên thứ tự khai báo
  (`R-NHATTHAN-01, R-HONNHAN-01, R-TIMDO-01, R-KIENTUNG-02`), đã tự verify cho cả 3 questionType
  liên quan.
- **Signal order/dedup**: ĐÚNG — đã tự dựng `InterpretationPackage` cho chart 2024-05-10 14:00
  (`hon-nhan`) và xác nhận 4 signal đúng thứ tự rule-trước-rule-sau, không trùng `signalId`.
- **Provenance/confidence aggregation**: cơ chế ĐÚNG (Set dedup theo id, worst-of trên TOÀN BỘ
  signal đã trigger của MỌI rule) — nhưng giá trị cuối cùng thừa hưởng lỗi P1-1 khi kịch bản liên
  quan chart Zi-hour (chưa có test nào exercise kịch bản multi-rule + Zi-hour cùng lúc).
- **Package validation**: ĐÚNG — `validateInterpretationPackage` (IP-1..IP-6) không bị sửa, PASS
  cho mọi package đã tự dựng.
- **Rules KHÔNG co-trigger**: có 1 trường hợp thật (2024-01-01 00:30, `hon-nhan`: R-NHATTHAN-01
  trigger, R-HONNHAN-01 không) — verify được nhưng chỉ qua việc sửa test cũ, không phải test mới
  chủ đích thiết kế riêng cho kịch bản này (P3, không blocking).
- **QuestionType isolation**: ĐÚNG — đã tự verify R-HONNHAN-01 không xuất hiện khi hỏi `tim-do`/
  `kien-tung`, và tương tự cho 2 rule còn lại.

---

## 11. R-NHATTHAN REGRESSION FINDINGS

**Diff của 2 file test bị sửa** (`r-nhatthan-01.test.ts`,
`interpretation-package-builder.test.ts`) đã đọc TOÀN BỘ qua `git diff` (không chỉ theo báo cáo) —
kết luận: **KHÔNG có assertion nào bị làm YẾU ĐI**. Mọi thay đổi đều là MỞ RỘNG danh sách kỳ vọng
(từ mảng 1 phần tử → mảng nhiều phần tử liệt kê ĐẦY ĐỦ, chính xác từng `ruleId` mới) hoặc TÁCH
RIÊNG 1 test sang registry cô lập để giữ nguyên phạm vi kiểm tra gốc (`buildEvaluatorRegistry`
1-1 cho đúng R-NHATTHAN-01) thay vì xoá bỏ. Không có `toEqual` nào bị đổi thành `toContain`/
`expect.any`/bỏ so sánh. Không có golden case nào (giá trị `subject`/`object`/`relation`/
`polarity`/`calculationConfidence`) bị đổi số liệu.

**Tái tạo ĐỘC LẬP cả 4 golden case đóng băng** (chạy thật qua `runEvaluator` trên
`PRODUCTION_RULE_REGISTRY`/`PRODUCTION_EVALUATOR_REGISTRY` — registry 4-rule THẬT, không phải
registry cô lập):

| Chart | Số signal | Confidence | Nội dung |
|---|---|---|---|
| 2024-01-01 00:30 | 1 | **D** | chi_axis, 辰上神→日辰, ke, inauspicious |
| 2024-01-04 10:00 | 2 | **B** | cả 2 sheng, auspicious |
| 2024-01-01 10:00 | 2 | **B** | can: 日干→日上神 ke inauspicious; chi: 辰上神→日辰 sheng auspicious |
| 2024-01-05 10:00 | 1 | **B** | chi_axis, 日辰→辰上神, ke, inauspicious |

**KHỚP CHÍNH XÁC** với baseline đã đóng băng (MVP freeze mục 10 + contract mục "R-NHATTHAN-01
REGRESSION CONTRACT"). **KHÔNG có regression.**

---

## 12. TEST QUALITY FINDINGS

- Test 3 rule mới (`r-honnhan-01.test.ts`, `r-timdo-01.test.ts`, `r-kientung-02.test.ts`) test
  NGỮ NGHĨA THẬT, không chỉ tồn tại cấu trúc — mỗi rule đều có: positive (≥1 golden chart thật),
  negative (từng nửa điều kiện riêng biệt — hon-nhan: can-only/chi-only; kien-tung: khóa3-only/
  khóa4-only), no-signal (cả 2 điều kiện đều sai), pin CHÍNH XÁC `subject`/`object`/`relation`/
  `polarity`/`descriptionKey` (không dùng `expect.any`/kiểm tra lỏng) — 1 mutant đảo `can_axis`
  ↔ `chi_axis` hoặc đảo polarity SẼ bị bắt bởi hầu hết các test này (đã tự kiểm tra logic, mục 6).
- **Gap thật đã tìm thấy** (không phải suy đoán): P3-1/P3-2/P3-3/P3-4 ở trên — quan trọng nhất là
  P3-1, vì đây chính là lý do P1-1 không bị chính test suite của implementer phát hiện.
  **Test 372/372 xanh KHÔNG đồng nghĩa "không có lỗi ngữ nghĩa"** — case cụ thể này minh chứng
  đúng nguyên tắc đầu bài "không coi test count là bằng chứng correctness".
- `multi-rule-integration.test.ts` chất lượng tốt — pin cả 2 rule cùng lúc, kiểm tra dedup/order/
  aggregation cụ thể bằng số liệu thật (không placeholder).

---

## 13. DETERMINISM FINDINGS

Tự chạy độc lập (không dùng lại test file):
- `buildInterpretationPackage` gọi 5 lần liên tiếp cùng input (chart 2024-05-10 14:00,
  `hon-nhan`) → `JSON.stringify` HỆT NHAU cả 5 lần.
- Không tìm thấy `Date.now()`/`Math.random()`/module-level mutable state nào trong 3 evaluator
  mới (đọc toàn bộ source, không grep hời hợt).
- `calculationProvenanceIds` dựng bằng array literal mới mỗi lần gọi (`[...]`), không share
  reference giữa các lần evaluate — không rủi ro mutation chéo giữa các lượt gọi.
- **Kết luận: Determinism PASS**, không phát hiện vấn đề.

---

## 14. SCOPE FINDINGS

```
git status --short packages/daliuren-engine/
```
chỉ liệt kê thay đổi trong `packages/daliuren-engine/` — đã tự chạy lại, xác nhận:
- KHÔNG có thay đổi nào ngoài `packages/daliuren-engine/` do phiên Phase 11-B gây ra.
- `git diff --stat -- src/profiles/`, `src/interpretation/question-type.ts`,
  `src/validation/rule-registry.ts`, `src/validation/evaluator-registry.ts`,
  `src/interpretation-package-builder.ts` → **tất cả rỗng** — không có thay đổi kiến trúc nào.
- Không có API route/website file nào trong diff (đã grep `git status` toàn repo, chỉ thấy các
  thay đổi lịch sử không liên quan từ trước, không phải do phiên này).
- Worktree `cloudflare-migration` không bị đụng tới trong phiên audit này (chỉ đọc, không ghi).
- `packages/astrology-core/` không nằm trong bất kỳ diff nào liên quan tới phiên này.
- Grep xác nhận KHÔNG có implementation nào cho: R-QUANCHUC-01, 支干乘刑/Tam Hình, tài chính,
  太陽照武, 12 Trường Sinh, gender/externalContext, CalculationProfile mới, conflict detection, AI
  synthesis — mọi tham chiếu tới các cụm từ này trong code MỚI chỉ xuất hiện trong COMMENT xác
  nhận "KHÔNG implement", không có logic thật đi kèm.

**Kết luận: Scope containment ĐÚNG, không phát hiện vi phạm.**

---

## 15. ACTUAL TEST COUNT / TYPECHECK / BUILD (tự chạy lại, không nhận số từ báo cáo)

```
npx vitest run       → Test Files: 37 passed (37) | Tests: 372 passed (372)
npm run typecheck     → PASS (tsc --noEmit, 0 lỗi)
npm run build         → PASS (tsc, 0 lỗi)
```

Số liệu KHỚP CHÍNH XÁC với báo cáo implementer (372/372, typecheck PASS, build PASS) — không có
sai lệch. (Lưu ý: "test pass" không đồng nghĩa "không có lỗi ngữ nghĩa" — xem P1-1, vốn tồn tại
CÙNG LÚC với 372/372 xanh.)

---

## 16. DOCUMENT PATH

`docs/daliuren/DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md` (file này — file DUY NHẤT được tạo bởi
audit này).

---

## 17. GIT STATUS

Không có thay đổi implementation/test nào được thực hiện bởi audit này. File MỚI DUY NHẤT:
`docs/daliuren/DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md` (chưa commit — theo đúng yêu cầu "Do
NOT commit"). `packages/daliuren-engine/` giữ nguyên trạng thái y hệt trước khi audit bắt đầu.

---

## 18. TÓM TẮT KHUYẾN NGHỊ (ngoài phạm vi "chỉ audit", ghi lại để tham khảo — KHÔNG PHẢI chỉ thị sửa)

1. Sửa P1-1: thêm `resolveDayOrHourPillarProvenance` (hoặc tương đương) vào
   `evaluateHonNhan01`/`evaluateKienTung02`, gộp vào `worstConfidence` chain — khớp đúng pattern
   R-NHATTHAN-01 đã có sẵn, KHÔNG cần logic mới.
2. Sửa P2-1: hoặc (a) bỏ `FOUR_LESSONS_PROVENANCE` khỏi `calculationProvenanceIds` của
   R-HONNHAN-01 và không khai JI_GONG_TABLE cần nguồn riêng, hoặc (b) thêm `"fourLessons"` vào
   `dependencies.calculationFields` kèm giải thích rõ đây là "static table provenance", không phải
   "runtime field read" — cần 1 quyết định kiến trúc tường minh, không tự chọn ngầm.
3. Sửa P2-2: revise contract mục D1 (Phase 11-B) để không còn tự mâu thuẫn — không thuộc phạm vi
   sửa của audit này.
4. Bổ sung 4 test gap P3-1..P3-4 trước khi coi Phase 11-B là "READY".

Không có mục nào trong danh sách này được thực hiện bởi audit này — CHỈ liệt kê để tường minh.
