# Đặc tả sản phẩm — Phong Thủy Thiên Anh

> Tài liệu này mô tả website chính thức của công ty tư vấn phong thủy **Phong Thủy Thiên Anh**, dựa trên trạng thái hiện tại của codebase (`phong-thuy-thien-anh/`). Đây là tài liệu đặc tả kỹ thuật + nghiệp vụ, dùng làm nguồn tham chiếu chung cho đội phát triển.

## 1. Sản phẩm là gì

Một website đa chức năng cho công ty tư vấn phong thủy, gồm 5 mảng nghiệp vụ chính:

1. **Marketing/giới thiệu** — trang chủ, giới thiệu công ty, đội ngũ, dịch vụ tư vấn, công trình đã thực hiện, testimonial.
2. **Cửa hàng vật phẩm phong thủy** — danh mục sản phẩm, giỏ hàng, đặt hàng, theo dõi đơn.
3. **Khóa học trực tuyến (LMS)** — đăng ký/mua khóa học, học viên đăng nhập, xem video bài giảng, theo dõi tiến độ, nhận chứng chỉ PDF.
4. **Blog kiến thức** — bài viết chuyên môn phong thủy, thuật ngữ, tìm kiếm toàn site.
5. **Công cụ phong thủy tương tác** — lập lá số Bát Tự, gieo quẻ Kinh Dịch, tra cứu mệnh theo năm sinh.

Xem chi tiết từng mảng trong các file `0X-module-*.md` cùng thư mục.

