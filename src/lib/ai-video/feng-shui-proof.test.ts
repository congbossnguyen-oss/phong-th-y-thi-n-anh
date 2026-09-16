/**
 * FENG SHUI VIDEO PROOF — STEP 4: chứng minh trọn pipeline bằng ĐÚNG case thật trong yêu cầu
 * ("Giường ngủ đối diện cửa phòng", 3 constraints không gian) — KHÔNG gọi LTX thật ở file này (đó là
 * `smoke/feng-shui-proof.smoke.test.ts`, tách riêng + opt-in, xem STEP 2 lý do tách).
 *
 * File này chứng minh phần OFFLINE của pipeline (không cần key/mạng, luôn chạy trong test suite
 * thường ngày): Knowledge → Scene (giữ nguyên spatial constraints) → Scene Validation → Prompt Builder
 * → VideoGenerationRequest hợp lệ để gọi LTX.
 */
import { describe, expect, it, vi } from "vitest";

const goiAiToolUseMock = vi.fn();
vi.mock("../ai/goi-ai", () => ({
  goiAiToolUse: (...args: unknown[]) => goiAiToolUseMock(...args),
}));

import { planScenes } from "./scene-planner";
import { buildPrompt } from "./prompt-builder";
import { validateScene } from "./scene-validator";
import type { VideoGenerationRequest } from "./providers/types";

const TOPIC = "Giường ngủ đối diện cửa phòng";
const KNOWLEDGE_STATEMENT = "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.";
const CONSTRAINTS = [
  "Phải thể hiện rõ cửa phòng và giường.",
  "Cửa và giường nằm trên cùng một trục nhìn.",
  "Không được thay đổi quan hệ vị trí này trong quá trình visualizing.",
];

describe("FENG SHUI VIDEO PROOF — Giường ngủ đối diện cửa phòng", () => {
  it("Knowledge -> Scene: giữ nguyên tuyệt đối statement + constraints không gian", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null }); // dùng fallback grounded — không cần key AI văn bản để chứng minh pipeline

    const planned = await planScenes({
      topic: TOPIC,
      knowledge: [{ id: "k1", statement: KNOWLEDGE_STATEMENT, constraints: CONSTRAINTS }],
    });

    expect(planned.scenes).toHaveLength(1);
    const scene = planned.scenes[0];

    // §4: knowledgeStatement giữ nguyên tuyệt đối, knowledgeReference đúng.
    expect(scene.knowledgeStatement).toBe(KNOWLEDGE_STATEMENT);
    expect(scene.knowledgeReference).toBe("k1");

    // §4: visualDescription thể hiện đúng spatial relationship (cửa + giường cùng xuất hiện).
    expect(scene.visualDescription).toContain("Giường");
    expect(scene.visualDescription).toContain("cửa phòng");

    // §4: constraints được giữ nguyên — cả 3 câu, đúng nguyên văn, không thiếu không đổi.
    expect(scene.constraints).toEqual(CONSTRAINTS);

    // §4: camera không làm mất visibility (static wide shot bao trọn cả 2 vật thể, không phải close-up).
    expect(scene.camera.toLowerCase()).toContain("wide");
    // §4: movement không thay đổi cách hiểu bố cục (dolly-in giữ nguyên khung, không pan/cut đột ngột).
    expect(scene.movement.toLowerCase()).not.toMatch(/cut|jump|pan away/);

    return scene;
  });

  it("Scene Validation: scene hợp lệ PASS trước khi vào Prompt Builder", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null });
    const planned = await planScenes({
      topic: TOPIC,
      knowledge: [{ id: "k1", statement: KNOWLEDGE_STATEMENT, constraints: CONSTRAINTS }],
    });
    const result = validateScene(planned.scenes[0]);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("Prompt Builder: prompt cuối bảo toàn cửa/giường/quan hệ cùng trục/constraints, KHÔNG thêm lý thuyết phong thủy ngoài knowledge", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null });
    const planned = await planScenes({
      topic: TOPIC,
      knowledge: [{ id: "k1", statement: KNOWLEDGE_STATEMENT, constraints: CONSTRAINTS }],
    });
    const built = buildPrompt(planned.scenes[0]);

    expect(built.prompt).toContain("Giường");
    expect(built.prompt).toContain("cửa phòng");
    for (const c of CONSTRAINTS) {
      expect(built.prompt).toContain(c);
    }
    // Không được tự thêm kết luận phong thủy (vd hậu quả) không có trong knowledge gốc.
    expect(built.prompt).not.toMatch(/tài lộc|hôn nhân|sức khỏe|vận xui/);

    const request: VideoGenerationRequest = {
      prompt: built.prompt,
      negativePrompt: built.negativePrompt,
      durationSeconds: built.durationSeconds,
      aspectRatio: built.aspectRatio,
      resolution: "1280x720", // đã VERIFIED THẬT với LTX ở STEP 2
    };
    expect(request.durationSeconds).toBeGreaterThanOrEqual(6);
    expect(request.durationSeconds).toBeLessThanOrEqual(20);
  });
});
