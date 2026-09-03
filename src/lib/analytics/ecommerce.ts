// Gửi sự kiện thương mại điện tử chuẩn GA4 lên gtag đã nạp sẵn ở BaseLayout.astro.
// An toàn khi gtag chưa kịp tải (ví dụ bị chặn quảng cáo) — chỉ bỏ qua, không lỗi.

type GtagItem = { item_id: string; item_name: string; price: number; quantity?: number; item_category?: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function send(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  // Không để lỗi đo lường (nếu có) làm hỏng luồng nghiệp vụ đang chạy sau nó.
  try {
    window.gtag("event", eventName, { currency: "VND", ...params });
  } catch {
    // bỏ qua — đo lường là phụ, không được chặn trải nghiệm khách
  }
}

export function trackAddToCart(item: GtagItem) {
  send("add_to_cart", { value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackBeginCheckout(items: GtagItem[], value: number) {
  send("begin_checkout", { value, items });
}

// Vật phẩm: gửi yêu cầu tư vấn — CHƯA có tiền chuyển (giá chốt sau khi tư vấn), nên KHÔNG
// tính là purchase. generate_lead là sự kiện chuẩn GA4 cho "khách để lại thông tin liên hệ".
export function trackGenerateLead(items: GtagItem[]) {
  send("generate_lead", { items });
}

// Chỉ gọi đúng lúc xác nhận ĐÃ NHẬN THANH TOÁN QUA SEPAY (webhook đã xác nhận ở máy chủ) —
// đây là số liệu doanh thu thật hiển thị trong Google Analytics.
export function trackPurchase(opts: { transactionId: string; value: number; items: GtagItem[] }) {
  send("purchase", { transaction_id: opts.transactionId, value: opts.value, items: opts.items });
}
