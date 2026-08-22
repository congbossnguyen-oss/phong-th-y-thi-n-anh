# UI DESIGN SYSTEM — Quân Sư Thiên Anh (Phase 1)

## 1. Định vị phong cách

**Modern Mystical · Oriental · Premium · Spiritual · Elegant.**

Đây là lớp sản phẩm cao cấp hơn các công cụ Đại Cát Lợi hiện tại (đang phục vụ số đông, phong cách phổ thông dễ tiếp cận). Quân Sư Thiên Anh cần cảm giác: huyền bí, sâu, sang, tâm linh, trí tuệ, hiện đại.

**Tuyệt đối tránh:**
- Đỏ/vàng chóe kiểu app tử vi giá rẻ
- Rồng phượng cliché
- Giao diện Trung Hoa cổ điển nặng nề (hoa văn dày đặc, viền cầu kỳ)

## 2. Bảng màu

| Token | Vai trò | Gợi ý mã màu |
|---|---|---|
| `--qs-midnight` | Nền chính (dark base) | `#0B1120` |
| `--qs-navy-deep` | Nền phụ / card nổi trên midnight | `#111A2E` |
| `--qs-charcoal` | Nền trung tính, chữ trên nền sáng | `#2A2A2E` |
| `--qs-mystical-purple` | Điểm nhấn chính, trạng thái active/tương tác | `#6B4E9E` |
| `--qs-antique-gold` | Điểm nhấn cao cấp, CTA quan trọng, đường viền nhấn | `#C9A15A` |
| `--qs-ivory` | Chữ chính trên nền tối, nền sáng thay thế | `#F4EFE6` |

**Quy tắc dùng:**
- Nền mặc định: `--qs-midnight`/`--qs-navy-deep` (dark-first — hợp cảm giác "sâu, huyền bí").
- `--qs-antique-gold` CHỈ dùng cho điểm nhấn (nút hành động chính, số điểm quan trọng, viền mảnh) — không tô nền lớn bằng vàng (tránh cảm giác "vàng chóe" đề bài cấm).
- `--qs-mystical-purple` dùng cho trạng thái tương tác (hover, selected, progress) — không phải màu chủ đạo bao trùm.
- Tỷ lệ gợi ý: nền tối 70%, ivory/text 20%, gold+purple nhấn 10%.
- Chế độ sáng (nếu cần desktop/light mode): đảo vai trò — nền `--qs-ivory`, chữ `--qs-charcoal`, viền/nhấn vẫn dùng gold+purple với độ đậm giảm nhẹ.

## 3. Typography

- **Heading/display:** một font serif có nét thanh mảnh, gợi cảm giác thư pháp hiện đại (không phải font "Tàu" cliché) — ví dụ hướng `Noto Serif`/`Playfair Display`-style, phải hỗ trợ đầy đủ dấu tiếng Việt.
- **Body:** sans-serif nhân văn, dễ đọc trên di động — ví dụ hướng `Inter`/`Be Vietnam Pro` (đã có tiền lệ hỗ trợ tiếng Việt tốt).
- **Cỡ chữ tối thiểu trên mobile:** 16px cho body (tránh zoom tự động của iOS), heading câu hỏi tối thiểu 20px.
- Không dùng chữ trang trí khó đọc cho nội dung luận giải dài — luận giải Kinh Dịch cần đọc thoải mái, ưu tiên dễ đọc hơn "đẹp mắt nhưng khó đọc".

## 4. Ánh sáng / glow — "vừa phải"

- Glow chỉ dùng cho: biểu tượng quẻ Kinh Dịch khi hiện kết quả, nút CTA chính khi có tương tác, đường viền card kết luận.
- Cường độ: mờ, bán kính lớn, opacity thấp (gợi ý `box-shadow` blur ≥ 40px, opacity ≤ 0.25) — cảm giác "phát sáng nhẹ trong bóng tối", không phải neon rực.
- Không dùng glow cho toàn bộ nền hoặc mọi nút — chỉ 1-2 điểm nhấn mỗi màn hình.

## 5. Component chính (mô tả chức năng, chưa phải spec pixel)

