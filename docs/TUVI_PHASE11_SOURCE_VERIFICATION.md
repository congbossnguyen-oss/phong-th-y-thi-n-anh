# TUVI PHASE 11 — SOURCE VERIFICATION PREPARATION

Chuẩn bị dữ liệu để người dùng (hoặc bên thứ ba) xác minh độc lập 6 mục UNRESOLVED, dùng candidate đã tìm
ở Phase 10. **Không sửa `src/lib/tu-vi/`, không sửa Golden Master Pack, không sửa status table, không tạo
Golden Master mới, không commit/push.** File này chỉ tổ chức lại dữ liệu đã có + nêu rõ cần tìm gì.

---

## TARGET A — Thiên Lương @ Mùi

### 1. Candidate input
Dương lịch **25/06/1958**, giờ **Sửu (01:00)**, Nam.

### 2. Vì sao candidate chạm đúng target
- Âm lịch: 9/5/1958. Cục: Thổ Ngũ Cục (số 5).
- An Tử Vi: ngày Âm 9, Cục 5 → thương=1, dư=4 (≠0) → bù=5-4=1 (lẻ) → offset = thương - bù = 1-1 = 0 →
  Tử Vi tại Dần (offset 0 từ Dần).
- Vì Tử Vi rơi đúng Dần, đây là 1 trong 2 điểm đặc biệt Tử Vi/Thiên Phủ ĐỒNG CUNG (điểm còn lại là
  Thân) — Thiên Phủ cũng tại Dần.
- Thiên Lương thuộc Vòng Thiên Phủ, offset +5 (thuận): Dần + 5 = Mùi. → Thiên Lương rơi đúng Mùi.

### 3. Giá trị engine hiện tại
`"Chưa xác định"` (khóa cố tình ở Phase 8, không chọn A/B).

### 4. Giá trị source cần xác minh
`TuVi_Profile_NguyenCat_V1.md` §3.12 tự khai báo CONFLICTED giữa 2 trình bày:
- Trình bày 1: Thiên Lương @ Mùi = **Vượng**.
- Trình bày 2: Thiên Lương @ Mùi = **Đắc**.

### 5. Nguồn độc lập cần tìm
- Ưu tiên: 1 trong các bài viết gốc "Học Viện Lý Số" về sao Thiên Lương (cùng họ nguồn đã dùng cho
  `TuVi_Profile_NguyenCat_V1.md`, để không trộn trường phái) — đọc trực tiếp bảng Miếu/Vượng/Đắc/Hãm đầy
  đủ của Thiên Lương, không suy ra từ 2 trích dẫn rời rạc đã có.
- Thay thế: phần mềm lập lá số Tử Vi Nam Phái phổ biến (VD tuvi.vn, tuvingaynay.com, lasotuvi.vn...) —
  nhập đúng 25/06/1958, 01:00, Nam, đọc trực tiếp nhãn hiển thị tại cung có Thiên Lương (cung Nô Bộc,
  Chi Mùi theo lá số này).
- Đối chiếu đặc biệt: nếu nguồn tìm được cũng cho Thiên Lương @ Sửu (không phải mục tiêu chính, chỉ để
  kiểm tra tính nhất quán nội bộ nguồn đó) thì phải so với giá trị đã khóa **Thiên Lương @ Sửu = Đắc**
  (xác nhận qua GM-005) — nếu nguồn mới cho Sửu ra khác Đắc, nguồn đó không đáng tin cho toàn bộ sao này.

### 6. Không tự kết luận status
Không chọn Vượng hay Đắc ở bước này — chỉ ghi nhận cần tìm.

---

## TARGET B — Vũ Khúc @ Mão + Thiên Cơ @ Ngọ

### 1. Candidate input
Dương lịch **25/06/1955**, giờ **Mão (05:00)**, Nam.

### 2. Vì sao candidate chạm đúng target
- Âm lịch: 6/5/1955. Cục: Thổ Ngũ Cục (số 5).
- An Tử Vi: ngày Âm 6, Cục 5 → thương=1, dư=1 (≠0) → bù=5-1=4 (chẵn) → offset = thương + bù = 1+4 = 5 →
  Tử Vi tại Mùi (Dần + 5 = Mùi).
