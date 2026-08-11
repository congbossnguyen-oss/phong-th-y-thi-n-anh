# PHASE 36 — TIỂU HẠN: SOURCE VERIFICATION + AGE RULE (kết quả audit, KHÔNG implement)

**Không sửa code trong phase này** (đúng chỉ thị "KHÔNG sửa code trước khi có kết luận"). Không sửa
Natal Core, không sửa Golden Master, không sửa `isThuanChung`. Không commit/push.

---

## 1. Executive Summary

Đã tìm kiếm tích cực theo đúng thứ tự ưu tiên spec (sách Nam Phái gốc → tài liệu Nam Phái → lá số thực tế
→ web/blog đối chứng), gồm cả việc đọc trực tiếp bản scan/OCR sách kinh điển **"Tử Vi Đẩu Số Tân Biên"
(Vân Đằng Thái Thứ Lang)** trên archive.org — nhưng phần văn bản thu thập được (1 volume/phần cụ thể của
bản scan đó) KHÔNG chứa chương "an Tiểu Hạn" gốc (chỉ có các chương luận giải/Lưu tinh sau đó, giả định
người đọc đã biết cách an sẵn — cùng tình trạng như các bài hocvienlyso.org đã gặp ở Phase 33/34).

**Kết quả cho 2 gap:**

- **Gap 1 (cung khởi + Nam thuận/Nữ nghịch)**: KHÔNG tìm được nguồn thứ 2 thực sự độc lập với trích dẫn
  trực tiếp mới. Tuy nhiên phát hiện thêm: cụm công thức "tam hợp năm sinh + nam thuận nữ nghịch, 12 năm
  quay lại vị trí cũ" xuất hiện lặp lại rất nhất quán qua nhiều tìm kiếm tổng hợp khác nhau (Phase 33, 34,
  36) — không đủ để LOCK (không truy được về 1 nguồn cụ thể độc lập, đúng nguyên tắc chống
  "AI-search-summary tự lặp lại không phải bằng chứng") nhưng CŨNG không có bất kỳ nguồn nào phát biểu
  NGƯỢC LẠI. → **Giữ nguyên `SOURCE_SUPPORTED`** (không nâng, không hạ so với Phase 34).
- **Gap 2 (tuổi mụ/thực, tuổi bắt đầu, Cục dependency, quy tắc tuổi 1/12/13)**: **KHÔNG tìm được nguồn
  mới nào** xác nhận trực tiếp. → **`INSUFFICIENT_EVIDENCE`** — không có gì thay đổi so với khoảng trống
  đã ghi nhận ở Phase 34/35 (`getTuoiTieuHan()` vẫn giữ nguyên trạng thái `NEED_REVIEW`).

**Không phát hiện current implementation nào SAI** (không có bằng chứng mới mâu thuẫn với
`src/lib/tu-vi/tieu-han.ts` hiện tại) — do đó mục "CURRENT_IMPLEMENTATION / EXPECTED_BY_SOURCE /
EVIDENCE / AFFECTED_TESTS / PROPOSED_FIX" (Mục 7 spec) **không áp dụng cho trạng thái SAI**, chỉ áp dụng
cho trạng thái **CHƯA XÁC MINH ĐƯỢC** (Mục 6 dưới đây).

---

## 2. Nguồn đã kiểm tra (Priority 1 → 4)

### Priority 1 — Sách Nam Phái bản gốc/scan

**"Tử Vi Đẩu Số Tân Biên" — Vân Đằng Thái Thứ Lang** (archive.org,
`TuViDdauSoTanBien-VDThaiThuLang-DV`, file OCR text đọc trực tiếp qua `curl`, KHÔNG qua tóm tắt AI). Đây
là 1 trong những sách Tử Vi kinh điển nhất của Việt Nam, đã từng được hocvienlyso.org trích dẫn để xác
nhận 1 điểm khác (Phase 17/18) — mức độ tin cậy Level 1/2 cao nếu tìm được đúng đoạn.

