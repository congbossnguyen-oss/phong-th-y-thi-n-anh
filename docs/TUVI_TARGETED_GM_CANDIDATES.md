# TUVI TARGETED GM CANDIDATES — Phase 10

Mục tiêu duy nhất: tìm input ngày/giờ sinh có thể dùng để tìm ảnh lá số thật (từ sách/phần mềm) nhằm bổ
sung Golden Master cho các ô status còn UNRESOLVED. **Không sửa engine, không đổi calculation, không đổi
status table.** Toàn bộ candidate dưới đây tính bằng cách gọi trực tiếp `tinhTuVi()` hiện có (black-box,
không sửa gì) trên 1 script tìm kiếm độc lập, không nằm trong `src/lib/tu-vi/`.

**Các input dưới đây gọi là `TARGETED GM CANDIDATE` — TUYỆT ĐỐI KHÔNG phải Golden Master.** Chúng chỉ xác
nhận: "nếu có 1 người thật sinh vào ngày giờ này, sao mục tiêu sẽ rơi đúng cung cần kiểm tra" — KHÔNG nói
gì về trạng thái Miếu/Vượng/Đắc/Bình/Hãm thật sự tại đó. Cột "Trạng thái cần xác minh" luôn để trống, chờ
đối chiếu với ảnh/sách nguồn.

Phương pháp tìm: brute-force qua các ngày 5/15/25 tháng 6 Dương lịch (giữa năm, tránh nhiễu ranh giới năm
Âm lịch tháng 1-2), 12 giờ đại diện đủ 12 Chi, trải qua nhiều thập niên 1955-2025, giới tính Nam (giới
tính không ảnh hưởng vị trí chính tinh). Dừng ở tối đa 3 candidate/target, mỗi candidate 1 năm khác nhau.

---

## TARGET 1 — Vũ Khúc @ Mão

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân | Star | Branch |
|---|---|---|---|---|---|---|---|---|
| 1 | 25/06/1955 (Dương) | 05:00 (giờ Mão) | 6/5/1955 | Ất Mùi | Mão | Dậu | Vũ Khúc | Mão |
| 2 | 05/06/1956 (Dương) | 19:00 (giờ Tuất) | 27/4/1956 | Bính Thân | Mùi | Mão | Vũ Khúc | Mão |
| 3 | 05/06/1957 (Dương) | 01:00 (giờ Sửu) | 8/5/1957 | Đinh Dậu | Tỵ | Mùi | Vũ Khúc | Mão |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate.

---

## TARGET 2 — Thiên Cơ @ Ngọ

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân | Star | Branch |
|---|---|---|---|---|---|---|---|---|
| 1 | 25/06/1955 (Dương) | 05:00 (giờ Mão) | 6/5/1955 | Ất Mùi | Mão | Dậu | Thiên Cơ | Ngọ |
| 2 | 05/06/1956 (Dương) | 19:00 (giờ Tuất) | 27/4/1956 | Bính Thân | Mùi | Mão | Thiên Cơ | Ngọ |
| 3 | 05/06/1957 (Dương) | 01:00 (giờ Sửu) | 8/5/1957 | Đinh Dậu | Tỵ | Mùi | Thiên Cơ | Ngọ |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate. (Trùng ngày giờ với Target 1 vì Vũ Khúc@Mão và Thiên Cơ@Ngọ
cùng thuộc Vòng Tử Vi, cùng 1 vị trí Tử Vi sẽ kéo theo cả 2 sao rơi đúng chỗ đồng thời — không phải lỗi
trùng lặp, mà là hệ quả đúng của công thức offset cố định.)

---

## TARGET 3 — Thái Âm @ Dần

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân | Star | Branch |
|---|---|---|---|---|---|---|---|---|
| 1 | 25/06/1955 (Dương) | 23:00 (giờ Tý) | 6/5/1955 | Ất Mùi | Ngọ | Ngọ | Thái Âm | Dần |
| 2 | 05/06/1956 (Dương) | 15:00 (giờ Thân) | 27/4/1956 | Bính Thân | Dậu | Sửu | Thái Âm | Dần |
| 3 | 05/06/1957 (Dương) | 05:00 (giờ Mão) | 8/5/1957 | Đinh Dậu | Mão | Dậu | Thái Âm | Dần |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate.

---

## TARGET 4 — Thất Sát @ Mùi

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân | Star | Branch |
|---|---|---|---|---|---|---|---|---|
| 1 | 25/06/1955 (Dương) | 23:00 (giờ Tý) | 6/5/1955 | Ất Mùi | Ngọ | Ngọ | Thất Sát | Mùi |
| 2 | 05/06/1956 (Dương) | 15:00 (giờ Thân) | 27/4/1956 | Bính Thân | Dậu | Sửu | Thất Sát | Mùi |
| 3 | 05/06/1957 (Dương) | 05:00 (giờ Mão) | 8/5/1957 | Đinh Dậu | Mão | Dậu | Thất Sát | Mùi |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate. (Trùng ngày giờ với Target 3 — cùng lý do vòng sao như Target
1/2: Thái Âm và Thất Sát cùng thuộc Vòng Thiên Phủ.)

