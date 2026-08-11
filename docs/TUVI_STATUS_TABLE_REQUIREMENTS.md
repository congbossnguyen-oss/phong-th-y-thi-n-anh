# TUVI STATUS TABLE REQUIREMENTS

Phase 7. Đây KHÔNG phải audit — đây là bảng yêu cầu/phân loại nguồn dữ liệu (source-of-truth
requirements) cho toàn bộ 168 ô Miếu/Vượng/Đắc/Bình/Hãm và 12 ô Chủ Mệnh/Chủ Thân, dùng làm căn cứ trước
khi được phép implement rule mới. Không sửa engine. Không sửa Golden Master. Không commit. Không push.

Quy tắc phân loại (áp dụng cho mọi ô):
- **VERIFIED** — có ít nhất 1 Golden Master độc lập (GM-001 → GM-006) xác nhận ĐÚNG giá trị hiện tại của
  engine tại đúng ô đó.
- **CONTRADICTED** — có ít nhất 1 Golden Master độc lập cho giá trị KHÁC với engine tại đúng ô đó.
- **UNVERIFIED** — không có Golden Master nào chạm tới ô đó (kể cả ô có sao ở vị trí đang tranh chấp —
  xem mục 3, các ô đó KHÔNG được tính VERIFIED/CONTRADICTED cho tới khi vị trí được xác nhận).

KHÔNG dùng Golden Master để suy ngược ra toàn bộ bảng nếu chỉ có 1 vài điểm — mỗi ô chỉ được gắn nhãn
dựa trên chính dữ liệu chạm tới ô đó, không suy diễn sang ô lân cận hay ô cùng sao khác Chi. KHÔNG lấy
bảng Miếu/Vượng phổ biến trên internet để thay thế hay bổ sung — 102 ô UNVERIFIED bên dưới giữ nguyên
UNVERIFIED, không tự điền.

---

## 1. BẢNG 168 Ô — 14 CHÍNH TINH × 12 ĐỊA CHI

Mỗi bảng con dưới đây là 1 sao × 12 Chi (Tý → Hợi). Cột "Hiện tại" = giá trị đang có trong
`MAIN_STAR_STATUS` (`src/lib/tu-vi/rules.ts`), không đổi. Cột "Nguồn" ghi Golden Master xác nhận (nếu có).

### Tử Vi

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Bình | UNVERIFIED | — |
| Sửu | Miếu | UNVERIFIED | — |
| Dần | Vượng | UNVERIFIED | — |
| Mão | Đắc | UNVERIFIED | — |
| Thìn | Bình | UNVERIFIED | — |
| Tỵ | Đắc | UNVERIFIED | — |
| Ngọ | Miếu | **VERIFIED** | GM-004 |
| Mùi | Bình | **CONTRADICTED** | GM-003 (ghi Đắc) |
| Thân | Vượng | **CONTRADICTED** | GM-005 (ghi Miếu) |
| Dậu | Đắc | UNVERIFIED | — |
| Tuất | Vượng | UNVERIFIED | GM-001/002 có Tử Vi tại Tuất nhưng KHÔNG ghi trạng thái (spec để trống) |
| Hợi | Bình | UNVERIFIED | — |

### Thiên Cơ

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Bình | UNVERIFIED | — |
| Sửu | Hãm | UNVERIFIED | — |
| Dần | Miếu | **CONTRADICTED** | GM-006 (ghi Hãm) |
| Mão | Miếu | UNVERIFIED | — |
| Thìn | Bình | UNVERIFIED | — |
| Tỵ | Đắc | **CONTRADICTED** | GM-004 (ghi Vượng) |
| Ngọ | Vượng | **CONTRADICTED** | GM-003 (ghi Bình) |
| Mùi | Hãm | **CONTRADICTED** | GM-005 (ghi Đắc) |
| Thân | Đắc | UNVERIFIED | — |
| Dậu | Miếu | **VERIFIED** | GM-001/002 |
| Tuất | Bình | UNVERIFIED | — |
| Hợi | Đắc | UNVERIFIED | — |

