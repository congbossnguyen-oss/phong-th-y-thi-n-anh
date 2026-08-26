import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { trachCat } from "../../../../lib/kymon/trachCat";

export const prerender = false;

/**
 * Tạo đơn cho module Trạch Cát Kỳ Môn — chọn ngày giờ tốt theo bàn Kỳ Môn Mệnh của chính chủ sự.
 *
 * ⏸️ GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ: engine đã dựng lại đúng ví dụ mẫu trong nguồn, nhưng phần định
 * giá và câu chữ tư vấn còn cần Công duyệt trước khi mở bán. Vì vậy chặn ở server y hệt các module
 * mới khác: chỉ tài khoản quản trị được tạo đơn. Gỡ khối chặn này khi Công đã chốt.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-trach-cat-ky-mon", max: 10, windowMs: 60_000 });
  if (limited) return limited;

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

  // "Tính thử" trước khi tạo đơn — nếu lá bàn không lập được hoặc khoảng ngày không ra kết quả
  // nào thì báo ngay, tuyệt đối không thu tiền rồi mới phát hiện không trả được hàng.
  try {
    const thu = await trachCat({ ...doc.input, viecId: doc.input.viecId });
    if (!thu.hopLe) return jsonResponse({ ok: false, error: thu.loi ?? "Không tính được kết quả." }, 400);
    if ((thu.danhSachNgay?.length ?? 0) === 0) {
      return jsonResponse(
        {
          ok: false,
          error:
            "Trong khoảng ngày này không có ngày nào qua được bộ lọc Kỳ Môn cho việc đã chọn. Vui lòng nới rộng khoảng ngày rồi thử lại.",
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
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
