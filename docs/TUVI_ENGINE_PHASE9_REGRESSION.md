# TUVI ENGINE — PHASE 9: DEEP REGRESSION AUDIT

Xác nhận Phase 8 (khóa Chủ Mệnh/Chủ Thân theo Chi năm sinh, cập nhật status table + Thiên Việt từ nguồn
Nguyên Cát) không làm hỏng bất kỳ calculation layer nào đã VERIFIED trước đó. **Không sửa code trong
phase này** (chỉ thêm 1 test file mới cho mục 2 — position/status separation — theo đúng yêu cầu "tạo
test"). Không commit, không push.

---

## A. TỔNG TEST

| | PRE_PHASE8 | POST_PHASE8 (= hiện tại, sau Phase 9) |
|---|---:|---:|
| Test file (`tests/tu-vi*.test.ts`) | 6 | 9 (+3: `tu-vi-phase8-locked-rules`, `tu-vi-position-status-separation`, và các file Phase 2 đã có từ trước) |
| Tổng test toàn site | 229 | 271 |

## B. PASS

**266 / 271**

## C. EXPECTED FAIL

**5 / 271** — đúng bằng số `it.fails()` thật sự trong code (đã đếm bằng grep, loại trừ các dòng comment
nhắc tới `it.fails()`), không lệch:

1. `tests/tu-vi-golden-gm002-006.test.ts:138` — GM-003, vị trí Thiên Lương (Thân theo pack vs Dần theo engine).
2. `tests/tu-vi-golden-gm002-006.test.ts:273` — GM-005, vị trí Tham Lang (Dần theo pack vs Tuất theo engine).
3. `tests/tu-vi-golden-gm002-006.test.ts:276` — GM-005, vị trí Thất Sát (Tuất theo pack vs Dần theo engine).
4. `tests/tu-vi-golden-gm002-006.test.ts:367` — GM-006, vị trí Vũ Khúc/Phá Quân (Mão theo pack vs Hợi theo engine).
5. `tests/tu-vi-golden-gm002-006.test.ts:377` — GM-006, Tuần Không (Tý-Sửu theo pack vs Dần-Mão theo engine).

Cả 5 đều là mâu thuẫn VỊ TRÍ SAO/TUẦN KHÔNG đã ghi nhận từ Phase 3/6, **ngoài phạm vi Phase 8** (Phase 8
chỉ đụng tới status/Chủ Mệnh/Chủ Thân/Thiên Việt) nên không đổi, đúng như dự kiến.

## D. UNEXPECTED FAIL

**0** — không có bất kỳ test nào fail ngoài dự kiến, ở bất kỳ file nào, kể cả sau khi thêm test mới.

---

## E. GM TỪNG LÁ — REGRESSION ĐẦY ĐỦ (Calendar, Lunar, Can Chi, Mệnh, Thân, 12 cung, 14 chính tinh, Cục,
Mệnh Quái, Đại Vận, Tứ Hóa, Chủ Mệnh, Chủ Thân, Status)

Chạy lại `tinhTuVi()` trực tiếp cho cả 6 GM (không chỉ chạy test có sẵn — dump toàn bộ output để đối
chiếu tay), so với giá trị đã xác nhận ở Phase 3/6/7/8:

