import type { APIRoute } from "astro";
import { getTuViProfile } from "../../lib/chart-profile/tu-vi";

export const prerender = false;

// ⚠️ TẠM THỜI — xác minh AI Tử Vi. Xóa sau khi OK.
export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get("run") !== "1") return new Response('{"hint":"?run=1"}', { headers: { "Content-Type": "application/json" } });
  try {
    const p = await getTuViProfile({ day: 14, month: 3, year: 1996, hour: 9, gender: "Nam" });
    return new Response(JSON.stringify({
      aiOk: p.ai_luan_giai_thanh_cong,
      model: p.model,
      menh_cach: p.menh_cach,
      danh_gia_cung: p.danh_gia_cung,
      dai_han_sample: p.dai_han.slice(0, 3).map((d) => ({ tuoi: `${d.tuTuoi}-${d.denTuoi}`, chuDe: d.chuDe, mucThuan: d.mucThuan })),
      warnings: p.warnings.slice(0, 2),
    }, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? `${e.message}\n${e.stack}` : String(e) }, null, 2), { headers: { "Content-Type": "application/json" } });
  }
};
