# Kiến trúc dữ liệu

> Xem nguyên tắc polyglot persistence ở [[00-tong-quan]]. Tài liệu này liệt kê đầy đủ schema Sanity (nội dung) và schema Postgres (giao dịch/người dùng).

## 1. Sanity CMS — 9 loại tài liệu (document types)

Nguồn: `studio/schemaTypes/*.ts`, đăng ký tại `studio/schemaTypes/index.ts`. Desk structure (`studio/deskStructure.ts`) nhóm theo: *Cấu hình chung*, *Dịch vụ & Đội ngũ*, *Cửa hàng*, *Khóa học*, *Kiến thức*, *Công trình & Đánh giá*.

Ghi chú: `*` = trường bắt buộc.

### `siteSettings` (singleton)
Cấu hình chung toàn site.

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `hotline` | string | |
| `email` | string | |
| `address` | string | |
| `workingHours` | string | |
| `businessRegistration` | string | Mã số ĐKKD |
| `social` | object | `facebook`, `youtube`, `tiktok`, `zalo` (url) |
| `bankTransfer` | object | `bankName`, `accountNumber`, `accountHolder`, `qrImage` |

### `teamMember`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name`* | string | |
| `role` | string | Chức danh |
| `bio` | text | |
| `photo` | image (hotspot) | |
| `order` | number | Thứ tự hiển thị, sort asc |

### `service`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name`* | string | |
| `slug`* | slug | Sinh từ `name` |
| `summary` | text | |
| `description` | portable text (blocks) | |
| `priceFrom` | string | VD: `"3.000.000đ"` — chuỗi tự do, không phải số |
| `coverImage` | image (hotspot) | |
| `order` | number | |

### `product`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name`* | string | |
| `slug`* | slug | Sinh từ `name` |
| `category`* | string (enum list) | `cong-danh-su-nghiep`, `hoa-sat-tran-trach`, `hoa-giai-van-han`, `chieu-tai-kich-loc` |
| `price`* | number | Dương, đơn vị VNĐ |
| `images` | array\<image (hotspot)\> | |
| `description` | portable text (blocks) | |
| `inStock` | boolean | default `true` |
| `featured` | boolean | default `false` |

### `blogPost`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `title`* | string | |
| `slug`* | slug | Sinh từ `title` |
| `category` | string (enum list) | `kien-thuc-ung-dung`, `nha-o`, `van-phong-kinh-doanh`, `vat-pham` |
| `excerpt` | text | Tối đa 200 ký tự |
| `coverImage` | image (hotspot) | |
| `body` | portable text (blocks + ảnh inline) | |
| `publishedAt` | datetime | default now |

Sắp xếp mặc định trong desk: `publishedDesc`.

### `portfolioItem`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `title`* | string | |
| `slug`* | slug | Sinh từ `title` |
| `location` | string | |
| `coverImage` | image (hotspot) | |
| `gallery` | array\<image\> | |
| `body` | portable text (blocks) | |
| `completedAt` | date | |

### `testimonial`
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name`* | string | |
| `role` | string | |
| `quote`* | text | |
| `rating`* | number | 1–5, default 5 |
| `avatar` | image | |
| `featured` | boolean | default `false` |

### `course` — **đã tích hợp vào app** (`src/lib/cms/queries.ts`)
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name`* | string | |
| `slug`* | slug | Sinh từ `name`. **Đây là giá trị dùng làm `course_ref` trong Postgres**, không phải `_id` |
| `category`* | string (enum list) | Phải khớp chính xác `COURSE_CATEGORY_ORDER` trong `src/lib/cms/queries.ts`: Bát tự, Bát trạch, Huyền không phi tinh, Trạch nhật, Huyền không lục pháp, Kỳ môn, Tử vi, Kinh dịch |
| `format`* | string (enum) | `online` ("Học online — video trên web") hoặc `offline` ("Offline / Zoom") |
| `order` | number | default 0, thứ tự cơ bản→nâng cao trong cùng category |
| `summary` | text | |
| `description` | portable text (blocks) | |
| `price`* | number | min 0, VNĐ |
| `coverImage` | image (hotspot) | |

### `lesson` — **đã tích hợp vào app**
| Trường | Kiểu | Ghi chú |
|---|---|---|
| `title`* | string | |
| `slug`* | slug | Sinh từ `title` |
| `course`* | reference → `course` | |
| `order`* | number | Thứ tự bài học trong khóa |
| `bunnyVideoId` | string | GUID video trên Bunny Stream, dùng bởi `src/lib/video/bunnyStream.ts` |
| `durationSeconds` | number | |
| `isFreePreview` | boolean | default `false` — cho xem không cần ghi danh |
| `description` | text | |

## 2. Neon Postgres (Drizzle ORM) — `db/schema.ts`

