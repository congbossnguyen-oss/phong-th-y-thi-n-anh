# TUVI RULE FORENSICS — Chủ Mệnh/Chủ Thân, 4 nghi vấn transcription, Thiên Việt

Phase forensics độc lập, tiếp theo `docs/TUVI_STATUS_FORENSICS.md`. KHÔNG sửa engine, KHÔNG sửa Golden
Master, KHÔNG commit/push.

---

# PHẦN B — CHỦ MỆNH / CHỦ THÂN

## B1. Implementation hiện tại — input chính xác đang dùng

File `src/lib/tu-vi/engine.ts`, dòng 159-160:

```ts
const chuMenh = CHU_MENH_TABLE[menhChiIndex];
const chuThan = CHU_THAN_TABLE[thanChiIndex];
```

**Input đang dùng: `menhChiIndex`** (Chi của CUNG MỆNH, biến động theo tháng Âm lịch + giờ sinh) cho
Chủ Mệnh, và **`thanChiIndex`** (Chi của CUNG THÂN) cho Chủ Thân. **KHÔNG dùng `yearChiIndex`** (Chi năm
sinh) ở bất kỳ đâu trong 2 dòng này. Đây là câu trả lời chính xác cho câu hỏi "yearBranch? menhBranch?
hay input khác?" — hiện tại là **menhBranch/thanBranch**, không phải yearBranch.

## B2. Bảng hiện tại (nguyên trạng, không sửa)

`CHU_MENH_TABLE` và `CHU_THAN_TABLE` (`src/lib/tu-vi/rules.ts`), key = chỉ số Chi 0-11 (Tý=0):

| Chi Index | Chi | Current Chủ Mệnh (áp cho Chi cung Mệnh) | Current Chủ Thân (áp cho Chi cung Thân) |
|---|---|---|---|
| 0 | Tý | Tham Lang | Hỏa Tinh |
| 1 | Sửu | Cự Môn | Thiên Tướng |
| 2 | Dần | Liêm Trinh | Thiên Lương |
| 3 | Mão | Văn Khúc | Thiên Đồng |
| 4 | Thìn | Vũ Khúc | Văn Xương |
| 5 | Tỵ | Thiên Đồng | Thiên Cơ |
| 6 | Ngọ | Phá Quân | Hỏa Tinh |
| 7 | Mùi | Thiên Đồng | Thiên Tướng |
| 8 | Thân | Vũ Khúc | Thiên Lương |
| 9 | Dậu | Văn Khúc | Thiên Đồng |
| 10 | Tuất | Liêm Trinh | Văn Xương |
| 11 | Hợi | Cự Môn | Thiên Cơ |

## B3. Đối chiếu với 6 Golden Master

| GM | Năm sinh (Chi) | Mệnh (Chi) | Thân (Chi) | Chủ Mệnh kỳ vọng | Chủ Mệnh hiện tại | Khớp? | Chủ Thân kỳ vọng | Chủ Thân hiện tại | Khớp? |
|---|---|---|---|---|---|---|---|---|---|
| GM-001 | Thân | Dần | Dần | Liêm Trinh | Liêm Trinh (tra Dần) | ✅ | Thiên Lương | Thiên Lương (tra Dần) | ✅ |
| GM-002 | Thân | Dần | Dần | Liêm Trinh | Liêm Trinh (tra Dần) | ✅ | Thiên Lương | Thiên Lương (tra Dần) | ✅ |
| GM-003 | Ngọ | Dần | Dần | Phá Quân | Liêm Trinh (tra Dần) | ❌ | Hỏa Tinh | Thiên Lương (tra Dần) | ❌ |
| GM-004 | Sửu | Dần | Dần | Cự Môn | Liêm Trinh (tra Dần) | ❌ | Thiên Tướng | Thiên Lương (tra Dần) | ❌ |
| GM-005 | Sửu | Thân | Thân | Cự Môn | Vũ Khúc (tra Thân) | ❌ | Thiên Tướng | Thiên Lương (tra Thân) | ❌ |
| GM-006 | Tỵ | Tý | Dần | Vũ Khúc | Tham Lang (tra Tý) | ❌ | Thiên Cơ | Thiên Lương (tra Dần) | ❌ |

