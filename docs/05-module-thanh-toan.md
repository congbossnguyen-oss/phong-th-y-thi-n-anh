# Module: Thanh toán & đơn hàng

> Postgres: `orders`, `sepay_webhook_logs` — xem [[01-kien-truc-du-lieu]]. Code: `src/lib/payments/sepay.ts`, `src/lib/db/orders.ts`, `src/pages/api/sepay/webhook.ts`, `src/pages/api/orders/*`, `src/pages/api/courses/checkout.ts`.

## 1. Phương thức thanh toán

Enum `payment_method` khai báo 3 giá trị nhưng thực tế chỉ 2 được dùng trong code hiện tại:

| Giá trị enum | Dùng ở đâu | Trạng thái |
|---|---|---|
| `sepay_qr` | Đơn sản phẩm (tùy chọn) + **luôn dùng** cho đơn khóa học | Đang hoạt động, tự động đối soát |
| `cod` | Chỉ đơn sản phẩm (thanh toán khi giao hàng) | Đang hoạt động, xác nhận thủ công |
| `bank_transfer` | Khai báo trong enum | **Chưa có luồng nào tạo đơn với giá trị này** — cần xác nhận với đội nghiệp vụ nếu muốn dùng |

## 2. SePay QR — thanh toán tự động

`src/lib/payments/sepay.ts`:

- `generateOrderCode()` — sinh mã đơn dạng `THA` + 8 ký tự ngẫu nhiên, tránh ký tự dễ nhầm (0/O, 1/I).
- `getSepayQrUrl(...)` — dựng URL ảnh VietQR qua `qr.sepay.vn/img`, nhúng `order_code` vào nội dung chuyển khoản để đối soát sau này.
- `extractOrderCodeFromContent(content)` — dùng regex để tách lại mã đơn từ nội dung chuyển khoản thực tế (nội dung do ngân hàng trả về có thể lẫn nhiều ký tự nhiễu).
- `verifySepayWebhookAuth(request)` — kiểm tra header `Authorization: Apikey <SEPAY_WEBHOOK_SECRET>`.

### Webhook (`POST /api/sepay/webhook`)

Đây là điểm tích hợp quan trọng nhất về mặt độ tin cậy tài chính. Luồng xử lý đầy đủ:

1. **Xác thực**: kiểm tra header `Authorization`. Sai → trả **401** (đây là trường hợp duy nhất không trả 200).
2. **Chống trùng (idempotency)**: insert vào `sepay_webhook_logs` với `id` = transaction id của SePay (PK). Nếu đã tồn tại (conflict) → coi như đã xử lý, bỏ qua phần còn lại nhưng vẫn trả 200.
3. **Trích mã đơn**: `extractOrderCodeFromContent()` lấy `order_code` từ nội dung/mô tả giao dịch.
4. **Kiểm tra đơn hàng hợp lệ**:
   - Đơn tồn tại theo `order_code`.
   - Đơn đang ở trạng thái `pending_payment` (không xử lý lại đơn đã `confirmed`).
   - Số tiền chuyển khoản **≥** `total_amount` của đơn (chấp nhận chuyển thừa, từ chối/không xử lý nếu thiếu).
5. Nếu hợp lệ → gọi `markOrderPaidAndFulfill()`:
   - Cập nhật `orders.status = confirmed`, `paid_at = now()`.
   - Nếu `order_type = course` → tạo `course_enrollments` (xem [[04-module-khoa-hoc]]).
   - Nếu `order_type = product` → gửi email xác nhận đơn hàng (`sendProductOrderConfirmedEmail`).
6. **Luôn trả HTTP 200 `{success: true}`** (trừ lỗi auth ở bước 1) — đây là yêu cầu bắt buộc từ phía SePay: webhook phải trả 200 trong vòng 30 giây, nếu không SePay sẽ **retry tối đa 7 lần trong 5 giờ**. Cơ chế idempotency ở bước 2 tồn tại chính vì lý do này.

### Nguyên tắc bảo mật quan trọng

- **Không bao giờ tin số tiền/trạng thái do client gửi lên** — mọi xác nhận thanh toán chỉ đến từ webhook đã xác thực chữ ký, không có API nào cho phép client tự đánh dấu đơn là "đã thanh toán".
- Giá trị `total_amount` được tính từ server tại thời điểm tạo đơn (xem [[03-module-cua-hang]]), webhook chỉ so khớp chứ không nhận giá từ bên ngoài.

## 3. COD (thanh toán khi nhận hàng)

Chỉ áp dụng đơn sản phẩm (`POST /api/orders/create` với `paymentMethod: "cod"`). Đơn giữ trạng thái `pending_payment` cho tới khi được xác nhận thủ công (giao hàng thành công) — không có API tự động chuyển trạng thái, phải thao tác qua công cụ quản trị/DB trực tiếp (chưa có UI admin trong `src/pages`).

## 4. Vòng đời trạng thái đơn hàng

```
pending_payment ──(SePay webhook xác nhận)──▶ confirmed ──(thủ công)──▶ shipped
       │
       └──(thủ công / không thanh toán)──▶ cancelled
```

`confirmed` → `shipped` chỉ áp dụng đơn sản phẩm (đơn khóa học không cần giao hàng vật lý — sau `confirmed` là ghi danh trực tiếp).

## 5. Email giao dịch

`src/lib/email/` — dùng Resend, gửi qua hàm `safeSend()` **nuốt lỗi có chủ đích**: nếu Resend lỗi/timeout, request gốc (đặc biệt là webhook SePay, vốn phải trả 200 trong 30s) **không bị fail theo**. Lỗi gửi email chỉ được log, không throw.

3 loại email: xác nhận đơn sản phẩm, xác nhận đơn khóa học, chứng chỉ hoàn thành khóa học (đính kèm PDF).
