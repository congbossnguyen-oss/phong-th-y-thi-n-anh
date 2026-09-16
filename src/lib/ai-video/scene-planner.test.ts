import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SCENE_DURATION_SECONDS, planScenes, splitKnowledgeIntoPoints } from "./scene-planner";

// vi.mock được vitest hoisted lên đầu file, nên áp dụng cho cả import tĩnh ở trên dù viết sau.
const goiAiToolUseMock = vi.fn();
vi.mock("../ai/goi-ai", () => ({
  goiAiToolUse: (...args: unknown[]) => goiAiToolUseMock(...args),
}));

describe("splitKnowledgeIntoPoints", () => {
  it("mỗi dòng khác trống là 1 điểm kiến thức, bỏ gạch đầu dòng/số thứ tự", () => {
    const points = splitKnowledgeIntoPoints("- Giường đối diện cửa.\n2) Gương chiếu vào giường.\n\n• WC sau đầu giường.");
    expect(points.map((p) => p.statement)).toEqual(["Giường đối diện cửa.", "Gương chiếu vào giường.", "WC sau đầu giường."]);
    expect(points.map((p) => p.id)).toEqual(["k1", "k2", "k3"]);
  });

  it("dòng trống bị loại bỏ", () => {
    const points = splitKnowledgeIntoPoints("a\n\n\nb");
    expect(points).toHaveLength(2);
  });
});

