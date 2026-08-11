# TUVI PHASE 28 — 14 CHÍNH TINH POSITION RECONCILIATION

Position audit thuần túy cho 3 conflict đã biết (GM-003/005/006). **Không sửa Golden Master. Không sửa
engine. Không commit/push.** Kết luận: cả 3 trường hợp đều có bằng chứng độc lập nghiêng mạnh về phía
**engine đúng, GM Pack có khả năng lỗi transcription** — nhưng theo đúng nguyên tắc phase này, **KHÔNG sửa
Golden Master, KHÔNG xóa `it.fails()`**, chỉ ghi nhận đầy đủ bằng chứng.

---

## 1. Executive Summary

| Conflict | Kết luận | Bằng chứng chính |
|---|---|---|
| GM-003 — Thiên Lương | `ENGINE_SUPPORTED` + `POSSIBLE_GM_TRANSCRIPTION_ERROR` | Lá số độc lập GM-SOURCE-B (tuvinamphai.vn, Phase 15) — CÙNG `tuViChiIndex=7` — cho Thiên Đồng+Thiên Lương cùng cung Dần, khớp engine, không khớp GM-003 |
| GM-005 — Tham Lang/Thất Sát | `ENGINE_SUPPORTED` + `POSSIBLE_GM_TRANSCRIPTION_ERROR` (hoán đổi nhãn) | Lá số độc lập GM-SOURCE-C (tuvinamphai.vn) xác nhận đúng offset +2/+6 không hoán đổi; trạng thái Miếu/Vượng GM-005 tự ghi khớp CHÍNH XÁC với vị trí ENGINE tính (không khớp vị trí GM tự claim) |
| GM-006 — Vũ Khúc/Phá Quân | `ENGINE_SUPPORTED` + `POSSIBLE_GM_TRANSCRIPTION_ERROR` | Tự mâu thuẫn NỘI BỘ: GM-006 xác nhận Mệnh=Tý (đã VERIFIED), nhưng quy tắc 12 cung nghịch (đã VERIFIED từ GM-001) buộc "Huynh Đệ" phải là Hợi khi Mệnh=Tý — không thể là Mão như GM-006 tự ghi. Trạng thái Hãm/Hãm GM-006 tự ghi khớp CHÍNH XÁC Nguyên Cát tại Hợi, không khớp tại Mão |

**Không sửa engine, không sửa GM trong phase này** — cả 3 kết luận đều là "engine đã đúng", nên không có
gì để sửa (điều kiện "xác định chắc engine hiện tại SAI" ở mục X KHÔNG xảy ra ở cả 3 trường hợp).

---

## 2. GM-003 audit — Thiên Lương

### Input GM-003 (reproduce chính xác)
```
Nam, Dương lịch 25/08/1990 11:30, Âm lịch 06/07/1990, Năm Canh Ngọ, GMT+7
```

### Tính lại bằng engine hiện tại
```
Mệnh = Dần(2), Thân = Dần(2), Cục = Thổ Ngũ Cục
tuViChiIndex = 7 (Mùi), thienPhuChiIndex = mod12(4-7) = 9 (Dậu)
```

### Đối chiếu ĐẦY ĐỦ (không chỉ tên sao) — engine vs GM-003 text

| Mục | Engine | GM-003 text | Khớp? |
|---|---|---|---|
| Ngày/giờ sinh, Âm/Dương lịch, Can Chi | 25/08/1990 11:30, Canh Ngọ | Giống hệt | ✅ |
| Mệnh | Dần | Dần | ✅ |
| Thân | Dần | Dần | ✅ |
| Cục | Thổ Ngũ Cục | Thổ Ngũ Cục | ✅ |
| Vị trí Tử Vi | Mùi | (Mùi Nô Bộc: Tử Vi(Đ)) | ✅ |
| Vị trí Thiên Phủ | Dậu | (Dậu Tật Ách: Thiên Phủ(B)) | ✅ |
| Vị trí 13 chính tinh còn lại (trừ Thiên Lương) | — | — | ✅ 13/13 khớp (đã kiểm ở Phase 17) |
| **Vị trí Thiên Lương** | **Dần** (cùng Thiên Đồng) | **Thân** (Thiên Di) | **❌ KHÁC** |

