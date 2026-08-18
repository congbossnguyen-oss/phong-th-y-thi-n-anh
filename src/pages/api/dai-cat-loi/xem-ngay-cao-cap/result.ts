import type { APIRoute } from "astro";
import {
  calculateXemNgayCaoCap,
  timNgayXemNgayCaoCap,
  timThangTrongNam,
  type XemNgayCaoCapInput,
} from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * Đọc kết quả sau khi đơn đã thanh toán. Kết quả được TÍNH LẠI từ input đã lưu (không lưu sẵn kết
 * quả) vì hàm tính là thuần/deterministic — tránh lệch dữ liệu nếu công thức được sửa sau.
 *
 * Cùng một đơn phục vụ cả 3 chế độ; `cheDo` nằm trong snapshot quyết định gọi hàm nào.
 *
 * ⚠️ Chế độ tìm tháng quét ~365 ngày, mất 20-30 giây mỗi lượt. Phía trình duyệt PHẢI chặn không
 * cho 2 lượt hỏi chồng nhau (xem biến `dangHoi` trong trang .astro), nếu không mỗi nhịp 3 giây lại
 * châm thêm một lượt quét cả năm và làm nghẽn máy chủ.
 */

const TOOL_SLUG = "xem-ngay-cao-cap";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Bỏ `chiTiet` (toàn bộ kết quả giám định của TỪNG ngày) — gửi hết sẽ rất nặng. */
function gonNgay(n: Record<string, unknown>) {
  const { chiTiet: _bo, ...gon } = n as { chiTiet?: unknown } & Record<string, unknown>;
  return gon;
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-xncc", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);
  }

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  // ⚠️ CỐ Ý KHÔNG kiểm tra chính chủ: module này không bắt đăng nhập nữa (chủ dự án chốt
  // 2026-08-16), orderCode chính là "vé" — 8 ký tự ngẫu nhiên từ bộ 32 ký tự. Ràng buộc tài khoản
  // ở đây từng làm khách mất kết quả đã trả tiền mỗi khi phiên đăng nhập bị hủy vì đổi IP.

  if (order.status === "cancelled") {
    return jsonResponse({ ok: true, status: "cancelled" }, 200);
  }
  if (order.status !== "confirmed") {
    return jsonResponse({ ok: true, status: "pending" }, 200);
  }

  if (!order.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);
  }

  try {
    const snap = JSON.parse(order.toolInputSnapshot) as Record<string, unknown>;
    const { cheDo, ...chung } = snap;

    if (cheDo === "tim_thang") {
      const { namDuongLich, ...input } = chung as { namDuongLich: number } & XemNgayCaoCapInput;
      const thang = timThangTrongNam({ ...(input as XemNgayCaoCapInput), namDuongLich });
      return jsonResponse(
        {
          ok: true,
          status: "confirmed",
          cheDo,
          namDuongLich,
          thang: thang.map((t) => ({
            ...t,
            ngayTotNhat: t.ngayTotNhat ? gonNgay(t.ngayTotNhat as unknown as Record<string, unknown>) : null,
          })),
        },
        200,
      );
    }

    if (cheDo === "tim_ngay") {
      const { tuNgay, denNgay, ...input } = chung as {
        tuNgay: { nam: number; thang: number; ngay: number };
        denNgay: { nam: number; thang: number; ngay: number };
      } & XemNgayCaoCapInput;
      const kq = timNgayXemNgayCaoCap({ ...(input as XemNgayCaoCapInput), tuNgay, denNgay, soKetQua: 10 });
      return jsonResponse(
        {
          ok: true,
          status: "confirmed",
          cheDo,
          tongSoNgayQuet: kq.tongSoNgayQuet,
          soNgayDung: kq.soNgayDung,
          lyDoLoaiPhoBien: kq.lyDoLoaiPhoBien,
          ketQua: kq.ketQua.map((n) => gonNgay(n as unknown as Record<string, unknown>)),
        },
        200,
      );
    }

    const result = calculateXemNgayCaoCap(chung as unknown as XemNgayCaoCapInput);
    return jsonResponse({ ok: true, status: "confirmed", cheDo: "giam_dinh", result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