### Thái Dương

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Hãm | **VERIFIED** | GM-006 |
| Sửu | Hãm | UNVERIFIED | — |
| Dần | Vượng | UNVERIFIED | — |
| Mão | Vượng | **VERIFIED** | GM-004 |
| Thìn | Đắc | **CONTRADICTED** | GM-003 (ghi Vượng) |
| Tỵ | Miếu | **VERIFIED** | GM-005 |
| Ngọ | Miếu | UNVERIFIED | — |
| Mùi | Đắc | **VERIFIED** | GM-001/002 |
| Thân | Bình | UNVERIFIED | — |
| Dậu | Bình | UNVERIFIED | — |
| Tuất | Hãm | UNVERIFIED | — |
| Hợi | Hãm | UNVERIFIED | — |

### Vũ Khúc

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Vượng | UNVERIFIED | — |
| Sửu | Miếu | UNVERIFIED | — |
| Dần | Bình | **CONTRADICTED** | GM-004 (ghi Vượng) |
| Mão | Hãm | **CONTRADICTED** | GM-003 (ghi Miếu). GM-006 cũng ghi Hãm tại Mão nhưng vị trí sao đang tranh chấp (xem mục 3) nên không tính thêm làm bằng chứng riêng |
| Thìn | Miếu | **VERIFIED** | GM-005 |
| Tỵ | Bình | UNVERIFIED | — |
| Ngọ | Vượng | **VERIFIED** | GM-001/002 |
| Mùi | Miếu | UNVERIFIED | — |
| Thân | Bình | UNVERIFIED | — |
| Dậu | Hãm | UNVERIFIED | — |
| Tuất | Miếu | UNVERIFIED | — |
| Hợi | Bình | UNVERIFIED | — |

### Thiên Đồng

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Vượng | UNVERIFIED | — |
| Sửu | Bình | **CONTRADICTED** | GM-004 (ghi Hãm) |
| Dần | Đắc | **CONTRADICTED** | GM-003 (ghi Miếu) |
| Mão | Hãm | **CONTRADICTED** | GM-005 (ghi Đắc) |
| Thìn | Bình | UNVERIFIED | — |
| Tỵ | Đắc | **VERIFIED** | GM-001/002 |
| Ngọ | Hãm | UNVERIFIED | — |
| Mùi | Bình | UNVERIFIED | — |
| Thân | Đắc | UNVERIFIED | — |
| Dậu | Bình | UNVERIFIED | — |
| Tuất | Vượng | **CONTRADICTED** | GM-006 (ghi Hãm) |
| Hợi | Miếu | UNVERIFIED | — |

### Liêm Trinh

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | **CONTRADICTED** | GM-005 (ghi Vượng) |
| Sửu | Bình | UNVERIFIED | — |
| Dần | Vượng | **VERIFIED** | GM-001/002 |
| Mão | Hãm | UNVERIFIED | — |
| Thìn | Bình | UNVERIFIED | — |
| Tỵ | Đắc | UNVERIFIED | — |
| Ngọ | Bình | UNVERIFIED | — |
| Mùi | Bình | **CONTRADICTED** | GM-006 (ghi Đắc) |
| Thân | Vượng | UNVERIFIED | — |
| Dậu | Hãm | UNVERIFIED | — |
| Tuất | Bình | **CONTRADICTED** | GM-004 (ghi Miếu) |
| Hợi | Đắc | **CONTRADICTED** | GM-003 (ghi Hãm) |

### Thiên Phủ

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Đắc | UNVERIFIED | — |
| Sửu | Miếu | **CONTRADICTED** | GM-006 (ghi Bình) |
| Dần | Miếu | UNVERIFIED | — |
| Mão | Bình | UNVERIFIED | — |
| Thìn | Vượng | UNVERIFIED | — |
| Tỵ | Bình | UNVERIFIED | — |
| Ngọ | Miếu | **VERIFIED** | GM-001/002 |
| Mùi | Bình | UNVERIFIED | — |
| Thân | Vượng | **CONTRADICTED** | GM-005 (ghi Miếu) |
| Dậu | Bình | **VERIFIED** | GM-003 |
| Tuất | Đắc | **CONTRADICTED** | GM-004 (ghi Vượng) |
| Hợi | Bình | UNVERIFIED | — |

