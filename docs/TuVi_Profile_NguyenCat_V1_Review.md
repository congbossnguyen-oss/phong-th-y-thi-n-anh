# TuVi Profile Nguyên Cát V1 — Review: SOURCE TABLE vs GM-001..GM-006

Theo đúng yêu cầu mục 9 của `TuVi_Profile_NguyenCat_V1.md` (người dùng cung cấp). File này CHỈ so sánh
và phân loại — **KHÔNG sửa `src/lib/tu-vi/`, KHÔNG sửa Golden Master, KHÔNG commit, KHÔNG push.**

Phân loại áp dụng cho mỗi mâu thuẫn:
- **A** = source (Học Viện Lý Số) nhiều khả năng đúng, GM Pack nhiều khả năng lỗi transcription
- **B** = GM Pack nhiều khả năng đúng, source/profile không khớp
- **C** = mâu thuẫn nội bộ trong chính source (đã có sẵn trong `TuVi_Profile_NguyenCat_V1.md`, hoặc mới
  phát hiện khi đối chiếu)
- **D** = chưa đủ bằng chứng để kết luận theo hướng nào

---

## 0. TÓM TẮT KẾT QUẢ (đọc trước)

So với bảng cũ của engine (chỉ khớp 27/62 = 43,5% trên các ô có dữ liệu GM — xem
`docs/TUVI_STATUS_TABLE_REQUIREMENTS.md`), **bảng status mới từ Nguyên Cát khớp 57/62 = 91,9%** trên
đúng cùng tập 62 điểm dữ liệu GM đó. Đây là khác biệt rất lớn, cho thấy nguồn Học Viện Lý Số /
Tử Vi Nguyên Cát phù hợp với 6 Golden Master hiện có tốt hơn hẳn bảng đang dùng trong code.

**Phát hiện quan trọng nhất của review này**: bảng **Mệnh Chủ** trong source ghi rõ "tra theo Chi CUNG
MỆNH, không dùng Chi năm sinh" — nhưng khi kiểm bằng dữ liệu thật, đúng NGƯỢC LẠI: **các GIÁ TRỊ trong
bảng đó khớp 6/6 Golden Master nếu tra theo CHI NĂM SINH, và khớp 0/6 nếu tra theo Chi cung Mệnh như
source tự công bố.** Xem mục 3.

---

## 1. BẢNG STATUS 14 CHÍNH TINH — TỪNG MÂU THUẪN VỚI GM

Đối chiếu bảng candidate (mục 3 của `TuVi_Profile_NguyenCat_V1.md`) với toàn bộ 62 điểm dữ liệu GM (đã
liệt kê đầy đủ nguồn ở `docs/TUVI_STATUS_TABLE_REQUIREMENTS.md` mục 1). 58/62 điểm KHỚP (không liệt kê
lại ở đây vì không phải mâu thuẫn). Dưới đây là **đúng 4 điểm mâu thuẫn thật** phát hiện được, cộng 1
điểm là chính mâu thuẫn nội bộ nguồn (Thiên Lương Sửu/Mùi) mà nguồn tự khai báo.

| # | Sao @ Chi | Giá trị GM | Giá trị source Nguyên Cát | GM nguồn | Phân loại | Lý do |
|---|---|---|---|---|---|---|
| 1 | Vũ Khúc @ Mão | Miếu | Đắc | GM-003 | **D** | Không có bằng chứng riêng cho ô này ngoài chính GM-003; 11/13 ô khác của GM-003 khớp source (85%), không đủ để suy luận "đây chắc chắn là lỗi GM" hay "đây chắc chắn là lỗi source" chỉ từ 1 ô lệch. |
| 2 | Thiên Cơ @ Ngọ | Bình | Đắc | GM-003 | **D** | Tương tự #1 — cùng GM-003, không có bằng chứng riêng phân biệt được bên nào đúng. |
| 3 | Thái Âm @ Dần | Miếu | Hãm | GM-006 | **D** | GM-006 khớp source 8/10 ô khác (80%); không có bằng chứng riêng cho ô này. |
| 4 | Thất Sát @ Mùi | Bình | Đắc | GM-006 | **D** | Tương tự #3 — cùng GM-006, không có bằng chứng riêng. |

**Không xếp cả 4 ô này vào A** dù tỷ lệ khớp tổng thể của source rất cao (91,9%) — tỷ lệ khớp tổng thể là
bằng chứng NGỮ CẢNH, không phải bằng chứng cho TỪNG Ô cụ thể. Xếp D là lựa chọn trung thực hơn xếp A chỉ
dựa vào "đa số phiếu".

### Thiên Lương — Sửu/Mùi (mâu thuẫn tự khai báo trong source)

Source tự đánh dấu 2 ô này là `CONFLICTED` giữa 2 cách trình bày (Vượng vs Đắc cho cả Sửu và Mùi).