| Trường | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Lunar date | 21/7/1980 ✅ | 21/7/1980 ✅ | 6/7/1990 ✅ | 23/7/1997 ✅ | 23/7/1997 ✅ | 17/12/2025 ✅ |
| Can Chi năm | Canh Thân ✅ | Canh Thân ✅ | Canh Ngọ ✅ | Đinh Sửu ✅ | Đinh Sửu ✅ | Ất Tỵ ✅ |
| Mệnh | Dần ✅ | Dần ✅ | Dần ✅ | Dần ✅ | Thân ✅ | Tý ✅ |
| Thân | Dần ✅ | Dần ✅ | Dần ✅ | Dần ✅ | Thân ✅ | Dần ✅ |
| 12 cung (tên) | ✅ đủ 12/12 | ✅ | ✅ | ✅ | ✅ | ✅ (Thân cư Phúc Đức đúng) |
| 14 chính tinh (vị trí) | ✅ 14/14 | ✅ 14/14 | ✅ 13/14 (Thiên Lương disputed, không đổi) | ✅ 14/14 | ✅ 12/14 (Dần/Tuất disputed, không đổi) | ✅ 10/12 (Mão/Hợi disputed, không đổi) |
| Cục | Thổ Ngũ ✅ | Thổ Ngũ ✅ | Thổ Ngũ ✅ | Kim Tứ ✅ | Thổ Ngũ ✅ | Hỏa Lục ✅ |
| Mệnh Quái | Khôn ✅ | Tốn ✅ | Khảm ✅ | Chấn ✅ | Chấn ✅ | Khôn ✅ |
| Đại Vận (tuổi khởi) | 5 ✅ | 5 ✅ | 5 ✅ | 4 ✅ | 5 ✅ | 6 ✅ |
| Đại Vận (hướng) | Thuận ✅ | Nghịch ✅ | Thuận ✅ | Thuận ✅ | Nghịch ✅ | Nghịch ✅ |
| Tứ Hóa (bộ Can) | Canh ✅ | Canh ✅ | Canh ✅ | Đinh ✅ | Đinh ✅ | Ất ✅ |
| **Chủ Mệnh** | Liêm Trinh ✅ | Liêm Trinh ✅ | **Phá Quân ✅ (mới KHÓA đúng ở Phase 8)** | **Cự Môn ✅ (mới)** | **Cự Môn ✅ (mới)** | **Vũ Khúc ✅ (mới)** |
| **Chủ Thân** | Thiên Lương ✅ | Thiên Lương ✅ | **Hỏa Tinh ✅ (mới)** | **Thiên Tướng ✅ (mới)** | **Thiên Tướng ✅ (mới)** | **Thiên Cơ ✅ (mới)** |
| Status (điểm dữ liệu GM khớp) | 13/13 ✅ | 13/13 ✅ | 11/13 khớp, đúng 2 ô "Chưa xác định" đã dự kiến (Vũ Khúc@Mão, Thiên Cơ@Ngọ) | 14/14 ✅ | 11/12 khớp, đúng 1 ô "Chưa xác định" (không tính 2 ô disputed vị trí) | 8/10 khớp, đúng 2 ô "Chưa xác định" đã dự kiến (Thái Âm@Dần, Thất Sát@Mùi) |

**Không có regression ở bất kỳ ô nào.** Toàn bộ ô "Chưa xác định" xuất hiện đúng ở vị trí đã dự kiến từ
Phase 8 (đối chiếu tay qua dump trực tiếp `tinhTuVi()`, không chỉ qua unit test).

---

## F. REGRESSION TỪNG MODULE

| Module | Ảnh hưởng bởi Phase 8? | Kết quả regression |
|---|---|---|
| Calendar (solarToLunar) | Không | Không đổi — đã xác nhận qua dump 6/6 GM |
| Can Chi năm/Mệnh/Thân | Không | Không đổi |
| An Mệnh/Thân (công thức) | Không | Không đổi |
| 12 cung + tên cung | Không | Không đổi |
| Cục (Ngũ Hành Cục) | Không | Không đổi |
| 14 chính tinh — VỊ TRÍ (TU_VI_RING/THIEN_PHU_RING) | Không | Không đổi (xem mục G — test riêng chứng minh tách biệt) |
| 14 chính tinh — TRẠNG THÁI (MAIN_STAR_STATUS) | **CÓ — cập nhật từ Nguyên Cát** | Đổi giá trị đúng theo thiết kế Phase 8, không rò rỉ sang vị trí |
| Mệnh Quái | Không | Không đổi |
| Chủ Mệnh / Chủ Thân | **CÓ — đổi khóa tra bảng** | Đổi đúng theo thiết kế, 4/12 Chi VERIFIED, 8/12 NEED_GOLDEN_MASTER_REVIEW |
| Đại Vận | Không | Không đổi |
| Tứ Hóa (chọn bộ theo Can) | Không | Không đổi |
| Tứ Hóa (gắn nhãn lên sao, bao gồm phụ tinh) | Không (đã fix từ Phase 1) | Không đổi, vẫn hoạt động đúng 10/10 Can |
| Thiên Khôi | Không (Phase 8 không đụng) | Không đổi — vẫn bảng spec gốc, rủi ro "2 nguồn khác nhau với Việt" vẫn còn, đã ghi rõ |
| Thiên Việt | **CÓ — đổi bảng nguồn** | Đổi đúng theo thiết kế, không còn Khôi+6 |
| Tuần/Triệt | Không | Không đổi |
| Thiên Hình, phụ tinh khác | Không | Không đổi |

---

## G. UNKNOWN-STATE TEST (mục 3 yêu cầu — Chủ Mệnh/Chủ Thân 8 Chi chưa có dữ liệu)

Xác nhận bằng test (`tests/tu-vi-phase8-locked-rules.test.ts`, chạy lại trong Phase 9, 35/35 pass) và bổ
sung kiểm tra kiểu dữ liệu:

- Cả 8 Chi (Tý, Dần, Mão, Thìn, Mùi, Dậu, Tuất, Hợi) đều trả về CHUỖI `"NEED_GOLDEN_MASTER_REVIEW"` —
  không phải `undefined`, không phải `null`, không throw exception.
