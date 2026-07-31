import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { orders, orderItems, courseEnrollments } from "../../../db/schema";
import { generateOrderCode } from "../payments/sepay";
import { products } from "../placeholder-data";
import { courses } from "../placeholder-courses";
import { sendProductOrderConfirmedEmail, sendCourseOrderConfirmedEmail } from "../email/send";

export interface CartLine {
  slug: string;
  qty: number;
}

/**
 * Tạo đơn hàng vật phẩm — giá luôn lấy từ nguồn dữ liệu server (placeholder-data, sau này là
 * Sanity), KHÔNG bao giờ tin giá client gửi lên, để tránh khách hàng sửa giá qua devtools.
 */
export async function createProductOrder(params: {
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  note: string | null;
  paymentMethod: "sepay_qr" | "cod";
  lines: CartLine[];
}) {
  const resolvedLines = params.lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      if (!product || line.qty < 1) return null;
      return { product, qty: line.qty };
    })
    .filter((l): l is { product: (typeof products)[number]; qty: number } => l !== null);

  if (resolvedLines.length === 0) {
    throw new Error("Giỏ hàng không hợp lệ hoặc trống.");
  }

  const totalAmount = resolvedLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "product",
      status: "pending_payment",
      paymentMethod: params.paymentMethod,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      shippingAddress: params.shippingAddress,
      note: params.note,
      totalAmount: String(totalAmount),
      orderCode,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  await db.insert(orderItems).values(
    resolvedLines.map((l) => ({
      orderId: order.id,
      productRef: l.product.slug,
      productNameSnapshot: l.product.name,
      unitPriceSnapshot: String(l.product.price),
      quantity: l.qty,
    }))
  );

  return { orderId: order.id, orderCode: order.orderCode, totalAmount };
}

/**
 * Tạo đơn hàng khóa học online — mỗi đơn ứng với đúng 1 khóa học, bắt buộc đăng nhập.
 */
export async function createCourseOrder(params: {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  courseSlug: string;
}) {
  const course = courses.find((c) => c.slug === params.courseSlug && c.format === "online");
  if (!course) {
    throw new Error("Khóa học không hợp lệ.");
  }

  // Tránh tạo đơn trùng nếu học viên tải lại trang thanh toán nhiều lần — tái sử dụng
  // đơn "đang chờ thanh toán" gần nhất cho cùng học viên + khóa học nếu có.
  const [pending] = await db
    .select({ id: orders.id, orderCode: orders.orderCode, totalAmount: orders.totalAmount })
    .from(orders)
    .where(
      and(
        eq(orders.userId, params.userId),
        eq(orders.courseRef, course.slug),
        eq(orders.status, "pending_payment"),
        eq(orders.orderType, "course")
      )
    )
    .limit(1);

  if (pending) {
    return { orderId: pending.id, orderCode: pending.orderCode, totalAmount: Number(pending.totalAmount) };
  }

  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "course",
      status: "pending_payment",
      paymentMethod: "sepay_qr",
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      courseRef: course.slug,
      totalAmount: String(course.price),
      orderCode,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  return { orderId: order.id, orderCode: order.orderCode, totalAmount: course.price };
}

/**
 * Đánh dấu đơn hàng đã thanh toán (gọi từ webhook SePay sau khi đối soát số tiền khớp) —
 * với đơn khóa học, tự động tạo lượt đăng ký (course_enrollments) và gửi email xác nhận.
 */
export async function markOrderPaidAndFulfill(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status === "confirmed") return;

  await db.update(orders).set({ status: "confirmed", paidAt: new Date() }).where(eq(orders.id, orderId));

  if (order.orderType === "course" && order.courseRef && order.userId) {
    await db.insert(courseEnrollments).values({
      userId: order.userId,
      courseRef: order.courseRef,
      source: "online_purchase",
      orderId: order.id,
    });

    const course = courses.find((c) => c.slug === order.courseRef);
    if (course && order.customerEmail) {
      await sendCourseOrderConfirmedEmail({
        to: order.customerEmail,
        orderCode: order.orderCode,
        customerName: order.customerName,
        courseName: course.name,
        courseSlug: course.slug,
        totalAmount: Number(order.totalAmount),
      });
    }
    return;
  }

  if (order.orderType === "product" && order.customerEmail) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    await sendProductOrderConfirmedEmail({
      to: order.customerEmail,
      orderCode: order.orderCode,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      items: items.map((i) => ({ name: i.productNameSnapshot, qty: i.quantity, price: Number(i.unitPriceSnapshot) })),
      shippingAddress: order.shippingAddress ?? "",
    });
  }
}

export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}
