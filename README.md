# Phong Thủy Thiên Anh — Website

Website chính thức cho công ty tư vấn phong thủy **Phong Thủy Thiên Anh**: giới thiệu & dịch vụ tư vấn, cửa hàng vật phẩm phong thủy, blog kiến thức, công trình đã thực hiện, và khóa học (đăng ký offline + học online).

## Kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Web app | Astro (Node adapter, chế độ `standalone`) |
| Giao diện | Tailwind CSS v4 |
| CMS nội dung | [Sanity](https://sanity.io) (sản phẩm, dịch vụ, blog, khóa học, portfolio, testimonial) |
| Dữ liệu giao dịch | [Neon](https://neon.tech) Postgres qua Drizzle ORM (đơn hàng, tài khoản học viên, tiến độ học) |
| Đăng nhập học viên | Session-cookie tự viết (email/mật khẩu) |
| Video khóa học | [Bunny Stream](https://bunny.net/stream/) (URL ký, chống tải lén) |
| Thanh toán | Chuyển khoản/COD thủ công (không tích hợp cổng thanh toán) |
| Hosting | Hostinger KVM VPS (PM2 + Nginx + Let's Encrypt) |

## Cài đặt local

```bash
npm install
cp .env.example .env   # điền SANITY_*, DATABASE_URL, SESSION_COOKIE_SECRET, BUNNY_STREAM_*
npm run dev
```

## Commands

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy dev server tại `localhost:4321` |
| `npm run build` | Build production vào `./dist/` |
| `npm run preview` | Xem thử bản build trước khi deploy |
| `npm run start` | Chạy server production (`node ./dist/server/entry.mjs`) — dùng trên VPS qua PM2 |

## Cấu trúc thư mục

```
├── studio/           # Sanity Studio (deploy riêng, xem studio/README.md)
├── db/                # Drizzle schema + migrations cho Neon Postgres
└── src/
    ├── layouts/       # BaseLayout, MarketingLayout, ShopLayout, StudentLayout
    ├── components/    # layout/, home/, shop/, blog/, courses/, ui/
    ├── lib/
    │   ├── cms/       # client + query Sanity (điểm truy cập Sanity duy nhất)
    │   ├── db/        # client + query Postgres (điểm truy cập DB duy nhất)
    │   ├── auth/       # session, hash mật khẩu
    │   ├── video/      # ký URL Bunny Stream, kiểm tra quyền xem
    │   └── cart/
    └── pages/          # route theo cấu trúc menu (xem kế hoạch dự án)
```

## Deploy lên Hostinger VPS

Xem hướng dẫn chi tiết trong `docs/deploy-hostinger.md` (sẽ tạo ở Giai đoạn 5).
