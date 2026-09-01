# Chi Tiết Prompt Riêng Từng Giai Đoạn (A → L)

Mỗi mục dưới đây điền vào phần `{{noiDungKnowledgeMd}}`, `{{quyTacRiengGiaiDoan}}`, `{{doDaiGoiY}}` của prompt khung chung (`khung-chung.md`). Tên file trong cột "Knowledge" nằm trong `content/bat-tu/knowledge/`. Đây là **1 gói duy nhất, 1 lần thanh toán** — không tách Cơ Bản/Nâng Cao, đủ 12 giai đoạn liền mạch.

| GĐ | Tên | Knowledge (.md đọc vào prompt) | Độ dài gợi ý | quyTacRiengGiaiDoan |
|---|---|---|---|---|
| A | Nền tảng | (không cần — dùng thẳng laSoJSON đã có kết luận từ bat-tu-engine) | 150-200 chữ | (để trống) |
| B | Tính cách | tinh-cach-nhat-nguyen.md, tuong-y-can-chi.md, tam-ly-nhat-chu.md | 250-350 chữ | (để trống) |
| C | Thập Thần theo cung | thap-than.md | 200-300 chữ | (để trống) |
| D | Thần Sát | than-sat.md | 250-400 chữ (tùy số sao có mặt) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_D_than_sat |
| E | Mộ Khố | mo-kho.md | 100-150 chữ (bỏ qua nếu không có Mộ Khố nào) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_E_mo_kho |
| F | Lục Thân | luc-than.md | 400-600 chữ (ĐỦ 4 mục: cha mẹ + tổ nghiệp/anh chị em/vợ chồng/con cái) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_F_luc_than (TOÀN BỘ object) — CÓ THÊM LƯỢT KIỂM DUYỆT RIÊNG |
| G | Nghề nghiệp/Tài/Quan/Công Danh | dung-than.md, tai-van.md, quan-van.md, cong-danh.md (chỉ đọc cong-danh.md nếu khách hỏi học vấn/danh tiếng) | 400-500 chữ | (để trống) |
| H | Hôn Nhân | hon-nhan.md | 300-450 chữ | (để trống, nhưng vẫn áp tu_khoa_cam_tuyet_doi như mọi giai đoạn) |
| I | Sức khỏe | benh-tat.md | 250-400 chữ (ĐỦ các mục có dữ kiện, kể cả mục 7 lao tù/pháp luật nếu findings có) | Toàn bộ nguyên tắc đạo đức cuối benh-tat.md — CÓ THÊM LƯỢT KIỂM DUYỆT RIÊNG |
| J | Ngũ Hành thực hành | (không cần — dùng thẳng dung-than-nghe-nghiep-phuong-huong.json) | 100-150 chữ | (để trống) |
| K | Đại Vận trọn đời | ung-ky.md, quan-he-can-chi.md mục Tầng Thứ | 500-800 chữ (dài nhất) | (để trống) |
| L | Kết luận | (không cần file riêng — AI tự tổng hợp từ TOÀN BỘ findings A→K) | 200-300 chữ | (để trống) |

## Checklist bắt buộc cho Tầng 1 (Findings Engine) trước khi giao cho Tầng 2 — rút ra từ lỗi thực tế đã phát hiện

Trước khi gọi AI viết bất kỳ giai đoạn nào, đảm bảo Tầng 1 đã thực sự làm đủ các việc sau (những lỗi này đã xảy ra trong 1 lần chạy thật, phải chặn lại):