### Thái Âm

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | UNVERIFIED | — |
| Sửu | Miếu | UNVERIFIED | — |
| Dần | Hãm | **CONTRADICTED** | GM-006 (ghi Miếu) |
| Mão | Hãm | UNVERIFIED | — |
| Thìn | Hãm | UNVERIFIED | — |
| Tỵ | Hãm | UNVERIFIED | — |
| Ngọ | Hãm | UNVERIFIED | — |
| Mùi | Đắc | **VERIFIED** | GM-001/002 |
| Thân | Bình | UNVERIFIED | — |
| Dậu | Vượng | **CONTRADICTED** | GM-005 (ghi Miếu) |
| Tuất | Vượng | **CONTRADICTED** | GM-003 (ghi Miếu) |
| Hợi | Miếu | **VERIFIED** | GM-004 |

### Tham Lang

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Hãm | **VERIFIED** | GM-004 |
| Sửu | Miếu | UNVERIFIED | — |
| Dần | Bình | UNVERIFIED | GM-005 ghi Vượng nhưng vị trí sao đang tranh chấp (xem mục 3) — không tính |
| Mão | Bình | UNVERIFIED | — |
| Thìn | Miếu | UNVERIFIED | — |
| Tỵ | Bình | UNVERIFIED | — |
| Ngọ | Hãm | UNVERIFIED | — |
| Mùi | Miếu | UNVERIFIED | — |
| Thân | Đắc | **VERIFIED** | GM-001/002 |
| Dậu | Bình | UNVERIFIED | — |
| Tuất | Miếu | UNVERIFIED | — |
| Hợi | Bình | **CONTRADICTED** | GM-003 (ghi Hãm) |

### Cự Môn

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | **CONTRADICTED** | GM-003 (ghi Vượng) |
| Sửu | Bình | **CONTRADICTED** | GM-004 (ghi Hãm) |
| Dần | Đắc | UNVERIFIED | — |
| Mão | Vượng | UNVERIFIED | — |
| Thìn | Hãm | **VERIFIED** | GM-006 |
| Tỵ | Đắc | UNVERIFIED | — |
| Ngọ | Miếu | UNVERIFIED | — |
| Mùi | Bình | UNVERIFIED | — |
| Thân | Đắc | UNVERIFIED | — |
| Dậu | Miếu | **VERIFIED** | GM-001/002 |
| Tuất | Hãm | UNVERIFIED | — |
| Hợi | Đắc | **VERIFIED** | GM-005 |

### Thiên Tướng

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Bình | **CONTRADICTED** | GM-005 (ghi Vượng) |
| Sửu | Miếu | **CONTRADICTED** | GM-003 (ghi Đắc) |
| Dần | Đắc | **CONTRADICTED** | GM-004 (ghi Miếu) |
| Mão | Miếu | UNVERIFIED | — |
| Thìn | Bình | UNVERIFIED | — |
| Tỵ | Miếu | **CONTRADICTED** | GM-006 (ghi Đắc) |
| Ngọ | Bình | UNVERIFIED | — |
| Mùi | Bình | UNVERIFIED | — |
| Thân | Đắc | UNVERIFIED | — |
| Dậu | Miếu | UNVERIFIED | — |
| Tuất | Vượng | **VERIFIED** | GM-001/002 |
| Hợi | Miếu | UNVERIFIED | — |

### Thiên Lương

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | UNVERIFIED | — |
| Sửu | Bình | **CONTRADICTED** | GM-005 (ghi Đắc) |
| Dần | Vượng | UNVERIFIED | — |
| Mão | Bình | **CONTRADICTED** | GM-004 (ghi Vượng) |
| Thìn | Hãm | UNVERIFIED | — |
| Tỵ | Hãm | UNVERIFIED | — |
| Ngọ | Miếu | **VERIFIED** | GM-006 |
| Mùi | Bình | UNVERIFIED | — |
| Thân | Hãm | UNVERIFIED | GM-003 ghi Miếu nhưng vị trí sao đang tranh chấp (xem mục 3) — không tính |
| Dậu | Bình | UNVERIFIED | — |
| Tuất | Đắc | UNVERIFIED | — |
| Hợi | Hãm | **VERIFIED** | GM-001/002 |