### Công thức tạo ra vị trí engine
`Thiên Lương` thuộc `THIEN_PHU_RING`, offset `+5` từ `thienPhuChiIndex`. `mod12(9+5) = 2` (Dần). Công
thức này **đã verified tự nhất quán (0 mismatch) trên cả 6 GM** khi kiểm tra lại toàn bộ 14 offset — xem
mục 7 (Formula comparison).

### Nguồn Nam Phái độc lập tìm được

**Level 3 — lá số thực tế tuvinamphai.vn (GM-SOURCE-B, Phase 15)**: candidate 25/06/1955 giờ Mão. Đã xác
nhận từ Phase 11A: `tuViChiIndex = 7` — **TRÙNG CHÍNH XÁC** với GM-003. Vì vị trí 14 chính tinh chỉ phụ
thuộc `tuViChiIndex` (không phụ thuộc Cục/Mệnh), đây là phép so sánh CẤU TRÚC HỢP LỆ, không phải trùng hợp
ngẫu nhiên.

Ảnh GM-SOURCE-B (đã đọc trực tiếp ở Phase 15) ghi: **"M.Dần HUYNH ĐỆ: Thiên Đồng (M), Thiên Lương (V)"**
— Thiên Đồng VÀ Thiên Lương CÙNG NẰM Ở DẦN — khớp CHÍNH XÁC với engine (Dần, cùng Thiên Đồng), **KHÔNG
khớp** với GM-003 (Thân, tách riêng).

### Kết luận GM-003

`ENGINE_SUPPORTED`. Ghi `POSSIBLE_GM_TRANSCRIPTION_ERROR` cho GM-003 (Thiên Lương) — Dần và Thân là 2 cung
ĐỐI XUNG (cách nhau đúng 6 cung), một dạng lỗi đọc/chép rất điển hình khi thao tác thủ công trên lưới 4×4
(đã từng bắt gặp chính xác dạng lỗi này ở Phase 14 khi tự đọc bản Tân Biên OCR). Trạng thái "(M)=Miếu" GM
tự ghi KHÔNG khớp Nguyên Cát ở cả 2 vị trí ứng viên (Dần=Vượng, Thân=Vượng) — không dùng để phân xử thêm,
chỉ ghi nhận riêng (đây là vấn đề STATUS đã biết từ Phase 13, không phải bằng chứng cho POSITION).

**Không sửa Golden Master, không sửa engine, không xóa `it.fails()`.**

---

## 3. GM-005 audit — Tham Lang / Thất Sát

### Input GM-005
```
Nam, Dương lịch 25/08/1997 00:30, Âm lịch 23/07/1997, Năm Đinh Sửu, GMT+7 (test giờ Tý)
```

### Tính lại bằng engine
```
Mệnh = Thân(8), Thân = Thân(8), Cục = Thổ Ngũ Cục
tuViChiIndex = 8 (Thân), thienPhuChiIndex = mod12(4-8) = 8 (Thân)
```

### Đối chiếu đầy đủ

| Mục | Engine | GM-005 text | Khớp? |
|---|---|---|---|
| Ngày/giờ/Can Chi/Mệnh/Thân/Cục | Giống hệt | Giống hệt | ✅ |
| Vị trí Tử Vi/Thiên Phủ | Thân/Thân | (Thân Mệnh: Tử Vi(M), Thiên Phủ(M)) | ✅ |
| 12/14 chính tinh còn lại | — | — | ✅ (đã kiểm Phase 17) |
| **Tham Lang** | **Tuất** (offset+2) | **Dần** (Phúc Đức) | ❌ |
| **Thất Sát** | **Dần** (offset+6) | **Tuất** (Thiên Di) | ❌ |

