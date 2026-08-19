---
name: luan-giai-tu-vi-tam-hop-phai
description: Dùng khi Công muốn luận Tử Vi theo TAM HỢP PHÁI (khác Nam Phái Tống Nguyên Trung) — kích hoạt CHỈ khi Công nói rõ "luận theo Tam Hợp Phái", "xem tử vi theo Tam Hợp", "luận theo phái Minh Việt", "theo cách Tam Hợp", hoặc hỏi về cách cục đặc thù của phái này (Tử Phủ Vũ Tướng, Sát Phá Tham, Cơ Nguyệt Đồng Lương, Nhật Cự, Cự Cơ Mão Dậu, Tham Vũ Đồng Hành, Tử Tham Mão Dậu, Tang Hổ thủ Mệnh, Thai Phục Vượng Tướng, Văn Tinh Ám Củng, Mẫu Người Dịch Mã...). KHÔNG tự động dùng skill này nếu Công không nói rõ trường phái — mặc định luận theo skill `luan-giai-tu-vi-nam-phai`. Nguồn là bộ "Tử Vi Nâng Cao — luận 12 cung và 144 cách cục" cùng "Tử Vi Tam Hợp Phái" (2 tập) của Học Viện Phong Thủy Minh Việt — không có sẵn trong kiến thức nền Claude, LUÔN dùng skill này thay vì tự luận theo trí nhớ chung khi Công đã chỉ định rõ Tam Hợp Phái.
---

# Luận Giải Tử Vi — Tam Hợp Phái (Học Viện Phong Thủy Minh Việt)

Skill này luận Tử Vi theo tài liệu "Tử Vi Tam Hợp Phái" (2 tập) do Học Viện Phong Thủy Minh Việt biên soạn/tổng hợp. Đây là một **trường phái tách biệt** với skill `luan-giai-tu-vi-nam-phai` (Tống Nguyên Trung) — không trộn lẫn 2 phương pháp trong cùng 1 lượt luận, trừ khi Công yêu cầu so sánh rõ ràng.

## ⚠️ Về nguồn tài liệu

- Phần An Sao và Tuần Triệt trong skill này cũng có bản dùng chung tại skill `tu-vi-nen-tang-chung` (nếu Công đã cài) — nội dung giống nhau, tách ra để dùng chung được với cả `luan-giai-tu-vi-nam-phai`. Skill này vẫn giữ bản riêng của mình nên chạy độc lập được dù không cài skill nền tảng chung.

- Nguồn là "tài liệu được hợp từ nhiều nguồn khác nhau để tham khảo thêm" (nguyên văn ghi chú của Học Viện Minh Việt trong sách) — không phải giáo trình giảng dạy chính thức của họ. Nhiều đoạn trích dẫn từ các sách khác (Tử Vi Toàn Khoa, Cẩm Nang Tự Học Tử Vi của Dương Tố Dung...).
- Bản OCR chất lượng khá tốt (tốt hơn nhiều bộ tài liệu Nam Phái), nhưng vẫn có đoạn bị đảo từ nhẹ — nếu câu đọc lên hơi ngược, hiểu theo nghĩa tự nhiên nhất.
- Kho tư liệu rất lớn (~14.000 dòng, 80 sao được mô tả chi tiết). Skill này **curate phần cốt lõi** (kiến thức nền, ý nghĩa 12 cung, 3 cách cục chính + các cách cục đặc biệt có tên riêng) thành các file reference riêng; phần chi tiết từng sao trong 80 sao và luận theo 144 cách cục 12 cung được **giữ nguyên văn dạng thô** trong `references/nguon-goc/` kèm index — tra khi cần độ chi tiết cao hơn.

## Bước 0 — Kiểm tra input

- Xác nhận với Công đây đúng là muốn luận theo Tam Hợp Phái (không phải Nam Phái) — nếu Công chỉ nói "luận tử vi" chung chung, hỏi lại hoặc mặc định dùng Nam Phái.
- Cần: lá số đã lập sẵn, hoặc ngày giờ sinh đầy đủ + giới tính. Cách an sao cơ bản (Mệnh, Thân, Cục, tinh hệ Tử Vi/Thiên Phủ...) xem `references/an-la-so.md` — về cơ chế kỹ thuật gần như giống hệt Tử Vi Đẩu Số nói chung (không riêng gì Tam Hợp Phái), nên nếu Công đã có lá số lập sẵn từ trước thì dùng luôn, không cần lập lại.

## Bước 1 — Kiến thức nền & Ý nghĩa 12 Cung

