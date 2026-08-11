# TUVI PHASE 25 — THIÊN DIÊU / THIÊN Y SOURCE RESEARCH & IMPLEMENTATION

Tìm được nguồn Level 1 đủ rõ → **IMPLEMENT**. Không đụng Hỏa Tinh/Linh Tinh/Địa Không/Địa Kiếp/Khôi Việt/
Xương Khúc/Tả Hữu. Không sửa Golden Master, 14 chính tinh, status Nguyên Cát. **Không commit/push.**

---

## BẢNG TỔNG HỢP

| Sao | Rule | Source | School | Implementation | GM | Evidence | Status | Action |
|---|---|---|---|---|---|---|---|---|
| Thiên Diêu | Khởi Sửu tại tháng 1, đếm thuận theo tháng sinh | hocvienlyso.org, "Tự học tử vi đẩu số bài 13: an các sao theo tháng sinh" | Nam Phái (Level 1, chính domain) | **ĐÃ IMPLEMENT** — `thienDieuIndex(lunarMonth)` | 0/6 | Khớp cùng bài đã dùng cho Tả Phù/Hữu Bật (Phase 24); Thiên Hình trong cùng bài khớp công thức đã có | SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE | Implement xong |
| Thiên Y | Luôn đồng cung với Thiên Diêu (không đếm độc lập) | Cùng nguồn trên | Nam Phái (Level 1) | **ĐÃ IMPLEMENT** — `thienYIndex(lunarMonth) = thienDieuIndex(lunarMonth)` | 0/6 | Nguyên văn nguồn xác nhận rõ, không suy diễn | SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE | Implement xong |

---

## 1. Source research

| # | URL | Tiêu đề | Trường phái | Nội dung rule | Độ tin cậy | Độc lập? |
|---|---|---|---|---|---|---|
| 1 | `hocvienlyso.org/tu-hoc-tu-vi-dau-bai-13-cac-sao-theo-thang-sinh.html` | "Tự học tử vi đẩu số bài 13: an các sao theo tháng sinh" | Nam Phái (chính domain Học Viện Lý Số) | Thiên Diêu/Riêu: khởi Sửu, đếm thuận theo tháng sinh. Thiên Y: đồng cung với Thiên Diêu. (Cùng bài: Tả Phụ khởi Thìn thuận, Hữu Bật khởi Tuất nghịch, Thiên Hình khởi Dậu thuận — đã dùng/xác nhận ở Phase 24) | **Level 1** | Đây là nguồn CHÍNH, không phải mirror |
| 2 | Tổng hợp `tuvi.vn`, `tuvi.lethuc.com` (tìm ở Phase 22) | Nhiều bài giải nghĩa Thiên Diêu/Thiên Y | Không xác định | Cùng kết luận: khởi Sửu thuận theo tháng; Thiên Y đồng cung Thiên Diêu | Level 3/4 | Không coi là nguồn độc lập thứ 2 chính thức (trang tổng hợp phổ thông), chỉ dùng để ĐỐI CHIẾU không mâu thuẫn với nguồn #1 |

**Không tìm thấy nguồn nào mâu thuẫn** (không có SOURCE B khác rule) — cả nguồn Level 1 (hocvienlyso.org)
và nguồn Level 3/4 (Phase 22) đều cho CÙNG 1 kết luận. Không có `SCHOOL_CONFLICT` cho riêng 2 sao này
(khác hẳn tình huống Hỏa Tinh/Linh Tinh).

---

## 2. Source hierarchy

Nguồn #1 (hocvienlyso.org, bài 13) đã được xác nhận Level 1 ở Phase 24 (dùng cho Tả Phù/Hữu Bật, khớp
chính xác). Phase 25 dùng LẠI đúng bài này (đọc thêm phần Thiên Hình/Thiên Diêu/Thiên Y ở cùng trang) —
**không phải nguồn mới, mà là đọc kỹ hơn 1 nguồn đã tin cậy sẵn có**. Việc Thiên Hình trong bài khớp
CHÍNH XÁC công thức đã implement từ Phase 4 (`thienHinhIndex`, khởi Dậu thuận) là bằng chứng chéo mạnh:
nếu 1/3 sao trong cùng danh sách của nguồn này đã được verify khớp trước đó, độ tin cậy cho 2 sao còn lại
(Thiên Diêu, Thiên Y) trong CÙNG danh sách CÙNG bài viết được nâng cao đáng kể.

