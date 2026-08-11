# TUVI PHASE 22 — PHỤ TINH SOURCE GAP RESOLUTION (RESEARCH)

**Chỉ nghiên cứu/audit source. Không sửa `src/lib/tu-vi/`, không sửa Golden Master, không sửa test, không
implement rule mới. Không commit/push.**

Phương pháp: dùng `WebSearch`/`WebFetch` tra cứu trực tiếp các trang nguồn (ưu tiên hocvienlyso.org — cùng
họ nguồn "Học Viện Lý Số" đã được project chính thức dùng từ Phase 8 cho Thiên Việt/status table), đối
chiếu với constant hiện tại trong `rules.ts`/`engine.ts`, KHÔNG tự sửa gì.

---

## BẢNG TỔNG HỢP BẮT BUỘC

| Sao | Rule hiện tại | Source | Rule source | GM | Evidence | Status | Recommendation |
|---|---|---|---|---|---|---|---|
| Kình Dương | `locTonIdx+1` (luôn +1, không phân biệt giới tính) | hoc.kabala.vn, bài "Sai lầm về an sao lập số" — **cùng tiêu đề bài đã dùng cho Thiên Việt ở Phase 8** | Level 1 (khả năng cao, xem mục III) | 0/6 | Có công thức RÕ + ví dụ số liệu cụ thể | CONFLICTED (code hiện tại KHÔNG khớp nguồn cho 1/2 trường hợp giới tính) | NOT_READY_FOR_IMPLEMENTATION (cần xác nhận nguồn + sửa code mới đúng) |
| Đà La | `locTonIdx-1` (luôn -1) | Cùng nguồn trên | Level 1 (khả năng cao) | 0/6 | Cùng bằng chứng trên | CONFLICTED | NOT_READY_FOR_IMPLEMENTATION |
| Hỏa Tinh | `HOA_TINH_START[group]+gioChiIndex` (luôn +, không phân biệt giới tính) | hoctuvi.blogspot.com + lyso.vn (điểm khởi); nhiều nguồn khác cho chiều | Level 3/4 (điểm khởi); tác giả tự nhận có bất đồng giữa các phái cho nhóm Tỵ Dậu Sửu | 0/6 | Điểm khởi khớp 4/4 nhóm với code hiện tại (bất ngờ tốt); chiều KHÔNG khớp (nguồn nói có đảo chiều theo giới tính, code không có) | CONFLICTED | NOT_READY_FOR_IMPLEMENTATION |
| Linh Tinh | `LINH_TINH_START[group]+gioChiIndex` | Cùng nguồn Hỏa Tinh | Level 3/4 | 0/6 | Điểm khởi khớp 4/4 nhóm; chiều không khớp (cùng lý do) | CONFLICTED | NOT_READY_FOR_IMPLEMENTATION |
| Địa Không | `mod12(11-hourChiIndex)` (khởi Hợi, nghịch) | hocvienlyso.org, "ĐỊA KHÔNG ĐỊA KIẾP" | Level 1 (chính hocvienlyso.org) | 0/6 | Nguồn xác nhận ĐÚNG: "khởi từ cung Hợi", "Địa Không theo chiều nghịch" — khớp 100% code hiện tại | SOURCE_SUPPORTED | READY_FOR_IMPLEMENTATION (không cần sửa gì — code đã đúng nguồn) |
| Địa Kiếp | `mod12(11+hourChiIndex)` (khởi Hợi, thuận) | Cùng nguồn trên | Level 1 | 0/6 | Nguồn xác nhận: "Địa Kiếp theo chiều thuận" — khớp 100% code hiện tại | SOURCE_SUPPORTED | READY_FOR_IMPLEMENTATION (không cần sửa gì — code đã đúng nguồn) |
| Thiên Việt | `THIEN_VIET_TABLE` (theo Nguyên Cát, Phase 8) | `TuVi_Profile_NguyenCat_V1.md` §7, "Học viện Lý Số, 'Sai lầm về an sao lập số'" | Level 1 (đã xác nhận từ Phase 8) | 0/6 | Có bảng rõ, đã implement từ Phase 8 | SOURCE_SUPPORTED (GOLDEN_MASTER_VERIFIED=FALSE) | Đã READY_FOR_IMPLEMENTATION và ĐÃ implement từ Phase 8 — không đổi gì, chỉ tái xác nhận |
| Thiên Diêu | Chưa có code | tuvi.vn, tuvi.lethuc.com, nhiều blog Tử Vi phổ thông | Level 3/4 (KHÔNG xác nhận cùng họ Học Viện Lý Số) | 0/6 | Tìm được công thức cụ thể ("khởi Sửu tại tháng 1, chạy thuận") nhưng nguồn không cùng họ đã chọn | SOURCE_SUPPORTED (nguồn khác họ, chưa xác nhận Nam Phái) | NOT_READY_FOR_IMPLEMENTATION (thiếu xác nhận nguồn Level 1/2 cùng họ) |
| Thiên Y | Chưa có code | Cùng nguồn Thiên Diêu — "luôn đồng cung với Thiên Diêu" | Level 3/4 | 0/6 | Xác nhận nhất quán ở ≥2 nguồn độc lập: đồng cung với Thiên Diêu | SOURCE_SUPPORTED (nguồn khác họ) | NOT_READY_FOR_IMPLEMENTATION |

