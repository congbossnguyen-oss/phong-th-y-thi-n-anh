import type { APIRoute } from "astro";
import { getBatTuProfile, isAiConfigured } from "../../lib/chart-profile";

export const prerender = false;

// ⚠️ TẠM THỜI — chẩn đoán shape dữ liệu AI trả về. Xóa ngay sau khi sửa xong.
export const GET: APIRoute = async ({ url }) => {
  const out: Record<string, unknown> = {
    hasProcessEnv: Boolean(process.env?.ANTHROPIC_API_KEY),
    configured: isAiConfigured(),
  };
  if (url.searchParams.get("run") === "1") {
    try {
      const p = await getBatTuProfile({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
      out.aiOk = p.ai_luan_giai_thanh_cong;
      out.vuong_suy = p.bat_tu.vuong_suy;
      out.dung_than = p.bat_tu.dung_than;
      out.hy_than = p.bat_tu.hy_than;
      out.cau_truc = p.manh_phai.cau_truc;
      out.chinh_phan_cuc = p.manh_phai.chinh_phan_cuc;
      out.warnings = p.warnings;
    } catch (e) {
      out.error = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    }
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
};
