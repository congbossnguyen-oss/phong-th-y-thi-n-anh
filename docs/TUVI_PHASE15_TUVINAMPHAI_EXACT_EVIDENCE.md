# TUVI PHASE 15 — TUVINAMPHAI.VN EXACT CANDIDATE VERIFICATION

Đã đọc trực tiếp 3 ảnh lá số thật từ tuvinamphai.vn do người dùng đính kèm. **Không sửa
`src/lib/tu-vi/`, không sửa status table, không sửa Golden Master Pack, không commit/push.**

Ghi nhận rõ theo đúng yêu cầu: đây là **SOURCE IMPLEMENTATION EVIDENCE** của website tuvinamphai.vn
(1 phần mềm/website lập lá số độc lập, tự xưng "Nam Phái") — **KHÔNG phải Golden Master gốc của engine**
(khác hẳn GM-001→006 vốn được coi là Golden Master chính thức để test). Theo phân loại nguồn ở Phase 13,
đây xếp **Level 3 (Phần mềm lập lá số độc lập)**.

---

## XÁC NHẬN CANDIDATE ĐÚNG NHƯ ĐÃ CHỌN (đối chiếu ảnh với header từng lá số)

| Ảnh | Header trên ảnh | Khớp candidate đã chọn ở Phase 10/11? |
|---|---|---|
| Ảnh 1 (GM-SOURCE-A) | Năm 1958 Mậu Tuất, Tháng 6 Mậu Ngọ, Ngày 25 Quý Dậu, Giờ 1:00 (Sửu), Dương Nam, Cục Thổ Ngũ | ✅ Khớp 25/06/1958, giờ Sửu — VÀ khớp cả Mệnh=Tỵ/Thân=Mùi mà engine đã tự tính trước đó (Phase 11A) |
| Ảnh 2 (GM-SOURCE-B) | Năm 1955 Ất Mùi, Tháng 6 Nhâm Ngọ, Ngày 25 Đinh Tỵ, Giờ 6:00 (Mão), Âm Nam, Cục Thổ Ngũ | ✅ Khớp 25/06/1955, giờ Mão — khớp Can Chi ngày/tháng/năm engine đã tính (Đinh Tỵ/Nhâm Ngọ/Ất Mùi) |
| Ảnh 3 (GM-SOURCE-C) | Năm 1955 Ất Mùi, Tháng 6 Nhâm Ngọ, Ngày 25 Đinh Tỵ, Giờ 0:00 (Tý), Âm Nam, Cục Mộc Tam | ✅ Khớp 25/06/1955, giờ Tý, Cục Mộc Tam Cục đúng như engine tính |

**Phát hiện phụ (ghi nhận, không phải 1 trong 5 target)**: Ảnh 3 (giờ Tý) ghi Can Chi ngày = **Đinh Tỵ**
giống hệt Ảnh 2 (giờ Mão), trong khi engine hiện tại (`src/lib/bat-tu.ts`) tính Can Chi ngày cho giờ Tý
23:00-00:59 theo quy ước "đổi sang trụ Ngày hôm sau" → sẽ ra **Mậu Ngọ**, khác Đinh Tỵ. Đây là chỉ dấu
tuvinamphai.vn dùng quy ước `dayBoundary: MIDNIGHT` (đổi ngày lúc 0h) thay vì `ZI_HOUR` (đổi ngày lúc
23h) mà `TuVi_Engine_V2.md` §4.3 có nhắc tới như 1 tùy chọn cấu hình — KHÔNG thuộc phạm vi 5 status target
của Phase 15, chỉ ghi nhận để tham khảo, không sửa gì.

---

## BẢNG XÁC NHẬN VỊ TRÍ (đối chiếu 15 lượt sao với dump engine đã có từ Phase 11A) — TOÀN BỘ KHỚP

Trước khi đọc trạng thái, xác nhận lại vị trí (Chi) từng sao trên ảnh khớp đúng dump `tinhTuVi()` đã ghi ở
Phase 11A — cả 15/15 lượt khớp 100% (không liệt kê lại chi tiết ở đây, đã có tại
`docs/TUVI_PHASE11A_CANDIDATE_AUDIT.md`). Đây là căn cứ để tin cậy việc đối chiếu tiếp theo là đúng cung.

---

## BẢNG CHÍNH — 5 TARGET

