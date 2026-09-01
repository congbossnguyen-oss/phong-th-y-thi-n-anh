---
name: luan-giai-bat-tu
description: Dùng skill này khi Công đưa lên một lá số Bát Tự (Tứ Trụ) — dán/gõ Can Chi Năm Tháng Ngày Giờ, ảnh chụp phần mềm lập lá số, hoặc ngày giờ sinh + giới tính — và muốn luận giải. Kích hoạt khi Công hỏi "luận lá số này", "xem Bát Tự cho...", "Dụng Thần là gì", "vận này thế nào", "cách cục gì", "Thân vượng hay nhược", "năm nào phát tài/thăng chức/kết hôn", "tính cách thế nào", "lục thân/gia đình ra sao", hoặc hỏi về tài vận/quan vận/hôn nhân/sức khỏe/công danh dựa trên 1 lá số cụ thể. LUÔN dùng thay vì tự luận theo kiến thức Bát Tự chung chung — skill chứa phương pháp riêng (vượng suy có hiệu chỉnh, 4 loại Dụng thần, 10 Cách Cục Tài Quan biến hóa + Cách Cục cổ điển đặc biệt, Tầng Thứ Tuế Vận, Tứ Mộ Khố, 45+ Thần Sát, Lục Thân, Tài Vận, Quan Vận, Công Danh, Hôn Nhân, Bệnh Tật, Tính Cách 4 lớp) đúc kết từ nhiều bộ tài liệu Công đã cung cấp (Bát Tự Nền Tảng, Bát Tự Cơ Bản/Trung Cấp/Nâng Cao 1-2 của Tuệ Minh), không có sẵn trong kiến thức nền của Claude.
---

# Luận Giải Bát Tự (Tứ Trụ)

Skill này luận giải 1 lá số Bát Tự theo đúng phương pháp trong các bộ tài liệu Công đã cung cấp — KHÔNG dùng kiến thức Bát Tự chung chung có sẵn trong trí nhớ nền. Nếu tài liệu không đề cập một trường hợp cụ thể đang gặp, phải nói rõ "tài liệu chưa đề cập trường hợp này" thay vì suy diễn.

**Lưu ý vận hành quan trọng**: các file references trong skill này từng bị phát hiện KHÔNG được lưu bền vững qua nhiều lần dù đã báo cáo hoàn tất ở phiên làm việc trước — hiện tượng này xảy ra nhiều lần, không phải 1 lần duy nhất. Trước khi khẳng định "chưa có tài liệu này" hoặc trước khi bắt đầu 1 phiên luận giải quan trọng, nên `memory_list`/xem qua thư mục `references/` để xác nhận thực tế đang có gì, thay vì chỉ dựa vào những gì đã trao đổi trong hội thoại trước đó.

## Phạm vi & giới hạn của skill (đọc trước khi luận)