**Kết quả: 2/6 GM khớp (GM-001, GM-002 — chính là cặp đã dùng để "hiệu chỉnh" bảng ban đầu), 4/6 GM sai
hoàn toàn (GM-003, 004, 005, 006).**

## B4. Suy luận biến số thật (không suy diễn 12 Chi từ 4 Chi đã biết — chỉ dùng phép loại trừ trên chính
6 GM đã có)

3 phép kiểm chứng loại trừ, mỗi phép dùng đúng 1 cặp GM có ít nhất 1 biến giữ nguyên và 1 biến đổi khác:

**Kiểm tra 1 — có phải khóa là Chi cung Mệnh không?**
GM-001 và GM-003: Chi cung Mệnh GIỐNG NHAU (Dần = Dần), nhưng Chủ Mệnh/Chủ Thân kỳ vọng KHÁC NHAU
(Liêm Trinh/Thiên Lương vs Phá Quân/Hỏa Tinh). → **Bác bỏ giả thuyết "khóa = Chi cung Mệnh"** (cùng input
phải cho cùng output nếu là hàm thuần túy của input đó).

**Kiểm tra 2 — có phải khóa là Chi cung Thân không?**
GM-001 và GM-003: Chi cung Thân CŨNG giống nhau (Dần = Dần, vì cả 2 lá số đều Mệnh/Thân đồng cung), vẫn
cho kỳ vọng khác nhau. → **Bác bỏ giả thuyết "khóa = Chi cung Thân"** bằng chính cặp dữ liệu trên.

**Kiểm tra 3 — có phải khóa là Chi năm sinh không?**
GM-004 và GM-005: Chi năm sinh GIỐNG NHAU (Sửu = Sửu), Chi cung Mệnh/Thân KHÁC NHAU (Dần vs Thân), giới
tính KHÁC NHAU (Nữ vs Nam) — nhưng Chủ Mệnh/Chủ Thân kỳ vọng GIỐNG HỆT NHAU (Cự Môn/Thiên Tướng cho cả
2). → **Nhất quán với giả thuyết "khóa = Chi năm sinh"** (đồng thời loại luôn giới tính khỏi danh sách
biến số nghi vấn, vì GM-004/005 khác giới tính mà vẫn ra cùng kết quả).

**Biến số khác đã xét và loại (không phải suy diễn, có bằng chứng trực tiếp):**
- **Can năm sinh**: GM-001 và GM-003 CÙNG Can Canh nhưng kỳ vọng khác nhau → loại.
- **Cục**: GM-001 và GM-003 CÙNG Thổ Ngũ Cục nhưng kỳ vọng khác nhau → loại.
- **Mệnh Quái**: KHÔNG loại được hoàn toàn bằng dữ liệu hiện có — GM-004 (Chấn) và GM-005 (Chấn) cùng
  Mệnh Quái VÀ cùng kỳ vọng (không phân biệt được với giả thuyết Chi năm sinh vì 2 đại lượng này tương
  quan trong tập dữ liệu hiện tại). Về mặt lý luận hệ thống (Mệnh Quái thuộc Bát Trạch, một hệ thống
  hoàn toàn khác Tử Vi) khả năng thấp, nhưng **chưa có bằng chứng loại trừ dứt khoát** — ghi nhận minh
  bạch, không tự loại.

```
LIKELY_RULE = YEAR_BRANCH
```

Với ghi chú: Mệnh Quái chưa bị loại trừ hoàn toàn bằng phép kiểm chứng trực tiếp (chỉ bị loại bằng lý do
hệ thống, không phải bằng chứng dữ liệu), nên `LIKELY_RULE = YEAR_BRANCH` là giả thuyết **có bằng chứng
mạnh nhất trong số đã kiểm tra được**, không phải kết luận tuyệt đối.