**Kết quả**: bản scan thu thập được (khoảng 1.500 dòng text, bắt đầu từ trang "- 267 -" của sách) nằm
trong phần **"Luận Đại Tiểu Hạn"** (chương 2: liên hệ Đại-Tiểu Hạn, Bản Mệnh; chương 4: các sao Lưu Thái
Tuế/Tang Môn/Bạch Hổ/Thiên Khốc-Hư/Lộc Tồn-Kình-Đà/Thiên Mã theo năm xem; chương 5: luận đoán chết) —
TOÀN BỘ là luận giải, giả định người đọc ĐÃ BIẾT cách an Tiểu Hạn từ 1 chương trước đó (không có trong
phần scan thu thập được). Đã grep toàn văn cho "tam hợp", "Trai thuận/Gái nghịch", "tuổi mụ", "Nhi đồng",
chuỗi "1-13-25" — **0 kết quả**. Đây là 1 lần đọc trực tiếp nghiêm túc, không phải bỏ qua, nhưng KHÔNG
tìm thấy đoạn cần thiết trong phần văn bản có thể truy cập được của phiên làm việc này.

**Phát hiện phụ có giá trị**: chương 4.1 (Lưu Thái Tuế) viết "Tiểu hạn năm nào, tất có Lưu Thái Tuế tại
cung có tên của năm đó" — đọc kỹ ngữ cảnh (ví dụ: "Tiểu hạn năm Mùi, Lưu Thái Tuế tại cung Mùi") xác nhận
đây chỉ là cách gọi tắt "năm đang xem Hạn là năm Mùi" (dùng "tiểu hạn năm X" như nhãn chỉ năm dương lịch/
âm lịch X), KHÔNG PHẢI định nghĩa "cung Tiểu Hạn = cung có Chi trùng năm xem" — tránh hiểu lầm thành xung
đột với công thức tam hợp của Bửu Đình (đã cân nhắc kỹ, không phải suy diễn vội).

### Priority 2 — Tài liệu Nam Phái khác

- Diễn đàn lyso.vn, thread "Hỏi về cách tính Đại hạn, tiểu hạn một lá số" — đọc trực tiếp: 3 người dùng
  (`phanan72`, `vuchininh`, `nguyenhoangthanhnd`) đưa ra 3 cách hiểu KHÁC NHAU, ít nhất 1 người
  (`vuchininh`) tự nhận xét "càng chi tiết càng sai nhiều" — xác nhận lại phát hiện Phase 34: cộng đồng
  forum có nhiều cách hiểu lẫn lộn, KHÔNG dùng làm bằng chứng khóa rule (ẩn danh, không nhất quán nội
  bộ, không rõ trường phái).
- Studocu "Cách Tính Đại Vận và Tiểu Vận" — đã thử fetch, nội dung trả về chỉ là khung UI/ảnh base64 của
  trang xem trước tài liệu, không trích xuất được nội dung thật → không dùng được.

### Priority 3 — Lá số Nam Phái có hiển thị Tiểu Hạn

`tuvinamphai.vn` (đã dùng làm nguồn Level 3 chính cho Phase 15/28/29) — kiểm tra `site:tuvinamphai.vn
tiểu hạn`: không tìm thấy trang nào chuyên về công thức an Tiểu Hạn. Trang "Luận Hạn Trong Tử Vi" (đã
fetch trực tiếp) là 1 bài thơ luận đoán cổ ("Bài Ca Đoán Hạn Tử Vi"), KHÔNG có công thức. **Không tìm
được** ảnh lá số thực tế nào có đủ (ngày sinh + giờ sinh + giới tính + năm xem + tuổi Tiểu Hạn + cung
Tiểu Hạn hiển thị tường minh) trong phạm vi phiên làm việc này.

### Priority 4 — Web/blog đối chứng (chỉ tham khảo, không dùng để khóa)

