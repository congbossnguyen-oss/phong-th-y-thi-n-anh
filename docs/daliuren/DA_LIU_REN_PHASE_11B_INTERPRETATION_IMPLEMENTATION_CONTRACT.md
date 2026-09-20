# CONG TAIYI — Phase 11-B — Interpretation Rule Expansion — Implementation Contract

Đặc tả/nghiên cứu/hợp đồng THUẦN TUÝ — không có dòng code sản xuất nào bị sửa để viết tài liệu
này. Đọc lại trực tiếp (không chỉ dựa báo cáo cũ): `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`,
`DA_LIU_REN_PHASE_11_DECISION_BRIEF.md`, `DA_LIU_REN_PHASE_11_ROADMAP.md`,
`DA_LIU_REN_PHASE_11_WORK_PACKAGE_AUDIT.md`, cộng với việc đọc lại NGUYÊN VĂN các báo cáo sơ cấp
(`report-1-sike-sanchuan.md`, `report-7-question-types.md`, `report-4-lucthan-dungthan.md`) và
grep trực tiếp source code (`JI_GONG_TABLE`, `TwelveGeneralName`, `ThreeTransmissions`,
`SignalRelation`, toàn bộ `@thien-anh/rule-engine/trach-nhat/`).

## ⚠️ PHÁT HIỆN MỚI — KHÁC với 3 tài liệu trước (báo cáo tường minh, KHÔNG âm thầm sửa)

Việc audit sâu lần này phát hiện **2 điểm mà Decision Brief/Roadmap/Work Package Audit đã đánh
giá quá lạc quan** khi so với bằng chứng sơ cấp thực tế. Ghi rõ ở đây theo đúng yêu cầu "nếu có
mâu thuẫn, báo cáo, không tự sửa":

1. **Kien-tung, rule phụ 支干乘刑 (pháp 75)**: 3 tài liệu trước xếp "CÓ — độc lập được", CHỈ với
   ghi chú nhỏ "cần xác nhận bảng Tam Hình". Audit sâu lần này xác nhận qua grep TRỰC TIẾP toàn
   bộ `@thien-anh/rule-engine/src/trach-nhat/` (nơi có sẵn `lucXung.ts`/`lucHop.ts`/`tamHop.ts`)
   — **KHÔNG có bảng Tam Hình (三刑) nào tồn tại ở BẤT KỲ đâu trong monorepo**. Đây không còn là
   "non-blocking gap" mà là 1 thành phần tính toán THỰC SỰ chưa tồn tại. CỘNG THÊM: câu phú gốc
   đã trích được ("宾主不投刑在上") quá cô đọng để xác định CHÍNH XÁC cặp vị trí nào được so 刑 —
   xem mục D bên dưới. **Xếp lại: RESEARCH BLOCKED** (khác kết luận "CÓ" của Roadmap/Work Package
   Audit).
2. **Kien-tung, rule phụ 鬼臨三四 (pháp 70)**: vẫn giữ **IMPLEMENTABLE**, nhưng với 1 ĐIỀU KIỆN
   THU HẸP PHẠM VI mới phát hiện: `report-4-lucthan-dungthan.md` (nguồn loại bỏ khung 六親) CHỈ
   đọc trực tiếp 卷一 và 卷四 — **KHÔNG đọc 卷九-十 (nơi chính 畢法賦, và pháp 70, thực sự nằm)**.
   Nghĩa là kết luận "六親 KHÔNG PHẢI tầng chính thống" chưa từng được đối chiếu trực tiếp với
   cách 畢法賦 tự dùng chữ "鬼" trong CHÍNH văn bản pháp 70. Xem mục D/mục "Ranh giới phạm vi" bên
   dưới cho cách xử lý AN TOÀN (thu hẹp "鬼" về đúng nghĩa Ngũ-Hành-khắc-Can thuần tuý).

Không tài liệu cũ nào bị sửa. Đây là bản audit CHÍNH XÁC HƠN, thay thế nhận định cụ thể ở 2 mục
trên cho mục đích lập contract — Roadmap/Decision Brief/Work Package Audit vẫn đúng cho MỌI mục
khác.

---

## A. QUAN-CHUC

### Nguồn cổ điển
畢法賦 pháp 1 "前后引从升迁吉", 卷九. **Nguyên văn đã có trong repo** (`report-7-question-types.md`
dòng 39, cũng dẫn lại ở `DA_LIU_REN_QUESTION_TYPES_RESEARCH.md` dòng 31):
> "初傳居干前為引，末傳居干後為從，值此格者，必升擢官職"

Dịch: "Sơ truyền đứng trước Can (làm dẫn), Mạt truyền đứng sau Can (làm tòng), gặp đúng cách cục
này, chắc chắn thăng chức."

### CLASSICAL SOURCE → DOCUMENTED SEMANTIC CLAIM → RULE CONDITION → SIGNAL → OUTPUT POLARITY
- **CLASSICAL SOURCE**: có, trích nguyên văn (trên).
- **DOCUMENTED SEMANTIC CLAIM**: có — "tiền dẫn hậu tòng" → thăng chức, đã diễn giải ở 3 tài liệu trước.
- **RULE CONDITION**: **CÓ ĐIỀU KIỆN** — cơ chế xác định "trước/sau Can" đã có đủ DỮ LIỆU (xem mục field-path), nhưng CHƯA có xác nhận CHÍNH XÁC quy ước chiều đếm (thuận/nghịch, bao nhiêu vị trí tính là "trước") từ phần bình chú đầy đủ hơn 7 chữ câu phú đã trích — CHỈ có câu phú, CHƯA có đoạn giải thích chi tiết đi kèm trong repo.
- **SIGNAL**: có thể đặc tả CÓ ĐIỀU KIỆN (xem mục Signal Contract).
- **OUTPUT POLARITY**: rõ — auspicious khi đúng cách cục, không có nhánh polarity khác (câu phú chỉ nêu 1 chiều "phải/không phải cách cục này", KHÔNG nêu trường hợp ngược lại nghĩa là gì).

### B. CURRENT STATE
CONTRACT ONLY — chưa có `RuleDefinition`/evaluator nào.

