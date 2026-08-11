# TUVI PHASE 26 — VÒNG SAO & THIÊN MÃ AUDIT

Audit toàn bộ vòng sao (Tràng Sinh, Thái Tuế) + Thiên Mã. Implement CHỈ khi phát hiện source rõ và code
khác source — thực tế phát hiện code đã khớp nguồn ở cả 3 mục, nên **không sửa công thức nào**, chỉ nâng
nhãn nguồn (comment) + bổ sung test còn thiếu. Không đụng Hỏa Tinh/Linh Tinh/Địa Không/Địa Kiếp/Thiên
Việt/Thiên Khôi/Văn Xương/Văn Khúc/Tả Phù/Hữu Bật/Thiên Diêu/Thiên Y/14 chính tinh/status Nguyên Cát/Golden
Master. **Không commit/push.**

---

## 1. Full inventory

Đọc toàn bộ `src/lib/tu-vi/engine.ts` (grep `for (let step`) — chỉ có đúng **3 vòng 12 bước** trong toàn bộ
engine:

| # | Vòng | Loại | Đã audit ở phase nào |
|---|---|---|---|
| 1 | Vòng Tràng Sinh | Vòng sao (12 trạng thái) | **Phase 26 (phase này)** |
| 2 | Vòng Thái Tuế | Vòng sao (12 sao) | **Phase 26 (phase này)** |
| 3 | Đại Vận | Chu kỳ tuổi (không phải "vòng sao" — không có tên sao, chỉ gán khoảng tuổi cho từng cung) | Đã LOCKED từ Phase 3/17 (chiều dùng chung `isThuanChung`) — không đụng lại |

Ngoài ra: **Thiên Mã** (không phải vòng, là 1 phụ tinh đơn lẻ theo nhóm tam hợp) — audit riêng theo yêu
cầu mục VI.

**Không tìm thấy vòng nào khác** trong code (không có Vòng Bác Sĩ, không có Vòng Lộc Tồn biến thể nào khác
ngoài chính Lộc Tồn đơn lẻ đã khóa từ Phase 22/23). Đã rà lại toàn bộ `rules.ts`/`engine.ts` — không có
sao/vòng nào bị bỏ sót ngoài phạm vi đã liệt kê ở Phase 18A/19.

**Phát hiện phụ (ngoài phạm vi implement, chỉ ghi nhận cho đầy đủ)**: nghiên cứu hocvienlyso.org (bài 15)
tìm thấy thêm thông tin về **Vòng Bác Sĩ**: "Bác Sĩ (cùng cung với Lộc Tồn)" — xác nhận ĐIỂM KHỞI nhưng
KHÔNG có danh sách 12 tên sao hay chiều đi trong bài — vẫn **NOT_IMPLEMENTED** như kết luận Phase 19, chỉ
nay biết thêm 1 chi tiết (điểm khởi) nhưng chưa đủ để implement. Không tự thêm vòng này vào engine (đúng
tinh thần "không tự thêm sao từ kiến thức ngoài" — vẫn thiếu dữ liệu cốt lõi).

---

## 2. Vòng Tràng Sinh

