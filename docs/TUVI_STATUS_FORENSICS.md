# TUVI STATUS FORENSICS — Miếu/Vượng/Đắc/Bình/Hãm của 14 chính tinh

Phase forensics độc lập, KHÔNG sửa engine, KHÔNG sửa Golden Master, KHÔNG commit/push.

Nguồn đối chiếu: `TuVi_Engine_V2.md` (spec), `docs/TuVi_Golden_Master_Pack_V1.md` (GM-001 → GM-006, người
dùng cung cấp), code hiện tại (`src/lib/tu-vi/rules.ts`, `src/lib/tu-vi/engine.ts`), test hiện tại
(`tests/tu-vi-golden.test.ts`, `tests/tu-vi-golden-gm002-006.test.ts`).

---

## 1. TẤT CẢ NƠI ĐỀ CẬP MIẾU/VƯỢNG/ĐẮC/BÌNH/HÃM

### Trong specification (`TuVi_Engine_V2.md`)
- **§16 "TRẠNG THÁI MIẾU/VƯỢNG/ĐẮC/BÌNH/HÃM"**: yêu cầu tạo file `rules/main-star-status.ts` chứa bảng
  `STATUS[star][branch]`, nói rõ *"Không suy ra trạng thái bằng ngũ hành sinh khắc"* và *"Không để Claude
  tự tạo bảng từ trí nhớ"*. Cho đúng **3 điểm Golden Master bắt buộc**: Liêm Trinh@Dần=Vượng,
  (Quan Lộc Ngọ: Vũ Khúc=Vượng, Thiên Phủ=Miếu), (Phu Thê Tý: Thất Sát=Miếu). Sau đó ghi: *"Các vị trí
  khác phải được kiểm tra bằng bảng status của profile"* — **KHÔNG cung cấp bảng đó**, chỉ giả định nó
  tồn tại ở nơi khác (không có trong file này).
- **§37 "GOLDEN MASTER #001"**, mục "Expected principal stars": liệt kê trạng thái cho **13/14 chính
  tinh** kèm theo vị trí (Tử Vi không ghi trạng thái). Đây là dữ liệu Golden Master DUY NHẤT có sẵn từ
  spec gốc.
- **§38 "GOLDEN MASTER TEST"**: ví dụ code test cụ thể cho 2/3 điểm ở §16 (Liêm Trinh Vượng, Vũ Khúc
  Vượng, Thiên Phủ Miếu).

### Trong code hiện tại
- `src/lib/tu-vi/rules.ts`: `export type TrangThaiSao = "Miếu" | "Vượng" | "Đắc" | "Bình" | "Hãm";` và
  `export const MAIN_STAR_STATUS: Record<string, TrangThaiSao[]>` — bảng 14×12 đầy đủ, tự viết (không có
  nguồn bảng đầy đủ nào được cung cấp — xem mục 8 STATUS_TABLE_SOURCE).
- `src/lib/tu-vi/engine.ts`: đọc `MAIN_STAR_STATUS[sao.name][chiIdx]` khi an 14 chính tinh (2 vòng lặp
  `TU_VI_RING`/`THIEN_PHU_RING`), gán vào field `trangThai` của `ChinhTinhO`.

### Trong test hiện tại
- `tests/tu-vi-golden.test.ts`: 10 test (13 assertion trạng thái) — toàn bộ từ GM-001.
- `tests/tu-vi-golden-gm002-006.test.ts`: GM-002 lặp lại đúng 13 assertion của GM-001 (cùng lá số, khác
  giới tính). GM-003 → GM-006: **KHÔNG hard-assert trạng thái** (chỉ assert vị trí sao có mặt hay không),
  theo đúng quyết định "hạ cấp" đã ghi trong `docs/TUVI_ENGINE_REAUDIT.md` mục 4.2.

---

## 2. BẢNG HIỆN TẠI CỦA ENGINE (14 × 12, nguyên trạng từ `MAIN_STAR_STATUS`)

Thứ tự Chi: Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi.