### C. FIELD-PATH CONTRACT
| Input | Exact Field Path | Required? | Existing? | Verified? | Provenance |
|---|---|---|---|---|---|
| Vị trí earth-plate của Can Ngày | `JI_GONG_TABLE[calendar.dayPillar.can]` (từ `src/four-lessons/table.ts`, **export công khai**, đã re-verify) | Có | Có | Có (đã dùng nội bộ cho Lesson 1, xác nhận đúng qua golden case Phase 9A) | `FOUR_LESSONS_PROVENANCE` (tái dùng, KHÔNG cần entry mới cho riêng bước này) |
| Thứ tự vòng 12 Chi | `EARTH_PLATE` (từ `src/heaven-earth-plate/table.ts`, đã dùng ở nhiều module khác) | Có | Có | Có | Cùng entry với Thiên/Địa Bàn (đã có) |
| Sơ truyền | `threeTransmissions.initial: Chi` | Có | Có (8-field freeze) | Có | Provenance Tam Truyền đã có (`threeTransmissionsInitialProvenanceId`) |
| Mạt truyền | `threeTransmissions.final: Chi` | Có | Có (8-field freeze) | Có | `threeTransmissionsChainProvenanceId` (có điều kiện, xem Phase 9E — CHỈ có mặt với TYPE A) |
| Can Ngày | `calendar.dayPillar.can` | Có | Có (8-field freeze) | Có | — |

**Xác nhận: chỉ dùng 8-field freeze + 2 bảng tĩnh đã export sẵn (`JI_GONG_TABLE`, `EARTH_PLATE`) — KHÔNG cần calculation mới nào.**

### D. Ngữ nghĩa tất định — INPUTS → CONDITION → SIGNAL(S) → NO-SIGNAL
```
INPUTS: calendar.dayPillar.can, threeTransmissions.{initial,final}
CONDITION:
  canPosition = EARTH_PLATE.indexOf(JI_GONG_TABLE[dayPillar.can])
  initialPosition = EARTH_PLATE.indexOf(threeTransmissions.initial)
  finalPosition = EARTH_PLATE.indexOf(threeTransmissions.final)
  "Sơ truyền TRƯỚC Can" và "Mạt truyền SAU Can" theo 1 QUY ƯỚC CHIỀU CỤ THỂ — QUY ƯỚC NÀY
  CHƯA ĐƯỢC XÁC NHẬN CHÍNH XÁC từ bình chú đầy đủ (chỉ có 7 chữ câu phú, chưa có đoạn giải
  nghĩa "trước" tính theo chiều thuận hay nghịch, tính bao nhiêu cung là "trước").
SIGNAL: nếu ĐÚNG cách cục → 1 signal, polarity=auspicious.
NO-SIGNAL: nếu SAI cách cục (không thoả "tiền dẫn hậu tòng" theo bất kỳ chiều nào có thể) → không có signal (không phải "inauspicious", câu phú không nêu ý nghĩa ngược).
```
**RESEARCH ITEM NHỎ, KHÔNG PHẢI HARD BLOCK**: cần đọc thêm bình chú đầy đủ của pháp 1 (nếu tồn
tại trong nguyên bản 畢法賦 卷九, ngoài phạm vi 7 chữ câu phú đã trích) để xác nhận quy ước
"trước/sau" — nếu KHÔNG tìm được bình chú bổ sung, phương án AN TOÀN là dùng ĐÚNG chiều THUẬN
(順) đã là quy ước chuẩn xuyên suốt toàn bộ Calculation Layer (Thiên Bàn xoay thuận, 12 Thiên
Tướng thuận theo Dương Chi) — nhưng đây LÀ 1 GIẢ ĐỊNH cần ghi rõ là "theo quy ước thuận chung
của hệ thống", KHÔNG PHẢI trực tiếp trích được từ chính pháp 1.

### E-K (Signal/QuestionType/Provenance/Confidence/Conflict/Edge case/Model) — tóm tắt
- **Signal**: 1 signal khi triggered. `subject`="初傳" hoặc để trống (do quan hệ ở đây là VỊ TRÍ giữa 3 điểm — Can/Sơ/Mạt — không phải 2 điểm sinh/khắc đơn giản như R-NHATTHAN-01; CHƯA có `SignalRelation` phù hợp 100% — gần nhất là `"presence"`, dùng được nhưng ít mô tả được quan hệ 3-điểm này bằng subject/object 2-điểm thuần tuý — ĐÂY LÀ ĐIỂM CẦN QUYẾT ĐỊNH THIẾT KẾ nhỏ khi viết evaluator thật, KHÔNG chặn contract).
- **QuestionType**: `quan-chuc`, READY (Level 1 pass).
- **Provenance RULE**: cần entry mới, source=畢法賦 pháp 1, 卷九, confidence A.
- **Provenance CALCULATION**: tái dùng `threeTransmissionsInitialProvenanceId`/`threeTransmissionsChainProvenanceId`/`fourLessonsProvenanceId` (qua `FOUR_LESSONS_PROVENANCE`, vì `JI_GONG_TABLE` thuộc cùng bảng đã audit) — KHÔNG cần entry Calculation mới.
- **Confidence**: `ruleConfidence=A`; `calculationConfidence` = worst-of các provenance trên (cần resolver tương tự R-NHATTHAN-01, dùng `worstConfidence`).
- **Conflict**: không cần — rule độc lập, không so sánh với signal khác.
- **Edge case**: `threeTransmissions.chainProvenanceId` KHÔNG PHẢI LÚC NÀO CŨNG CÓ (TYPE B: 別責/八專/返吟-vô-賊克 không có `middle`/`final` qua chuỗi tra chuẩn) — **NHƯNG `final: Chi` LUÔN có mặt** (field bắt buộc trong type, không optional) — nên rule này VẪN evaluate được cho MỌI chart, chỉ có `calculationProvenanceIds` đôi khi thiếu 1 id tuỳ TYPE A/B.
- **Verdict**: **IMPLEMENTABLE WITH SPECIFIC CONDITION** (xác nhận quy ước "trước/sau" trước khi khoá cứng evaluator).