- Vũ Khúc thuộc Vòng Tử Vi, offset -4 (nghịch): Mùi - 4 = Mão. → Vũ Khúc rơi đúng Mão.
- Thiên Cơ thuộc Vòng Tử Vi, offset -1 (nghịch): Mùi - 1 = Ngọ. → Thiên Cơ rơi đúng Ngọ.
- Cả 2 sao cùng chạm target trong 1 lá số vì cùng thuộc 1 vòng sao (Vòng Tử Vi), vị trí Tử Vi quyết định
  đồng thời cả 2.

### 3. Giá trị engine hiện tại
Vũ Khúc @ Mão = `"Chưa xác định"`. Thiên Cơ @ Ngọ = `"Chưa xác định"`.

### 4. Giá trị source cần xác minh
- Vũ Khúc @ Mão: Golden Master GM-003 ghi **Miếu**; nguồn Nguyên Cát (`TuVi_Profile_NguyenCat_V1.md`
  §3.4) ghi **Đắc**.
- Thiên Cơ @ Ngọ: GM-003 ghi **Bình**; nguồn Nguyên Cát (§3.2) ghi **Đắc**.

### 5. Nguồn độc lập cần tìm
- Ưu tiên: bài viết gốc Học Viện Lý Số về Vũ Khúc ("Đại cương về Sao Vũ Khúc") và Thiên Cơ (không rõ tên
  bài cụ thể trong trích dẫn đã có) — đọc trực tiếp, không suy diễn từ bảng đã trích.
- Thay thế: phần mềm lập lá số Tử Vi, nhập 25/06/1955, 05:00, Nam, đọc nhãn tại cung chứa Vũ Khúc (Chi
  Mão) và cung chứa Thiên Cơ (Chi Ngọ).
- Nếu tìm được ảnh/lá số gốc mà GM-003 (Nam Canh Ngọ 1990) được trích từ đó — đối chiếu lại trực tiếp ảnh
  gốc của chính GM-003 trước, vì đây là cách xác minh trực tiếp nhất (không cần candidate mới) nếu ảnh
  gốc vẫn còn.

### 6. Không tự kết luận status
Không chọn Miếu/Bình (theo GM-003) hay Đắc (theo Nguyên Cát) — chỉ ghi nhận cần tìm.

---

## TARGET C — Thái Âm @ Dần + Thất Sát @ Mùi

### 1. Candidate input
Dương lịch **25/06/1955**, giờ **Tý (23:00)**, Nam.

### 2. Vì sao candidate chạm đúng target
- Âm lịch: 6/5/1955 (cùng ngày Âm với Target B, khác giờ sinh nên Mệnh cung khác → Cục khác).
- Cục: Mộc Tam Cục (số 3).
- An Tử Vi: ngày Âm 6, Cục 3 → thương=2, dư=0 → offset = thương - 1 = 1 → Tử Vi tại Mão (Dần + 1 = Mão).
- Thiên Phủ = 4 - Mão(3) = Sửu(1).
- Thái Âm thuộc Vòng Thiên Phủ, offset +1: Sửu + 1 = Dần. → Thái Âm rơi đúng Dần.
- Thất Sát thuộc Vòng Thiên Phủ, offset +6: Sửu + 6 = Mùi. → Thất Sát rơi đúng Mùi.
- Cùng lý do như Target B: 2 sao cùng vòng (Thiên Phủ), 1 lá số chạm cả 2 target.

### 3. Giá trị engine hiện tại
Thái Âm @ Dần = `"Chưa xác định"`. Thất Sát @ Mùi = `"Chưa xác định"`.

### 4. Giá trị source cần xác minh
- Thái Âm @ Dần: Golden Master GM-006 ghi **Miếu**; nguồn Nguyên Cát (§3.8) ghi **Hãm**.
- Thất Sát @ Mùi: GM-006 ghi **Bình**; nguồn Nguyên Cát (§3.13) ghi **Đắc**.

### 5. Nguồn độc lập cần tìm
- Ưu tiên: bài viết gốc Học Viện Lý Số "Tìm hiểu về Sao Thái Âm" và "Sao Thất Sát trong Tử Vi" — đọc
  trực tiếp bảng đầy đủ, không suy diễn.