---

## 3. Thiên Diêu rule

**Input**: tháng âm lịch (`lunarMonth`, 1-12) — dùng lại `lunar.month` đã có sẵn trong `tinhTuVi()`, không
tính lịch mới.

**Điểm khởi**: Sửu (chi index 1), tương ứng tháng 1 (tháng Giêng).

**Orientation**: đếm thuận (cộng).

**Công thức**: `thienDieuIndex(lunarMonth) = mod12(1 + (lunarMonth - 1))`.

**Không phụ thuộc**: giới tính, Can/Chi năm, âm dương, tiết khí — nguồn chỉ dùng tháng âm lịch, giống cấu
trúc Thiên Hình/Tả Phù/Hữu Bật đã có.

**Category theo spec**: nằm trong nhóm "CÁC PHỤ TINH THEO THÁNG" của §25 (Thiên Hình, Thiên Diêu, Thiên Y,
Tả Phù, Hữu Bật) — khớp đúng cách gộp nhóm của chính spec, không phải suy diễn thêm.

---

## 4. Thiên Y rule

**Input**: tháng âm lịch (gián tiếp qua Thiên Diêu).

**Quan hệ với Thiên Diêu**: nguồn ghi rõ ràng "Thiên Riêu ở cung nào, an Thiên Y ngay ở cung đó" — LUÔN
ĐỒNG CUNG, không đếm độc lập, không có điểm khởi/orientation riêng. Đây là quy định TRỰC TIẾP từ nguồn,
KHÔNG PHẢI giả định `Thiên Y = Thiên Diêu` tự phát của em.

**Công thức**: `thienYIndex(lunarMonth) = thienDieuIndex(lunarMonth)`.

**Không phụ thuộc**: giới tính, Can/Chi năm.

---

## 5. Source conflicts

Không có. Cả 2 nguồn (Level 1 và Level 3/4) đồng thuận hoàn toàn — không cần ghi `SCHOOL_CONFLICT` hay
`OTHER_SCHOOL` cho 2 sao này.

---

## 6. Implementation

`src/lib/tu-vi/rules.ts`:
- Thêm `thienDieuIndex(lunarMonth)` và `thienYIndex(lunarMonth)` ngay sau `thienHinhIndex` (cùng nhóm
  "phụ tinh theo tháng", đúng pattern hiện có — không tạo kiến trúc mới).
- Cập nhật comment `thienHinhIndex` ghi nhận nguồn Level 1 mới xác nhận thêm (không đổi công thức).

`src/lib/tu-vi/engine.ts`:
- Import `thienDieuIndex`, `thienYIndex`.
- Thêm 2 dòng `addPhuTinh(thienDieuIndex(lunar.month), "Thiên Diêu")` và
  `addPhuTinh(thienYIndex(lunar.month), "Thiên Y")` ngay sau Thiên Hình — dùng lại `lunar.month` đã có sẵn
  (không tính lịch âm mới, không duplicate calendar logic).

**Không đổi**: 14 chính tinh, status Nguyên Cát, Mệnh, Thân, 12 cung, Cục, Tứ Hóa core, Đại Vận, Kình
Dương, Đà La, Thiên Khôi, Thiên Việt, Văn Xương, Văn Khúc, Tả Phù, Hữu Bật, Địa Không, Địa Kiếp, Hỏa Tinh,
Linh Tinh, Golden Master.

**Renderer**: KHÔNG sửa `lap-la-so-tu-vi.astro` — cơ chế hiển thị phụ tinh đã generic (`phuTinhHtml` map
toàn bộ `p.phuTinh`), Thiên Diêu/Thiên Y tự động hiển thị đúng mà không cần thêm code UI. Đã xác minh trực
tiếp trên browser (GM-001, Canh Thân, lunarMonth=7): Thiên Diêu và Thiên Y cùng xuất hiện tại cung Mùi
(Nô Bộc), không đè chữ, không ảnh hưởng phần còn lại của lá số.

---

## 7. Test matrix