---

## B. HON-NHAN

### Nguồn cổ điển
畢法賦 pháp 40 "后合占婚岂用媒", 卷九 (đã có nguyên văn):
> "谓干为夫支为妻，凡占婚全看此，岂宜支干上乘天后六合以应私情"

Dịch: "Gọi Can là chồng, Chi là vợ, phàm xem hôn nhân đều xem ở đây, sao lại để Chi/Can ở vị trí
Thiên Bàn có Thiên Hậu/Lục Hợp cưỡi lên [ứng với tình riêng]" — 六壬大全 卷三 bổ sung: 天后=vợ/nữ,
青龍/Can=chồng/nam (kết hợp cả 2 nguồn).

### CLASSICAL SOURCE → SEMANTIC CLAIM → CONDITION → SIGNAL → POLARITY
Tất cả đều **CÓ bằng chứng đầy đủ**, không mắt xích nào BLOCKED.

### B. CURRENT STATE
CONTRACT ONLY.

### C. FIELD-PATH CONTRACT
| Input | Exact Field Path | Required? | Existing? | Verified? | Provenance |
|---|---|---|---|---|---|
| Vị trí earth-plate của Can Ngày | `JI_GONG_TABLE[calendar.dayPillar.can]` | Có | Có | Có | `FOUR_LESSONS_PROVENANCE` |
| Vị trí earth-plate của Chi Ngày | `calendar.dayPillar.chi` (CHÍNH nó đã là 1 vị trí Địa Bàn, không cần bảng trung gian) | Có | Có | Có | — |
| Tướng tại vị trí Can | `twelveGenerals.find(p => p.zhi === JI_GONG_TABLE[can]).general` | Có | Có (8-field freeze) | Có | `twelveGeneralsOrderProvenanceId`+`AnchorProvenanceId`+`DirectionProvenanceId` |
| Tướng tại vị trí Chi | `twelveGenerals.find(p => p.zhi === dayPillar.chi).general` | Có | Có | Có | Cùng trên |

**Xác nhận: chỉ 8-field freeze + `JI_GONG_TABLE` (đã export) — KHÔNG cần calculation mới.**

### D. Ngữ nghĩa tất định
```
INPUTS: calendar.dayPillar.{can,chi}, twelveGenerals
CONDITION:
  canGeneral = general tại vị trí JI_GONG_TABLE[can]
  chiGeneral = general tại vị trí chi (trực tiếp)
  canHasThienHauOrLucHop = canGeneral ∈ {"tianHou","liuHe"}
  chiHasThienHauOrLucHop = chiGeneral ∈ {"tianHou","liuHe"}
SIGNAL(S): 1 signal nếu Can HOẶC Chi có Thiên Hậu/Lục Hợp (có thể 2 signal nếu CẢ 2 đều có, mỗi
  bên 1 signal — giống thiết kế "1 signal/trục" đã dùng cho R-NHATTHAN-01).
NO-SIGNAL: cả Can lẫn Chi đều KHÔNG có Thiên Hậu/Lục Hợp → không signal (câu phú không nêu ý
  nghĩa "không có" là gì cụ thể, chỉ nêu ĐIỀU KIỆN CÓ → hôn thành).
```

### E-K tóm tắt
- **Signal relation**: `"presence"` (đã có sẵn, đúng nghĩa "tướng X có mặt tại vị trí Y").
- **QuestionType**: `hon-nhan`, READY.
- **Provenance RULE**: entry mới, 畢法賦 pháp 40 + 六壬大全 卷三, confidence A.
- **Provenance CALCULATION**: tái dùng 3 id `twelveGenerals*ProvenanceId` đã có — KHÔNG entry mới.
- **Confidence**: `ruleConfidence=A`; `calculationConfidence` = worst-of 3 id trên (tất cả hiện đều A theo `twelve-generals/provenance.ts` đã đọc ở phase trước — xin nhắc: `TWELVE_GENERALS_DIRECTION_PROVENANCE` = **B**, không phải A — cần verify lại khi implement thật, không giả định cả 3 đều A).
- **Conflict**: không cần.
- **Edge case**: cả Can lẫn Chi CÙNG có Thiên Hậu/Lục Hợp → 2 signal cùng polarity auspicious, KHÔNG phải conflict (giống nguyên tắc R-NHATTHAN-01/KT-4 synthetic case: cùng chiều không phải mâu thuẫn).
- **Verdict**: **IMPLEMENTABLE** (không điều kiện đặc biệt nào ngoài verify lại đúng grade `TWELVE_GENERALS_DIRECTION_PROVENANCE`=B lúc code thật).

---

## C. TIM-DO — MAIN RULE

### Nguồn cổ điển
畢法賦 pháp 35 "人宅受脱俱招盗", 卷九 (nguyên văn đã có, `report-7-question-types.md` dòng 57):
> "凡占定主失脫" khi 遙克/昴星 thừa 元武(玄武) phát dụng.

Gloss chính xác từ nghiên cứu: "Huyền Vũ = dụng thần trộm/thất vật; nếu Khóa Thể = 遙克 (yaoke)
hoặc 昴星 (maoxing) VÀ Huyền Vũ đóng tại vị trí Sơ truyền (phát dụng) → chắc chắn mất đồ."

### CLASSICAL SOURCE → SEMANTIC CLAIM → CONDITION → SIGNAL → POLARITY
Tất cả **CÓ bằng chứng đầy đủ**.

### B. CURRENT STATE
CONTRACT ONLY.

### C. FIELD-PATH CONTRACT
| Input | Exact Field Path | Required? | Existing? | Verified? | Provenance |
|---|---|---|---|---|---|
| Khóa Thể (method) | `threeTransmissions.method: NineMethod` (giá trị cần so `"yaoke"` hoặc `"maoxing"` — 2 literal ĐÃ CÓ trong union type, re-verify trực tiếp `types/three-transmissions.ts`) | Có | Có (8-field freeze) | Có | `threeTransmissionsInitialProvenanceId` |
| Sơ truyền (vị trí phát dụng) | `threeTransmissions.initial: Chi` | Có | Có | Có | Cùng trên |
| Tướng tại vị trí Sơ truyền | `twelveGenerals.find(p => p.zhi === threeTransmissions.initial).general === "xuanWu"` | Có | Có | Có | 3 id `twelveGenerals*` |

