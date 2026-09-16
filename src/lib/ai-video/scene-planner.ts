/**
 * SCENE PLANNER — Phase 8 của kiến trúc CONG AI VIDEO, viết lại V1 đầy đủ (STEP 3, 13/9/2026):
 * chia 1 chủ đề phong thủy thành danh sách Scene có cấu trúc, LUÔN bám theo kiến thức phong thủy
 * CÓ SẴN (`knowledge`, do admin cung cấp — trích từ nội dung đã kiểm chứng trong `content/`/
 * `src/lib/*-engine`) — KHÔNG được tự bịa ra quy tắc/kết luận phong thủy mới.
 *
 * NGUYÊN TẮC CỐT LÕI — tách 3 tầng, không được trộn lẫn:
 *   KNOWLEDGE (knowledgeStatement)  — nguyên văn kiến thức phong thủy, KHÔNG BAO GIỜ để LLM viết lại
 *   VISUALIZATION (visualDescription/camera/movement/...) — LLM được quyền diễn giải HÌNH ẢNH
 *   PROMPT (do prompt-builder.ts tạo, KHÔNG nằm trong file này) — ghép visualization thành prompt AI Video
 *
 * RÀNG BUỘC "KHÔNG BỊA" được thực thi Ở KIẾN TRÚC, qua 2 lớp chặn độc lập, không chỉ ở lời dặn prompt:
 *   1. `knowledgeStatement` của Scene LUÔN được HỆ THỐNG gán lại nguyên văn từ knowledge gốc SAU khi
 *      LLM trả lời — LLM không có quyền tự viết field này (không đưa vào JSON schema yêu cầu LLM trả
 *      về), nên không có đường nào để LLM "diễn giải lại" kiến thức nguồn.
 *   2. Mọi field LLM ĐƯỢC quyền viết (visualDescription/constraints/negativeConstraints/narrationHint)
 *      bị quét qua `checkSceneGrounding()` (dùng CHUNG với `scene-validator.ts` — xem `grounding.ts`
 *      để biết vì sao tách riêng ở STEP 6) — cụm nào xuất hiện mà KHÔNG có trong knowledgeStatement gốc
 *      thì coi là LLM tự bịa kết luận mới, scene đó bị TỪ CHỐI (không sửa âm thầm) và THAY bằng bản mặc
 *      định grounded 100% (nguyên văn knowledge, không diễn giải) — ghi rõ trong `warnings`, không
 *      giấu việc này.
 *   Lớp (2) là 1 blocklist heuristic đơn giản (so khớp chuỗi con, không phải kiểm duyệt ngữ nghĩa đầy
 *   đủ) — đủ chặn các trường hợp hallucination rõ ràng phổ biến, KHÔNG phải giải pháp hoàn chỉnh.
 *
 * Nếu thiếu knowledge hoàn toàn: THROW rõ ràng, không tự sinh cảnh không có căn cứ (Phase 8/3).
 */
import { goiAiToolUse } from "../ai/goi-ai";
import { checkSceneGrounding } from "./grounding";

/** Giá trị nhỏ nhất hợp lệ đã XÁC MINH THẬT với LTX.io ở STEP 2 (docs.ltx.io/models/ltx-2-5) — dùng
 * làm mặc định để Scene → Prompt Builder → VideoGenerationRequest luôn hợp lệ ngay từ đầu. */
export const DEFAULT_SCENE_DURATION_SECONDS = 6;

export interface KnowledgeItem {
  id: string;
  /** Nguyên văn 1 ý kiến thức phong thủy — KHÔNG được diễn giải lại ở bất kỳ đâu trong pipeline. */
  statement: string;
  /** Trích dẫn nguồn (tùy chọn) — không bắt buộc để tạo Scene, chỉ để truy vết sau này. */
  source?: string;
  /** Ràng buộc admin muốn giữ nguyên khi visualize (vd "giữ đúng vị trí cửa/giường"). */
  constraints?: string[];
}

export interface Scene {
  id: string;
  title: string;
  /** Thứ tự hiển thị, bắt đầu từ 1. */
  order: number;
  durationSeconds: number;
  /** id của KnowledgeItem mà cảnh này minh họa — luôn có, dùng để truy vết cảnh về đúng nguồn. */
  knowledgeReference: string;
  /** Nguyên văn kiến thức nguồn — LUÔN do hệ thống gán, KHÔNG BAO GIỜ do LLM viết. */
  knowledgeStatement: string;
  /** Mô tả HÌNH ẢNH cụ thể (không gian, vật thể, hành động) — khác hẳn knowledgeStatement. */
  visualDescription: string;
  camera: string;
  movement: string;
  environment: string;
  lighting: string;
  style: string;
  constraints: string[];
  negativeConstraints: string[];
  /** Gợi ý lời thoại/voice-over (tùy chọn) — không dùng trong prompt hình ảnh. */
  narrationHint: string;
}

