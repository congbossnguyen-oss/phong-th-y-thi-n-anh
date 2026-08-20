---
name: luan-giai-bat-tu-manh-phai
description: Dùng skill này khi Công muốn luận 1 lá số Bát Tự theo trường phái Manh Phái (không phải Tử Bình) — kích hoạt khi Công nói rõ "luận theo Manh Phái", hoặc hỏi về "Thể Dụng", "Khách Chủ", "Tố Công", "Đảng Thế", "Chính cục Phản cục", "Công thần Tặc thần", "cấu trúc chế dụng/hóa dụng/hợp dụng", lá số "tạo công" thế nào, có phải "đại nhân vật" không, hoặc muốn tư vấn định hướng nghề nghiệp theo Manh Phái. Nếu Công chỉ nói chung chung "luận giúp tôi lá số này" không chỉ định trường phái, hỏi Công muốn Tử Bình (skill `luan-giai-bat-tu`) hay Manh Phái (skill này) trước — 2 trường phái dùng khung khác nhau, không trộn lẫn. Skill chứa phương pháp riêng (Thể-Dụng, Khách-Chủ, Tố Công, Đảng-Thế, Chính Cục/Phản Cục, Công/Tặc Thần, 5 cấu trúc tố công kèm án lệ thực tế, Hiệu suất tố công, định hướng nghề nghiệp) đúc kết từ "Manh Phái Sơ Cấp", không có sẵn trong kiến thức nền Claude.
---

# Luận Giải Bát Tự theo Manh Phái

Skill này luận 1 lá số Bát Tự theo phương pháp **Manh Phái** (盲派) — một trường phái khác về triết lý cốt lõi so với Tử Bình truyền thống (skill `luan-giai-bat-tu`).

## Khác biệt triết lý — đọc trước khi luận

- **Tử Bình**: lấy sự **CÂN BẰNG** ngũ hành làm chuẩn — luận qua Dụng Thần (Phù Ức/Thông Quan/Điều Hậu/Thuận Thế).
- **Manh Phái**: lấy sự **THIÊN LỆCH có kiểm soát** làm chuẩn — luận qua Thể-Dụng, tìm Tố Công (Thập Thần nào đang thực sự "làm việc" để đạt Tài/Quan), và đánh giá cấu trúc đó có "tạo công" trọn vẹn hay không.
- **Không trộn lẫn 2 khung trong cùng 1 lượt luận** — nếu Công muốn so sánh cả 2 cách nhìn cho cùng 1 lá số, luận riêng từng phần rõ ràng, ghi chú rõ đang dùng khung nào ở mỗi phần.
- Cùng 1 hiện tượng lá số có thể được 2 trường phái gọi tên khác nhau (ví dụ: "Đảng-Thế + chế tận" bên Manh Phái ≈ "Tòng Cách" bên Tử Bình) — có thể chú thích cả 2 tên nếu Công quen thuộc với Tử Bình, nhưng không được dùng để thay thế quy trình luận của bên kia.

## Quan hệ với skill `luan-giai-bat-tu` (Tử Bình)

Một số kiến thức nền dùng chung cho cả 2 trường phái (đã có đầy đủ bên skill Tử Bình, không lặp lại ở đây):
- **Lập Tứ Trụ, Cung Mệnh, Thai Nguyên, Đại Vận, Tiểu Vận** → `luan-giai-bat-tu/references/lap-tu-tru.md`
- **4 điều kiện Được Lệnh/Đắc Địa/Được Sinh/Được Trợ Giúp** để đánh giá vượng suy → `luan-giai-bat-tu/references/vuong-suy.md`
- **Hàm nghĩa cơ bản 10 Thập Thần** (tính cách, lục thân, hành vi) → `luan-giai-bat-tu/references/thap-than.md` — skill này chỉ bổ sung thêm mục "Tượng" ở `references/tuong-thap-than.md`
- **Bảng tra Thần Sát** (Thiên Ất, Đào Hoa, Không Vong...) → `luan-giai-bat-tu/references/than-sat.md` — nội dung trùng khớp, dùng trực tiếp
- **Mộ Khố cơ bản** (Mộ/Khố, nhập mộ/xuất mộ/xung mộ) → `luan-giai-bat-tu/references/mo-kho.md`
- **Quan hệ Can Chi cơ bản** (hợp/xung/hình/hại/phá) → `luan-giai-bat-tu/references/quan-he-can-chi.md` — skill này có bản mở rộng ở `references/hop-hoa-mo-rong.md`