- Xác nhận bằng chart thật: năm Nhâm Dần 2022 (yearChi = Dần, thuộc nhóm 8 Chi chưa xác nhận) →
  `chart.chuMenh === "NEED_GOLDEN_MASTER_REVIEW"`, `chart.chuThan === "NEED_GOLDEN_MASTER_REVIEW"` — đúng
  loại `string`, đúng schema hiện tại của field `chuMenh`/`chuThan: string` trong `TuViChart`.
- Không có fallback sang rule khác (không tự động dùng bảng Chi cung Mệnh cũ, không suy diễn theo đối
  xứng) — xác nhận riêng cho Tý (Chủ Thân): dù nguồn Nguyên Cát gợi ý đối xứng với Ngọ (cùng "Hỏa Tinh"),
  `getChuThan(0)` vẫn trả `"NEED_GOLDEN_MASTER_REVIEW"`, không tự điền "Hỏa Tinh".

**Đạt yêu cầu mục 3.**

---

## H. THIÊN VIỆT

`tests/tu-vi-thien-viet.test.ts` (22/22 pass) + `tests/tu-vi-phase8-locked-rules.test.ts` phần Thiên Việt
(10/10 pass) xác nhận:

- Đủ 10/10 Can có giá trị từ `THIEN_VIET_TABLE` (bảng Nguyên Cát), không thiếu Can nào.
- Test riêng xác nhận KHÔNG PHẢI toàn bộ 10 Can đều khớp công thức đối xứng `Khôi + 6` cũ (regression
  chặn việc quay lại công thức bị cấm).
- Trạng thái giữ đúng, không tự nâng cấp:

```
SOURCE_SUPPORTED = TRUE
GOLDEN_MASTER_VERIFIED = FALSE
```

Không có GM nào trong 6 GM hiện có (kể cả sau khi dump lại toàn bộ ở mục E) chứa dữ liệu vị trí Thiên
Việt — xác nhận lại bằng cách đọc toàn bộ "Principal stars" của cả 6 GM, không GM nào liệt kê Thiên Việt.

---

## I. TỨ HÓA — PHỤ TINH

`tests/tu-vi-tu-hoa-full.test.ts` (21/21 pass) — regression đầy đủ 10/10 Can, xác nhận riêng 5 Can có sao
đích là phụ tinh đều gắn nhãn thành công:

| Can | Sao phụ tinh nhận Tứ Hóa | Nhãn | Kết quả |
|---|---|---|---|
| Bính | Văn Xương | Hóa Khoa | ✅ gắn đúng |
| Mậu | Hữu Bật | Hóa Khoa | ✅ gắn đúng |
| Kỷ | Văn Khúc | Hóa Kỵ | ✅ gắn đúng |
| Tân | Văn Khúc | Hóa Khoa | ✅ gắn đúng |
| Tân | Văn Xương | Hóa Kỵ | ✅ gắn đúng (Tân có cả 2 nhãn trên phụ tinh) |
| Nhâm | Tả Phù | Hóa Khoa | ✅ gắn đúng |

Không regression — đây là fix từ Phase 1, Phase 8 không đụng tới logic này, kết quả không đổi.

---

## J. BOUNDARY TESTS

| Boundary | File test | Kết quả |
|---|---|---|
| Giờ Tý (GM-004 vs GM-005) | `tu-vi-golden-gm002-006.test.ts` ("Test B") | ✅ Mệnh đổi Dần→Thân đúng như trước, không regression |
| Ranh giới năm Âm lịch (GM-006, Dương 2026/Âm 2025) | `tu-vi-golden-gm002-006.test.ts` ("Test C") | ✅ Không đổi, Ất Tỵ đúng |
| Năm 1900 | `tu-vi-menh-quai-boundary.test.ts` | ✅ Không crash, Mệnh Quái = Khảm không đổi |
| Năm 1800 | " | ✅ Không đổi |
| Năm 2000 | " | ✅ Không đổi |
| Năm 2001 | " | ✅ Không đổi |
| Năm 2021 | " | ✅ Không đổi |
| Năm 2026 | " | ✅ Không đổi |

Toàn bộ 16/16 test trong `tu-vi-menh-quai-boundary.test.ts` pass, không có giá trị nào bị Phase 8 làm
lệch (Mệnh Quái không nằm trong phạm vi thay đổi của Phase 8).

---

## K. TEST INTEGRITY AUDIT

- **Không test nào bị xóa.** Đối chiếu số lượng `it(`/`it.fails(` trước/sau Phase 8 khớp với số lượng
  test report của vitest (271 = tổng số khối `it`/`it.fails` đếm được bằng grep, không thiếu).