## B5. Bảng "Year Branch → Chủ Mệnh/Chủ Thân" — CHỈ những gì đã VERIFIED, không suy diễn phần còn lại

| Chi năm sinh | Chủ Mệnh (VERIFIED) | Chủ Thân (VERIFIED) | Nguồn |
|---|---|---|---|
| Thân | Liêm Trinh | Thiên Lương | GM-001, GM-002 (2 GM độc lập, cùng kết quả) |
| Ngọ | Phá Quân | Hỏa Tinh | GM-003 (1 GM) |
| Sửu | Cự Môn | Thiên Tướng | GM-004, GM-005 (2 GM độc lập, cùng kết quả dù khác giới tính VÀ khác Chi Mệnh) |
| Tỵ | Vũ Khúc | Thiên Cơ | GM-006 (1 GM) |
| Tý | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Sửu | *(đã có ở trên)* | | |
| Dần | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Mão | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Thìn | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Mùi | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Dậu | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Tuất | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |
| Hợi | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER_REVIEW | chưa có dữ liệu |

**4/12 Chi năm sinh đã VERIFIED (Thân, Ngọ, Sửu, Tỵ). 8/12 còn lại: NEED_GOLDEN_MASTER_REVIEW — KHÔNG
suy diễn theo bất kỳ pattern nào (không giả định đối xứng, không giả định tuần hoàn) vì bản thân bảng
hiện tại đã chứng minh (mục B3) rằng đoán theo trực giác/trí nhớ là không đáng tin.**

## B6. Đã đủ bằng chứng để SỬA CODE chưa?

**CHƯA ĐỦ.** Có bằng chứng mạnh về BIẾN SỐ đúng (Chi năm sinh thay vì Chi cung Mệnh/Thân — mục B4), nhưng
chỉ có 4/12 GIÁ TRỊ cụ thể được xác nhận (mục B5). Sửa code lúc này đồng nghĩa phải:
(a) đổi khóa tra bảng (rủi ro thấp, có bằng chứng), NHƯNG
(b) phải điền 8/12 giá trị còn lại — nếu điền bằng suy đoán/trí nhớ sẽ lặp lại đúng sai lầm đã dẫn đến
tình trạng hiện tại (bảng "trông như đã verified" nhưng thực ra đoán bừa 8/12 ô).

**Khuyến nghị: KHÔNG sửa code cho tới khi có thêm tối thiểu 8 Golden Master mới (mỗi Golden Master 1 Chi
năm sinh chưa có), hoặc 1 nguồn bảng Chủ Mệnh/Chủ Thân đầy đủ 12 Chi năm sinh đáng tin cậy.**

---

# PHẦN C — 4 TRANSCRIPTION CONFLICTS

Ghi chú quan trọng: em KHÔNG có quyền truy cập trực tiếp vào ảnh gốc lá số (chỉ có văn bản
`TuVi_Golden_Master_Pack_V1.md` do người dùng gõ lại/tóm tắt từ ảnh) — nên "bằng chứng" dưới đây là bằng
chứng NỘI BỘ (đối chiếu chéo giữa các công thức đã VERIFIED và giữa các dòng trong chính pack), không
phải xem lại ảnh gốc. Đây là giới hạn thật của forensics này, ghi rõ để không gây hiểu lầm.

## C1. GM-003 — vị trí Thiên Lương

