# TUVI ENGINE — RE-AUDIT SAU KHI SỬA (Phase 6)

Theo dõi tiếp `docs/TUVI_ENGINE_AUDIT.md` (audit gốc) sau khi thực hiện Phase 1-5 theo yêu cầu. File này
chỉ báo cáo, **không commit/không push**.

---

## 1. SỐ TEST TRƯỚC/SAU

| | Trước (đầu phiên audit) | Sau (Phase 1-5) |
|---|---:|---:|
| File test Tử Vi | 1 (`tu-vi-golden.test.ts`) | 6 |
| Test Tử Vi | 36 (100% pass, 100% từ GM-001) | 158 (145 pass, 13 expected-fail) |
| Tổng test toàn site | 107 (100% pass) | 229 (216 pass, 13 expected-fail) |
| Số Golden Master độc lập dùng làm nguồn expected | 1 (GM-001) | 6 (GM-001 → GM-006) |
| `astro build` | pass | pass (đã build lại, không lỗi) |

13 "expected fail" = test cố ý viết bằng `it.fails()` để **ghi nhận công khai** những chỗ hiện SAI hoặc
CHƯA THỂ XÁC MINH (không phải lỗi chạy test, không phải bug trong test) — xem mục 4.

---

## 2. TỪNG BUG ĐÃ SỬA (Phase 1)

### 2.1 Tứ Hóa rơi mất trên phụ tinh (docs/TUVI_ENGINE_AUDIT.md mục E1.1) — ĐÃ SỬA

- Thêm field `tuHoa?` vào `PhuTinhO` (trước đây chỉ `ChinhTinhO` có field này).
- Chuyển vòng lặp gắn Tứ Hóa ra sau khi đã dựng xong `phuTinhTaiChi`, và duyệt CẢ HAI mảng
  (`chinhTinhTaiChi` + `phuTinhTaiChi`).
- Regression test: `tests/tu-vi-tu-hoa-full.test.ts` — xác nhận cả 10 Can, cả 4 nhãn Lộc/Quyền/Khoa/Kỵ
  đều gắn được lên đúng 1 sao thật (kể cả khi sao đó là Văn Xương/Văn Khúc/Hữu Bật/Tả Phù), bao gồm cả
  test xác nhận đúng-5-Can-bị-ảnh-hưởng (Bính, Kỷ, Mậu, Nhâm, Tân) mà audit gốc đã liệt kê.
- **21/21 test pass.**

### 2.2 Thiên Việt tính bằng đối xứng tự phát (mục E1.2) — ĐÃ SỬA MỘT PHẦN, CÒN RỦI RO MỚI ĐÃ GHI RÕ

- Xóa hoàn toàn `Việt = Khôi + 6`.
- Thêm `getThienViet(yearCanName)` tra bảng riêng (Thiên Ất Quý Nhân cổ điển), tách khỏi
  `getThienKhoi(yearCanName)` (giữ nguyên bảng Khôi spec-literal).
- **RỦI RO MỚI, ĐÃ GHI RÕ TRONG CODE VÀ Ở ĐÂY**: bảng Thiên Việt dùng là quyết định đơn phương (không có
  phản hồi từ người dùng cho câu hỏi làm rõ đã hỏi trước đó) — nhóm Can của bảng cổ điển này KHÁC nhóm
  Can của bảng Thiên Khôi lấy từ spec, nghĩa là Khôi và Việt hiện đến từ **2 nguồn khác nhau**. Trạng
  thái: **NEED_GOLDEN_MASTER_REVIEW** — không có Golden Master nào (kể cả GM-001 → GM-006 mới) cho vị trí
  Thiên Việt tường minh để đối chiếu.
- Test: `tests/tu-vi-thien-viet.test.ts` — xác nhận KHÔNG còn là công thức đối xứng cũ + bảng tự nhất
  quán cho đủ 10 Can. **22/22 test pass** (nhưng đây là test hành vi, không phải test "đúng dữ liệu").

### 2.3 `tinhMenhQuai` lỗi biên (mục E1.3) — ĐÃ SỬA

- Thay `if (so <= 0)` (chỉ sửa 1 chiều) bằng 2 vòng lặp `while` đối xứng cho cả nhánh Nam/Nữ.
- Regression test: `tests/tu-vi-menh-quai-boundary.test.ts` — 6 mốc năm (1800, 1900, 2000, 2001, 2021,
  2026) × 2 giới tính = 12 test "không crash / luôn trong 8 quái hợp lệ", cộng 2 test cụ thể xác nhận
  năm 1900/1800 Nam giờ trả về "Khảm" (trước đây sẽ là `undefined`).