- **Không expected value nào bị sửa chỉ để pass.** Duy nhất 8 thay đổi trong `tu-vi-golden-gm002-006.test.ts`
  là chuyển `it.fails(...)` → `it(...)` — bản chất là XÓA wrapper `.fails`, KHÔNG đổi bất kỳ giá trị
  `expect(...).toBe(...)` nào bên trong (nội dung assertion giữ nguyên 100%, chỉ đúng ra là ĐÃ pass thay
  vì trước đây pass-vì-fail). Đã đối chiếu trực tiếp: giá trị mong đợi (Phá Quân, Hỏa Tinh, Cự Môn, Thiên
  Tướng, Vũ Khúc, Thiên Cơ) giống hệt giá trị đã lấy từ Golden Master Pack gốc ở Phase 3, không đổi.
- **Không snapshot nào bị cập nhật vô lý** — dự án này không dùng snapshot testing (`toMatchSnapshot`),
  không áp dụng.
- **Không test nào phụ thuộc implementation nội bộ thay vì output** — toàn bộ test gọi `tinhTuVi()` (hàm
  public duy nhất) và đọc field trên `TuViChart` trả về, hoặc gọi trực tiếp các hàm export công khai
  (`getChuMenh`, `getThienViet`...) — không có test nào import biến nội bộ không export hay dùng
  `@ts-ignore`/`as any` để bẻ khóa truy cập private. Riêng test mới ở mục G (position/status separation)
  có MUTATE trực tiếp `MAIN_STAR_STATUS` (1 export public, không phải biến private) để chứng minh tách
  biệt kiến trúc — đây là kỹ thuật hợp lệ cho loại test này (dependency injection thủ công qua mutation),
  có `afterEach` khôi phục nguyên trạng để không ảnh hưởng test khác (đã xác nhận qua full suite run,
  không có regression lan sang file khác).
- **Các expected-fail vẫn ghi rõ lý do** — cả 5 `it.fails()` còn lại đều có tên test mô tả rõ
  "(NEED_GOLDEN_MASTER_REVIEW — engine tính ra X)" kèm block comment giải thích bằng chứng phía trên,
  không có `it.fails()` nào để trống lý do.

---

## PRE_PHASE8 vs POST_PHASE8 — TÓM TẮT THAY ĐỔI

| | PRE_PHASE8 | POST_PHASE8 |
|---|---|---|
| Chủ Mệnh/Chủ Thân — khóa tra bảng | Chi cung Mệnh/Thân (SAI, 0/6 GM khớp) | Chi năm sinh (6/6 GM khớp cho 4 Chi đã có dữ liệu) |
| Chủ Mệnh/Chủ Thân — 8 Chi chưa xác nhận | Trả giá trị đoán (trông như đã verified nhưng không phải) | Trả `NEED_GOLDEN_MASTER_REVIEW` tường minh |
| Status table nguồn | Bảng tự suy đoán từ trí nhớ (27/62 = 43,5% khớp GM) | Bảng Nguyên Cát có trích dẫn nguồn (57/62 = 91,9% khớp GM) |
| Status table — 5 ô mâu thuẫn | Ẩn trong bảng, có vẻ như 1 giá trị chắc chắn | Tường minh `"Chưa xác định"`, không chọn bên |
| Thiên Việt | Bảng cổ điển tạm dùng, không trích dẫn được nguồn cụ thể | Bảng có nguồn trích dẫn cụ thể ("Sai lầm về an sao lập số") |
| Vị trí 14 chính tinh, Mệnh/Thân, Cục, Đại Vận, Tứ Hóa (chọn Can), 12 cung | Không đổi | Không đổi — xác nhận bằng test kiến trúc riêng (mục G báo cáo Phase 9) |
| Tổng test | 229 | 271 |

---

## KẾT LUẬN

```
PHASE 9 REGRESSION PASS
```

Lý do: 0 unexpected failure trên 271 test (266 pass + 5 expected-fail, đúng bằng số lượng và đúng vị trí
`it.fails()` đã biết trước, không có gì mới hoặc bất ngờ). Regression đối chiếu tay qua dump trực tiếp
`tinhTuVi()` cho cả 6 Golden Master xác nhận không có sai lệch nào so với Phase 8. Test kiến trúc mới
(mục G/F) chứng minh bằng thực nghiệm rằng thay đổi status table trong Phase 8 không rò rỉ ảnh hưởng sang
vị trí sao, cung, Mệnh, Thân, Cục, Đại Vận, hay lựa chọn bộ Tứ Hóa. Không có expected value nào bị sửa để
ép test pass — toàn bộ thay đổi test là do rule thật sự đổi đúng theo bằng chứng đã trình bày ở các phase
trước.
