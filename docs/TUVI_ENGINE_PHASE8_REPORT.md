# TUVI ENGINE — PHASE 8 REPORT: LOCK VERIFIED RULES

Theo đúng yêu cầu Phase 8 của người dùng. **Không commit, không push.** Đã sửa code (khác các phase
forensics trước) — chi tiết thay đổi liệt kê dưới đây.

---

## A. RULE ĐÃ KHÓA (LOCKED)

### A1. Chủ Mệnh — khóa `CHU_MENH_INPUT = YEAR_BRANCH`

- Đổi tên: `CHU_MENH_TABLE` (cũ, key = Chi cung Mệnh) → `CHU_MENH_BY_YEAR_BRANCH` (mới, key = Chi năm
  sinh), hàm truy cập `getChuMenh(yearChiIndex)`.
- `src/lib/tu-vi/engine.ts`: `chuMenh = CHU_MENH_TABLE[menhChiIndex]` → `chuMenh = getChuMenh(yearChiIndex)`.
- Bảng chỉ có đúng 4 entry (Thân→Liêm Trinh, Ngọ→Phá Quân, Sửu→Cự Môn, Tỵ→Vũ Khúc) — 8 Chi còn lại
  **KHÔNG điền**, hàm trả `"NEED_GOLDEN_MASTER_REVIEW"`.
- `SOURCE_TEXT_CONFLICT = TRUE` — giữ nguyên trong comment code: `TuVi_Profile_NguyenCat_V1.md` mục 5 tự
  khẳng định "tra theo Chi cung Mệnh, không dùng Chi năm sinh", nhưng kiểm bằng 6 Golden Master cho kết
  quả ngược lại (0/6 vs 6/6) — mâu thuẫn giữa lời văn nguồn và chính bảng giá trị của nguồn đó, đã ghi rõ
  trong code, không tự sửa lại văn bản nguồn.

### A2. Chủ Thân — khóa `THAN_CHU_INPUT = YEAR_BRANCH`

- Đổi tên tương tự: `CHU_THAN_TABLE` → `THAN_CHU_BY_YEAR_BRANCH`, hàm `getChuThan(yearChiIndex)`.
- 4 entry: Thân→Thiên Lương, Ngọ→Hỏa Tinh, Sửu→Thiên Tướng, Tỵ→Thiên Cơ.
- Ngọ → Hỏa Tinh: **VERIFIED** qua GM-003 — giải quyết được nhánh Ngọ của mâu thuẫn "Tý/Ngọ presentation"
  mà `TuVi_Profile_NguyenCat_V1.md` mục 6 tự khai báo.
- Tý: **KHÔNG điền**, giữ `NEED_GOLDEN_MASTER_REVIEW` dù nguồn gợi ý đối xứng với Ngọ (cùng "Hỏa Tinh") —
  không suy diễn theo đối xứng, đúng chỉ thị "không suy diễn". Có test riêng xác nhận hành vi này
  (`tests/tu-vi-phase8-locked-rules.test.ts`).

### A3. Thiên Lương @ Sửu — khóa = Đắc

`MAIN_STAR_STATUS["Thiên Lương"][1] = "Đắc"` — trước đây nguồn Nguyên Cát tự khai báo CONFLICTED
(Vượng/Đắc) cho cả Sửu và Mùi; GM-005 xác nhận trực tiếp Sửu = Đắc, giải quyết được 1/2 xung đột.

### A4. Thiên Việt — khóa bảng nguồn Nguyên Cát

`THIEN_VIET_TABLE` thay hoàn toàn bằng bảng "Sai lầm về an sao lập số" (Học Viện Lý Số): Giáp/Mậu→Mùi,
Ất/Kỷ→Thân, Bính/Đinh→Dậu, Canh/Tân→Dần, Nhâm/Quý→Tỵ. Không còn dùng bảng cổ điển tạm ở Phase 1, càng
không dùng công thức `Việt = Khôi + 6` (đã cấm từ Phase 1).

### A5. Status table — cập nhật từ nguồn Nguyên Cát