- **Sửu: MỚI CÓ BẰNG CHỨNG.** GM-005 cho Thiên Lương @ Sửu = **Đắc** (Sửu Nô Bộc: Thiên Lương(Đ), xem
  `docs/TuVi_Golden_Master_Pack_V1.md` GM-005). Đây là bằng chứng TRỰC TIẾP nghiêng về phương án "Đắc",
  không phải "Vượng". → **Phân loại: gần B** (GM giải quyết được xung đột nội bộ của source, chọn đúng
  nhánh "Đắc" trong 2 nhánh mà source đưa ra) — nhưng đây là 1 điểm dữ liệu duy nhất, chưa phải xác nhận
  chắc chắn tuyệt đối.
- **Mùi: VẪN CHƯA CÓ BẰNG CHỨNG.** Không có Golden Master nào trong 6 GM hiện có ghi Thiên Lương tại
  Mùi. → **Phân loại: C, chưa giải quyết.**

---

## 2. THIÊN KHÔI / THIÊN VIỆT

Bảng mới (theo Can, cả Khôi lẫn Việt cùng 1 nguồn — "Sai lầm về an sao lập số"):

```
Canh/Tân → Khôi Ngọ, Việt Dần
Giáp/Mậu → Khôi Sửu, Việt Mùi
Ất/Kỷ   → Khôi Tý,  Việt Thân
Bính/Đinh → Khôi Hợi, Việt Dậu
Nhâm/Quý → Khôi Mão, Việt Tỵ
```

So với 2 nguồn đã dùng trước đây trong code — **cả 3 bảng (spec gốc, bảng cổ điển Thiên Ất Quý Nhân em tự
chọn ở Phase 1 trước, và bảng Nguyên Cát này) đều nhóm Can khác nhau hoàn toàn**, xác nhận domain này thật
sự có nhiều trường phái không tương thích, không phải do lỗi transcription của riêng ai.

**Ưu điểm của bảng Nguyên Cát so với 2 bảng cũ**: đây là bảng DUY NHẤT trong 3 bảng có cả Khôi VÀ Việt
cùng đến từ 1 bài viết duy nhất — giải quyết đúng vấn đề đã bị flag ở audit trước (Khôi lấy từ spec,
Việt lấy từ nguồn khác, không nhất quán).

**Đối chiếu Golden Master**: không có GM nào trong 6 GM hiện có ghi vị trí Thiên Khôi hay Thiên Việt trong
phần "Principal stars" (chỉ liệt kê 14 chính tinh). Do đó:

```
SOURCE_SUPPORTED = YES (nhất quán nội bộ, có nguồn trích dẫn)
GOLDEN_MASTER_VERIFIED = NO
```

Đúng như chính `TuVi_Profile_NguyenCat_V1.md` mục 7 đã tự nhận — không có gì để phản bác hay xác nhận
thêm từ phía GM.

---

## 3. MỆNH CHỦ — PHÁT HIỆN QUAN TRỌNG: KHÓA TRA BẢNG TRONG SOURCE KHÔNG KHỚP BẰNG CHỨNG THẬT

Source (`TuVi_Profile_NguyenCat_V1.md` mục 5) khẳng định: *"Mệnh Chủ is determined from the branch of
Cung Mệnh... Do not use yearBranch for Mệnh Chủ."*

Kiểm chứng bằng cách thử CẢ HAI khóa trên chính bảng giá trị mà source cung cấp:

| GM | Chi cung Mệnh | Chi năm sinh | Chủ Mệnh thật (GM) | Dự đoán nếu tra theo Chi Mệnh | Dự đoán nếu tra theo Chi năm |
|---|---|---|---|---|---|
| GM-001 | Dần | Thân | Liêm Trinh | Lộc Tồn ❌ | Liêm Trinh ✅ |
| GM-002 | Dần | Thân | Liêm Trinh | Lộc Tồn ❌ | Liêm Trinh ✅ |
| GM-003 | Dần | Ngọ | Phá Quân | Lộc Tồn ❌ | Phá Quân ✅ |
| GM-004 | Dần | Sửu | Cự Môn | Lộc Tồn ❌ | Cự Môn ✅ |
| GM-005 | Thân | Sửu | Cự Môn | Liêm Trinh ❌ | Cự Môn ✅ |
| GM-006 | Tý | Tỵ | Vũ Khúc | Tham Lang ❌ | Vũ Khúc ✅ |

**Tra theo Chi cung Mệnh (đúng như source tự công bố): 0/6 khớp. Tra theo Chi năm sinh (ngược lại lời
source tự nói): 6/6 khớp tuyệt đối.**

