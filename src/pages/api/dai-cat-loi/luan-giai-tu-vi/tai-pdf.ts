import type { APIRoute } from "astro";
import { getAllConfirmedToolOrdersForUser } from "../../../../lib/db/orders";
import { taoLuanGiaiTuVi, type LuanGiaiTuViInput } from "../../../../lib/tu-vi/luan-giai/taoLuanGiaiTuVi";
import { generateTuViNangCaoPdf } from "../../../../lib/tu-vi/luan-giai/pdf";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { jsonResponse, TOOL_SLUG_TOAN_DIEN, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";

export const prerender = false;

/**
 * Tải PDF trực tiếp — KHÔNG phụ thuộc email. Cùng lý do và mẫu với
 * api/dai-cat-loi/luan-giai-bat-tu-toan-dien/tai-pdf.ts (xem ghi chú ở đó): đơn đã confirmed nhưng
 * có thể chưa từng nhận được email (rơi đúng lúc AI lỗi, bước gửi email trong orders.ts bị bỏ qua
 * theo). Nút này cho khách tự tải lại bất cứ lúc nào.
 *
 * Từ 1/9/2026 chỉ còn 1 gói (500k) — luôn tính "nang_cao" vì taoLuanGiaiTuVi() đã tự ghép sẵn Cơ
 * Bản + Nâng Cao khi goi="nang_cao" (xem taoLuanGiaiTuVi.ts), PDF xuất ra sẵn là bản gộp đầy đủ,
 * không cần hàm PDF riêng. Khách mua slug CŨ (chỉ Cơ Bản hoặc chỉ Nâng Cao) vẫn coi như đã mua đủ
 * gói mới (anh Công chốt 1/9/2026), nên vẫn nhận được bản gộp đầy đủ ở đây.
 */
export const GET: APIRoute = async ({ request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "tai-pdf-tu-vi", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) return jsonResponse({ ok: false, error: "Vui lòng đăng nhập." }, 401);

  const [donsToanDien, donsCoBan, donsNangCao] = await Promise.all([
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_TOAN_DIEN),
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_CO_BAN),
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_NANG_CAO),
  ]);
  const don = [...donsToanDien, ...donsCoBan, ...donsNangCao].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )[0];
  if (!don?.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Bạn chưa mua Luận Giải Tử Vi." }, 403);
  }

  try {
    const input = JSON.parse(don.toolInputSnapshot) as Omit<LuanGiaiTuViInput, "goi">;
    const kq = await taoLuanGiaiTuVi({ ...input, goi: "nang_cao" });
    if (!kq.hopLe || !kq.coBan || !kq.nangCao || !kq.duLieu) {
      return jsonResponse({ ok: false, error: kq.loi ?? "Chưa tính được báo cáo, vui lòng thử lại sau." }, 500);
    }

    const pdfBytes = await generateTuViNangCaoPdf(kq.coBan, kq.nangCao, kq.duLieu, don.customerName);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="luan-giai-tu-vi-toan-dien-${don.orderCode}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[tai-pdf-tu-vi] Lỗi dựng PDF cho đơn ${don.orderCode}:`, err);
    return jsonResponse({ ok: false, error: "Không tạo được file PDF, vui lòng thử lại sau." }, 500);
  }
};
