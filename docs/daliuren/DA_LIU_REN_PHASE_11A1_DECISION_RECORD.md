# PHASE 11-A1 — DECISION RECORD (課體 / Khóa Thể)

**Loại tài liệu**: Chốt quyết định kiến trúc/tài liệu hoá, dựa trên
`docs/daliuren/DA_LIU_REN_PHASE_11A1_INDEPENDENT_AUDIT.md` (verdict B — PASS WITH NON-BLOCKING GAP).
**Phạm vi**: Quyết định thuần — KHÔNG sửa source/test, KHÔNG refactor, KHÔNG commit.

---

## 1. Context

Audit độc lập A1 (課體) kết luận **B — PASS WITH NON-BLOCKING GAP**: không có correctness
violation, nhưng có 3 finding cần 1 quyết định tường minh trước khi (a) freeze A1, và (b) bắt đầu
A2/A3/A4:

1. Provenance: `keTypeProvenanceId` tái dùng `threeTransmissionsInitialProvenanceId` thay vì tạo
   entry mới như Pre-Implementation Audit mục 4 từng đề xuất.
2. Test: thiếu 1 test purity/no-mutation kiểu `structuredClone`.
3. Kiến trúc: pattern "1 facade full-chart riêng cho mỗi field mới" có nguy cơ nhân bản cho
   A2/A3/A4, trong khi 1 cách đơn giản hơn (compose `calculateDaLiuRenChart()` +
   `computeKeType()` thủ công) đã sẵn có mà không cần code thêm.

Tài liệu này chốt 3 quyết định trên, không tự sửa code/test.

---

## 2. Provenance Decision

**Lựa chọn: Option A — giữ nguyên `keTypeProvenanceId = threeTransmissionsInitialProvenanceId`.
KHÔNG tạo provenance entry mới cho claim "課體 is valid classical terminology".**

### Phân tích

**Necessity**: Claim mà `keType.primary.method` thực sự đưa ra — theo đúng type comment gốc
(`types/ke-type.ts`: "khóa thể chính = tên gọi khác của chính pháp Cửu Tông Môn đã thắng, KHÔNG
phải 1 phân loại độc lập cần tính lại") — CHỈ là: "lá số này thuộc method X". Đây LÀ claim mà
`threeTransmissionsInitialProvenanceId` đã chứng minh đầy đủ. Claim "課體 là tên gọi hợp lệ theo
《六壬大全》" là 1 khẳng định KHÁC LOẠI — nó không thay đổi theo từng lá số (constant, không phải
biến thiên theo tính toán), mà là 1 sự thật về THIẾT KẾ SCHEMA (đã được vetting ở chính
Pre-Implementation Audit mục 6: "Classical/source basis đủ? Đủ cho `method` — B"), tương tự cách
toàn bộ schema `KeType`/`NineMethod` đã được audit TRƯỚC khi cho phép implement (đã "READY"), không
phải 1 fact cần chứng minh LẠI mỗi lần tính 1 lá số.

**Provenance granularity**: `ProvenanceEntry`/`worstConfidence()` trong kiến trúc hiện tại (Model C)
được thiết kế để chấm điểm CHUỖI BẰNG CHỨNG BIẾN THIÊN theo từng lá số (vd: method nào được chọn,
có rơi vào vùng Tý giờ mơ hồ hay không — các case đã thấy ở Phase 11-B). Một entry "hằng số, luôn
confidence B, không đổi cho bất kỳ lá số nào" không khớp với mục đích đó — nó sẽ KHÔNG BAO GIỜ là
yếu tố giới hạn (worst) trong bất kỳ phép `worstConfidence()` nào (vì các provenance chọn-method đã
biết dao động B→D tuỳ case, còn entry giả định này luôn cố định B) → thêm vào không mang lại giá
trị chứng minh thực chất nào cho `calculationConfidence` tính toán được.

