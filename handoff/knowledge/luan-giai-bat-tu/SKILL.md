---
name: luan-giai-bat-tu
description: Dùng skill này khi Công đưa lên một lá số Bát Tự (Tứ Trụ) — dán/gõ Can Chi Năm Tháng Ngày Giờ, ảnh chụp phần mềm lập lá số, hoặc ngày giờ sinh + giới tính — và muốn luận giải. Kích hoạt khi Công hỏi "luận lá số này", "xem Bát Tự cho...", "Dụng Thần là gì", "vận này thế nào", "cách cục gì", "Thân vượng hay nhược", "năm nào phát tài/thăng chức/kết hôn", hoặc hỏi về tài vận/quan vận/hôn nhân/sức khỏe dựa trên 1 lá số cụ thể. LUÔN dùng thay vì tự luận theo kiến thức Bát Tự chung chung — skill chứa phương pháp riêng (vượng suy có hiệu chỉnh, 4 loại Dụng thần, 10 cách cục Tài Quan biến hóa, Tầng Thứ Tuế Vận, Tứ Mộ Khố, ~35 Thần Sát) đúc kết từ bộ tài liệu "Bát Tự Nền Tảng" (Vũ Thiện Minh), không có sẵn trong kiến thức nền của Claude.
---

# Luận Giải Bát Tự (Tứ Trụ)

Skill này luận giải 1 lá số Bát Tự theo đúng phương pháp trong bộ tài liệu "Bát Tự Nền Tảng" (Vũ Thiện Minh) và các tài liệu chuyên đề đi kèm mà Công đã cung cấp — KHÔNG dùng kiến thức Bát Tự chung chung có sẵn trong trí nhớ nền. Nếu tài liệu không đề cập một trường hợp cụ thể đang gặp, phải nói rõ "tài liệu chưa đề cập trường hợp này" thay vì suy diễn.

## Phạm vi & giới hạn của skill (đọc trước khi luận)

- Skill KHÔNG tự lập lá số mới nếu Công đã đưa lá số hoàn chỉnh — chỉ luận giải trên lá số đã có.
- Hệ thống "Cách Cục" dùng trong skill này là **10 Cách Cục Tài Quan biến hóa** (Ấn hóa Quan Sát, Thực Thương chế Sát...) — KHÔNG phải Cách Cục cổ điển kiểu Chính Quan cách/Kiến Lộc cách/Tòng cách theo hệ thống khác. Nếu Công hỏi về Cách Cục theo nghĩa khác, nói rõ tài liệu hiện có chưa đề cập.
- Thập Thần **Thực Thần, Thương Quan, Tỷ Kiên, Kiếp Tài** chỉ có hàm nghĩa cơ bản trong tài liệu (không có phân tích 6 tầng sâu như 6 thần còn lại) — xem ghi chú ở `references/thap-than.md`.
- Quy tắc **Ứng Kỳ** không có sẵn thành chương riêng trong tài liệu gốc — phần `references/ung-ky.md` là tổng hợp có căn cứ từ quy tắc Tầng Thứ + án lệ, phải nói rõ điều này khi dùng đến.
- Tài liệu không bao gồm luận tính cách (Tính Cách P1-P2) như một bước trong quy trình 8 bước dưới đây — nếu Công muốn luận tính cách sâu, đây có thể là một skill/yêu cầu riêng.

## Bước 0 — Kiểm tra input (bắt buộc, không được bỏ qua)

Cần đủ các thông tin sau trước khi luận. **Nếu thiếu bất kỳ mục nào, hỏi lại Công — không tự bịa hoặc giả định**:

- Ngày giờ sinh dương lịch đầy đủ (năm/tháng/ngày/giờ) HOẶC lá số Tứ Trụ đã lập sẵn (Can Chi Năm Tháng Ngày Giờ).
- **Giới tính** (Nam/Nữ) — bắt buộc để xác định chiều thuận/nghịch khi an Đại Vận (xem `references/lap-tu-tru.md`).
- Câu hỏi cụ thể muốn luận (tổng quan / sự nghiệp / tài vận / hôn nhân / sức khỏe / một Đại Vận-Lưu Niên cụ thể) — nếu Công chưa nói rõ, hỏi trước khi luận vì mỗi mục đích cần nhấn mạnh khác nhau ở Bước 6.

Nếu Công dán bảng từ phần mềm lập lá số hoặc ảnh chụp: đọc kỹ toàn bộ trước khi luận, đừng bỏ sót Đại Vận, Nạp Âm, Thần Sát nếu phần mềm đã hiển thị sẵn.

## Bước 1 — Lập Tứ Trụ, xác định Nhật Chủ, an Đại Vận

Đọc `references/lap-tu-tru.md`.