### Thất Sát

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | **VERIFIED** | GM-001/002 |
| Sửu | Bình | UNVERIFIED | — |
| Dần | Miếu | UNVERIFIED | — |
| Mão | Hãm | **VERIFIED** | GM-003 |
| Thìn | Bình | **CONTRADICTED** | GM-004 (ghi Hãm) |
| Tỵ | Bình | UNVERIFIED | — |
| Ngọ | Miếu | UNVERIFIED | — |
| Mùi | Bình | **VERIFIED** | GM-006 |
| Thân | Miếu | UNVERIFIED | — |
| Dậu | Hãm | UNVERIFIED | — |
| Tuất | Bình | UNVERIFIED | GM-005 ghi Miếu nhưng vị trí sao đang tranh chấp (xem mục 3) — không tính |
| Hợi | Bình | UNVERIFIED | — |

### Phá Quân

| Chi | Hiện tại | Phân loại | Nguồn |
|---|---|---|---|
| Tý | Miếu | UNVERIFIED | — |
| Sửu | Bình | UNVERIFIED | — |
| Dần | Bình | UNVERIFIED | — |
| Mão | Hãm | UNVERIFIED | GM-006 ghi Hãm nhưng vị trí sao đang tranh chấp (xem mục 3) — không tính dù trùng giá trị |
| Thìn | Đắc | **VERIFIED** | GM-001/002 |
| Tỵ | Bình | UNVERIFIED | — |
| Ngọ | Miếu | **VERIFIED** | GM-005 |
| Mùi | Bình | **CONTRADICTED** | GM-003 (ghi Vượng) |
| Thân | Bình | **CONTRADICTED** | GM-004 (ghi Hãm) |
| Dậu | Hãm | UNVERIFIED | — |
| Tuất | Đắc | UNVERIFIED | — |
| Hợi | Bình | UNVERIFIED | — |

### Tổng hợp

**27 ô VERIFIED, 35 ô CONTRADICTED, 106 ô UNVERIFIED** (168 tổng — 102 ô chưa từng có dữ liệu GM chạm
tới, cộng 4 ô có dữ liệu GM nhưng bị loại vì vị trí sao đang tranh chấp: Vũ Khúc@Mão(GM-006),
Tham Lang@Dần(GM-005), Thiên Lương@Thân(GM-003), Thất Sát@Tuất(GM-005), Phá Quân@Mão(GM-006) — 5 lượt
tranh chấp nhưng trùng vào các ô đã UNVERIFIED sẵn nên tổng UNVERIFIED = 102 + không tăng thêm vì các ô
đó vốn đã UNVERIFIED do không có nguồn sạch nào khác chạm tới).

---

## 2. BẢNG CHỦ MỆNH / CHỦ THÂN — 12 CHI NĂM SINH

| Chi năm sinh | Chủ Mệnh | Chủ Thân | Evidence |
|---|---|---|---|
| Tý | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Tý |
| Sửu | Cự Môn | Thiên Tướng | GM-004 (Nữ, Mệnh=Dần) + GM-005 (Nam, Mệnh=Thân) — 2 Golden Master độc lập, khác giới tính, khác Chi cung Mệnh, cùng kết quả |
| Dần | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Dần |
| Mão | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Mão |
| Thìn | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Thìn |
| Tỵ | Vũ Khúc | Thiên Cơ | GM-006 (năm Can Chi Ất Tỵ, xác nhận qua đúng công thức calendar boundary — 1 Golden Master) |
| Ngọ | Phá Quân | Hỏa Tinh | GM-003 (1 Golden Master) |
| Mùi | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Mùi |
| Thân | Liêm Trinh | Thiên Lương | GM-001 + GM-002 — 2 Golden Master độc lập, cùng ngày sinh khác giới tính, cùng kết quả |
| Dậu | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Dậu |
| Tuất | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Tuất |
| Hợi | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | Chưa có Golden Master nào có năm sinh Chi Hợi |

Đúng 4/12 Chi có giá trị (Thân, Ngọ, Sửu, Tỵ), 8/12 còn lại NEED_GOLDEN_MASTER_REVIEW — không suy diễn
theo bất kỳ pattern đối xứng/tuần hoàn nào cho 8 Chi còn thiếu.

