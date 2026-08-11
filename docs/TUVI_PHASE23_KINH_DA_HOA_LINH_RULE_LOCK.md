# TUVI PHASE 23 — KÌNH ĐÀ / HỎA LINH RULE LOCK

Khóa rule Kình Dương/Đà La (implement), giữ nguyên Hỏa Tinh/Linh Tinh (CONFLICTED, chưa đủ căn cứ Nam
Phái). Không sửa Golden Master, 14 chính tinh, bảng Nguyên Cát, Thiên Việt. Không implement Thiên Diêu/
Thiên Y. **Không commit/push.**

---

## 1. Source hierarchy

| Sao | Nguồn | Level | Đánh giá độ mạnh |
|---|---|---|---|
| Kình Dương / Đà La | hoc.kabala.vn, "Sai lầm về an sao lập số" | **1 (khả năng cao)** — tiêu đề trùng khớp nguồn đã dùng chính thức cho Thiên Việt từ Phase 8 (`TuVi_Profile_NguyenCat_V1.md` §7) | Có công thức rõ + ví dụ số liệu cụ thể (tuổi Giáp Ngọ, cả 2 giới tính) |
| Hỏa Tinh / Linh Tinh | hoctuvi.blogspot.com, lyso.vn | 3/4 — KHÔNG xác nhận cùng họ Học Viện Lý Số | Điểm khởi khớp code hiện tại, nhưng chính nguồn tự thừa nhận bất đồng giữa các phái (nhóm Tỵ Dậu Sửu) |
| Địa Không / Địa Kiếp | hocvienlyso.org (Level 1, đã xác nhận Phase 22) | 1 | Khớp 100% code hiện tại — không đổi gì (đúng chỉ thị mục VI) |

---

## 2. Kình Dương rule (ĐÃ KHÓA)

**Nguyên văn nguồn:**

> "Kình dương – Đà la là hai sát tinh an ở trước và sau Lộc Tồn, cũng phải theo chiều thuận hay nghịch của
> Dương Nam Âm Nữ (thuận) và Âm Nam Dương Nữ (nghịch) mà thay đổi vị trí."

**Rule đã khóa**: `Kình Dương = Lộc Tồn + offset`, với `offset = isThuanChung ? +1 : -1`.
`isThuanChung` = biến ĐÃ CÓ SẴN trong `engine.ts` (Dương Nam/Âm Nữ → true, Âm Nam/Dương Nữ → false) —
**tái sử dụng nguyên vẹn**, không tạo logic thuận/nghịch thứ hai.

## 3. Đà La rule (ĐÃ KHÓA)

`Đà La = Lộc Tồn - offset` (offset giống hệt Kình Dương, dấu ngược lại). Kình Dương và Đà La luôn nằm ở 2
cung liền kề, đối xứng qua Lộc Tồn, không bao giờ trùng cung.

## 4. Hỏa Tinh rule (GIỮ NGUYÊN — CONFLICTED, chưa implement)

Không đổi công thức (`HOA_TINH_START[group] + gioChiIndex`, luôn cộng bất kể giới tính). Điểm khởi
(`START_POSITION`) đã khớp nguồn Phase 22 nên GIỮ NGUYÊN theo đúng chỉ thị mục III item 2. Orientation
KHÔNG áp dụng thay đổi dù nguồn có gợi ý đảo theo giới tính — lý do ở mục 7.

## 5. Linh Tinh rule (GIỮ NGUYÊN — CONFLICTED, chưa implement)

Cùng tình trạng và lý do như Hỏa Tinh.

---

## 6. Orientation matrix

| Tổ hợp | isThuanChung | Kình Dương | Đà La | Nguồn xác nhận |
|---|---|---|---|---|
| Dương Nam | true (thuận) | Lộc Tồn + 1 | Lộc Tồn − 1 | ✅ Ví dụ nguyên văn (Giáp Ngọ) |
| Âm Nữ | true (thuận) | Lộc Tồn + 1 | Lộc Tồn − 1 | Suy từ quy tắc đã nêu (cùng nhóm "Dương Nam Âm Nữ") |
| Âm Nam | false (nghịch) | Lộc Tồn − 1 | Lộc Tồn + 1 | Suy từ quy tắc đã nêu (cùng nhóm "Âm Nam Dương Nữ") |
| Dương Nữ | false (nghịch) | Lộc Tồn − 1 | Lộc Tồn + 1 | ✅ Ví dụ nguyên văn (Giáp Ngọ, đảo ngược) |

