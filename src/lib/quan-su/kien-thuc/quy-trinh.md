---
name: hoa-giai-kinh-dich
description: Dùng skill này khi người dùng đưa lên một quẻ Lục Hào/Kinh Dịch đã lập sẵn (dán bảng kiểu "Trang Dịch Quái", ảnh chụp phần mềm lập quẻ, hoặc liệt kê tay Can Chi + Hào + Lục Thân + Lục Thần + Không Vong) và muốn luận giải cát hung hoặc hỏi cách hóa giải. Kích hoạt khi người dùng hỏi "quẻ này luận thế nào", "quẻ này cầu tài/cầu duyên/sức khỏe/công việc/phong thủy nhà ở/con cái ra sao", "quẻ xấu vậy hóa giải được không", "cho tôi cách hóa giải quẻ này", "quẻ này báo hiệu điều gì", hoặc khi người dùng dán/tải lên bảng thông tin quẻ mà chưa nói rõ câu hỏi cụ thể. LUÔN dùng skill này thay vì tự luận theo trí nhớ chung — skill chứa quy trình chuẩn (xác định Dụng thần → phân tích sinh khắc/Không Vong/Nguyệt phá → tìm nguyên nhân cốt lõi qua thủ tượng → chọn đúng phương pháp hóa giải) đúc kết từ nhiều đầu sách chuyên sâu (Vương Hổ Ứng, Nguyễn Huy Hoàng) mà không có sẵn trong kiến thức nền của Claude. Skill KHÔNG tự lập quẻ mới — chỉ luận giải quẻ người dùng đã cung cấp.
---

# Hóa giải Lục Hào / Kinh Dịch

Skill này giúp luận giải một quẻ Lục Hào đã lập sẵn và đề xuất phương pháp hóa giải nếu quẻ báo hung, dựa trên tổng hợp từ "Lục Hào Xu Cát Tị Hung (Hóa Giải) Bí Truyền" (Vương Hổ Ứng) và "Kinh Dịch Ứng Dụng Hóa Giải — Xu Cát Tị Hung Tường Giải" (Nguyễn Huy Hoàng).

Cả hai tác giả đều thống nhất một điểm cốt lõi: **hóa giải không phải là công thức máy móc "vấn đề X → vật phẩm Y"**. Phải luận đúng quẻ trước, tìm ra đúng nguyên nhân cốt lõi, rồi mới chọn phương pháp hóa giải phù hợp với chính thông tin quẻ đưa ra — nếu bỏ qua bước phân tích mà nhảy thẳng vào "gợi ý vật phẩm phong thủy" thì hóa giải sẽ không có tác dụng thật, chỉ là bịa đặt cho có.

## Bước 0 — Kiểm tra input

Cần đủ các thông tin sau để luận quẻ. Nếu thiếu, hỏi lại người dùng thay vì đoán:

- Ngày giờ lập quẻ (Can Chi ngày/tháng/năm, tốt nhất có cả Nguyệt lệnh theo tiết khí)
- Câu hỏi cụ thể (cầu tài, sức khỏe, hôn nhân, công việc, phong thủy nhà ở, con cái...) — nếu người dùng chưa nói rõ, hỏi trước khi luận vì mỗi loại việc lấy Dụng thần khác nhau
- Đầy đủ 6 hào của quẻ chính: Lục thân (Phụ Mẫu/Huynh Đệ/Quan Quỷ/Thê Tài/Tử Tôn), Can Chi từng hào, hào Thế/Ứng, hào nào động
- Lục thần từng hào (Thanh Long, Chu Tước, Câu Trần, Đằng Xà, Bạch Hổ, Huyền Vũ) nếu có
- Quẻ biến (nếu có hào động) — Lục thân + Can Chi của quẻ biến
- Không Vong của tuần (nếu bảng không ghi sẵn, tự tính theo Bước 1 trong `references/nguyen-tac-luan-giai.md`)
- Phục Thần (nếu Dụng thần không lộ trên quẻ chính)

Người dùng thường dán nguyên bảng từ phần mềm lập quẻ (kiểu "Trang Dịch Quái", hocvienlyso.org...) — đọc kỹ toàn bộ bảng trước khi luận, đừng bỏ sót Không Vong, Phục Thần, hay cột Lục Thú/Lục Thần.

## Bước 1 — Xác định Dụng thần

Tra theo mục đích hỏi:

| Việc hỏi | Dụng thần |
|---|---|
| Cầu tài, kinh doanh, đầu tư | Thê Tài |
| Hôn nhân, tình duyên (nam hỏi vợ / nữ hỏi chồng) | Thê Tài (nam) / Quan Quỷ (nữ) |
| Công danh, chức vụ, thi cử, kiện tụng | Quan Quỷ |
| Sức khỏe, bệnh tật, tai nạn | Thế hào (bản thân) hoặc người được hỏi thay; xét thêm Tử Tôn (thầy thuốc/thuốc men) |
| Con cái, học trò, cấp dưới, vật nuôi | Tử Tôn |
| Cha mẹ, nhà cửa, xe cộ, giấy tờ, hợp đồng, mộ phần | Phụ Mẫu |
| Anh chị em, bạn bè, đồng nghiệp, đối thủ cạnh tranh | Huynh Đệ |
| Bản thân người hỏi / vận hạn chung | Hào Thế |
| Đối phương / người khác được hỏi tới | Hào Ứng |

Nếu Dụng thần không lộ trên quẻ chính, dùng **Phục Thần** (ghi dưới Phi Thần tương ứng) — quan hệ Phi/Phục (Phi sinh Phục, Phục sinh Phi, Phi khắc Phục...) là một lớp thông tin quan trọng, đừng bỏ qua.

## Bước 2 — Phân tích cát hung

Xét đầy đủ các lớp thông tin sau (không chỉ dừng ở 1 yếu tố — sách nhấn mạnh cần tối thiểu 2 thông tin trở lên mới kết luận chắc):

1. **Vượng suy theo mùa** (Nhật/Nguyệt với Dụng thần) — dùng bảng vượng-tướng-hưu-tù-tử trong `references/nguyen-tac-luan-giai.md`
2. **Không Vong** — Dụng thần/hào quan trọng có rơi vào tuần Không không; Không Vong có thể là "hư" (tài không thực, việc chưa thành) hoặc chờ ngày Xung Không/Thực Không mới phát
3. **Nguyệt phá** — hào bị Nguyệt xung thì gọi Nguyệt phá, suy yếu nặng
4. **Hào động và hào biến** — hồi đầu sinh/khắc, hóa Tiến Thần/Thoái Thần, hóa Không, hóa Mộ...; hào biến bị Nhật/Nguyệt xung thì lực biến bị cản tạm thời
5. **Lục thần** bổ nghĩa tình huống cụ thể (Thanh Long=vui/háo sắc, Chu Tước=lời nói/thị phi, Câu Trần=chậm chạp/kiến trúc/u bướu, Đằng Xà=lo lắng/quái dị, Bạch Hổ=hung dữ/tai nạn/phẫu thuật, Huyền Vũ=ám muội/trộm cắp/che giấu)
6. **Hào Thế/Ứng** — Thế là bản thân, Ứng là đối tượng liên quan; xét ai sinh/khắc ai
7. **Tam hợp cục, lục hợp, lục xung, hình, hại** giữa các địa chi trong quẻ nếu có

## Bước 3 — Tìm nguyên nhân cốt lõi bằng Thủ tượng

Đây là bước hay bị bỏ qua nhưng theo Nguyễn Huy Hoàng là **quan trọng nhất**: phải "thủ tượng" được từng hào/địa chi đang đại diện cho sự vật cụ thể gì trong đời thực của người hỏi, không chỉ dừng ở "tốt/xấu" chung chung.

Dùng hai bảng tra cứu:
- `references/thu-tuong-bat-quai.md` — ý nghĩa biểu tượng của 8 quái (Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn): phương vị, thân thể, đồ vật, con người, con vật liên quan
- `references/thu-tuong-dia-chi.md` — ý nghĩa biểu tượng của 12 địa chi theo buổi sáng/ngày/đêm, cùng phản cung phương vị và vật phẩm phong thủy tương ứng

Ví dụ cách dùng: hào Quan Quỷ động là Tuất Thổ lâm Câu Trần → Câu Trần chủ kiến trúc/chậm chạp, Tuất thuộc quái Càn (Tây Bắc) → có thể là công trình/kiến trúc phía Tây Bắc nhà đang gây ảnh hưởng, chứ không chỉ dừng lại ở "có Quan Quỷ xấu".

## Bước 3.5 — Đối chiếu án lệ tương tự (nếu có)

Trước khi tự nghĩ phương án hóa giải, quét nhanh `references/an-le/00-INDEX.md` — đây là chỉ mục 153 case thực tế đã hóa giải (từ Vương Hổ Ứng), phân theo chủ đề (sức khỏe, tâm linh/ma quái, gia đình/hôn nhân, công việc/tài vận/pháp lý, phong thủy/nhà cửa). Nếu có case cùng chủ đề hoặc cùng kiểu tình huống, mở đúng file `chunk-0X.md` tương ứng để xem cách tác giả luận và chọn vật hóa giải.