describe("planScenes — knowledge grounding (Section 3)", () => {
  it("KHÔNG có knowledge -> throw, không tự sinh cảnh không có căn cứ", async () => {
    await expect(planScenes({ topic: "chủ đề bất kỳ", knowledgeText: "" })).rejects.toThrow();
    await expect(planScenes({ topic: "chủ đề bất kỳ" })).rejects.toThrow();
  });

  it("AI lỗi/không trả input -> fallback: mỗi điểm kiến thức = đúng 1 cảnh, visualDescription = nguyên văn knowledge", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null });
    const result = await planScenes({ topic: "t", knowledgeText: "Giường đối diện cửa.\nGương chiếu vào giường." });
    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0]).toMatchObject({
      order: 1,
      knowledgeReference: "k1",
      knowledgeStatement: "Giường đối diện cửa.",
      visualDescription: "Giường đối diện cửa.",
      durationSeconds: DEFAULT_SCENE_DURATION_SECONDS,
    });
    expect(result.warnings).toHaveLength(0); // AI hoàn toàn không trả gì -> không phải "sai schema từng cảnh", chỉ là không có input
  });

  it("knowledgeStatement của Scene LUÔN lấy từ nguồn — dù AI cố tình trả câu khác đi vẫn bị bỏ qua (field không nằm trong schema LLM)", async () => {
    goiAiToolUseMock.mockResolvedValue({
      input: {
        scenes: [
          {
            knowledge_ref: "k1",
            title: "Cận cảnh giường",
            visual_description: "Camera lia qua giường đối diện cửa ra vào.",
            camera: "static wide shot",
            movement: "slow dolly-in",
            environment: "modern bedroom",
            lighting: "soft daylight",
            style: "cinematic",
          },
        ],
      },
    });
    const result = await planScenes({ topic: "t", knowledgeText: "Giường đối diện cửa." });
    expect(result.scenes[0].knowledgeStatement).toBe("Giường đối diện cửa.");
    expect(result.warnings).toHaveLength(0);
  });

  it("AI trả knowledge_ref KHÔNG hợp lệ -> cảnh đó bị từ chối, thay bằng fallback grounded, có warning", async () => {
    goiAiToolUseMock.mockResolvedValue({
      input: { scenes: [{ knowledge_ref: "k999-khong-ton-tai", title: "X", visual_description: "Y", camera: "a", movement: "b", environment: "c", lighting: "d", style: "e" }] },
    });
    const result = await planScenes({ topic: "t", knowledgeText: "Giường đối diện cửa." });
    expect(result.scenes).toHaveLength(1);
    expect(result.scenes[0].visualDescription).toBe("Giường đối diện cửa."); // fallback grounded, không phải "Y" do AI bịa
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("UNSUPPORTED CLAIM: AI thêm kết luận phong thủy không có trong knowledge -> cảnh bị từ chối, thay bằng fallback", async () => {
    goiAiToolUseMock.mockResolvedValue({
      input: {
        scenes: [
          {
            knowledge_ref: "k1",
            title: "Giường đối diện cửa",
            // Knowledge gốc CHỈ nói vị trí — AI tự bịa thêm "gây mất tài lộc" (không có trong input).
            visual_description: "Phòng ngủ với giường đối diện cửa, hình ảnh này thể hiện cách bố trí gây mất tài lộc cho gia chủ.",
            camera: "static wide shot",
            movement: "slow dolly-in",
            environment: "modern bedroom",
            lighting: "soft daylight",
            style: "cinematic",
          },
        ],
      },
    });
    const result = await planScenes({ topic: "t", knowledgeText: "Giường đối diện cửa." });
    expect(result.scenes[0].visualDescription).toBe("Giường đối diện cửa."); // đã bị thay bằng fallback, KHÔNG giữ câu bịa
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("kết luận không có trong kiến thức nguồn");
  });

  it("cụm nhạy cảm CÓ trong knowledge gốc thì KHÔNG bị coi là bịa đặt (không false positive)", async () => {
    goiAiToolUseMock.mockResolvedValue({
      input: {
        scenes: [
          {
            knowledge_ref: "k1",
            title: "Giường đối diện cửa",
            visual_description: "Phòng ngủ với giường đối diện cửa — theo phong thủy dân gian, cách bố trí này được cho là gây mất tài lộc.",
            camera: "static wide shot",
            movement: "slow dolly-in",
            environment: "modern bedroom",
            lighting: "soft daylight",
            style: "cinematic",
          },
        ],
      },
    });
    const result = await planScenes({
      topic: "t",
      knowledge: [{ id: "k1", statement: "Giường đối diện cửa được cho là gây mất tài lộc theo quan niệm dân gian." }],
    });
    expect(result.warnings).toHaveLength(0);
    expect(result.scenes[0].visualDescription).toContain("gây mất tài lộc");
  });

  it("MULTIPLE SCENES: N điểm kiến thức -> đúng N scene, đúng thứ tự order", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null }); // dùng fallback cho đơn giản/deterministic
    const result = await planScenes({ topic: "t", knowledgeText: "A.\nB.\nC." });
    expect(result.scenes.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(result.scenes.map((s) => s.knowledgeReference)).toEqual(["k1", "k2", "k3"]);
  });

  it("DETERMINISTIC SCHEMA: mọi scene luôn đủ field bắt buộc, đúng kiểu, kể cả khi rơi vào fallback", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null });
    const result = await planScenes({ topic: "t", knowledgeText: "A." });
    const s = result.scenes[0];
    expect(typeof s.id).toBe("string");
    expect(typeof s.title).toBe("string");
    expect(typeof s.order).toBe("number");
    expect(typeof s.durationSeconds).toBe("number");
    expect(typeof s.knowledgeReference).toBe("string");
    expect(typeof s.knowledgeStatement).toBe("string");
    expect(typeof s.visualDescription).toBe("string");
    expect(typeof s.camera).toBe("string");
    expect(typeof s.movement).toBe("string");
    expect(typeof s.environment).toBe("string");
    expect(typeof s.lighting).toBe("string");
    expect(typeof s.style).toBe("string");
    expect(Array.isArray(s.constraints)).toBe(true);
    expect(Array.isArray(s.negativeConstraints)).toBe(true);
    expect(typeof s.narrationHint).toBe("string");
  });

  it("constraints do admin khai báo trên KnowledgeItem luôn được giữ lại trên Scene (cả AI path lẫn fallback)", async () => {
    goiAiToolUseMock.mockResolvedValue({ input: null });
    const result = await planScenes({
      topic: "t",
      knowledge: [{ id: "k1", statement: "Giường đối diện cửa.", constraints: ["Giữ đúng vị trí cửa/giường"] }],
    });
    expect(result.scenes[0].constraints).toContain("Giữ đúng vị trí cửa/giường");
  });
});