| Star | Tý | Sửu | Dần | Mão | Thìn | Tỵ | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tử Vi | B | M | V | Đ | B | Đ | M | B | V | Đ | V | B |
| Thiên Cơ | B | H | M | M | B | Đ | V | H | Đ | M | B | Đ |
| Thái Dương | H | H | V | V | Đ | M | M | Đ | B | B | H | H |
| Vũ Khúc | V | M | B | H | M | B | V | M | B | H | M | B |
| Thiên Đồng | V | B | Đ | H | B | Đ | H | B | Đ | B | V | M |
| Liêm Trinh | M | B | V | H | B | Đ | B | B | V | H | B | Đ |
| Thiên Phủ | Đ | M | M | B | V | B | M | B | V | B | Đ | B |
| Thái Âm | M | M | H | H | H | H | H | Đ | B | V | V | M |
| Tham Lang | H | M | B | B | M | B | H | M | Đ | B | M | B |
| Cự Môn | M | B | Đ | V | H | Đ | M | B | Đ | M | H | Đ |
| Thiên Tướng | B | M | Đ | M | B | M | B | B | Đ | M | V | M |
| Thiên Lương | M | B | V | B | H | H | M | B | H | B | Đ | H |
| Thất Sát | M | B | M | H | B | B | M | B | M | H | B | B |
| Phá Quân | M | B | B | H | Đ | B | M | B | B | H | Đ | B |

168 ô. Không sửa bảng này trong quá trình forensics.

---

## 3. DỮ LIỆU GOLDEN MASTER DÙNG ĐỂ ĐỐI CHIẾU (trích từ pack, theo (sao, Chi))

Ký hiệu: **GM-x** = nguồn; vị trí có dấu (\*) là vị trí SAO đang bị tranh chấp (xem
`docs/TUVI_ENGINE_REAUDIT.md` mục 4.3 / `docs/TUVI_RULE_FORENSICS.md` phần C) — các ô này liệt kê riêng ở
cuối bảng, KHÔNG tính vào VERIFIED/CONTRADICTED của ô tương ứng vì bản thân vị trí (Chi nào) còn chưa
chắc chắn.

| Sao | Chi | Trạng thái GM ghi | Nguồn |
|---|---|---|---|
| Liêm Trinh | Dần | Vượng | GM-001, GM-002 |
| Vũ Khúc | Ngọ | Vượng | GM-001, GM-002 |
| Thiên Phủ | Ngọ | Miếu | GM-001, GM-002 |
| Thái Dương | Mùi | Đắc | GM-001, GM-002 |
| Thái Âm | Mùi | Đắc | GM-001, GM-002 |
| Tham Lang | Thân | Đắc | GM-001, GM-002 |
| Thiên Cơ | Dậu | Miếu | GM-001, GM-002 |
| Cự Môn | Dậu | Miếu | GM-001, GM-002 |
| Thiên Tướng | Tuất | Vượng | GM-001, GM-002 |
| Thiên Lương | Hợi | Hãm | GM-001, GM-002 |
| Thất Sát | Tý | Miếu | GM-001, GM-002 |
| Phá Quân | Thìn | Đắc | GM-001, GM-002 |
| Thiên Đồng | Tỵ | Đắc | GM-001, GM-002 |
| Thiên Đồng | Dần | Miếu | GM-003 |
| Vũ Khúc | Mão | Miếu | GM-003 |
| Thất Sát | Mão | Hãm | GM-003 |
| Thái Dương | Thìn | Vượng | GM-003 |
| Thiên Cơ | Ngọ | Bình | GM-003 |
| Tử Vi | Mùi | Đắc | GM-003 |
| Phá Quân | Mùi | Vượng | GM-003 |
| Thiên Phủ | Dậu | Bình | GM-003 |
| Thái Âm | Tuất | Miếu | GM-003 |
| Liêm Trinh | Hợi | Hãm | GM-003 |
| Tham Lang | Hợi | Hãm | GM-003 |
| Cự Môn | Tý | Vượng | GM-003 |
| Thiên Tướng | Sửu | Đắc | GM-003 |
| Vũ Khúc | Dần | Vượng | GM-004 |
| Thiên Tướng | Dần | Miếu | GM-004 |
| Thái Dương | Mão | Vượng | GM-004 |
| Thiên Lương | Mão | Vượng | GM-004 |
| Thất Sát | Thìn | Hãm | GM-004 |
| Thiên Cơ | Tỵ | Vượng | GM-004 |
| Tử Vi | Ngọ | Miếu | GM-004 |
| Phá Quân | Thân | Hãm | GM-004 |
| Liêm Trinh | Tuất | Miếu | GM-004 |
| Thiên Phủ | Tuất | Vượng | GM-004 |
| Thái Âm | Hợi | Miếu | GM-004 |
| Tham Lang | Tý | Hãm | GM-004 |
| Thiên Đồng | Sửu | Hãm | GM-004 |
| Cự Môn | Sửu | Hãm | GM-004 |
| Thiên Đồng | Mão | Đắc | GM-005 |
| Vũ Khúc | Thìn | Miếu | GM-005 |
| Thái Dương | Tỵ | Miếu | GM-005 |
| Phá Quân | Ngọ | Miếu | GM-005 |
| Thiên Cơ | Mùi | Đắc | GM-005 |
| Tử Vi | Thân | Miếu | GM-005 |
| Thiên Phủ | Thân | Miếu | GM-005 |
| Thái Âm | Dậu | Miếu | GM-005 |
| Cự Môn | Hợi | Đắc | GM-005 |
| Liêm Trinh | Tý | Vượng | GM-005 |
| Thiên Tướng | Tý | Vượng | GM-005 |
| Thiên Lương | Sửu | Đắc | GM-005 |
| Thiên Cơ | Dần | Hãm | GM-006 |
| Thái Âm | Dần | Miếu | GM-006 |
| Cự Môn | Thìn | Hãm | GM-006 |
| Thiên Tướng | Tỵ | Đắc | GM-006 |
| Thiên Lương | Ngọ | Miếu | GM-006 |
| Liêm Trinh | Mùi | Đắc | GM-006 |
| Thất Sát | Mùi | Bình | GM-006 |
| Thiên Đồng | Tuất | Hãm | GM-006 |
| Thái Dương | Tý | Hãm | GM-006 |
| Thiên Phủ | Sửu | Bình | GM-006 |