Nếu skill `luan-giai-bat-tu` chưa được cài, dùng hiểu biết nền về các mục trên một cách thận trọng và nói rõ đang thiếu tài liệu chi tiết cho phần đó.

## Engine tính toán khách quan — `scripts/engine.py`

Ngay khi có đủ Tứ Trụ (Bước 0-1), **luôn chạy script này trước** bằng bash để lấy dữ liệu nền, thay vì tự tính tay Thập Thần/Trường Sinh/quan hệ Can Chi:

```
python3 scripts/engine.py --nam "Mậu Thìn" --thang "Nhâm Tuất" --ngay "Đinh Sửu" --gio "Đinh Mùi" [--dai-van "Kỷ Tị"] [--luu-nien "Mậu Dần"] [--gioi-tinh Nam]
```

Script trả về JSON gồm: Thập Thần từng Can lộ + Can tàng, trạng thái Trường Sinh, toàn bộ quan hệ Hợp/Xung/Hình/Hại/Phá/Tam Hợp/Tam Hội/Ám Hợp/Thiên Can Ngũ Hợp kèm hiệu suất tra sẵn, danh sách Mộ Khố, tally Thể/Dụng theo trong nhà/ngoài nhà, và ứng viên "xuất xứ" cho từng Thiên Can.

**Ranh giới rõ ràng — script CHỈ tính, KHÔNG phán đoán**: script không tự kết luận Tố Công nào là chính, 1 quan hệ Hợp có thật sự Hóa hay không, Đảng/Thế có "tạo công" hay không, cấu trúc nào trong 5 loại, Chính/Phản Cục, hay bất kỳ kết luận nghề nghiệp/phú quý nào — toàn bộ phần này vẫn do Claude phán đoán ở Bước 3-10 dưới đây, dựa trên dữ liệu JSON làm căn cứ và các references để định hướng cách đọc. Đã kiểm chứng script khớp 100% với 2 lá số mẫu có đáp án sẵn trong tài liệu gốc (Chu Nguyên Chương; Mậu Tý/Ất Mão/Canh Tý/Kỷ Mão).

## Bước 0 — Kiểm tra input (giống skill Tử Bình)

Cần: ngày giờ sinh đầy đủ (hoặc lá số đã lập sẵn) + giới tính + câu hỏi cụ thể (tài vận/quan vận/hôn nhân/sức khỏe/định hướng nghề nghiệp/đánh giá tổng thể "tầng" của mệnh cục). Thiếu thì hỏi lại, không tự bịa.

## Bước 1 — Lập Tứ Trụ, xác định Nhật Chủ

Dùng `luan-giai-bat-tu/references/lap-tu-tru.md`. Ngay sau khi có đủ Tứ Trụ, chạy `scripts/engine.py` (xem trên) để lấy dữ liệu nền cho các bước sau — không tự tính tay khi đã có script.

## Bước 2 — Xác định Thể vượng/nhược

Dùng `luan-giai-bat-tu/references/vuong-suy.md` (4 điều kiện) để xác định vượng suy Nhật Chủ, nhưng gọi kết quả là **"Thể vượng"** hay **"Thể nhược"** (thuật ngữ Manh Phái) thay vì chỉ dùng suông thuật ngữ Tử Bình — vì bước này dẫn thẳng vào khẩu quyết Thể-Dụng ở Bước 3.

**Không dừng lại để chọn Dụng Thần Phù Ức như Tử Bình** — chuyển thẳng sang Bước 3.

## Bước 3 — Xác định Thể - Dụng, Khách - Chủ

Đọc `references/the-dung-khach-chu.md`.