File mới: `tests/tu-vi-phase25-thien-dieu-thien-y.test.ts` (28 test). Theo đúng chỉ thị mục VIII: expected
value liệt kê THỦ CÔNG theo nguồn (khởi Sửu tại tháng 1, đếm thuận), KHÔNG gọi lại `thienDieuIndex()` để
tự sinh expected trong bảng đối chiếu.

| Nhóm | Nội dung |
|---|---|
| Thiên Diêu đủ 12 tháng | Đối chiếu từng tháng với bảng expected liệt kê thủ công từ nguồn |
| Thiên Y đủ 12 tháng + kiểm tra độc lập | Đối chiếu riêng (không suy từ "Thiên Diêu đúng nên Thiên Y đúng") |
| Golden Master coverage | Ghi nhận 0/6 GM có dữ liệu, không tự tạo expected |
| Tích hợp `tinhTuVi()` | GM-001: Thiên Diêu + Thiên Y cùng xuất hiện đúng tại Mùi trong lá số thật |
| Regression | GM-001: Mệnh/Thân/Cục/Mệnh Quái/Chủ Mệnh/Chủ Thân/14 chính tinh/Tứ Hóa/4 trụ/Thiên Khôi không đổi |

```
npx vitest run
```

```
Test Files  21 passed (21)
     Tests  657 passed | 5 expected fail (662)
```

Trước Phase 25: 629 pass + 5 expected-fail (634). Sau: 657 pass + 5 expected-fail (662) — **+28 test mới**,
đúng bằng file mới. **0 unexpected failure. Không xóa test nào. Không sửa Golden Master. Không sửa expected
để ép pass** (đây là implement mới, không phải sửa expected của test cũ).

---

## 8. Golden Master coverage

| Sao | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Thiên Diêu | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |
| Thiên Y | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |

Đã rà lại `TuVi_Golden_Master_Pack_V1.md` — không GM nào ghi vị trí phụ tinh. Không tự tạo expected value
từ GM. Không sửa Golden Master.

---

## 9. Regression

Đã kiểm tra lại toàn bộ theo đúng mục XI: Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ
Hóa, Đại Vận, 4 trụ Can Chi, Kình Dương, Đà La, Khôi Việt, Xương Khúc, Tả Hữu — **KHÔNG thay đổi**, xác
nhận qua:
- Toàn bộ 629 test cũ (trước Phase 25) chạy lại PASS nguyên vẹn.
- Test regression riêng trong file mới (mục "Phase 25 — regression").
- Xác minh trực tiếp browser: Thiên Khôi vẫn tại Ngọ (Phase 24), Kình Dương/Đà La vị trí không đổi, 14
  chính tinh/Chủ Mệnh/Chủ Thân/Tứ Hóa không đổi.

5 expected-fail giữ nguyên y hệt (không liên quan Thiên Diêu/Thiên Y).

---

## 10. Remaining uncertainty

| Vấn đề | Trạng thái |
|---|---|
| Thiên Diêu/Thiên Y chưa có Golden Master ảnh thật xác nhận | NEED_GOLDEN_MASTER_REVIEW cho việc nâng lên GOLDEN_MASTER_VERIFIED (hiện ở SOURCE_SUPPORTED) |
| hoc.kabala.vn/tuvi.vn (nguồn Level 3/4 ở Phase 22) không được coi là nguồn độc lập thứ 2 chính thức | Chỉ dùng để đối chiếu không mâu thuẫn, không tính là "2 nguồn xác nhận" theo đúng mục IV ("Không coi hai URL đăng cùng một nội dung là hai nguồn độc lập") |

---

## FINAL CHECK

```
[x] Chỉ nghiên cứu + implement Thiên Diêu / Thiên Y
[x] Không đụng Hỏa Tinh
[x] Không đụng Linh Tinh
[x] Không đụng Địa Không
[x] Không đụng Địa Kiếp
[x] Không đụng Khôi Việt
[x] Không đụng Xương Khúc
[x] Không đụng Tả Hữu
[x] Không trộn trường phái
[x] Không tự suy diễn (Thiên Y đồng cung Thiên Diêu là quy định TRỰC TIẾP từ nguồn)
[x] Không sửa Golden Master
[x] Không thay đổi 14 chính tinh
[x] Không thay đổi status Nguyên Cát
[x] Không có unexpected failure
[x] Không có structural regression
```

**KHÔNG COMMIT/PUSH.**