Dialect: PostgreSQL. Client: `src/lib/db/client.ts` (proxy lazy-load `DATABASE_URL`, tránh crash trang không dùng DB). Migration: `db/migrations/` (`drizzle-kit`).

### Enum

| Enum | Giá trị |
|---|---|
| `order_status` | `pending_payment`, `confirmed`, `shipped`, `cancelled` |
| `payment_method` | `bank_transfer`, `cod`, `sepay_qr` |
| `order_type` | `product`, `course` |
| `enrollment_source` | `online_purchase`, `offline_registration` |

### Bảng

#### `users`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | random default |
| `email` | text | unique, not null |
| `password_hash` | text | scrypt, xem [[02-module-tai-khoan]] |
| `name` | text | not null |
| `phone` | text | nullable |
| `is_admin` | boolean | default false |
| `created_at` | timestamptz | default now |

#### `sessions`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | text PK | **SHA-256 hash của token thô** — token thô chỉ tồn tại trong cookie phía client |
| `user_id` | uuid → `users.id` | cascade delete |
| `expires_at` | timestamptz | not null, 30 ngày kể từ khi tạo |
| `ip_address` | text | Session gắn với IP tạo ra nó — IP khác sẽ vô hiệu session |

#### `orders` — dùng chung cho cả đơn sản phẩm và đơn khóa học
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → `users.id` | nullable, `set null` khi xóa user — null = khách mua không đăng nhập (chỉ áp dụng đơn sản phẩm) |
| `order_type` | enum `order_type` | default `product` |
| `status` | enum `order_status` | default `pending_payment` |
| `payment_method` | enum `payment_method` | not null |
| `customer_name`, `customer_phone` | text | not null |
| `customer_email` | text | nullable |
| `shipping_address` | text | nullable — bắt buộc với đơn sản phẩm, null với đơn khóa học |
| `note` | text | nullable |
| `total_amount` | numeric(12,0) | not null |
| `course_ref` | text | nullable — slug khóa học Sanity, 1 đơn = 1 khóa học |
| `order_code` | text | unique, not null — mã ngắn nhúng trong nội dung chuyển khoản, dùng đối soát webhook SePay |
| `paid_at` | timestamptz | nullable |
| `created_at` | timestamptz | default now |

#### `order_items`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid → `orders.id` | cascade delete |
| `product_ref` | text | not null — **`_id` tài liệu Sanity, không phải FK SQL** |
| `product_name_snapshot` | text | not null — chụp lại tên SP tại thời điểm mua |
| `unit_price_snapshot` | numeric(12,0) | not null — chụp lại giá tại thời điểm mua |
| `quantity` | integer | not null |

#### `course_enrollments`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → `users.id` | cascade delete, nullable |
| `course_ref` | text | not null — slug khóa học Sanity |
| `source` | enum `enrollment_source` | not null |
| `order_id` | uuid → `orders.id` | `set null` khi xóa — đơn đã thanh toán tạo ra ghi danh này (mua online); null nếu ghi danh offline |
| `contact_name`, `contact_phone` | text | nullable — dùng khi học viên offline chưa có tài khoản |
| `enrolled_at` | timestamptz | default now |

#### `lesson_progress`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → `users.id` | cascade delete, not null |
| `course_ref` | text | not null |
| `lesson_ref` | text | not null |
| `completed_at` | timestamptz | nullable |

#### `sepay_webhook_logs` — log chống trùng webhook
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | text PK | **transaction id từ SePay** — unique constraint chặn xử lý trùng khi webhook retry (SePay retry tối đa 7 lần trong 5 giờ) |
| `order_id` | uuid → `orders.id` | `set null` khi xóa |
| `transfer_amount` | numeric(12,0) | not null |
| `content` | text | not null — nội dung chuyển khoản, dùng trích mã đơn |
| `received_at` | timestamptz | default now |

#### `course_certificates`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → `users.id` | cascade delete, not null |
| `course_ref` | text | not null |
| `certificate_code` | text | unique, not null — định dạng `THA-CERT-XXXXXX`, in trên PDF, dùng tra cứu công khai |
| `issued_at` | timestamptz | default now |

### Sơ đồ quan hệ (rút gọn)

```
users ──< sessions
users ──< orders (nullable, khách vãng lai)
orders ──< order_items
users ──< course_enrollments >── orders (nullable)
users ──< lesson_progress
orders ──< sepay_webhook_logs (nullable)
users ──< course_certificates
```

Sanity `product` / `course` / `lesson` được tham chiếu **chỉ bằng chuỗi** (`product_ref`, `course_ref`, `lesson_ref`) từ các bảng trên — không có ràng buộc khóa ngoại giữa hai hệ thống.
