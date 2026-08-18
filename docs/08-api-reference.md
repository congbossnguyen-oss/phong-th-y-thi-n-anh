# API Reference

> Tất cả route dưới `src/pages/api/` khai báo `export const prerender = false` (chạy SSR theo yêu cầu, không được build tĩnh). Session được gắn vào `context.locals.user` bởi `src/middleware.ts` trước khi tới handler — xem [[02-module-tai-khoan]].

## Auth

### `POST /api/auth/register`
Tạo tài khoản học viên mới, tự động đăng nhập sau khi tạo.

- **Body**: `{ name, email, password }` (`password` ≥ 6 ký tự)
- **Lỗi**: email trùng → từ chối
- **Response**: set cookie `thien_anh_session` + `{ok, user}`
- Xem [[02-module-tai-khoan]] §3

### `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Hiệu ứng phụ**: xóa mọi session cũ của user (single-device), tạo session mới gắn IP hiện tại
- **Response**: set cookie + `{ok, user: {name, email}}`
- Xem [[02-module-tai-khoan]] §4–5

### `POST /api/auth/logout`
Vô hiệu session hiện tại, xóa cookie. Không cần body.

### `GET /api/auth/me`
Trả `{user}` (từ `locals.user`) hoặc `{user: null}`. Dùng cho UI kiểm tra trạng thái đăng nhập phía client.

## Đơn hàng (Cửa hàng)

### `POST /api/orders/create`
Tạo đơn hàng sản phẩm (hỗ trợ khách vãng lai, không bắt buộc đăng nhập).

- **Body**: `{ name, phone, email, address, note, paymentMethod: "cod" | "sepay_qr", lines: [{slug, qty}] }`
- **Xử lý server**: giá được resolve lại từ Sanity theo `slug`, không tin giá client gửi (xem [[03-module-cua-hang]])
- **Response** (`sepay_qr`): `{ok, orderId, orderCode, totalAmount, qrUrl}`
- **Response** (`cod`): đơn tạo với `status = pending_payment`, xác nhận thủ công sau

### `GET /api/orders/[id]/status`
Tra cứu công khai trạng thái đơn theo UUID (UUID đóng vai trò "token" khó đoán cho khách vãng lai).

- **Response**: `{ok, status, orderType, orderCode, courseRef}`

## Khóa học

### `POST /api/courses/checkout`
**Yêu cầu đăng nhập.** Tạo đơn mua khóa học (tái sử dụng đơn `pending_payment` cũ nếu đã tồn tại cho cùng khóa).

- **Body**: `{ courseSlug, phone }`
- **Response**: `{ok, orderId, orderCode, totalAmount, qrUrl}`
- Xem [[04-module-khoa-hoc]] §2

### `POST /api/courses/progress`
**Yêu cầu đăng nhập + đã ghi danh khóa học.** Đánh dấu 1 bài học hoàn thành (idempotent), tự động cấp chứng chỉ nếu đủ điều kiện.

- **Body**: `{ courseRef, lessonRef }`
- **Response**: `{ok, certificateIssued: boolean}`
- Xem [[04-module-khoa-hoc]] §5–6

## Chứng chỉ

### `GET /api/certificates/[courseRef].pdf`
Sinh lại PDF chứng chỉ on-the-fly (không lưu file tĩnh), stream `Content-Type: application/pdf`.

| Điều kiện | Response |
|---|---|
| Chưa đăng nhập | 401 |
| Không tìm thấy khóa học | 404 |
| Chưa đủ điều kiện (chưa hoàn thành khóa) | 403 |
| Hợp lệ | 200, body = PDF binary |

## Thanh toán (SePay)

### `POST /api/sepay/webhook`
Webhook nhận thông báo giao dịch chuyển khoản từ SePay. **Không gọi trực tiếp từ frontend** — do hệ thống SePay gọi.

- **Header bắt buộc**: `Authorization: Apikey <SEPAY_WEBHOOK_SECRET>`
- **Idempotent**: dùng `sepay_webhook_logs.id` = transaction id SePay làm khóa chống trùng
- **Luôn trả 200** trừ lỗi xác thực (401) — yêu cầu bắt buộc từ phía SePay (retry tối đa 7 lần/5 giờ nếu không nhận 200 trong 30s)
- Xem chi tiết đầy đủ luồng ở [[05-module-thanh-toan]] §2

## Tìm kiếm & liên hệ

### `GET /api/search?q=...`
Tìm kiếm toàn site: trang tĩnh, dịch vụ, sản phẩm, blog (từ `placeholder-data`, xem [[06-module-noi-dung]]) + khóa học (Sanity thật, qua `getCourses()`).

- Query tối thiểu 2 ký tự, so khớp không phân biệt dấu tiếng Việt (diacritic-insensitive), khớp trên tiêu đề + mô tả
- Trả tối đa 8 kết quả

### `POST /api/contact/submit`
Xử lý form liên hệ chung, `multipart/form-data`, có honeypot field (`website`) để lọc bot.

- **⚠️ Trạng thái hiện tại**: chỉ `console.log` nội dung gửi lên, **chưa lưu DB, chưa gửi email** (có TODO trong code chờ hạ tầng lưu trữ/thông báo)
- **Response**: redirect `/lien-he?status=success` hoặc `?status=error`

---

## Tổng hợp theo yêu cầu đăng nhập

| Endpoint | Đăng nhập | Ghi danh khóa học |
|---|---|---|
| `POST /api/auth/register` | — | — |
| `POST /api/auth/login` | — | — |
| `POST /api/auth/logout` | Có | — |
| `GET /api/auth/me` | Tùy chọn (trả null nếu chưa) | — |
| `POST /api/orders/create` | Tùy chọn (hỗ trợ khách vãng lai) | — |
| `GET /api/orders/[id]/status` | Không (public, UUID là token) | — |
| `POST /api/courses/checkout` | **Bắt buộc** | — |
| `POST /api/courses/progress` | **Bắt buộc** | **Bắt buộc** |
| `GET /api/certificates/[courseRef].pdf` | **Bắt buộc** | Ngầm định (403 nếu chưa hoàn thành) |
| `POST /api/sepay/webhook` | Xác thực bằng API key riêng, không phải session | — |
| `GET /api/search` | Không | — |
| `POST /api/contact/submit` | Không | — |