- **16/16 test pass** (gồm cả 2 test GM-001/002 gốc di chuyển vào file này).

---

## 3. GOLDEN MASTER — PASS/FAIL THEO TỪNG GM

Nguồn: `docs/TuVi_Golden_Master_Pack_V1.md` (người dùng cung cấp). File test:
`tests/tu-vi-golden-gm002-006.test.ts`.

| GM | Calendar/Can Chi | Mệnh/Thân | Cục | Mệnh Quái | Chủ Mệnh/Thân | Tứ Hóa | Đại Vận (tuổi+hướng) | 14 chính tinh (vị trí) | Tuần |
|---|---|---|---|---|---|---|---|---|---|
| GM-001 | ✅ (baseline, đã có từ trước) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 14/14 | ✅ |
| GM-002 | ✅ | ✅ | ✅ | ✅ | ✅ (trùng GM-001) | ✅ | ✅ (đảo hướng đúng) | ✅ 14/14 | ✅ |
| GM-003 | ✅ | ✅ | ✅ | ✅ | ❌ **FAILED** | ✅ | ✅ | ✅ 13/14 (1 ô NEED_REVIEW) | — |
| GM-004 | ✅ | ✅ | ✅ | ✅ | ❌ **FAILED** | ✅ (đúng bộ Đinh, không lẫn Canh) | ✅ | ✅ 14/14 | — |
| GM-005 | ✅ | ✅ (giờ Tý — pass) | ✅ | ✅ | ❌ **FAILED** | ✅ | ✅ | ✅ 12/14 (2 ô NEED_REVIEW) | — |
| GM-006 | ✅ **(calendar boundary — pass, quan trọng nhất)** | ✅ (Mệnh≠Thân — pass) | ✅ | ✅ | ❌ **FAILED** | ✅ | ✅ | ✅ 10/12 (2 ô NEED_REVIEW) | ❌ **NEED_REVIEW** |

**2 test đặc biệt bắt buộc theo pack — cả 2 đều PASS:**
- Test B (GM-004 vs GM-005, đổi giờ Ngọ→Tý): Mệnh đổi từ Dần sang Thân — **PASS**, không còn lỗi Tý=0/Tý=1.
- Test C+D (GM-006, Dương 2026 / Âm 2025 Ất Tỵ, Mệnh Tý ≠ Thân Dần): **PASS cả 2** — đây là 2 test được
  chính pack đánh giá "quan trọng nhất" vì hay bị lỗi nhất (giờ Tý, ranh giới năm Âm lịch).

---

## 4. CÁC FAILED/NEED_GOLDEN_MASTER_REVIEW MỚI PHÁT HIỆN (không có trong audit gốc)

### 4.1 FAILED — Chủ Mệnh / Chủ Thân tra sai khóa (phát hiện mới, bằng chứng mạnh)

Audit gốc chỉ ghi nhận "chỉ 1 điểm Dần VERIFIED, 11 điểm còn lại DERIVED chưa kiểm chứng". Với dữ liệu
GM-003/004/005 mới, phát hiện: **bảng hiện tại tra sai khóa hoàn toàn**, không chỉ "thiếu dữ liệu".

Bằng chứng: `CHU_MENH_TABLE`/`CHU_THAN_TABLE` tra theo **Chi cung Mệnh**. Nhưng:
- GM-001 (Canh Thân, Mệnh=Dần) và GM-003 (Canh Ngọ, Mệnh=Dần) — **CÙNG Chi Mệnh (Dần)** nhưng Chủ Mệnh
  kỳ vọng KHÁC NHAU (Liêm Trinh vs Phá Quân).
- GM-004 (Mệnh=Dần) và GM-005 (Mệnh=Thân, cùng năm Đinh Sửu) — **KHÁC Chi Mệnh** nhưng Chủ Mệnh kỳ vọng
  GIỐNG NHAU (đều Cự Môn).

→ Bằng chứng nhất quán qua 2 cặp độc lập: **Chủ Mệnh/Chủ Thân phụ thuộc CHI NĂM SINH, không phải Chi
cung Mệnh.** Đã xác nhận 3/12 Chi năm (Thân→Liêm Trinh/Thiên Lương, Ngọ→Phá Quân/Hỏa Tinh,
Sửu→Cự Môn/Thiên Tướng; GM-006 năm Tỵ→Vũ Khúc/Thiên Cơ là điểm thứ 4). **CHƯA SỬA CODE** vì: (a) không
nằm trong 3 bug Phase 1 được chỉ định sửa, (b) chỉ biết 4/12 Chi năm, sửa nửa vời có thể tạo cảm giác
"đã xác minh" giả tạo. Khuyến nghị: làm rule mới có bảng đầy đủ 12 Chi năm ở vòng làm việc riêng.