Đây trùng khớp hoàn toàn với kết luận độc lập đã có TRƯỚC KHI đọc tài liệu này, ở
`docs/TUVI_RULE_FORENSICS.md` phần B4 (`LIKELY_RULE = YEAR_BRANCH`, suy ra bằng phép loại trừ chéo trên
chính 6 GM, không liên quan gì tới nguồn Nguyên Cát). Việc 2 con đường suy luận độc lập (loại trừ chéo
GM, và test trực tiếp bảng giá trị Nguyên Cát) cùng ra 1 kết luận là bằng chứng rất mạnh.

**Phân loại: đây không khớp gọn vào A/B/C/D vì không phải "giá trị mâu thuẫn" mà là "chỉ dẫn khóa tra
bảng của source tự mâu thuẫn với chính bảng giá trị của nó khi kiểm bằng GM"** — tạm gọi là **C* (source
tự mâu thuẫn, phát hiện mới)**. Bảng GIÁ TRỊ được coi là có bằng chứng rất mạnh (6/6 GM); chỉ dẫn "tra
theo Chi Mệnh" của source bị bác bỏ bởi chính dữ liệu GM mà source lẽ ra phải khớp.

### Bảng Mệnh Chủ đầy đủ 12 Chi (đối chiếu, key = Chi NĂM SINH theo bằng chứng, không theo lời source)

| Chi năm sinh | Chủ Mệnh (theo bảng giá trị Nguyên Cát) | Trạng thái |
|---|---|---|
| Tý | Tham Lang | CANDIDATE (chưa có GM năm Tý) |
| Sửu | Cự Môn | **VERIFIED 2 GM** (GM-004, GM-005) |
| Dần | Lộc Tồn | CANDIDATE (chưa có GM năm Dần) |
| Mão | Văn Khúc | CANDIDATE (chưa có GM năm Mão) |
| Thìn | Liêm Trinh | CANDIDATE (chưa có GM năm Thìn) |
| Tỵ | Vũ Khúc | **VERIFIED 1 GM** (GM-006) |
| Ngọ | Phá Quân | **VERIFIED 1 GM** (GM-003) |
| Mùi | Vũ Khúc | CANDIDATE (chưa có GM năm Mùi) |
| Thân | Liêm Trinh | **VERIFIED 2 GM** (GM-001, GM-002) |
| Dậu | Văn Khúc | CANDIDATE (chưa có GM năm Dậu) |
| Tuất | Lộc Tồn | CANDIDATE (chưa có GM năm Tuất) |
| Hợi | Cự Môn | CANDIDATE (chưa có GM năm Hợi) |

4/12 VERIFIED (trùng khít với `docs/TUVI_STATUS_TABLE_REQUIREMENTS.md` mục 2 — cùng giá trị, cùng GM).
8/12 còn lại: CANDIDATE (có nguồn trích dẫn, nhưng chưa có GM xác nhận) — không nâng lên VERIFIED chỉ vì
4 điểm kia khớp.

---

## 4. THÂN CHỦ

Source (mục 6): *"Thân Chủ is determined from the branch of the birth year"* — khóa này **KHÔNG mâu
thuẫn** với bằng chứng (khác với Mệnh Chủ ở mục 3).

| Chi năm sinh | Chủ Thân (source) | Đối chiếu GM |
|---|---|---|
| Tý | Hỏa Tinh | CANDIDATE, chưa có GM năm Tý |
| Sửu | Thiên Tướng | **VERIFIED 2 GM** (GM-004, GM-005) — khớp |
| Dần | Thiên Lương | CANDIDATE |
| Mão | Thiên Đồng | CANDIDATE |
| Thìn | Văn Xương | CANDIDATE |
| Tỵ | Thiên Cơ | **VERIFIED 1 GM** (GM-006) — khớp |
| Ngọ | Hỏa Tinh | **VERIFIED 1 GM** (GM-003) — khớp |
| Mùi | Thiên Tướng | CANDIDATE |
| Thân | Thiên Lương | **VERIFIED 2 GM** (GM-001, GM-002) — khớp |
| Dậu | Thiên Đồng | CANDIDATE |
| Tuất | Văn Xương | CANDIDATE |
| Hợi | Thiên Cơ | CANDIDATE |

**4/4 điểm có dữ liệu GM đều khớp — không có mâu thuẫn nào cần phân loại A/B/C/D ở đây.**

### Giải quyết mâu thuẫn "Tý/Ngọ presentation" mà source tự khai báo (mục 6)

Source tự hỏi: trình bày khác trong cùng nguồn có thể cho Tý/Ngọ khác "Hỏa Tinh" hay không
(`THAN_CHU_TY_NGO = NEED_FINAL_SOURCE_LOCK`).