| Trường | Giá trị |
|---|---|
| GM | GM-003 (Nam Canh Ngọ 1990) |
| Field | Vị trí (Chi) của sao Thiên Lương |
| Giá trị trong GM | "Thân Thiên Di: Thiên Lương(M)" — tại Chi Thân |
| Giá trị engine | Chi Dần (offset+5 từ Thiên Phủ, Thiên Phủ@Dậu → Thiên Lương@Dần) |
| Bằng chứng nội bộ | Công thức offset+5 từ Thiên Phủ đã VERIFIED độc lập ở GM-001 (Thiên Phủ@Ngọ →
  Thiên Lương@Hợi, khớp đúng). Vị trí Thiên Phủ@Dậu của GM-003 tự nó KHỚP với pack ("Dậu Tật Ách:
  Thiên Phủ(B)"). Áp cùng 1 công thức đã verified cho ra Dần, không phải Thân. |
| Lý do nghi ngờ transcription | Nếu Thiên Lương thật sự ở Thân, công thức offset+5 (đã verified ở
  GM-001) sẽ phải sai — nhưng công thức này áp dụng khớp đúng cho 5/6 GM khác không có vấn đề gì. Khả
  năng cao hơn là dòng "Thân Thiên Di: Thiên Lương(M)" trong pack bị gán nhầm Chi khi biên soạn (có thể
  ảnh gốc ghi đúng nhưng người soạn pack gõ nhầm cột/dòng). |
| Dữ liệu cần xác minh lại | Xem lại ảnh gốc GM-003: ô "Thiên Di" nằm ở Chi nào (Thân hay Dần), và sao
  nào thực sự nằm trong ô đó. |

## C2. GM-005 — vị trí Tham Lang / Thất Sát (hoán đổi Dần↔Tuất)

| Trường | Giá trị |
|---|---|
| GM | GM-005 (Nam Đinh Sửu 1997, giờ Tý) |
| Field | Vị trí (Chi) của Tham Lang và Thất Sát |
| Giá trị trong GM | "Dần Phúc Đức: Tham Lang(V)" và "Tuất Thiên Di: Thất Sát(M)" |
| Giá trị engine | Tham Lang@Tuất, Thất Sát@Dần (ngược hoàn toàn) |
| Bằng chứng nội bộ | HAI công thức độc lập cùng chỉ về 1 kết quả: (a) vòng sao — Thiên Phủ@Thân (khớp
  pack), Tham Lang = Thiên Phủ+2 = Tuất; (b) tên cung — Mệnh@Thân, Phúc Đức = Mệnh+2 = Tuất (quy tắc đã
  verified ở GM-001..004). Cả 2 công thức độc lập đều cho "Tuất = Phúc Đức = Tham Lang", trùng khớp
  nhau nhưng NGƯỢC với pack. |
| Lý do nghi ngờ transcription | Xác suất 2 công thức ĐỘC LẬP (1 về vị trí sao, 1 về tên cung) cùng sai
  theo đúng 1 kiểu để tạo ra kết quả tự nhất quán với nhau là rất thấp. Nhiều khả năng 2 dòng "Dần" và
  "Tuất" trong bảng gốc bị đảo chỗ khi gõ lại thành pack (lỗi copy 2 dòng liền kề bị hoán vị). |
| Dữ liệu cần xác minh lại | Xem lại ảnh gốc GM-005: ô Dần và ô Tuất, xác nhận tên cung VÀ sao chính xác
  của từng ô (không chỉ 1 trong 2). |

## C3. GM-006 — vị trí Vũ Khúc / Phá Quân (nghi vấn dòng "Mão"/"Hợi")

| Trường | Giá trị |
|---|---|
| GM | GM-006 (Nam 04/02/2026, Âm lịch Ất Tỵ) |
| Field | Vị trí (Chi) của Vũ Khúc và Phá Quân |
| Giá trị trong GM | "Mão Huynh Đệ: Vũ Khúc(H), Phá Quân(H)"; dòng Hợi ghi "Hợi Huynh?* [theo mapping
  trong ảnh]" — **chính pack tự đánh dấu dòng này không chắc chắn** |