6 test `it.fails()` ghi nhận đúng hiện tượng này (GM-003 ×2, GM-004 ×2, GM-005 ×2, GM-006 ×2 — tổng 8,
xem file test).

### 4.2 FAILED (hạ cấp nghiêm trọng) — Bảng Miếu/Vượng/Đắc/Bình/Hãm (`MAIN_STAR_STATUS`)

Audit gốc xếp bảng này DERIVED (mức tin cậy trung bình, 13/168 ô verified). Sau khi so với GM-003/004,
**tỷ lệ khớp thực tế cực thấp** ngoài 13 ô gốc:

- GM-003: so 13 ô mới (loại trừ ô Thiên Lương đang tranh chấp vị trí) → **chỉ 2/13 khớp** (Thất Sát@Mão,
  Thiên Phủ@Dậu).
- GM-004: so 13 ô mới → **chỉ 4/13 khớp** (Tham Lang@Tý, Thái Dương@Mão, Tử Vi@Ngọ, Thái Âm@Hợi).
- GM-005: so 12 ô mới (loại 2 ô Dần/Tuất tranh chấp) → **4/12 khớp** (Vũ Khúc@Thìn, Thái Dương@Tỵ,
  Phá Quân@Ngọ, Cự Môn@Hợi).
- GM-006: so 12 ô mới (loại 2 ô Mão/Hợi tranh chấp) → **1/12 khớp** rõ ràng (Thái Dương@Tý).

**Kết luận: bảng Miếu/Vượng/Đắc/Bình/Hãm hiện tại chỉ đáng tin ở đúng 13 ô đã verified từ GM-001 (và các
ô trùng vị trí ở GM-002 vì cùng lá số). Ngoài phạm vi đó, tỷ lệ đúng quan sát được xấp xỉ 15-30%, KHÔNG
đủ để coi là "tham khảo được".** Không sửa vì audit gốc đã yêu cầu không tự suy diễn bảng mới, và guessing
lại từ 4 điểm dữ liệu nhiễu sẽ tạo rủi ro tương tự. **Khuyến nghị mạnh: cần bảng thật (ảnh chụp màn hình
phần mềm Tử Vi có ghi rõ trạng thái từng sao, hoặc sách nguồn) thay vì suy luận thêm.**

Test không hard-assert các ô sai này (chỉ hard-assert vị trí sao, không hard-assert trạng thái, trừ 13 ô
gốc GM-001/002) — status table hiện chỉ dùng để hiển thị tham khảo trên UI, có cảnh báo trong trang.

### 4.3 NEED_GOLDEN_MASTER_REVIEW — nghi ngờ lỗi transcription trong chính GM Pack (không phải lỗi engine)

3 trường hợp dưới đây: công thức của engine **tự nhất quán và đã VERIFIED độc lập ở GM-001** (không đổi
để ép pass các GM mới), nhưng mâu thuẫn với 1 dòng cụ thể trong pack. Nghi ngờ pack bị lỗi khi biên soạn
(đã ghi rõ lý do từng trường hợp trong file test bằng `it.fails()`, không tự ý kết luận ai đúng):

1. **GM-003**: Thiên Lương — pack ghi tại Thân, engine tính tại Dần (công thức offset+5 từ Thiên Phủ đã
   verified ở GM-001, và Thiên Phủ@Dậu của GM-003 khớp đúng pack).
2. **GM-005**: Tham Lang/Thất Sát — pack ghi Tham Lang@Dần + Thất Sát@Tuất, engine tính ngược lại
   (Tham Lang@Tuất + Thất Sát@Dần) — khớp đúng CẢ vòng sao (Thiên Phủ@Thân, offset+2) LẪN quy tắc tên
   cung (Mệnh+2=Phúc Đức, đã verified GM-001..004) đều cùng chỉ về Tuất=Phúc Đức=Tham Lang. Nghi ngờ 2
   dòng Dần/Tuất bị đảo khi biên soạn pack.