`MAIN_STAR_STATUS` (14×12) thay bằng bảng `TuVi_Profile_NguyenCat_V1.md` §3, giữ nguyên **5 ô cố tình
"Chưa xác định"** (thêm giá trị mới vào type `TrangThaiSao`, không dùng bảng cũ hay bảng mới cho các ô
này): Vũ Khúc@Mão, Thiên Cơ@Ngọ, Thái Âm@Dần, Thất Sát@Mùi, Thiên Lương@Mùi.

---

## B. RULE SOURCE-SUPPORTED NHƯNG CHƯA GOLDEN MASTER VERIFIED

| Rule | Nguồn | Trạng thái |
|---|---|---|
| Thiên Việt (10/10 Can) | Học Viện Lý Số, "Sai lầm về an sao lập số" | `SOURCE_SUPPORTED = TRUE`, `GOLDEN_MASTER_VERIFIED = FALSE` — không có GM nào trong 6 GM hiện có ghi vị trí Thiên Việt |
| Status table (phần lớn 168 ô ngoài các ô đã VERIFIED riêng) | Học Viện Lý Số / Tử Vi Nguyên Cát | 57/62 điểm có dữ liệu GM khớp (91,9%) — các ô KHÔNG có dữ liệu GM (không nằm trong 62 điểm đó) vẫn chỉ ở mức "nguồn hỗ trợ", không phải VERIFIED riêng lẻ |
| Chủ Mệnh: 8 Chi năm sinh còn lại (Tý, Dần, Mão, Thìn, Mùi, Dậu, Tuất, Hợi) | Học Viện Lý Số (bảng giá trị Mệnh Chủ, key gốc ghi sai nhưng giá trị có nguồn) | CÓ candidate value trong nguồn nhưng **cố tình không đưa vào code** theo đúng chỉ thị "không tự điền 8 giá trị chưa có evidence" |
| Thiên Khôi (không đổi ở Phase 8) | TuVi_Engine_V2.md §19 (nguồn khác Thiên Việt) | Vẫn giữ nguyên rủi ro đã biết: Khôi và Việt hiện đến từ 2 nguồn khác nhau — không nằm trong phạm vi Phase 8 nên không tự sửa |

---

## C. RULE UNRESOLVED (cố tình không đụng tới)

| Rule | Trạng thái | Lý do giữ nguyên |
|---|---|---|
| Thiên Lương @ Mùi | `Chưa xác định` | Nguồn tự khai báo CONFLICTED (Vượng/Đắc), không có GM nào chạm tới Mùi để giải quyết |
| Vũ Khúc @ Mão | `Chưa xác định` | GM-003 mâu thuẫn nguồn (Miếu vs Đắc), 1 điểm dữ liệu không đủ để chọn bên |
| Thiên Cơ @ Ngọ | `Chưa xác định` | GM-003 mâu thuẫn nguồn (Bình vs Đắc), tương tự |
| Thái Âm @ Dần | `Chưa xác định` | GM-006 mâu thuẫn nguồn (Miếu vs Hãm), tương tự |
| Thất Sát @ Mùi | `Chưa xác định` | GM-006 mâu thuẫn nguồn (Bình vs Đắc), tương tự |
| Chủ Mệnh/Chủ Thân — 8/12 Chi năm sinh | `NEED_GOLDEN_MASTER_REVIEW` | Không tự điền dù nguồn có candidate value |
| Chủ Thân @ Tý | `NEED_GOLDEN_MASTER_REVIEW` | Đặc biệt giữ dù nguồn gợi ý đối xứng với Ngọ |
| 4 transcription conflict cũ (GM-003 Thiên Lương vị trí, GM-005 Tham Lang/Thất Sát vị trí, GM-006 Vũ Khúc/Phá Quân vị trí, GM-006 Tuần Không) | Giữ nguyên | Ngoài phạm vi Phase 8 (chỉ về status/Chủ Mệnh/Chủ Thân/Thiên Việt), không đụng tới |
| Tiểu Hạn, Lưu Niên, hệ thống Profile khác | MISSING | Không thêm theo đúng chỉ thị "Không thêm Tiểu Hạn/Lưu Niên/Profile khác" |

---

## D. GOLDEN MASTER CONTRADICTIONS (không đổi so với Phase 7, liệt kê lại cho đầy đủ báo cáo)

