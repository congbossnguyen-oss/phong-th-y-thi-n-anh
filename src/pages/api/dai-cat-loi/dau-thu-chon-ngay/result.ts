import type { APIRoute } from "astro";
import { tinhDauThuChonNgay, timNgayDauThuChonNgay, type DauThuChonNgayInput } from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/** Đọc kết quả sau khi đơn đã thanh toán — tính LẠI từ input đã lưu (hàm thuần), không lưu sẵn
 * kết quả. Cùng khuôn `xem-ngay-cao-cap/result.ts`. */

const TOOL_SLUG = "dau-thu-chon-ngay";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Bỏ `chiTiet` (kết quả đầy đủ của TỪNG ngày trong danh sách xếp hạng) — gửi hết sẽ rất nặng. */
function gonNgay(n: Record<string, unknown>) {
  const { chiTiet: _bo, ...gon } = n as { chiTiet?: unknown } & Record<string, unknown>;
  return gon;
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-dau-thu", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  if (!order.toolInputSnapshot) return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);

  try {
    const snap = JSON.parse(order.toolInputSnapshot) as Record<string, unknown>;
    const { cheDo, ...chung } = snap;

    if (cheDo === "tim_ngay") {
      const { tuNgay, denNgay, ...input } = chung as unknown as {
        tuNgay: { nam: number; thang: number; ngay: number };
        denNgay: { nam: number; thang: number; ngay: number };
      } & DauThuChonNgayInput;
      const kq = timNgayDauThuChonNgay({ ...(input as DauThuChonNgayInput), tuNgay, denNgay, soKetQua: 10 });
      return jsonResponse(
        {
          ok: true,
          status: "confirmed",
          cheDo,
          tongSoNgayQuet: kq.tongSoNgayQuet,
          thongKe: kq.thongKe,
          ketQua: kq.ketQua.map((n) => gonNgay(n as unknown as Record<string, unknown>)),
        },
        200,
      );
    }

    const result = tinhDauThuChonNgay(chung as unknown as DauThuChonNgayInput);
    return jsonResponse({ ok: true, status: "confirmed", cheDo: "giam_dinh", result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
