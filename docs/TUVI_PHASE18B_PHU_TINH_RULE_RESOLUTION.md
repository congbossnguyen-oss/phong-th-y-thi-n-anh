# TUVI PHASE 18B — PHỤ TINH RULE RESOLUTION

Xử lý các vấn đề đã được Phase 18A xác nhận. Không mở rộng scope, không sửa Golden Master, không sửa
bảng Nguyên Cát 14×12, không thêm sao ngoài phạm vi. **Không commit/push.**

---

## 1. Kình Dương

**Đọc lại chính xác spec §18** (`TuVi_Engine_V2.md`):

> Kình Dương = cung kế trước Lộc Tồn theo chiều profile
> Đà La = cung kế sau Lộc Tồn theo chiều profile
> **Không dùng dấu `+1/-1` cho tới khi đã khóa orientation.**

**Xác định orientation spec yêu cầu**: spec dùng cụm "theo chiều profile" nhưng **không định nghĩa cụ thể
chiều đó là gì ở §18** — khác với Đại Vận (§28.1), nơi "chiều" được định nghĩa rõ ràng và phụ thuộc
**giới tính + Âm Dương Can năm sinh** (khác nhau cho từng lá số, không phải 1 hằng số cố định toàn cục).
Không có căn cứ nào trong spec để khẳng định "chiều profile" ở §18 dùng chung công thức với §28.1 — đây sẽ
là suy diễn, bị cấm.

**Rà toàn bộ tài liệu/source trong project**: đã tìm trong toàn bộ `docs/*.md`, `TuVi_Engine_V2.md`,
`TuVi_Golden_Master_Pack_V1.md`, `TuVi_Profile_NguyenCat_V1.md`. Kết quả:
- `docs/TUVI_ENGINE_AUDIT.md` (audit trước đó, độc lập) đã từng phát hiện đúng vấn đề này, tự xếp
  **UNVERIFIED** ("chọn dấu tùy tiện đúng như spec cảnh báo") — không có bước khóa orientation nào được
  thực hiện sau đó.
- `docs/TUVI_RULE_FORENSICS.md` xác nhận Kình Dương/Đà La không xuất hiện trong Golden Master Pack.
- Không tìm thấy bất kỳ tài liệu nào khác khóa orientation này.

**Golden Master**: 0/6 GM có dữ liệu Kình Dương/Đà La (xác nhận lại từ Phase 18A).

**Kết luận**: **KHÔNG ĐỦ BẰNG CHỨNG để khóa orientation.** Theo đúng chỉ thị mục I bước 6: không sửa công
thức, đánh dấu NEED_GOLDEN_MASTER_REVIEW. Đã thêm comment rõ ràng ngay tại `engine.ts` (dòng đặt Kình
Dương/Đà La) ghi nhận status này — **không đổi giá trị `locTonIdx+1`/`locTonIdx-1`**, không đảo hướng,
không suy đoán hướng khác. Không tạo test regression cho orientation (bước 8 chỉ áp dụng SAU KHI rule được
khóa — điều kiện này chưa xảy ra).

**Không dùng kết quả hiện tại của code làm bằng chứng đúng** — điều này được nêu rõ ràng trong comment mới
thêm.

---

## 2. Đà La

Xử lý chung với Kình Dương ở mục 1 (cùng nguồn, cùng vấn đề, cùng kết luận). Status: **NEED_GOLDEN_MASTER_REVIEW**.

---

## 3. Hỏa Tinh

Constant hiện tại: `HOA_TINH_START = [2, 1, 3, 9]` (Dần, Sửu, Mão, Dậu — theo 4 nhóm tam hợp Thân/Tý/Thìn,
Dần/Ngọ/Tuất, Tỵ/Dậu/Sửu, Hợi/Mão/Mùi), cộng thêm `gioChiIndex`.