3. **GM-006**: Vũ Khúc+Phá Quân — pack ghi tại Mão (cungName "Huynh Đệ"), engine tính tại Hợi. Quy tắc
   tên cung (Mệnh=Tý → Huynh Đệ = Mệnh-1 = Hợi, đã verified) khớp đúng vị trí Hợi, và pack **tự đánh dấu**
   dòng Hợi là không chắc chắn ("Hợi Huynh?* [theo mapping trong ảnh]") — càng củng cố nghi ngờ lỗi
   transcription ở đúng cặp dòng Mão/Hợi này.
4. **GM-006**: Tuần Không — pack ghi "Tý-Sửu", **trùng hệt** GM-001 dù năm sinh khác hẳn (Ất Tỵ vs Canh
   Thân). Theo công thức đã verified (khớp GM-001 qua kiểm tra UI thủ công trước đây), Ất Tỵ (thuộc tuần
   Giáp Thìn) phải cho Tuần Không = Dần-Mão. Nghi ngờ giá trị bị copy nhầm từ GM-001 khi soạn pack.

**Không tự sửa Golden Master, không tự sửa engine theo các điểm trên** — chỉ báo cáo, chờ người dùng xác
nhận lại nguồn ảnh gốc nếu cần.

### 4.4 NEED_GOLDEN_MASTER_REVIEW — trường "Đại vận đầu: <Can-Chi>" trong pack

Cả 6 GM đều có dòng "Đại vận đầu: X — Thuận/Nghịch". Phần **hướng** (Thuận/Nghịch) đã verified đầy đủ
(khớp cả 6/6 GM, đủ cả 4 tổ hợp Dương Nam/Âm Nam/Dương Nữ/Âm Nữ — xem mục 5). Phần **Can-Chi cụ thể**
(VD "Ất Dậu") không khớp với bất kỳ cách diễn giải nào đã thử (không phải Can-Chi của cung Mệnh, không
phải cung Đại Vận tại năm xem) — không đủ cơ sở để biết trường này đo đại lượng gì, nên KHÔNG test.

---

## 5. COVERAGE THEO YÊU CẦU BÁO CÁO

### 12 Can cung
**UNVERIFIED** (không đổi so với audit gốc). Có thêm `getPalaceStem(yearStem, palaceBranch)` theo đúng
tên spec yêu cầu + test tự nhất quán (parity, phủ đủ 10 Can trên 12 cung) — nhưng **không có Golden
Master nào** (cả 2 tài liệu) cho giá trị Can-của-cung tường minh. Vẫn chỉ có xác nhận GIÁN TIẾP qua Cục
đúng ở GM-001/002/003 (nếu Ngũ Hổ Độn sai, Cục sẽ sai theo — cả 3 GM này đều cho Cục đúng).

### 14 chính tinh
**VERIFIED vị trí ở 5/6 GM hoàn toàn sạch (GM-001, GM-002, GM-004 — 14/14; GM-003 — 13/14; GM-005 —
12/14; GM-006 — 10/12), NEED_GOLDEN_MASTER_REVIEW cho 5 ô tranh chấp** (liệt kê ở mục 4.3). Trạng thái
Miếu/Vượng/Đắc/Bình/Hãm: xem mục 4.2 — **FAILED ngoài 13 ô gốc**.

### Tứ Hóa 10 Can
**VERIFIED chọn đúng bộ theo 3 Can thật (Canh: GM-001/002/003; Đinh: GM-004/005 — có test đặc biệt xác
nhận KHÔNG lẫn bộ Canh; Ất: GM-006). FIX xác nhận hoạt động đúng cho cả 10 Can** (kể cả 5 Can có sao đích
là phụ tinh) qua `tests/tu-vi-tu-hoa-full.test.ts`, nhưng **giá trị bảng cho 7 Can còn lại (Giáp, Bính,
Mậu, Kỷ, Tân, Nhâm, Quý) vẫn chỉ DERIVED** (transcription khớp spec §17, chưa có Golden Master riêng).

### Thiên Việt 10 Can
**NEED_GOLDEN_MASTER_REVIEW cho toàn bộ 10/10 Can** (xem mục 2.2) — đã hết dùng công thức đối xứng bị
cấm, nhưng bảng thay thế chưa có nguồn xác nhận độc lập nào, kể cả trong GM Pack mới.

### Mệnh Quái
**VERIFIED 6/6 GM** (Khôn, Tốn, Khảm, Chấn, Chấn, Khôn — đều khớp). Lỗi biên năm "00" đã sửa, có
regression test riêng. Đây là rule có độ phủ Golden Master tốt nhất trong toàn bộ engine sau đợt này.