| Giá trị engine | Vũ Khúc+Phá Quân@Hợi; Mão = Điền Trạch (chứa Tử Vi+Tham Lang) |
| Bằng chứng nội bộ | Quy tắc tên cung Mệnh@Tý → Huynh Đệ = Mệnh-1 = Hợi (đã verified qua GM-001..005)
  khớp đúng vị trí Hợi, không phải Mão. Chính pack đã đánh dấu "Hợi Huynh?*" là chưa chắc chắn — tên cung
  "Huynh?" trùng khớp với "Huynh Đệ" mà engine tính ra cho Hợi. |
| Lý do nghi ngờ transcription | Bằng chứng ở đây MẠNH HƠN 2 trường hợp trên vì chính tài liệu nguồn tự
  nhận dòng Hợi không chắc chắn — khả năng cao nội dung đúng của dòng Hợi ("Huynh Đệ: Vũ Khúc, Phá Quân")
  bị tách nhầm sang dòng Mão trong lúc biên soạn, để lại dòng Hợi trống/không chắc. |
| Dữ liệu cần xác minh lại | Xem lại ảnh gốc GM-006: nội dung đầy đủ của ô Hợi (đã bị pack tự nhận là
  chưa rõ), và xác nhận ô Mão thực sự chứa sao gì. |

## C4. GM-006 — Tuần Không (trùng hệt GM-001 dù khác năm sinh)

| Trường | Giá trị |
|---|---|
| GM | GM-006 (năm Can Chi: Ất Tỵ) |
| Field | Tuần Không (2 cung) |
| Giá trị trong GM | "Tuần: Tý-Sửu" — **giống hệt** GM-001 (năm Canh Thân) |
| Giá trị engine | Dần-Mão (tính từ Can Chi năm Ất Tỵ, thuộc tuần Giáp Thìn trong Lục Thập Hoa Giáp) |
| Bằng chứng nội bộ | Công thức Tuần Không (tìm 2 Chi "dư" của tuần Giáp-Tý chứa Can Chi đang xét) đã
  verified khớp GM-001 (Canh Thân → tuần Giáp Dần → Không = Tý-Sửu). Áp đúng công thức đó cho Ất Tỵ (tuần
  Giáp Thìn) phải ra Dần-Mão, không thể ra Tý-Sửu (Canh Thân và Ất Tỵ ở 2 tuần Lục Thập Hoa Giáp khác hẳn
  nhau, không có lý do toán học nào khiến chúng trùng Tuần Không). |
  | Lý do nghi ngờ transcription | 2 giá trị Tuần Không giống hệt nhau cho 2 năm sinh khác hẳn nhau, đúng
  bằng giá trị của GM-001 — nhiều khả năng dòng "Tuần: Tý-Sửu" của GM-006 bị copy nhầm từ GM-001 khi biên
  soạn pack (2 mục này liền kề nhau về cấu trúc "Expected trung tâm"). |
| Dữ liệu cần xác minh lại | Xem lại ảnh gốc GM-006: giá trị Tuần Không thực sự ghi trên ảnh (nếu ảnh
  cũng ghi Tý-Sửu thì đây không phải lỗi biên soạn mà là mâu thuẫn thật cần xem lại công thức Tuần Không
  đang dùng — hiện tính theo Can Chi NĂM, có thể profile này dùng Can Chi NGÀY như 1 khả năng khác đã nêu
  trong `docs/TUVI_ENGINE_AUDIT.md` mục B1, "Tuần theo NĂM hay theo NGÀY chưa được spec chọn rõ"). |

---

# PHẦN D — THIÊN VIỆT

Trạng thái giữ nguyên, KHÔNG thay đổi implementation, KHÔNG coi là VERIFIED:

```
NEED_GOLDEN_MASTER_REVIEW
```