**Quan sát mấu chốt**: đây không phải 2 lỗi độc lập — vị trí Engine của Tham Lang (Tuất) chính là vị trí
GM claim cho Thất Sát, và ngược lại. Đây là **HOÁN ĐỔI HOÀN TOÀN** giữa 2 tên sao, không phải sai lệch
từng phần.

### Công thức
`Tham Lang` offset `+2`, `Thất Sát` offset `+6` từ `thienPhuChiIndex=8`: `mod12(8+2)=10` (Tuất),
`mod12(8+6)=2` (Dần) — khớp đúng engine, tự nhất quán 0 mismatch trên toàn bộ 6 GM (mục 7). Thứ tự vòng
Thiên Phủ (`Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, Phá Quân`) là thứ
tự **thống nhất tuyệt đối** trong mọi tài liệu Tử Vi đã tra cứu suốt 27 phase — không tìm thấy bất kỳ
trường phái nào (kể cả nguồn khác trường phái) ghi thứ tự khác cho riêng cặp Tham Lang/Thất Sát.

### Nguồn Nam Phái độc lập

**Level 3 — GM-SOURCE-C (tuvinamphai.vn, Phase 15)**: candidate 25/06/1955 giờ Tý, `thienPhuChiIndex = 1`
(Sửu). Ảnh ghi: **"K.Mão TỬ TỨC: Tử Vi(B), Tham Lang(H)"** → Tham Lang tại Mão = `mod12(1+2)=3` ✅ khớp
CHÍNH XÁC offset+2, không hoán đổi. **"Q.Mùi PHỤ MẪU: Liêm Trinh(Đ), Thất Sát(Đ)"** → Thất Sát tại Mùi =
`mod12(1+6)=7` ✅ khớp CHÍNH XÁC offset+6, không hoán đổi. Đây là chart KHÁC (không cùng `thienPhuChiIndex`
với GM-005) nhưng xác nhận RULE TỔNG QUÁT (offset+2/+6 cố định, không hoán đổi) hoàn toàn sạch, 0 ngoại lệ.

### Bằng chứng nội bộ bổ sung (không cần nguồn ngoài) — đối chiếu trạng thái

GM-005 tự ghi "Tham Lang(V)" và "Thất Sát(M)". Tra Nguyên Cát (`MAIN_STAR_STATUS`, đã khóa từ Phase 16):

```
Tham Lang @ Tuất (vị trí ENGINE tính) = Vượng   → khớp CHÍNH XÁC "(V)" GM tự ghi
Thất Sát  @ Dần  (vị trí ENGINE tính) = Miếu    → khớp CHÍNH XÁC "(M)" GM tự ghi
```

Trạng thái GM-005 tự ghi khớp ĐÚNG với vị trí ENGINE tính (Tuất/Dần), KHÔNG khớp với vị trí GM tự CLAIM
(Dần/Tuất, sẽ cho Tham Lang=Miếu, Thất Sát=Vượng — ngược với chữ GM tự ghi). Đây là bằng chứng mạnh: người
soạn GM-005 có khả năng đã ĐỌC ĐÚNG trạng thái từ ảnh gốc nhưng GÁN NHẦM tên 2 sao khi chép lại — không
dùng bằng chứng này để tự đổi POSITION (đúng mục VII "không dùng status để suy luận vị trí"), chỉ ghi nhận
đây là 1 dấu hiệu CỦNG CỐ thêm, không phải bằng chứng chính.

### Kết luận GM-005

`ENGINE_SUPPORTED`. `POSSIBLE_GM_TRANSCRIPTION_ERROR` (hoán đổi nhãn 2 sao) — không kết luận "GM bị đảo"
suông, đã chứng minh bằng: (1) công thức offset tự nhất quán 0 mismatch toàn bộ 6 GM, (2) nguồn độc lập
GM-SOURCE-C xác nhận rule tổng quát không hoán đổi, (3) trạng thái tự ghi trong chính GM-005 khớp vị trí
Engine chứ không khớp vị trí GM tự claim.