**Nguy cơ overclaim**: Tạo 1 entry chỉ để "có nguồn trích dẫn" nhưng entry đó không bao giờ ảnh
hưởng kết quả `worstConfidence()` thực tế chính là dạng "tạo provenance chỉ để giữ provenance" mà
nguyên tắc Phase 11-B (P2-1: "Không được giả tạo dependency chỉ để giữ provenance") đã minh thị cấm.
Việc GIỮ Option A nhất quán hơn với nguyên tắc này so với việc tạo Option B.

**Kết luận**: Option A đúng. Pre-Implementation Audit mục 4 (đề xuất tạo mới) và mục 7 (xác nhận
identity mapping thuần) tự mâu thuẫn nhau — mục 7 là mô tả ĐÚNG bản chất kỹ thuật của field, nên
được ưu tiên.

### Recommendation (follow-up tài liệu hoá, không phải code)

Khi có dịp sửa `types/ke-type.ts` (không phải bây giờ), nên bổ sung 1 câu vào header comment làm rõ:
"Claim B-confidence về nguồn gốc cổ điển của tên gọi 課體 là 1 fact THIẾT KẾ (schema-level, hằng số,
đã vetting tại Pre-Implementation Audit), KHÔNG phải 1 claim được chứng minh qua
`ProvenanceEntry`/`calculationConfidence` runtime — `keTypeProvenanceId` CHỈ chứng minh giá trị
`method`, không chứng minh tính hợp lệ của tên gọi 課體." Đây là văn bản hoá, không phải code —
KHÔNG bắt buộc trước freeze A1 (xem mục 7).

---

## 3. Purity Test Decision

**Lựa chọn: bổ sung sau, dưới dạng non-blocking backlog — KHÔNG bắt buộc trước freeze A1.**

### Phân tích

**Có phải requirement của A1 contract không?** Không. Yêu cầu test gốc của Phase 11-A1 (bản brief
implementation) liệt kê rõ: mỗi giá trị `NineMethod`, identity mapping, deterministic output,
serialization, regression toàn bộ suite — KHÔNG có mục nào nêu "purity/no-mutation test". Đây là 1
convention đã thấy Ở NƠI KHÁC trong test suite (`calculate-da-liu-ren-chart.test.ts`), không phải 1
điều khoản tường minh của chính A1 contract.

**Convention này là hard requirement hay chỉ test-hardening?** Test-hardening. Nó không xác minh
correctness HIỆN TẠI (code review đã xác nhận 2 lần: implementation hiện tại chỉ spread, không
mutate) — nó chỉ NGĂN REGRESSION nếu 1 refactor TƯƠNG LAI vô tình đổi cách viết
(`{...base.data, keType}` → gán trực tiếp `base.data.keType = keType`). Đây là phòng ngừa, không
phải sửa lỗi đang tồn tại.

**Có thực sự cần thêm trước freeze không?** Không bắt buộc, vì:
1. Facade hiện tại RẤT NHỎ (1 object spread), rủi ro tự nhiên phát sinh mutation trong hiện trạng
   gần như bằng 0.
2. Nếu có 1 rule Tầng 2 tương lai đọc `keType` VÀ hành vi facade bị đổi sai, full regression suite
   (388 test) đã bao phủ 1 phần rủi ro liên quan (dù không phải purity cụ thể) — mức độ rủi ro còn
   lại là hẹp, không lan rộng.
3. Việc thêm ngay bây giờ đòi hỏi sửa file test → vi phạm ràng buộc "KHÔNG sửa test trong bước này"
   của chính DECISION CLOSURE này.

**Quyết định**: ghi vào backlog non-blocking — bổ sung 1 test `structuredClone`-based khi (a) file
test A1 được chạm lại lần tới (vd lúc thêm A2 và cần rà soát lại pattern test chung), hoặc (b) trước
khi bất kỳ refactor nào thay đổi thân hàm `calculateDaLiuRenChartWithKeType`. KHÔNG chặn freeze A1
hiện tại.

---

## 4. Facade Architecture Decision

