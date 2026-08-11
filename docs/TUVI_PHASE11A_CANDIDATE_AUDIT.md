# TUVI PHASE 11A — TARGET CANDIDATE INPUT AUDIT

Audit lại 3 candidate input đã chọn ở Phase 10/11 (Target A, B, C — B và C mỗi candidate chạm 2 sao mục
tiêu cùng lúc nên tổng cộng 5 lượt xác nhận sao/Chi). Chạy trực tiếp `tinhTuVi()` (không sửa) + `tinhBatTu()`
(module `src/lib/bat-tu.ts` có sẵn, không sửa, dùng để lấy Can Chi ngày/tháng — engine Tử Vi hiện không tự
xuất 2 trụ này). **Không sửa engine, không sửa Golden Master, không sửa status table, không commit/push.**

Không có candidate nào bị đổi để ép Target pass — toàn bộ input dưới đây giữ nguyên đúng như đã chọn ở
Phase 10/11.

---

## TARGET A candidate — Thiên Lương @ Mùi

**Loại lịch nhập vào**: DƯƠNG LỊCH.

| | Giá trị |
|---|---|
| DL | 1958-06-25 |
| AL | 1958-05-09 (không nhuận) |
| Can Chi ngày | Quý Dậu |
| Can Chi tháng | Mậu Ngọ |
| Can Chi năm | Mậu Tuất |
| Giờ | Sửu (01:00) |
| Cục | Thổ Ngũ Cục |
| Mệnh | Tỵ |
| Thân | Mùi |

### Dump vị trí 5 sao (chạy `tinhTuVi()` trực tiếp)

| Sao | Vị trí (Chi) | Trạng thái hiện tại |
|---|---|---|
| Vũ Khúc | Tuất | Miếu |
| Thiên Cơ | Sửu | Đắc |
| Thái Âm | Mão | Hãm |
| Thất Sát | Thân | Miếu |
| **Thiên Lương** | **Mùi** | **Chưa xác định** |

### Đối chiếu Target A: Thiên Lương @ Mùi

Thiên Lương thực sự rơi tại **Mùi** — khớp đúng Target A.

```
VALID_CANDIDATE
```

---

## TARGET B candidate — Vũ Khúc @ Mão + Thiên Cơ @ Ngọ

**Loại lịch nhập vào**: DƯƠNG LỊCH.

| | Giá trị |
|---|---|
| DL | 1955-06-25 |
| AL | 1955-05-06 (không nhuận) |
| Can Chi ngày | Đinh Tỵ |
| Can Chi tháng | Nhâm Ngọ |
| Can Chi năm | Ất Mùi |
| Giờ | Mão (05:00) |
| Cục | Thổ Ngũ Cục |
| Mệnh | Mão |
| Thân | Dậu |

### Dump vị trí 5 sao

| Sao | Vị trí (Chi) | Trạng thái hiện tại |
|---|---|---|
| **Vũ Khúc** | **Mão** | **Chưa xác định** |
| **Thiên Cơ** | **Ngọ** | **Chưa xác định** |
| Thái Âm | Tuất | Miếu |
| Thất Sát | Mão | Hãm |
| Thiên Lương | Dần | Vượng |

### Đối chiếu Target B: Vũ Khúc @ Mão + Thiên Cơ @ Ngọ

Vũ Khúc thực sự rơi tại **Mão** — khớp. Thiên Cơ thực sự rơi tại **Ngọ** — khớp. Cả 2 sao cùng chạm đúng
trong 1 lá số.

```
VALID_CANDIDATE
```

---

## TARGET C candidate — Thái Âm @ Dần + Thất Sát @ Mùi

**Loại lịch nhập vào**: DƯƠNG LỊCH.

| | Giá trị |
|---|---|
| DL | 1955-06-25 |
| AL | 1955-05-06 (không nhuận — cùng ngày Âm với Target B, khác giờ sinh) |
| Can Chi ngày | Mậu Ngọ |
| Can Chi tháng | Nhâm Ngọ |
| Can Chi năm | Ất Mùi |
| Giờ | Tý (23:00) |
| Cục | Mộc Tam Cục (khác Target B vì giờ sinh khác → Mệnh cung khác → Cục khác) |
| Mệnh | Ngọ |
| Thân | Ngọ |

### Dump vị trí 5 sao

| Sao | Vị trí (Chi) | Trạng thái hiện tại |
|---|---|---|
| Vũ Khúc | Hợi | Hãm |
| Thiên Cơ | Dần | Hãm |
| **Thái Âm** | **Dần** | **Chưa xác định** |
| **Thất Sát** | **Mùi** | **Chưa xác định** |
| Thiên Lương | Ngọ | Miếu |

### Đối chiếu Target C: Thái Âm @ Dần + Thất Sát @ Mùi

Thái Âm thực sự rơi tại **Dần** — khớp. Thất Sát thực sự rơi tại **Mùi** — khớp. Cả 2 sao cùng chạm đúng
trong 1 lá số.

```
VALID_CANDIDATE
```

---

## GHI CHÚ

- Can Chi ngày ở Target B (Đinh Tỵ, giờ Mão 05:00) và Target C (Mậu Ngọ, giờ Tý 23:00) khác nhau dù cùng
  1 ngày Dương lịch (25/06/1955) — đúng quy tắc lịch Việt Nam: giờ Tý (23:00-00:59) thuộc "ngày hôm sau"
  theo Can Chi ngày truyền thống, nên trụ Ngày đổi từ Đinh Tỵ (ứng với 25/6) sang Mậu Ngọ (ứng với 26/6)
  khi giờ sinh là 23:00 cùng ngày 25/6. Đây là hành vi ĐÚNG của `tinhBatTu()` (đã kiểm chứng độc lập ở
  module Bát Tự trước đây), không phải bất thường của candidate.
- Cả 5 lượt xác nhận sao/Chi (1 ở Target A, 2 ở Target B, 2 ở Target C) đều khớp đúng dự kiến — không có
  `INVALID_CANDIDATE` nào phát hiện được.
- Dữ liệu "bonus" (vị trí Vũ Khúc/Thiên Cơ/Thái Âm/Thất Sát/Thiên Lương ở các candidate KHÔNG phải mục
  tiêu chính của candidate đó, ví dụ Vũ Khúc@Tuất ở Target A) không chạm ô UNRESOLVED nào khác ngoài 5 ô
  đã biết, nên không có phát hiện phụ nào cần ghi nhận thêm.

## KẾT LUẬN

Cả 3 candidate (Target A, B, C) đều **VALID_CANDIDATE** — thực sự tạo ra đúng vị trí sao mục tiêu như đã
báo cáo ở Phase 10/11, không có candidate nào cần loại bỏ hay thay thế.