- Skill KHÔNG tự lập lá số mới nếu Công đã đưa lá số hoàn chỉnh — chỉ luận giải trên lá số đã có.
- Hệ thống "Cách Cục" dùng làm TRỤC CHÍNH trong Giai đoạn 2 là **10 Cách Cục Tài Quan biến hóa** (Ấn hóa Quan Sát, Thực Thương chế Sát...) — KHÁC với Cách Cục cổ điển kiểu Tòng Cách/Hóa Khí/Ngũ Hành độc vượng. Nếu Công hỏi cụ thể về hệ cổ điển đó, dùng `references/cach-cuc-dac-biet.md` — 2 hệ không trộn lẫn trong cùng 1 lượt luận nếu chưa rõ Công muốn hệ nào.
- Thập Thần **Thực Thần, Thương Quan, Tỷ Kiên, Kiếp Tài** chỉ có hàm nghĩa cơ bản trong tài liệu (không có phân tích 6 tầng sâu như 6 thần còn lại: Chính Quan, Thất Sát, Chính Tài, Thiên Tài, Chính Ấn, Thiên Ấn) — xem ghi chú ở `references/thap-than.md`. Riêng mục F trong file đó bổ sung góc nhìn tính cách/nghề nghiệp cho cả 10 Thập Thần khi 1 thần chiếm ưu thế rõ rệt.
- Quy tắc **Ứng Kỳ** không có sẵn thành chương riêng trong tài liệu gốc — phần `references/ung-ky.md` là tổng hợp có căn cứ từ quy tắc Tầng Thứ + án lệ, phải nói rõ điều này khi dùng đến.
- Luận tính cách/tướng mạo có tài liệu riêng ở `references/tinh-cach-nhat-nguyen.md` (theo Ngũ Hành Nhật Can + theo Dụng Thần), `references/tuong-y-can-chi.md` (tượng ý biểu tượng từng Can/Chi), `references/tam-ly-nhat-chu.md` + `references/tam-ly-ngu-hanh.md` (tâm lý học sâu hơn, mang màu sắc cá nhân tác giả, trình bày dè dặt) — đây là lớp mô tả bổ trợ, chỉ dùng khi Công chủ động hỏi về tính cách/ngoại hình/hình tượng/tâm lý, hoặc khi luận báo cáo toàn diện.
- Với Nhật Chủ Giáp hoặc Ất, có thêm tài liệu phân tích chuyên sâu theo tháng sinh ở `references/giap-at-theo-thang.md` — chỉ 2/10 Can có tài liệu này, 8 Can còn lại KHÔNG dùng phương pháp này.
- **Đấu nối với skill `luan-giai-bat-tu-manh-phai`** (nếu đã cài): 2 skill dùng chung 1 số nền tảng nhưng **triết lý luận khác nhau hoàn toàn** (Tử Bình = cân bằng qua Dụng Thần; Manh Phái = thiên lệch có kiểm soát qua Thể-Dụng/Tố Công) — KHÔNG trộn 2 khung trong cùng 1 lượt luận. Chỉ mượn 2 phần cơ chế thuần túy (độc lập với triết lý) từ bên Manh Phái: `hop-hoa-mo-rong.md` (đã dẫn trong `quan-he-can-chi.md` mục 3, dùng khi hợp hóa phức tạp) và `tuong-thap-than.md` (đã dẫn trong `thap-than.md` mục G, dùng để cụ thể hóa Thập Thần thành sự việc). Nếu Công muốn đối chiếu chéo toàn bộ 1 lá số theo cả 2 trường phái, luận riêng từng phần rõ ràng, không gộp kết luận.

## QUY TRÌNH LUẬN GIẢI ĐẦY ĐỦ 1 LÁ SỐ (khi Công đã cung cấp lá số rõ ràng)

Áp dụng khi Công đưa đủ Can Chi Năm-Tháng-Ngày-Giờ — không cần tự lập lá số từ đầu. Chạy đủ các giai đoạn theo thứ tự; không nhảy cóc sang luận lĩnh vực cụ thể trước khi đã xong nền tảng, vì Dụng Thần/Cách Cục xác định sai sẽ làm sai lệch toàn bộ phần sau.

### Giai đoạn 0 — Xác nhận input & mục đích hỏi

- Kiểm tra lá số Công đưa có đủ: Can Chi Năm/Tháng/Ngày/Giờ + Giới tính. Thiếu Giới tính thì phải hỏi ngay (bắt buộc để xác định chiều thuận/nghịch Đại Vận — `references/lap-tu-tru.md`) — không tự giả định.
- Nếu Công dán bảng phần mềm có sẵn Đại Vận/Nạp Âm/Thần Sát: đọc kỹ, tận dụng luôn, không tính lại từ đầu.
- Xác định câu hỏi cụ thể của Công (tổng quan cả đời / tài vận / hôn nhân / sức khỏe / quan vận / lục thân / một mốc Đại Vận-Lưu Niên cụ thể...). Nếu Công chỉ nói "luận giúp lá số này" không rõ trọng tâm → mặc định chạy theo khuôn **luận tổng quan toàn diện**, dùng cấu trúc `references/mau-bao-cao-tong-hop.md` (12 giai đoạn A-L).
- Kiểm tra tính hợp lý cơ bản của lá số (Âm Dương Can-Chi từng trụ phải khớp quy luật lục thập hoa giáp) trước khi luận.

### Giai đoạn 1 — Lập nền: Nhật Chủ, Đại Vận, Nạp Âm

Đọc `references/lap-tu-tru.md`.

