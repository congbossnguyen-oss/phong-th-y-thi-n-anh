import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { lapLaBan } from "../../../../lib/kymon";
import { luanGiaiMenh } from "../../../../lib/kymon/luanGiaiMenh";

export const prerender = false;

/**
 * Tạo đơn cho module Luận Giải Kỳ Môn Mệnh chi tiết (299.000đ). KHÔNG bắt đăng nhập — kết quả
 * truy cập bằng orderCode làm "vé", giống các module VIP khác.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-ky-mon-menh-chi-tiet", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  // GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ (module mới, chưa mở bán) — chỉ tài khoản quản trị được tạo đơn.
  // Chặn ở server, không chỉ ẩn nút ở UI. Xóa khối này khi Công duyệt mở bán thật.
  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Dịch vụ đang trong giai đoạn thử nghiệm nội bộ, chưa mở bán." }, 403);
  }

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  const b = (body ?? {}) as Record<string, unknown>;
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ." }, 400);
  }
  if (!customerEmail) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập email để nhận bảng luận giải chi tiết." }, 400);
  }

  // "Tính thử" trước khi tạo đơn (thuần công thức, gần như tức thì) — chặn dữ liệu không lập
  // được Mệnh Cung (vd chế độ không có tứ trụ hợp lệ) trước khi thu tiền.
  const { nam, thang, ngay, gio, phut } = doc.input;
  let laBan;
  try {
    laBan = await lapLaBan({ cheDo: "menh", nam, thang, ngay, gio, phut });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được lá bàn với dữ liệu này." }, 400);
  }
  if (!luanGiaiMenh(laBan).hopLe) {
    return jsonResponse({ ok: false, error: "Không xác định được Mệnh Cung với ngày giờ sinh này." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      laQuanTri: locals.user?.isAdmin === true,
      toolInput: doc.input,
      userId: locals.user?.id ?? null,
      customerName,
      customerPhone,
      customerEmail,
      maKhuyenMai: typeof b.maKhuyenMai === "string" ? b.maKhuyenMai : "",
    });
    return jsonResponse(kq, kq.ok ? 200 : 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