**Xác nhận: chỉ 8-field freeze — KHÔNG cần calculation mới, KHÔNG cần `JI_GONG_TABLE` (khác 2 rule trên).**

### D. Ngữ nghĩa tất định
```
INPUTS: threeTransmissions.{method,initial}, twelveGenerals
CONDITION:
  methodMatches = threeTransmissions.method ∈ {"yaoke","maoxing"}
  initialGeneral = general tại vị trí threeTransmissions.initial
  huyenVuAtInitial = initialGeneral === "xuanWu"
SIGNAL: nếu methodMatches VÀ huyenVuAtInitial → 1 signal, polarity=inauspicious (xác nhận mất đồ
  — LƯU Ý đã ghi nhận từ Phase 4/`DA_LIU_REN_QUESTION_TEST_SPEC.md` TD-1: polarity ở đây mang
  nghĩa "xác nhận tình huống đã xảy ra", không hẳn "xấu cho người hỏi" theo nghĩa thông thường —
  NHƯNG theo đúng SignalPolarity hiện có (chỉ 4 giá trị: auspicious/inauspicious/neutral/unclear),
  "inauspicious" là lựa chọn gần nhất, ĐÃ ghi rõ trong TD-1 gốc).
NO-SIGNAL: methodMatches=false, HOẶC huyenVuAtInitial=false → không signal.
```

### E-K tóm tắt
- **Signal relation**: `"presence"`.
- **QuestionType**: `tim-do`, READY.
- **Provenance RULE**: entry mới, 畢法賦 pháp 35, confidence A.
- **Provenance CALCULATION**: tái dùng `threeTransmissionsInitialProvenanceId` + 3 id `twelveGenerals*` — KHÔNG entry mới.
- **Confidence**: `ruleConfidence=A`; `calculationConfidence`=worst-of các id trên (lại cần verify `TWELVE_GENERALS_DIRECTION_PROVENANCE=B` chính xác lúc code).
- **Conflict**: không cần — **LƯU Ý QUAN TRỌNG**: pháp 39 (太陽照武, rule PHỤ của tìm đồ, NGOÀI PHẠM VI 11-B) nếu implement sau này SẼ tạo ra đúng tình huống TD-4 (2 signal polarity khác trục ý nghĩa "mất/còn" — Phase 10.6.4A đã phân tích kỹ) — rule CHÍNH ở đây (pháp 35) một mình KHÔNG cần conflict handling, chỉ cần lưu ý khi (nếu) pháp 39 được thêm sau.
- **Edge case**: `method` không phải `"yaoke"`/`"maoxing"` → không signal (không phải lỗi, chỉ là rule không áp dụng cho khóa thể này).
- **Verdict**: **IMPLEMENTABLE** (không điều kiện đặc biệt).

---

## D. KIEN-TUNG — HAI RULE PHỤ

### D1. 鬼臨三四 (pháp 70)

**Nguồn cổ điển** — 畢法賦 pháp 70, 卷九, nguyên văn ĐÃ CÓ (chỉ ở dạng câu phú cô đọng, CHƯA có
bình chú dài hơn được trích trong repo):
> "鬼临三四讼灾随"

Dịch theo gloss đã ghi ("Quỷ lâm khóa 3-4, tụng/tai theo sau"): Quỷ (鬼, phần tử khắc Can Ngày về
Ngũ Hành) chiếm CẢ Khóa 3 lẫn Khóa 4 → kiện tụng/tai họa liên tiếp.

**CLASSICAL SOURCE → SEMANTIC CLAIM → CONDITION → SIGNAL → POLARITY**:
- SOURCE: có (câu phú 7 chữ).
- SEMANTIC CLAIM: có (gloss đã ghi trong `report-7`).
- CONDITION: **CÓ ĐIỀU KIỆN THU HẸP PHẠM VI** — xem "Ranh giới phạm vi" bên dưới.
- SIGNAL/POLARITY: rõ, inauspicious.

**Ranh giới phạm vi bắt buộc (mới phát hiện ở audit này)**: chữ "鬼" ở đây PHẢI được hiểu THUẦN
TUÝ là "phần tử [Ngũ Hành] khắc Can Ngày" — 1 quan hệ Ngũ-Hành nhị nguyên đơn giản, tính được y
hệt cách R-NHATTHAN-01 đã tính quan hệ sinh/khắc (qua `TrachNhat.getNguHanhQuanHe`). Việc thu
hẹp này là CẦN THIẾT vì: `report-4-lucthan-dungthan.md` (nguồn duy nhất loại bỏ khung 六親) CHỈ
đọc 卷一/卷四 — CHƯA từng đối chiếu trực tiếp cách 畢法賦 (卷九-十) tự dùng chữ "鬼". Evaluator
implement theo phạm vi THU HẸP này KHÔNG được gán thêm bất kỳ ý nghĩa "quan hệ gia đình/lục
thân" nào cho "鬼" (vd KHÔNG được diễn giải thành "quan chức/kẻ thù/người hại" theo khung 官鬼 đầy
đủ của Lục Hào) — CHỈ dùng đúng 1 quan hệ Ngũ-Hành-khắc-Can làm điều kiện kích hoạt, y hệt cách
"鬼" được dùng ở R-NHATTHAN-01's chính văn "尅者為災" (khắc = tai).