2/4 tổ hợp có ví dụ số liệu trực tiếp từ nguồn (Dương Nam, Dương Nữ — cùng 1 tuổi Giáp Ngọ, kết quả đảo
ngược nhau đúng như phát biểu quy tắc). 2/4 tổ hợp còn lại (Âm Nam, Âm Nữ) suy trực tiếp từ CHÍNH câu chữ
quy tắc đã trích ("Âm Nam Dương Nữ nghịch" gộp chung 1 nhóm, "Dương Nam Âm Nữ thuận" gộp chung 1 nhóm) —
không phải suy diễn ngoài nguồn, chỉ là áp dụng đúng câu chữ đã có cho 2 trường hợp còn lại của cùng 1
mệnh đề.

---

## 7. School variants

**Kình Dương/Đà La**: không phát hiện nguồn nào khác mâu thuẫn với nguồn đã chọn — không có
`SCHOOL_CONFLICT` cho riêng 2 sao này.

**Hỏa Tinh/Linh Tinh**: `SCHOOL_CONFLICT` — chính nguồn tìm được (`hoctuvi.blogspot.com`) tự thừa nhận tồn
tại ≥2 trường phái khác nhau cho cách an nhóm **Tỵ Dậu Sửu** cụ thể (nhắc tên "Quản Xuân Thịnh" như 1
trường phái), và tác giả bài viết tự nói không chắc chắn cách nào đúng. KHÔNG xác định được source nào
thuộc đúng Nam Phái đã chọn cho project (khác Kình/Đà, nguồn Hỏa/Linh không trùng/liên hệ được với bài
"Sai lầm về an sao lập số" đã dùng cho Thiên Việt) → **không lấy trung bình, không chọn theo tỷ lệ, không
trộn 2 bảng** — giữ nguyên code hiện tại, không sửa.

---

## 8. Implementation changes

`src/lib/tu-vi/engine.ts`:

1. Di chuyển khai báo `isThuanChung` lên đầu hàm `tinhTuVi()` (ngay sau `isDuongCan`), để dùng chung cho
   cả Kình Dương/Đà La (mới) VÀ Tràng Sinh/Đại Vận (đã có từ trước) — xóa khai báo trùng ở STEP 18, không
   tạo biến thứ hai.
2. Thay `addPhuTinh(locTonIdx+1, "Kình Dương")` / `addPhuTinh(locTonIdx-1, "Đà La")` (cố định) bằng
   `kinhDuongOffset = isThuanChung ? 1 : -1`, rồi `locTonIdx + kinhDuongOffset` / `locTonIdx - kinhDuongOffset`.
3. Cập nhật comment tại vị trí Hỏa Tinh trong `engine.ts` và tại `rules.ts` (mục Hỏa Tinh/Linh Tinh) ghi
   rõ quyết định CONFLICTED/chưa implement của Phase 23 — không đổi số liệu/công thức.

**Không đổi**: `LOC_TON_TABLE`, `HOA_TINH_START`, `LINH_TINH_START`, `diaKiepIndex`/`diaKhongIndex`, mọi
bảng/hàm khác trong `rules.ts`; không đụng `MAIN_STAR_STATUS`, `TU_VI_RING`, `THIEN_PHU_RING`, Golden
Master, `lap-la-so-tu-vi.astro`.

---

## 9. Tests

File mới: `tests/tu-vi-phase23-kinh-da.test.ts` (18 test).

| Nhóm | Nội dung |
|---|---|
| Đối chiếu trực tiếp ví dụ nguồn | Giáp Ngọ Dương Nam (Lộc=Dần, Kình=Mão, Đà=Sửu) và Giáp Ngọ Dương Nữ (Kình=Sửu, Đà=Mão, đảo ngược) — khớp NGUYÊN VĂN nguồn, không bịa |
| Nhất quán nội bộ 4 tổ hợp × nhiều Can | Dương Nam/Âm Nam/Dương Nữ/Âm Nữ, dùng Giáp/Ất/Bính/Đinh (4 Can khác nhau, không chỉ 1 vị trí Lộc Tồn) — xác nhận offset đúng dấu theo `isThuanChung`, Kình/Đà không bao giờ trùng cung |
| Regression Đại Vận | Xác nhận việc di chuyển khai báo `isThuanChung` không ảnh hưởng Đại Vận |
| Hỏa Tinh không đổi | Cùng ngày giờ, khác giới tính → Hỏa Tinh vẫn cùng vị trí (xác nhận CHƯA áp dụng đảo chiều) |
| Địa Không/Địa Kiếp không đổi | Khớp đúng công thức cũ (khởi Hợi, Kiếp thuận, Không nghịch) |
| Regression GM-001→GM-006 | Cấu trúc chart (12 cung, 14 chính tinh, Tứ Hóa, 4 trụ) nguyên vẹn |

