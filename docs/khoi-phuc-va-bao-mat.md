# Sổ tay Khôi phục & Bảo mật — phongthuythienanh.com

Mục tiêu: nếu web bị hack / mất dữ liệu, có đường phục hồi rõ ràng; và giảm tối đa khả năng bị hack.

---

## A. BACKUP ĐỊNH KỲ (làm đều là quan trọng nhất)

### 1. Database (Neon Postgres) — dữ liệu khách, KHÔNG tái tạo được
```bash
node scripts/backup-db.mjs
```
→ tạo `backups/db-<thời-gian>.json` (đủ 11 bảng: users, orders, đơn tư vấn, chứng chỉ…).
- Thư mục `backups/` đã được `.gitignore` — **không bao giờ lên git**.
- File chứa hash mật khẩu + token phiên → **coi như tài liệu mật**: cất vào **Google Drive có bật 2FA** hoặc ổ mã hoá. Không gửi qua chat/email thường.
- **Nên chạy: mỗi tuần 1 lần** (hoặc trước mỗi lần đổi lớn). Giữ lại vài bản gần nhất.

### 2. Nội dung khóa học (Sanity CMS)
```bash
cd studio && npx sanity dataset export production ../backups/sanity-production.tar.gz
```
(Chạy trong thư mục `studio/`; nếu hỏi đăng nhập thì `npx sanity login`.)

### 3. Video khóa học (Bunny Stream / Cloudflare R2)
Bản gốc video anh quay nên giữ 1 bản trên máy/ổ cứng ngoài — đây là thứ nặng và lâu nhất nếu phải làm lại.

### Khôi phục DB từ backup
```bash
# Xem thử (không ghi gì):
node scripts/restore-db.mjs backups/db-XXXX.json
# Khôi phục thật (rót vào DB mà .env đang trỏ tới):
node scripts/restore-db.mjs backups/db-XXXX.json --confirm
```
> Lần đầu nên thử trên 1 **Neon branch trống** (Neon dashboard → Branches) trước khi rót vào DB thật.

---

## B. BẬT 2FA — rào chắn mạnh nhất, miễn phí (làm 1 lần)

Hầu hết "bị hack" là do **chiếm tài khoản**, không phải lỗ hổng code. Bật xác thực 2 lớp (2FA/Authenticator) cho **tất cả**:

- [ ] **GitHub** (`congbossnguyen-oss`) — nắm mã nguồn.
- [ ] **Render** — nắm server + biến môi trường (secret).
- [ ] **Cloudflare** — nắm DNS (chuyển hướng domain).
- [ ] **Nhà đăng ký tên miền** (nơi mua `phongthuythienanh.com`) — quan trọng nhất, mất domain là mất tất cả. Bật thêm **Registrar Lock / khoá chuyển nhượng**.
- [ ] **Neon** — nắm database.
- [ ] **Sanity** — nắm nội dung khóa học.
- [ ] **Google/Email** (`congboss.nguyen@gmail.com`) — hòm thư khôi phục của mọi dịch vụ khác.
- [ ] **SePay** — cổng thanh toán.
- [ ] **Resend, Bunny** — email + video.

Ghi lại **mã khôi phục (recovery codes)** của từng dịch vụ, cất offline.

---

## C. KHI NGHI LỘ SECRET → đổi ngay (thứ tự ưu tiên: tiền → dữ liệu)

Secret nằm ở **Render → Environment** và bản `.env` local. Khi đổi, sửa ở CẢ hai (Render tự deploy lại sau khi lưu).

1. **SePay** (`SEPAY_API_TOKEN`, `SEPAY_WEBHOOK_SECRET`) — tạo lại trong SePay dashboard, cập nhật cả cấu hình Webhook Authorization. *(liên quan tiền → đổi trước)*
2. **Neon** (`DATABASE_URL`) — Neon dashboard → Reset password/connection string.
3. **Session** (`SESSION_COOKIE_SECRET`) — đổi chuỗi ngẫu nhiên mới → mọi phiên đăng nhập cũ bị vô hiệu (buộc đăng nhập lại, cắt kẻ đang chiếm phiên).
4. **Resend** (`RESEND_API_KEY`), **Bunny** (`BUNNY_STREAM_TOKEN_AUTH_KEY`), **Sanity** (`SANITY_API_TOKEN`).
5. **Google Sheets webhook secret** nếu có nghi ngờ.

---

## D. TRÌNH TỰ KHÔI PHỤC KHI ĐÃ BỊ HACK

1. **Khoá cửa trước:** đổi mật khẩu + bật 2FA tất cả tài khoản mục B.
2. **Đổi toàn bộ secret** theo mục C (kẻ tấn công có thể đã lấy được key cũ).
3. **Mã nguồn:** so với Git. Nếu bị sửa/cài mã độc → `git push` bản sạch lên `main`, Render tự deploy lại. (Code luôn an toàn vì nằm trên GitHub.)
4. **Database:** nếu bị xoá/hỏng → khôi phục bằng **Neon PITR** (trong 7 ngày, Neon dashboard → Restore) hoặc bằng file backup gần nhất (mục A → "Khôi phục DB").
5. **Rà soát gian lận:** kiểm bảng `orders` + `sepay_webhook_logs` xem có đơn/giao dịch giả không.
6. **Domain/DNS:** vào Cloudflare kiểm bản ghi DNS có bị đổi hướng không.

---

## Tóm tắt 1 dòng
**Bật 2FA mọi tài khoản + chạy `node scripts/backup-db.mjs` mỗi tuần, cất file ra Drive an toàn** — làm 2 việc này là đã phòng thủ được 90% rủi ro mất trắng.
