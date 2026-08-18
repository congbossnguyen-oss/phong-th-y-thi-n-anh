# Module: Khóa học trực tuyến (LMS)

> Sanity: `course`, `lesson`. Postgres: `course_enrollments`, `lesson_progress`, `course_certificates`, `orders` (order_type=`course`) — xem [[01-kien-truc-du-lieu]]. Code: `src/lib/cms/queries.ts`, `src/lib/video/bunnyStream.ts`, `src/lib/certificate/`, `src/pages/khoa-hoc/*`, `src/pages/hoc-vien/*`, `src/pages/api/courses/*`, `src/pages/api/certificates/*`.

## 1. Danh mục khóa học

8 category cố định, thứ tự hiển thị theo `COURSE_CATEGORY_ORDER` (`src/lib/cms/queries.ts`): **Bát tự, Bát trạch, Huyền không phi tinh, Trạch nhật, Huyền không lục pháp, Kỳ môn, Tử vi, Kinh dịch**.

Mỗi khóa có `format`: `online` (video trên web) hoặc `offline` (Zoom/trực tiếp).

Trang: `khoa-hoc/index.astro` (danh sách, nhóm theo category qua `groupCoursesByCategory()`), `khoa-hoc/[slug].astro` (chi tiết khóa), `khoa-hoc/[slug]/thanh-toan.astro` (thanh toán khóa học).

> Đây là module **duy nhất đã tích hợp Sanity thật sự** trong app (qua `src/lib/cms/queries.ts`) — khác với sản phẩm/dịch vụ/blog vẫn dùng placeholder data.

## 2. Mua khóa học (`POST /api/courses/checkout`)

Yêu cầu đăng nhập (xem [[02-module-tai-khoan]]).

Input: `{courseSlug, phone}`.

Luồng (`createCourseOrder()` trong `src/lib/db/orders.ts`):
1. Nếu user đã có đơn `pending_payment` cho cùng khóa học → **tái sử dụng đơn cũ** thay vì tạo đơn trùng.
2. Ngược lại tạo `orders` mới với `order_type = course`, `course_ref = courseSlug`.
3. Sinh QR SePay, trả về `{ok, orderId, orderCode, totalAmount, qrUrl}`.

Sau khi thanh toán được xác nhận qua webhook (xem [[05-module-thanh-toan]]), `markOrderPaidAndFulfill()` tự động tạo bản ghi `course_enrollments` với `source = online_purchase`.

### Ghi danh offline
`course_enrollments.source = offline_registration` — dành cho học viên đăng ký ngoài luồng thanh toán online (nhập tay bởi admin/nhân viên, dùng `contact_name`/`contact_phone` nếu học viên chưa có tài khoản). Không thấy trang/API công khai nào tạo loại ghi danh này trong `src/pages` — có thể được thao tác trực tiếp qua `db:studio` (Drizzle Studio) hoặc công cụ nội bộ chưa xây dựng.

## 3. Khu vực học viên (`/hoc-vien`)

- `hoc-vien/index.astro` — trang chủ học viên (danh sách khóa đã ghi danh).
- `hoc-vien/dang-nhap.astro`, `dang-ky.astro` — xem [[02-module-tai-khoan]].
- `hoc-vien/khoa-hoc/[slug]/index.astro` — tổng quan 1 khóa đã ghi danh (danh sách bài học, tiến độ).
- `hoc-vien/khoa-hoc/[slug]/bai-hoc/[lessonSlug].astro` — trang xem video bài học.

Mọi trang trong khu vực này phải kiểm tra: (a) đã đăng nhập, (b) đã ghi danh khóa học tương ứng (trừ bài học đánh dấu `isFreePreview = true` trong Sanity — có thể xem không cần ghi danh).

## 4. Phát video — Bunny Stream

`src/lib/video/bunnyStream.ts` — `getSignedEmbedUrl(videoId)`:
- Sinh URL nhúng iframe có **chữ ký SHA-256**, **hết hạn sau 2 giờ**.
- **Việc kiểm tra quyền xem (đăng nhập + đã ghi danh) là trách nhiệm của trang gọi hàm này** — bản thân hàm không tự kiểm tra, chỉ ký URL.

`src/components/courses/VideoWatermark.astro` — hiển thị lớp watermark định danh người xem đè lên video player, biện pháp chống chia sẻ/quay lại trái phép.

## 5. Theo dõi tiến độ (`POST /api/courses/progress`)

Yêu cầu đăng nhập + đã ghi danh khóa học.

Input: `{courseRef, lessonRef}`.

Luồng:
1. Insert (idempotent) vào `lesson_progress` — đánh dấu bài học hoàn thành.
2. Gọi `issueCertificateIfCourseCompleted()` — kiểm tra nếu **toàn bộ** bài học trong khóa đã hoàn thành thì tự động cấp chứng chỉ.
3. Trả `{ok, certificateIssued}`.

## 6. Chứng chỉ hoàn thành

`src/lib/db/certificates.ts` — `issueCertificateIfCourseCompleted()`:
- Idempotent: nếu chứng chỉ đã tồn tại cho user+course thì không tạo lại.
- Khi đủ điều kiện: tạo bản ghi `course_certificates` (mã `certificate_code` định dạng `THA-CERT-XXXXXX`), sinh PDF, gửi email đính kèm PDF (`sendCourseCertificateEmail`).

`src/lib/certificate/generate.ts` — `generateCertificatePdf()`: PDF khổ A4 ngang, dùng `pdf-lib` + `@pdf-lib/fontkit`, nhúng font Be Vietnam Pro (Regular/SemiBold/Bold/Italic, mã hóa base64 trong `src/lib/certificate/fonts/`) để hiển thị đúng dấu tiếng Việt.

`GET /api/certificates/[courseRef].pdf` — tải lại PDF chứng chỉ theo yêu cầu (sinh lại on-the-fly, không lưu file tĩnh):
- 401 nếu chưa đăng nhập
- 404 nếu không tìm thấy khóa học
- 403 nếu chưa đủ điều kiện cấp chứng chỉ (chưa hoàn thành khóa)

## 7. Sơ đồ luồng tổng quát

```
Chọn khóa học → (đăng nhập nếu chưa) → checkout → quét QR SePay
   → webhook xác nhận thanh toán → tạo course_enrollments
   → học viên xem bài học (Bunny Stream, có watermark)
   → đánh dấu hoàn thành từng bài → lesson_progress
   → hoàn thành hết bài học → tự động cấp course_certificates + email PDF
   → học viên có thể tải lại PDF bất kỳ lúc nào qua /api/certificates/[courseRef].pdf
```