---

## I. KÌNH DƯƠNG / ĐÀ LA — PHÁT HIỆN QUAN TRỌNG NHẤT

### Nguồn tìm được

`hoc.kabala.vn/sai-lam-ve-an-sao-lap-so/` — bài viết có tiêu đề **trùng khớp** với nguồn đã dùng ở Phase 8
cho Thiên Việt ("Học viện Lý Số, 'Sai lầm về an sao lập số'", trích trong `TuVi_Profile_NguyenCat_V1.md`
§7). Rất có khả năng đây là cùng 1 bài viết gốc (nội dung được đăng lại/mirror qua nhiều domain — đúng mô
hình `COMMON_ANCESTOR_SOURCE` đã phát hiện ở Phase 13) — **nhưng chưa đối chiếu từng chữ 100%** giữa 2 bản
để khẳng định tuyệt đối, chỉ khẳng định trùng tiêu đề và cùng chủ đề "sửa lỗi an sao phổ biến".

**Nguyên văn tìm được:**

> "Kình dương – Đà la là hai sát tinh an ở trước và sau Lộc Tồn, cũng phải theo chiều thuận hay nghịch của
> Dương Nam Âm Nữ (thuận) và Âm Nam Dương Nữ (nghịch) mà thay đổi vị trí."

**Ví dụ cụ thể (tuổi Giáp Ngọ):**

| Giới tính/Âm Dương | Lộc Tồn | Kình Dương | Đà La |
|---|---|---|---|
| Dương Nam | Dần | Mão (Dần+1) | Sửu (Dần-1) |
| Dương Nữ | Dần | Sửu (Dần-1) | Mão (Dần+1) |

### Đối chiếu với code hiện tại

`engine.ts`: `addPhuTinh(locTonIdx+1, "Kình Dương"); addPhuTinh(locTonIdx-1, "Đà La");` — **LUÔN LUÔN**
`+1`/`-1`, không phân biệt giới tính/Âm Dương Can.

- Với **Dương Nam** (ví dụ Giáp Ngọ): code cho Kình=Lộc+1=Mão, Đà=Lộc-1=Sửu → **KHỚP** nguồn.
- Với **Dương Nữ** (cùng tuổi Giáp Ngọ): code VẪN cho Kình=Lộc+1=Mão, Đà=Lộc-1=Sửu (vì code không đổi theo
  giới tính) — nhưng nguồn nói phải ĐẢO NGƯỢC (Kình=Sửu, Đà=Mão) → **KHÔNG KHỚP**.