- Phân Thập Thần thành 2 nhóm: Thể (Ấn, Tỷ Kiếp, Thực Thương) và Dụng (Tài, Quan Sát) — lưu ý Thực Thương có thể đóng vai trò kép.
- Áp khẩu quyết: Thể vượng → Tài Quan đến nhận được; Thể nhược → Tài Quan đến là họa.
- Xác định khung Khách-Chủ phù hợp với câu hỏi cụ thể của Công (bản thân / vợ chồng / trong nhà / cả đời qua Đại Vận).
- Xác định "Trong nhà" (Ngày+Giờ) vs "Ngoài nhà" (Năm+Tháng).

## Bước 4 — Tìm Tố Công

Đọc `references/to-cong.md`.

- Kiểm tra "trong nhà" có Thể hay không.
- Xác định theo 1 trong 2 kiểu: Nhật Chủ tự hợp Tài/Quan, hoặc Nhật Chủ được Ấn sinh/sinh Thực Thương (theo thứ tự ưu tiên Nhật Can → Nhật Chi → Giờ Can → Giờ Chi).
- Kiểm tra "xuất xứ" cho các Can/Chi "ngoài nhà" có khả năng liên hệ "trong nhà".
- Xác định Chính hướng hay Phản hướng Tố Công.
- Nếu không tìm được Tố Công rõ ràng, nói thẳng "mệnh này không có tố công rõ ràng cho vấn đề Tài Quan" thay vì gán ép.

## Bước 5 — Xác định Đảng - Thế (nếu mệnh cục thiên lệch rõ rệt)

Đọc `references/dang-the.md`. Chỉ áp dụng bước này khi mệnh cục có 1-2 hành áp đảo rõ rệt (nếu tương đối cân bằng, bỏ qua bước này, dùng thẳng Tố Công ở Bước 4).

- Xác định có "Thế" (1 hành) hay "Đảng" (≥2 hành kết hợp, có ít nhất 1 đang là Thế) hay không.
- Xác định Thế/Đảng đó có "tạo công" hay không (đang khắc chế được hành cụ thể nào).
- Đối chiếu 3 điều kiện "nhân vật quan trọng": Thế có lực lớn + Thế có tạo công + khắc chế hoàn toàn (chế tận).

## Bước 6 — Phân loại Cấu Trúc Tố Công + Chính Cục/Phản Cục + Công-Tặc-Trợ-Phế Thần

Đọc `references/cau-truc-to-cong.md` (nay đã có án lệ minh họa đầy đủ cho cả 5 cấu trúc) và `references/chinh-cuc-phan-cuc.md`.

- Xếp Tố Công đã tìm vào 1 trong 5 cấu trúc: Chế Dụng / Hóa Dụng / Sinh Dụng / Hợp Dụng / Chế Mộ Khố (có thể là cấu trúc phức hợp).
- Nếu là Chế Dụng, xếp theo thứ bậc phú quý: Chế Quan Sát > Chế Ấn > Chế Tỷ Kiếp > Chế Thực Thương > Chế Tài.
- Phân loại toàn bộ Thập Thần còn lại thành Công Thần / Tặc Thần / Trợ Thần / Phế Thần.
- Xác định nguyên cục là Chính Cục hay Phản Cục (mong muốn Nhật Chủ có khớp xu hướng tự nhiên hay không).
- **Cảnh báo quan trọng rút ra từ án lệ**: cùng 1 dạng cấu trúc (ví dụ "Ấn chế Thực Thương") có thể cho kết quả trái ngược hoàn toàn tùy vai trò cụ thể của Thập Thần trong lá số — luôn kiểm tra lại vai trò Thể/Dụng thực tế, không suy luận máy móc theo tên gọi.
- **Bắt buộc nhắc**: kết luận "phú quý/đại nhân vật" ở bước này chỉ nói về sự nghiệp/tiền bạc — KHÔNG suy ra sức khỏe/hạnh phúc/gia đình.

## Bước 7 — Tính Hiệu Suất Tố Công

