/**
 * MANUAL DEMO — STEP 3 §11: chứng minh trọn pipeline
 *   Feng Shui Knowledge → Scene Planner → Scene → Prompt Builder → VideoGenerationRequest
 * bằng đúng ví dụ trong yêu cầu ("Giường ngủ đối diện cửa phòng"). KHÔNG gọi LTX thật ở đây (tránh
 * phát sinh chi phí ngoài ý muốn khi chạy test suite thường ngày — xem cảnh báo trong
 * providers/smoke/real-api.smoke.test.ts) — chỉ kiểm tra request được build ra có hợp lệ để gọi
 * LTX hay chưa (không cần credential/mạng để làm việc đó).
 */
import { describe, expect, it, vi } from "vitest";

const goiAiToolUseMock = vi.fn();
vi.mock("../ai/goi-ai", () => ({
  goiAiToolUse: (...args: unknown[]) => goiAiToolUseMock(...args),
}));

import { planScenes } from "./scene-planner";
import { buildPrompt } from "./prompt-builder";
import type { VideoGenerationRequest } from "./providers/types";

describe("DEMO — Giường ngủ đối diện cửa phòng", () => {
  it("Knowledge -> Scene -> Prompt Builder -> VideoGenerationRequest hợp lệ cho LTX", async () => {
    // AI không khả dụng trong demo này (không cần key thật) -> Scene Planner tự lùi về fallback
    // grounded — vẫn đủ để chứng minh trọn pipeline, không phụ thuộc mạng/LLM để chạy demo.
    goiAiToolUseMock.mockResolvedValue({ input: null });

    const topic = "Giường ngủ đối diện cửa phòng";
    const knowledgeText = "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.";

    const planned = await planScenes({ topic, knowledgeText });
    expect(planned.scenes).toHaveLength(1);

    const scene = planned.scenes[0];
    // Knowledge được GIỮ NGUYÊN — đúng nguyên văn input, không bị diễn giải lại.
    expect(scene.knowledgeStatement).toBe(knowledgeText);
    // Visual khác knowledge (ở fallback thì trùng nguyên văn — vẫn là 1 field TÁCH RIÊNG, không lẫn
    // vào prompt cuối kèm theo lý thuyết phong thủy, xem test buildPrompt bên dưới).

    const built = buildPrompt(scene);
    expect(built.prompt.length).toBeGreaterThan(0);
    expect(built.prompt).not.toContain("phong thủy"); // prompt hình ảnh, không lẫn thuật ngữ lý thuyết

    const request: VideoGenerationRequest = {
      prompt: built.prompt,
      negativePrompt: built.negativePrompt,
      durationSeconds: built.durationSeconds,
      aspectRatio: built.aspectRatio,
    };

    // Request hợp lệ để gọi LTX thật (đã XÁC MINH THẬT ở STEP 2): prompt không rỗng, duration nằm
    // trong khoảng LTX chấp nhận (6-20s theo docs.ltx.io/models/ltx-2-5, DEFAULT_SCENE_DURATION_SECONDS = 6).
    expect(request.prompt.trim().length).toBeGreaterThan(0);
    expect(request.durationSeconds).toBeGreaterThanOrEqual(6);
    expect(request.durationSeconds).toBeLessThanOrEqual(20);
  });
});