**Kết luận: code hiện tại chỉ đúng cho ĐÚNG 1 trong 2 nhóm** (nhóm cùng chiều với Đại Vận thuận: Dương
Nam/Âm Nữ), **sai cho nhóm còn lại** (Âm Nam/Dương Nữ) — theo đúng nguồn vừa tìm được.

**Đối chiếu chéo nội bộ**: quy tắc "Dương Nam Âm Nữ thuận, Âm Nam Dương Nữ nghịch" **CHÍNH XÁC LÀ** biến
`isThuanChung` đã có sẵn trong `engine.ts` (dùng cho Đại Vận §28.1 và Tràng Sinh) — nếu rule này đúng, chỉ
cần Kình Dương/Đà La dùng LẠI biến `isThuanChung` đã có sẵn (không phải công thức mới hoàn toàn), rất nhất
quán với kiến trúc hiện tại.

### Trả lời đầy đủ theo yêu cầu mục III

- Lộc Tồn ở Chi nào: theo `LOC_TON_TABLE` hiện tại (không đổi, đã spec-literal khớp §18).
- Kình Dương ở Chi nào: `Lộc Tồn ± 1` — dấu phụ thuộc `isThuanChung`.
- Đà La ở Chi nào: dấu ngược lại Kình Dương.
- Mapping 12 Chi: dùng chung hệ Tý=0..Hợi=11 hiện tại, không đổi.
- Orientation: **PHỤ THUỘC GIỚI TÍNH + ÂM DƯƠNG CAN NĂM SINH** (không phải hằng số cố định như code hiện
  tại) — đây là câu trả lời cụ thể mà mục III yêu cầu, KHÔNG chấp nhận câu chung chung "trước/sau Lộc Tồn"
  nữa.
- Có phụ thuộc giới tính: **CÓ**.
- Có phụ thuộc Can Âm/Dương: **CÓ** (kết hợp với giới tính, đúng công thức `isThuanChung`).
- Source chính xác: hoc.kabala.vn (nghi cùng gốc Học Viện Lý Số đã dùng ở Phase 8, chưa xác nhận tuyệt đối).

### Status & Recommendation

**CONFLICTED** — không phải vì 2 nguồn khác nhau đối chọi, mà vì **code hiện tại tự mâu thuẫn với nguồn
vừa tìm được** ở đúng nửa số trường hợp giới tính. Đây KHÔNG đủ điều kiện gọi READY_FOR_IMPLEMENTATION
ngay (Phase 22 là research, không implement) nhưng đây là phát hiện MẠNH — khuyến nghị: **Phase tiếp theo
nên xem xét implement** với điều kiện xác nhận thêm 1 nguồn độc lập thứ 2 hoặc Golden Master để tránh chỉ
dựa vào 1 bài viết duy nhất (dù nghi là Level 1).

---

## II. HỎA TINH / LINH TINH

### Nguồn tìm được

Tổng hợp từ `hoctuvi.blogspot.com` + `lyso.vn` (không phải hocvienlyso.org trực tiếp):

**Bảng điểm khởi (theo nhóm tuổi tam hợp):**

| Nhóm tam hợp | Hỏa Tinh khởi | Linh Tinh khởi |
|---|---|---|
| Thân Tý Thìn | Dần | Tuất |
| Dần Ngọ Tuất | Sửu | Mão |
| Tỵ Dậu Sửu | Mão | Tuất (theo 1 số nguồn — có bất đồng) |
| Hợi Mão Mùi | Dậu | Tuất |

**Đối chiếu với `HOA_TINH_START=[2,1,3,9]`, `LINH_TINH_START=[10,3,10,10]`** (thứ tự nhóm code:
0=Thân Tý Thìn, 1=Dần Ngọ Tuất, 2=Tỵ Dậu Sửu, 3=Hợi Mão Mùi):

