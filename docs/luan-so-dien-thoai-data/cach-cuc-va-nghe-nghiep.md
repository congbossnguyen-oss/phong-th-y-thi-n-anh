# Cách cục & đối chiếu nghề nghiệp (bảng tổng kết cuối bài)

Chủ dự án chốt 2026-08-17. Nguyên văn yêu cầu:

> "anh nghĩ em cần phải cho thêm mục để họ điền vào đó là nghề nghiệp. cuối bài phải có bảng tổng
> kết nói về số điện thoại này, và tập trung nhiều vào 3 số cuối là chính, các số khác là phụ trợ,
> ví dụ như là rất phù hợp hay không phù hợp với công việc hiện tại của bạn. số này là ngũ quỷ vận
> tài, hay quý nhân chiêu cảm bát phương tài, hay số này là cách cục ông chủ lớn…"

Cài trong `phone-energy-engine`: `src/data/cachCuc.ts`, `src/data/ngheNghiep.ts`, `src/engine/tongKet.ts`.

## Nguyên tắc

1. **Ba số cuối là chính, phần còn lại là phụ trợ.** Mọi cách cục đều lấy đuôi số làm điều kiện kích
   hoạt. Năng lượng chỉ nằm giữa dãy KHÔNG tự kích hoạt cách cục nào — nó chỉ đóng vai điều kiện đi
   kèm. Trong phần đối chiếu nghề, một cặp ở đuôi nặng gấp **3 lần** một cặp giữa dãy.
2. **Tên cách cục là của chủ dự án; phần diễn giải phải dẫn được nguồn.** Mỗi mục trong `CACH_CUC`
   bắt buộc có trường `canCu` trích nguyên văn câu tương ứng trong `mo-ta-8-tinh.md`. Có unit test
   chặn việc thêm cách cục mà bỏ trống căn cứ.
3. **Không đoán nghề của khách.** Khách chọn từ danh sách nhóm nghề cố định; mã lạ hoặc bỏ trống thì
   engine bỏ hẳn phần đối chiếu nghề chứ không suy luận.
4. **Đuôi số toàn 0/5** thì không tạo được cặp nào — engine nói thẳng là chưa luận được kết cục,
   không bịa cách cục.

## Bảng cách cục

| Cách cục | Loại | Điều kiện kích hoạt |
|---|---|---|
| Ngũ Quỷ vận tài | hai mặt | Ngũ Quỷ ở đuôi **và** có Thiên Y trong dãy |
| Quý nhân chiêu cảm, bát phương tài | tốt | Có cả Sinh Khí và Thiên Y, ít nhất một cái ở đuôi |
| Cách cục ông chủ lớn | tốt | Có cả Thiên Y và Diên Niên, ít nhất một cái ở đuôi |
| Sớm muộn cũng ra làm riêng | hai mặt | Tuyệt Mệnh ở đuôi |
| Thông minh, tài hoa hơn người | hai mặt | Ngũ Quỷ ở đuôi |
| Suy nghĩ không giống ai mà phá tài | cần lưu ý | Có cả Ngũ Quỷ và Tuyệt Mệnh, một trong hai ở đuôi mà **chưa được hoá giải** |
| Số thị phi, dễ phá tài vì lời nói | cần lưu ý | Họa Hại ở đuôi chưa hoá giải, hoặc có Họa Hại + Tuyệt Mệnh ở đuôi chưa hoá giải |
| Nhiều nhân duyên, tiền tài đi theo quan hệ | hai mặt | Lục Sát ở đuôi **và** có Thiên Y hoặc Sinh Khí trong dãy |
| Hảo hữu nhiều, quý nhân phù hộ | tốt | Sinh Khí ở đuôi |
| Cách cục chuyên gia, gánh vác một phương | tốt | Diên Niên ở đuôi và không có Thiên Y ở đuôi |
| Bền bỉ giữ của, nhưng chậm bứt phá | hai mặt | Đuôi chỉ có đúng một loại năng lượng là Phục Vị |

Một dãy số có thể trúng nhiều cách cục cùng lúc — đó là bình thường, engine liệt kê hết.

## Năm mặt đời sống (`src/engine/namMat.ts`)

Chủ dự án bổ sung 2026-08-17: phần kết luận phải chốt rõ theo **quan vận, tài vận, sức khoẻ, nhân
duyên, may mắn**. Mỗi tinh được xếp vào cột "đẩy lên" hay "kéo xuống" của một mặt đều trích được từ
`mo-ta-8-tinh.md` hoặc cột chủ đề của bảng tra — trường `canCu` giữ nguyên văn, có unit test chặn
việc thêm mặt mà bỏ trống căn cứ.

