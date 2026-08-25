# Checklist test tay — Gating VIP + Chống lạm dụng trial

Các luồng cần **đăng nhập + DB đã migrate** — không tự động test được, làm tay trên staging sau khi
chạy `npm run db:migrate`. Đánh dấu ✅ khi qua.

## Chuẩn bị
- [ ] Chạy `npm run db:migrate` (tạo bảng `trial_devices`).
- [ ] 3 tài khoản test: **A** = có gói Cao Cấp (hoặc trial đang chạy), **B** = đăng nhập nhưng KHÔNG gói, **C** = admin.

## 1. Miễn phí theo gói Cao Cấp (8 dịch vụ VIP)
- [ ] A mở `/quan-su/xem-ngay-cao-cap` → banner hiện **"Bạn đang có gói Cao Cấp — miễn phí"**.
- [ ] A điền form + bấm submit → **ra kết quả ngay, KHÔNG hiện QR** (đơn 0đ tự xác nhận).
- [ ] Lặp cho vài dịch vụ khác (cưới hỏi, nhận chức…) → đều miễn phí.
- [ ] **Sim Phong Thủy** (`/dai-cat-loi/sim-phong-thuy-khai-van`): A vẫn phải trả phí (KHÔNG nằm trong gói).
- [ ] Khách vãng lai (chưa đăng nhập) mở trang web dịch vụ → **vẫn trả phí theo lượt như cũ** (không bị phá).

## 2. Banner theo quyền
- [ ] B (không gói) mở trang VIP → banner mời **nâng gói** (link Xem gói).
- [ ] Chưa đăng nhập → banner mời **đăng nhập**.
- [ ] C (admin) → banner **miễn phí** (admin luôn có quyền).

## 3. Dùng thử 7 ngày + chống lạm dụng (mức Vừa)
> Lưu ý: endpoint dùng thử hiện **admin-only**; test bằng tài khoản admin, hoặc tạm nới điều kiện.
- [ ] Kích hoạt trial 1 lần → OK, hưởng Cao Cấp 7 ngày.
- [ ] Cùng **tài khoản** kích hoạt lại → chặn "tài khoản đã dùng thử".
- [ ] Tạo tài khoản mới **trên cùng máy/trình duyệt** (không xóa cookie) → kích hoạt trial → chặn **"Thiết bị này đã dùng thử rồi"**.
- [ ] Tạo trial từ **4 tài khoản khác nhau cùng 1 IP** trong 90 ngày → tài khoản thứ 4 bị chặn **"Mạng của bạn đã có nhiều lượt dùng thử"** (ngưỡng 3/IP).
- [ ] Xóa cookie `tt_device` + đổi mạng → trial lại được (đúng thiết kế mức "Vừa" — không chặn tuyệt đối).

## 4. In-app tự chứa (App Store)
- [ ] Đăng nhập, mở `/quan-su/dich-vu-vip` → danh sách 8 dịch vụ (KHÔNG có Sim), không hiện giá.
- [ ] Bấm 1 dịch vụ → sang `/quan-su/<slug>` (in-app, có BottomNav), KHÔNG nhảy ra trang marketing.
- [ ] Anon mở `/quan-su/xem-ngay-cao-cap` → bị chuyển về trang chủ (gated) ✅ (đã tự test — 302).

## Đã tự động test (Vitest, PASS)
- Ngưỡng chống lạm dụng: 1/thiết bị, ≥3/IP → chặn (`trial.antiabuse.test.ts`).
- Đúng 8 slug VIP miễn phí, loại sim + dinh-huong (`vip-gating.test.ts`).