**Không sửa Golden Master, không sửa engine, không xóa `it.fails()`.**

---

## 4. GM-006 audit — Vũ Khúc / Phá Quân

### Input GM-006
```
Nam, Dương lịch 04/02/2026 02:30, Âm lịch 17/12/2025, Can Chi năm Ất Tỵ (KHÔNG phải Bính Ngọ), GMT+7
```

### Tính lại bằng engine
```
Mệnh = Tý(0), Thân = Dần(2) [Thân cư Phúc Đức], Cục = Hỏa Lục Cục
tuViChiIndex = 3 (Mão), thienPhuChiIndex = mod12(4-3) = 1 (Sửu)
```

### Đối chiếu đầy đủ

| Mục | Engine | GM-006 text | Khớp? |
|---|---|---|---|
| Calendar (2026→Âm 2025, Ất Tỵ) | Đúng | Đúng | ✅ |
| Mệnh | Tý | Tý | ✅ (đã VERIFIED) |
| Thân (cư Phúc Đức) | Dần | Dần | ✅ (đã VERIFIED) |
| Cục | Hỏa Lục Cục | Hỏa Lục Cục | ✅ |
| 12/14 chính tinh còn lại | — | — | ✅ (đã kiểm Phase 17) |
| **Vũ Khúc** | **Hợi** (offset-4 từ tuVi=3) | **Mão** ("Huynh Đệ") | ❌ |
| **Phá Quân** | **Hợi** (offset+10 từ thienPhu=1) | **Mão** ("Huynh Đệ") | ❌ |

### Phát hiện mấu chốt: mâu thuẫn NỘI BỘ ngay trong chính GM-006, không cần nguồn ngoài

GM-006 tự ghi **cả 2** thông tin sau, và chúng tự mâu thuẫn với nhau:
1. "Mệnh: Tý" (đã tự xác nhận, PASS, không nằm trong nhóm `it.fails()`).
2. "Mão Huynh Đệ: Vũ Khúc(H), Phá Quân(H)" — ngụ ý cung "Huynh Đệ" = Mão.

Nhưng quy tắc 12 cung nghịch từ Mệnh (`CUNG_NAMES_TU_MENH_NGHICH`) đã **VERIFIED từ GM-001** (khớp tuyệt
đối, chưa từng sai ở bất kỳ GM nào, kể cả chính GM-006 cho 12/14 cung còn lại): cung "Huynh Đệ" luôn cách
Mệnh đúng 1 bước nghịch, tức `chiIndex(Huynh Đệ) = mod12(menhChiIndex - 1)`. Với Mệnh=Tý(0):
`mod12(0-1) = 11` = **Hợi**, KHÔNG PHẢI Mão.

Nói cách khác: **chính GM-006 tự phủ định chính nó** — nếu Mệnh thật sự là Tý (điều GM-006 tự khẳng định
và đã verified đúng), thì "Huynh Đệ" bắt buộc phải là Hợi theo đúng công thức đã dùng nhất quán cho toàn
bộ 12 cung của chính GM-006 (11/12 cung còn lại đều khớp công thức này không sai 1 ô nào) — không thể vừa
là Mão vừa đúng công thức đó được. Đây là bằng chứng KHÔNG CẦN NGUỒN NGOÀI, tự nó đã đủ mạnh.

### Đối chiếu với Phase 17 (Vũ Khúc 3 giá trị)

Phase 17 từng ghi nhận Vũ Khúc@Mão có 3 giá trị TRẠNG THÁI khác nhau (Nguyên Cát=Đắc, GM-003=Miếu,
GM-006=Hãm). Phase 28 làm rõ thêm: GM-006 **không thực sự nói về ô Vũ Khúc@Mão** — do lỗi nhãn Chi, giá
trị "(H)=Hãm" mà GM-006 ghi thực chất mô tả **Vũ Khúc@Hợi** (vị trí thật theo engine), không phải Mão.
Tra Nguyên Cát: `Vũ Khúc @ Hợi = Hãm` — **khớp CHÍNH XÁC** với "(H)" GM-006 tự ghi! Tương tự, `Phá Quân @
Hợi = Hãm` (Nguyên Cát) cũng khớp "(H)" GM-006 tự ghi cho Phá Quân. Cả 2 trạng thái GM-006 tự ghi đều khớp
đúng vị trí Hợi (vị trí Engine), không khớp Mão (vị trí GM tự claim) — củng cố thêm cho giả thuyết lỗi nhãn
Chi (không dùng làm bằng chứng chính, chỉ củng cố, đúng mục VII).