### FIELD-PATH CONTRACT (D1)
| Input | Exact Field Path | Required? | Existing? | Verified? | Provenance |
|---|---|---|---|---|---|
| Khóa 3 thượng thần | `fourLessons.lesson3.upper: Chi` | Có | Có (8-field freeze) | Có | `fourLessonsProvenanceId` |
| Khóa 4 thượng thần | `fourLessons.lesson4.upper: Chi` | Có | Có | Có | Cùng trên |
| Can Ngày | `calendar.dayPillar.can` | Có | Có | Có | `resolveDayOrHourPillarProvenance` (GanZhi-construction B, +Zi-hour D có điều kiện — ĐÍNH CHÍNH, xem erratum cuối mục D1) |
| Ngũ Hành Chi/Can | `Data.CAN_NGU_HANH`/`Data.CHI_NGU_HANH` (từ `@thien-anh/calendar-core`, ĐÃ dùng ở R-NHATTHAN-01) | Có | Có | Có | — |
| Quan hệ khắc | `TrachNhat.getNguHanhQuanHe` (từ `@thien-anh/rule-engine`, ĐÃ dùng ở R-NHATTHAN-01) | Có | Có | Có | — |

**Xác nhận: chỉ 8-field freeze + 2 utility ĐÃ CHỨNG MINH hoạt động (chính là 2 hàm R-NHATTHAN-01 đang dùng) — KHÔNG cần calculation mới.**

### Ngữ nghĩa tất định (D1)
```
INPUTS: fourLessons.{lesson3,lesson4}.upper, calendar.dayPillar.can
CONDITION:
  canNguHanh = nguHanhOfCan(dayPillar.can)
  lesson3Nguhanh = nguHanhOfChi(fourLessons.lesson3.upper)
  lesson4Nguhanh = nguHanhOfChi(fourLessons.lesson4.upper)
  lesson3IsGhost = getNguHanhQuanHe(lesson3Nguhanh, canNguHanh) === "a-khac-b"  // Khóa3 khắc Can
  lesson4IsGhost = getNguHanhQuanHe(lesson4Nguhanh, canNguHanh) === "a-khac-b"  // Khóa4 khắc Can
SIGNAL: nếu lesson3IsGhost VÀ lesson4IsGhost (CẢ 2 khóa CÙNG là "鬼") → 1 signal, polarity=inauspicious.
NO-SIGNAL: chỉ 1 trong 2 (hoặc không có) là "鬼" → không signal (câu phú yêu cầu CẢ 3-4, không phải 1 trong 2).
```

### E-K tóm tắt (D1)
- **Signal relation**: `"ke"` (đã có).
- **QuestionType**: `kien-tung`, PARTIAL (Level 1 CHO PHÉP vì PARTIAL ∈ {READY,PARTIAL} — đã re-verify `questionTypeAllowsRules` logic).
- **Provenance RULE**: entry mới, 畢法賦 pháp 70, confidence A.
- **Provenance CALCULATION**: tái dùng `fourLessonsProvenanceId` (A) **VÀ** `resolveDayOrHourPillarProvenance` (GanZhi-construction B / Zi-hour D có điều kiện) — KHÔNG entry mới. ~~(bản gốc: chỉ `fourLessonsProvenanceId`)~~ — ĐÍNH CHÍNH, xem erratum cuối mục D1.
- **Confidence**: `ruleConfidence=A`; `calculationConfidence` = worst-of(`fourLessonsProvenanceId`=A, `resolveDayOrHourPillarProvenance`) = **B** khi chart không rơi vùng Tý, **D** khi rơi vùng Tý — ~~(bản gốc: "calculationConfidence=A, chỉ phụ thuộc fourLessons, giống hệt trường hợp 'clean' của R-NHATTHAN-01... KHÔNG có dayPillar phụ thuộc Zi-hour vì rule này không đọc calendar.hourPillar")~~ — ĐÍNH CHÍNH, xem erratum cuối mục D1.
- **Conflict**: không cần.
- **Verdict**: **IMPLEMENTABLE WITH SPECIFIC CONDITION** (phạm vi "鬼" thu hẹp về Ngũ-Hành-khắc-Can thuần tuý, ghi rõ trong provenance.ts như đã làm cho R-NHATTHAN-01).

> **ERRATUM (Phase 11-B Correction Plan, sau audit độc lập —
> `docs/daliuren/DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md` P1 +
> `docs/daliuren/DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md` mục 2/5/6)**: đoạn Confidence gốc ở
> trên tự mâu thuẫn — so sánh "giống hệt trường hợp 'clean' của R-NHATTHAN-01" rồi lại gán giá trị
> A, trong khi CHÍNH trường hợp "clean"/non-Zi-hour của R-NHATTHAN-01 đã đóng băng là **B** (xem
> mục "R-NHATTHAN-01 REGRESSION CONTRACT" ngay trong tài liệu này + `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md`
> mục 4). Lý do loại trừ dependency GanZhi-construction ("rule không đọc `calendar.hourPillar`")
> là NGỤY BIỆN: sự mơ hồ Zi-hour nằm ở CHÍNH GIÁ TRỊ `dayPillar` (được dựng theo 1 trong 3 policy
> tranh cãi tuỳ giờ chiêm), không nằm ở việc có đọc `hourPillar` trực tiếp hay không — rule D1 VẪN
> đọc `calendar.dayPillar.can` như GIÁ TRỊ THẬT (để tra Ngũ Hành Can Ngày) nên VẪN thừa hưởng đúng
> dependency đó, giống hệt R-NHATTHAN-01. Bảng/đoạn văn ở trên đã được sửa lại khớp với giá trị
> ĐÚNG (B/D tuỳ Zi-hour) — implementation thật (`src/rules/r-kientung-02/evaluator.ts`) đã cập
> nhật khớp đoạn ĐÍNH CHÍNH này, KHÔNG khớp đoạn gốc bị gạch ngang.

### D2. 支干乘刑 (pháp 75)

**Nguồn cổ điển** — 畢法賦 pháp 75, 卷九, nguyên văn ĐÃ CÓ:
> "宾主不投刑在上"

Dịch sát nghĩa: "Khách chủ không hợp, Hình ở trên." Gloss đã ghi trong repo: "Chi Can mang Hình →
bị hình phạt."

