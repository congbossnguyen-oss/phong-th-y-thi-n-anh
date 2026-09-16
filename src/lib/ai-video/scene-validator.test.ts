import { describe, expect, it } from "vitest";
import { assertValidScene, SceneValidationError, validateScene } from "./scene-validator";
import type { Scene } from "./scene-planner";

function sceneMau(overrides: Partial<Scene> = {}): Scene {
  return {
    id: "scene-k1",
    title: "Giường đối diện cửa",
    order: 1,
    durationSeconds: 6,
    knowledgeReference: "k1",
    knowledgeStatement: "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.",
    visualDescription: "Phòng ngủ hiện đại, camera đứng cuối giường nhìn về phía cửa.",
    camera: "static wide shot",
    movement: "slow dolly-in",
    environment: "modern bedroom",
    lighting: "soft natural daylight",
    style: "cinematic, photorealistic",
    constraints: ["Giữ nguyên vị trí cửa và giường."],
    negativeConstraints: [],
    narrationHint: "",
    ...overrides,
  };
}

describe("validateScene — chặn TRƯỚC Prompt Builder (STEP 4 §5)", () => {
  it("scene đầy đủ field hợp lệ -> valid: true, không có error", () => {
    expect(validateScene(sceneMau())).toEqual({ valid: true, errors: [] });
  });

  it.each(["visualDescription", "camera", "movement", "environment", "lighting", "style"] as const)(
    "rỗng '%s' -> invalid, báo đúng tên field thiếu",
    (truong) => {
      const result = validateScene(sceneMau({ [truong]: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes(truong))).toBe(true);
    },
  );

  it.each(["visualDescription", "camera", "movement", "environment", "lighting", "style"] as const)(
    "chỉ có khoảng trắng ở '%s' -> vẫn coi là rỗng, invalid",
    (truong) => {
      const result = validateScene(sceneMau({ [truong]: "   " }));
      expect(result.valid).toBe(false);
    },
  );

  it("constraints chứa phần tử rỗng -> invalid", () => {
    const result = validateScene(sceneMau({ constraints: ["ok", ""] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("constraints"))).toBe(true);
  });

  it("durationSeconds <= 0 -> invalid", () => {
    expect(validateScene(sceneMau({ durationSeconds: 0 })).valid).toBe(false);
    expect(validateScene(sceneMau({ durationSeconds: -1 })).valid).toBe(false);
  });

  it("assertValidScene ném đúng SceneValidationError khi invalid, không ném gì khi valid", () => {
    expect(() => assertValidScene(sceneMau())).not.toThrow();
    expect(() => assertValidScene(sceneMau({ camera: "" }))).toThrow(SceneValidationError);
  });

  it("KHÔNG bao giờ tự sửa/bổ sung Scene — chỉ báo lỗi, giữ nguyên input", () => {
    const scene = sceneMau({ camera: "" });
    const before = JSON.stringify(scene);
    validateScene(scene);
    expect(JSON.stringify(scene)).toBe(before);
  });
});

describe("validateScene — GROUNDING (STEP 6 §1: dùng chung checkSceneGrounding, chặn cả Scene tự tạo)", () => {
  it("C. Scene hợp lệ + đúng nội dung knowledge -> vẫn PASS (không đổi hành vi cũ)", () => {
    expect(validateScene(sceneMau()).valid).toBe(true);
  });

  it("B/D. Scene có visualDescription bịa kết luận phong thủy -> FAIL dù field không hề rỗng — đây CHÍNH LÀ lớp chặn generate.ts không thể bypass bằng cách tự tạo Scene", () => {
    const scene = sceneMau({ visualDescription: "Giường đối diện cửa, cách bố trí này gây mất tài lộc cho gia chủ." });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("mất tài lộc"))).toBe(true);
    expect(() => assertValidScene(scene)).toThrow(SceneValidationError);
  });

  it("E. Không false-positive khi cụm nhạy cảm đã có sẵn trong chính knowledgeStatement", () => {
    const scene = sceneMau({
      knowledgeStatement: "Giường đối diện cửa được cho là gây mất tài lộc theo quan niệm dân gian.",
      visualDescription: "Hình ảnh minh họa cách bố trí được cho là gây mất tài lộc.",
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it("thiếu knowledgeStatement (rỗng) -> FAIL ở field-check, KHÔNG tự suy đoán/bịa knowledge source", () => {
    const scene = sceneMau({ knowledgeStatement: "" });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("knowledgeStatement"))).toBe(true);
  });
});