export interface PlanScenesInput {
  topic: string;
  /** Ưu tiên nếu có — knowledge có cấu trúc đầy đủ (source/constraints riêng từng ý). */
  knowledge?: KnowledgeItem[];
  /** Tiện dụng: text thô, mỗi dòng (hoặc gạch đầu dòng/số thứ tự) là 1 ý — tự tách qua `splitKnowledgeIntoPoints`. */
  knowledgeText?: string;
}

export interface PlanScenesResult {
  topic: string;
  scenes: Scene[];
  /** Cảnh nào bị LLM output không hợp lệ/bịa kết luận và đã bị thay bằng bản mặc định grounded — KHÔNG giấu việc này. */
  warnings: string[];
}

/** Tách văn bản kiến thức thành từng điểm rời — bỏ gạch đầu dòng/số thứ tự, bỏ dòng trống. */
export function splitKnowledgeIntoPoints(knowledgeText: string): KnowledgeItem[] {
  return knowledgeText
    .split("\n")
    .map((line) => line.replace(/^[-*••]\s*|^\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .map((text, i) => ({ id: `k${i + 1}`, statement: text }));
}

const MAC_DINH_HINH_ANH = {
  camera: "static wide shot",
  movement: "slow dolly-in",
  environment: "modern Vietnamese home interior",
  lighting: "soft natural daylight",
  style: "cinematic, photorealistic, shallow depth of field",
} as const;

function buildFallbackScene(point: KnowledgeItem, order: number): Scene {
  return {
    id: `scene-${point.id}`,
    title: `Cảnh ${order}`,
    order,
    durationSeconds: DEFAULT_SCENE_DURATION_SECONDS,
    knowledgeReference: point.id,
    knowledgeStatement: point.statement,
    // Fallback AN TOÀN TUYỆT ĐỐI: hiển thị nguyên văn, không diễn giải gì thêm (không có gì để bịa).
    visualDescription: point.statement,
    ...MAC_DINH_HINH_ANH,
    constraints: point.constraints ?? [],
    negativeConstraints: [],
    narrationHint: point.statement,
  };
}

interface RawAiScene {
  title?: unknown;
  visual_description?: unknown;
  camera?: unknown;
  movement?: unknown;
  environment?: unknown;
  lighting?: unknown;
  style?: unknown;
  constraints?: unknown;
  negative_constraints?: unknown;
  narration_hint?: unknown;
  knowledge_ref?: unknown;
}

function chuoiMang(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/**
 * Kiểm tra + chuyển đổi 1 candidate scene do LLM trả về thành `Scene` hợp lệ — trả `null` nếu
 * schema sai kiểu HOẶC chứa kết luận bịa đặt (bên gọi tự lùi về `buildFallbackScene` cho đúng
 * knowledge point đó, không cố "sửa" candidate).
 *
 * STEP 6 §1: build Scene ĐẦY ĐỦ trước (với `knowledgeStatement` gán từ nguồn, KHÔNG BAO GIỜ từ LLM),
 * rồi chạy `checkSceneGrounding()` TRÊN CHÍNH Scene đó — dùng chung code với `scene-validator.ts`
 * (không tự copy blocklist riêng ở đây nữa).
 */
function xacThucSceneTuAi(raw: RawAiScene, point: KnowledgeItem, order: number): Scene | null {
  if (
    typeof raw.title !== "string" ||
    typeof raw.visual_description !== "string" ||
    typeof raw.camera !== "string" ||
    typeof raw.movement !== "string" ||
    typeof raw.environment !== "string" ||
    typeof raw.lighting !== "string" ||
    typeof raw.style !== "string" ||
    raw.knowledge_ref !== point.id
  ) {
    return null;
  }

  const scene: Scene = {
    id: `scene-${point.id}`,
    title: raw.title,
    order,
    durationSeconds: DEFAULT_SCENE_DURATION_SECONDS,
    knowledgeReference: point.id,
    knowledgeStatement: point.statement, // LUÔN gán từ nguồn — KHÔNG BAO GIỜ lấy từ LLM.
    visualDescription: raw.visual_description,
    camera: raw.camera,
    movement: raw.movement,
    environment: raw.environment,
    lighting: raw.lighting,
    style: raw.style,
    constraints: [...(point.constraints ?? []), ...chuoiMang(raw.constraints)],
    negativeConstraints: chuoiMang(raw.negative_constraints),
    narrationHint: typeof raw.narration_hint === "string" ? raw.narration_hint : point.statement,
  };

  if (!checkSceneGrounding(scene).grounded) {
    return null;
  }

  return scene;
}

async function goiAiChiaCanh(topic: string, knowledge: KnowledgeItem[]): Promise<Map<string, RawAiScene> | null> {
  const validIds = knowledge.map((k) => k.id);
  const schema = {
    type: "object",
    properties: {
      scenes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            knowledge_ref: { type: "string", enum: validIds, description: "Bắt buộc chọn ĐÚNG 1 id có sẵn." },
            title: { type: "string" },
            visual_description: {
              type: "string",
              description: "Mô tả HÌNH ẢNH cụ thể (không gian, vật thể, hành động, góc nhìn) để AI Video visualize — KHÔNG lặp lý thuyết, KHÔNG thêm kết luận/quy tắc phong thủy mới ngoài knowledge đã cho.",
            },
            camera: { type: "string", description: "Góc máy, vd 'static wide shot', 'low angle'." },
            movement: { type: "string", description: "Chuyển động camera, vd 'slow dolly-in', 'static'." },
            environment: { type: "string" },
            lighting: { type: "string" },
            style: { type: "string" },
            constraints: { type: "array", items: { type: "string" }, description: "Ràng buộc hình ảnh cần GIỮ ĐÚNG (vd vị trí cửa/giường theo statement)." },
            negative_constraints: { type: "array", items: { type: "string" }, description: "Thứ cần TRÁNH xuất hiện trong hình." },
            narration_hint: { type: "string" },
          },
          required: ["knowledge_ref", "title", "visual_description", "camera", "movement", "environment", "lighting", "style"],
        },
      },
    },
    required: ["scenes"],
  };

  const systemCoDinh = [
    "Bạn là Scene Planner cho CONG AI VIDEO — chuyển kiến thức phong thủy thành mô tả HÌNH ẢNH cho AI Video.",
    "Nhiệm vụ CHỈ là: Knowledge → Scene có cấu trúc (visual/camera/movement/environment/lighting/style).",
    "TUYỆT ĐỐI KHÔNG được: thay đổi/diễn giải lại nội dung kiến thức nguồn; thêm quy tắc phong thủy mới;",
    "thêm kết luận/hậu quả/nguyên nhân KHÔNG có trong kiến thức đã cho (vd không tự thêm 'gây mất tài lộc'",
    "nếu kiến thức nguồn không nói vậy). Chỉ mô tả HÌNH ẢNH khách quan minh họa đúng ý đã cho.",
  ].join("\n");
  const systemThayDoi = `Danh sách kiến thức (id: nội dung):\n${knowledge.map((k) => `${k.id}: ${k.statement}`).join("\n")}`;

  const ket = await goiAiToolUse({
    tinhNang: "cong-ai-video-scene-planner",
    systemCoDinh,
    systemThayDoi,
    userMessage: `Chủ đề: ${topic}\nHãy tạo đúng ${knowledge.length} cảnh, mỗi điểm kiến thức tương ứng 1 cảnh.`,
    toolName: "tra_ve_danh_sach_canh",
    schema,
    maxTokens: 3000,
  });

  if (!ket.input) return null;
  const rawScenes = (ket.input as { scenes?: unknown[] }).scenes;
  if (!Array.isArray(rawScenes)) return null;

  const map = new Map<string, RawAiScene>();
  for (const raw of rawScenes) {
    const r = raw as RawAiScene;
    if (typeof r.knowledge_ref === "string") map.set(r.knowledge_ref, r);
  }
  return map;
}