Đọc `references/cau-truc-to-cong.md` mục 9. Dùng bảng Hiệu Suất Hợp Chế hoặc Hiệu Suất Hình Xung Xuyên Chế tùy cơ chế Tố Công đang dùng, để đánh giá MỨC ĐỘ (không chỉ có/không) của Danh và Tài.

## Bước 8 — (Nếu Công hỏi về nghề nghiệp) Định hướng nghề nghiệp theo Tố Công

Đọc `references/dinh-huong-nghe-nghiep.md`. Tra nhóm nghề theo Tố Công đã xác định ở Bước 4/6, kiểm tra đủ điều kiện đi kèm (Thân vượng/nhược phù hợp loại Tố Công, vai trò Thập Thần cụ thể, mộ khố trong/ngoài nhà nếu có), rồi dùng "Tượng" (`references/tuong-thap-than.md`) để thu hẹp xuống nghề cụ thể. Luôn đối chiếu Đại Vận hiện tại/sắp tới để biết giai đoạn nào thuận lợi theo đuổi hướng nghề đã gợi ý.

## Bước 9 — Luận Đại Vận & Lưu Niên

Đọc `references/hop-hoa-mo-rong.md` mục 1 (lực lượng thay đổi theo Tuế Vận) trước.

- Với mỗi Đại Vận: xác định Can Chi đó tăng lực cho Công Thần/Trợ Thần (→ giai đoạn Chính Cục, cát) hay cho Tặc Thần (→ giai đoạn Phản Cục, hung).
- Kiểm tra Tuế Vận có kích hoạt thêm hoặc phá vỡ Tam Hợp/Tam Hội cục nào trong nguyên cục hay không — đây thường là điểm ngoặt lớn nhất.
- Nếu Đại Vận "song thể" (Can/Chi thuộc 2 nhóm khác nhau), cần xét thêm Lưu Niên cụ thể để xác định chính xác Chính/Phản Cục tại từng năm.
- Tham khảo thêm `luan-giai-bat-tu/references/than-sat.md` và `luan-giai-bat-tu/references/ung-ky.md` (skill Tử Bình) nếu cần xác định thời điểm ứng nghiệm cụ thể — cơ chế Tầng Thứ Tuế Vận dùng chung cho cả 2 trường phái.

## Bước 10 — Kết luận

- Tóm tắt: Thể vượng/nhược, Tố Công chính, cấu trúc (1 trong 5 loại), Chính/Phản Cục, Hiệu Suất Tố Công, giai đoạn Đại Vận thuận/nghịch, (nếu có hỏi) gợi ý nghề nghiệp.
- Nếu câu hỏi liên quan tính cách/sự việc cụ thể, bổ sung bằng `references/tuong-thap-than.md`.
- **Luôn nhắc lại cảnh báo đạo đức**: kết luận về "tầng" phú quý (đại nhân vật/phú quý/trung lưu/bình thường) chỉ phản ánh khía cạnh sự nghiệp-tài chính, không phản ánh hạnh phúc cá nhân — nếu Công hỏi về hôn nhân/sức khỏe/gia đình, luận riêng bằng Thập Thần lục thân + Thần Sát, không suy diễn từ mức độ phú quý.
- Nếu có phần nào không đủ căn cứ từ tài liệu (ví dụ 4 cặp Thiên Can hợp hóa ngoài Giáp-Kỷ thiếu chi tiết, hoặc hiệu suất của 1 tổ hợp Địa Chi không có trong bảng), liệt kê rõ ở cuối phần kết luận.

## Ghi chú vận hành

- Khi Công đưa 1 lá số mà không chỉ định trường phái, và ngữ cảnh trước đó trong hội thoại không cho biết rõ, hỏi 1 câu ngắn để xác nhận Tử Bình hay Manh Phái trước khi luận — 2 khung có thể ra kết luận khác nhau về cùng 1 lá số.
- Có thể tham chiếu tên file references khi luận (ví dụ "theo `to-cong.md`, đây là Chính hướng Tố Công") để Công tiện kiểm tra lại.
