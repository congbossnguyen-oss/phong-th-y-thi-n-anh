---
name: luan-giai-tu-vi-nam-phai
description: Dùng khi Công luận giải lá số Tử Vi theo phương pháp Nam Phái (Tống Nguyên Trung) — dán lá số đã lập sẵn, hoặc ngày giờ sinh + giới tính. Kích hoạt khi hỏi "luận cung Mệnh/Quan/Tài...", "cung này Cát hay Hung", "định cách cục", "Vô Chính Diệu luận thế nào", "Tuần Triệt ảnh hưởng gì", "luận hạn/đại vận/tiểu vận", "luận tổng quát lá số", "an sao cho ngày giờ sinh", và ĐẶC BIỆT "luận chi tiết" cho 1 người/lá số (chạy đúng quy trình chuẩn 8 bước trong `references/quy-trinh-luan-chi-tiet.md`). KHÁC skill `luan-giai-bat-tu`/`luan-giai-bat-tu-manh-phai` (Bát Tự). LUÔN dùng thay vì tự luận theo kiến thức chung — skill chứa quy trình riêng (An Sao, sức mạnh Chính-Trung-Tiểu tinh, 8 Phương Pháp Lượng Giá Cát Hung, Bát Pháp, Tuần Triệt, Vô Chính Diệu, Cách Cục, Luận Hạn, Tổng Luận, Quy trình luận chi tiết 8-bước) đúc kết từ 2 khóa học Tống Nguyên Trung và quy trình chuẩn Công cung cấp — không có sẵn trong kiến thức nền Claude.
---

# Luận Giải Tử Vi — Nam Phái (Tống Nguyên Trung)

Skill này luận giải lá số Tử Vi theo đúng phương pháp trong 2 bộ tài liệu khóa "Tử Vi Nâng Cao" và "Tử Vi Cơ Bản" (giảng viên Tống Nguyên Trung) mà Công đã cung cấp — KHÔNG dùng kiến thức Tử Vi chung chung có sẵn trong trí nhớ nền, trừ khi tài liệu không đề cập và đã nói rõ điều đó với Công.

## ⚠️ Tình trạng tài liệu — đọc trước khi luận

Phần An Sao và Tuần Triệt trong skill này cũng có bản dùng chung tại skill `tu-vi-nen-tang-chung` (nếu Công đã cài) — 2 bản nội dung giống nhau, tách ra để dùng chung được với cả `luan-giai-tu-vi-tam-hop-phai`. Skill này vẫn giữ bản đầy đủ của riêng mình nên chạy độc lập được dù không cài skill nền tảng chung.

Bộ tài liệu gốc là slide khóa học đã OCR, nên **một phần nội dung nằm trong hình ảnh, không có trong bản text**. Phần lớn khoảng trống lớn (an sao, Tuần Triệt, tính lý 14 chính tinh, cách tính Đại/Tiểu Vận, tổng luận) đã được bổ sung từ bộ tài liệu "Tử Vi Cơ Bản" — nhưng vẫn còn thiếu:

- Nội dung cụ thể của **Bước 1–4 luận cung Vô Chính Diệu thuần tịnh** (chỉ có tiêu đề "Bước 1/2/3/4", nội dung nằm trong hình) — xem `references/vo-chinh-dieu.md`.
- Bảng an sao cho Linh Tinh (chỉ có 1 ví dụ mẫu), Đẩu Quân, và bảng Sao Chủ Mệnh/Chủ Thân (dữ liệu nguồn bị xáo trộn hoàn toàn, không tái dựng được) — xem ghi chú trong `references/bang-an-sao-day-du.md` và `references/an-sao-va-cau-truc-la-so.md`. Phần lớn các bảng an sao khác (Tả Hữu, Xương Khúc, Khôi Việt, Kình Đà, Hỏa Tinh, Không Kiếp, Tuần, Tứ Hóa...) đã đầy đủ.
- Nội dung mô tả cụ thể của 8 cách cục đặc biệt có tên riêng (Nhật Xuất Phù Tang, Cực Cư Mão Dậu...) — chỉ có tên gọi, xem `references/suc-manh-cung-vi-va-cach-cuc.md`.
- Một số ô trong bảng "sao X tại từng cung chức" của 14 chính tinh (lỗi OCR nặng, chữ rời rạc) — đã loại bỏ khỏi `references/chinh-tinh-tinh-ly.md`, chỉ giữ phần mô tả Đắc/Hãm đọc được trọn vẹn.
- Phần "Hạn Tử Biệt" (`references/han-tu-biet.md`) có 2 nguồn chất lượng OCR không đều — phần chú giải phú Lê Quý Đôn đáng tin cậy, phần "Ngày chết"/bệnh cụ thể từ Lê Quang Lăng bị xáo trộn thứ tự nặng, chỉ dùng như gợi ý cần đối chiếu thêm, không phải khẳng định chắc chắn.