**Kết luận phụ cho Phase 17**: mâu thuẫn 3-way trước đây ở Vũ Khúc@Mão trên thực tế chỉ còn là 2-way thật
sự (Nguyên Cát=Đắc vs GM-003=Miếu) — GM-006 không phải là 1 điểm dữ liệu độc lập hợp lệ cho đúng ô Mão như
tưởng trước đây. **Không sửa status table** dựa trên phát hiện này (ngoài phạm vi Phase 28, đây là quan
sát để ghi chép, quyết định thuộc phase khác nếu cần).

### Kết luận GM-006

`ENGINE_SUPPORTED`. `POSSIBLE_GM_TRANSCRIPTION_ERROR` — chứng minh bằng chính dữ liệu nội bộ GM-006 (Mệnh
đã verified + công thức 12 cung đã verified từ GM-001 + áp dụng chính xác cho 11/12 cung còn lại của
GM-006), không cần nguồn ngoài. Củng cố thêm bởi trạng thái tự ghi khớp đúng vị trí Hợi.

**Không sửa Golden Master, không sửa engine, không xóa `it.fails()`.**

---

## 5. Source hierarchy

| Nguồn | Level | Dùng cho | Độc lập? |
|---|---|---|---|
| GM-SOURCE-B (tuvinamphai.vn, đọc trực tiếp Phase 15) | 3 (phần mềm độc lập) | GM-003 | Độc lập với GM Pack, độc lập với engine |
| GM-SOURCE-C (tuvinamphai.vn, đọc trực tiếp Phase 15) | 3 | GM-005 | Độc lập với GM Pack, độc lập với engine |
| Nguyên Cát `MAIN_STAR_STATUS` (đã khóa Phase 16) | — (dùng để đối chiếu nội bộ, không phải nguồn vị trí) | GM-005, GM-006 (bằng chứng phụ) | Không tính là "nguồn vị trí" — chỉ dùng cross-check trạng thái |
| Quy tắc 12 cung nghịch (VERIFIED từ GM-001) | 3 (Golden Master gốc) | GM-006 | Đã VERIFIED độc lập từ lâu, không phải suy diễn mới |

Không có nguồn nào thuộc diện "nhiều URL chép lại 1 bài" trong phần audit vị trí này — 2 lá số
tuvinamphai.vn (GM-SOURCE-B, C) là 2 candidate KHÁC NHAU (ngày sinh khác nhau), không phải bản sao của
nhau.

---

## 6. Independent evidence (tóm tắt)

```
GM-003: GM-SOURCE-B (tuvinamphai.vn) — cùng tuViChiIndex=7 — Thiên Đồng+Thiên Lương cùng cung Dần.
GM-005: GM-SOURCE-C (tuvinamphai.vn) — xác nhận rule Tham Lang+2/Thất Sát+6 không hoán đổi (chart khác,
        rule tổng quát).
GM-006: Chính GM-006 tự mâu thuẫn nội bộ (Mệnh=Tý + công thức 12 cung đã VERIFIED từ GM-001).
```

---

## 7. Formula comparison

Đã dump lại toàn bộ 14 offset (6 sao Vòng Tử Vi + 8 sao Vòng Thiên Phủ) cho cả 6 GM bằng script kiểm tra
độc lập (không dùng lại logic `engine.ts`, tự tính `mod12(base + offset)` rồi so với vị trí thực tế mà
`tinhTuVi()` xuất ra):