- **Ngọ: ĐÃ GIẢI QUYẾT.** GM-003 (năm Canh Ngọ) xác nhận Chủ Thân = Hỏa Tinh, khớp đúng giá trị "Ngọ →
  Hỏa Tinh" trong bảng. → Phân loại: **B/A hòa quyện thành xác nhận thật** — không còn là "candidate",
  nâng lên VERIFIED.
- **Tý: CHƯA GIẢI QUYẾT.** Không có GM năm Tý. → Vẫn `NEED_GOLDEN_MASTER_REVIEW`, dù bảng vẫn ghi
  "Hỏa Tinh" như 1 candidate hợp lý (đối xứng với Ngọ, đúng kiểu vòng Thân Chủ 2 điểm/6 cặp thường thấy
  trong Tử Vi — nhưng đây là suy luận theo cấu trúc, KHÔNG phải bằng chứng GM, không được nâng cấp lên
  VERIFIED chỉ vì đối xứng).

---

## 5. 4 TRANSCRIPTION CONFLICTS TRƯỚC ĐÓ — GIỮ NGUYÊN, KHÔNG THUỘC PHẠM VI SOURCE MỚI

`TuVi_Profile_NguyenCat_V1.md` chỉ cung cấp bảng status/Chủ Mệnh/Chủ Thân/Khôi Việt — không đề cập vị trí
sao hay Tuần Không, nên KHÔNG giúp giải quyết 4 xung đột vị trí đã ghi ở `docs/TUVI_RULE_FORENSICS.md`
phần C (GM-003 Thiên Lương, GM-005 Tham Lang/Thất Sát, GM-006 Vũ Khúc/Phá Quân, GM-006 Tuần Không). Giữ
nguyên trạng thái NEED_GOLDEN_MASTER_REVIEW cho cả 4, không tự chọn bên nào.

---

## 6. TỔNG HỢP B/C CẦN QUYẾT ĐỊNH TRƯỚC KHI SỬA CODE

Theo đúng yêu cầu *"Do not edit `src/lib/tu-vi/` until every B/C item has a decision"*:

| Item | Loại | Trạng thái quyết định |
|---|---|---|
| Thiên Lương @ Mùi (Vượng hay Đắc) | **C** | **CHƯA QUYẾT ĐỊNH** — không có GM nào chạm Mùi |
| Mệnh Chủ: khóa tra bảng (Chi Mệnh theo lời source, hay Chi năm theo bằng chứng 6/6 GM) | **C\*** | **CÓ BẰNG CHỨNG RÕ RÀNG nghiêng về Chi năm sinh (6/6)**, nhưng đây vẫn là quyết định thay đổi kiến trúc rule, cần người dùng xác nhận trước khi đổi khóa trong code |
| 4 điểm status mismatch (Vũ Khúc@Mão, Thiên Cơ@Ngọ, Thái Âm@Dần, Thất Sát@Mùi) | **D** | Không phải B/C nên không chặn — nhưng cũng chưa đủ căn cứ để implement, giữ nguyên trạng thái chưa xác nhận |
| 4 transcription conflict vị trí (mục 5) | ngoài phạm vi | Giữ nguyên NEED_GOLDEN_MASTER_REVIEW, không liên quan source mới |

**Chưa có mục B/C nào được đóng hoàn toàn** (Thiên Lương@Mùi vẫn C treo; khóa Mệnh Chủ tuy có bằng chứng
mạnh nhưng là quyết định kiến trúc, chưa phải "đã quyết định" theo nghĩa người dùng xác nhận cho phép
sửa). Do đó **KHÔNG được sửa `src/lib/tu-vi/` ở bước này** — đúng theo yêu cầu, và em cũng chưa sửa gì.

---

## KẾT LUẬN NGẮN GỌN

- Bảng status Nguyên Cát khớp GM tốt hơn hẳn bảng hiện tại (91,9% vs 43,5% trên cùng 62 điểm dữ liệu).
- Mệnh Chủ: giá trị đúng theo bằng chứng, nhưng **khóa tra bảng mà source tự công bố (Chi cung Mệnh) bị
  chính dữ liệu GM bác bỏ hoàn toàn (0/6)** — khóa đúng là Chi năm sinh (6/6). Đây là phát hiện quan
  trọng nhất của review này.
- Thân Chủ: khóa đúng như source công bố (Chi năm sinh), 4/4 điểm có dữ liệu đều khớp, giải quyết được
  1/2 mâu thuẫn Tý/Ngọ tự khai báo (Ngọ xong, Tý vẫn treo).
- Thiên Khôi/Thiên Việt: nguồn nhất quán hơn 2 bảng cũ, nhưng 0 xác nhận từ GM.
- Còn 1 mục C treo hẳn (Thiên Lương@Mùi) và 1 mục C* cần người dùng xác nhận trước khi đổi khóa Mệnh Chủ
  trong code — **chưa đủ điều kiện để sửa `src/lib/tu-vi/`.**
