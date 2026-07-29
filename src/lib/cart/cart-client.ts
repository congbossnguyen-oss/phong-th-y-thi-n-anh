// Giỏ hàng phía client (localStorage) — dùng cho BẢN DEMO trước khi có Neon Postgres thật.
// Khi kết nối DB (Giai đoạn 3 đầy đủ), thay bằng API /api/cart/* ghi vào bảng orders/order_items,
// giữ nguyên các hàm addItem/removeItem/updateQty để hạn chế phải sửa UI.

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  qty: number;
}

const STORAGE_KEY = "thien-anh-cart";
const EVENT_NAME = "cart:updated";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addItem(item: Omit<CartItem, "qty">, qty = 1) {
  const items = readCart();
  const existing = items.find((i) => i.slug === item.slug);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ ...item, qty });
  }
  writeCart(items);
}

export function updateQty(slug: string, qty: number) {
  const items = readCart();
  const target = items.find((i) => i.slug === slug);
  if (!target) return;
  if (qty <= 0) {
    writeCart(items.filter((i) => i.slug !== slug));
    return;
  }
  target.qty = qty;
  writeCart(items);
}

export function removeItem(slug: string) {
  writeCart(readCart().filter((i) => i.slug !== slug));
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount(items = readCart()): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function getCartTotal(items = readCart()): number {
  return items.reduce((sum, i) => sum + i.qty * i.price, 0);
}

export const CART_EVENT_NAME = EVENT_NAME;
