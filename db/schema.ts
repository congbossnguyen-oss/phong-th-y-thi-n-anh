import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- Tài khoản & phiên đăng nhập (khu học viên) ---

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  // id lưu dạng SHA-256 hash của token thô — token thô chỉ nằm trong cookie phía client.
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  // IP lúc tạo phiên — nếu request sau đó đến từ IP khác, phiên bị hủy ngay (chống dùng chung
  // cookie đăng nhập từ nhiều nơi cùng lúc, bổ sung cho chính sách "1 thiết bị/lúc").
  ipAddress: text("ip_address"),
});

// --- Đơn hàng (vật phẩm phong thủy hoặc khóa học online) ---

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "confirmed",
  "shipped",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["bank_transfer", "cod", "sepay_qr"]);

export const orderTypeEnum = pgEnum("order_type", ["product", "course", "tool"]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // null = khách mua không tài khoản
  orderType: orderTypeEnum("order_type").notNull().default("product"),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  // Bắt buộc với đơn vật phẩm (giao hàng), null với đơn khóa học/công cụ.
  shippingAddress: text("shipping_address"),
  note: text("note"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 0 }).notNull(),
  // Đơn khóa học: courseRef trỏ tới khóa học duy nhất được mua (mỗi đơn = 1 khóa).
  courseRef: text("course_ref"),
  // Đơn công cụ trả phí (vd "gio-liem-ha-huyet"): định danh công cụ + input đã nộp, lưu dạng
  // JSON string — sau khi thanh toán xong, kết quả được TÍNH LẠI từ input này (không lưu sẵn kết
  // quả) vì hàm tính là thuần/deterministic và rẻ, tránh lệch dữ liệu nếu công thức được sửa sau.
  toolSlug: text("tool_slug"),
  toolInputSnapshot: text("tool_input_snapshot"),
  // Mã đơn hàng ngắn, duy nhất — nhúng vào nội dung chuyển khoản QR để đối soát với webhook SePay.
  // Với đơn công cụ (không cần tài khoản), orderCode còn đóng vai trò "vé" truy cập kết quả.
  orderCode: text("order_code").notNull().unique(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  // productRef = Sanity document _id — KHÔNG dùng khóa ngoại SQL vì sản phẩm sống trong Sanity, không trong Postgres.
  productRef: text("product_ref").notNull(),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 12, scale: 0 }).notNull(),
  quantity: integer("quantity").notNull(),
});

// --- Khóa học: đăng ký & tiến độ học ---

export const enrollmentSourceEnum = pgEnum("enrollment_source", [
  "online_purchase",
  "offline_registration",
]);

export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  courseRef: text("course_ref").notNull(), // Sanity `course` document _id
  source: enrollmentSourceEnum("source").notNull(),
  // Đơn hàng đã thanh toán tạo ra lượt đăng ký này (mua online qua SePay) — null với offline.
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  // Với đăng ký offline: học viên có thể chưa có tài khoản, lưu thông tin liên hệ trực tiếp.
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseRef: text("course_ref").notNull(), // Sanity `course` document _id
  lessonRef: text("lesson_ref").notNull(), // Sanity `lesson` document _id
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// --- Thanh toán SePay ---

// Log mọi webhook SePay đã xử lý — id là ID giao dịch phía SePay, ràng buộc UNIQUE để
// chống xử lý trùng khi SePay gửi lại webhook (retry tối đa 7 lần trong 5 giờ nếu lỗi).
export const sepayWebhookLogs = pgTable("sepay_webhook_logs", {
  id: text("id").primaryKey(), // SePay transaction "id" (webhook payload)
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  transferAmount: numeric("transfer_amount", { precision: 12, scale: 0 }).notNull(),
  content: text("content").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Yêu cầu đặt lịch tư vấn (form /lien-he) ---

export const consultationRequests = pgTable("consultation_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  topic: text("topic"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Chứng chỉ hoàn thành khóa học ---

export const courseCertificates = pgTable("course_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseRef: text("course_ref").notNull(),
  // Mã tra cứu/xác thực chứng chỉ công khai, in trên PDF (vd THA-XXXXXXXX).
  certificateCode: text("certificate_code").notNull().unique(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});