- Hỏa Tinh: Thân Tý Thìn→Dần(2)✅, Dần Ngọ Tuất→Sửu(1)✅, Tỵ Dậu Sửu→Mão(3)✅, Hợi Mão Mùi→Dậu(9)✅ —
  **KHỚP 4/4 nhóm với code hiện tại.**
- Linh Tinh: Thân Tý Thìn→Tuất(10)✅, Dần Ngọ Tuất→Mão(3)✅, Tỵ Dậu Sửu→Tuất(10)✅ (theo nguồn phụ),
  Hợi Mão Mùi→Tuất(10)✅ — **KHỚP 4/4 nhóm với code hiện tại.**

Đây là phát hiện tích cực bất ngờ: bảng điểm khởi hiện tại (vốn không có trích dẫn nguồn trong `rules.ts`)
**khớp hoàn toàn** với nguồn vừa tìm được.

### Nhưng: phát hiện GAP về CHIỀU (thuận/nghịch)

Nguồn: *"Dương Nam Âm Nữ, Hỏa moves forward (thuận) and Linh moves backward (nghịch). Âm Nam Dương Nữ, Hỏa
moves backward and Linh moves forward."* — **CHIỀU PHỤ THUỘC GIỚI TÍNH/ÂM DƯƠNG**, giống hệt mẫu hình vừa
phát hiện ở Kình Dương/Đà La.

Code hiện tại: `HOA_TINH_START[group] + gioChiIndex` và `LINH_TINH_START[group] + gioChiIndex` — **LUÔN
LUÔN cộng** (thuận), không có nhánh trừ theo giới tính. → Đây là **GAP THẬT**, không phải chỉ thiếu bằng
chứng.

### Bất đồng nội bộ giữa các trường phái (tự nguồn thừa nhận)

Bài `hoctuvi.blogspot.com` tự viết: tồn tại ít nhất 2 trường phái khác nhau cho cách an nhóm **Tỵ Dậu
Sửu** cụ thể (nhắc tên "Quản Xuân Thịnh" như 1 trường phái), và tác giả bài viết **tự thừa nhận không chắc
chắn cách nào đúng tuyệt đối**. Đây đúng là tình huống phải ghi **CONFLICTED**, không được tự chọn bên.

### Status & Recommendation

**CONFLICTED** (điểm khởi tốt nhưng chiều thiếu + 1 nhóm có bất đồng nội bộ giữa các phái) →
**NOT_READY_FOR_IMPLEMENTATION**.

---

## III. ĐỊA KHÔNG / ĐỊA KIẾP — ĐÃ CÓ NGUỒN LEVEL 1 XÁC NHẬN ĐÚNG

### Nguồn

`hocvienlyso.org/dia-khong-dia-kiep.html` (chính domain Học Viện Lý Số, Level 1 — không qua trung gian).

**Nguyên văn:**

> "Không Kiếp đều khởi từ cung Hợi... Địa Kiếp theo chiều thuận, Địa Không theo chiều nghịch... an theo
> giờ sinh, giống Văn Xương Văn Khúc."

### Đối chiếu với code hiện tại

```ts
diaKiepIndex = mod12(11 + hourChiIndex);  // khởi Hợi(11), thuận (+) — KHỚP "Địa Kiếp thuận"
diaKhongIndex = mod12(11 - hourChiIndex); // khởi Hợi(11), nghịch (-) — KHỚP "Địa Không nghịch"
```

**KHỚP HOÀN TOÀN** — điểm khởi (Hợi), chiều Địa Kiếp (thuận), chiều Địa Không (nghịch) đều đúng nguyên văn
nguồn Level 1. Không có phụ thuộc giới tính được nguồn nhắc tới cho riêng 2 sao này (khác Kình/Đà và
Hỏa/Linh) — công thức đơn giản hơn, chỉ theo giờ sinh, không đổi theo giới tính.

### Status & Recommendation

