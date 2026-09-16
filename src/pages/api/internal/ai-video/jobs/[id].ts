import type { APIRoute } from "astro";
import { pollJob } from "../../../../../lib/ai-video/job-manager";
import { chanKhongPhaiAdmin, jsonResponse } from "../_chung";

export const prerender = false;

/** GET — đồng bộ trạng thái job với provider (nếu chưa xong) rồi trả về dòng DB mới nhất. */
export const GET: APIRoute = async ({ params, locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  const id = params.id;
  if (!id) return jsonResponse({ ok: false, error: "Thiếu id." }, 400);

  try {
    const job = await pollJob(id);
    return jsonResponse({ ok: true, job }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tra được job." }, 404);
  }
};
