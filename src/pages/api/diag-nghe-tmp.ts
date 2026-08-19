import type { APIRoute } from "astro";
import { castBatTuFacts } from "../../lib/chart-profile/cast-bat-tu";
import { buildBatTuSystemPrompt, buildBatTuUserPrompt } from "../../lib/chart-profile/prompt";
import { callBatTuLlm, isAiConfigured } from "../../lib/chart-profile/llm";

export const prerender = false;

// ⚠️ TẠM THỜI — chẩn đoán shape dữ liệu AI trả về. Xóa ngay sau khi sửa xong.
export const GET: APIRoute = async ({ url }) => {
  const out: Record<string, unknown> = {
    hasProcessEnv: Boolean(process.env?.ANTHROPIC_API_KEY),
    configured: isAiConfigured(),
  };
  if (url.searchParams.get("run") === "1") {
    try {
      const { facts } = castBatTuFacts({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
      const sys = buildBatTuSystemPrompt();
      const usr = buildBatTuUserPrompt(facts);
      const res = (await callBatTuLlm(sys, usr, facts.daiVan.length)) as Record<string, unknown>;
      out.ok = res.ok;
      out.rawKeys = res.rawKeys;
      out.raw = res.raw;
      out.reason = res.reason;
      out.detail = res.detail;
    } catch (e) {
      out.error = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    }
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
};
