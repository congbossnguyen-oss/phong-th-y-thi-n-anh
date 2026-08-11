# PHASE 37 — FINAL NATAL CHART PRODUCTION CHECK

**FINAL VERDICT: `NATAL_CHART_PRODUCTION_READY`**

Phase 37 là kiểm tra sản xuất thuần túy — không nghiên cứu lý thuyết, không tìm nguồn mới, không mở
phase huyền học mới. Natal Core giữ nguyên LOCKED. Không phát hiện lỗi thật nào cần sửa, nên **không có
dòng code nào bị thay đổi** trong phase này (đúng nguyên tắc Mục 9: không sửa code chỉ để tạo thay đổi).
Không commit/push.

---

## 1. Test Count

| | PASS | EXPECTED-FAIL | UNEXPECTED-FAIL | TỔNG |
|---|---|---|---|---|
| Trước Phase 37 (baseline Phase 36) | 764 | 5 | 0 | 769 |
| Sau Phase 37 | 764 | 5 | 0 | 769 |

Không đổi — Phase 37 không thêm/sửa/xóa test nào (đây là phase kiểm tra sản xuất, không phải phase
nghiên cứu/implement).

## 2. Regression (GM-001 → GM-006)

Chạy riêng bộ test golden master + snapshot Natal Core lock:

```
tests/tu-vi-golden-gm002-006.test.ts + tu-vi-golden.test.ts + tu-vi-phase31-natal-core-lock.test.ts
Test Files  3 passed (3)
     Tests  82 passed | 5 expected fail (87)
```

5 expected-fail giữ nguyên đúng 5 case đã biết từ trước (GM-003 Thiên Lương, GM-005 Tham Lang, GM-005
Thất Sát, GM-006 Vũ Khúc+Phá Quân, GM-006 Tuần Không) — đây là các `KNOWN_GOLDEN_MASTER_DATA_CONFLICT` đã
được Phase 28 xác nhận là lỗi transcription của GM Pack text, KHÔNG PHẢI bug engine (công thức engine đã
tự-nhất-quán 84/84, xem docs/TUVI_PHASE28_POSITION_RECONCILIATION.md). Giữ nguyên, không biến thành
engine bug, không sửa Golden Master, không xóa expected-fail.

## 3. 10–20 Input Thực Tế

Chạy `tinhTuVi()` (+ `toJsonContract()`, `getTieuHanPalace()`, `getBacSiRing()`) qua script chẩn đoán
throwaway (viết vào `scripts/`, xóa ngay sau khi lấy kết quả — không để lại trong repo) với **18 input**,
phủ đủ yêu cầu Mục 3 spec:

| Tiêu chí | Đã phủ |
|---|---|
| Nam / Nữ | ✅ cả 2 |
| Can năm khác nhau | ✅ Kỷ, Mậu, Ất, Tân, Canh, Quý, Đinh, Nhâm, Bính (9/10 Can xuất hiện) |
| Chi năm khác nhau | ✅ 10+ Chi khác nhau |
| giờ Tý/Dần/Mão/Ngọ/Dậu/Hợi | ✅ đủ 6, cộng thêm Sửu/Thìn/Tỵ/Mùi/Thân/Tuất (đủ 12/12 giờ) |
| ranh giới năm âm lịch | ✅ 1/2/2026 (trước Tết) và 20/2/2026 (sau Tết, Tết 2026 = 17/2) |
| các Cục khác nhau | ✅ Thủy Nhị, Kim Tứ, Mộc Tam, Thủy Nhị, Hỏa Lục, Thổ Ngũ — đủ cả 5 Cục |
| năm nhuận âm lịch | ✅ 15/3/2023 (tháng nhuận 2), 5/5/2080 (tháng nhuận 3) |
| năm rất cũ / rất xa | ✅ 1905, 2080 |
| thiếu viewingYear | ✅ 1 case |

**Kết quả: 0 bug** — không crash, không undefined/NaN, đủ 12 cung không trùng Chi, đủ 14 chính tinh không
trùng/không thiếu, không phụ tinh trùng tên trong 1 lá số, Mệnh/Thân đúng 1 cung mỗi loại, Tứ Hóa đủ 4
field, `getTieuHanPalace()`/`getBacSiRing()` không crash và không mutate chart, `toJsonContract()`
serialize được, không mutate chart sau khi gọi lặp lại nhiều hàm read-only liên tiếp.

## 4. UI Checks (5 lá số qua Browser thật)

Mở `http://localhost:4321/lap-la-so-tu-vi` (dev server thật, không phải test giả lập), điền form và bấm
"Lập lá số" cho 5 trường hợp:

| # | Input | Kết quả |
|---|---|---|
| 1 | Nam, 11/8/1996 giờ Ngọ, dương lịch, có năm xem 2026 | OK — 12 cung, 14 chính tinh, Mệnh·Thân trùng cung Sửu hiển thị đúng, Tứ Hóa khớp giữa dòng tóm tắt và superscript trên sao |
| 2 | Nữ, 4/2/2026 giờ Tý (ngay trước Tết 2026), có năm xem | OK — âm lịch tự động lùi đúng về năm Ất Tỵ (2025), Chủ Mệnh/Chủ Thân hiển thị giá trị thật (Vũ Khúc/Thiên Cơ) |
| 3 | Nam, **nhập Âm lịch** 15/7/1988 giờ Thân (test checkbox "Ngày sinh trên là Âm lịch") | OK — dương lịch quy đổi ngược đúng 26/08/1988, không crash |
| 4 | Nam, 30/12/2010 giờ Hợi, **không nhập năm xem** | OK — dòng "Năm sinh" không hiện phần tuổi/Đại Vận theo năm xem (đúng hành vi có điều kiện), không có chữ "undefined" nào xuất hiện |
| 5 | Nữ, 18/9/1965 giờ Mão, có năm xem 2026 | OK — đủ 14/14 chính tinh (kiểm bằng danh sách đối chiếu), Cục Mộc Tam Cục, không NaN/undefined |

Xác nhận qua đọc trực tiếp nội dung HTML của card lá số (`#tv-card`, được dùng để render ảnh PNG xuất
file) bằng `javascript_tool` — nội dung là HTML thật (không phải canvas vẽ tay), nên đọc text ra được đầy
đủ và chính xác 100% những gì sẽ hiển thị trên ảnh xuất ra:

- ✅ Đủ 12 cung, tên cung đúng (Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách,
  Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ — xuất hiện đủ ở cả 5 lá số).
- ✅ Mệnh/Thân đúng (kể cả trường hợp trùng cung "MỆNH · THÂN" và trường hợp khác cung).
- ✅ Chính tinh hiển thị đủ 14/14, không trùng, không thiếu.
- ✅ Trạng thái sao hiển thị đúng dạng `(M)/(V)/(Đ)/(B)/(H)`, không có `(?)` xuất hiện ở bất kỳ chính
  tinh nào trong 5 lá số.
- ✅ Tứ Hóa hiển thị cả ở dòng tóm tắt lẫn superscript trên đúng sao tương ứng (chính tinh và phụ tinh).
- ✅ Không "undefined"/"NaN" xuất hiện ở bất kỳ đâu trong text nội dung card (kiểm bằng `String.includes`).
- ✅ Không crash ở cả 2 chế độ nhập (dương lịch/âm lịch) và cả trường hợp thiếu năm xem.
- ⚠️ "phụ tinh không đè chữ" / "không overflow" ở mức PIXEL: **không xác minh được bằng screenshot trực
  quan** trong phiên làm việc này — Browser pane không compositing được frame để chụp ảnh trong môi
  trường hiện tại (`the Browser pane is not displayed`). Đã xác minh gián tiếp bằng cách đọc HTML/CSS
  nguồn của `cellHtml()` (`lap-la-so-tu-vi.astro`) — cấu trúc dùng flow layout bình thường (không
  `position:absolute`) để mỗi dòng tự đẩy dòng dưới xuống, đúng comment nguồn "không bao giờ đè lên nội
  dung khác" — nhưng đây là xác minh qua đọc code, không phải quan sát trực quan thật. Ghi nhận trung
  thực đây là giới hạn của phiên làm việc, KHÔNG phải bằng chứng đã kiểm tra đủ.
- ✅ Không có request 404 nào liên quan đến engine/tài nguyên trang thật (404 duy nhất quan sát được là
  do tự gõ nhầm URL `/lap-la-so-tu-vi.astro` thay vì `/lap-la-so-tu-vi` lúc điều hướng ban đầu — không
  phải lỗi của site).

## 5. JSON Checks

`toJsonContract()` kiểm qua cả 18 input ở Mục 3:

- ✅ Serialize được (`JSON.stringify()` không lỗi) cho toàn bộ 18 case.
- ✅ `palaces.length === 12` cho mọi case.
- ✅ Không có `star.name === undefined` ở bất kỳ cung nào.
- ✅ Không mutate `chart` gốc (đối chiếu `JSON.stringify(chart)` trước/sau khi gọi nhiều hàm read-only
  liên tiếp bao gồm `toJsonContract()`).