**CLASSICAL SOURCE → SEMANTIC CLAIM → CONDITION → SIGNAL → POLARITY**:
- SOURCE: có (7 chữ câu phú).
- SEMANTIC CLAIM: có, nhưng Ở MỨC RẤT KHÁI QUÁT ("mang Hình → bị hình phạt").
- CONDITION: **BLOCKED** — 2 lý do độc lập:
  1. **Không xác định được CHÍNH XÁC cặp vị trí nào được so sánh quan hệ Hình** — "宾主" (khách
     chủ) trong 六壬 thường chỉ Can/Chi Ngày, HOẶC có thể chỉ Sơ truyền/Can Ngày (giống cấu trúc
     "chủ-khách" đã thấy ở R-NHATTHAN-01's chính 日辰), NHƯNG câu phú 7 chữ KHÔNG đủ để phân biệt
     — cần bình chú đầy đủ hơn, hiện KHÔNG có trong repo.
  2. **Bảng Tam Hình (三刑, 12 Chi) KHÔNG tồn tại ở bất kỳ đâu trong monorepo** — đã grep trực
     tiếp TOÀN BỘ `@thien-anh/rule-engine/src/trach-nhat/` (nơi CÓ `lucXung.ts`/`lucHop.ts`/
     `tamHop.ts` — tức các quan hệ Địa Chi phổ biến khác ĐÃ được viết) và `@thien-anh/calendar-core`
     — không tìm thấy bất kỳ hằng số/bảng nào cho 寅巳申/丑戌未/子卯/辰午酉亥. Đây LÀ tri thức nền
     tảng cố định (cùng tính chất "không có dị bản giữa các trường phái" như `lucXung.ts` đã tự
     nhận) — nhưng CHƯA được viết thành code, tức CẦN 1 bước implement calculation NHỎ trước khi
     rule này có thể evaluate.
- SIGNAL/POLARITY: **KHÔNG THỂ đặc tả CHÍNH XÁC cho tới khi (1) resolve**.

### FIELD-PATH CONTRACT (D2)
| Input | Exact Field Path | Required? | Existing? | Verified? | Provenance |
|---|---|---|---|---|---|
| Bảng Tam Hình 12 Chi | **KHÔNG TỒN TẠI** | Có (nếu implement) | **KHÔNG** | — | Cần entry mới — nguồn phổ quát Ngũ Hành/Địa Chi cổ điển, TƯƠNG TỰ mức độ hiển nhiên như Lục Xung/Lục Hợp đã có, nhưng CHƯA VIẾT |
| Cặp vị trí so Hình ("賓/Chủ") | **CHƯA XÁC ĐỊNH** — có thể `calendar.dayPillar.{can,chi}`, có thể liên quan `threeTransmissions.initial` | Không rõ | — | — | — |

### E-K tóm tắt (D2)
- **Verdict**: **RESEARCH BLOCKED** — CẦN (a) đọc thêm bình chú đầy đủ pháp 75 để xác định cặp
  vị trí "賓/Chủ" chính xác, (b) xác nhận nguồn cho bảng Tam Hình 12 Chi cố định (dù gần như chắc
  chắn là kiến thức phổ quát không tranh cãi, vẫn cần 1 dòng trích dẫn nguồn đúng kỷ luật dự án
  — không được viết "hiển nhiên nên khỏi cần nguồn").
- **KHÔNG PHẢI HARD BLOCK VĨNH VIỄN** — khác 12 Trường Sinh (nguồn công thức mâu thuẫn thật sự),
  đây là 1 gap NGHIÊN CỨU NHỎ, có khả năng đóng nhanh (đọc thêm 1 đoạn bình chú + xác nhận 1 bảng
  phổ quát) — nhưng THEO ĐÚNG kỷ luật "không suy đoán", PHẢI xếp BLOCKED cho tới khi đóng, KHÔNG
  được coi là "CÓ, độc lập được" như 3 tài liệu trước đã ghi.

---

## TÓM TẮT — Signal Contract, QuestionType, Provenance, Confidence, Conflict (toàn bộ 11-B)

### Signal Contract tổng hợp
| Rule | signalId (mẫu) | ruleId | subject | object | relation | polarity | ruleConfidence | calculationConfidence |
|---|---|---|---|---|---|---|---|---|
| quan-chuc | `R-QUANCHUC-01-0` | R-QUANCHUC-01 | (cần quyết định — quan hệ 3-điểm) | — | `"presence"` (tạm) | auspicious | A | A (worst-of 3 id, có điều kiện theo TYPE A/B) |
| hon-nhan | `R-HONNHAN-01-{0,1}` | R-HONNHAN-01 | "日干" hoặc "日辰" | tên tướng | `"presence"` | auspicious | A | worst-of `resolveDayOrHourPillarProvenance`(GanZhi B/Zi-hour D) + 3 `twelveGenerals*` id — **B** bình thường, **D** nếu Zi-hour (ĐÍNH CHÍNH Correction Plan; bản gốc chỉ ghi "3 twelveGenerals* id", thiếu dependency `calendar.dayPillar`) |
| tim-do (chính) | `R-TIMDO-01-0` | R-TIMDO-01 | "初傳" | "玄武" | `"presence"` | inauspicious | A | worst-of `threeTransmissionsInitialProvenanceId` + 3 `twelveGenerals*` |
| kien-tung D1 | `R-KIENTUNG-02-0` | R-KIENTUNG-02 (xem mục Rule ID) | "三四課" | "日干" | `"ke"` | inauspicious | A | worst-of(`fourLessonsProvenanceId`=A, `resolveDayOrHourPillarProvenance`) — **B** bình thường, **D** nếu Zi-hour (ĐÍNH CHÍNH Correction Plan; bản gốc ghi sai "A") |
| kien-tung D2 | — | — | — | — | — | — | — | — (BLOCKED) |

**Xác nhận đặc biệt yêu cầu**: `SignalRelation` hiện có (`"sheng"|"ke"|"bihe"|"he"|"chong"|"xing"|"hai"|"presence"`)
**ĐÃ ĐỦ** cho D1/hon-nhan/tim-do (dùng "ke"/"presence" sẵn có). KHÔNG cần thêm giá trị nào.
Không đề xuất sửa `signal.ts`. `"xing"` (刑) TỒN TẠI SẴN nhưng KHÔNG dùng được cho D2 vì D2 bị
chặn ở tầng NGUỒN/CALCULATION trước khi tới được tầng chọn `SignalRelation` — đây là phân biệt
quan trọng: có relation type SẴN SÀNG không đồng nghĩa RULE sẵn sàng.

### QuestionType Contract tổng hợp
| Rule | QuestionType | Status | Level 1 | Level 2 |
|---|---|---|---|---|
| quan-chuc | quan-chuc | READY | PASS | PASS (không unimplementedComponents/externalContext) |
| hon-nhan | hon-nhan | READY | PASS | PASS |
| tim-do (chính) | tim-do | READY | PASS | PASS |
| kien-tung D1 | kien-tung | PARTIAL | PASS (PARTIAL được phép) | PASS |
| kien-tung D2 | kien-tung | PARTIAL | PASS (nếu implement) | **KHÔNG THỂ ĐÁNH GIÁ** — chưa có dependencies rõ ràng để khai báo |

### Provenance Contract tổng hợp
Không rule nào trong 4 rule IMPLEMENTABLE cần entry Calculation MỚI — toàn bộ tái dùng provenance
đã có (`fourLessonsProvenanceId`, `threeTransmissionsInitialProvenanceId`, 3 `twelveGenerals*`).
Mỗi rule cần ĐÚNG 1 entry Provenance RULE mới (nguồn 畢法賦 tương ứng).

### Confidence Contract tổng hợp
Model C giữ nguyên tuyệt đối — `ruleConfidence` luôn A cho cả 4 rule (nguồn cổ điển xác định);
`calculationConfidence` = worst-of provenance Calculation đã dùng, tính bằng `worstConfidence()`
đã có, KHÔNG hard-code, giống hệt nguyên tắc R-NHATTHAN-01.

### Conflict Contract tổng hợp
KHÔNG rule nào trong 11-B cần conflict detection generic. `conflicts=[]` giữ nguyên (Option A).
Điểm cần lưu ý riêng (không phải blocker): nếu SAU NÀY pháp 39 (太陽照武, ngoài phạm vi 11-B)
được thêm, nó SẼ tạo tình huống 2-signal-khác-trục giống TD-4 — nhưng đó là vấn đề của phase
KHÁC, không phải 11-B.

---

## MULTI-RULE PACKAGE BUILDER — yêu cầu chấp nhận (KHÔNG code)

- **Rule registry completeness**: `buildRuleRegistry([R_NHATTHAN_01, R_QUANCHUC_01, ...], ...)` phải PASS cho MỌI tổ hợp rule IMPLEMENTABLE được chọn — không ruleId trùng (đã có check `DUPLICATE_ID`).
- **Evaluator registry completeness**: `buildEvaluatorRegistry` phải PASS 1-1 cho N rule (logic ĐÃ tổng quát cho N, không hard-code 1 — xác nhận lại qua đọc `evaluator-registry.ts`).
- **Deterministic evaluator ordering**: `selectEligibleRules` giữ nguyên thứ tự `registry.rules` (đã filter, không sort) — N rule mới PHẢI được thêm vào ĐÚNG 1 vị trí cố định trong mảng `PRODUCTION_RULE_REGISTRY`'s input list (thứ tự khai báo = thứ tự output).
- **Signal ordering**: `buildInterpretationPackage` lặp `eligibleRules` rồi push `result.signals` theo thứ tự — signal của rule sau LUÔN đứng sau signal của rule trước (đã xác nhận qua đọc code).
- **Provenance aggregation**: `referencedProvenanceIds` là `Set` (thứ tự insertion, tất định) — N rule dùng CHUNG 1 provenance id (vd 2 rule cùng đọc `fourLessonsProvenanceId`) sẽ CHỈ xuất hiện 1 lần trong `provenance` map (đã đúng thiết kế, không cần sửa).
- **Confidence aggregation**: `overallLowestConfidence` tính worst-of TRÊN TOÀN BỘ signal đã trigger CỦA MỌI rule (không phải riêng từng rule) — ĐÂY LÀ HÀNH VI ĐÃ CÓ SẴN, đúng thiết kế N-rule ngay từ Phase 10.6.1, KHÔNG cần sửa.
- **Duplicate rule/signal IDs**: ruleId đã chặn trùng ở registry; signalId theo quy ước `${ruleId}-${axisIndex}` NÊN KHÔNG trùng giữa các rule khác nhau (ruleId khác nhau → prefix khác nhau) — CẦN 1 test tường minh xác nhận điều này với ≥2 rule thật cùng lúc (hiện chỉ có 1 rule nên chưa từng test).
- **Package validation**: `validateInterpretationPackage` (IP-1..IP-6) không có logic riêng cho N=1 — đã tổng quát, chỉ cần test thêm N>1 để CHỨNG MINH, không phải để SỬA.
- **Regression R-NHATTHAN-01**: xem mục riêng bên dưới.

---

## R-NHATTHAN-01 REGRESSION CONTRACT (đóng băng tường minh)

R-NHATTHAN-01 PHẢI cho kết quả HỆT NHAU (không đổi 1 ký tự nào trong output) cho ĐÚNG các golden
case đã có, tái xác nhận exact expected value đã biết (Phase 10.6.3/10.6.6):
- **2024-01-01 00:30**: 1 signal (chi_axis, "ke", inauspicious), `calculationConfidence=D`.
- **2024-01-04 10:00**: 2 signal (cả 2 "sheng", auspicious), `calculationConfidence=B`.
- **2024-01-01 10:00**: 2 signal (can_axis "ke" inauspicious, chi_axis "sheng" auspicious), `calculationConfidence=B`.
- **2024-01-05 10:00**: 1 signal (chi_axis "ke" inauspicious — can_axis tương hoà, skip), `calculationConfidence=B`.

Không 1 rule nào ở 11-B được phép: sửa `src/rules/r-nhatthan-01/*`; sửa `src/interpretation/*`
theo cách ảnh hưởng ngược tới R-NHATTHAN-01; sửa `worstConfidence`/`resolveDayOrHourPillarProvenance`
theo cách đổi kết quả hiện có cho 4 golden case trên.

---

## TEST PLAN (đặc tả, KHÔNG viết test)

Cho MỖI rule IMPLEMENTABLE (quan-chuc*, hon-nhan, tim-do chính, kien-tung D1 — *quan-chuc cần
đóng research nhỏ trước):
- **Positive case**: ≥1 golden chart thật (qua `calculateDaLiuRenChart`) mà điều kiện ĐÚNG.
- **Negative case**: ≥1 golden chart thật mà điều kiện SAI (không trigger).
- **No-signal case**: xác nhận `status="not-triggered"`, `signals=[]` khi áp dụng.
- **Edge case riêng**: hon-nhan (cả Can+Chi cùng có tướng), tim-do (method không khớp), kien-tung D1 (chỉ 1/2 khóa là 鬼).
- **QuestionType gate**: xác nhận `selectEligibleRules` trả đúng rule cho questionType khai báo, KHÔNG trả cho UNVERIFIED.
- **Provenance**: xác nhận `calculationProvenanceIds` đúng, resolve được trong `provenance` map.
- **Confidence**: xác nhận `ruleConfidence=A`, `calculationConfidence` đúng worst-of, KHÔNG hard-code.
- **Package integration**: qua `buildInterpretationPackage` thật, không bypass registry.
- **Determinism**: gọi 2 lần cùng input → kết quả HỆT NHAU.

**MULTI-RULE REGRESSION TEST** (bắt buộc, mới — lần đầu có ở dự án):
- Đăng ký TOÀN BỘ rule mới + R-NHATTHAN-01 vào 1 `PRODUCTION_RULE_REGISTRY` chung.
- Chạy 1 golden chart mà NHIỀU rule cùng trigger (vd 1 ngày mà cả R-NHATTHAN-01 lẫn hon-nhan đều có signal).
- Xác nhận: `verified_rules` liệt kê ĐỦ mọi rule (kể cả not-triggered); `signals` gộp đúng, đúng thứ tự; `conflicts=[]`; `provenance` map gộp đúng, không trùng lặp entry; `overallLowestConfidence` = worst-of TOÀN BỘ signal của MỌI rule (không phải riêng 1 rule); R-NHATTHAN-01's 4 golden case vẫn cho ĐÚNG kết quả cũ trong CÙNG registry.

---

## SCOPE BOUNDARY

**IN SCOPE** (nếu owner authorize implementation sau tài liệu này):
- R-QUANCHUC-01 (sau khi đóng research nhỏ về quy ước "trước/sau").
- R-HONNHAN-01.
- R-TIMDO-01 (rule chính).
- 1 trong 2 rule phụ kiện tụng: **CHỈ 鬼臨三四 (D1)** — pháp 75 (D2) KHÔNG trong scope cho tới khi đóng research riêng.

**OUT OF SCOPE** (tường minh, xác nhận qua bằng chứng — không rule nào ở đây có dependency trực tiếp buộc phải mở):
- 12 Trường Sinh.
- Calculation capability mới (Không Vong/Khóa Thể/Vượng Suy/Bản Mệnh/Hành Niên) — không rule nào trong 11-B cần.
- Generic conflict detection.
- AI synthesis.
- Multi-profile architecture — xác nhận: không rule nào trong 4 rule audit đọc `calendar.hourPillar`/gọi `resolveDayOrHourPillarProvenance`, nên KHÔNG kế thừa giới hạn `CalculationProfile` của R-NHATTHAN-01.
- Gender externalContext architecture exception — không liên quan 11-B (đó là suc-khoe, ngoài phạm vi).
- tai-chinh — ngoài phạm vi, VÀ giờ có thêm lý do liên quan: cùng loại rủi ro thuật ngữ 財/鬼ệ như D1 vừa phát hiện, nhưng tai-chinh's câu phú ("傳財化鬼") mang tính TƯỜNG THUẬT/biến đổi rõ hơn D1's câu thuần vị trí ("鬼臨三四") — tai-chinh VẪN giữ nguyên trạng thái RESEARCH BLOCKED như Decision Brief đã kết luận, KHÔNG được coi là "đã giải quyết luôn" chỉ vì D1 được mở khoá.
- tim-do 太陽照武 (rule phụ) — ngoài phạm vi.
- kien-tung rule chính (Mộ Thần) — ngoài phạm vi (12 Trường Sinh).
- kien-tung D2 (支干乘刑) — **CHUYỂN từ "trong phạm vi dự kiến" (theo Roadmap cũ) sang NGOÀI PHẠM VI** do phát hiện mới ở tài liệu này.
- suc-khoe, thi-cu — ngoài phạm vi (không đổi).

---

## MODEL REQUIREMENT

**SONNET SUFFICIENT.** Đánh giá dựa trên bằng chứng thực tế: (a) khối lượng code cho 4 rule
IMPLEMENTABLE tương đương chính xác 1 R-NHATTHAN-01 (đã hoàn thành thành công), nhân 4; (b) mọi
utility cần dùng (`JI_GONG_TABLE`, `EARTH_PLATE`, `TrachNhat.getNguHanhQuanHe`, `Data.CAN_NGU_HANH`)
ĐÃ tồn tại và đã dùng đúng trong R-NHATTHAN-01 — không cần học/tích hợp thư viện mới; (c) chính
QUÁ TRÌNH audit sâu vừa thực hiện ở tài liệu này (phát hiện D2 bị chặn, phát hiện gap phạm vi 六親
của D1, phát hiện `JI_GONG_TABLE` export sẵn) — tức loại công việc "đọc kỹ, phát hiện chỗ hổng,
không suy đoán" — đã được hoàn thành NGAY TRONG PHIÊN NÀY bằng đúng model đang chạy. Không có yếu
tố mới nào (khối lượng, độ mơ hồ, coupling kiến trúc) vượt quá những gì đã xử lý thành công qua
toàn bộ Phase 9-11 trước đó.

---

Tài liệu này KHÔNG thay đổi bất kỳ trạng thái đông cứng nào đã có. Không rule, evaluator, bảng
Tam Hình, hay bất kỳ code nào được tạo ra khi viết tài liệu này.
