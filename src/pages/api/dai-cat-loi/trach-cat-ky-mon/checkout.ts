import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { trachCat } from "../../../../lib/kymon/trachCat";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Trạch Cát Kỳ Môn — chọn ngày giờ tốt theo bàn Kỳ Môn Mệnh của chính chủ sự.
 *
 * ✅ ĐÃ MỞ BÁN cho khách từ 26/8/2026 (anh Công duyệt). Tài khoản quản trị vẫn được taoDonCongCu
 * tạo đơn ở mức 0đ + tự xác nhận để test trọn luồng — xem cờ `laQuanTri` bên dưới.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-trach-cat-ky-mon", max: 10, windowMs: 60_000 });
  if (limited) return limited;

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

  // "Tính thử" trước khi tạo đơn — nếu lá bàn không lập được hoặc khoảng ngày không ra kết quả
  // nào thì báo ngay, tuyệt đối không thu tiền rồi mới phát hiện không trả được hàng.
  try {
    const thu = await trachCat({ ...doc.input, viecId: doc.input.viecId });
    if (!thu.hopLe) return jsonResponse({ ok: false, error: thu.loi ?? "Không tính được kết quả." }, 400);
    if ((thu.danhSachNgay?.length ?? 0) === 0) {
      // Dùng đúng cảnh báo engine sinh ra — nó đã phân biệt "nới rộng khoảng ngày sẽ ra" với
      // "không địa chi nào qua được, nới rộng cũng vô ích".
      const lyDo = (thu.canhBao ?? []).at(-1);
      return jsonResponse(
        {
          ok: false,
          error: lyDo ?? "Trong khoảng ngày này không có ngày nào qua được bộ lọc Kỳ Môn cho việc đã chọn.",
        },
        400,
      );
    }
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả với dữ liệu này." },
      400,
    );
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
    return jsonResponse(
      { ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") },
      400,
    );
  }
};
