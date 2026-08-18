# Module: Nội dung marketing (Blog, dịch vụ, công trình, đội ngũ)

> Sanity: `service`, `blogPost`, `portfolioItem`, `testimonial`, `teamMember`, `siteSettings` — xem [[01-kien-truc-du-lieu]]. Code: `src/lib/placeholder-data.ts`, `src/lib/placeholder-team.ts`, `src/lib/site-config.ts`, `src/components/home/*`, `src/pages/dich-vu/*`, `src/pages/kien-thuc/*`, `src/pages/cong-trinh/*`, `src/pages/gioi-thieu/*`.

## ⚠️ Trạng thái quan trọng: chưa nối Sanity cho các loại nội dung này

Schema Sanity cho `service`, `product`, `blogPost`, `portfolioItem`, `testimonial`, `teamMember` **đã được định nghĩa đầy đủ** trong `studio/schemaTypes/`, biên tập viên đã có thể nhập liệu qua Sanity Studio. Tuy nhiên, ở phía web app:

- `src/lib/cms/queries.ts` (điểm truy cập Sanity duy nhất theo quy ước dự án) **chỉ có query cho `course`/`lesson`**.
- Các trang liên quan đến dịch vụ, sản phẩm, blog, đội ngũ hiện đọc dữ liệu **mẫu tĩnh** từ `src/lib/placeholder-data.ts` (dịch vụ, sản phẩm, bài blog, thống kê) và `src/lib/placeholder-team.ts` (tiểu sử đội ngũ).
- `src/pages/api/search.ts` cũng import trực tiếp từ `placeholder-data` cho phần dịch vụ/sản phẩm/blog trong kết quả tìm kiếm (chỉ phần khóa học là gọi Sanity thật qua `getCourses()`).

**Ý nghĩa với việc phát triển tiếp:** nội dung biên tập trong Sanity Studio cho các loại tài liệu này **hiện không hiển thị trên website thật** cho tới khi có người viết thêm các hàm query tương ứng trong `src/lib/cms/queries.ts` và thay thế các import từ `placeholder-data`. Đây là hạng mục còn thiếu, không phải lỗi.

## 1. Dịch vụ tư vấn (`service`)

Trang `dich-vu/index.astro` (danh sách), `dich-vu/[slug].astro` (chi tiết). Dữ liệu hiện tại: `placeholder-data.ts`.

## 2. Blog kiến thức (`blogPost`)

Trang `kien-thuc/index.astro` (danh sách, lọc theo category), `kien-thuc/[category]/[slug].astro` (chi tiết bài), `kien-thuc/thuat-ngu-phong-thuy.astro` (trang riêng: từ điển thuật ngữ phong thủy, nội dung tĩnh không qua CMS).

4 category (enum Sanity): `kien-thuc-ung-dung`, `nha-o`, `van-phong-kinh-doanh`, `vat-pham`.

## 3. Công trình đã thực hiện (`portfolioItem`)

Trang `cong-trinh/index.astro`, `cong-trinh/[slug].astro`.

## 4. Đánh giá khách hàng (`testimonial`)

Hiển thị qua component `src/components/home/Testimonials.astro` trên trang chủ.

## 5. Đội ngũ (`teamMember`)

Trang `gioi-thieu/doi-ngu.astro`, `gioi-thieu/chuyen-gia-zhi-gong.astro` (trang riêng cho 1 chuyên gia cụ thể). Dữ liệu hiện tại: `placeholder-team.ts`.

## 6. Trang giới thiệu tĩnh

`gioi-thieu/ve-cong-ty.astro`, `gioi-thieu/tuyen-dung.astro` — nội dung tĩnh viết trực tiếp trong `.astro`, không qua CMS.

## 7. Cấu hình chung (`siteSettings`)

Schema Sanity đã định nghĩa (hotline, email, địa chỉ, giờ làm việc, mạng xã hội, thông tin chuyển khoản ngân hàng). Hiện tại thông tin tương đương được cấu hình cứng trong `src/lib/site-config.ts` (thông tin công ty, menu điều hướng, footer) — chưa đọc từ Sanity `siteSettings`.

## 8. Trang chủ

`src/pages/index.astro` lắp ghép các component trong `src/components/home/`: `Hero`, `MasterIntro`, `StatsSection`, `FeaturedServices`, `FeaturedProducts`, `FeaturedPosts`, `Testimonials`, `CtaBanner` — tất cả lấy dữ liệu mẫu/tĩnh theo hiện trạng ở trên.

## 9. Trang chính sách & hỗ trợ (tĩnh, không qua CMS)

`chinh-sach/bao-mat.astro`, `dieu-khoan.astro`, `thanh-toan-hoan-tien.astro`, `van-chuyen.astro`, `dat-lich-tu-van.astro`; `cau-hoi-thuong-gap.astro`; `lien-he.astro` (form liên hệ — xem [[08-api-reference]] về `/api/contact/submit`).
