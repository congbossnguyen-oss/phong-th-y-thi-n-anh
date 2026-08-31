import type { APIRoute } from "astro";
import { getAllConfirmedToolOrdersForUser } from "../../../../lib/db/orders";
import { taoBaoCaoCoBan, taoBaoCaoNangCao } from "../../../../lib/luan-giai-toan-dien/orchestrator";
import { generateBatTuCoBanPdf, generateBatTuNangCaoPdf } from "../../../../lib/dai-cat-loi/bat-tu-toan-dien-pdf";
import { hashLaSo, cacheCoBan, cacheNangCao } from "../../../../lib/luan-giai-toan-dien/cache";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { jsonResponse, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import type { BatTuInput } from "../../../../lib/bat-tu";

export const prerender = false;

/**
 * Tải PDF trực tiếp — KHÔNG phụ thuộc email. Anh Công báo 31/8/2026: đơn đã confirmed nhưng chưa
 * từng nhận được email (rơi đúng lúc Anthropic hết credit, luận giải thất bại nên bước gửi email
 * trong orders.ts cũng bị bỏ qua theo — xem project_anthropic_credit_va_chi_phi_ai). Nút này cho
 * khách tự tải lại bất cứ lúc nào, không cần đợi/nhờ gửi lại email.
 *
 * Lấy đơn CONFIRMED gần nhất của tài khoản cho đúng tầng (co_ban/nang_cao) — khớp đúng dữ liệu
 * đang hiện trên trang (banner "Đã mua..." cũng dựa trên đơn gần nhất, xem luan-giai-bat-tu-toan-
 * dien.astro). Dùng lại cache theo hash lá số — không tính lại nếu vừa tính (đỡ tốn AI).
 */
export const GET: APIRoute = async ({ url, request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "tai-pdf-bat-tu-toan-dien", max: 20, windowMs: 60_000 });
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
    return jsonResponse({ ok: false, error: `Bạn chưa mua ${tang === "co_ban" ? "Luận Cơ Bản" : "Luận Trọn Đời"}.` }, 403);
  }

  try {
    const input = JSON.parse(don.toolInputSnapshot) as BatTuInput;
    const key = hashLaSo(input);

    let pdfBytes: Uint8Array;
    if (tang === "co_ban") {
      let baoCao = cacheCoBan.get(key);
      if (!baoCao) {
        baoCao = await taoBaoCaoCoBan(input);
        cacheCoBan.set(key, baoCao);
      }
      pdfBytes = await generateBatTuCoBanPdf(baoCao, don.customerName);
    } else {
      let baoCao = cacheNangCao.get(key);
      if (!baoCao) {
        baoCao = await taoBaoCaoNangCao(input);
        cacheNangCao.set(key, baoCao);
      }
      pdfBytes = await generateBatTuNangCaoPdf(baoCao, don.customerName);
    }

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${toolSlug}-${don.orderCode}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[tai-pdf-bat-tu-toan-dien] Lỗi dựng PDF cho đơn ${don.orderCode}:`, err);
    return jsonResponse({ ok: false, error: "Không tạo được file PDF, vui lòng thử lại sau." }, 500);
  }
};