- Nhật Chủ = Thiên Can trụ Ngày. Xác định chiều đếm Đại Vận (thuận/nghịch) theo Âm Dương Can Năm + Giới tính, và tuổi khởi vận.
- Tra nhanh Nạp Âm bản mệnh theo `references/nap-am.md` nếu cần nhắc đến (ví dụ Công hoặc khách hàng hỏi "mệnh gì") — không dùng Nạp Âm để luận cát/hung cốt lõi.
- Nếu giờ sinh Công cung cấp nằm sát ranh giới Tiết Khí hoặc gần giờ Tý (23h-1h), vẫn cảnh báo nhẹ về độ nhạy của giờ dù lá số đã có sẵn.

### Giai đoạn 2 — Vượng suy Nhật Chủ → Dụng Thần → Cách Cục (trục xương sống)

Đây là 3 bước bắt buộc phải làm đúng thứ tự vì mỗi bước là nền của bước sau:

1. **Vượng suy** (`references/vuong-suy.md` + `references/quan-he-can-chi.md` mục hợp hóa/tam hợp/tam hội): xét đủ Được Lệnh – Đắc Địa – Được Sinh – Được Trợ Giúp; kiểm tra thấu can-thông căn; kiểm tra hợp hóa có làm đảo ngược kết luận không (bao gồm quy tắc "Nhật Chủ tự hợp chỉ luận Hợp, không luận Hóa"); nếu Nguyệt Lệnh là Thìn/Tuất/Sửu/Mùi thì đọc thêm `references/mo-kho.md` mục Tạp Khí. Kết luận theo 7 cấp độ (Cực cường → Cực nhược).
2. **Dụng Thần – Hỷ – Kị – Cừu** (`references/dung-than.md`): chọn đúng 1 trong 4 phương pháp (Phù Ức / Thông Quan / Thuận Thế / Điều Hậu). Khi Phù Ức và Điều Hậu chỉ ra 2 hướng khác nhau (ví dụ Kỵ Thần theo Phù Ức lại là hành Điều Hậu cần thêm do sinh mùa quá lạnh/nóng), PHẢI giải thích rõ hành nào ưu tiên hơn và vì sao — không được nêu 2 kết luận trái ngược cạnh nhau mà không giải thích (dễ đọc như tự mâu thuẫn, gây hoang mang cho người không rành kỹ thuật). Nếu nghi ngờ mệnh cục cực vượng/cực nhược tới mức Tòng, đối chiếu thêm `references/cach-cuc-dac-biet.md` trước khi kết luận — 2 hệ Cách Cục (Tài Quan biến hóa vs cổ điển) không trộn lẫn, nói rõ đang dùng hệ nào.
3. **Cách Cục Tài Quan biến hóa** (`references/cach-cuc.md`, trục chính của skill): rà soát khớp với 10 mô hình nào, dùng kỹ thuật dòng chảy ngũ hành để xác định "thành/phá/thành nhưng yếu".

### Giai đoạn 3 — Luận Thập Thần theo từng cung + bổ sung tính cách/tượng ý

- Xác định Thập Thần tại Thiên Can lộ và Can tàng trong Địa Chi cả 4 trụ (`references/thap-than.md`), xác định Hỷ/Kị cho từng thần dựa trên Dụng Thần đã chọn. 6 thần có tài liệu sâu luận theo cung vị/lục thân; 4 thần còn lại chỉ dùng hàm nghĩa cơ bản trừ khi 1 Thập Thần chiếm ưu thế rõ rệt — khi đó dùng thêm mục F "Cách Cục Thập Thần đơn" trong cùng file. Nếu cần cụ thể hóa thành sự việc/vật thể đời thực, xem mục G (đấu nối Manh Phái, tùy chọn).
- Nếu Công muốn mô tả tính cách/ngoại hình sâu hơn: bổ sung `references/tinh-cach-nhat-nguyen.md`, `references/tuong-y-can-chi.md`, và nếu cần chiều sâu tâm lý thì thêm `references/tam-ly-nhat-chu.md` + `references/tam-ly-ngu-hanh.md` (luôn trình bày với giọng "góc nhìn gợi mở", không khẳng định chắc). Nếu Nhật Chủ là Giáp/Ất, có thể bổ sung thêm `references/giap-at-theo-thang.md`.

### Giai đoạn 4 — Thần Sát & Mộ Khố (lớp bổ trợ — có đóng góp nhưng KHÔNG phải yếu tố tiên quyết)