**Quy tắc bắt buộc:** nếu gặp trường hợp tài liệu chưa đủ, phải nói rõ với Công "tài liệu hiện có chưa đủ chi tiết cho phần này" thay vì tự suy diễn hoặc dùng kiến thức Tử Vi phổ thông khác trường phái để lấp chỗ trống. Công có thể tiếp tục upload thêm tài liệu bổ sung — khi có, cập nhật file reference tương ứng.

## Bước 0 — Kiểm tra input (bắt buộc)

Cần đủ các mục sau, **nếu thiếu thì hỏi lại Công**, không tự bịa:

- Lá số đã lập sẵn (ảnh chụp phần mềm, hoặc bảng Can Chi 12 cung + vị trí sao đầy đủ) HOẶC ngày giờ sinh dương lịch đầy đủ (năm/tháng/ngày/giờ) + **giới tính** (bắt buộc để xác định Âm Dương Nam/Nữ — chi phối chiều an Đại Hạn, Trường Sinh, Lưu Niên...).
- Nếu Công chỉ đưa ngày giờ sinh thô và muốn tự an sao: dùng quy trình ở `references/an-sao-va-cau-truc-la-so.md` (kết hợp bảng tra đầy đủ ở `references/bang-an-sao-day-du.md`), nhưng **ưu tiên đối chiếu với phần mềm lập lá số chuyên dụng** cho các sao vẫn còn thiếu bảng (Linh Tinh, Đẩu Quân, Sao Chủ Mệnh/Chủ Thân) — không tự tin tuyệt đối vào kết quả tính tay cho những sao chưa có bảng tra đầy đủ.
- Câu hỏi cụ thể muốn luận: 1 cung riêng (Mệnh/Tài/Quan/Phối/...), tổng quát toàn bàn (Tổng Luận), hay luận hạn (đại vận/tiểu vận/năm cụ thể)? Mỗi loại câu hỏi dẫn tới quy trình khác nhau (xem các Bước dưới).

## Bước 1 — Định vị sức mạnh & cách cục toàn bàn

Đọc `references/suc-manh-cung-vi-va-cach-cuc.md` (và `references/phuong-phap-luan-cung-vi.md` cho phần Tam Phương Tứ Chính).

- Xác định 3 tầng sao: Chính tinh (14 sao) > Trung tinh (20 sao) > Tiểu tinh — sức mạnh giảm dần theo thứ tự này.
- Xác định thế mạnh cung vị: Bản cung > Đối cung > Hợp cung > Giáp cung (Tam Phương Tứ Chính).
- Với cung đang xét, xác định quan hệ Chủ (bản cung) – Khách (đối/hợp/lân cung) theo Cường/Nhược để biết ai lấn ai.
- Nếu Mệnh/Thân hoặc cung đang luận **không có chính tinh** → chuyển sang cách cục Vô Chính Diệu (Bước 4).
- Nếu có 2 chính tinh đồng cung (song tinh) → cần thêm bước xác định chính tinh nào có sức ảnh hưởng nhất trước khi qua Bước 3 (xem chi tiết trong `references/bat-phap-va-phoi-hop-tinh-ly.md` mục Song Tinh). Có thể tra thêm cách cục song tinh cụ thể trong `references/danh-muc-don-tinh-song-tinh/` nếu cần luận sâu theo đúng tổ hợp 2 sao đó.