### Mệnh/Thân
**VERIFIED 6/6 GM**, gồm cả 2 test biên quan trọng nhất (giờ Tý: GM-004 vs GM-005; ranh giới năm Âm
lịch: GM-006) — cả 2 đều PASS. Đây là kết quả tốt nhất của đợt re-audit này.

### Đại Vận
**Tuổi khởi vận: VERIFIED 6/6 GM** (luôn = số Cục). **Hướng Thuận/Nghịch: VERIFIED 6/6 GM, đủ cả 4 tổ
hợp** Dương Nam (GM-001, GM-003 → Thuận), Âm Nam (GM-005 → Nghịch), Dương Nữ (GM-002 → Nghịch), Âm Nữ
(GM-004 → Thuận). Trường "Can-Chi của Đại Vận đầu" trong pack: NEED_GOLDEN_MASTER_REVIEW (mục 4.4).

---

## 6. TÓM TẮT PHÂN LOẠI (đối chiếu lại với audit gốc)

| Rule | Audit gốc | Sau Phase 1-6 |
|---|---|---|
| Tứ Hóa gắn lên StarInstance | FAILED (bug xác nhận) | **FIXED, VERIFIED cho 10/10 Can** |
| Thiên Việt | FAILED (vi phạm spec) | Hết vi phạm, nhưng **NEED_GOLDEN_MASTER_REVIEW** (chưa hết rủi ro, chỉ đổi loại rủi ro) |
| `tinhMenhQuai` biên năm "00" | FAILED (bug xác nhận) | **FIXED, có regression test** |
| Mệnh Quái (giá trị) | DERIVED, 1 điểm | **VERIFIED, 6 điểm** |
| Mệnh/Thân | VERIFIED, 1 điểm (chỉ formula) | **VERIFIED, 6 điểm, đủ biên giờ Tý + biên năm Âm lịch** |
| Đại Vận hướng | UNVERIFIED cho Âm Nam/Dương Nữ/Âm Nữ | **VERIFIED đủ cả 4 tổ hợp** |
| 14 chính tinh (vị trí) | VERIFIED 1 điểm (GM-001) | **VERIFIED 5/6 GM sạch, 5 ô NEED_REVIEW (nghi transcription pack)** |
| Miếu/Vượng/Đắc/Bình/Hãm | DERIVED (đánh giá quá lạc quan) | **FAILED ngoài 13 ô gốc — hạ cấp nghiêm trọng, tỷ lệ khớp quan sát được ~15-30%** |
| Chủ Mệnh/Chủ Thân | DERIVED, 1 điểm | **FAILED — sai khóa tra bảng, đã có bằng chứng thay thế nhưng chưa sửa** |
| 12 Can cung | UNVERIFIED | UNVERIFIED (không đổi — vẫn thiếu Golden Master) |
| Thiên Hình | MISSING | **Đã implement theo đúng công thức spec §25** |
| Tả Phụ/Tả Phù | Xung đột chưa báo cáo | **Đã chuẩn hóa 1 canonical ID (`STAR_TA_PHU`), không đổi nội dung Tứ Hóa Nhâm** |
| Tiểu Hạn, Lưu Niên, Profile system | MISSING | Vẫn MISSING (ngoài phạm vi 6 phase lần này) |

---

## 7. KẾT LUẬN

**ENGINE NOT READY** — vẫn còn:
1. Bảng Miếu/Vượng/Đắc/Bình/Hãm sai phần lớn ngoài 13 ô gốc (mục 4.2) — đây là rủi ro nghiêm trọng nhất
   còn lại, vì đây là thông tin chính người xem lá số nhìn vào.
2. Chủ Mệnh/Chủ Thân tra sai khóa, đã có bằng chứng rõ nhưng chưa sửa (mục 4.1).
3. Thiên Việt vẫn NEED_GOLDEN_MASTER_REVIEW, chưa có nguồn xác nhận (mục 2.2).
4. 4 điểm nghi ngờ lỗi transcription trong chính GM Pack cần người dùng xác nhận lại (mục 4.3, 4.4).
5. Tiểu Hạn, Lưu Niên, hệ thống Profile vẫn MISSING hoàn toàn (chưa nằm trong phạm vi lần sửa này).

Điểm tích cực rõ rệt so với audit gốc: 3 bug xác nhận đã fix có regression test; Mệnh/Thân, Mệnh Quái,
Đại Vận (tuổi + hướng), và vị trí 14 chính tinh giờ đã có 6 Golden Master độc lập thay vì 1, bao gồm cả 2
test biên quan trọng nhất (giờ Tý, ranh giới năm Âm lịch) đều PASS sạch.