**Nguồn**: spec §23 chỉ liệt kê TÊN 4 nhóm tam hợp và yêu cầu "phải có rule theo năm sinh và giờ sinh",
**KHÔNG cho bảng điểm khởi cụ thể**. Đã rà lại toàn văn §23 — xác nhận không có số liệu. Không tìm thấy
nguồn nào khác trong project (`docs/TUVI_ENGINE_AUDIT.md` mục cũ đã tự nhận: "spec KHÔNG cho bảng cụ thể
... rủi ro cao nhất trong toàn bộ engine").

**Phân loại**: NEED_GOLDEN_MASTER_REVIEW (0/6 GM có dữ liệu, không nguồn project/spec nào cho số liệu).

**Hành động**: KHÔNG sửa, KHÔNG thay bằng bảng phổ biến khác. Đã thêm comment rõ ràng trong `rules.ts`
ngay trên `HOA_TINH_START`/`LINH_TINH_START` ghi nhận status này.

---

## 4. Linh Tinh

Constant hiện tại: `LINH_TINH_START = [10, 3, 10, 10]` (Tuất, Mão, Tuất, Tuất). Cùng nguồn, cùng vấn đề,
cùng kết luận với Hỏa Tinh ở mục 3. Status: **NEED_GOLDEN_MASTER_REVIEW**.

---

## 5. Địa Không

Công thức hiện tại: `diaKhongIndex = mod12(11 - hourChiIndex)` (khởi Hợi=11, hướng nghịch theo giờ sinh).

**Nguồn**: spec §22 chỉ yêu cầu "an theo giờ sinh bằng hai điểm khởi và hướng đối nghịch... implement
`getDiaKhong(hourBranch)`, `getDiaKiep(hourBranch)`", **KHÔNG cho điểm khởi cụ thể** (không phải Hợi hay
bất kỳ Chi nào). Đã rà lại toàn văn §22 — xác nhận không có số liệu, và spec còn nói rõ "Không được dùng
tên 'Không' để suy ra từ Tuần" (loại trừ 1 hướng suy diễn sai có thể xảy ra). Điểm khởi Hợi trong code đến
từ kiến thức phổ biến ngoài spec.

**Phân loại**: NEED_GOLDEN_MASTER_REVIEW (0/6 GM, không nguồn project/spec cho điểm khởi cụ thể).

**Hành động**: KHÔNG sửa. Đã thêm comment rõ ràng trong `rules.ts`.

---

## 6. Địa Kiếp

Công thức hiện tại: `diaKiepIndex = mod12(11 + hourChiIndex)` (khởi Hợi=11, hướng thuận theo giờ sinh).
Cùng nguồn, cùng vấn đề, cùng kết luận với Địa Không ở mục 5. Status: **NEED_GOLDEN_MASTER_REVIEW**.

---

## 7. Thiên Diêu

**Đọc chính xác spec §25** ("CÁC PHỤ TINH THEO THÁNG"):

> Phải tách rule: Thiên Hình, **Thiên Diêu**, **Thiên Y**, Tả Phù, Hữu Bật
>
> Ví dụ: [chỉ cho công thức cụ thể của Thiên Hình, Tả Phù, Hữu Bật]
>
> Các sao còn lại phải được khai báo bằng bảng.

**Trích xuất input**: theo tên nhóm mục §25 ("CÁC PHỤ TINH THEO THÁNG"), input suy ra là **tháng âm lịch**
— nhưng đây là suy luận về LOẠI input từ vị trí đặt trong spec, KHÔNG phải xác nhận công thức cụ thể.

**Trích xuất công thức/rule**: **KHÔNG CÓ**. Spec chỉ liệt kê tên Thiên Diêu là 1 trong 5 sao "phải tách
rule", xếp vào phần "ví dụ" chỉ có 3/5 sao được cho công thức (Thiên Hình, Tả Phù, Hữu Bật) — Thiên Diêu
không nằm trong 3 ví dụ đó. Câu "Các sao còn lại phải được khai báo bằng bảng" xác nhận spec THỪA NHẬN
thiếu bảng, không phải ngầm định 1 công thức nào.

**Vị trí output**: không xác định được — không có bảng.

**Golden Master**: 0/6 (xác nhận Phase 18A — không GM nào nhắc tới Thiên Diêu).

