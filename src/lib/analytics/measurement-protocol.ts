// Gửi sự kiện "purchase" lên GA4 từ MÁY CHỦ (đúng lúc xác nhận đã nhận tiền qua webhook SePay),
// vì gtag.js chỉ chạy được trên trình duyệt — không gọi được từ đây. Gắn 1 lần DUY NHẤT ở tầng
// markOrderPaidAndFulfill() thay vì rải ở từng trang .astro: phủ được MỌI luồng thanh toán (web
// thường lẫn app Quân Sư, mọi công cụ, khóa học, gói thuê bao) cùng lúc.
//
// Đánh đổi: không có client_id thật của khách (chỉ máy chủ chạy đoạn này, không có cookie trình
// duyệt) nên dùng id giả theo orderId — báo cáo "Nguồn traffic" của riêng sự kiện purchase này sẽ
// không chính xác (GA coi là khách ẩn danh), nhưng tổng doanh thu/báo cáo Ecommerce vẫn đúng.

const MEASUREMENT_ID = "G-NT8N9LPW74";

export async function trackServerPurchase(opts: {
  orderId: string;
  transactionId: string;
  value: number;
  itemId: string;
  itemName: string;
}) {
  const apiSecret = import.meta.env.GA4_MEASUREMENT_PROTOCOL_API_SECRET;
  if (!apiSecret) return; // chưa cấu hình — bỏ qua êm, không chặn luồng xác nhận đơn

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: `server.${opts.orderId}`,
          events: [
            {
              name: "purchase",
              params: {
                transaction_id: opts.transactionId,
                currency: "VND",
                value: opts.value,
                items: [{ item_id: opts.itemId, item_name: opts.itemName, price: opts.value, quantity: 1 }],
              },
            },
          ],
        }),
      }
    );
  } catch {
    // đo lường là phụ — không được ảnh hưởng tới việc xác nhận đơn / gửi email cho khách
  }
}