- Tra `references/than-sat.md` cho các Thần Sát liên quan (đọc "Nguyên tắc sử dụng Thần Sát" đầu file trước — luôn xét Thần Sát SAU KHI đã có Dụng Thần/Thập Thần từ Giai đoạn 2-3, không dùng đơn lẻ để đảo ngược kết luận đã chốt). File hiện có 45+ công thức xác định (PHẦN A Cát Thần + PHẦN B Hung Thần) — khi rà soát toàn diện, PHẢI chạy đủ toàn bộ danh mục, KHÔNG chỉ dừng ở nhóm sao cơ bản mà 1 module lập lá số có thể đã hiển thị sẵn trên thẻ lá số (thường chỉ ~15-20 sao phổ biến nhất, thiếu các sao mở rộng như Củng Lộc, Giáp Sát, Cô Loan Sát, Tứ Phế, Phi Nhận, Lưu Hà, Lục Tú, Thập Linh, Tiến Thần...).
- Kiểm tra `references/mo-kho.md` cho bất kỳ Thập Thần/lục thân quan trọng nào đang nhập Mộ/Khố trong nguyên cục.

### Giai đoạn 5 — Luận theo từng lĩnh vực cụ thể (hoặc đủ cả nếu luận toàn diện)

| Lĩnh vực | Tài liệu chính |
|---|---|
| Tài vận / sự nghiệp | `dung-than.md` mục nghề nghiệp, `tai-van.md` (dấu hiệu phát/phá tài) |
| Quan vận / thăng tiến / chức vụ | `cach-cuc.md`, `quan-van.md` (dấu hiệu thăng/mất chức) |
| Học tập / thi cử / danh tiếng / thương hiệu cá nhân | `cong-danh.md` |
| Hôn nhân / tình cảm | `hon-nhan.md` (quy trình đầy đủ Nam/Nữ), `thap-than.md` (Tài với nam, Quan Sát với nữ), `than-sat.md` (Đào Hoa, Hồng Diễm, Hồng Loan, Cô Thần-Quả Tú, Âm Dương Sai Thố, Cô Loan Sát), `luc-than.md` mục III |
| Sức khỏe / bệnh tật | `benh-tat.md` (đủ 8 mục: cung vị Can/Chi, tổ hợp Thập Thần, thương tật, lao tù/pháp luật, năm ứng hạn) + `than-sat.md` (Dương Nhận, Tai Sát, Kiếp Sát, Huyết Nhẫn) — **luôn kèm khuyến nghị y khoa, không thay thế chẩn đoán** |
| Cha mẹ / anh chị em / con cái | `luc-than.md` mục I/II/III/IV (đủ cả 4 mục, gồm cả Tổ Nghiệp trong mục I), kết hợp `mo-kho.md` nếu Thập Thần lục thân nhập Mộ |
| Quý nhân / phương hướng / hợp tác | `dung-than.md` mục 5, `than-sat.md` (Thiên Ất, Thiên Đức/Nguyệt Đức) |

Nếu luận toàn diện (không phải 1 câu hỏi riêng lẻ): trình bày đủ theo khuôn `references/mau-bao-cao-tong-hop.md` (Giai đoạn A→L: Nền tảng → Tính cách → Thập Thần → Thần Sát → Mộ Khố → Lục Thân → Nghề nghiệp/Tài/Quan/Công Danh → Hôn Nhân → Sức khỏe → Ngũ Hành thực hành → Đại Vận trọn đời → Kết luận), có thể gộp/tách mục tùy độ dày nội dung thực tế của lá số nhưng KHÔNG được bỏ trọn 1 mục nào (ví dụ từng xảy ra lỗi bỏ sót Anh chị em trong Lục Thân, hoặc bỏ sót mục lao tù/pháp luật trong Sức khỏe — luôn rà đủ checklist trước khi báo thiếu dấu hiệu).

### Giai đoạn 6 — Đại Vận & Lưu Niên, xác định ứng kỳ