Nhiều kết quả tìm kiếm tổng hợp (dogovinhvuong.com và các trang không xác định rõ nguồn khác) tiếp tục
lặp lại cụm: "Cách tìm tiểu hạn, phải dựa vào tam hợp năm sinh... nam khởi lưu theo chiều thuận, nữ khởi
lưu theo chiều nghịch... 12 năm quay về vị trí cũ" — khớp với Bửu Đình nhưng KHÔNG truy được về 1 nguồn
cụ thể, độc lập, có tên tác giả rõ ràng khác Bửu Đình. Theo đúng nguyên tắc đã áp dụng xuyên suốt project
(Phase 26-29, Thiên Mã): **không nâng cấp độ tin cậy dựa trên việc 1 cụm từ được lặp lại nhiều nơi nếu
không truy được nguồn gốc** — ghi nhận là tín hiệu CỦNG CỐ nhẹ (không có nguồn nào nói ngược lại), không
phải bằng chứng độc lập mới.

## 3. Source Independence Check

| Nguồn | Có phải nguồn mới độc lập không? |
|---|---|
| Vân Đằng Thái Thứ Lang, TVĐSTB | Nguồn CÓ THẬT, độc lập với Bửu Đình — nhưng phần truy cập được KHÔNG chứa đoạn cần thiết → không tính là "xác nhận", cũng không tính là "phủ định" |
| lyso.vn forum | Nhiều người dùng ẩn danh, tự mâu thuẫn nội bộ → KHÔNG đủ tư cách nguồn độc lập |
| tuvinamphai.vn | Site thật, Level 3 đã dùng trước đây — nhưng KHÔNG có nội dung liên quan → không tính |
| Các trang tổng hợp lặp "tam hợp + Trai/Gái" | Nghi ngờ cao là COMMON_ANCESTOR hoặc sao chép lẫn nhau (không xác định được nguồn gốc chung cụ thể) → theo đúng Mục V/Phase 34 quy tắc, KHÔNG tính 2 site copy cùng bài là 2 nguồn độc lập, và ở đây thậm chí chưa xác định được "bài gốc" là bài nào |

**Kết luận**: Chưa có nguồn thứ 2 thực sự độc lập, có thể kiểm chứng, khác hẳn Bửu Đình.

## 4. Real Chart Evidence

Không tìm được lá số thực tế nào (ảnh hoặc văn bản) có đủ 6 yếu tố yêu cầu (ngày sinh, giờ sinh, giới
tính, năm xem, tuổi Tiểu Hạn, cung Tiểu Hạn) trong phạm vi phiên làm việc này. Không quay lại kiểm tra
ảnh Phase 15 (GM-SOURCE-A/B/C) — vẫn là khoảng trống đã ghi nhận từ Phase 33/34, chưa có tiến triển.

## 5. Gap 1 — Cung khởi + Nam thuận/Nữ nghịch: `TIEU_HAN_SOURCE_SUPPORTED` (không đổi)

Không hạ cấp (không có bằng chứng phản bác), không nâng cấp lên `SOURCE_LOCKED` (không có nguồn độc lập
thứ 2 xác nhận trực tiếp bằng trích dẫn cụ thể). Giữ nguyên kết luận Phase 34.

## 6. Gap 2 — Age Rule (tuổi mụ/thực, tuổi bắt đầu, Cục, tuổi 1/12/13): `INSUFFICIENT_EVIDENCE`

Không tìm được bất kỳ nguồn Tiểu-Hạn-cụ-thể nào (Nam Phái hay khác) trả lời trực tiếp:

- Tuổi mụ hay tuổi thực? — Không có nguồn.
- Cách tính tuổi từ năm sinh đến năm xem cho riêng Tiểu Hạn? — Không có nguồn (chỉ có
  `chart.tuoiNamXem` — convention CÓ SẴN của Natal Core cho Đại Vận, KHÔNG phải bằng chứng Tiểu-Hạn-riêng,
  như đã ghi rõ ở Phase 35).