1. **Giai đoạn D (Thần Sát) PHẢI chạy đủ 45 công thức trong `data/than-sat.json`**, KHÔNG được chỉ lấy lại đúng bảng "Thần Sát Nguyên Cục" mà module lập lá số đã hiển thị sẵn (bảng đó thường chỉ có ~15-20 sao cơ bản). Nếu Tầng 1 chỉ đọc lại bảng có sẵn thay vì tự chạy `than-sat.json`, đây là lỗi — phải sửa để Findings Engine tự tính đủ 45 sao trên chính Tứ Trụ.
2. **Giai đoạn F (Lục Thân) PHẢI có đủ 4 mục**: (1) Cha mẹ — gồm cả vượng/suy LẪN mục Tổ Nghiệp (gia sản hưng thịnh/sa sút), (2) Anh chị em, (3) Vợ chồng, (4) Con cái. Từng xảy ra lỗi thiếu hẳn mục Anh chị em và mục Tổ Nghiệp — nếu findings rỗng cho 1 mục vì lá số không đủ dấu hiệu, ghi rõ trong output "không đủ dấu hiệu rõ ràng ở mục [X]" để Tầng 2 biết mà bỏ qua CÓ CHỦ ĐÍCH, không phải bỏ sót do chưa chạy.
3. **Giai đoạn I (Sức khỏe) rà đủ 8 mục trong `benh-tat.md`**, đặc biệt không được bỏ sót mục 7 (lao tù/pháp luật) chỉ vì nó ít khi có dấu hiệu — vẫn phải chạy qua, nếu không có dấu hiệu thì để trống có chủ đích.
4. **Giai đoạn K (Đại Vận) không được để trống bất kỳ năm Lưu Niên nào trong phạm vi hiển thị** (ví dụ 10 năm tới) bằng câu placeholder "cần tham khảo thêm cùng chuyên gia" — câu này CHỈ được dùng khi hậu kiểm (Tầng 3) chặn thật sự do vi phạm an toàn nội dung nghiêm trọng, KHÔNG được dùng làm giá trị mặc định khi có lỗi runtime/timeout/hết quota. Nếu 1 năm bị lỗi kỹ thuật (không phải lỗi an toàn nội dung), hệ thống phải THỬ LẠI (retry) ít nhất 1-2 lần trước khi rơi về placeholder, và nên ghi log riêng để biết đây là lỗi kỹ thuật chứ không phải bị chặn nội dung — 2 nguyên nhân khác nhau cần xử lý khác nhau.
5. **Giai đoạn A khi có xung đột giữa Phù Ức và Điều Hậu** (ví dụ Kỵ Thần theo Phù Ức lại là hành cần thêm theo Điều Hậu mùa lạnh/nóng — xem `vuong-suy.md`/`dung-than.md` mục Điều Hậu): Tầng 1 PHẢI quyết định rõ ràng hành nào ưu tiên hơn (theo đúng nguyên tắc trong `dung-than.md`: Phù Ức là chính, Điều Hậu chỉ bổ sung song song khi không mâu thuẫn) và Tầng 2 PHẢI giải thích ngắn gọn 1 câu vì sao — KHÔNG được in ra cả 2 kết luận cạnh nhau mà không giải thích (dễ đọc như tự mâu thuẫn, gây hoang mang cho khách không rành kỹ thuật).

## Prompt riêng Giai đoạn A (mẫu cụ thể, khác cấu trúc chuẩn vì không cần đọc thêm knowledge)

```
Viết đoạn mở đầu báo cáo, tóm tắt: Nhật Chủ là gì, mức độ vượng/suy (dùng cách nói dễ hiểu, ví dụ "Nhật Chủ khá yếu, cần thêm trợ lực" thay vì chỉ nói "Nhược"), Dụng Thần là hành gì và vì sao (1 câu lý do ngắn gọn, không cần giải thích kỹ thuật đầy đủ), và nếu có Cách Cục đặc biệt/Cách Cục Tài Quan nào thành thì nhắc ngắn gọn.
Nếu findings có cờ "xungDotDieuHau: true" (Phù Ức và Điều Hậu chỉ ra 2 hướng khác nhau), PHẢI giải thích 1 câu ngắn gọn vì sao chọn hướng đã chọn (ví dụ: "Tuy sinh mùa lạnh cần thêm chút Hỏa để ấm áp, nhưng cấu trúc lá số vẫn cần Kim làm gốc trước tiên") — không in 2 kết luận trái ngược mà không giải thích.
Đây là đoạn MỞ ĐẦU cho khách chưa biết gì về Bát Tự — viết dễ hiểu, không dùng thuật ngữ mà không giải thích kèm.
```