| Sao | Cung | Candidate | Giá trị trên ảnh | Evidence level |
|---|---|---|---|---|
| Vũ Khúc | Mão | GM-SOURCE-B (25/06/1955, giờ Mão) — cung MỆNH trên ảnh | **Đắc** | SOURCE_IMPLEMENTATION_EVIDENCE (tuvinamphai.vn, Level 3) |
| Thiên Cơ | Ngọ | GM-SOURCE-B (25/06/1955, giờ Mão) — cung ĐIỀN TRẠCH trên ảnh | **Đắc** | SOURCE_IMPLEMENTATION_EVIDENCE (tuvinamphai.vn, Level 3) |
| Thái Âm | Dần | GM-SOURCE-C (25/06/1955, giờ Tý) — cung TÀI BẠCH trên ảnh | **Hãm** | SOURCE_IMPLEMENTATION_EVIDENCE (tuvinamphai.vn, Level 3) |
| Thất Sát | Mùi | GM-SOURCE-C (25/06/1955, giờ Tý) — cung PHỤ MẪU trên ảnh | **Đắc** | SOURCE_IMPLEMENTATION_EVIDENCE (tuvinamphai.vn, Level 3) |
| Thiên Lương | Mùi | GM-SOURCE-A (25/06/1958, giờ Sửu) — cung PHÚC ĐỨC\<Thân\> trên ảnh | **Đắc** | SOURCE_IMPLEMENTATION_EVIDENCE (tuvinamphai.vn, Level 3) |

Cả 5/5 giá trị đọc được từ ảnh khớp đúng 100% với 5 giá trị anh đã liệt kê ở đầu yêu cầu Phase 15.

---

## ĐỐI CHIẾU RIÊNG TỪNG Ô VỚI GM-003 / GM-005 / GM-006 / TÂN BIÊN 1956 / NGUYÊN CÁT / VƯƠNG ĐÌNH CHI

### Vũ Khúc @ Mão

| Nguồn | Giá trị | Ghi chú |
|---|---|---|
| **tuvinamphai.vn (ảnh)** | **Đắc** | Level 3, vừa xác nhận |
| GM-003 (Golden Master Pack) | Miếu | Level 1, mâu thuẫn |
| Tân Biên 1956 | Chưa tự xác định được từ bản scan (xem Phase 14) | — |
| Nguyên Cát | Đắc | Khớp tuvinamphai.vn |
| Vương Đình Chi | Không có dữ liệu riêng cho ô này | — |

### Thiên Cơ @ Ngọ

| Nguồn | Giá trị | Ghi chú |
|---|---|---|
| **tuvinamphai.vn (ảnh)** | **Đắc** | Level 3, vừa xác nhận |
| GM-003 | Bình | Level 1, mâu thuẫn |
| Tân Biên 1956 | Chưa tự xác định được từ bản scan (anh cung cấp giá trị Đắc ở Phase 14, chưa tự đối chiếu) | — |
| Nguyên Cát | Đắc | Khớp tuvinamphai.vn |
| **Vương Đình Chi** | **Miếu** | **OTHER_SCHOOL/TRUNG_CHAU — không dùng để xác định baseline Nam Phái**, chỉ ghi nhận tồn tại xung đột |

Sau Phase 15: trong 3 nguồn CÙNG hệ Nam Phái có dữ liệu (tuvinamphai.vn, Nguyên Cát, và giá trị anh cung
cấp cho Tân Biên), cả 3 đều thống nhất **Đắc**. Riêng GM-003 (Bình) và Vương Đình Chi/Trung Châu (Miếu,
khác trường phái) không đồng thuận — không tự xóa hay sửa mâu thuẫn này.

### Thái Âm @ Dần

| Nguồn | Giá trị | Ghi chú |
|---|---|---|
| **tuvinamphai.vn (ảnh)** | **Hãm** | Level 3, vừa xác nhận |
| GM-006 | Miếu | Level 1, mâu thuẫn |
| Tân Biên 1956 | Chưa tự xác định được từ bản scan (anh cung cấp giá trị Hãm) | — |
| Nguyên Cát | Hãm | Khớp tuvinamphai.vn |

### Thất Sát @ Mùi