## 2. Kiến trúc tổng thể

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Web app (SSR) | [Astro](https://astro.build) 7.x, adapter `@astrojs/node` (chế độ `standalone`) | Render trang, xử lý API routes, không dùng framework UI (React/Vue) — thuần `.astro` + `<script>` |
| Giao diện | Tailwind CSS v4 (qua `@tailwindcss/vite`) | Styling, không có file `tailwind.config` riêng |
| CMS nội dung | [Sanity](https://sanity.io) (`@sanity/client`, GROQ) | Nguồn dữ liệu cho: khóa học/bài học (đã tích hợp), sản phẩm/dịch vụ/blog/công trình/testimonial/đội ngũ (schema đã có, **app vẫn dùng dữ liệu mẫu — xem [[06-module-noi-dung]]**) |
| Dữ liệu giao dịch | [Neon](https://neon.tech) Postgres qua Drizzle ORM | Người dùng, đơn hàng, ghi danh khóa học, tiến độ học, chứng chỉ, log webhook |
| Đăng nhập học viên | Session cookie tự viết, không dùng thư viện auth ngoài | Xem [[02-module-tai-khoan]] |
| Video khóa học | [Bunny Stream](https://bunny.net/stream/) | URL nhúng có chữ ký, hết hạn sau 2 giờ |
| Thanh toán | SePay QR (tự động đối soát qua webhook) + COD | Xem [[05-module-thanh-toan]] |
| Email giao dịch | [Resend](https://resend.com) | Xác nhận đơn hàng, chứng chỉ khóa học |
| Chứng chỉ | `pdf-lib` + font Be Vietnam Pro nhúng | Sinh PDF chứng chỉ hoàn thành khóa học theo yêu cầu (on-the-fly) |
| Hosting | Hostinger KVM VPS — PM2 + Nginx + Let's Encrypt | `npm run build` → `npm run start` (`node ./dist/server/entry.mjs`) |

### Nguyên tắc kiến trúc quan trọng: Polyglot persistence

Dự án tách rõ hai loại dữ liệu:

- **Sanity CMS** lưu **nội dung biên tập** (content): sản phẩm, dịch vụ, khóa học, bài học, blog, công trình, testimonial, cấu hình site.
- **Neon Postgres** lưu **dữ liệu giao dịch/người dùng** (transactional): tài khoản, đơn hàng, ghi danh, tiến độ học, chứng chỉ.

Các bảng Postgres **không** có khóa ngoại SQL trỏ tới Sanity — chúng tham chiếu bằng chuỗi (`product_ref`, `course_ref`, `lesson_ref` = giá trị `slug`/`_id` của tài liệu Sanity). Xem chi tiết ở [[01-kien-truc-du-lieu]].

## 3. Cấu trúc thư mục

```
├── studio/            # Sanity Studio (deploy riêng — xem studio/README.md)
├── db/                # Drizzle schema (db/schema.ts) + migrations cho Neon Postgres
├── docs/              # Tài liệu đặc tả (thư mục này)
└── src/
    ├── layouts/        # BaseLayout, MarketingLayout, ShopLayout, StudentLayout
    ├── components/     # layout/, home/, courses/, ui/
    ├── middleware.ts    # Gắn context.locals.user từ session cookie cho mọi request
    ├── lib/
    │   ├── cms/         # Client + query Sanity (chỉ course/lesson đã tích hợp)
    │   ├── db/          # Client + query Postgres (orders, certificates)
    │   ├── auth/        # Hash mật khẩu, session, client IP
    │   ├── video/        # Ký URL nhúng Bunny Stream
    │   ├── payments/     # SePay: mã đơn, QR, xác thực webhook
    │   ├── email/        # Template + gửi email qua Resend
    │   ├── certificate/  # Sinh PDF chứng chỉ
    │   └── cart/          # Giỏ hàng client-side (localStorage, tạm thời)
    └── pages/            # Route theo cấu trúc menu + API routes dưới pages/api/
```

## 4. Danh sách tài liệu đặc tả

| File | Nội dung |
|---|---|
| [01-kien-truc-du-lieu.md](01-kien-truc-du-lieu.md) | Schema Sanity (9 loại tài liệu) + schema Postgres (8 bảng, Drizzle) |
| [02-module-tai-khoan.md](02-module-tai-khoan.md) | Đăng ký/đăng nhập, session, bảo mật |
| [03-module-cua-hang.md](03-module-cua-hang.md) | Sản phẩm, giỏ hàng, đặt hàng |
| [04-module-khoa-hoc.md](04-module-khoa-hoc.md) | Khóa học, video, tiến độ, chứng chỉ |
| [05-module-thanh-toan.md](05-module-thanh-toan.md) | COD, SePay QR, webhook, trạng thái đơn |
| [06-module-noi-dung.md](06-module-noi-dung.md) | Blog, dịch vụ, công trình, testimonial, đội ngũ, cấu hình site |
| [07-module-cong-cu-phong-thuy.md](07-module-cong-cu-phong-thuy.md) | Bát Tự, Kinh Dịch, tra cứu mệnh |
| [08-api-reference.md](08-api-reference.md) | Toàn bộ API endpoint |

## 5. Biến môi trường

Xem `.env.example` ở gốc dự án. Nhóm chính: `SANITY_*` (CMS), `DATABASE_URL` (Postgres), `SESSION_COOKIE_SECRET` (auth), `BUNNY_STREAM_*` (video), `RESEND_*` (email), `SEPAY_*` (thanh toán), `PUBLIC_SITE_URL`.

## 6. Trạng thái & việc còn thiếu (roadmap ngầm định từ code)

- `docs/deploy-hostinger.md` — hướng dẫn deploy chi tiết lên Hostinger VPS, được README nhắc tới nhưng **chưa tồn tại**.
- Giỏ hàng hiện là **client-side/localStorage**, có comment trong code đánh dấu sẽ thay bằng API ghi thẳng `orders`/`order_items` ở giai đoạn sau — xem [[03-module-cua-hang]].
- Form liên hệ (`/api/contact/submit`) hiện chỉ `console.log`, chưa lưu DB hay gửi email — xem [[08-api-reference]].
- Sản phẩm/dịch vụ/blog/công trình/testimonial/đội ngũ: schema Sanity đã có nhưng trang web vẫn đọc từ `placeholder-data.ts` — xem [[06-module-noi-dung]].
- Enum `payment_method` có giá trị `bank_transfer` nhưng chưa có luồng nghiệp vụ nào tạo đơn với giá trị này (chỉ `cod` và `sepay_qr` được dùng).
