/**
 * Gọi Claude luận TỬ VI (Nam Phái) — tầng gọi mạng + ép JSON có cấu trúc (tool-use). Không tự luận.
 * Song song `llm.ts` (Bát Tự): cùng model, cùng retry lỗi tạm, cùng prompt caching khối tri thức.
 */
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 2000;
const TOOL_NAME = "tra_ve_luan_giai_tu_vi";

const ARCHETYPE_ENUM = ["tu_phu_vu_tuong", "sat_pha_liem_tham", "co_nguyet_dong_luong", "insufficient_data"];
const PHU_CACH_ENUM = ["cu_nhat", "cu_co_mao_dau", "tham_vu_dong_hanh", "tang_ho_thu_menh", "van_tinh_am_cung", "dich_ma"];
const DO_SANG_ENUM = ["mieu_vuong", "binh", "ham", "insufficient_data"];
const CAT_HUNG_ENUM = ["cat", "binh", "hung", "insufficient_data"];
const CHU_DE_ENUM = ["hoc_tap", "su_nghiep", "tai_van", "hon_nhan", "suc_khoe", "insufficient_data"];
const MUC_THUAN_ENUM = ["cao", "trung_binh", "thap", "insufficient_data"];

function buildInputSchema(soDaiHan: number) {
  return {
    type: "object",
    properties: {
      menh_cach: {
        type: "object",
        properties: {
          chinh: { type: "string", enum: ARCHETYPE_ENUM },
          phu: { type: "array", items: { type: "string", enum: PHU_CACH_ENUM } },
          vo_chinh_dieu: { type: "boolean" },
          muon_cach_cung_di: { type: "boolean" },
          do_sang: { type: "string", enum: DO_SANG_ENUM },
        },
        required: ["chinh", "phu", "vo_chinh_dieu", "muon_cach_cung_di", "do_sang"],
      },
      danh_gia_cung: {
        type: "object",
        properties: {
          quan_loc: { type: "string", enum: CAT_HUNG_ENUM },
          tai_bach: { type: "string", enum: CAT_HUNG_ENUM },
          thien_di: { type: "string", enum: CAT_HUNG_ENUM },
          phuc_duc: { type: "string", enum: CAT_HUNG_ENUM },
        },
        required: ["quan_loc", "tai_bach", "thien_di", "phuc_duc"],
      },
      dai_han: {
        type: "array",
        minItems: soDaiHan,
        maxItems: soDaiHan,
        items: {
          type: "object",
          properties: {
            chuDe: { type: "string", enum: CHU_DE_ENUM },
            mucThuan: { type: "string", enum: MUC_THUAN_ENUM },
          },
          required: ["chuDe", "mucThuan"],
        },
      },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: ["menh_cach", "danh_gia_cung", "dai_han", "warnings"],
  } as const;
}

export interface LlmTuViOutput {
  menh_cach: { chinh: string; phu: string[]; vo_chinh_dieu: boolean; muon_cach_cung_di: boolean; do_sang: string };
  danh_gia_cung: { quan_loc: string; tai_bach: string; thien_di: string; phuc_duc: string };
  dai_han: { chuDe: string; mucThuan: string }[];
  warnings: string[];
  model: string;
}

export type LlmTuViResult =
  | { ok: true; output: LlmTuViOutput }
  | { ok: false; reason: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; detail: string };

export function isTuViAiConfigured(): boolean {
  return Boolean(import.meta.env?.ANTHROPIC_API_KEY);
}

export async function callTuViLlm(systemPrompt: string, userPrompt: string, soDaiHan: number): Promise<LlmTuViResult> {
  const apiKey = import.meta.env?.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, reason: "khong_co_api_key", detail: "Chưa cấu hình ANTHROPIC_API_KEY." };
  const model = import.meta.env?.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const reqBody = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPrompt }],
    tools: [{ name: TOOL_NAME, description: "Trả về kết quả luận giải Tử Vi đúng cấu trúc.", input_schema: buildInputSchema(soDaiHan) }],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
  let res: Response | null = null;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
        body: reqBody,
      });
    } catch (err) {
      lastErr = err instanceof Error ? err.message : "Lỗi mạng khi gọi Anthropic API.";
      res = null;
    }
    if (res && res.ok) break;
    if (res && !RETRYABLE.has(res.status)) break;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
  }

  if (!res) return { ok: false, reason: "loi_goi_api", detail: lastErr || "Lỗi mạng khi gọi Anthropic API." };
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, reason: "loi_goi_api", detail: `Anthropic API trả HTTP ${res.status}: ${body.slice(0, 500)}` };
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[] };
  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return { ok: false, reason: "phan_hoi_khong_hop_le", detail: "Model không trả tool_use hợp lệ." };
  }

  const input = toolUse.input as Record<string, unknown>;
  const s = (v: unknown) => (v == null ? "insufficient_data" : String(v));
  try {
    const mc = (input.menh_cach ?? {}) as Record<string, unknown>;
    const dgc = (input.danh_gia_cung ?? {}) as Record<string, unknown>;
    const menh_cach = {
      chinh: s(mc.chinh),
      phu: Array.isArray(mc.phu) ? mc.phu.map(String) : [],
      vo_chinh_dieu: Boolean(mc.vo_chinh_dieu),
      muon_cach_cung_di: Boolean(mc.muon_cach_cung_di),
      do_sang: s(mc.do_sang),
    };
    const danh_gia_cung = {
      quan_loc: s(dgc.quan_loc),
      tai_bach: s(dgc.tai_bach),
      thien_di: s(dgc.thien_di),
      phuc_duc: s(dgc.phuc_duc),
    };
    const dai_han = Array.isArray(input.dai_han)
      ? (input.dai_han as Record<string, unknown>[]).map((d) => ({ chuDe: s(d.chuDe), mucThuan: s(d.mucThuan) }))
      : [];
    const warnings = Array.isArray(input.warnings) ? input.warnings.map(String) : [];
    return { ok: true, output: { menh_cach, danh_gia_cung, dai_han, warnings, model } };
  } catch (err) {
    return { ok: false, reason: "phan_hoi_khong_hop_le", detail: `Không đọc được cấu trúc: ${err instanceof Error ? err.message : String(err)}` };
  }
}