**Lựa chọn: Option B — không tạo thêm facade full-chart nào nữa cho A2/A3/A4.
`calculateDaLiuRenChart()` là facade tính toán CANONICAL DUY NHẤT; mỗi field mới chỉ được expose qua
1 hàm `computeXxx()` thuần, độc lập, để consumer tự compose.**

### Phân tích

**Tại sao không giữ Option A (nhân bản facade cho từng candidate)?**
Nếu A2 (`DaLiuRenChartWithVoidBranches`+`calculateDaLiuRenChartWithVoidBranches()`), A3
(`...WithWangShuai...`), A4 (`...WithYiMaExposure...`) đều lặp lại đúng pattern A1, sẽ có 4 facade
full-chart song song, mỗi cái tự gọi lại `calculateDaLiuRenChart()` riêng — hệ quả:
- Consumer cần ≥2 field mới cùng lúc (vd `keType` + `wangShuai`) KHÔNG có facade nào phục vụ tổ hợp
  đó → phải gọi 2 facade riêng (tính base 2 LẦN, tốn kém) rồi tự merge kết quả thủ công — công sức
  NGANG BẰNG việc tự compose `computeKeType()` + `computeWangShuai()` trên 1 lần gọi base, nhưng tốn
  thêm 2x chi phí tính toán và 2x diện tích API không cần thiết.
- Số lượng public export tăng tuyến tính với số candidate mà không tăng khả năng compose — đúng
  hệt rủi ro đã nêu ở Audit mục 3 Câu hỏi B/C.

