import type { APIRoute } from "astro";
import { createAndSubmitJob } from "../../../../lib/ai-video/job-manager";
import { buildPrompt } from "../../../../lib/ai-video/prompt-builder";
import { listVideoProviders } from "../../../../lib/ai-video/providers/registry";
import type { VideoProviderId } from "../../../../lib/ai-video/providers/types";
import type { Scene } from "../../../../lib/ai-video/scene-planner";
import { chanKhongPhaiAdmin, jsonResponse } from "./_chung";

export const prerender = false;

interface GenerateRequestBody {
  provider?: unknown;
  model?: unknown;
  topic?: unknown;
  scene?: unknown;
  aspectRatio?: unknown;
}

const PROVIDER_HOP_LE = new Set(listVideoProviders().map((p) => p.id));

/** Kiểm tra tối thiểu để dùng an toàn — KHÔNG tin tưởng client gửi đúng type dù đã qua `/scenes`. */
function docScene(v: unknown): Scene | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  if (
    typeof s.visualDescription !== "string" ||
    s.visualDescription.trim().length === 0 ||
    typeof s.camera !== "string" ||
    typeof s.movement !== "string" ||
    typeof s.environment !== "string" ||
    typeof s.lighting !== "string" ||
    typeof s.style !== "string" ||
    typeof s.knowledgeReference !== "string" ||
    typeof s.knowledgeStatement !== "string" ||
    typeof s.title !== "string" ||
    typeof s.order !== "number" ||
    typeof s.durationSeconds !== "number"
  ) {
    return null;
  }
  return {
    ...s,
    constraints: Array.isArray(s.constraints) ? s.constraints.filter((x): x is string => typeof x === "string") : [],
    negativeConstraints: Array.isArray(s.negativeConstraints) ? s.negativeConstraints.filter((x): x is string => typeof x === "string") : [],
    narrationHint: typeof s.narrationHint === "string" ? s.narrationHint : "",
  } as Scene;
}

/** POST — nhận 1 Scene đã chọn (nguyên vẹn từ `/scenes`) + provider, build prompt rồi tạo + submit job ngay. */
export const POST: APIRoute = async ({ request, locals }) => {
  const chan = chanKhongPhaiAdmin(locals);
  if (chan) return chan;

  const body = (await request.json().catch(() => null)) as GenerateRequestBody | null;
  if (!body || typeof body.provider !== "string" || !PROVIDER_HOP_LE.has(body.provider as VideoProviderId)) {
    return jsonResponse({ ok: false, error: "Thiếu provider hợp lệ (wan | ltx)." }, 400);
  }
  const scene = docScene(body.scene);
  if (!scene) {
    return jsonResponse({ ok: false, error: "Thiếu scene hợp lệ — gửi nguyên object Scene trả về từ /scenes." }, 400);
  }

  const provider = body.provider as VideoProviderId;
  let built: ReturnType<typeof buildPrompt>;
  try {
    built = buildPrompt(scene, { aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không build được prompt." }, 400);
  }

  try {
    const job = await createAndSubmitJob({
      createdBy: locals.user!.id,
      provider,
      request: {
        prompt: built.prompt,
        negativePrompt: built.negativePrompt,
        model: typeof body.model === "string" ? body.model : undefined,
        durationSeconds: built.durationSeconds,
        aspectRatio: built.aspectRatio,
      },
      topic: typeof body.topic === "string" ? body.topic : undefined,
      sceneIndex: scene.order,
      sceneTitle: scene.title,
      sceneKnowledgeRef: scene.knowledgeReference,
    });
    return jsonResponse({ ok: true, job }, 200);
  } catch (err) {
    console.error("[ai-video] generate.ts thất bại:", err instanceof Error ? err.message : err);
    return jsonResponse({ ok: false, error: "Không tạo được job — xem log máy chủ." }, 500);
  }
};