## Prompt riêng Giai đoạn L (Kết luận — mẫu cụ thể)

```
Bạn đã nhận được TOÀN BỘ findings của Giai đoạn A đến K (đủ cả 11 giai đoạn trước). Nhiệm vụ:
1. Tóm tắt 1 đoạn ngắn: vượng suy, Dụng/Hỷ/Kỵ Thần, Cách Cục chính, 2-3 nét tính cách cốt lõi.
2. Chọn ra ĐIỂM MẠNH NHẤT và ĐIỂM CẦN LƯU Ý NHẤT trong TOÀN BỘ báo cáo (không chỉ riêng 1 mảng) — không liệt kê lại tất cả, chỉ ưu tiên hóa 1-2 điểm quan trọng nhất mỗi loại. Đây là phần thể hiện giá trị chuyên môn cao nhất, cần chọn lọc kỹ thay vì liệt kê dàn trải.
3. Đưa ra 2-3 gợi ý hành động cụ thể theo Dụng Thần + Đại Vận hiện tại (chọn khía cạnh phù hợp nhất với lá số này trong số: nghề nghiệp/tài chính/sức khỏe/quan hệ gia đình/hôn nhân — không cần đủ cả 5, ưu tiên đúng và sâu hơn đủ và nông).
Giữ đúng mọi nguyên tắc an toàn nội dung như các giai đoạn khác.
```

## Lượt kiểm duyệt riêng cho Giai đoạn F và I

Sau khi Tầng 2 viết xong đoạn văn Giai đoạn F (hoặc I), gọi THÊM 1 lệnh Claude API riêng với prompt:

```
Bạn là người kiểm duyệt nội dung nhạy cảm. Dưới đây là 1 đoạn báo cáo Bát Tự đã được viết. Nhiệm vụ của bạn KHÔNG phải xóa bớt hay pha loãng nội dung/kết luận đã có — mà CHỈ kiểm tra và chỉnh sửa CÁCH DÙNG TỪ nếu có chỗ nào còn nặng nề, gây hoang mang, hoặc lỡ dùng phải từ trong danh sách cấm sau: {{tuKhoaCamTuyetDoi}}.

Nếu đoạn văn đã ổn, trả về NGUYÊN VĂN không đổi gì.
Nếu cần sửa, chỉ sửa TỪ NGỮ của câu có vấn đề, giữ nguyên toàn bộ những câu khác và giữ nguyên Ý đang truyền tải.

Đoạn văn cần kiểm tra:
{{doanVanVuaVietXong}}
```

## Ghi chú chung khi triển khai

- Tất cả 12 lệnh gọi AI dùng chung Prompt Khung ở khung-chung.md, chỉ thay phần biến số theo bảng trên.
- **Free KHÔNG nằm trong 12 giai đoạn AI này** — Free là 1 hàm code riêng, thuần template, xem `free-template.md`, không gọi Claude API, không cần đăng nhập.
- **12 giai đoạn A-L chạy trong CÙNG 1 lượt, sau CÙNG 1 lần thanh toán** — không chia cổng thanh toán giữa các giai đoạn, không có giai đoạn nào bị khóa riêng sau khi khách đã thanh toán 1 lần.
- Với Giai đoạn K, nếu số Đại Vận nhiều (8-10 vận) khiến findings quá dài cho 1 lệnh gọi, có thể chia nhỏ theo từng cụm Đại Vận rồi ghép lại — đảm bảo Đại Vận hiện tại luôn được viết chi tiết nhất, và đảm bảo KHÔNG năm nào bị bỏ trống bởi lỗi kỹ thuật (xem checklist mục 4 ở trên).
