import { describe, expect, it } from "vitest";
import { attachPromptToScene, buildPrompt } from "./prompt-builder";
import type { Scene } from "./scene-planner";

function sceneMau(overrides: Partial<Scene> = {}): Scene {
  return {
    id: "scene-k1",
    title: "Giường đối diện cửa",
    order: 1,
    durationSeconds: 6,
    knowledgeReference: "k1",
    knowledgeStatement: "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.",
    visualDescription: "Phòng ngủ hiện đại, camera đứng cuối giường nhìn về phía cửa, thể hiện rõ cửa và giường trên cùng một trục.",
    camera: "static wide shot",
    movement: "slow forward camera movement",
    environment: "modern Vietnamese bedroom",
    lighting: "natural daylight",
    style: "cinematic, photorealistic",
    constraints: ["Giữ nguyên vị trí cửa và giường theo mô tả."],
    negativeConstraints: [],
    narrationHint: "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.",
    ...overrides,
  };
}

describe("buildPrompt — ưu tiên trục theo STEP 3 §6", () => {
  it("ghép visualDescription -> environment -> camera -> movement -> lighting -> style -> constraints", () => {
    const built = buildPrompt(sceneMau());
    expect(built.prompt).toContain(sceneMau().visualDescription);
    const thuTu = [
      sceneMau().visualDescription,
      "Environment:",
      "Camera:",
      "Movement:",
      "Lighting:",
      "Style:",
      "Constraints:",
    ].map((s) => built.prompt.indexOf(s));
    for (let i = 1; i < thuTu.length; i++) {
      expect(thuTu[i]).toBeGreaterThan(thuTu[i - 1]);
    }
  });

  it("KHÔNG đưa knowledgeStatement vào prompt — model video cần mô tả hình ảnh, không cần lý thuyết phong thủy", () => {
    const scene = sceneMau({ knowledgeStatement: "CÂU KIẾN THỨC RIÊNG BIỆT KHÔNG ĐƯỢC LẶP LẠI TRONG PROMPT" });
    const built = buildPrompt(scene);
    expect(built.prompt).not.toContain("CÂU KIẾN THỨC RIÊNG BIỆT");
  });

  it("negativePrompt luôn có bộ mặc định + negativeConstraints của scene", () => {
    const scene = sceneMau({ negativeConstraints: ["không hiện gương"] });
    const built = buildPrompt(scene);
    expect(built.negativePrompt).toContain("watermark");
    expect(built.negativePrompt).toContain("không hiện gương");
  });

  it("không có constraints thì KHÔNG thêm dòng 'Constraints:' rỗng vô nghĩa", () => {
    const built = buildPrompt(sceneMau({ constraints: [] }));
    expect(built.prompt).not.toContain("Constraints:");
  });

  it("durationSeconds lấy thẳng từ scene (Scene Planner quyết định, không phải prompt-builder tự bịa mặc định)", () => {
    const built = buildPrompt(sceneMau({ durationSeconds: 8 }));
    expect(built.durationSeconds).toBe(8);
  });

  it("aspectRatio mặc định 9:16, có thể override qua option", () => {
    expect(buildPrompt(sceneMau()).aspectRatio).toBe("9:16");
    expect(buildPrompt(sceneMau(), { aspectRatio: "16:9" }).aspectRatio).toBe("16:9");
  });

  it("thiếu visualDescription -> throw thay vì sinh prompt rỗng vô nghĩa", () => {
    expect(() => buildPrompt(sceneMau({ visualDescription: "" }))).toThrow();
    expect(() => buildPrompt(sceneMau({ visualDescription: "   " }))).toThrow();
  });
});

describe("attachPromptToScene", () => {
  it("trả về Scene nguyên vẹn + prompt/negativePrompt gắn thêm — khớp field 'prompt' trong Scene schema STEP 3", () => {
    const scene = sceneMau();
    const result = attachPromptToScene(scene);
    expect(result.id).toBe(scene.id);
    expect(result.knowledgeStatement).toBe(scene.knowledgeStatement);
    expect(typeof result.prompt).toBe("string");
    expect(typeof result.negativePrompt).toBe("string");
  });
});
