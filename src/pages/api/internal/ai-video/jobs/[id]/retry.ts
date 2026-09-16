import type { APIRoute } from "astro";
import { JobRetryError, retryJob } from "../../../../../../lib/ai-video/job-manager";
import { chanKhongPhaiAdmin, jsonResponse } from "../../_chung";

export const prerender = false;

/** POST — tạo job MỚI từ request đã lưu của 1 job lỗi (không gọi lại scene-planner/AI-text). */
export const POST: APIRoute = async ({ params, locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  const id = params.id;
  if (!id) return jsonResponse({ ok: false, error: "Thiếu id." }, 400);

  try {
    const job = await retryJob(id, locals.user!.id);
    return jsonResponse({ ok: true, job }, 200);
  } catch (err) {
    if (err instanceof JobRetryError) {
      return jsonResponse({ ok: false, error: err.message }, err.status);
    }
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không retry được job." }, 404);
  }
};
