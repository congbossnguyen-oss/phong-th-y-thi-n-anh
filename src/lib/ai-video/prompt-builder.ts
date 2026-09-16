/**
 * PROMPT BUILDER — Phase 9 của kiến trúc CONG AI VIDEO: chuyển 1 `Scene` (đã được Scene Planner tạo,
 * bám sát kiến thức phong thủy có sẵn) thành prompt AI Video phẳng, đúng thứ tự ưu tiên chốt ở STEP 3:
 * visualDescription → camera → movement → environment → lighting → style → constraints.
 *
 * `knowledgeStatement` CỐ TÌNH KHÔNG xuất hiện trong prompt — nó chỉ để đảm bảo Scene đúng nội dung
 * (grounding, xem scene-planner.ts), không phải nguyên liệu để nhồi vào prompt hình ảnh cho model
 * video (model video cần mô tả HÌNH ẢNH, không cần một đoạn lý thuyết phong thủy dài dòng).
 *
 * Thuần templating, KHÔNG gọi AI — dễ test, không phụ thuộc mạng.
 */
import type { Scene } from "./scene-planner";
import { assertValidScene } from "./scene-validator";

export interface BuiltPrompt {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  durationSeconds: number;
}

const NEGATIVE_MAC_DINH = [
  "text overlay",
  "watermark",
  "logo",
  "distorted face",
  "extra limbs",
  "blurry",
  "low quality",
];

/** Ghép các trục hình ảnh của Scene thành prompt phẳng (chuỗi) đúng shape `VideoGenerationRequest` cần. */
export function buildPrompt(scene: Scene, options: { aspectRatio?: string } = {}): BuiltPrompt {
  // Chặn NGAY TẠI ĐÂY (Scene Validation) — không để Scene thiếu field rơi xuống tận lúc gọi provider,
  // tốn 1 lượt gọi mạng/tiền chỉ để phát hiện lỗi lẽ ra kiểm tra được offline (STEP 4 §5).
  assertValidScene(scene);

  const prompt = [
    scene.visualDescription.trim(),
    `Environment: ${scene.environment}.`,
    `Camera: ${scene.camera}.`,
    `Movement: ${scene.movement}.`,
    `Lighting: ${scene.lighting}.`,
    `Style: ${scene.style}.`,
    ...(scene.constraints.length > 0 ? [`Constraints: ${scene.constraints.join("; ")}.`] : []),
  ].join(" ");

  const negativePrompt = [...NEGATIVE_MAC_DINH, ...scene.negativeConstraints].join(", ");

  return {
    prompt,
    negativePrompt,
    aspectRatio: options.aspectRatio ?? "9:16",
    durationSeconds: scene.durationSeconds,
  };
}

/** Tiện dụng: gắn `prompt`/`negativePrompt` thẳng lên Scene (khớp field "prompt" trong Scene schema STEP 3). */
export function attachPromptToScene(scene: Scene, options: { aspectRatio?: string } = {}): Scene & BuiltPrompt {
  return { ...scene, ...buildPrompt(scene, options) };
}