| Nguồn | Giá trị | Ghi chú |
|---|---|---|
| **tuvinamphai.vn (ảnh)** | **Đắc** | Level 3, vừa xác nhận |
| GM-006 | Bình | Level 1, mâu thuẫn |
| Tân Biên 1956 | Chưa tự xác định được từ bản scan (anh cung cấp giá trị Đắc) | — |
| Nguyên Cát | Đắc | Khớp tuvinamphai.vn |

### Thiên Lương @ Mùi

| Nguồn | Giá trị | Ghi chú |
|---|---|---|
| **tuvinamphai.vn (ảnh)** | **Đắc** | Level 3, vừa xác nhận |
| GM (GM-001→006) | Không có GM nào ghi Thiên Lương tại Mùi | Không mâu thuẫn vì không có Level 1 để so |
| **Tân Biên 1956** | **Đắc** | **ĐÃ tự xác định được trực tiếp từ bản scan gốc ở Phase 14** ("Mùi/NÔ BỘC/Thiên Lương(Đ)") — đây là ô DUY NHẤT trong 5 ô có 2 nguồn ĐỘC LẬP (sách gốc 1956 + phần mềm tuvinamphai.vn) cùng xác nhận trực tiếp, không qua trích dẫn lại |
| Nguyên Cát | CONFLICTED nội bộ (Vượng hoặc Đắc) | tuvinamphai.vn + Tân Biên nghiêng hẳn về Đắc, giúp thu hẹp 1 trong 2 phương án Nguyên Cát tự nêu |

---

## GHI CHÚ QUAN TRỌNG VỀ TRỌNG SỐ NGUỒN

Không tự động coi 3-4 nguồn cùng chiều (tuvinamphai.vn + Nguyên Cát + Tân Biên) là "đa số thắng" để ghi
đè GM Pack — theo đúng nguyên tắc "không dùng số lượng nguồn để voting" đã áp dụng xuyên suốt từ Phase 13.
Tuy nhiên, khác với Phase 12/13 (khi các nguồn phụ chỉ là bài viết lý thuyết chưa rõ độc lập với nhau),
lần này tuvinamphai.vn là **1 nguồn hoàn toàn độc lập về mặt xuất bản** (phần mềm riêng, không trích dẫn
qua lại với Nguyên Cát hay Tân Biên) — nên đây là bằng chứng có **chất lượng cao hơn** hẳn so với các
nguồn Level 4/5 đã xét ở Phase 12/13, dù vẫn dưới Level 1 (ảnh lá số gốc dùng làm GM chính thức).

Vương Đình Chi/Trung Châu tiếp tục được đánh dấu **OTHER_SCHOOL** — không gộp vào để tính đồng thuận
"trong hệ Nam Phái".

**Không có Golden Master conflict nào bị xóa hay sửa trong phase này** — GM-003 vẫn ghi Miếu/Bình, GM-006
vẫn ghi Miếu/Bình cho các ô tương ứng, y nguyên như đã ghi nhận từ trước.

---

## KẾT LUẬN

```
Vũ Khúc @ Mão = Đắc          (SOURCE_IMPLEMENTATION_EVIDENCE, khớp Nguyên Cát, mâu thuẫn GM-003)
Thiên Cơ @ Ngọ = Đắc         (SOURCE_IMPLEMENTATION_EVIDENCE, khớp Nguyên Cát, mâu thuẫn GM-003 và Vương Đình Chi)
Thái Âm @ Dần = Hãm          (SOURCE_IMPLEMENTATION_EVIDENCE, khớp Nguyên Cát, mâu thuẫn GM-006)
Thất Sát @ Mùi = Đắc         (SOURCE_IMPLEMENTATION_EVIDENCE, khớp Nguyên Cát, mâu thuẫn GM-006)
Thiên Lương @ Mùi = Đắc      (SOURCE_IMPLEMENTATION_EVIDENCE + xác nhận độc lập từ Tân Biên gốc, không có GM nào mâu thuẫn)
```

Đây là bằng chứng, không phải quyết định cập nhật engine — `status table` trong code vẫn giữ nguyên
`"Chưa xác định"` cho cả 5 ô, đúng theo yêu cầu "không sửa status table" của Phase 15. Quyết định có nâng
cấp các ô này lên giá trị cụ thể hay không thuộc về bước tiếp theo, cần anh xác nhận rõ ràng trước khi
đụng tới `src/lib/tu-vi/`.
