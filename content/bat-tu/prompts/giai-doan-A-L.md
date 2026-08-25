# Chi Tiết Prompt Riêng Từng Giai Đoạn (A → L)

Mỗi mục dưới đây điền vào phần `{{noiDungKnowledgeMd}}`, `{{quyTacRiengGiaiDoan}}`, `{{doDaiGoiY}}` của prompt khung chung (`khung-chung.md`). Tên file trong cột "Knowledge" nằm trong `content/bat-tu/knowledge/`.

| GĐ | Tầng | Tên | Knowledge (.md đọc vào prompt) | Độ dài gợi ý | quyTacRiengGiaiDoan |
|---|---|---|---|---|---|
| A | Cơ Bản | Nền tảng | (không cần — dùng thẳng laSoJSON đã có kết luận từ bat-tu-engine) | 150-200 chữ | (để trống) |
| B | Cơ Bản | Tính cách | tinh-cach-nhat-nguyen.md, tuong-y-can-chi.md | 250-350 chữ | (để trống) |
| C | Cơ Bản | Thập Thần theo cung | thap-than.md | 200-300 chữ | (để trống) |
| G | Cơ Bản | Nghề nghiệp/Tài/Quan/Công Danh | dung-than.md, tai-van.md, quan-van.md, cong-danh.md (chỉ đọc cong-danh.md nếu khách hỏi học vấn/danh tiếng) | 400-500 chữ | (để trống) |
| H | Cơ Bản | Hôn Nhân | hon-nhan.md | 300-450 chữ | (để trống, nhưng vẫn áp tu_khoa_cam_tuyet_doi như mọi giai đoạn) |
| J | Cơ Bản | Ngũ Hành thực hành | (không cần — dùng thẳng dung-than-nghe-nghiep-phuong-huong.json) | 100-150 chữ | (để trống) |
| L | Cơ Bản | Kết luận | (không cần file riêng — AI tự tổng hợp từ findings A,B,C,G,H,J — KHÔNG dùng D,E,F,I,K) | 200-300 chữ | (để trống) |
| D | Nâng Cao | Thần Sát | than-sat.md | 200-350 chữ (tùy số sao có mặt) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_D_than_sat |
| E | Nâng Cao | Mộ Khố | mo-kho.md | 100-150 chữ (bỏ qua nếu không có Mộ Khố nào) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_E_mo_kho |
| F | Nâng Cao | Lục Thân | luc-than.md | 400-600 chữ (4 mục: cha mẹ/anh chị em/vợ chồng/con cái) | content-safety-full.json -> quy_tac_theo_giai_doan.giai_doan_F_luc_than (TOÀN BỘ object) — CÓ THÊM LƯỢT KIỂM DUYỆT RIÊNG |
| I | Nâng Cao | Sức khỏe | benh-tat.md | 250-350 chữ | Toàn bộ nguyên tắc đạo đức cuối benh-tat.md — CÓ THÊM LƯỢT KIỂM DUYỆT RIÊNG |
| K | Nâng Cao | Đại Vận trọn đời | ung-ky.md, quan-he-can-chi.md mục Tầng Thứ | 500-800 chữ (dài nhất) | (để trống) |

**Lưu ý quan trọng về ranh giới 2 tầng**: các giai đoạn Cơ Bản (A,B,C,G,H,J,L) TUYỆT ĐỐI không được nhắc/dựa vào nội dung của D,E,F,I,K khi viết — vì khách có thể chưa mua Nâng Cao. Ngược lại, khi khách ĐÃ mua cả 2 tầng, các giai đoạn Nâng Cao (D,E,F,I,K) CÓ THỂ tham chiếu nhẹ tới findings của Cơ Bản đã có (ví dụ Giai đoạn K khi luận Đại Vận có thể nhắc lại Dụng Thần đã nêu ở Giai đoạn A) vì lúc đó dữ liệu Cơ Bản chắc chắn đã tồn tại.

## Prompt riêng Giai đoạn A (mẫu cụ thể, khác cấu trúc chuẩn vì không cần đọc thêm knowledge)

```
Viết đoạn mở đầu báo cáo, tóm tắt: Nhật Chủ là gì, mức độ vượng/suy (dùng cách nói dễ hiểu, ví dụ "Nhật Chủ khá yếu, cần thêm trợ lực" thay vì chỉ nói "Nhược"), Dụng Thần là hành gì và vì sao (1 câu lý do ngắn gọn, không cần giải thích kỹ thuật đầy đủ), và nếu có Cách Cục đặc biệt/Cách Cục Tài Quan nào thành thì nhắc ngắn gọn.
Đây là đoạn MỞ ĐẦU cho khách chưa biết gì về Bát Tự — viết dễ hiểu, không dùng thuật ngữ mà không giải thích kèm.
```

## Prompt riêng Giai đoạn L (Kết luận — mẫu cụ thể)

```
Bạn đã nhận được findings của các Giai đoạn thuộc bản LUẬN CƠ BẢN: A, B, C, G, H, J (KHÔNG có D, E, F, I, K — vì đó thuộc bản Nâng Cao, khách có thể chưa mua). Nhiệm vụ:
1. Tóm tắt 1 đoạn ngắn: vượng suy, Dụng/Hỷ/Kỵ Thần, Cách Cục chính, 2-3 nét tính cách cốt lõi.
2. Chọn ra ĐIỂM MẠNH NHẤT và ĐIỂM CẦN LƯU Ý NHẤT trong PHẠM VI đã luận (tính cách/Thập Thần/nghề nghiệp-tài-quan/hôn nhân) — không liệt kê lại tất cả, chỉ ưu tiên hóa 1-2 điểm quan trọng nhất mỗi loại.
3. Đưa ra 2-3 gợi ý hành động cụ thể theo Dụng Thần (nghề nghiệp/tài chính/quan hệ — KHÔNG nói về sức khỏe hay lục thân chi tiết vì thuộc phạm vi bản Nâng Cao).
4. Kết đoạn bằng 1-2 câu mời gọi tự nhiên (không sale sống sượng) về việc bản Nâng Cao sẽ đi sâu hơn vào Thần Sát, gia đình - lục thân, sức khỏe, và trọn vẹn vận trình từ nhỏ đến già — chỉ nêu đây là lựa chọn thêm nếu khách muốn hiểu sâu hơn, không tạo cảm giác bản Cơ Bản là "thiếu" hay "cắt xén".
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
- **Free KHÔNG nằm trong 12 giai đoạn AI này** — Free là 1 hàm code riêng, thuần template, xem `free-template.md`, không gọi Claude API. Cả 12 giai đoạn A-L ở bảng trên (kể cả A và B) CHỈ chạy khi khách đã vào luồng Trả phí — không có sự trùng lặp/dùng chung kết quả giữa Free và Trả phí, vì bản chất 2 thứ khác nhau (template cố định vs AI viết tự do).
- Với Giai đoạn K, nếu số Đại Vận nhiều (8-10 vận) khiến findings quá dài cho 1 lệnh gọi, có thể chia nhỏ theo từng cụm Đại Vận rồi ghép lại — đảm bảo Đại Vận hiện tại luôn được viết chi tiết nhất.