Đọc `references/y-nghia-12-cung-va-gio-sinh.md`. Nguyên tắc luận cung của phái này:
- Luôn xem đủ **Tam Phương Tứ Chính**: bản cung + cung xung chiếu (đối cung) + 2 cung tam hợp. Nhiều trường hợp phải xem thêm Giáp cung.
- 12 cung chia thành **4 cặp Tam Hợp** cố định: (1) Mệnh – Quan – Tài; (2) Phụ Mẫu – Nô Bộc – Tử Tức; (3) Phúc Đức – Thiên Di – Phu Thê; (4) Điền Trạch – Tật Ách – Huynh Đệ. Đây là cách nhìn đặc trưng của phái — khi luận 1 cung, luôn đối chiếu với 2 cung còn lại trong cùng bộ tam hợp của nó.
- Không nên chỉ xem 1 cung riêng lẻ để kết luận Cát/Hung tổng quát.

## Bước 2 — Xác định Mệnh Cách (chìa khóa vào lá số)

Đọc `references/3-cach-cuc-chinh-va-cach-dac-biet.md`. Thứ tự làm:
1. Xác định lá số thuộc 1 trong **3 cách cục chính**: Tử Phủ Vũ Tướng / Sát Phá (Liêm) Tham / Cơ Nguyệt Đồng Lương — hoặc các cách phụ (Nhật Cự, Cự Cơ Mão Dậu, Nhật Nguyệt Đồng Lâm, Vô Chính Diệu...). Điều kiện: đủ bộ sao trong 4 cung Mệnh + Di (chiếu) + Tài + Quan (tam hợp) mới tính là đạt cách — thiếu sao thì không tính.
2. Xét độ Miếu/Vượng/Đắc/Hãm của từng sao trong cách — cách cục sáng (miếu vượng) và cách cục tối (hãm) cho kết quả rất khác nhau, gần như "một trời một vực".
3. Xét Tuần/Triệt tác động — làm giảm cả sáng lẫn tối (sao sáng có thể giảm về đắc/bình hòa; sao hãm có thể giảm nhẹ bớt).
4. Nếu Mệnh Vô Chính Diệu, có thể "mượn" cách cục của cung Di (đối cung) làm cách cục tham khảo — nhưng chỉ hưởng 7-8 phần 10 so với cách cục "của chính mình", cần nói rõ với Công đây là cách "mượn".
5. Nếu cung đang xét trùng với 1 trong các cách cục đặc biệt có tên riêng (Tham Vũ Đồng Hành, Tử Tham Mão Dậu, Tang Hổ thủ Mệnh, Thai Phục Vượng Tướng, Văn Tinh Ám Củng, Mẫu Người Dịch Mã...), áp dụng thêm phần luận riêng cho cách đó.

## Bước 3 — Luận chi tiết theo sao & theo cung

- Với sao cụ thể cần tra ý nghĩa/tính chất/hình tướng/đắc-hãm: tra `references/nguon-goc/_index.md` để biết sao đó nằm ở đâu trong 2 tập nguồn (80 sao được mô tả đầy đủ: chính tinh, trung tinh, tiểu tinh, vòng Thái Tuế/Trường Sinh/Lộc Tồn).
- Với việc luận riêng 1 cung chức (Mệnh/Phúc Đức/Tật Ách/Tài Bạch/Tử Tức...) theo từng tổ hợp chính tinh cụ thể (khung "144 cách cục"): tra `references/nguon-goc/_index.md` mục tập 1/2/3 "luận 12 cung và 144 cách cục" — chưa đưa vào skill này, cần Công xác nhận có upload thêm 3 tập đó không (chỉ mới nhận diện qua trao đổi, chưa xử lý).

## Bước 4 — Tuần Triệt

Đọc `references/tuan-triet-tam-hop-phai.md` — nguyên tắc: Tuần/Triệt làm giảm hiệu ứng (cả cát lẫn hung), ảnh hưởng đến Chính tinh nhiều hơn Phụ tinh. Đối chiếu thêm với cách VCD (mượn cách cục).

## Trình bày kết quả

- Luôn nói rõ đang luận theo **Tam Hợp Phái** (không lẫn với Nam Phái) khi trả lời.
- Với các mẫu người/cách cục có nội dung nhạy cảm (VD Thai Phục Vượng Tướng liên quan trinh tiết/tình dục ở nữ mệnh), diễn đạt tế nhị, không phán xét, và nói rõ đây là quan điểm cổ điển trong sách chứ không phải nhận định đạo đức.
- Nếu 1 câu hỏi cần độ chi tiết vượt quá các file curated, chủ động mở file thô trong `references/nguon-goc/` theo đúng mục trong `_index.md` thay vì tự suy diễn hoặc dùng kiến thức Tử Vi chung khác trường phái.
