# Sanity Studio — Phong Thủy Thiên Anh

Ứng dụng quản trị nội dung (CMS) cho website: dịch vụ, sản phẩm, blog, khóa học, công trình, đánh giá.

## Thiết lập lần đầu

1. Tạo project tại [sanity.io/manage](https://www.sanity.io/manage) (miễn phí) → lấy `Project ID`.
2. Cài Sanity CLI và đăng nhập:
   ```bash
   npm install
   npx sanity login
   ```
3. Tạo file `.env` trong thư mục `studio/` với:
   ```
   SANITY_STUDIO_PROJECT_ID=<project-id-thật>
   SANITY_STUDIO_DATASET=production
   ```
4. Chạy studio local:
   ```bash
   npm run dev
   ```
5. Trong project Astro chính (`../`), điền `SANITY_PROJECT_ID`, `SANITY_DATASET`, và tạo `SANITY_API_TOKEN` (Sanity Manage → API → Tokens, quyền "Viewer" là đủ cho đọc dữ liệu công khai) vào `.env`.

## Deploy Studio

```bash
npm run deploy
```

Sẽ hỏi chọn hostname (vd `phong-thuy-thien-anh` → truy cập tại `phong-thuy-thien-anh.sanity.studio`).

## Cấu trúc nội dung

Xem `schemaTypes/` — mỗi file tương ứng 1 loại nội dung: `siteSettings` (cấu hình chung, singleton), `service`, `product`, `blogPost`, `course` + `lesson`, `portfolioItem`, `testimonial`, `teamMember`.