**Kết luận**: **NEED_SOURCE**. Spec xác nhận sao này PHẢI tồn tại nhưng không cho đủ dữ liệu để implement.
Không phải "chỉ thiếu Golden Master để verify 1 rule đã có" (đó là NEED_GOLDEN_MASTER_REVIEW) mà là "rule
bản thân chưa từng được cung cấp" — đúng NEED_SOURCE hơn. **Không implement trong Phase 18B.**

---

## 8. Thiên Y

Cùng mục §25, cùng tình trạng với Thiên Diêu ở mục 7 (cũng chỉ được NÊU TÊN, không có công thức, không có
bảng, không có Golden Master). Status: **NEED_SOURCE**. Không implement.

---

## 9. Triệt

**Không đổi công thức.** Đã viết `tests/tu-vi-phase18b-triet.test.ts` (15 test mới), kiểm chứng behavior
HIỆN TẠI (không khẳng định đúng/sai vì không có Golden Master độc lập):

- 10 test: mỗi Can năm sinh (Giáp→Quý) → đúng 2 cung có `triet=true`, khớp `TRIET_TABLE[can]`.
- 1 test: đúng 2/12 cung bị Triệt (không nhiều/ít hơn).
- 1 test: 5 nhóm Can chia sẻ đúng cặp Triệt (khớp cấu trúc §32 — spec chỉ cho 5 nhóm Can, không cho cặp
  Chi cụ thể, nên chỉ test được tính NHẤT QUÁN NỘI BỘ, không test được tính ĐÚNG so với nguồn ngoài).
- 1 test: Triệt không phụ thuộc giới tính.
- 1 test: Triệt không phụ thuộc giờ sinh.
- 1 test: GM-006 (Ất Tỵ) — pack chỉ ghi "Triệt: theo bảng Can Ất", không cho cặp Chi cụ thể, nên KHÔNG thể
  dùng làm Golden Master độc lập; test chỉ xác nhận engine chạy nhất quán với `TRIET_TABLE["Ất"]`.

**Kết quả**: toàn bộ 15/15 test PASS. **Không phát hiện BUG_NEEDS_REVIEW nào** — engine tính Triệt nhất
quán với chính bảng đã khai báo, đúng cấu trúc 5 nhóm Can của spec §32. Vẫn giữ nguyên đánh giá
NEED_GOLDEN_MASTER_REVIEW cho GIÁ TRỊ cặp Chi cụ thể (vì cặp Chi này đến từ ngoài spec, chưa có GM xác
nhận) — chỉ khác là giờ đã có test coverage để phát hiện regression trong tương lai.

---

## 10. Tứ Hóa trên phụ tinh

**Logic tính Tứ Hóa: KHÔNG đổi** (đã audit đúng ở Phase 18A, `engine.ts` STEP 9 không đụng tới).

**Chỉ audit + sửa renderer**:

1. **Dữ liệu `tuHoa` đã truyền tới renderer chưa?** — CÓ. `chart.cungs[].phuTinh[].tuHoa` đã được gắn
   đúng từ engine (đã có test `tu-vi-tu-hoa-full.test.ts` xác nhận từ trước), và biến `p.phuTinh` (chính
   là `cung.phuTinh`) đã được truyền vào hàm `cellHtml()` trong `lap-la-so-tu-vi.astro`.
2. **Tại sao renderer không hiển thị?** — `phuTinhHtml` (dòng ~178 cũ) chỉ map `s.name`, KHÔNG đọc
   `s.tuHoa` — thuần túy bỏ sót khi viết template string, khác hẳn `chinhTinhHtml` (đã có `tuHoaTag` từ
   trước). Xác nhận đây CHỈ LÀ rendering omission, không phải lỗi data hay logic.
3. **Sửa UI mà không ảnh hưởng logic?** — CÓ THỂ, đã sửa: thêm đúng đoạn `tuHoaTag` (giống hệt cách
   `chinhTinhHtml` đã làm) vào `phuTinhHtml` trong `src/pages/lap-la-so-tu-vi.astro`. Không đụng
   `engine.ts`, không đụng `rules.ts`, không đổi vị trí bất kỳ sao nào.