**Tại sao Option B khả thi ngay bây giờ, không cần công sức mới?**
Tiền lệ ĐÃ TỒN TẠI sẵn trong chính package này: `computeYiMa(chi): YiMaComputation` (A4's hàm nền)
đã được export thuần độc lập từ trước A1, KHÔNG có facade full-chart riêng bọc quanh nó — consumer
tự gọi sau khi có `calendar`/`fourLessons`. `computeKeType(method, provenanceId): KeTypeComputation`
(A1, vừa viết) VỐN ĐÃ theo đúng hình dạng này — nó là 1 hàm thuần nhận tham số, trả object nhỏ, có
thể gọi độc lập với `calculateDaLiuRenChartWithKeType()`. Do đó Option B không cần viết thêm gì mới
để áp dụng cho A2/A3/A4 — chỉ cần TUÂN THEO đúng khuôn mẫu `computeXxx(...)` đã có 2 tiền lệ
(`computeYiMa`, `computeKeType`), và KHÔNG viết thêm 1 `DaLiuRenChartWithXxx`/
`calculateDaLiuRenChartWithXxx()` nào nữa.

**A1 hiện tại có cần migration trước freeze không?**
**Không cần migration.** `computeKeType()` (hàm thuần) đã đúng hình dạng Option B ngay từ đầu — nó
không cần đổi gì. Phần "thừa" so với Option B chỉ là lớp facade bọc thêm
(`DaLiuRenChartWithKeType`/`calculateDaLiuRenChartWithKeType()`), và lớp này:
- Đã implement đúng, đã test (11 test), đã typecheck/build sạch.
- Không sai, không vi phạm frozen boundary, không gây regression.
- Xoá/refactor nó bây giờ là công sức thuần (churn) không đổi lại lợi ích correctness nào — vi phạm
  trực tiếp ràng buộc "KHÔNG tự refactor A1 trong bước này" của chính yêu cầu Decision Closure.

**Quyết định cho A1**: GIỮ NGUYÊN `DaLiuRenChartWithKeType`/`calculateDaLiuRenChartWithKeType()` như
1 **lớp tiện ích tương thích ngược (compatibility convenience layer)** — hợp lệ, đã freeze cùng A1,
KHÔNG bị coi là sai. Nhưng **KHÔNG được dùng làm khuôn mẫu/tiền lệ cho A2/A3/A4** — xem quy tắc ở
mục 5.

---

## 5. Rule for A2/A3/A4 (Architecture Principle — Phase 11-A)

> **`calculateDaLiuRenChart()` là facade tính toán Tầng 1 CANONICAL DUY NHẤT của package.
> Mỗi candidate Phase 11-A còn lại (A2 空亡, A3 旺衰, A4 驛馬) CHỈ được expose qua đúng 1 hàm thuần
> `computeXxx(...)` (cùng khuôn mẫu `computeYiMa`/`computeKeType`): nhận các giá trị Tầng 1 đã có
> sẵn làm tham số, trả về `{field, provenanceId}` (hoặc tương đương), KHÔNG tự gọi lại
> `calculateDaLiuRenChart()` bên trong, KHÔNG tạo type `DaLiuRenChartWithXxx` mới, KHÔNG tạo hàm
> facade `calculateDaLiuRenChartWithXxx()` mới. Consumer muốn N field additive nào đó tự gọi
> `calculateDaLiuRenChart()` MỘT LẦN rồi compose N hàm `computeXxx()` cần thiết trên kết quả đó.**

Ngoại lệ DUY NHẤT: `calculateDaLiuRenChartWithKeType()` (A1) được giữ như compatibility layer đã
freeze, không phải tiền lệ để nhân bản.

---

## 6. Impact on A1

- **Không cần sửa code/test nào** để tuân theo các quyết định trên — `computeKeType()` (hàm thuần)
  đã đúng hình dạng Option B từ đầu.
- `DaLiuRenChartWithKeType`/`calculateDaLiuRenChartWithKeType()` được giữ nguyên, coi là hoàn tất,
  freeze cùng A1 — không bị đánh giá là "nợ kỹ thuật cần trả ngay", chỉ là "không nên nhân bản".
- Finding #1 (provenance) và #3 (facade) trong Audit được đóng bằng QUYẾT ĐỊNH tường minh ở đây
  (mục 2, mục 4-5), không cần sửa code để đóng.
- Finding #2 (purity test) chuyển thành backlog non-blocking (mục 3) — không đóng bằng quyết định
  kiến trúc mà bằng lịch trình bổ sung sau.

---

## 7. Required / Not Required Follow-up

| Hạng mục | Bắt buộc trước freeze A1? | Khi nào làm |
|---|---|---|
| Tạo `ProvenanceEntry` mới cho 課體 terminology | **KHÔNG** (quyết định: không cần) | Không áp dụng — đã chốt Option A vĩnh viễn cho A1, trừ khi có lý do mới phát sinh |
| Sửa comment `types/ke-type.ts` làm rõ phạm vi provenance | Không | Fast-follow tài liệu, bất kỳ lúc nào thuận tiện, không gấp |
| Thêm purity/no-mutation test cho `calculateDaLiuRenChartWithKeType` | Không | Trước khi refactor thân hàm đó lần tới, hoặc lúc rà soát test suite cho A2 |
| Áp dụng quy tắc "chỉ `computeXxx()`, không facade mới" | **CÓ, bắt buộc cho A2/A3/A4** | Ngay từ khi bắt đầu implement A2 |
| Refactor/xoá facade A1 hiện tại | Không, và không nên | Không áp dụng |

---

## 8. Final Decisions

1. **Provenance**: Option A — giữ `keTypeProvenanceId = threeTransmissionsInitialProvenanceId`.
   Không tạo entry mới.
2. **Purity test**: Non-blocking backlog. Không bổ sung ngay, không chặn freeze.
3. **Facade architecture**: Option B cho TƯƠNG LAI (A2/A3/A4 chỉ dùng `computeXxx()` thuần, không
   facade mới). A1 hiện tại GIỮ NGUYÊN như compatibility layer đã freeze, không migration.
4. **Quy tắc chính thức cho Phase 11-A còn lại**: đã ghi ở mục 5, áp dụng bắt buộc từ A2 trở đi.

Không phát hiện điều gì cản trở việc coi A1 là hoàn tất và sẵn sàng freeze.

---

**A1 DECISIONS CLOSED**