- Nếu Công đã đưa lá số hoàn chỉnh: dùng trực tiếp, chỉ kiểm tra tính hợp lý cơ bản (Âm Dương Can-Chi phải khớp).
- Nếu chỉ có ngày giờ sinh dương lịch thô: tự lập theo quy trình trong file, và **bắt buộc cảnh báo** nếu giờ sinh gần ranh giới Tiết Khí hoặc gần giờ Tý (23h–1h) — khuyến nghị đối chiếu lại bằng phần mềm chuyên dụng.
- Nhật Chủ = Thiên Can của Trụ Ngày.
- Xác định chiều đếm Đại Vận (thuận/nghịch) theo Âm Dương của Can Năm + Giới tính.

## Bước 2 — Xác định vượng suy Nhật Chủ

Đọc `references/vuong-suy.md`, kết hợp `references/quan-he-can-chi.md` (mục Thiên Can hợp hóa, Tam hợp/Tam hội) để kiểm tra hợp hóa TRƯỚC khi kết luận vượng suy.

- Xét đủ 4 điều kiện: Được Lệnh, Đắc Địa, Được Sinh, Được Trợ Giúp — tra bảng tổng hợp trong file.
- Kiểm tra thấu can — thông căn cho từng Thiên Can quan trọng.
- Kiểm tra xem có tổ hợp Can Chi nào hợp hóa thành hành khắc/tiết/hao Nhật Chủ hay không (đây là bước hay bị bỏ sót nhưng có thể đảo ngược hoàn toàn kết luận vượng/nhược).
- Nếu Nguyệt Lệnh rơi vào Thìn/Tuất/Sửu/Mùi ("tạp khí"), đọc thêm `references/mo-kho.md` mục Tạp Khí trước khi kết luận Được Lệnh.
- Kết luận theo 1 trong 7 cấp độ: Cực cường – Cường vượng – Vượng – Trung hòa – Suy – Nhược – Cực nhược.

## Bước 3 — Xác định Dụng Thần – Hỷ Thần – Kị Thần – Cừu Thần

Đọc `references/dung-than.md`.

- Chọn 1 trong 4 phương pháp phù hợp: Phù Ức (thông thường) / Thông Quan (2 hành đối đầu ngang sức) / Thuận Thế (Cực vượng/Cực nhược — Tòng cách) / Điều Hậu (mùa sinh quá hàn/quá nhiệt).
- Định nghĩa dùng trong skill: **Dụng thần** = hành cần dùng để cân bằng cục; **Hỷ thần** = hành sinh/trợ cho Dụng thần; **Kị thần** = hành khắc/phá trực tiếp Dụng thần; **Cừu thần** = hành sinh trợ cho Kị thần (gây hại gián tiếp qua Kị thần). *Lưu ý: tài liệu gốc chủ yếu dùng cặp Hỷ/Kị; khái niệm "Cừu thần" là quy ước chuẩn phổ biến của Tử Bình được suy ra theo logic sinh-khắc, không phải trích nguyên văn từ tài liệu — nói rõ điều này nếu Công hỏi sâu về nguồn gốc thuật ngữ.**
- Nhắc lại: Dụng thần CÓ THỂ đổi theo Đại Vận nếu mệnh cục thuộc Nhóm 1/Nhóm 2 (xem `vuong-suy.md` mục 5) — không chốt cứng 1 Dụng thần cho cả đời nếu chưa kiểm tra nhóm này.

## Bước 4 — Xác định Cách Cục (thành/phá)

Đọc `references/cach-cuc.md`.

- Rà soát xem mệnh cục có khớp mô hình vị trí của (những) cách cục nào trong 10 cách cục Tài Quan biến hóa hay không (có thể có nhiều hơn 1).
- Dùng kỹ thuật "dòng chảy ngũ hành" (`references/quan-he-can-chi.md` mục 5) để xác định lực lượng thực tế trước khi kết luận cách cục "thành" hay "phá".
- Nêu rõ mức độ thành cách (thành trọn vẹn / thành nhưng yếu / không đủ điều kiện) — không mặc định mọi mô hình đúng vị trí đều "thành" hoàn hảo.

## Bước 5 — Luận Thập Thần theo từng cung (Năm/Tháng/Ngày/Giờ)

Đọc `references/thap-than.md`, đối chiếu `references/mo-kho.md` nếu Thập Thần liên quan đang nhập Mộ/Khố.

- Xác định Thập Thần tại Thiên Can lộ và Can tàng trong Địa Chi của cả 4 trụ.
- Xác định Hỷ/Kị cho từng Thập Thần dựa trên Dụng thần đã chọn ở Bước 3 trước khi mô tả tính cách/sự việc tương ứng.
- Với 6 Thập Thần có tài liệu chuyên sâu (Chính Quan, Thất Sát, Chính Tài, Thiên Tài, Chính Ấn, Thiên Ấn): có thể luận sâu hơn theo cung vị/lục thân. Với Thực Thần/Thương Quan/Tỷ Kiên/Kiếp Tài: chỉ dùng hàm nghĩa cơ bản, không suy diễn thêm tầng sâu.