## Bước 2 — Chất liệu tính lý (tra cứu khi cần)

Trước khi luận chi tiết 1 cung, có thể cần tra ý nghĩa gốc của sao:

- 14 chính tinh khi nhập Mệnh (Đắc/Hãm): `references/chinh-tinh-tinh-ly.md`.
- Trung tinh (Lục Cát, Lục Sát, Lộc Mã, Tứ Hóa) và Tiểu tinh (các vòng Bác Sĩ/Thái Tuế/Trường Sinh, sao theo Can/Chi): `references/trung-tinh-tieu-tinh.md`.
- Ảnh hưởng Tuần/Triệt Không Vong lên cung/sao/cách cục/vận hạn: `references/tuan-triet.md`.

## Bước 3 — Luận Cát/Hung 1 cung (2 cách làm — chọn theo mức độ cần sâu)

**Cách nhanh — Tám Phương Pháp Lượng Giá** (đọc `references/phuong-phap-luan-cung-vi.md`): xác định chính tinh bản cung Cát hay Hung, rồi xét Trung Tinh Cát/Hung ở Tam Phương Tứ Chính theo 8 trường hợp (case 1-8), sau đó tra ý nghĩa cụ thể theo 12 Cung Chức. Phù hợp khi cần trả lời nhanh, gọn.

**Cách đầy đủ — khung 4 bước Bát Pháp** (đọc `references/bat-phap-va-phoi-hop-tinh-ly.md`): dùng khi Công cần luận sâu (đặc biệt cung Mệnh, hoặc khi đã dùng cách nhanh mà Công muốn rõ hơn):
1. **Xác định 7 trường hợp theo Bát Pháp** cho chính tinh tại cung: Bách quan triều củng / Tam kỳ gia hội / Cát cách / Hung cách / Đế ngộ hung đồ / Cát Hung lẫn lộn / Tại dã cô quân — chọn đúng 1 trường hợp làm định hướng Cát hay Hung cho các bước sau.
2. **Dùng 4 nguyên tắc phối hợp tính lý chư tinh** để luận chi tiết theo hướng đã định ở bước 1, làm tuần tự: 2.1 tính chất chung → 2.2 tính chất phối hợp → 2.3 tính chất khắc nhau → 2.4 tính chất riêng còn lại (Cát thì liệt kê theo hướng cát, Hung thì liệt kê theo hướng hung — không trộn lẫn hai hướng trong cùng 1 bước).
3. **Kết luận Cát hay Hung** cho cung đó.
4. **Luận chi tiết**: nếu Cát thì tốt cụ thể về việc gì; nếu Hung thì hung cụ thể về việc gì — không dừng ở kết luận chung chung "tốt/xấu".

Cả 2 cách đều dùng chung bảng "Ý nghĩa Cát/Hung của 12 Cung Chức" ở `references/phuong-phap-luan-cung-vi.md` để tra ý nghĩa cụ thể sau khi đã có kết luận Cát/Hung.

**Tra sâu hơn theo đúng 1 chính tinh tại đúng 1 cung cụ thể** (khi 2 cách trên chưa đủ chi tiết, đặc biệt các cung ngoài Mệnh): tra `references/danh-muc-12-cung-144-cach-cuc/_index.md` để biết chính tinh + cung đang cần nằm ở đâu trong bộ "Luận 12 Cung và 144 Cách Cục" (Học Viện Phong Thủy Minh Việt) — kho tư liệu lớn, luận đủ 14 chính tinh + VCD tại từng cung trong 12 cung.

Nếu Công hỏi về **cha/mẹ ai mất trước** hoặc **mức độ hợp hôn giữa 2 lá số** (Truyền Cung – Truyền Tinh): đọc `references/ky-thuat-doan-doc-dao.md`.

## Bước 4 — Trường hợp đặc biệt: Vô Chính Diệu (VCD)

Chỉ áp dụng khi cung đang luận không có chính tinh tọa thủ. Đọc `references/vo-chinh-dieu.md`.

