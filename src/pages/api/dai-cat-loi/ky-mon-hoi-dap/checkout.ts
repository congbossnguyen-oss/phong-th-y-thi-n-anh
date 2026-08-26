import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { lapLaBan } from "../../../../lib/kymon";
import { luanHoiDap } from "../../../../lib/kymon/hoiDap";

export const prerender = false;

/**
 * Tạo đơn cho module Hỏi Đáp Kỳ Môn — 199.000đ/lượt hỏi (chế độ Thời Gian/Bốc Độn). KHÔNG bắt
 * đăng nhập — kết quả truy cập bằng orderCode làm "vé", giống các module VIP khác.
 *
 * ✅ ĐÃ MỞ BÁN cho khách từ 26/8/2026 (anh Công duyệt). Điều kiện tiên quyết đã đạt: 10/10 chủ đề
 * đều có luật luận giải thật (xem LUAN_THEO_CHU_DE trong result.ts) nên khách trả tiền là có câu
 * trả lời ngay. Tài khoản quản trị vẫn được tạo đơn 0đ + tự xác nhận để test — xem cờ `laQuanTri`.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-ky-mon-hoi-dap", max: 10, windowMs: 60_000 });
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

  // "Tính thử" trước khi tạo đơn — chặn 2 trường hợp không giao được hàng TRƯỚC khi thu tiền:
  //   1. lá bàn không lập được (vd ngoài phạm vi dữ liệu km_data)
  //   2. tình huống khách chọn chưa có luật luận giải (vẫn còn vài tình huống để trống có chủ đích)
  try {
    const laBan = await lapLaBan(doc.input.laBan);
    const thu = luanHoiDap(
      laBan,
      doc.input.chuDeId,
      doc.input.tinhHuongId,
      doc.input.quanHe,
      doc.input.thongTinBoSung ?? "",
    );
    if (!thu) {
      return jsonResponse(
        {
          ok: false,
          error:
            "Tình huống này đang được hoàn thiện nên chưa trả lời tự động được — vui lòng chọn tình huống khác, hoặc liên hệ hotline để được thầy luận trực tiếp.",
        },
        400,
      );
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được lá bàn với dữ liệu này." }, 400);
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