Case tham khảo chỉ để lấy **tinh thần luận giải và cách tổng hợp vật phẩm**, không copy nguyên vật phẩm/con số sang quẻ đang xem — Dụng thần, sinh khắc, Không Vong của quẻ mới luôn phải tự tính lại từ đầu theo đúng Bước 1-3 ở trên. Nếu không có case nào đủ gần, bỏ qua bước này và tự luận theo quy trình chuẩn.

## Bước 4 — Chọn phương pháp hóa giải

Chỉ hóa giải khi Bước 2 đã chỉ ra thông tin xấu thật sự (quẻ cát thì không cần, đừng tự bịa ra vấn đề để hóa giải). Đọc `references/phuong-phap-hoa-giai.md` để chọn 1-2 phương pháp trong số ~15 phương pháp đã tổng hợp (chỉnh sửa phong thủy, đặt vật hóa giải, màu sắc, phương vị, thời gian, tên người/tên đất, tu luyện, mượn vận, ngoại ứng, thế thân, gương thái cực bát quái, bùa hộ mệnh, trang phục, giường ngủ, thay đổi ý đồ, chọn ngày giờ tốt, vật phẩm phong thủy chuẩn hóa).

Nguyên tắc chọn:

- Phương án phải xoay quanh chính Dụng thần và nguyên nhân cốt lõi đã tìm ở Bước 3 — không đề xuất chung chung kiểu "đặt gương bát quái cho chắc"
- Kết hợp ít nhất 2 lớp thông tin (ví dụ: màu sắc + phương vị, hoặc thời gian + vật phẩm) thay vì chỉ dùng 1 phương pháp đơn lẻ
- Ưu tiên phương pháp phù hợp thực tế văn hóa, hoàn cảnh người hỏi (ví dụ: hóa giải mộ phần không áp dụng được nếu gia đình đã hỏa táng)
- Nếu vấn đề cốt lõi là hành vi/quyết định sai của người hỏi (ví dụ: đầu tư liều lĩnh khi Dụng thần suy), ưu tiên "hóa giải bằng thay đổi ý đồ" — khuyên đổi hướng đi — trước khi nghĩ đến vật phẩm
- Nêu rõ thời điểm nên làm (giờ/ngày/tháng) và thời điểm nên tránh nếu luận ra được từ Nhật/Nguyệt/xung hợp

## Nguyên tắc đạo đức khi tư vấn (bắt buộc tuân thủ)

- Không đề xuất sát sinh, nuôi con vật để "thế mạng" chịu nạn, dùng bùa ngải/âm binh, hoặc bất kỳ phương pháp nào hại người khác để lợi cho mình.
- Không luận đoán mập mờ kiểu "nhanh thì tháng X khỏi, chậm thì tháng Y khỏi" để giữ khách quay lại — nói thẳng nguyên nhân cốt lõi và hướng giải quyết thực chất.
- Nếu quẻ chỉ ra vấn đề sức khỏe nghiêm trọng, luôn nhắc người dùng đi khám bác sĩ — hóa giải là hỗ trợ thêm, không thay thế y tế.
- Nếu chưa đủ dữ kiện để chắc chắn một chi tiết nào đó, nói rõ "chưa chắc chắn" thay vì đoán bừa cho có vẻ đầy đủ.
- Các bước "chú an vị" (đọc chú, bắt ấn...) trong tài liệu gốc mang tính tín ngưỡng dân gian — trình bày trung lập như tư liệu tham khảo, không ép người dùng phải làm theo, có thể lược bỏ nếu người dùng không quan tâm đến phần tâm linh.

## Định dạng output

Luôn trình bày theo cấu trúc sau (tiếng Việt, có heading, có bảng khi cần):

1. **Xác định Dụng thần** — ngắn gọn, nêu rõ vì sao chọn Dụng thần đó
2. **Phân tích cát hung** — đi qua các lớp thông tin ở Bước 2, viết dạng gạch đầu dòng cô đọng, mỗi ý nêu rõ suy luận (không chỉ kết luận suông)
3. **Nguyên nhân cốt lõi** — 1 đoạn ngắn tổng hợp lại, dùng thủ tượng nếu giúp cụ thể hóa vấn đề
4. **Kết luận** — trả lời thẳng câu hỏi ban đầu của người dùng
5. **Hóa giải** (chỉ khi quẻ xấu) — bảng hoặc danh sách phương pháp cụ thể kèm cách làm, có thể kèm mốc thời gian nên/không nên hành động

Nếu người dùng chỉ hỏi hóa giải mà không hỏi luận toàn bộ quẻ, vẫn nên tóm tắt ngắn phần 1-4 trước khi vào phần hóa giải, vì hóa giải đúng bắt buộc phải dựa trên phân tích đúng.