```
GM-001: 14/14 offset khớp, 0 mismatch
GM-002: 14/14 offset khớp, 0 mismatch
GM-003: 14/14 offset khớp, 0 mismatch (kể cả Thiên Lương — engine tự nhất quán với chính công thức của nó)
GM-004: 14/14 offset khớp, 0 mismatch
GM-005: 14/14 offset khớp, 0 mismatch (kể cả Tham Lang/Thất Sát)
GM-006: 14/14 offset khớp, 0 mismatch (kể cả Vũ Khúc/Phá Quân)
```

**Kết luận formula**: `TU_VI_RING`/`THIEN_PHU_RING` (offset cố định, không đổi theo Cục/Mệnh) áp dụng
NHẤT QUÁN TUYỆT ĐỐI cho cả 84 cặp (14 sao × 6 GM) — không có bất kỳ trường hợp nào engine tự mâu thuẫn với
chính công thức của nó. 3 "conflict" đều là ENGINE vs GM-TEXT, không phải ENGINE vs CHÍNH NÓ.

---

## 8. Conflict matrix

| Conflict | GM position | Engine position | Source position | Independent evidence | Conclusion |
|---|---|---|---|---|---|
| GM-003 Thiên Lương | Thân | Dần | Dần (GM-SOURCE-B) | Level 3, cùng cấu trúc `tuViChiIndex` | `ENGINE_SUPPORTED` |
| GM-005 Tham Lang | Dần | Tuất | Tuất-pattern xác nhận qua GM-SOURCE-C (rule tổng quát) | Level 3 + status cross-check | `ENGINE_SUPPORTED` |
| GM-005 Thất Sát | Tuất | Dần | Dần-pattern xác nhận qua GM-SOURCE-C (rule tổng quát) | Level 3 + status cross-check | `ENGINE_SUPPORTED` |
| GM-006 Vũ Khúc | Mão | Hợi | Hợi (suy từ chính Mệnh=Tý đã verified của GM-006) | Nội bộ (GM-001 rule) + status cross-check | `ENGINE_SUPPORTED` |
| GM-006 Phá Quân | Mão | Hợi | Hợi (cùng lý do) | Nội bộ + status cross-check | `ENGINE_SUPPORTED` |

Không dùng "majority wins" — mỗi kết luận đều dựa trên bằng chứng CỤ THỂ riêng (không đếm số nguồn).

---

## 9. Conclusion từng conflict

```
GM-003: ENGINE_SUPPORTED — Thiên Lương@Dần đúng theo engine, GM-003 text nghi lỗi transcription.
GM-005: ENGINE_SUPPORTED — Tham Lang@Tuất/Thất Sát@Dần đúng theo engine, GM-005 text nghi hoán đổi nhãn.
GM-006: ENGINE_SUPPORTED — Vũ Khúc/Phá Quân@Hợi đúng theo engine, GM-006 text nghi lỗi nhãn Chi ("Mão"
        đáng lẽ phải là "Hợi").
```

---

## 10. Implementation decision

**KHÔNG sửa code.** Điều kiện bắt buộc ở mục X ("xác định chắc engine hiện tại SAI") KHÔNG xảy ra ở cả 3
trường hợp — ngược lại, bằng chứng cho thấy ENGINE ĐÚNG. Do đó không có "position rule" nào cần sửa.

**KHÔNG sửa Golden Master** (đúng nguyên tắc tuyệt đối của toàn bộ 28 phase — Golden Master là dữ liệu do
người dùng cung cấp, không tự ý chỉnh sửa dù nghi ngờ có lỗi transcription).

**KHÔNG xóa `it.fails()`** — các test này vẫn đúng chức năng của chúng: ghi nhận trung thực rằng ENGINE và
TEXT của GM Pack khác nhau ở đúng 5 điểm đã biết. Việc Phase 28 kết luận "khả năng cao GM Pack sai" không
làm thay đổi THỰC TẾ là 2 nguồn dữ liệu (engine vs GM Pack text) vẫn khác nhau — `it.fails()` phản ánh đúng
thực tế đó, không phải phản ánh "ai đúng ai sai".

