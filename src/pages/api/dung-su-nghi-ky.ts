import type { APIRoute } from "astro";
import { DUNG_SU_NGHI_KY } from "../../lib/dung-su-nghi-ky";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(DUNG_SU_NGHI_KY), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
