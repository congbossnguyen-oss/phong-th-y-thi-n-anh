# Module: Cửa hàng vật phẩm phong thủy

> Sanity: `product`. Postgres: `orders`, `order_items` — xem [[01-kien-truc-du-lieu]]. Code: `src/lib/cart/`, `src/pages/vat-pham/*`, `src/pages/gio-hang.astro`, `src/pages/thanh-toan.astro`, `src/pages/api/orders/*`.

## 1. Danh mục sản phẩm

Trang `vat-pham/index.astro` (danh sách, lọc theo `category`) và `vat-pham/[slug].astro` (chi tiết).

4 category cố định (enum Sanity): `cong-danh-su-nghiep`, `hoa-sat-tran-trach`, `hoa-giai-van-han`, `chieu-tai-kich-loc`.

> **Trạng thái hiện tại:** trang sản phẩm đọc dữ liệu từ `src/lib/placeholder-data.ts`, **chưa** query trực tiếp Sanity dù schema `product` đã sẵn sàng. Xem ghi chú roadmap ở [[06-module-noi-dung]].

## 2. Giỏ hàng — client-side, tạm thời

`src/lib/cart/cart-client.ts` — **đánh dấu rõ trong code là bản demo/tạm**, lưu hoàn toàn ở `localStorage` trình duyệt, chưa đụng tới bảng `orders`/`order_items`. Kế hoạch (theo comment trong code): thay bằng API `/api/cart/*` ghi thẳng vào DB ở giai đoạn sau.

API của module:
- `getCart()`, `addItem()`, `updateQty()`, `removeItem()`, `clearCart()`
- `getCartCount()`, `getCartTotal()`
- Sự kiện DOM tùy biến `cart:updated` (hằng số `CART_EVENT_NAME`) — các component khác (badge số lượng trên header, `CartScript.astro`) lắng nghe sự kiện này để đồng bộ UI khi giỏ hàng thay đổi mà không cần reload trang.

Trang `gio-hang.astro` render và cho sửa giỏ hàng dựa trên `localStorage` này.

## 3. Đặt hàng (checkout)

Trang `thanh-toan.astro` → gọi `POST /api/orders/create`.

Input: `{name, phone, email, address, note, paymentMethod: "cod" | "sepay_qr", lines: [{slug, qty}]}`.

Điểm quan trọng về bảo mật/toàn vẹn dữ liệu: **giá được resolve lại ở server** (không tin giá client gửi lên) — server tra `slug` sản phẩm để lấy giá hiện tại, rồi mới ghi `unit_price_snapshot` vào `order_items`.

Luồng xử lý (`src/lib/db/orders.ts` → `createProductOrder()`):
1. Tạo `orders` với `order_type = product`, `status = pending_payment`, `user_id` = null nếu khách vãng lai.
2. Tạo các dòng `order_items` tương ứng, mỗi dòng chụp lại tên + giá sản phẩm tại thời điểm đặt (`product_name_snapshot`, `unit_price_snapshot`) để không bị ảnh hưởng nếu sau này giá sản phẩm trong Sanity thay đổi.
3. Nếu `paymentMethod = sepay_qr`: sinh mã đơn (`order_code`) và trả kèm `qrUrl` (VietQR) để khách quét chuyển khoản.
4. Nếu `paymentMethod = cod`: đơn ở trạng thái `pending_payment`, xác nhận thủ công sau (giao hàng thu tiền).

Xem chi tiết luồng thanh toán/webhook ở [[05-module-thanh-toan]].

## 4. Theo dõi đơn hàng

- `GET /api/orders/[id]/status` — tra cứu công khai theo UUID đơn hàng, dùng chính UUID (khó đoán) làm "token" tra cứu cho khách vãng lai không có tài khoản. Trả `{ok, status, orderType, orderCode, courseRef}`.
- Trang xác nhận: `don-hang/thanh-cong.astro`; trang chờ thanh toán: `don-hang/[id]/cho-thanh-toan.astro`.

## 5. Trạng thái đơn hàng (`order_status`)

`pending_payment → confirmed → shipped` (hoặc `cancelled` ở bất kỳ bước nào trước khi hoàn tất — không thấy code tự động chuyển sang `cancelled`, có vẻ là thao tác thủ công/admin).
