import type { APIRoute } from "astro";
import { cancelJob } from "../../../../../../lib/ai-video/job-manager";
import { chanKhongPhaiAdmin, jsonResponse } from "../../_chung";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  const id = params.id;
  if (!id) return jsonResponse({ ok: false, error: "Thiếu id." }, 400);

  try {
    const job = await cancelJob(id);
    return jsonResponse({ ok: true, job }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không hủy được job." }, 404);
  }
};
