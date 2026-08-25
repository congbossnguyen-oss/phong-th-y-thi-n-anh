import type { APIRoute } from "astro";
import { docInput, jsonResponse } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { laSoVaPhanTich } from "../../../../lib/luan-giai-toan-dien/orchestrator";
import { taoGoiMoFree, taoDuLieuDoHinhFree } from "../../../../lib/luan-giai-toan-dien/free-template";

export const prerender = false;

/**
 * Tầng FREE — KHÔNG gọi AI, thuần code (xem free-template.ts). Mở tự do, không cần đăng nhập,
 * không giới hạn số lần. Endpoint riêng (thay vì tính client-side) vì taoGoiMoFree() đọc dữ liệu
 * qua fs (content/bat-tu/data/) — chỉ chạy được ở server, không bundle được cho trình duyệt.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "xem-truoc-bat-tu-toan-dien", max: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const docKq = docInput(body);
  if (!docKq.ok) return jsonResponse({ ok: false, error: docKq.error }, 400);

  try {
    const { chart, analysis } = laSoVaPhanTich(docKq.input);
    const goiMo = taoGoiMoFree(chart, analysis);
    const doHinh = taoDuLieuDoHinhFree(chart, analysis);
    return jsonResponse({
      ok: true,
      goiMo,
      laSo: {
        tuTru: [chart.year, chart.month, chart.day, chart.hour].map((p) => `${p.can} ${p.chi}`),
        nhatChu: `${chart.day.can} (${chart.nhatChu.nguHanh}, ${chart.nhatChu.amDuong})`,
        capDoVuongSuy: analysis.vuongSuy.capDo,
        dungThan: analysis.dungThan.dungThan,
      },
      doHinh,
    }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được lá số." }, 400);
  }
};
