import type { APIRoute } from "astro";
import { listRecentJobs } from "../../../../../lib/ai-video/job-manager";
import { chanKhongPhaiAdmin, jsonResponse } from "../_chung";

export const prerender = false;

/** GET — danh sách job gần nhất CỦA CHÍNH admin đang đăng nhập, mới nhất trước. Không poll provider. */
export const GET: APIRoute = async ({ locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  try {
    const jobs = await listRecentJobs(locals.user!.id);
    return jsonResponse({ ok: true, jobs }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lấy được danh sách job." }, 500);
  }
};
