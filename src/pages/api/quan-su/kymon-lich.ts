// API con riêng cho app Quân Sư — phục vụ component LapKyMon.astro (tách khỏi web 1/9/2026, xem
// project_quan_su_tach_doc_lap_khoi_web.md). Bản độc lập của /api/kymon-lich.
import type { APIRoute } from "astro";
import { layLichThang } from "../../../lib/kymon";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const namRaw = params.get("nam");
  const thangRaw = params.get("thang");
  if (!namRaw || !thangRaw) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: nam, thang." }, 400);
  }
  const nam = Number(namRaw);
  const thang = Number(thangRaw);
  if (!Number.isInteger(nam) || !Number.isInteger(thang) || thang < 1 || thang > 12) {
    return jsonResponse({ error: "nam phải là số nguyên, thang phải là số nguyên 1-12." }, 400);
  }

  try {
    const ngayList = await layLichThang(nam, thang);
    return jsonResponse({ nam, thang, ngayList }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định.";
    return jsonResponse({ error: message }, 400);
  }
};