- Đọc `references/quan-he-can-chi.md` mục Tầng Thứ trước, rồi `references/ung-ky.md`.
- Với mỗi mốc Đại Vận/Lưu Niên cần luận: xác định lại vượng suy Nhật Chủ TẠI THỜI ĐIỂM ĐÓ (có thể khác nguyên cục), rồi áp bảng cát/hung tuế vận trong `cach-cuc.md`.
- Áp Tầng Thứ (Lưu Niên > Đại Vận > Mệnh cục, Nguyệt Chi cao nhất nội bộ mệnh cục) để xác định xung/hợp/hình/hại nào thực sự có hiệu lực.
- Xác định ứng kỳ theo `ung-ky.md`, ưu tiên năm có nhiều dấu hiệu trùng nhau; không chốt 1 năm duy nhất nếu căn cứ mỏng.
- Câu hỏi về lục thân (cha/mẹ/vợ/chồng/con/anh chị em): xét Thập Thần đại diện lục thân đó (`luc-than.md`), KHÔNG dùng Dụng Thần mệnh chủ; kết hợp `than-sat.md` mục Tang Môn-Điếu Khách nếu cần. **Không khẳng định "chết"** — chỉ nói mức độ "cần đề phòng/đau ốm nặng".
- Câu hỏi về tai họa/bệnh nặng/tù tội: dùng thêm nguyên tắc "năm ứng hạn" ở `benh-tat.md` mục 8, cùng mức thận trọng ngôn từ như trên.

### Giai đoạn 7 — Kết luận & tư vấn

- Tóm tắt: vượng suy Nhật Chủ, Dụng-Hỷ-Kị-Cừu Thần, Cách Cục chính, điểm mạnh/yếu theo Thập Thần, ứng kỳ quan trọng (nếu có hỏi).
- Chọn ra điểm mạnh nhất và điểm cần lưu ý nhất trong TOÀN BỘ những gì đã luận — không liệt kê dàn trải, ưu tiên hóa 1-2 điểm quan trọng nhất mỗi loại. Đây là phần thể hiện giá trị chuyên môn cao nhất.
- Tư vấn hướng cải thiện theo Dụng Thần: nghề nghiệp, phương hướng, màu sắc/vật dụng, quý nhân/đối tác phù hợp (`dung-than.md` mục 5) — luôn ghi rõ đây là gợi ý theo hành, không phải quy tắc cứng.
- Nhắc khám bác sĩ nếu phát hiện dấu hiệu sức khỏe đáng lo.
- Liệt kê rõ điểm "chưa chắc chắn" nếu bất kỳ phần nào thiếu căn cứ từ tài liệu — không che giấu để tạo cảm giác đầy đủ giả tạo.

### Giai đoạn 8 — Trình bày

- Văn phong: đi thẳng vào luận giải, ngắn gọn, có cấu trúc rõ (theo phong cách làm việc Công đã thiết lập) — không lặp lại toàn bộ lý thuyết nền tảng mỗi lần, chỉ nêu kết luận + lý do cốt lõi.
- Có thể tham chiếu tên file (ví dụ "theo `cach-cuc.md` #7") để Công tiện kiểm tra lại — không cần trích số trang OCR gốc.
- Với báo cáo toàn diện dài, có thể chia thành nhiều lượt trả lời theo từng giai đoạn nếu Công muốn (hỏi trước xem Công muốn nhận 1 lần đủ hay theo từng phần).

## Ghi chú vận hành

- Đây là bộ tài liệu skill đã được đúc kết/condense từ nguồn OCR gốc — khi luận, có thể tham chiếu tên file references (ví dụ "theo `cach-cuc.md` #7 Thực Thương sinh Tài") để Công tiện kiểm tra lại, không cần trích dẫn số trang tài liệu OCR gốc.
- Nếu về sau Công bổ sung thêm tài liệu mới, cập nhật trực tiếp vào các file references tương ứng thay vì tạo file mới trùng lặp.
- Nếu Công hỏi "mệnh gì" theo năm sinh (Nạp Âm dân gian, ví dụ "tuổi Giáp Tý mệnh gì") → dùng `references/nap-am.md`, không nhầm với Ngũ Hành của riêng Thiên Can/Địa Chi.
- Nếu Công muốn 1 bài luận toàn diện cả đời (không chỉ trả lời 1 câu hỏi cụ thể), đặc biệt cho gói dịch vụ thu phí → dùng quy trình checklist đầy đủ ở `references/mau-bao-cao-tong-hop.md` (12 giai đoạn A-L, rà đủ Thần Sát/Lục Thân/Tài Vận/Quan Vận/Hôn Nhân/Bệnh Tật/Đại Vận trọn đời — Thập Thần theo cung là trục nền tảng bắt buộc; Thần Sát là lớp bổ trợ có đóng góp thật nhưng không phải yếu tố tiên quyết, không dùng để đảo ngược kết luận đã chốt từ Dụng Thần/Cách Cục/Thập Thần).
