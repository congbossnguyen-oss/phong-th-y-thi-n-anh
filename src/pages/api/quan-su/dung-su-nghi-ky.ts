// API con riêng cho app Quân Sư — phục vụ component XemNgayTotXau.astro (tách khỏi web 1/9/2026,
// xem project_quan_su_tach_doc_lap_khoi_web.md). Bản độc lập của /api/dung-su-nghi-ky.
import type { APIRoute } from "astro";
import { DUNG_SU_NGHI_KY } from "../../../lib/dung-su-nghi-ky";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(DUNG_SU_NGHI_KY), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