| Component | Mô tả |
|---|---|
| **Question Library Grid** | Lưới thẻ 18 nhóm vấn đề, mobile: 2 cột; icon tối giản (đường nét mảnh, không icon phẳng màu sặc sỡ); chạm vào mở nhóm → danh sách câu hỏi con |
| **Question Flow Stepper** | Luồng từng bước thu thập `required_inputs`, thanh tiến trình mảnh (không dùng progress bar dày kiểu app phổ thông), 1 câu hỏi/màn hình trên mobile |
| **Divination Capture (gieo quẻ)** | Tái dùng trải nghiệm hiện có ở `gieo-que-kinh-dich.astro`, nâng cấp phong cách theo bảng màu mới — giữ nguyên cơ chế gieo (không đổi logic) |
| **Hexagram Result Card** | Hiển thị quẻ bằng ký hiệu hào (nét liền/đứt) tối giản, không dùng hình vẽ minh họa rồng/bát quái sặc sỡ |
| **Sơ Đồ Vận Trình** (Bát Tự/Tử Vi) | Biểu đồ timeline ngang, mỗi đoạn là 1 giai đoạn đại vận, tô màu theo tốt/bình thường/xấu (vd xanh ngọc nhạt/trung tính/đỏ đất trầm — không dùng đỏ/xanh chói); đánh dấu rõ vị trí "hiện tại" trên timeline. CHỈ hiển thị biểu đồ + nhãn ngắn, không kèm đoạn văn luận giải dài — đúng vai trò "chỉ đưa sơ đồ, không bàn nhiều" (xem `ENGINE_INTEGRATION.md` §3-4) |
| **Bài Luận Kết Quả** (mo_bai/than_bai/ket_luan) | Đọc như 1 bài viết, không phải bảng dữ liệu — Mở bài ngắn nổi bật ở đầu (nền `--qs-navy-deep`, viền mảnh `--qs-antique-gold`), Thân bài trình bày dạng đoạn văn dễ đọc (không bullet dày đặc), Kết luận tách thành khối riêng cuối trang có câu trả lời + khuyến nghị hành động + thời điểm đề xuất (nếu có) nổi bật hơn phần còn lại |
| **Khối Lưu Ý** | Danh sách lưu ý/cảnh báo an toàn (`ket_luan.luu_y`), hiển thị nhẹ nhàng không gây hoang mang — icon trung tính, không dùng màu đỏ cảnh báo gắt |
| **Safety Notice** | Dòng chú thích nhỏ, luôn hiện khi `safety_rules` có nội dung (vd "không thay thế tư vấn pháp lý") — không được ẩn/thu nhỏ quá mức |

## 6. Mobile-first & responsive

- **Ưu tiên tuyệt đối:** thiết kế cho màn hình điện thoại trước, desktop là mở rộng, không phải ngược lại.
- Breakpoint gợi ý (khớp Tailwind mặc định đang dùng trong app): `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`.
- Trên `lg`+ trở lên: Question Library có thể chuyển sang layout 2 cột (danh sách nhóm bên trái, chi tiết bên phải) — nhưng luồng hỏi-đáp (Question Flow) vẫn giữ dạng 1 bước/màn hình ngay cả trên desktop, để nhất quán trải nghiệm cốt lõi.
- Test tối thiểu: iPhone (Safari), Android Chrome, iPad, desktop Chrome — khớp yêu cầu đề bài.

## 7. Quan hệ với design token hiện có của app

App hiện dùng Tailwind v4. Đề xuất: tạo namespace token riêng cho Quân Sư (`--qs-*` như trên) thay vì ghi đè token toàn app — vì Quân Sư có định vị thẩm mỹ khác các trang Đại Cát Lợi hiện có (đại chúng hơn). Đây là **quyết định cần Thầy xác nhận** trước Phase 2: có muốn Quân Sư dùng hẳn 1 "sub-brand" thị giác riêng biệt trong cùng 1 app, hay thống nhất luôn theme mới này cho toàn bộ site? Tài liệu này giả định phương án 1 (sub-brand riêng, ít rủi ro hơn, không ảnh hưởng trang hiện có).