**Xác minh trực tiếp trên browser** (candidate Nhâm Thân 1992, giờ Ngọ, Nam — Can Nhâm có Tả Phù=Hóa
Khoa):

```
Chính tinh (không đổi):  Thiên Lương<sup>L</sup> (V)   — Nhâm: Lộc → Thiên Lương, đúng như trước khi sửa.
Phụ tinh (MỚI hiển thị): Tả Phù<sup>K</sup>             — Nhâm: Khoa → Tả Phù, TRƯỚC khi sửa chỉ hiện "Tả Phù" không có "K".
```

Không có sao nào đổi vị trí (đã kiểm bằng cách đọc HTML export, cung chứa Tả Phù/Thiên Lương không đổi so
với trước sửa).

**Test**: instructions yêu cầu test cho Văn Xương/Văn Khúc/Tả Phù/Hữu Bật với Can có Tứ Hóa tương ứng.
Renderer là script client-side nội bộ trong file `.astro` (không export hàm ra ngoài để unit-test trực
tiếp bằng vitest), nên phần DATA (đúng 4 sao này nhận đúng nhãn Tứ Hóa cho đúng Can) đã có sẵn ĐẦY ĐỦ ở
`tests/tu-vi-tu-hoa-full.test.ts` (10/10 Can, bao gồm cả 5 Can "nguy hiểm" Bính/Mậu/Kỷ/Tân/Nhâm — nơi
Tứ Hóa trỏ vào phụ tinh) — test này chạy lại PASS nguyên vẹn sau khi sửa renderer (renderer không ảnh
hưởng tới `engine.ts`). Phần HIỂN THỊ đã xác minh trực tiếp bằng browser ở trên (Tả Phù + Nhâm/Khoa) thay
vì viết thêm 1 lớp test giả lập DOM/HTML string cho 1 file `.astro` script — phù hợp cách kiểm chứng UI đã
dùng xuyên suốt engagement này.

**Kết luận**: Tứ Hóa trên chính tinh KHÔNG bị ảnh hưởng (xác nhận qua browser + test suite pass nguyên
vẹn). Tứ Hóa trên phụ tinh giờ hiển thị đúng. Không thay đổi vị trí sao nào.

---

## 11. Thiên Việt

**Giữ nguyên NEED_GOLDEN_MASTER_REVIEW.** Xác nhận: đây là **nhãn đánh giá bằng chứng** (evidence
classification, dùng trong docs/report), **KHÔNG phải giá trị runtime** — `getThienViet(yearCanName)` luôn
trả về 1 chỉ số Chi cụ thể (2, 5, 7, 8, hoặc 9 tùy Can), **không dùng sentinel string** kiểu
`"NEED_GOLDEN_MASTER_REVIEW"` như `getChuMenh()`/`getChuThan()`. Không có gì thay đổi trong `rules.ts` ở
mục Thiên Việt. Không quay lại công thức `Thiên Việt = Thiên Khôi + 6`. Không suy luận đối xứng.

---

## 12. Out-of-scope stars

```
Đào Hoa
Hồng Loan
Thiên Hỷ
```

Giữ nguyên OUT_OF_SCOPE theo đúng kết luận Phase 18A. Không implement, không thêm vào spec, không thêm vào
engine, không đụng tới trong Phase 18B.

---

## 13. FILES CHANGED

| File | Thay đổi | Loại |
|---|---|---|
| `src/lib/tu-vi/engine.ts` | Thêm comment NEED_GOLDEN_MASTER_REVIEW cho Kình Dương/Đà La (dòng đặt sao) | Comment-only, 0 thay đổi logic |
| `src/lib/tu-vi/rules.ts` | Thêm comment NEED_GOLDEN_MASTER_REVIEW cho Địa Không/Địa Kiếp (§22) và Hỏa Tinh/Linh Tinh (§23) | Comment-only, 0 thay đổi công thức |
| `src/pages/lap-la-so-tu-vi.astro` | Sửa `phuTinhHtml`: thêm hiển thị nhãn Tứ Hóa (`tuHoaTag`) cho phụ tinh, giống cách `chinhTinhHtml` đã làm | Renderer fix — đã xác minh bằng browser |
| `tests/tu-vi-phase18b-triet.test.ts` | **MỚI** — 15 test kiểm chứng behavior Triệt hiện tại | Test mới, không sửa test cũ |