---

## 11. Regression result

Không sửa code → không cần chạy regression theo nghĩa "kiểm tra thay đổi có phá gì không". Đã chạy lại để
xác nhận trạng thái ổn định:

```
npx vitest run
```

```
Test Files  22 passed (22)
     Tests  670 passed | 5 expected fail (675)
```

Không đổi so với cuối Phase 27. 5 expected-fail giữ nguyên y hệt (4 vị trí chính tinh đã audit ở phase này
+ 1 Tuần GM-006, không thuộc phạm vi Phase 28).

---

## 12. Remaining risks

| Rủi ro | Mức độ |
|---|---|
| Kết luận "GM Pack lỗi transcription" chưa được XÁC NHẬN TUYỆT ĐỐI bằng ảnh gốc GM-003/005/006 thật (chỉ suy luận gián tiếp qua GM-SOURCE-B/C khác candidate + tự mâu thuẫn nội bộ) | Trung bình — bằng chứng mạnh nhưng không phải "nhìn thấy ảnh gốc nói khác" |
| Nếu sau này có ảnh gốc thật của GM-003/005/006 xác nhận NGƯỢC LẠI (đúng như text hiện tại) | Thấp — nhưng vẫn là khả năng cần giữ mở, không tự đóng conflict |
| `it.fails()` tiếp tục tồn tại vô thời hạn nếu không ai xác nhận dứt điểm | Chấp nhận được — đây là trạng thái AN TOÀN (trung thực) hơn là tự sửa GM hoặc engine mà không chắc chắn 100% |

---

## FINAL DECISION

```
GM-003: UNRESOLVED (evidence nghiêng mạnh về ENGINE_SUPPORTED, nhưng KHÔNG sửa GM nên vẫn còn "unresolved"
        theo nghĩa formal — conflict vẫn tồn tại trong dữ liệu, chỉ là đã có lời giải thích hợp lý)
GM-005: UNRESOLVED (cùng lý do)
GM-006: UNRESOLVED (cùng lý do)
```

**Lưu ý về "UNRESOLVED"**: cách dùng ở đây nghĩa là "Golden Master conflict vẫn CÒN TỒN TẠI trong dữ liệu"
(vì không sửa GM/engine), KHÔNG có nghĩa "không tìm ra lời giải thích". Cả 3 trường hợp đều đã có bằng
chứng độc lập + công thức + nguồn cùng chỉ về 1 kết luận (`ENGINE_SUPPORTED`) — nhưng theo đúng mục XV
("Chỉ sửa khi SOURCE + EVIDENCE + FORMULA cùng chỉ về 1 kết luận" — cả 3 điều kiện đã thỏa để KẾT LUẬN,
nhưng sửa GM là hành động KHÔNG ĐƯỢC PHÉP theo mục XII bất kể mức độ chắc chắn), nên trạng thái GM Pack
formal vẫn giữ nguyên UNRESOLVED/CONFLICTED, chỉ có NHẬN ĐỊNH (không phải QUYẾT ĐỊNH) được ghi nhận.

```
POSITION_ENGINE_NOT_READY
```

Lý do gọi `NOT_READY` (không phải vì engine sai, mà vì "ready" đòi hỏi 0 conflict CÒN TỒN TẠI trong dữ
liệu chính thức) — cả 3 `it.fails()` vẫn còn đó, GM Pack vẫn chưa được xác nhận/sửa lại bởi người có thẩm
quyền (chủ dữ liệu). Engine tự nó có thể coi là đáng tin cậy cao (`ENGINE_SUPPORTED` cả 3/3), nhưng
"POSITION_ENGINE_READY" đòi hỏi khớp 100% với Golden Master đã cung cấp, điều này chưa đạt được và sẽ
không đạt được nếu không có hành động từ người dùng (xác nhận lại ảnh gốc, hoặc chính thức chấp nhận sửa
GM Pack).

**KHÔNG COMMIT/PUSH.**
