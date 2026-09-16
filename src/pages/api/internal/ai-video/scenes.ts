import type { APIRoute } from "astro";
import { planScenes } from "../../../../lib/ai-video/scene-planner";
import { chanKhongPhaiAdmin, jsonResponse } from "./_chung";

export const prerender = false;

/** POST { topic, knowledgeText } → { ok, scenes } — chia chủ đề thành cảnh, bám kiến thức đã cho. */
export const POST: APIRoute = async ({ request, locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  const body = (await request.json().catch(() => null)) as { topic?: unknown; knowledgeText?: unknown } | null;
  if (!body || typeof body.topic !== "string" || body.topic.trim().length === 0) {
    return jsonResponse({ ok: false, error: "Thiếu topic." }, 400);
  }
  if (typeof body.knowledgeText !== "string" || body.knowledgeText.trim().length === 0) {
    return jsonResponse({ ok: false, error: "Thiếu knowledgeText — dán nội dung phong thủy nguồn để chia cảnh." }, 400);
  }

  try {
    const result = await planScenes({ topic: body.topic, knowledgeText: body.knowledgeText });
    return jsonResponse({ ok: true, ...result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không chia được cảnh." }, 400);
  }
};