---

## TARGET 5 — Thiên Lương @ Mùi

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân | Star | Branch |
|---|---|---|---|---|---|---|---|---|
| 1 | 25/06/1955 (Dương) | 09:00 (giờ Tỵ) | 6/5/1955 | Ất Mùi | Sửu | Hợi | Thiên Lương | Mùi |
| 2 | 05/06/1956 (Dương) | 23:00 (giờ Tý) | 27/4/1956 | Bính Thân | Tỵ | Tỵ | Thiên Lương | Mùi |
| 3 | 25/06/1958 (Dương) | 01:00 (giờ Sửu) | 9/5/1958 | Mậu Tuất | Tỵ | Mùi | Thiên Lương | Mùi |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate. Lưu ý riêng: đây cũng chính là ô Thiên Lương mà nguồn Nguyên
Cát tự khai báo CONFLICTED (Vượng/Đắc) — nếu tìm được ảnh thật cho 1 trong 3 candidate này, sẽ giải quyết
luôn cả mâu thuẫn nội bộ nguồn lẫn ô UNRESOLVED hiện tại.

---

## TARGET 6 — Thân Chủ @ Tý

Không cần tìm sao — chỉ cần Chi năm sinh = Tý (bất kỳ ngày giờ nào trong năm đó).

| # | Candidate birth date | Candidate birth time | Lunar date | Year Can Chi | Mệnh | Thân |
|---|---|---|---|---|---|---|
| 1 | 05/06/1960 (Dương) | 23:00 (giờ Tý) | 12/5/1960 | Canh Tý | Ngọ | Ngọ |
| 2 | 05/06/1972 (Dương) | 23:00 (giờ Tý) | 24/4/1972 | Nhâm Tý | Tỵ | Tỵ |
| 3 | 05/06/1984 (Dương) | 23:00 (giờ Tý) | 7/5/1984 | Giáp Tý | Ngọ | Ngọ |

**Trạng thái**: TÌM ĐƯỢC — 3/3 candidate. Giờ sinh không quan trọng cho target này (chỉ cần đúng năm Tý)
— giờ Tý chỉ là ví dụ đại diện; bất kỳ giờ sinh nào trong năm 1960/1972/1984 (hoặc bất kỳ năm Tý nào
khác) đều cho cùng năm Can Chi.

---

## TỔNG KẾT

### Target đã tìm được candidate

Cả 6/6 target đều tìm được đủ 3 candidate — không có target nào bế tắc.

### Target chưa tìm được

Không có.

### Input nên ưu tiên xác minh bằng nguồn ảnh/sách

1. **Ưu tiên cao nhất — TARGET 5, candidate #3 (25/06/1958, giờ Sửu)**: Thiên Lương@Mùi giải quyết được
   2 vấn đề cùng lúc (ô UNRESOLVED + mâu thuẫn nội bộ nguồn Nguyên Cát Vượng/Đắc) — giá trị thông tin cao
   nhất trong cả 6 target.
2. **Ưu tiên nhì — TARGET 1/2, candidate #1 (25/06/1955, giờ Mão)**: giải quyết ĐỒNG THỜI cả Vũ Khúc@Mão
   và Thiên Cơ@Ngọ trong 1 lá số duy nhất (do cùng Vòng Tử Vi) — tìm 1 ảnh xác nhận được 2 ô cùng lúc.
3. **Ưu tiên ba — TARGET 3/4, candidate #1 (25/06/1955, giờ Tý)**: tương tự, giải quyết đồng thời Thái
   Âm@Dần và Thất Sát@Mùi (cùng Vòng Thiên Phủ) trong 1 lá số.
4. **TARGET 6** có độ ưu tiên thấp hơn (không phải status table, chỉ là 1 ô Thân Chủ) — bất kỳ người quen
   nào sinh năm Tý (1960, 1972, 1984, 1996, 2008...) đều dùng được, dễ tìm hơn nhiều so với 5 target còn
   lại vì không cần khớp giờ sinh chính xác.

**Lưu ý quan trọng**: tất cả candidate ở Target 1-5 đều rơi vào các năm 1955-1958 vì đây là kết quả ĐẦU
TIÊN script tìm thấy khi quét tuần tự từ năm 1955 — KHÔNG có nghĩa đây là năm sinh duy nhất khả dĩ. Không
sinh gian truân để tìm — nếu người dùng có sẵn 1 người quen/ảnh lá số ở năm sinh khác mà rơi đúng target,
vẫn dùng được, chỉ cần chạy lại script tìm kiếm (không phải engine) với năm mong muốn.