/** Chuẩn hoá input về `KnowledgeItem[]` — ưu tiên `knowledge` có cấu trúc, fallback `knowledgeText`. */
function chuanHoaKnowledge(input: PlanScenesInput): KnowledgeItem[] {
  if (input.knowledge && input.knowledge.length > 0) return input.knowledge;
  if (input.knowledgeText && input.knowledgeText.trim().length > 0) return splitKnowledgeIntoPoints(input.knowledgeText);
  return [];
}

/**
 * Chia chủ đề thành danh sách Scene có cấu trúc. LUÔN grounded theo knowledge đã cho — không có
 * knowledge thì THROW, không tự sinh cảnh không có căn cứ. Luôn trả đúng 1 Scene / 1 KnowledgeItem —
 * cảnh nào LLM trả sai schema hoặc chứa kết luận bịa đặt bị THAY bằng bản mặc định grounded, có ghi
 * `warnings` (không giấu việc này).
 */
export async function planScenes(input: PlanScenesInput): Promise<PlanScenesResult> {
  const knowledge = chuanHoaKnowledge(input);
  if (knowledge.length === 0) {
    throw new Error("Thiếu kiến thức phong thủy đầu vào — không thể tạo Scene không có căn cứ.");
  }

  const aiScenesTheoId = await goiAiChiaCanh(input.topic, knowledge);
  const scenes: Scene[] = [];
  const warnings: string[] = [];

  knowledge.forEach((point, i) => {
    const order = i + 1;
    const raw = aiScenesTheoId?.get(point.id);
    if (!raw) {
      if (aiScenesTheoId) warnings.push(`Cảnh cho "${point.id}" thiếu trong kết quả AI — dùng bản mặc định grounded.`);
      scenes.push(buildFallbackScene(point, order));
      return;
    }
    const daXacThuc = xacThucSceneTuAi(raw, point, order);
    if (!daXacThuc) {
      warnings.push(`Cảnh cho "${point.id}" bị AI trả sai schema hoặc chứa kết luận không có trong kiến thức nguồn — đã thay bằng bản mặc định grounded.`);
      scenes.push(buildFallbackScene(point, order));
      return;
    }
    scenes.push(daXacThuc);
  });

  return { topic: input.topic, scenes, warnings };
}