| Mặt | Đẩy lên | Kéo xuống |
|---|---|---|
| Tài vận | Thiên Y (1), Diên Niên (0.5) | Tuyệt Mệnh (1), Ngũ Quỷ (0.5), Họa Hại (0.5) |
| Quan vận | Diên Niên (1), Thiên Y (0.5) | Ngũ Quỷ (1), Họa Hại (0.5), Phục Vị (0.5) |
| Nhân duyên | Thiên Y (1), Sinh Khí (1) | Lục Sát (1), Ngũ Quỷ (0.5), Họa Hại (0.5), Tuyệt Mệnh (0.5) |
| Sức khoẻ | Diên Niên (1), Sinh Khí (0.5) | Tuyệt Mệnh (1), Ngũ Quỷ (1), Họa Hại (0.5), Lục Sát (0.5) |
| May mắn, quý nhân | Sinh Khí (1), Thiên Y (1) | Ngũ Quỷ (1), Họa Hại (1), Lục Sát (0.5), Tuyệt Mệnh (0.5), **Diên Niên (0.5)** |

> **Không xếp theo lối "cát tinh thì tốt mọi mặt".** Bằng chứng: Diên Niên là cát tinh, rất mạnh cho
> quan vận và sức khoẻ, nhưng lại nằm ở cột **kéo xuống** của mặt may mắn — vì tài liệu ghi rõ
> *"Tự thân đi làm, ít vận quý nhân — mọi thứ dựa vào chính mình"*. Phục Vị cũng vậy: trung tính với
> hầu hết các mặt nhưng kéo quan vận xuống vì *"dễ bỏ lỡ cơ hội tốt vì quá bảo thủ"*.

Cách tính: mỗi cặp góp `hệ số cột × hệ số cấp độ × (ở đuôi ? 3 : 1)`, chuẩn hoá về thang −100..100.
Tinh **trung lập** với một mặt (không nằm ở cả hai cột) thì không được kéo vào mẫu số. Bốn mức:
≥50 rất tốt · ≥15 tốt · ≥−15 trung bình · còn lại cần lưu ý.

## Bảng nhóm nghề

Ánh xạ đều lấy từ mục **Sự nghiệp / Tài vận / Quý nhân** của `mo-ta-8-tinh.md`.

| Nhóm nghề | Năng lượng hợp | Năng lượng cản |
|---|---|---|
| Kinh doanh, buôn bán, thương mại | Ngũ Quỷ, Thiên Y | Phục Vị |
| Lãnh đạo, quản lý | Diên Niên, Thiên Y | Lục Sát, Phục Vị |
| Kỹ thuật, chuyên môn sâu | Diên Niên, Phục Vị | Ngũ Quỷ |
| Công chức, viên chức, đơn vị sự nghiệp | Phục Vị, Diên Niên | Ngũ Quỷ, Tuyệt Mệnh |
| Tự kinh doanh, khởi nghiệp, làm chủ | Tuyệt Mệnh, Thiên Y, Diên Niên | Phục Vị |
| Đầu tư, tài chính, chứng khoán, bất động sản | Tuyệt Mệnh, Thiên Y | Phục Vị |
| Nghề dùng lời nói (bán hàng, MC, giảng dạy, luật) | Họa Hại, Thiên Y | Phục Vị |
| Quan hệ xã hội, PR, ngoại giao, dịch vụ | Sinh Khí, Lục Sát | Diên Niên |
| Sáng tạo, nghệ thuật, thiết kế, nội dung | Ngũ Quỷ, Lục Sát | Diên Niên |
| Tâm linh, mệnh lý, tôn giáo | Thiên Y, Ngũ Quỷ | — |
| Y tế, chăm sóc, giáo dục | Thiên Y, Sinh Khí | Họa Hại |
| Ngành khác / chưa đi làm | *(cố ý bỏ trống — không luận)* | |

Bốn mức kết luận: **rất phù hợp** (điểm ≥ 3, tức có ít nhất một năng lượng hợp nằm ở đuôi) →
**phù hợp** (điểm > 0) → **tạm được** (điểm = 0) → **chưa phù hợp** (điểm < 0).

> ⚠️ Thang điểm đối chiếu nghề là quy ước riêng của Phong Thủy Thiên Anh để chọn một trong bốn câu
> kết luận, KHÔNG có trong tài liệu Bát Cực Linh Số và không hiển thị con số ra ngoài.