**Về khóa tra bảng**: dữ liệu hiện có cho bằng chứng mạnh rằng khóa đúng là Chi NĂM SINH (không phải Chi
cung Mệnh/Thân — xem `docs/TUVI_RULE_FORENSICS.md` phần B4 để xem đầy đủ 3 phép loại trừ chéo). Bảng
`CHU_MENH_TABLE`/`CHU_THAN_TABLE` hiện tại trong code vẫn tra theo Chi cung Mệnh/Thân — **CHƯA sửa**,
đúng theo yêu cầu "không sửa engine" của phase này.

---

## 3. THIÊN VIỆT

```
NEED_GOLDEN_MASTER_REVIEW
```

Không đổi. Không có Golden Master nào (GM-001 → GM-006) chứa dữ liệu vị trí Thiên Việt.

---

## 4. 4 TRANSCRIPTION CONFLICTS (giữ nguyên, không tự chọn bên đúng/sai)

| # | GM | Field | Giá trị trong GM | Giá trị engine | Ghi chú ngắn |
|---|---|---|---|---|---|
| 1 | GM-003 | Vị trí Thiên Lương | Thân | Dần | Công thức offset+5 từ Thiên Phủ đã VERIFIED ở GM-001, và Thiên Phủ@Dậu của GM-003 tự khớp pack |
| 2 | GM-005 | Vị trí Tham Lang / Thất Sát | Tham Lang@Dần, Thất Sát@Tuất | Tham Lang@Tuất, Thất Sát@Dần | 2 công thức độc lập (vòng sao + tên cung) đều cùng chỉ Tuất=Tham Lang, ngược pack |
| 3 | GM-006 | Vị trí Vũ Khúc / Phá Quân | Mão (cungName "Huynh Đệ") | Hợi (cungName "Huynh Đệ") | Chính pack tự đánh dấu dòng Hợi "không chắc chắn" — nghi 2 dòng bị tách nhầm |
| 4 | GM-006 | Tuần Không | Tý-Sửu | Dần-Mão | Trùng hệt giá trị của GM-001 dù năm sinh khác hẳn (Ất Tỵ so với Canh Thân) |

Chi tiết đầy đủ (bằng chứng nội bộ, lý do nghi ngờ, dữ liệu cần xác minh lại từng điểm) xem
`docs/TUVI_RULE_FORENSICS.md` phần C — không lặp lại ở đây theo đúng yêu cầu "không lặp lại audit cũ".
Không tự chọn engine hay pack là đúng cho bất kỳ điểm nào trong 4 điểm này.

---

## 5. KẾT LUẬN

```
SOURCE NOT LOCKED
```

**Lý do chính xác:**
1. 106/168 ô (63%) trạng thái Miếu/Vượng/Đắc/Bình/Hãm vẫn UNVERIFIED — không đủ nguồn để khóa toàn bộ
   bảng, và 35/168 ô (21%) đã CONTRADICTED trực tiếp bởi Golden Master (bảng hiện tại sai ở các ô này,
   xác nhận được chứ không phải nghi ngờ).
2. Chủ Mệnh/Chủ Thân: 8/12 Chi năm sinh (67%) là NEED_GOLDEN_MASTER_REVIEW, dù đã xác định đúng biến số
   (Chi năm sinh) nhưng thiếu 2/3 số giá trị cụ thể cần thiết để khóa bảng.
3. Thiên Việt: 12/12 Chi (100%) là NEED_GOLDEN_MASTER_REVIEW — chưa có bất kỳ điểm dữ liệu nào.
4. 4 xung đột transcription giữa engine và Golden Master Pack chưa được người dùng xác nhận lại từ ảnh
   gốc — bất kỳ Golden Master mới nào bổ sung mà không giải quyết 4 điểm này trước có nguy cơ kế thừa
   dữ liệu sai vào các bảng mới.

Không có nguồn nào trong 4 mục trên đạt trạng thái "đủ để khóa" (locked) — vẫn cần Golden Master bổ sung
hoặc xác nhận lại ảnh gốc trước khi được coi là sẵn sàng cho bước implement rule tiếp theo.