**Nguồn**: `hocvienlyso.org/tu-hoc-tu-vi-bai-15-cac-bo-sao-khac.html` ("Tự học tử vi bài 15: an các bộ sao
khác", Level 1, chính domain).

**Nguyên văn**:
> "Khởi điểm theo Cục Số: Kim Tứ Cục khởi tại Tỵ, Mộc Tam Cục khởi tại Hợi, Hỏa Lục Cục khởi tại Dần, Thủy
> Nhị Cục & Thổ Ngũ Cục khởi tại Thân."
> "Chiều di chuyển: DƯƠNG NAM – ÂM NỮ theo chiều THUẬN mà ÂM NAM – DƯƠNG NỮ theo chiều NGHỊCH."
> Thứ tự: Trường Sinh → Mộc Dục → Quan Đới → Lâm Quan → Đế Vượng → Suy → Bệnh → Tử → Mộ → Tuyệt → Thai → Dưỡng.

**Đối chiếu với `TRANG_SINH_START`**: khớp **CHÍNH XÁC 5/5** (Thủy:Thân=8, Mộc:Hợi=11, Kim:Tỵ=5,
Thổ:Thân=8, Hỏa:Dần=2). **Đối chiếu chiều**: "Dương Nam Âm Nữ thuận, Âm Nam Dương Nữ nghịch" khớp
**CHÍNH XÁC** với `isThuanChung` đã dùng (Phase 23 đã tái sử dụng biến này cho Kình Dương/Đà La, nay xác
nhận thêm nó cũng đúng cho Tràng Sinh). **Đối chiếu thứ tự 12 giai đoạn**: khớp 12/12.

**Kết luận: LOCKED.** Không sửa công thức. Chỉ cập nhật comment trong `rules.ts` ghi rõ nguồn.

**Implementation hiện tại**: `TRANG_SINH_START` (bảng) + `engine.ts` STEP 18 (`trangSinhStart +
(isThuanChung ? step : -step)`) — không đổi.

**Golden Master coverage**: 0/6 (không GM nào ghi rõ tên 12 giai đoạn Tràng Sinh theo cung) — nhưng ĐÃ
LOCKED nhờ nguồn Level 1 trực tiếp, không cần chờ GM.

---

## 3. Vòng Thái Tuế

**Nguồn**: `hocvienlyso.org/tu-hoc-tu-vi-sao-theo-chi-nam-sinh.html` ("Tự học Tử vi đẩu số bài 12: An các
sao theo chi năm sinh", Level 1).

**Nguyên văn (tóm lược từ fetch)**: "Thái Tuế: positioned tại cung khớp Chi năm sinh, 11 sao còn lại theo
thứ tự **thuận** (clockwise)" — không đề cập giới tính/Âm Dương ở bước này (khác hẳn Tràng Sinh).

**Đối chiếu**: điểm khởi (= Chi năm sinh) khớp code hiện tại (`thaiTueTaiChi[mod12(yearChiIndex + step)]`
— luôn `+step`, không có nhánh trừ). Chiều luôn thuận, KHÔNG phụ thuộc giới tính — khớp code (code không
hề dùng `isThuanChung` cho Thái Tuế, đúng theo nguồn). Thứ tự 12 tên sao (Thái Tuế, Thiếu Dương, Tang Môn,
Thiếu Âm, Quan Phù, Tử Phù, Tuế Phá, Long Đức, Bạch Hổ, Phúc Đức, Điếu Khách, Trực Phù) khớp 12/12 với
nhiều trang hocvienlyso.org cùng liệt kê (đã xác nhận từ spec §26 trước đây, nay củng cố thêm nguồn Nam
Phái độc lập).

**Không tìm thấy variant nào khác** cho vòng Thái Tuế trong phạm vi nguồn đã tra (không có
`SCHOOL_CONFLICT`).

**Kết luận: SOURCE_SUPPORTED** (Level 1, cả điểm khởi/chiều/thứ tự đều khớp) — gần LOCKED nhưng giữ mức
SOURCE_SUPPORTED vì bằng chứng "luôn thuận" chỉ đến từ 1 fetch tóm lược (chưa trích nguyên văn dài với ví
dụ số liệu cụ thể như Tràng Sinh). Không sửa công thức.

**Golden Master coverage**: 0/6.

---

## 4. Các vòng khác

Không tìm thấy vòng nào khác đang implement trong engine ngoài 2 vòng trên. Vòng Bác Sĩ: xem ghi chú ở
mục 1 (NOT_IMPLEMENTED, chỉ biết điểm khởi = cùng cung Lộc Tồn, thiếu 12 tên sao + chiều).

---

## 5. Thiên Mã

**Nguồn**: `hocvienlyso.org/tu-hoc-tu-vi-sao-theo-chi-nam-sinh.html` (cùng bài với Thái Tuế — bài 12).

**Nguyên văn xác nhận trực tiếp**: "Sinh năm Tý, an Thiên Mã ở cung Dần." — Tý thuộc nhóm tam hợp
Thân/Tý/Thìn (group 0 trong code) → khớp CHÍNH XÁC `THIEN_MA_START[0] = 2` (Dần).

**Hạn chế**: bảng đầy đủ 12 Chi (hoặc 4 nhóm tam hợp) nằm trong ẢNH trên trang nguồn, **không trích xuất
được dạng text** qua WebFetch. Chỉ xác nhận được TRỰC TIẾP 1/4 nhóm bằng chữ. 3/4 nhóm còn lại
(Dần/Ngọ/Tuất, Tỵ/Dậu/Sửu, Hợi/Mão/Mùi) chưa có xác nhận Level 1 bằng văn bản — độ tin cậy dựa trên: (a)
không nguồn nào khác từng mâu thuẫn qua toàn bộ các phase audit trước (Phase 18A/19/22), (b) khớp spec
gốc `TuVi_Engine_V2.md` §24 (đã VERIFIED spec-literal từ đầu dự án).

**Không phụ thuộc giới tính/Can năm** — không nguồn nào đề cập yếu tố này cho Thiên Mã.

**Kết luận: SOURCE_SUPPORTED** (Level 1 một phần — 1/4 nhóm xác nhận trực tiếp bằng chữ, 3/4 nhóm còn lại
ở mức DERIVED/spec-literal như trước). Không sửa công thức — code đã khớp đúng ở phần xác nhận được, và
"nếu code đúng source: KHÔNG sửa" (mục X).

**Golden Master coverage**: 0/6.

---

## 6. Source hierarchy

| Nguồn | URL | Level | Dùng cho |
|---|---|---|---|
| hocvienlyso.org bài 15 | `tu-hoc-tu-vi-bai-15-cac-bo-sao-khac.html` | 1 | Tràng Sinh (điểm khởi + chiều), phát hiện phụ Bác Sĩ |
| hocvienlyso.org bài 12 | `tu-hoc-tu-vi-sao-theo-chi-nam-sinh.html` | 1 | Thái Tuế (điểm khởi + chiều), Thiên Mã (1/4 nhóm) |

Cả 2 đều là bài trong CÙNG series "Tự học tử vi" (bài 12, 13, 14, 15) trên chính domain hocvienlyso.org —
đã dùng bài 13/14 cho Tả Hữu/Xương Khúc/Thiên Hình/Thiên Diêu/Thiên Y ở Phase 24/25, đều khớp chính xác.
Đây là 1 series bài giảng có cấu trúc nhất quán, không phải các trang lẻ tẻ chép lại nhau — không coi 2
bài này là "cùng 1 nguồn" dù cùng series (mỗi bài có URL/nội dung riêng, khác chủ đề).

---

## 7. Rule matrix

| Nhóm | Sao/Vòng | Rule hiện tại | Source | GM | Evidence | Status | Action |
|---|---|---|---|---|---|---|---|
| A | Tràng Sinh (điểm khởi) | `TRANG_SINH_START` theo Cục | hocvienlyso.org bài 15 (Level 1) | 0/6 | Khớp 5/5 | LOCKED | KEEP |
| A | Tràng Sinh (chiều) | `isThuanChung` (Dương Nam/Âm Nữ thuận) | hocvienlyso.org bài 15 (Level 1) | 0/6 | Khớp nguyên văn | LOCKED | KEEP |
| B | Thái Tuế (điểm khởi + chiều) | `yearChiIndex + step`, luôn thuận | hocvienlyso.org bài 12 (Level 1) | 0/6 | Khớp | SOURCE_SUPPORTED | KEEP |
| B | Thái Tuế (12 tên sao) | `THAI_TUE_STAGES` | Nhiều trang hocvienlyso.org đồng thuận | 0/6 | Khớp 12/12 | SOURCE_SUPPORTED | KEEP |
| C | Vòng Bác Sĩ | Không có trong engine | hocvienlyso.org bài 15 (chỉ có điểm khởi) | 0/6 | Thiếu 12 tên sao + chiều | NOT_IMPLEMENTED | NEED_SOURCE |
| D | Thiên Mã (nhóm Thân/Tý/Thìn) | `THIEN_MA_START[0]=2` | hocvienlyso.org bài 12 (Level 1) | 0/6 | Khớp trực tiếp | SOURCE_SUPPORTED | KEEP |
| D | Thiên Mã (3 nhóm còn lại) | `THIEN_MA_START[1..3]` | Spec-literal (không đổi từ đầu dự án) | 0/6 | Chưa xác nhận Level 1 bằng chữ | SOURCE_SUPPORTED (một phần) / DERIVED (phần còn lại) | ADD_TEST (đã thêm) |

---

## 8. Golden Master coverage

| Vòng/Sao | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Tràng Sinh | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |
| Thái Tuế | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |
| Thiên Mã | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |

Không GM nào ghi rõ tên sao Tràng Sinh/Thái Tuế/Thiên Mã trong phần "Principal stars" — đã rà lại
`TuVi_Golden_Master_Pack_V1.md`, xác nhận như Phase 19/24/25 đã ghi. Không tự tạo expected từ GM.

---

## 9. Conflicts

Không phát hiện conflict nào (không có 2 nguồn Nam Phái mâu thuẫn nhau cho Tràng Sinh/Thái Tuế/Thiên Mã).
Khác hẳn tình huống Hỏa Tinh/Linh Tinh (Phase 22/23) — nhóm sao trong Phase 26 này có nguồn nhất quán,
không có `SCHOOL_CONFLICT`.

---

## 10. Missing source

Duy nhất: **Vòng Bác Sĩ** — biết điểm khởi (đồng cung Lộc Tồn) nhưng thiếu 12 tên sao + chiều đi. Giữ
NOT_IMPLEMENTED, NEED_SOURCE.

**Thiên Mã 3/4 nhóm còn lại** — chưa có xác nhận Level 1 bằng văn bản (chỉ có hình ảnh không trích xuất
được) — không phải "thiếu nguồn hoàn toàn" mà là "nguồn tồn tại nhưng không đọc được qua công cụ hiện có".
Không hạ cấp xuống NEED_SOURCE vì đã có 1/4 xác nhận trực tiếp + không nguồn nào mâu thuẫn qua nhiều phase.

---

## 11. Recommended implementation

Không có gì cần implement thêm trong phase này (Tràng Sinh/Thái Tuế/Thiên Mã đều đã khớp nguồn, không sửa
code). Đề xuất cho phase sau nếu muốn: tìm cách trích xuất bảng ảnh Thiên Mã đầy đủ (có thể cần đọc ảnh
trực tiếp thay vì WebFetch text-only) hoặc tìm nguồn Vòng Bác Sĩ đầy đủ 12 tên sao trước khi cân nhắc
implement.

---

## 12. Tests

File mới: `tests/tu-vi-phase26-vong-sao-thien-ma.test.ts` (13 test). Expected value lấy từ nguồn/bảng đã
xác nhận, KHÔNG gọi lại chính hàm/bảng đang test để tự sinh expected.

| Nhóm | Nội dung |
|---|---|
| Tràng Sinh điểm khởi | 5 test, đối chiếu `TRANG_SINH_START` với bảng nguồn liệt kê thủ công |
| Tràng Sinh chiều | 2 test, dùng dữ liệu GM-001 (Dương Nam, thuận) và GM-005 (Âm Nam, nghịch) — cùng Thổ Ngũ Cục, khởi Thân — đối chiếu đủ 12/12 vị trí mỗi test với chuỗi liệt kê thủ công |
| Thái Tuế | 2 test, GM-001 (Nam) và GM-002 (Nữ, cùng năm) — đối chiếu đủ 12/12 vị trí, xác nhận không phụ thuộc giới tính |
| Thiên Mã | 2 test — 1 xác nhận nhóm đã có nguồn Level 1, 1 ghi nhận cấu trúc bảng (không khẳng định đúng/sai 3 nhóm chưa xác nhận) |
| Golden Master coverage | 1 test ghi nhận 0/6 |
| Regression | 1 test xác nhận Mệnh/Cục/Chủ Mệnh/14 chính tinh/4 trụ không đổi |

---

## 13. Regression

```
npx vitest run
```

```
Test Files  22 passed (22)
     Tests  670 passed | 5 expected fail (675)
```

Trước Phase 26: 657 pass + 5 expected-fail (662). Sau: 670 pass + 5 expected-fail (675) — **+13 test mới**,
đúng bằng file mới. **0 unexpected failure.** Không xóa test. Không sửa Golden Master. Không sửa expected
để ép pass (chỉ thêm test mới, comment-only change ở `rules.ts` — 0 thay đổi công thức nên không có gì để
"ép pass").

Đã kiểm tra TypeScript (`tsc --noEmit`): không phát sinh lỗi liên quan `tu-vi`. Không có thay đổi nào quan
sát được trên UI (chỉ sửa comment, không đổi `engine.ts` logic/renderer) nên không cần xác minh browser
riêng — đã xác nhận qua test suite đầy đủ.

Xác nhận KHÔNG thay đổi (mục XIII): Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ Hóa,
Đại Vận, 4 trụ Can Chi, Kình Dương/Đà La, Khôi Việt, Xương Khúc, Tả Hữu, Thiên Diêu/Thiên Y — tất cả test
liên quan (Phase 20-25) chạy lại PASS nguyên vẹn, không có `ARCHITECTURE_RISK` nào được phát hiện (vòng
sao chỉ đọc `isThuanChung`/`yearChiIndex`/Cục đã tính sẵn, không ghi ngược vào bất kỳ trường nào khác).

---

## FINAL CHECK

```
[x] Inventory đầy đủ
[x] Tràng Sinh đã audit — LOCKED
[x] Thái Tuế đã audit — SOURCE_SUPPORTED
[x] Các vòng khác đã audit (Bác Sĩ: NOT_IMPLEMENTED, thiếu nguồn)
[x] Thiên Mã đã audit — SOURCE_SUPPORTED (một phần)
[x] Source được ghi rõ (URL, tiêu đề, Level)
[x] Không trộn trường phái
[x] Golden Master coverage được ghi (0/6 toàn bộ)
[x] Không tự suy diễn
[x] Không sửa Golden Master
[x] Không có unexpected failure
[x] Không có structural regression
```

**KHÔNG COMMIT/PUSH.**
