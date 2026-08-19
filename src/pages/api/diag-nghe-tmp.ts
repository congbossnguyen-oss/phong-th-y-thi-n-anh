import type { APIRoute } from "astro";
import { getBatTuProfile, isAiConfigured } from "../../lib/chart-profile";

export const prerender = false;

// ⚠️ TẠM THỜI — chẩn đoán vì sao AI luận trả "insufficient". Xóa ngay sau khi tìm ra lỗi.
// KHÔNG in ra giá trị key (chỉ true/false). Muốn chạy thử gọi AI thật: thêm ?run=1.
export const GET: APIRoute = async ({ url }) => {
  const hasImportMeta = Boolean((import.meta as { env?: Record<string, unknown> }).env?.ANTHROPIC_API_KEY);
  const hasProcessEnv = Boolean(process.env?.ANTHROPIC_API_KEY);
  const configured = isAiConfigured();

  const out: Record<string, unknown> = { hasImportMeta, hasProcessEnv, configured };

  if (url.searchParams.get("run") === "1") {
    try {
      const p = await getBatTuProfile({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
      out.aiOk = p.ai_luan_giai_thanh_cong;
      out.warnings = p.warnings;
      out.dungThan = p.bat_tu.dung_than;
    } catch (e) {
      out.error = e instanceof Error ? e.message : String(e);
    }
  }

  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
};
