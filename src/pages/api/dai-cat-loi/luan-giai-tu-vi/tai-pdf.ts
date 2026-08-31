import type { APIRoute } from "astro";
import { getAllConfirmedToolOrdersForUser } from "../../../../lib/db/orders";
import { taoLuanGiaiTuVi, type LuanGiaiTuViInput } from "../../../../lib/tu-vi/luan-giai/taoLuanGiaiTuVi";
import { generateTuViCoBanPdf, generateTuViNangCaoPdf } from "../../../../lib/tu-vi/luan-giai/pdf";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { jsonResponse, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";

export const prerender = false;

/**
 * Tải PDF trực tiếp — KHÔNG phụ thuộc email. Cùng lý do và mẫu với
 * api/dai-cat-loi/luan-giai-bat-tu-toan-dien/tai-pdf.ts (xem ghi chú ở đó): đơn đã confirmed nhưng
 * có thể chưa từng nhận được email (rơi đúng lúc AI lỗi, bước gửi email trong orders.ts bị bỏ qua
 * theo). Nút này cho khách tự tải lại bất cứ lúc nào.
 *
 * Lấy đơn CONFIRMED gần nhất của tài khoản cho đúng tầng — khớp đúng dữ liệu đang hiện trên trang.
 * taoLuanGiaiTuVi() tự cache theo hash lá số bên trong, không cần dò cache thủ công ở đây.
 */
export const GET: APIRoute = async ({ url, request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "tai-pdf-tu-vi", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) return jsonResponse({ ok: false, error: "Vui lòng đăng nhập." }, 401);

  const tang = url.searchParams.get("tang");
  if (tang !== "co_ban" && tang !== "nang_cao") {
    return jsonResponse({ ok: false, error: "Tầng luận giải không hợp lệ." }, 400);
  }
  const toolSlug = tang === "co_ban" ? TOOL_SLUG_CO_BAN : TOOL_SLUG_NANG_CAO;

  const dons = await getAllConfirmedToolOrdersForUser(locals.user.id, toolSlug);
  const don = dons[0];
  if (!don?.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: `Bạn chưa mua ${tang === "co_ban" ? "Luận Cơ Bản" : "Luận Nâng Cao"}.` }, 403);
  }

  try {
    const input = JSON.parse(don.toolInputSnapshot) as Omit<LuanGiaiTuViInput, "goi">;
    const kq = await taoLuanGiaiTuVi({ ...input, goi: tang });
    if (!kq.hopLe || !kq.coBan || !kq.duLieu) {
      return jsonResponse({ ok: false, error: kq.loi ?? "Chưa tính được báo cáo, vui lòng thử lại sau." }, 500);
    }

    const pdfBytes =
      tang === "co_ban"
        ? await generateTuViCoBanPdf(kq.coBan, kq.duLieu, don.customerName)
        : kq.nangCao
          ? await generateTuViNangCaoPdf(kq.coBan, kq.nangCao, kq.duLieu, don.customerName)
          : null;
    if (!pdfBytes) return jsonResponse({ ok: false, error: "Chưa tính được báo cáo, vui lòng thử lại sau." }, 500);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${toolSlug}-${don.orderCode}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[tai-pdf-tu-vi] Lỗi dựng PDF cho đơn ${don.orderCode}:`, err);
    return jsonResponse({ ok: false, error: "Không tạo được file PDF, vui lòng thử lại sau." }, 500);
  }
};