**SOURCE_SUPPORTED** (Level 1, chính hocvienlyso.org, khớp 100% code hiện tại) — **READY_FOR_IMPLEMENTATION**
theo nghĩa: **không cần sửa gì cả, code hiện tại đã đúng nguồn chính thức**. Đề xuất: cập nhật lại comment
trong `rules.ts` từ "NEED_GOLDEN_MASTER_REVIEW / kiến thức phổ biến" thành "SOURCE_SUPPORTED, nguồn
hocvienlyso.org" ở phase implement kế tiếp (không tự sửa comment trong Phase 22 vì đây chỉ là phase research,
dù comment không phải "rule" — vẫn giữ đúng tinh thần "không đụng `src/lib/tu-vi/` trong phase này").

---

## IV. THIÊN VIỆT — TÁI XÁC NHẬN, KHÔNG ĐỔI

Đã có nguồn Level 1 từ Phase 8 (`TuVi_Profile_NguyenCat_V1.md` §7, trích "Học viện Lý Số, 'Sai lầm về an
sao lập số'"). Phase 22 xác nhận lại: bài viết cùng tiêu đề vừa tìm thấy qua `hoc.kabala.vn` (mục I) khớp
với chính tiêu đề đã trích dẫn — càng củng cố đây là nguồn thật, không phải trích dẫn khống.

**Status: SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE** (0/6 GM có dữ liệu Thiên Việt) — **giữ nguyên**,
không đổi gì. Đã READY_FOR_IMPLEMENTATION và ĐÃ implement đúng từ Phase 8. Không quay lại
`Thiên Việt = Thiên Khôi + 6`. Không suy luận đối xứng. Không sửa runtime trong Phase 22.

---

## V. THIÊN DIÊU / THIÊN Y

### Nguồn tìm được

Nhiều trang phổ thông (tuvi.vn, tuvi.lethuc.com, tracuutuvi.com...) — **KHÔNG xác nhận được cùng họ nguồn
Học Viện Lý Số** đã chọn cho project (khác I/III ở trên, vốn tìm trực tiếp trên hocvienlyso.org hoặc nguồn
nghi trùng).

**Công thức tìm được (nhất quán ở ≥2 nguồn độc lập):**

> "Thiên Diêu khởi tại cung Sửu ứng với tháng 1, đếm thuận tới tháng sinh."
> "Thiên Y luôn đồng cung với Thiên Diêu" (không phải 1 công thức riêng — chỉ là "cùng vị trí").

Nếu đúng, công thức sẽ là `thienDieuIndex = mod12(1 + (lunarMonth-1))` — **CÙNG DẠNG CẤU TRÚC** với
Thiên Hình đã implement (`mod12(9 + (lunarMonth-1))`, khởi Dậu) — về mặt kiến trúc, khá nhất quán với
nhóm "phụ tinh theo tháng" ở spec §25.

### Vì sao KHÔNG đủ để READY_FOR_IMPLEMENTATION

1. **Chưa xác nhận cùng họ nguồn Nam Phái** đã chọn cho project — theo đúng nguyên tắc mục II "KHÔNG gộp
   các trường phái khác nhau thành 1 rule", không thể tự nhận đây là Level 1/2 chỉ vì cấu trúc công thức
   "nhìn hợp lý".
   Rule này chỉ có thể được nâng lên SOURCE_SUPPORTED cùng họ Nam Phái nếu tìm thấy Trực tiếp trên
   hocvienlyso.org (chưa tìm thấy trang có công thức, chỉ có trang giải nghĩa ý nghĩa — mục "search" đầu
   Phase 22 đã thử và không ra kết quả công thức).
2. Spec §25 chỉ liệt kê TÊN Thiên Diêu/Thiên Y trong danh sách "phải tách rule", không tự cho công thức
   (đã xác nhận từ Phase 18B) — nguồn tìm được ở Phase 22 là nguồn NGOÀI spec, cần xác nhận thêm.

### Status & Recommendation

**SOURCE_SUPPORTED (nguồn khác họ — chưa xác nhận Nam Phái, gần với OTHER_SCHOOL nhưng chưa đủ căn cứ
khẳng định khác trường phái hẳn, chỉ là CHƯA XÁC NHẬN CÙNG TRƯỜNG PHÁI)** → **NOT_READY_FOR_IMPLEMENTATION**.
Nếu người dùng xác nhận chấp nhận mức nguồn phổ thông này (tương tự cách Lộc Tồn/Thiên Mã/Thiên Hình hiện
tại vẫn dùng "DERIVED, bảng phổ biến"), có thể nâng lên implement ở phase sau — nhưng đó là quyết định cần
CHỈ THỊ RÕ, không tự ý nâng trong Phase 22.

---

## VI. KHÔNG THAY ĐỔI GÌ TRONG PHASE 22

Xác nhận: không có file nào trong `src/lib/tu-vi/` bị sửa, không sửa Golden Master, không sửa test hiện
có, không implement rule mới, không sửa `MAIN_STAR_STATUS`/bảng Nguyên Cát, không sửa 14 chính tinh.

## VII. TEST

```
npx vitest run
```

```
Test Files  18 passed (18)
     Tests  558 passed | 5 expected fail (563)
```

Không đổi so với trước Phase 22 (0 unexpected failure, không sửa gì nên không thể có regression).

---

## KẾT LUẬN THEO TỪNG SAO

```
Kình Dương          — CONFLICTED (code sai với nguồn ở nửa số trường hợp giới tính)  → NOT_READY_FOR_IMPLEMENTATION
Đà La                — CONFLICTED (cùng lý do)                                        → NOT_READY_FOR_IMPLEMENTATION
Hỏa Tinh             — CONFLICTED (điểm khởi đúng, chiều thiếu + 1 nhóm bất đồng phái) → NOT_READY_FOR_IMPLEMENTATION
Linh Tinh            — CONFLICTED (cùng lý do)                                        → NOT_READY_FOR_IMPLEMENTATION
Địa Không            — SOURCE_SUPPORTED (Level 1, khớp 100% code hiện tại)            → READY_FOR_IMPLEMENTATION (không cần sửa)
Địa Kiếp             — SOURCE_SUPPORTED (Level 1, khớp 100% code hiện tại)            → READY_FOR_IMPLEMENTATION (không cần sửa)
Thiên Việt           — SOURCE_SUPPORTED (đã implement đúng từ Phase 8)                → READY_FOR_IMPLEMENTATION (đã xong, không đổi)
Thiên Diêu           — SOURCE_SUPPORTED (nguồn khác họ, chưa xác nhận Nam Phái)        → NOT_READY_FOR_IMPLEMENTATION
Thiên Y              — SOURCE_SUPPORTED (nguồn khác họ, chưa xác nhận Nam Phái)        → NOT_READY_FOR_IMPLEMENTATION
```

**Phát hiện quan trọng nhất của Phase 22**: Kình Dương/Đà La và Hỏa Tinh/Linh Tinh đều KHÔNG chỉ "thiếu
bằng chứng" như Phase 18A/18B từng kết luận — nghiên cứu sâu hơn cho thấy code hiện tại **CÓ THỂ đang sai**
(thiếu logic đảo chiều theo giới tính/Âm Dương Can) so với ít nhất 1 nguồn cụ thể tìm được. Đây là nâng cấp
quan trọng từ "NEED_GOLDEN_MASTER_REVIEW" (chưa biết) lên "CONFLICTED" (có bằng chứng cụ thể chỉ ra khả
năng sai) — cần quyết định của người dùng trước khi bất kỳ phase nào sửa code.

Ngược lại, Địa Không/Địa Kiếp là tin tốt: nguồn Level 1 xác nhận code hiện tại **đã đúng**, có thể chính
thức nâng status mà không cần sửa 1 dòng code nào.

**KHÔNG COMMIT/PUSH.**
