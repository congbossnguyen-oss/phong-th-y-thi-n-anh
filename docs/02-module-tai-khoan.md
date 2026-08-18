# Module: Tài khoản học viên (Auth)

> Bảng liên quan: `users`, `sessions` — xem [[01-kien-truc-du-lieu]]. Code: `src/lib/auth/`, `src/middleware.ts`, `src/pages/api/auth/*`, trang `src/pages/hoc-vien/dang-nhap.astro`, `dang-ky.astro`.

## 1. Phạm vi

Tài khoản chỉ dành cho **học viên khóa học online** (khu vực `/hoc-vien`). Mua hàng ở cửa hàng không bắt buộc đăng nhập (hỗ trợ khách vãng lai — xem [[03-module-cua-hang]]).

## 2. Mật khẩu

`src/lib/auth/password.ts` — dùng module `scrypt` có sẵn của Node.js (không phụ thuộc thư viện ngoài).

- `hashPassword(password)` → chuỗi định dạng `salt:hash`.
- `verifyPassword(password, stored)` → so khớp lại bằng cùng salt.

## 3. Đăng ký (`POST /api/auth/register`)

Input: `name`, `email`, `password` (≥ 6 ký tự).

Luồng:
1. Kiểm tra email đã tồn tại trong `users` → nếu có, từ chối.
2. Hash mật khẩu, tạo bản ghi `users`.
3. Tự động đăng nhập: tạo session + set cookie (giống luồng login).

## 4. Đăng nhập (`POST /api/auth/login`)

Input: `email`, `password`.

Luồng:
1. Tìm user theo email, verify mật khẩu bằng scrypt.
2. Gọi `createSession(userId, ip)`.
3. Set cookie `httpOnly`, tên `thien_anh_session` (hằng số `SESSION_COOKIE_NAME` trong `src/lib/auth/session.ts`).
4. Trả về `{ok, user: {name, email}}`.

## 5. Mô hình session — 2 cơ chế bảo mật đáng chú ý

`src/lib/auth/session.ts`:

### a) Single-device login
`createSession()` **xóa toàn bộ session cũ của user** trước khi tạo session mới → đăng nhập ở thiết bị mới sẽ tự động đăng xuất thiết bị cũ.

### b) IP-pinning
Session được tạo ra gắn với `ip_address` tại thời điểm đăng nhập (`src/lib/auth/client-ip.ts` — đọc header `X-Forwarded-For` trước, fallback `context.clientAddress`, phù hợp khi chạy sau reverse proxy). `validateSessionToken()` so sánh IP request hiện tại với IP lưu trong session — **khác IP thì session bị coi là không hợp lệ**.

> Lưu ý vận hành: cơ chế này có thể gây đăng xuất ngoài ý muốn với người dùng mạng di động đổi IP thường xuyên hoặc dùng VPN động — cần cân nhắc khi báo lỗi "tự nhiên bị đăng xuất".

### c) Lưu trữ token
Bảng `sessions.id` lưu **SHA-256 hash** của token, không lưu token thô — token thô chỉ nằm trong cookie phía trình duyệt. Hạn dùng: 30 ngày kể từ khi tạo.

### d) Gắn user vào mọi request
`src/middleware.ts` chạy trên mọi request không prerender: đọc cookie session → `validateSessionToken()` → gán `context.locals.user`. Mọi trang/API cần đăng nhập đều đọc `locals.user` thay vì tự parse cookie.

## 6. Đăng xuất (`POST /api/auth/logout`)

Vô hiệu session hiện tại (xóa bản ghi trong `sessions`), xóa cookie.

## 7. Kiểm tra phiên (`GET /api/auth/me`)

Trả `{user}` (từ `locals.user`) hoặc `{user: null}` — dùng cho UI client-side kiểm tra trạng thái đăng nhập.

## 8. Quyền admin

Cột `users.is_admin` tồn tại trong schema nhưng **chưa thấy trang/route nào trong `src/pages` sử dụng nó** — có thể là chỗ để mở rộng khu vực quản trị sau này.
