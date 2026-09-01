import type { APIRoute } from "astro";
import { getAllConfirmedToolOrdersForUser } from "../../../../lib/db/orders";
import { taoBaoCaoCoBan, taoBaoCaoNangCao } from "../../../../lib/luan-giai-toan-dien/orchestrator";
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "../../../../lib/luan-giai-toan-dien/ai-narrative";
import { generateBatTuToanDienPdf } from "../../../../lib/dai-cat-loi/bat-tu-toan-dien-pdf";
import { hashLaSo, cacheCoBan, cacheNangCao } from "../../../../lib/luan-giai-toan-dien/cache";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { jsonResponse, TOOL_SLUG_TOAN_DIEN, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import type { BatTuInput } from "../../../../lib/bat-tu";

export const prerender = false;

/**
 * Tải PDF trực tiếp — KHÔNG phụ thuộc email. Anh Công báo 31/8/2026: đơn đã confirmed nhưng chưa
 * từng nhận được email (rơi đúng lúc Anthropic hết credit, luận giải thất bại nên bước gửi email
 * trong orders.ts cũng bị bỏ qua theo — xem project_anthropic_credit_va_chi_phi_ai). Nút này cho
 * khách tự tải lại bất cứ lúc nào, không cần đợi/nhờ gửi lại email.
 *
 * Từ 1/9/2026 chỉ còn 1 gói (700k, đủ 12 giai đoạn) — trả về PDF gộp. Khách mua slug CŨ (chỉ Cơ
 * Bản hoặc chỉ Nâng Cao, trước khi gộp gói) vẫn được coi là đã mua đủ gói mới (anh Công chốt
 * 1/9/2026: "coi như đã mua đủ gói mới"), nên vẫn nhận được bản gộp đầy đủ ở đây.
 */
export const GET: APIRoute = async ({ request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "tai-pdf-bat-tu-toan-dien", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) return jsonResponse({ ok: false, error: "Vui lòng đăng nhập." }, 401);

  const [donsToanDien, donsCoBan, donsNangCao] = await Promise.all([
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_TOAN_DIEN),
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_CO_BAN),
    getAllConfirmedToolOrdersForUser(locals.user.id, TOOL_SLUG_NANG_CAO),
  ]);
  // Gần nhất trong CẢ 3 nguồn — đơn mới (1 gói) và đơn cũ (grandfather) đều cho quyền như nhau.
  const don = [...donsToanDien, ...donsCoBan, ...donsNangCao].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  )[0];
  if (!don?.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Bạn chưa mua Luận Giải Bát Tự Toàn Diện." }, 403);
  }

  try {
    const input = JSON.parse(don.toolInputSnapshot) as BatTuInput;
    const key = hashLaSo(input);

    // Cache CHỈ lưu bản ĐỦ giai đoạn — bản thiếu (AI lỗi vài giai đoạn) không được cache, nếu không
    // sẽ "poison" cache: mọi lượt tải sau cứ đọc lại đúng bản thiếu đó mãi, không bao giờ tính lại
    // (bug thật 1/9/2026, xem ghi chú ở orders.ts cùng đợt sửa).
    let baoCaoCoBan = cacheCoBan.get(key);
    let baoCaoNangCao = cacheNangCao.get(key);
    const [tinhCoBan, tinhNangCao] = await Promise.all([
      baoCaoCoBan ? Promise.resolve(baoCaoCoBan) : taoBaoCaoCoBan(input),
      baoCaoNangCao ? Promise.resolve(baoCaoNangCao) : taoBaoCaoNangCao(input),
    ]);
    baoCaoCoBan = tinhCoBan;
    baoCaoNangCao = tinhNangCao;
    const dayDu = baoCaoCoBan.giaiDoan.length === GIAI_DOAN_CO_BAN.length && baoCaoNangCao.giaiDoan.length === GIAI_DOAN_NANG_CAO.length;
    if (!dayDu) {
      console.error(`[tai-pdf-bat-tu-toan-dien] Đơn ${don.orderCode} tính THIẾU giai đoạn (đủ ${GIAI_DOAN_CO_BAN.length + GIAI_DOAN_NANG_CAO.length}, chỉ có ${baoCaoCoBan.giaiDoan.length + baoCaoNangCao.giaiDoan.length}) — không trả PDF thiếu.`);
      return jsonResponse({ ok: false, error: "Một vài phần luận giải chưa tính xong (AI đang chập chờn), vui lòng thử tải lại sau ít phút." }, 503);
    }
    cacheCoBan.set(key, baoCaoCoBan);
    cacheNangCao.set(key, baoCaoNangCao);

    const pdfBytes = await generateBatTuToanDienPdf(baoCaoCoBan, baoCaoNangCao, don.customerName);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="luan-giai-bat-tu-toan-dien-${don.orderCode}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[tai-pdf-bat-tu-toan-dien] Lỗi dựng PDF cho đơn ${don.orderCode}:`, err);
    return jsonResponse({ ok: false, error: "Không tạo được file PDF, vui lòng thử lại sau." }, 500);
  }
};
