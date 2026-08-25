# Template Gợi Mở Free (KHÔNG gọi AI — thuần code điền chỗ trống)

Đây là đoạn hiển thị NGAY sau khi khách lập lá số xong, miễn phí hoàn toàn, không giới hạn số lần dùng vì không tốn chi phí API. Chỉ cần lấy kết quả có sẵn từ `bat-tu-engine` (đã tính vượng suy + Dụng Thần) và điền vào câu mẫu cố định dưới đây bằng code thuần (string template/interpolation) — không có bước "viết văn" nào, không gọi Claude API.

## Câu mẫu chính (ghép theo thứ tự)

```
Nhật Chủ của bạn là {{canNgay}} ({{hanhCanNgay}}, {{amDuongCanNgay}}), hiện đang ở mức {{nhanCapDoVuongSuy}}.

{{cauTheoCapDo}}

Dụng Thần phù hợp với lá số này là hành {{tenDungThan}} — {{cauGoiYNganTheoHanh}}

Đây mới là phần mở đầu. Bản luận giải đầy đủ sẽ đi sâu vào 12 khía cạnh: tính cách, thần sát, gia đình - lục thân, sự nghiệp - tài vận, hôn nhân, sức khỏe, và trọn vẹn các giai đoạn vận trình từ nhỏ đến già — {{cauKeuGoiNangCap}}
```

## Bảng ánh xạ biến số → giá trị (code tra thẳng, không cần AI)

- `{{canNgay}}`, `{{hanhCanNgay}}`, `{{amDuongCanNgay}}` — lấy trực tiếp từ Tứ Trụ (module lập lá số).
- `{{nhanCapDoVuongSuy}}` — map 7 cấp độ kỹ thuật sang cách gọi dễ hiểu:

| Cấp độ kỹ thuật | Cách gọi hiển thị cho khách |
|---|---|
| Cực cường | "rất mạnh, gần như áp đảo" |
| Cường vượng | "khá mạnh" |
| Vượng | "mạnh vừa phải" |
| Trung hòa | "cân bằng" |
| Suy | "hơi yếu" |
| Nhược | "khá yếu, cần thêm trợ lực" |
| Cực nhược | "rất yếu, cần nương theo thế khác để cân bằng" |

- `{{cauTheoCapDo}}` — 1 câu cố định tùy nhóm (if/else, không cần AI):
  - Nếu Vượng/Cường vượng/Cực cường: "Nhìn chung bạn là người có nội lực mạnh, chủ động, có xu hướng tự quyết định hướng đi của mình."
  - Nếu Trung hòa: "Đây là mức cân bằng dễ chịu — bạn thường không thiên lệch quá về một xu hướng nào."
  - Nếu Suy/Nhược/Cực nhược: "Ở mức này, bạn thường phát huy tốt hơn khi có thêm sự hỗ trợ/đồng hành từ người khác hoặc từ đúng thời điểm."

- `{{tenDungThan}}` — hành Dụng Thần từ bat-tu-engine.
- `{{cauGoiYNganTheoHanh}}` — 1 câu cố định theo hành (tra data/dung-than-nghe-nghiep-phuong-huong.json), ví dụ Dụng Thần Kim: "hợp với các lĩnh vực tài chính, luật, kỹ thuật — và phương Tây, màu trắng/bạc thường mang lại cảm giác thuận lợi hơn cho bạn."
- `{{cauKeuGoiNangCap}}` — 1 câu cố định, ví dụ: "bấm 'Xem luận giải đầy đủ' để khám phá trọn vẹn lá số của bạn."

## Nguyên tắc khi viết code phần này

- Toàn bộ là if/else hoặc switch/case + string interpolation — không có bước gọi mô hình ngôn ngữ nào.
- Không cần áp dụng content-safety-full.json đầy đủ như bản trả phí (vì không có AI tự do sinh chữ, chỉ có sẵn từ 7×5 = 35 tổ hợp câu cố định đã được duyệt trước) — nhưng vẫn nên rà 1 lượt thủ công toàn bộ 35 tổ hợp này trước khi lên web, để chắc chắn không có tổ hợp nào đọc lên nghe kỳ/nặng nề.
- Nếu 1 trường dữ liệu bị thiếu (hiếm khi xảy ra vì bat-tu-engine luôn chốt kết quả dứt khoát), dùng câu dự phòng trung tính: "Lá số của bạn có một số điểm đặc biệt cần phân tích kỹ hơn — hãy xem bản luận giải đầy đủ để hiểu rõ."