**Ô tranh chấp vị trí (không tính vào phân loại — xem `docs/TUVI_RULE_FORENSICS.md` phần C):**
Tham Lang@Dần(GM-005, pack; engine=Tuất), Thiên Lương@Thân(GM-003, pack; engine=Dần),
Thất Sát@Tuất(GM-005, pack; engine=Dần), Vũ Khúc@Mão + Phá Quân@Mão (GM-006, pack; engine=Hợi).

---

## 4. PHÂN LOẠI TỪNG SAO (đối chiếu mục 2 với mục 3)

Với mỗi sao: liệt kê ô VERIFIED (khớp), ô CONTRADICTED (không khớp), số ô UNVERIFIED (không có dữ liệu
GM nào chạm tới).

| Sao | VERIFIED | CONTRADICTED | UNVERIFIED (còn lại /12) |
|---|---|---|---|
| Tử Vi | Ngọ (GM-004) | Mùi (GM-003), Thân (GM-005) | 9 |
| Thiên Cơ | Dậu (GM-001/002) | Ngọ (GM-003), Tỵ (GM-004), Mùi (GM-005), Dần (GM-006) | 7 |
| Thái Dương | Mùi (GM-001/002), Mão (GM-004), Tỵ (GM-005), Tý (GM-006) | Thìn (GM-003) | 7 |
| Vũ Khúc | Ngọ (GM-001/002), Thìn (GM-005) | Mão (GM-003), Dần (GM-004) | 8 |
| Thiên Đồng | Tỵ (GM-001/002) | Dần (GM-003), Sửu (GM-004), Mão (GM-005), Tuất (GM-006) | 7 |
| Liêm Trinh | Dần (GM-001/002) | Hợi (GM-003), Tuất (GM-004), Tý (GM-005), Mùi (GM-006) | 7 |
| Thiên Phủ | Ngọ (GM-001/002), Dậu (GM-003) | Tuất (GM-004), Thân (GM-005), Sửu (GM-006) | 7 |
| Thái Âm | Mùi (GM-001/002), Hợi (GM-004) | Tuất (GM-003), Dậu (GM-005), Dần (GM-006) | 7 |
| Tham Lang | Thân (GM-001/002), Tý (GM-004) | Hợi (GM-003) | 9 |
| Cự Môn | Dậu (GM-001/002), Hợi (GM-005), Thìn (GM-006) | Tý (GM-003), Sửu (GM-004) | 7 |
| Thiên Tướng | Tuất (GM-001/002) | Sửu (GM-003), Dần (GM-004), Tý (GM-005), Tỵ (GM-006) | 7 |
| Thiên Lương | Hợi (GM-001/002), Ngọ (GM-006) | Mão (GM-004), Sửu (GM-005) | 8 |
| Thất Sát | Tý (GM-001/002), Mão (GM-003), Mùi (GM-006) | Thìn (GM-004) | 8 |
| Phá Quân | Thìn (GM-001/002), Ngọ (GM-005) | Mùi (GM-003), Thân (GM-004) | 8 |