**Không đụng tới**: 14 chính tinh, bảng Nguyên Cát 14×12, Mệnh, Thân, Cục, 12 cung, Đại Vận, Tứ Hóa core
logic, Golden Master, 5 position bug đã biết (GM-003/005/006), Đào Hoa/Hồng Loan/Thiên Hỷ, công thức Kình
Dương/Đà La/Hỏa Tinh/Linh Tinh/Địa Không/Địa Kiếp (chỉ thêm comment, không đổi số/công thức).

---

## 14. TESTS

```
npx vitest run
```

```
Test Files  16 passed (16)
     Tests  457 passed | 5 expected fail (462)
```

- Trước Phase 18B: 442 pass + 5 expected-fail (447 total).
- Sau Phase 18B: 457 pass + 5 expected-fail (462 total) — **+15 test mới** (toàn bộ từ
  `tu-vi-phase18b-triet.test.ts`), không thêm/bớt gì ở các file khác.
- Unexpected failure: **0**.
- Regression: **KHÔNG có** — 5 expected-fail giữ nguyên y hệt (GM-003 vị trí Thiên Lương, GM-005 vị trí
  Tham Lang, GM-005 vị trí Thất Sát, GM-006 vị trí Vũ Khúc+Phá Quân, GM-006 Tuần Không).

Không xóa test cũ. Không sửa expected value nào để ép pass. Không sửa Golden Master.

---

## 15. REMAINING RISKS

| Vấn đề | Trạng thái sau Phase 18B | Vì sao còn treo |
|---|---|---|
| Kình Dương / Đà La orientation | NEED_GOLDEN_MASTER_REVIEW (đã đánh dấu rõ, chưa sửa) | Không có nguồn/GM khóa "chiều profile" |
| Hỏa Tinh / Linh Tinh điểm khởi | NEED_GOLDEN_MASTER_REVIEW (đã đánh dấu rõ, chưa sửa) | Spec không cho số liệu, đây là phụ tinh rủi ro cao nhất hệ thống |
| Địa Không / Địa Kiếp điểm khởi | NEED_GOLDEN_MASTER_REVIEW (đã đánh dấu rõ, chưa sửa) | Spec không cho số liệu cụ thể |
| Thiên Diêu / Thiên Y | NEED_SOURCE, chưa implement | Spec chỉ nêu tên, không cho công thức/bảng |
| Triệt | Có test coverage nhưng vẫn NEED_GOLDEN_MASTER_REVIEW cho GIÁ TRỊ | Cặp Chi cụ thể vẫn ngoài spec, GM-006 không đủ chi tiết để xác nhận |
| Đào Hoa / Hồng Loan / Thiên Hỷ | OUT_OF_SCOPE | Không có trong spec — cần chỉ thị người dùng nếu muốn giữ/loại |

**Đã khóa xong trong Phase 18B**: hiển thị Tứ Hóa trên phụ tinh (renderer fix, xác minh browser); test
coverage cho Triệt (15 test mới, không phát hiện bug); documentation rõ ràng (comment code) cho toàn bộ
nhóm phụ tinh chưa có bằng chứng — không còn phụ tinh nào "im lặng" thiếu ghi chú nguồn.

**Còn treo, cần chỉ thị tiếp theo**: mọi quyết định về giá trị cụ thể cho Kình Dương/Đà La, Hỏa/Linh Tinh,
Địa Không/Kiếp, Thiên Diêu/Thiên Y đều cần NGUỒN MỚI (Golden Master ảnh thật hoặc tài liệu Học Viện Lý Số
cụ thể) — không thể tự giải quyết bằng suy luận nội bộ.

---

## KẾT LUẬN

Không có unexpected failure. Không có structural regression. Không sửa Golden Master. Không sửa bảng
Nguyên Cát. Không thêm sao ngoài scope. **KHÔNG COMMIT/PUSH.**
