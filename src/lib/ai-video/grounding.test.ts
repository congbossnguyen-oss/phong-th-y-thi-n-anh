import { describe, expect, it } from "vitest";
import { checkSceneGrounding, coCumBiaDat } from "./grounding";

const KNOWLEDGE = "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.";

function sceneMau(overrides: Partial<Parameters<typeof checkSceneGrounding>[0]> = {}) {
  return {
    knowledgeStatement: KNOWLEDGE,
    visualDescription: "Phòng ngủ hiện đại, camera cho thấy giường đối diện cửa.",
    constraints: [] as string[],
    negativeConstraints: [] as string[],
    narrationHint: "",
    ...overrides,
  };
}

describe("coCumBiaDat", () => {
  it("false khi văn bản không chứa cụm nhạy cảm nào", () => {
    expect(coCumBiaDat("Phòng ngủ hiện đại, ánh sáng tự nhiên.", KNOWLEDGE)).toBe(false);
  });

  it("true khi văn bản chứa cụm nhạy cảm mà knowledge KHÔNG có", () => {
    expect(coCumBiaDat("Cách bố trí này gây mất tài lộc.", KNOWLEDGE)).toBe(true);
  });

  it("false khi cụm nhạy cảm CÓ SẴN trong chính knowledge (không false positive)", () => {
    const knowledgeCoCum = "Giường đối diện cửa được cho là gây mất tài lộc theo dân gian.";
    expect(coCumBiaDat("Hình ảnh minh họa cách bố trí gây mất tài lộc.", knowledgeCoCum)).toBe(false);
  });
});

describe("checkSceneGrounding — dùng CHUNG cho scene-planner VÀ scene-validator (STEP 6 §1)", () => {
  it("A. Scene hợp lệ (không có cụm bịa đặt) -> grounded: true", () => {
    const result = checkSceneGrounding(sceneMau());
    expect(result).toEqual({ grounded: true, violations: [] });
  });

  it("B. visualDescription chứa kết luận phong thủy bịa đặt -> grounded: false, có violation cụ thể", () => {
    const result = checkSceneGrounding(
      sceneMau({ visualDescription: "Giường đối diện cửa, cách bố trí này gây mất tài lộc cho gia chủ." }),
    );
    expect(result.grounded).toBe(false);
    expect(result.violations[0]).toContain("visualDescription");
    expect(result.violations[0]).toContain("mất tài lộc");
  });

  it("vi phạm ở constraints/negativeConstraints/narrationHint cũng bị bắt (không chỉ visualDescription)", () => {
    expect(checkSceneGrounding(sceneMau({ constraints: ["Bố trí này sẽ gây bệnh cho gia chủ."] })).grounded).toBe(false);
    expect(checkSceneGrounding(sceneMau({ negativeConstraints: ["tránh thể hiện cảnh vận xui"] })).grounded).toBe(false);
    expect(checkSceneGrounding(sceneMau({ narrationHint: "Cách này dẫn tới ly hôn." })).grounded).toBe(false);
  });

  it("E. Không false-positive khi cụm nhạy cảm đã CÓ SẴN trong knowledgeStatement", () => {
    const result = checkSceneGrounding(
      sceneMau({
        knowledgeStatement: "Giường đối diện cửa được cho là gây mất tài lộc theo quan niệm dân gian.",
        visualDescription: "Hình ảnh minh họa cách bố trí được cho là gây mất tài lộc.",
      }),
    );
    expect(result).toEqual({ grounded: true, violations: [] });
  });

  it("KHÔNG tự sửa/suy đoán knowledgeStatement — chỉ đọc, không mutate input", () => {
    const scene = sceneMau({ visualDescription: "Gây mất tài lộc hoàn toàn." });
    const before = JSON.stringify(scene);
    checkSceneGrounding(scene);
    expect(JSON.stringify(scene)).toBe(before);
  });
});