**Tổng: 27 ô VERIFIED, 35 ô CONTRADICTED, 102 ô UNVERIFIED, 4 ô đang tranh chấp vị trí (không tính) —
trên tổng 168 ô.**

Tỷ lệ trên các ô ĐÃ CÓ dữ liệu (66/168 ô đã được ít nhất 1 GM chạm tới, không tính 4 ô tranh chấp):
**27/62 ≈ 43,5% khớp** (thấp hơn con số 15-30% ước lượng nhanh ở `TUVI_ENGINE_REAUDIT.md` — con số đó
tính riêng theo từng GM lẻ, không gộp GM-001/002 vào; con số 43,5% ở đây là tổng hợp toàn bộ 5 GM có dữ
liệu Miếu/Vượng, chính xác hơn). Dù cách tính nào, kết luận không đổi: **bảng hiện tại không đủ tin cậy
để dùng ngoài phạm vi đã VERIFIED cụ thể.**

---

## 5. CÁC NGÔI SAO KHÔNG THỂ RÚT RA QUY LUẬT SAI ĐƠN GIẢN

Đáng chú ý: tỷ lệ đúng/sai KHÔNG đồng đều theo sao — Thái Dương (4 đúng/1 sai), Thất Sát (3/1), Cự Môn
(3/2) có tỷ lệ khớp cao hơn hẳn Thiên Cơ (1/4), Thiên Đồng (1/4), Liêm Trinh (1/4), Thiên Tướng (1/4) có
tỷ lệ khớp rất thấp. Điều này gợi ý bảng hiện tại **không sai theo 1 quy luật đơn giản có thể tự sửa**
(ví dụ "lệch 1 vị trí", "đảo Vượng/Miếu") — nếu có quy luật lệch đơn giản, tỷ lệ sai sẽ đồng đều hơn giữa
các sao. Điều này củng cố khuyến nghị: **cần bảng nguồn thật, không nên tự suy luận/vá bảng hiện tại.**

---

## 6. STATUS_TABLE_SOURCE

```
STATUS_TABLE_SOURCE = INCOMPLETE
```

Specification (`TuVi_Engine_V2.md` §16) không cung cấp bảng 14×12 đầy đủ — chỉ cho 3 điểm bắt buộc và
yêu cầu "bảng status của profile" mà không đính kèm. Golden Master Pack V1 cộng với GM-001 gốc cung cấp
tổng cộng 66/168 ô có dữ liệu (39%), trong đó chỉ 27 ô (16% tổng bảng) thực sự khớp với bảng hiện tại.

## 7. Ô CẦN GOLDEN MASTER BỔ SUNG

**Chính xác 102 ô UNVERIFIED** (chưa từng có bất kỳ GM nào chạm tới) — liệt kê theo sao (số ô còn thiếu
đã ghi ở cột cuối bảng mục 4). Vì con số quá lớn để liệt kê từng ô riêng lẻ có ích, khuyến nghị cụ thể:

- Mỗi Golden Master mới (1 lá số thật + ảnh gốc rõ Miếu/Vượng từng sao) có thể xác nhận thêm tối đa
  10-14 ô/lần (tùy Cục/ngày sinh có bao nhiêu chính tinh "chạm" các Chi chưa có dữ liệu).
  Ước tính cần **thêm ít nhất 8-10 Golden Master nữa** (mỗi lá đem lại ~10-13 ô mới, một số trùng lặp
  không tránh khỏi) để phủ hết 102 ô còn lại — hoặc, hiệu quả hơn nhiều: **1 bảng tra cứu Miếu/Vượng
  đầy đủ 14×12 từ 1 nguồn duy nhất đáng tin cậy** (sách/phần mềm Tử Vi có ghi rõ profile Nam Phái, thay
  vì cộng dồn từng lá số lẻ).
- Ưu tiên cao nhất theo tỷ lệ sai hiện tại (nhóm sao có CONTRADICTED cao, cần xác nhận lại toàn bộ):
  **Thiên Cơ, Thiên Đồng, Liêm Trinh, Thiên Tướng** (mỗi sao 4/5 điểm đã kiểm tra bị sai).