- **SCHEMA_GAP đã biết, ghi nhận lại (không mở rộng kiến trúc)**: `tieuHan?: number` trong
  `TuViJsonPalace` vẫn luôn `undefined` (đặt chỗ từ Phase 21, sai kiểu dữ liệu so với
  `TieuHanPlacement` thật — đã ghi nhận ở Phase 35 mục 10/12, không có gì thay đổi).

## 6. Tiểu Hạn — Không Nghiên Cứu Thêm, Chỉ Kiểm Regression

Trạng thái giữ nguyên `TIEU_HAN_IMPLEMENTED_NEEDS_REVIEW` (Phase 35/36) — **không nâng lên LOCKED, không
sửa tuổi Tiểu Hạn**, đúng chỉ thị. Module `getTieuHanPalace()`/`getTuoiTieuHan()` KHÔNG được gọi ở đâu
trong renderer (`lap-la-so-tu-vi.astro`) — xác nhận bằng grep, 0 kết quả — nên không có gì để "render" hay
gây regression UI. Chỉ xác nhận (Mục 3) rằng gọi trực tiếp 2 hàm này qua 18 input không crash/NaN và
không mutate chart — đủ điều kiện "không gây regression" theo đúng phạm vi Mục 6 spec.

## 7. Bugs Found

**Không có.** Đây là lần rà soát production-check thứ 37 (sau 30+ phase nghiên cứu/khóa rule/implement
trước đó) và không phát hiện lỗi thực tế mới nào — kết quả nhất quán với việc Natal Core đã được audit
sâu và khóa cẩn thận từ Phase 16-31, Vòng Bác Sĩ/Tiểu Hạn (Future Module) đã được test kỹ ở Phase 32/35.

## 8. Bugs Fixed

Không có (không có bug để sửa — đúng Mục 9 spec: "Nếu không phát hiện lỗi: KHÔNG sửa code chỉ để tạo
thay đổi").

## 9. Known Limitations (nhắc lại, không phải bug mới)

- GM-003/005/006: 3 vị trí sao xung đột với text Golden Master Pack — đã xác nhận Phase 28 là
  `KNOWN_GOLDEN_MASTER_DATA_CONFLICT` (nghi vấn lỗi transcription GM Pack), KHÔNG PHẢI engine bug. Giữ
  nguyên `it.fails()`.
- Hỏa Tinh/Linh Tinh: `DEFERRED_SCHOOL_CONFLICT`, hướng an sao chưa đủ nguồn Nam Phái để khóa (từ
  Phase 22/23/31).
- Tiểu Hạn: `TIEU_HAN_IMPLEMENTED_NEEDS_REVIEW` — cung khởi/chiều `SOURCE_SUPPORTED` (chưa `LOCKED`,
  thiếu nguồn độc lập thứ 2), cách đếm tuổi (`getTuoiTieuHan`) `NEED_REVIEW` (tái dùng `tuoiNamXem` có
  sẵn, chưa có nguồn Tiểu-Hạn-riêng xác nhận tuổi mụ/thực).
- JSON contract: `tieuHan?: number` field đặt chỗ sai kiểu dữ liệu (SCHEMA_GAP, chưa map dữ liệu thật).
- Kiểm tra visual/pixel (overflow, đè chữ) chưa xác minh trực tiếp bằng screenshot trong phiên này (giới
  hạn môi trường Browser pane) — chỉ xác minh gián tiếp qua code + nội dung text đầy đủ, chính xác.
- `rules.ts` export ~50 symbol công khai — đã gắn cờ `API_CLEANUP_CANDIDATE` từ Phase 31, chưa refactor
  (đúng chủ trương không refactor lớn ngoài phạm vi cần thiết).

## 10. Final Verdict

Toàn bộ pipeline lập lá số (Input → Âm/Dương lịch → 4 trụ → Mệnh/Thân → 12 cung → Can 12 cung → Cục → 14
chính tinh → Miếu/Vượng/Đắc/Bình/Hãm → Tứ Hóa → Tuần/Triệt → Phụ tinh → Vòng sao → Đại Vận → Tiểu Hạn)
chạy ổn định qua 18 input đa dạng (giờ, Can, Chi, Cục, ranh giới năm âm lịch, năm nhuận, năm rất cũ/rất
xa, thiếu năm xem), 5 lá số kiểm qua UI thật không crash/không lỗi hiển thị nội dung, JSON serialize sạch
không mutate, regression GM-001→006 giữ nguyên đúng baseline đã biết.

```
NATAL_CHART_PRODUCTION_READY
```
