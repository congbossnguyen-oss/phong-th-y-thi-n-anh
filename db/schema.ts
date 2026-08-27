import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// --- Tài khoản & phiên đăng nhập (khu học viên) ---

export const genderEnum = pgEnum("gender", ["Nam", "Nữ"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  isAdmin: boolean("is_admin").notNull().default(false),
  // Khai báo 1 lần lúc đăng ký (hoặc bổ sung sau ở hồ sơ), dùng lại cho MỌI tính năng cần vận
  // trình (Quân Sư luận quẻ, Xem Thời Vận) — không hỏi lại ngày sinh mỗi lần dùng tính năng nữa
  // (Thầy, 2026-08-23). Nullable vì tài khoản có TRƯỚC cột này (và khách đăng ký khóa học) chưa
  // chắc đã khai — các tính năng cần vận trình phải tự kiểm tra đủ 3 trường ngày/tháng/năm rồi mới
  // chạy, thiếu thì bỏ qua lớp vận trình chứ không chặn tính năng chính.
  birthDay: integer("birth_day"),
  birthMonth: integer("birth_month"),
  birthYear: integer("birth_year"),
  birthHour: integer("birth_hour"), // 0-23, luôn tùy chọn — thiếu giờ thì bỏ qua lớp Tử Vi (xem current-luck.ts)
  gender: genderEnum("gender"),
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

export const orderTypeEnum = pgEnum("order_type", ["product", "course", "tool", "subscription"]);

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
  // Mã khuyến mãi khách đã áp cho đơn này (nếu có). Lưu ở đây để LƯỢT MÃ chỉ bị trừ khi đơn thực
  // sự được thanh toán — nếu trừ ngay lúc tạo đơn thì khách xem QR rồi bỏ ngang sẽ đốt mất mã.
  // Việc trừ lượt + ghi Google Sheet nằm trong markOrderPaidAndFulfill().
  promoCodeId: uuid("promo_code_id"),
  promoDiscountAmount: numeric("promo_discount_amount", { precision: 12, scale: 0 }),
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

// --- Gói thuê bao "Quân Sư" (Cơ bản / Cao cấp × 1-3-6-12 tháng) ---
// Khác hẳn `orders` kiểu "tool" (mua-đứt-theo-lượt, khóa theo orderCode, không cần tài khoản):
// subscription BẮT BUỘC có tài khoản (users), quyền truy cập tính theo userId + còn hạn hay không,
// không phải theo orderCode của 1 lần mua. `orderId` chỉ để truy vết đơn hàng đã tạo ra gói này.

export const subscriptionTierEnum = pgEnum("subscription_tier", ["co_ban", "cao_cap"]);
export const subscriptionDurationEnum = pgEnum("subscription_duration", ["1_thang", "3_thang", "6_thang", "1_nam"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: subscriptionTierEnum("tier").notNull(),
  // null khi isTrial=true (dùng thử không có kỳ hạn tháng/giá — xem isTrial bên dưới).
  duration: subscriptionDurationEnum("duration"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  // Dùng thử 7 ngày miễn phí, mỗi tài khoản chỉ 1 lần (xem trial.ts). Khi mua gói thật đè lên gói
  // đang dùng thử, nhánh nâng cấp trong orders.ts phải set lại false.
  isTrial: boolean("is_trial").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  // Đơn hàng đã thanh toán tạo ra gói này (orderType="subscription"). null nếu tạo tay (vd admin gia hạn, dùng thử).
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Chống lạm dụng dùng thử (mức "Vừa"): 1 lượt/thiết bị + ngưỡng IP. Ghi lại mỗi lượt trial đã
// cấp để chặn tạo nhiều tài khoản trên cùng thiết bị/mạng. Xem src/lib/subscriptions/trial.ts. ---
export const trialDevices = pgTable("trial_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Định danh thiết bị bền (cookie httpOnly ngẫu nhiên, ~400 ngày) — xem src/lib/auth/device-id.ts.
  deviceId: text("device_id").notNull(),
  // IP lúc kích hoạt trial (dùng cho ngưỡng IP, nới để tránh chặn nhầm nhà/công ty chung IP).
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Hạn mức lượt hỏi/tháng cho gói thuê bao Quân Sư (mỗi câu = 1 lượt AI thật, không cache được vì
// quẻ luôn khác nhau). Xem src/lib/subscriptions/usage.ts. ---
export const quanSuUsage = pgTable(
  "quan_su_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    // "yyyy-MM" theo giờ Việt Nam (vd "2026-08") — đếm theo THÁNG DƯƠNG LỊCH, không phải 30 ngày kể
    // từ lúc mua, cho dễ hiểu với khách.
    thangNam: text("thang_nam").notNull(),
    soLuotDaDung: integer("so_luot_da_dung").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("quan_su_usage_user_thang_idx").on(t.userId, t.thangNam)],
);

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

// --- Mã khuyến mãi cho công cụ thu phí ---

// Loại giảm giá: miễn phí hoàn toàn (tặng), giảm theo % , hoặc giảm số tiền cố định.
export const promoDiscountTypeEnum = pgEnum("promo_discount_type", ["mien_phi", "phan_tram", "so_tien"]);

export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Mã khách nhập — luôn lưu và so khớp ở dạng CHỮ HOA để khách gõ thường/hoa đều được.
  code: text("code").notNull().unique(),
  discountType: promoDiscountTypeEnum("discount_type").notNull(),
  // phan_tram: 1-100. so_tien: số tiền VNĐ được trừ. mien_phi: bỏ qua cột này.
  discountValue: numeric("discount_value", { precision: 12, scale: 0 }),
  // Giới hạn mã theo 1 công cụ cụ thể (vd "gio-liem-ha-huyet"); null = dùng được cho mọi công cụ.
  toolSlug: text("tool_slug"),
  // Số lượt tối đa. null = không giới hạn. Mã tặng người thân nên đặt 1 để tránh bị chia sẻ lan.
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Ghi lại mã đã dùng cho đơn nào — để đối soát và chống dùng lại khi cần.
export const promoRedemptions = pgTable("promo_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promoCodeId: uuid("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  // Số tiền thực tế được giảm cho đơn này (lưu lại vì mức giảm của mã có thể bị sửa về sau).
  discountAmount: numeric("discount_amount", { precision: 12, scale: 0 }).notNull(),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Đăng ký nhận thông báo đẩy (Web Push) — nhắc mùng Một / ngày Rằm ---

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Endpoint do trình duyệt cấp — định danh DUY NHẤT của một máy/trình duyệt. Rất dài (có thể
  // vài trăm ký tự) nên dùng text, và đặt unique để đăng ký lại trên cùng máy thì ghi đè chứ
  // không nhân bản thành nhiều dòng gửi trùng.
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  // Cho phép cả khách CHƯA đăng nhập bật thông báo (đây là tiện ích giữ chân, không phải tính
  // năng trả phí) — nên nullable. Nếu có đăng nhập thì gắn để sau còn cá nhân hóa được.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  // Đếm số lần gửi thất bại liên tiếp. Trình duyệt trả 404/410 nghĩa là máy đã gỡ đăng ký —
  // khi đó xóa hẳn dòng này để không gửi mãi vào chỗ chết.
  failCount: integer("fail_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
});

// --- Cache lời luận AI của Luận Vận Khí (Quân Sư, trang Xem Thời Vận) ---
//
// Kết quả cho 1 (ngày sinh, Đại Vận) là CỐ ĐỊNH mãi mãi — Can/Chi từng năm Lưu Niên không đổi theo
// "hôm nay". Không cache thì mỗi lần khách mở lại trang lại tốn 1 lượt gọi AI cho cả 10 năm, dù nội
// dung ra y hệt lần trước. Xem src/lib/quan-su/luan-van-khi/index.ts (layLuuNienCache/luuLuuNienCache).
export const vanKhiCache = pgTable(
  "van_khi_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    // Index (0-9) của Đại Vận đã tính — 1 user có thể xem chi tiết nhiều Đại Vận khác nhau qua thời
    // gian (query ?daiVan=N) nên cache theo từng Đại Vận riêng, không phải 1 dòng/user.
    daiVanIndex: integer("dai_van_index").notNull(),
    // Toàn bộ mảng LuuNienKhi[] (10 năm, đã gồm điểm số + lời luận AI) dạng JSON — đọc lại là dùng
    // được ngay, không cần tính toán gì thêm.
    luuNienJson: text("luu_nien_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("van_khi_cache_user_dai_van_idx").on(t.userId, t.daiVanIndex)],
);