## Bước 6 — Luận theo mục đích hỏi

Dựa trên câu hỏi cụ thể của Công (đã hỏi ở Bước 0):

| Mục đích hỏi | Tài liệu tham chiếu chính |
|---|---|
| Tài vận / sự nghiệp / quan vận | `references/cach-cuc.md` (đặc biệt các cách cục liên quan Tài/Quan), `references/dung-than.md` mục nghề nghiệp phù hợp |
| Hôn nhân / tình cảm | `references/thap-than.md` (Tài tinh với nam, Quan Sát với nữ), `references/than-sat.md` (Đào Hoa, Hồng Diễm, Hồng Loan, Cô Thần Quả Tú, Âm Dương Sai Thố) |
| Sức khỏe / bệnh tật | `references/benh-tat.md`, kết hợp `references/than-sat.md` (Dương Nhận, Tai Sát, Kiếp Sát, Huyết Nhẫn) |
| Quý nhân / phương hướng / hợp tác kinh doanh | `references/dung-than.md` mục 5, `references/than-sat.md` (Thiên Ất, Thiên Đức/Nguyệt Đức) |

Các mảng khác chưa có tài liệu chuyên sâu riêng — dùng quy trình chung Bước 1–5 và Thập Thần/Thần Sát liên quan, nói rõ nếu không đủ căn cứ.

**Với câu hỏi sức khỏe/bệnh tật**: luôn tuân thủ nguyên tắc đạo đức ở cuối `references/benh-tat.md` — không thay thế chẩn đoán y khoa, luôn khuyến nghị đi khám khi phát hiện dấu hiệu đáng lo.

## Bước 7 — Luận Đại Vận & Lưu Niên, xác định ứng kỳ

Đọc `references/quan-he-can-chi.md` mục 4 (Tầng Thứ) trước, sau đó `references/ung-ky.md`.

- Với mỗi Đại Vận/Lưu Niên cần luận: kiểm tra lại vượng suy Nhật Chủ TẠI THỜI ĐIỂM ĐÓ (có thể khác nguyên cục — xem Bước 3), rồi mới áp bảng "gặp tuế vận X là Cát/Hung" trong `cach-cuc.md`.
- Áp dụng quy tắc Tầng Thứ (Lưu Niên > Đại Vận > Mệnh cục, Nguyệt Chi cao nhất nội bộ) để xác định quan hệ xung/hợp/hình/hại nào thực sự có hiệu lực tại thời điểm đó.
- Xác định ứng kỳ theo các dấu hiệu kích hoạt ở `ung-ky.md` — ưu tiên năm có nhiều dấu hiệu trùng nhau, không chốt 1 năm duy nhất nếu căn cứ mỏng.
- Nếu câu hỏi liên quan lục thân (cha/mẹ/vợ/chồng/con): không dùng Dụng thần của mệnh chủ để luận — xét riêng Thập Thần đại diện lục thân đó (xem ghi chú trong `than-sat.md` mục Tang Môn - Điếu Khách). Không khẳng định "chết" — chỉ luận mức độ "đau ốm nặng, cần đề phòng".

## Bước 8 — Kết luận & tư vấn hướng cải thiện

- Tóm tắt: vượng suy Nhật Chủ, Dụng-Hỷ-Kị-Cừu thần, (các) Cách Cục chính, điểm mạnh/yếu theo Thập Thần, ứng kỳ quan trọng nếu có hỏi.
- Tư vấn hướng cải thiện dựa trên Dụng thần: nghề nghiệp, phương hướng, màu sắc, quý nhân/đối tác phù hợp (xem `references/dung-than.md` mục 5) — luôn ghi rõ đây là gợi ý theo hành, không phải quy tắc cứng.
- Nếu có vấn đề sức khỏe nghiêm trọng phát hiện qua lá số, luôn nhắc đi khám bác sĩ.
- Nếu bất kỳ phần nào trong quá trình luận không đủ căn cứ từ tài liệu, liệt kê rõ những điểm "chưa chắc chắn" ở cuối phần kết luận thay vì giấu đi để tạo cảm giác đầy đủ.

## Ghi chú vận hành

- Đây là bộ tài liệu skill đã được đúc kết/condense từ nguồn OCR gốc — khi luận, có thể tham chiếu tên file references (ví dụ "theo `cach-cuc.md` #7 Thực Thương sinh Tài") để Công tiện kiểm tra lại, không cần trích dẫn số trang tài liệu OCR gốc.
- Nếu về sau Công bổ sung thêm tài liệu mới (ví dụ phần Thực Thần/Thương Quan/Tỷ Kiên/Kiếp Tài chi tiết, hoặc quy tắc Ứng Kỳ tường minh hơn), cập nhật trực tiếp vào các file references tương ứng thay vì tạo file mới trùng lặp.
