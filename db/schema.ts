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

// --- Đơn hàng vật phẩm phong thủy (thanh toán thủ công) ---

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "confirmed",
  "shipped",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["bank_transfer", "cod"]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // null = khách mua không tài khoản
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  note: text("note"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 0 }).notNull(),
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