- Phụ thuộc Cục? — Bửu Đình (Phase 34/35) đã trả lời phần này: KHÔNG phụ thuộc Cục cho CÔNG THỨC an vị
  trí; CÓ phụ thuộc Cục cho QUY ƯỚC khi nào bắt đầu luận giải ("hạn Nhi đồng"). Không có nguồn mới bổ
  sung/mâu thuẫn điểm này ở Phase 36.
- Quy tắc đặc biệt tuổi 1/12/13? — Không tìm được nguồn nói riêng có "quy tắc đặc biệt"; suy luận toán
  học (chu kỳ 12 năm quay lại) vẫn chỉ là suy luận, chưa có trích dẫn trực tiếp mới.

Vì đây là câu hỏi hoàn toàn CHƯA CÓ dữ liệu (không phải có 2 nguồn nói khác nhau), phân loại đúng là
`INSUFFICIENT_EVIDENCE` chứ không phải `CONFLICTED` hay `NEED_SOURCE` (đã "cần nguồn" từ trước, giờ vẫn
"chưa đủ bằng chứng" sau khi đã tìm thêm mà không có kết quả mới).

## 7. Đối chiếu với Current Implementation (không phát hiện sai, không sửa)

| | Nội dung |
|---|---|
| `CURRENT_IMPLEMENTATION` | `getTuoiTieuHan(chart)` trả về `chart.tuoiNamXem` (Natal Core, tuổi mụ, `viewingYear - year + 1`) |
| `EXPECTED_BY_SOURCE` | **Chưa xác định** — không có nguồn Tiểu-Hạn-riêng nào (kể cả sau khi tìm thêm ở Phase 36) xác nhận đây là ĐÚNG hay SAI |
| `EVIDENCE` | Không có bằng chứng MỚI theo hướng nào (không xác nhận, không phủ định) |
| `AFFECTED_TESTS` | Nếu sau này phát hiện sai: `tests/tu-vi-phase35-tieu-han.test.ts`, nhóm mô tả "getTuoiTieuHan()" (2 test) — CÁC TEST VỀ CUNG KHỞI/CHIỀU KHÔNG BỊ ẢNH HƯỞNG (chúng dùng `age` trực tiếp, không qua `getTuoiTieuHan()`) |
| `PROPOSED_FIX` | KHÔNG đề xuất sửa ở phase này — giữ nguyên `NEED_REVIEW` như Phase 35 đã đánh dấu, chờ Phase sau nếu tìm được nguồn |

## 8. Regression

Không sửa file nào trong `src/`. Không thêm/sửa/xóa test. Baseline giữ nguyên **764 PASS / 5 EXPECTED
FAIL / 0 UNEXPECTED FAIL / 769 TỔNG** (không đổi từ Phase 35).

---

## Final Status

```
Gap 1 (cung khởi + chiều):        TIEU_HAN_SOURCE_SUPPORTED   (không đổi so với Phase 34)
Gap 2 (age rule — tuổi mụ/thực):  TIEU_HAN_INSUFFICIENT_EVIDENCE
```

**Tổng thể cho toàn bộ rule Tiểu Hạn**: vẫn ở mức `SOURCE_SUPPORTED` (không thể vượt qua mức của thành
phần yếu nhất) — implementation ở Phase 35 tiếp tục giữ trạng thái `TIEU_HAN_IMPLEMENTED_NEEDS_REVIEW`,
KHÔNG được nâng lên `TIEU_HAN_LOCKED` sau Phase 36.

**Hướng đi tiếp theo nếu muốn khóa hoàn toàn**: (1) tìm được phần ĐẦU của sách Vân Đằng Thái Thứ Lang
(chương "an sao"/"an Tiểu Hạn" cơ bản, trước phần "Luận Đại Tiểu Hạn" đã đọc ở Phase 36) — đây là hướng
có triển vọng nhất vì đã xác nhận sách CÓ THẬT và CÓ liên quan, chỉ là chưa tìm đúng phần; (2) tìm 1 lá số
thực tế Nam Phái có hiển thị tuổi + cung Tiểu Hạn tường minh để đối chiếu ngược (reverse-engineer) công
thức tuổi.