Xác nhận lại: cả 6 Golden Master (GM-001 → GM-006) trong `TuVi_Golden_Master_Pack_V1.md` **không có bất
kỳ dòng nào ghi vị trí Thiên Việt tường minh** (khác với Thiên Khôi/Lộc Tồn/Kình Dương/Đà La — các phụ
tinh này cũng không xuất hiện trong pack). Bảng `THIEN_VIET_TABLE` hiện tại (Thiên Ất Quý Nhân cổ điển,
thêm ở Phase 1 lần trước) vẫn là quyết định đơn phương chưa được người dùng xác nhận, và spec gốc
(`TuVi_Engine_V2.md` §19) chỉ cấm cách tính đối xứng cũ chứ không cung cấp bảng thay thế. Không có gì
thay đổi so với `docs/TUVI_ENGINE_REAUDIT.md` mục 2.2.

---

# TRẢ LỜI 5 CÂU HỎI

**1. Status table có nguồn xác nhận đầy đủ hay không?**
Không. `STATUS_TABLE_SOURCE = INCOMPLETE`. Spec chỉ cho 3 điểm bắt buộc; 6 Golden Master cộng lại chỉ phủ
66/168 ô (39%), và trong số đó chỉ 27 ô (16% tổng bảng, 43,5% trong số ô có dữ liệu) thực sự khớp bảng
hiện tại.

**2. Cần bao nhiêu Golden Master bổ sung?**
Ước tính cần thêm **8-10 Golden Master** nữa để phủ hết 102 ô Miếu/Vượng còn UNVERIFIED (mỗi lá số mới
thường xác nhận thêm ~10-13 ô, có trùng lặp) — hoặc hiệu quả hơn: 1 bảng tra cứu đầy đủ 14×12 từ 1 nguồn
đáng tin cậy duy nhất, thay vì tiếp tục cộng dồn từng lá số lẻ.

**3. Chủ Mệnh/Chủ Thân đã đủ bằng chứng để sửa chưa?**
Đủ bằng chứng về BIẾN SỐ (Chi năm sinh, không phải Chi cung Mệnh/Thân — đã loại trừ bằng 3 phép kiểm
chứng chéo), nhưng CHƯA đủ GIÁ TRỊ (chỉ 4/12 Chi năm sinh được xác nhận: Thân, Ngọ, Sửu, Tỵ). Khuyến
nghị: không sửa code cho tới khi có thêm Golden Master hoặc nguồn bảng cho 8 Chi còn lại.

**4. 4 transcription conflicts là gì?**
(1) GM-003: Thiên Lương ghi tại Thân, công thức đã verified cho Dần. (2) GM-005: Tham Lang/Thất Sát ghi
đảo ngược Dần↔Tuất so với 2 công thức độc lập đã verified. (3) GM-006: Vũ Khúc/Phá Quân ghi tại Mão trong
khi chính pack tự nhận dòng Hợi (nơi công thức tên cung chỉ tới) là không chắc chắn. (4) GM-006: Tuần
Không ghi trùng hệt GM-001 (Tý-Sửu) dù năm sinh khác hẳn, trong khi công thức đã verified cho Dần-Mão.

**5. Thiên Việt đang ở trạng thái nào?**
`NEED_GOLDEN_MASTER_REVIEW` — không đổi. Không có Golden Master nào (kể cả 6 lá mới) cho dữ liệu Thiên
Việt để xác nhận hay bác bỏ bảng hiện tại.

---

# KẾT LUẬN

**NOT READY FOR RULE IMPLEMENTATION**

Cả 2 vấn đề lớn nêu ra đầu phase đều được xác nhận nghiêm trọng hơn ước tính ban đầu (status table chỉ
43,5% khớp trên phần có dữ liệu chứ không phải "phần lớn đúng, vài chỗ sai"; Chủ Mệnh/Chủ Thân có bằng
chứng biến số rõ nhưng thiếu 8/12 giá trị cụ thể). Sửa code ở trạng thái dữ liệu hiện tại — dù theo đúng
hướng đã tìm ra — vẫn sẽ phải đoán một phần đáng kể (102/168 ô status, 8/12 Chi Chủ Mệnh/Thân), lặp lại
đúng vấn đề đã dẫn tới 2 lần audit trước. Cần Golden Master bổ sung hoặc nguồn bảng gốc trước khi triển
khai rule mới.