- Thay thế: phần mềm lập lá số, nhập 25/06/1955, 23:00, Nam, đọc nhãn tại cung chứa Thái Âm (Chi Dần) và
  cung chứa Thất Sát (Chi Mùi).
- Nếu tìm được ảnh gốc của chính GM-006 (Nam, sinh 04/02/2026 theo Dương lịch nhưng Âm lịch 17/12/2025) —
  đối chiếu trực tiếp ảnh đó trước tiên, tương tự gợi ý ở Target B.

### 6. Không tự kết luận status
Không chọn Miếu/Bình (theo GM-006) hay Hãm/Đắc (theo Nguyên Cát) — chỉ ghi nhận cần tìm.

---

## TARGET D — Thân Chủ @ Tý

### 1. Candidate input
Không cần giờ sinh cụ thể — chỉ cần **năm sinh có Chi Tý** (ví dụ: 1960 Canh Tý, 1972 Nhâm Tý, 1984 Giáp
Tý, 1996 Bính Tý, 2008 Mậu Tý, 2020 Canh Tý...).

### 2. Vì sao candidate chạm đúng target
Thân Chủ tra theo Chi NĂM SINH (đã khóa ở Phase 8, `THAN_CHU_INPUT = YEAR_BRANCH`) — bất kỳ năm nào có
Chi năm sinh = Tý đều chạm đúng target này, không phụ thuộc ngày/giờ/tháng sinh.

### 3. Giá trị engine hiện tại
`"NEED_GOLDEN_MASTER_REVIEW"` (cố tình không suy diễn theo đối xứng với Ngọ dù nguồn gợi ý — xem
`docs/TUVI_ENGINE_PHASE8_REPORT.md` mục A2).

### 4. Giá trị source cần xác minh
`TuVi_Profile_NguyenCat_V1.md` §6 đưa candidate value **Hỏa Tinh** cho Tý (đối xứng với Ngọ → Hỏa Tinh,
đã VERIFIED qua GM-003), nhưng chính nguồn tự cảnh báo: *"another presentation... must be checked against
the chosen source before implementation"* — chưa chắc chắn.

### 5. Nguồn độc lập cần tìm
- Ưu tiên: bài viết gốc Học Viện Lý Số "Bàn về Mệnh Chủ – Thân Chủ trong Tử Vi Đẩu Số" (đúng bài đã trích
  §5/§6 của profile) — đọc lại nguyên văn bảng Thân Chủ đầy đủ 12 Chi, xác nhận giá trị tại Tý viết là gì
  (không suy đối xứng).
- Thay thế: bất kỳ người quen/khách hàng nào sinh năm Tý (không cần giờ sinh chính xác) có lá số Tử Vi đã
  lập sẵn ghi rõ "Thân Chủ" — đọc trực tiếp.

### 6. Không tự kết luận status
Không tự nhận "Hỏa Tinh" là đúng dù nguồn gợi ý đối xứng — chỉ ghi nhận cần tìm nguồn xác nhận trực tiếp.

---

## GHI CHÚ CHUNG

- Toàn bộ giá trị "cần xác minh" ở mục 4 của mỗi target liệt kê ĐÚNG các phương án đang tồn tại trong dữ
  liệu hiện có (Golden Master Pack hoặc nguồn Nguyên Cát) — không thêm phương án mới, không suy đoán
  phương án thứ 3.
- Không có target nào trong Phase 11 được kết luận Miếu/Vượng/Đắc/Bình/Hãm — nhiệm vụ của phase này chỉ
  là chuẩn bị, không phải xác minh (việc xác minh cần nguồn bên ngoài mà hệ thống này không tự có).
- Sau khi có nguồn độc lập cho bất kỳ target nào, bước tiếp theo (ngoài phạm vi Phase 11) sẽ là tạo Golden
  Master thật (không phải "candidate" nữa) và chạy lại quy trình đối chiếu như GM-001 → GM-006, theo đúng
  nguyên tắc đã dùng xuyên suốt — không sửa engine/status table chỉ để khớp 1 nguồn mới.
