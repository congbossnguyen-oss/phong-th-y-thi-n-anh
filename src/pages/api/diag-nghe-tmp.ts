import type { APIRoute } from "astro";
import { taoHoSoNghe } from "../../lib/nghe-nghiep/tao-ho-so-nghe";

export const prerender = false;

// ⚠️ TẠM THỜI — xác minh output nghề sau khi thêm fallback Thập Thần. Xóa sau khi OK.
export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get("run") !== "1") return new Response('{"hint":"?run=1"}', { headers: { "Content-Type": "application/json" } });
  try {
    const kq = await taoHoSoNghe({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
    const bt = kq.batTuVM;
    const out = {
      batTuAiOk: kq.batTuAiOk,
      vectorInsufficient: bt.vectorInsufficient,
      vector: bt.vector,
      vectorDetail: bt.vectorDetail,
      axisInsufficient: bt.axisInsufficient,
      axis: bt.axis,
      domainInsufficient: bt.domainInsufficient,
      priority: bt.priority.map((d) => `${d.label}(${d.score})`),
      ketHopInsufficient: kq.ketHop.insufficient,
      agreement: kq.ketHop.agreement,
    };
    return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? `${e.message}\n${e.stack}` : String(e) }, null, 2), { headers: { "Content-Type": "application/json" } });
  }
};
