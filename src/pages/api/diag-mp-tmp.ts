import type { APIRoute } from "astro";
import { getBatTuProfile } from "../../lib/chart-profile";
export const prerender = false;
export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get("run") !== "1") return new Response('{"hint":"?run=1"}', { headers: { "Content-Type": "application/json" } });
  try {
    const p = await getBatTuProfile({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
    return new Response(JSON.stringify({ aiOk: p.ai_luan_giai_thanh_cong, vuong_suy: p.bat_tu.vuong_suy, dung_than: p.bat_tu.dung_than, manh_phai: p.manh_phai, warnings: p.warnings.slice(0, 2) }, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (e) { return new Response(JSON.stringify({ error: e instanceof Error ? `${e.message}\n${e.stack}` : String(e) }), { headers: { "Content-Type": "application/json" } }); }
};