1. Vũ Khúc @ Mão — GM-003 ghi Miếu, nguồn ghi Đắc → giữ `Chưa xác định`.
2. Thiên Cơ @ Ngọ — GM-003 ghi Bình, nguồn ghi Đắc → giữ `Chưa xác định`.
3. Thái Âm @ Dần — GM-006 ghi Miếu, nguồn ghi Hãm → giữ `Chưa xác định`.
4. Thất Sát @ Mùi — GM-006 ghi Bình, nguồn ghi Đắc → giữ `Chưa xác định`.
5. Thiên Lương @ Mùi — nguồn tự mâu thuẫn nội bộ, không GM nào giải quyết → giữ `Chưa xác định`.
6. Mệnh Chủ — nguồn tự mâu thuẫn (lời văn nói "Chi Mệnh", giá trị chỉ khớp "Chi năm") → đã khóa theo giá
   trị + Chi năm sinh, ghi `SOURCE_TEXT_CONFLICT = TRUE` trong code.

Không có GM nào bị sửa. Không có rule nào bị đổi chỉ để ép GM pass — mọi thay đổi đều dựa trên bằng chứng
đối chiếu đã trình bày ở `docs/TuVi_Profile_NguyenCat_V1_Review.md` và `docs/TUVI_RULE_FORENSICS.md`.

---

## E. TEST TRƯỚC/SAU

| | Trước Phase 8 | Sau Phase 8 |
|---|---:|---:|
| Test file | 12 | 13 (+1: `tests/tu-vi-phase8-locked-rules.test.ts`) |
| Tổng test | 229 | 264 |
| Pass | 216 | 259 |
| Expected fail (`it.fails()`) | 13 | 5 |

**Không xóa test nào.** 8 test chuyển từ `it.fails()` sang `it()` thường (đúng theo yêu cầu "không biến
test fail thành pass bằng cách sửa expected" — đây KHÔNG phải sửa expected, mà là nâng cấp trạng thái vì
RULE đã đổi khiến assertion cũ (vốn đúng theo Golden Master từ đầu) nay thật sự pass):

- GM-003: Chủ Mệnh = Phá Quân, Chủ Thân = Hỏa Tinh (2 test).
- GM-004: Chủ Mệnh = Cự Môn, Chủ Thân = Thiên Tướng (2 test).
- GM-005: Chủ Mệnh = Cự Môn, Chủ Thân = Thiên Tướng (2 test).
- GM-006: Chủ Mệnh = Vũ Khúc, Chủ Thân = Thiên Cơ (2 test).

5 `it.fails()` còn lại (không đổi, đúng phạm vi Phase 8 không đụng tới): GM-003 Thiên Lương vị trí,
GM-005 Tham Lang vị trí, GM-005 Thất Sát vị trí, GM-006 Vũ Khúc+Phá Quân vị trí, GM-006 Tuần Không.

35 test mới trong `tests/tu-vi-phase8-locked-rules.test.ts`: xác nhận đúng 4/12 Chi có giá trị Chủ Mệnh/
Chủ Thân, đúng 8/12 Chi trả `NEED_GOLDEN_MASTER_REVIEW`, đúng 5 ô status "Chưa xác định", Thiên Lương@Sửu
khóa Đắc, Thiên Việt đủ 10 Can theo bảng mới, và 3 test regression trên chart thật (GM-001, GM-003, và 1
năm chưa xác nhận — Nhâm Dần 2022 — để xác nhận hành vi trả về nhãn rõ ràng thay vì đoán).

`npx astro build`: pass, không lỗi.

---

## KẾT LUẬN

```
READY FOR PHASE 8 IMPLEMENTATION
```

Đã hoàn tất đúng phạm vi được giao: khóa 2 rule có bằng chứng đủ mạnh (Chủ Mệnh/Chủ Thân theo Chi năm
sinh, chỉ 4/12 giá trị), cập nhật status table + Thiên Việt từ nguồn Nguyên Cát trong khi giữ nguyên 5 ô
tranh chấp, không tự chọn A/B cho bất kỳ mâu thuẫn Golden Master nào, không thêm Tiểu Hạn/Lưu Niên/Profile
khác, không xóa test, 264/264 test chạy đúng như kỳ vọng (259 pass + 5 expected-fail, không có gì bất
ngờ). Chưa commit, chưa push.