- Phân biệt VCD thuần tịnh (không Tuần/Triệt) và VCD có Tuần/Triệt tác động — nguyên tắc ngược nhau: gặp Cát tinh thì KHÔNG cần Tuần Triệt (có sẽ phá cát); gặp Hung tinh thì CẦN Tuần Triệt để kìm hãm hung (nguyên tắc này khớp với "Cát cách→Phá cách, Hung cách→Cứu cách" ở `references/tuan-triet.md` mục VII).
- Xét trường hợp đặc biệt: Nhật Nguyệt chiếu hư không chi địa (Mệnh VCD tại Mùi, được Nhật Nguyệt xung/tam chiếu hội cát tinh); và Tam Không đắc cách (Tuần Không + Triệt Không tại Di/Tài/Quan + Địa Không đắc địa tại 2 cung còn lại) → phú quý khả kỳ.
- Nội dung chi tiết 4 bước định cát hung cho VCD thuần tịnh **chưa có trong tài liệu hiện tại** — nếu gặp, báo Công và tạm dùng khung 4 bước chung ở Bước 3 làm cơ sở, nói rõ đây là suy diễn tạm thời.

## Bước 5 — Luận Hạn (đại vận / tiểu vận / năm cụ thể)

Chỉ làm bước này khi Công hỏi về thời gian/vận hạn. Đọc `references/luan-han.md`.

- Xác định loại vận Công hỏi: Đại Vận (10 năm), Tiểu Vận/Lưu Niên (1 năm — có 3 trường phái tính: Lưu Niên Tiểu Vận / Lưu Niên Đại Vận / Lưu Niên Thái Tuế, cần thống nhất trường phái đang dùng với Công trước khi tính), hoặc sâu hơn (Lưu Nguyệt/Nhật/Thời).
- Nếu cần tính TAY vị trí cung nhập hạn: dùng mục VIII trong `references/luan-han.md` (cách tính Đại Vận theo Cục số + Âm Dương giới tính; cách tính từng trường phái Lưu Niên cụ thể kèm ví dụ).
- Tra ý nghĩa 14 chính tinh nhập hạn + trung tinh nhập hạn (Khôi Việt, Tả Hữu, Xương Khúc, Lộc Tồn, Thiên Mã, Kình Đà, Linh Hỏa, Không Kiếp) tại cung nhập vận.
- Áp dụng **Phương pháp luận Tiểu Vận — bài toán thuận** (6 bước): (1) Tìm cung Tiểu vận nhập vận → (2) Định Cát Hung cung nhập vận (dùng lại Bước 3) → (3) Xét tiếng nói chung giữa các tầng (Đại vận – Tiểu vận – Lưu niên phải đồng thuận thì mới chắc ứng nghiệm) → (4) Dùng Thiên Can lịch pháp kiểm tra yếu tố kích phát → (5) Xét yếu tố gia giảm → (6) Đưa ra kết luận.
- Nếu Công hỏi ngược (tìm năm/giai đoạn hạn xấu hoặc tốt nhất) → dùng **bài toán ngược** (5 bước): (1) Tìm đại vận trọng điểm (cát nhất/hung nhất) → (2) Tìm tiểu vận trọng điểm trong đại vận đó → (3) Dùng Thiên Can lịch pháp kiểm tra yếu tố kích phát → (4) Xét yếu tố gia giảm → (5) Kết luận.
- Có Vận Phi Thường (cát hoặc hung) khi 1 cung vị có biến động vượt ra ngoài mối quan hệ giữa các tầng, cần đủ cả điều kiện cần (cách cục nền: Đế ngộ hung đồ / Bách quan triều củng, hoặc các mở rộng của 2 cách này) và điều kiện đủ (yếu tố kích phát theo Thiên Can lịch pháp).
- Nếu Công hỏi cụ thể về mức độ nguy hiểm tính mạng/an toàn trong 1 giai đoạn (không phải hỏi chung "hạn xấu"), đọc thêm `references/han-tu-biet.md` — có dấu hiệu nhận biết hạn hung hiểm đến tính mạng (Trúc La, sát tinh + Đại/Tiểu Vận trùng phùng + Tuần Triệt), bệnh cụ thể theo sao, và nạn ách theo sao. File này có phần "Độ tin cậy" cần đọc trước — một số đoạn nguồn OCR kém tin cậy hơn phần còn lại của skill, phải nêu rõ khi dùng.