Đã xác minh trực tiếp trên browser (candidate Giáp Ngọ 15/06/2014, giờ Ngọ):
- **Dương Nam**: `Phúc Đức Bính Dần ... Lộc Tồn`, `Điền Trạch Đinh Mão ... Kình Dương`, `Phụ Mẫu Đinh Sửu ... Đà La` → Lộc Tồn=Dần, Kình Dương=Mão, Đà La=Sửu — khớp đúng ví dụ nguồn.
- **Dương Nữ** (đổi giới tính, giữ nguyên ngày giờ): `Phụ Mẫu Đinh Sửu ... Kình Dương`, `Điền Trạch Đinh Mão ... Đà La` → Kình Dương=Sửu, Đà La=Mão — **đảo ngược đúng như nguồn mô tả**.

```
npx vitest run
```

```
Test Files  19 passed (19)
     Tests  576 passed | 5 expected fail (581)
```

Trước Phase 23: 558 pass + 5 expected-fail (563). Sau: 576 pass + 5 expected-fail (581) — **+18 test mới**,
đúng bằng file mới. **0 unexpected failure. Không regression** — 5 expected-fail giữ nguyên y hệt (không
liên quan Kình Dương/Đà La/Hỏa Linh).

---

## 10. Golden Master impact

**Không có Golden Master nào (GM-001→006) ghi vị trí Kình Dương/Đà La** — thay đổi này không ảnh hưởng bất
kỳ assertion GM nào đã có. Đã chạy lại toàn bộ 6 test suite GM (`tu-vi-golden.test.ts`,
`tu-vi-golden-gm002-006.test.ts`) — pass nguyên vẹn, không có assertion nào liên quan Kình Dương/Đà La bị
ảnh hưởng.

---

## 11. Remaining uncertainties

| Vấn đề | Trạng thái |
|---|---|
| Kình Dương/Đà La — nguồn chưa đối chiếu chữ-với-chữ 100% với bản gốc đã dùng cho Thiên Việt | Nghi cùng nguồn (trùng tiêu đề), chưa xác nhận tuyệt đối — nếu sau này có Golden Master ảnh thật xác nhận, nên đối chiếu lại |
| Hỏa Tinh/Linh Tinh orientation | CONFLICTED, chưa giải quyết — cần nguồn Level 1/2 rõ ràng thuộc đúng Nam Phái hoặc Golden Master |
| Hỏa Tinh/Linh Tinh nhóm Tỵ Dậu Sửu | SCHOOL_CONFLICT nội bộ giữa các phái, chưa xác định phái nào là Nam Phái đã chọn |
| Kình Dương/Đà La — 2/4 tổ hợp (Âm Nam, Âm Nữ) chỉ có suy luận từ câu chữ quy tắc, chưa có ví dụ số liệu trực tiếp | Rủi ro thấp (áp dụng đúng mệnh đề đã nêu, không phải suy diễn ngoài nguồn) nhưng chưa phải bằng chứng số liệu độc lập |

---

## FINAL STATUS

```
Kình Dương    — LOCKED (nguồn Level 1 khả năng cao + ví dụ số liệu trực tiếp cho 2/4 tổ hợp, 2/4 còn lại suy trực tiếp từ cùng câu chữ, không có source nào khác mâu thuẫn)
Đà La          — LOCKED (cùng lý do)
Hỏa Tinh       — CONFLICTED (SCHOOL_CONFLICT chưa giải quyết, không đủ căn cứ Nam Phái)
Linh Tinh      — CONFLICTED (cùng lý do)
Địa Không      — NEED_GOLDEN_MASTER_REVIEW (không đổi — đã SOURCE_SUPPORTED từ Phase 22, nhưng 0/6 GM nên vẫn chưa lên VERIFIED, giữ nguyên theo đúng chỉ thị "KHÔNG THAY ĐỔI")
Địa Kiếp       — NEED_GOLDEN_MASTER_REVIEW (cùng lý do, không đổi)
```

**KHÔNG COMMIT/PUSH.**
