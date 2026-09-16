/**
 * SCENE VALIDATOR — STEP 4 §5: chặn Scene thiếu field NGAY TRƯỚC Prompt Builder, không để lỗi rơi
 * xuống tận lúc gọi LTX (tốn 1 lượt gọi mạng/tiền chỉ để phát hiện lỗi lẽ ra kiểm tra được offline).
 * Thuần deterministic, không gọi AI/mạng — cố tình nhỏ, không over-engineer.
 *
 * STEP 6 §1: đây là điểm CHẶN CHUNG cho MỌI Scene trước Prompt Builder (buildPrompt() gọi
 * assertValidScene() đầu tiên) — nên từ STEP 6, hàm này CŨNG chạy `checkSceneGrounding()` (dùng
 * chung với `scene-planner.ts`), không chỉ kiểm tra field rỗng. Nhờ vậy invariant "KNOWLEDGE = SOURCE
 * OF TRUTH" đúng ở MỌI entry point (kể cả Scene gửi thẳng qua API `/generate`, bỏ qua `/scenes`),
 * không chỉ đường đi qua Scene Planner.
 */
import type { Scene } from "./scene-planner";
import { checkSceneGrounding } from "./grounding";

export interface SceneValidationResult {
  valid: boolean;
  errors: string[];
}

const TRUONG_CHUOI_BAT_BUOC = [
  "visualDescription",
  "camera",
  "movement",
  "environment",
  "lighting",
  "style",
  "knowledgeReference",
  "knowledgeStatement",
  "title",
] as const satisfies readonly (keyof Scene)[];

/** Kiểm tra Scene đủ điều kiện đưa vào Prompt Builder hay chưa — KHÔNG sửa/bổ sung gì, chỉ báo cáo. */
export function validateScene(scene: Scene): SceneValidationResult {
  const errors: string[] = [];

  for (const truong of TRUONG_CHUOI_BAT_BUOC) {
    const giaTri = scene[truong];
    if (typeof giaTri !== "string" || giaTri.trim().length === 0) {
      errors.push(`Thiếu hoặc rỗng field bắt buộc: ${truong}`);
    }
  }

  if (!Array.isArray(scene.constraints)) {
    errors.push("constraints phải là mảng chuỗi.");
  } else if (scene.constraints.some((c) => typeof c !== "string" || c.trim().length === 0)) {
    errors.push("constraints chứa phần tử rỗng hoặc không phải chuỗi.");
  }

  if (!Array.isArray(scene.negativeConstraints)) {
    errors.push("negativeConstraints phải là mảng chuỗi.");
  } else if (scene.negativeConstraints.some((c) => typeof c !== "string" || c.trim().length === 0)) {
    errors.push("negativeConstraints chứa phần tử rỗng hoặc không phải chuỗi.");
  }

  if (typeof scene.durationSeconds !== "number" || !Number.isFinite(scene.durationSeconds) || scene.durationSeconds <= 0) {
    errors.push("durationSeconds phải là số dương.");
  }

  if (typeof scene.order !== "number" || !Number.isInteger(scene.order) || scene.order < 1) {
    errors.push("order phải là số nguyên >= 1.");
  }

  // Chỉ kiểm tra grounding khi các field liên quan đã đủ kiểu (tránh lỗi runtime nếu field khác đang
  // rỗng/sai kiểu — những lỗi đó đã được báo ở trên, không cần báo trùng).
  if (
    typeof scene.knowledgeStatement === "string" &&
    typeof scene.visualDescription === "string" &&
    Array.isArray(scene.constraints) &&
    Array.isArray(scene.negativeConstraints)
  ) {
    const grounding = checkSceneGrounding({
      knowledgeStatement: scene.knowledgeStatement,
      visualDescription: scene.visualDescription,
      constraints: scene.constraints.filter((c): c is string => typeof c === "string"),
      negativeConstraints: scene.negativeConstraints.filter((c): c is string => typeof c === "string"),
      narrationHint: typeof scene.narrationHint === "string" ? scene.narrationHint : "",
    });
    errors.push(...grounding.violations);
  }

  return { valid: errors.length === 0, errors };
}

export class SceneValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Scene không hợp lệ — Scene Validation chặn trước khi tới Prompt Builder: ${errors.join("; ")}`);
    this.name = "SceneValidationError";
    this.errors = errors;
  }
}

/** Ném `SceneValidationError` nếu Scene không hợp lệ — dùng đầu vào cho Prompt Builder/API route. */
export function assertValidScene(scene: Scene): void {
  const result = validateScene(scene);
  if (!result.valid) throw new SceneValidationError(result.errors);
}