## Bước 6 (tùy chọn) — Tổng Luận toàn bộ lá số

Chỉ chạy khi Công hỏi tổng quát ("luận tổng quát lá số", "xem tổng quan") thay vì hỏi 1 cung/1 vận cụ thể. Đọc `references/tong-luan.md`.

5 bước: (1) Xét Thiên Bàn (thông tin nền, Âm Dương thuận nghịch, sinh khắc Mệnh-Cục) → (2) Xét Cường Cung (Mệnh-Thân là trọng tâm; Nam xét thêm Tài-Quan-Di, Nữ xét thêm Phu-Tài-Tử, Tiểu nhi xét thêm Phúc-Phụ-Tật) → (3) Kết luận tổng quát (sự nghiệp, tiền tài, hạnh phúc, sức khỏe, thọ yểu) → (4) Xét Vận (đối chiếu bảng 8 tổ hợp Mệnh-Thân-Hạn) → (5) Xét nhanh các cung chức còn lại.

## Bước 7 — Luận CHI TIẾT 1 lá số cho ai đó (quy trình chuẩn 8 bước — ƯU TIÊN CAO NHẤT khi áp dụng)

Khi Công nói **"luận chi tiết"** cho 1 người/1 lá số cụ thể (không chỉ hỏi nhanh 1 cung/1 năm), BẮT BUỘC dùng quy trình chuẩn ở `references/quy-trinh-luan-chi-tiet.md` — đây là khung do chính Công cung cấp, thay thế cho Bước 3-6 ở trên khi tình huống này xảy ra (các bước 3-6 vẫn là nguồn phương pháp được gọi vào từ bên trong quy trình 8 bước này).

Tóm tắt 8 bước: (1) Kiểm tra đầu vào → (2) Luận tổng quan lá số (Mệnh-Thân-Cục) → (3) Luận Thiên Bàn (Tam Phương Tứ Chính, chính/phụ tinh, cát/sát tinh, Tuần Triệt) → (4) Luận các chủ đề chính (học vấn, nghề nghiệp, tài chính, hôn nhân, sức khỏe, khó khăn, định hướng) → (5) Luận đủ 12 cung theo thứ tự Phụ Mẫu→...→Mệnh, mỗi cung đúng **Format 7 phần**: Kết luận nhanh / Phân tích cấu trúc / Điểm mạnh / Điểm yếu / Nguyên nhân / Khả năng ứng nghiệm / Khuyến nghị → (6) Luận Đại Hạn → (7) Luận Lưu Niên → (8) Tổng kết (5 điểm mạnh, 5 điểm yếu, giai đoạn thuận/cẩn trọng, ngành nghề phù hợp, điều cần tránh, chiến lược dài hạn).

**5 nguyên tắc bắt buộc xuyên suốt** (đọc kỹ trong file): không dùng Bát Tự/Tứ Trụ; không dùng Khâm Thiên Tứ Hóa; không kết luận từ 1 sao đơn lẻ; luôn xét Tam Phương Tứ Chính + đối cung + toàn cục; mọi kết luận phải có căn cứ nêu rõ.

## Trình bày kết quả

- Trả lời bằng tiếng Việt, đi thẳng vào cung/vấn đề Công hỏi, không lan man sang cung không liên quan trừ khi cần đối chiếu Phúc Đức/Quan/Di để bổ nghĩa.
- Luôn nêu rõ **đang ở bước nào của quy trình** (4 bước Bát Pháp, hoặc 8 phương pháp, hoặc 6 bước luận hạn, hoặc 5 bước tổng luận) khi luận, để Công dễ theo dõi và kiểm tra lại.
- Nếu có nhiều khả năng luận giải (ví dụ Cát Hung lẫn lộn), trình bày rõ các yếu tố kéo về từng hướng thay vì chốt 1 chiều.
- Không tự thêm sao, cách cục, hay ý nghĩa nào ngoài tài liệu đã cung cấp nếu chưa được hỏi hoặc chưa xác nhận với Công.
