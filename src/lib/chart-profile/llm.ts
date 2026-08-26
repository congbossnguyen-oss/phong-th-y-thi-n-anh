/**
 * Gọi Claude (Anthropic Messages API) để luận Bát Tự — CHỈ tầng gọi mạng + ép JSON có cấu trúc,
 * không tự luận gì ở đây (mọi câu chữ luận giải nằm trong response của model).
 *
 * Dùng tool-use (function calling) để ÉP JSON đúng khuôn thay vì xin JSON dạng văn bản tự do rồi
 * tự parse — tránh lỗi model lỡ kèm chữ ngoài JSON hoặc bọc trong markdown fence.
 *
 * Không thêm SDK ngoài (@anthropic-ai/sdk) — gọi thẳng REST bằng fetch, theo đúng quy ước dự án
 * (đã tự viết rate-limit thay vì thêm package, xem src/lib/rate-limit.ts) để không tăng bề mặt
 * phụ thuộc cho một lệnh gọi HTTP đơn giản.
 */
import type { BatTuLuanGiai, ManhPhaiLuanGiai, DaiVanLuanGiai } from "./types";
import { coAnthropicApiKey, layAnthropicApiKey } from "./api-key";
import { ghiLogChiPhi, type UsageAnthropic } from "./ghi-log-chi-phi";
import { ANTHROPIC_MESSAGES_URL as ANTHROPIC_API_URL, anthropicHeaders } from "../anthropic-gateway";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 4000;

const TOOL_NAME = "tra_ve_luan_giai_bat_tu";

const NGU_HANH_ENUM = ["kim", "moc", "thuy", "hoa", "tho", "insufficient_data"];
const VUONG_SUY_ENUM = [
  "cuc_cuong", "cuong_vuong", "vuong", "trung_hoa", "suy", "nhuoc", "cuc_nhuoc", "insufficient_data",
];
const MECHANISM_ENUM = [
  "thuc_thuong_che_quan_sat", "tai_che_an", "quan_sat_che_ty_kiep", "an_che_thuc_thuong",
  "ty_kiep_che_tai", "hoa_quan_sat_sinh_an", "thuc_than_sinh_tai", "thuong_quan_sinh_tai",
  "hop_dung", "che_mo_kho", "insufficient_data",
];
const MUC_ENUM = ["cao", "trung_binh", "thap", "insufficient_data"];
const DUNG_HY_ENUM = ["dung", "hy", "trung", "ky", "insufficient_data"];

function buildInputSchema(soDaiVan: number) {
  return {
    type: "object",
    properties: {
      vuong_suy: { type: "string", enum: VUONG_SUY_ENUM },
      dung_than: { type: "string", enum: NGU_HANH_ENUM },
      hy_than: { type: "string", enum: NGU_HANH_ENUM },
      ky_than: { type: "string", enum: NGU_HANH_ENUM },
      cach_cuc: { type: "array", items: { type: "string" } },
      thap_than_noi_bat: { type: "array", items: { type: "string" } },
      manh_phai: {
        type: "object",
        properties: {
          the: { type: "string", enum: ["vuong", "nhuoc", "insufficient_data"] },
          to_cong: { type: "string" },
          cau_truc: { type: "string", enum: MECHANISM_ENUM },
          chinh_phan_cuc: { type: "string", enum: ["chinh_cuc", "phan_cuc", "insufficient_data"] },
          hieu_suat: {
            type: "object",
            properties: {
              co_che: { type: "string", enum: ["xung", "hinh", "hai", "insufficient_data"] },
              muc: { type: "string", enum: MUC_ENUM },
            },
            required: ["co_che", "muc"],
          },
        },
        required: ["the", "to_cong", "cau_truc", "chinh_phan_cuc", "hieu_suat"],
      },
      dai_van: {
        type: "array",
        minItems: soDaiVan,
        maxItems: soDaiVan,
        items: {
          type: "object",
          properties: {
            dungHy: { type: "string", enum: DUNG_HY_ENUM },
            chuDe: { type: "string" },
            mucThuan: { type: "string", enum: MUC_ENUM },
          },
          required: ["dungHy", "chuDe", "mucThuan"],
        },
      },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: ["vuong_suy", "dung_than", "hy_than", "ky_than", "cach_cuc", "thap_than_noi_bat", "manh_phai", "dai_van", "warnings"],
  } as const;
}

export interface LlmBatTuOutput {
  bat_tu: Pick<BatTuLuanGiai, "vuong_suy" | "dung_than" | "hy_than" | "cach_cuc" | "thap_than_noi_bat"> & {
    ky_than: string;
  };
  manh_phai: Omit<ManhPhaiLuanGiai, "source" | "hieu_suat"> & {
    hieu_suat: { co_che: ManhPhaiLuanGiai["hieu_suat"]["co_che"]; muc: ManhPhaiLuanGiai["hieu_suat"]["muc"] };
  };
  dai_van: Omit<DaiVanLuanGiai, "tuTuoi" | "denTuoi" | "can_chi" | "ngu_hanh">[];
  warnings: string[];
  model: string;
}

export type LlmCallResult =
  | { ok: true; output: LlmBatTuOutput }
  | { ok: false; reason: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; detail: string };

export function isAiConfigured(): boolean {
  return coAnthropicApiKey();
}

export async function callBatTuLlm(
  systemPrompt: string,
  userPrompt: string,
  soDaiVan: number,
): Promise<LlmCallResult> {
  const apiKey = layAnthropicApiKey();
  if (!apiKey) {
    return {
      ok: false,
      reason: "khong_co_api_key",
      detail: "Chưa cấu hình ANTHROPIC_API_KEY — xem .env.example. Module vẫn trả được Tứ Trụ/Đại Vận (thuần code), chỉ chưa luận giải được.",
    };
  }
  const model = import.meta.env?.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const reqBody = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    // Prompt caching: khối tri thức (system) GIỐNG NHAU mọi khách → cache 1 lần, các lần sau đọc lại
    // ~0.1x giá. Chỉ phần "facts" của từng khách nằm ở userPrompt (sau breakpoint) mới tính giá đầy đủ.
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPrompt }],
    tools: [{ name: TOOL_NAME, description: "Trả về kết quả luận giải Bát Tự đúng cấu trúc.", input_schema: buildInputSchema(soDaiVan) }],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  // Retry lỗi TẠM (mạng, 429 quá tải, 5xx, 529 overloaded) tối đa 3 lần — tránh 1 blip làm hỏng
  // luận. Lỗi khác (400/401...) không retry vì retry cũng vô ích.
  const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
  let res: Response | null = null;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: anthropicHeaders(apiKey, ANTHROPIC_VERSION),
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

  const data = (await res.json()) as {
    content?: { type: string; input?: unknown }[];
    usage?: UsageAnthropic;
  };
  // Ghi chi phí lượt gọi vào log máy chủ (Render → Logs, lọc "AI-COST").
  ghiLogChiPhi("Bát Tự", model, data.usage);
  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return { ok: false, reason: "phan_hoi_khong_hop_le", detail: "Model không trả tool_use hợp lệ." };
  }

  const input = toolUse.input as Record<string, unknown>;

  // Null-safe: field model bỏ sót → "insufficient_data" (KHÔNG thành chuỗi "undefined"). Không từ
  // chối cả phản hồi khi thiếu 1 field — vẫn dùng phần model trả được (vd Dụng Thần + Thập Thần),
  // để module nghề còn tính fallback thay vì mất trắng.
  const s = (v: unknown) => (v == null ? "insufficient_data" : String(v));
  try {
    const bat_tu = {
      vuong_suy: s(input.vuong_suy),
      dung_than: s(input.dung_than),
      hy_than: s(input.hy_than),
      ky_than: s(input.ky_than),
      cach_cuc: Array.isArray(input.cach_cuc) ? input.cach_cuc.map(String) : [],
      thap_than_noi_bat: Array.isArray(input.thap_than_noi_bat) ? input.thap_than_noi_bat.map(String) : [],
    } as LlmBatTuOutput["bat_tu"];

    const mp = input.manh_phai as Record<string, unknown>;
    const hieuSuat = mp?.hieu_suat as Record<string, unknown>;
    const manh_phai: LlmBatTuOutput["manh_phai"] = {
      the: String(mp?.the ?? "insufficient_data") as ManhPhaiLuanGiai["the"],
      to_cong: String(mp?.to_cong ?? "insufficient_data"),
      cau_truc: String(mp?.cau_truc ?? "insufficient_data") as ManhPhaiLuanGiai["cau_truc"],
      chinh_phan_cuc: String(mp?.chinh_phan_cuc ?? "insufficient_data") as ManhPhaiLuanGiai["chinh_phan_cuc"],
      hieu_suat: {
        co_che: String(hieuSuat?.co_che ?? "insufficient_data") as ManhPhaiLuanGiai["hieu_suat"]["co_che"],
        muc: String(hieuSuat?.muc ?? "insufficient_data") as ManhPhaiLuanGiai["hieu_suat"]["muc"],
      },
    };

    const dai_van = Array.isArray(input.dai_van)
      ? (input.dai_van as Record<string, unknown>[]).map((d) => ({
          dungHy: String(d.dungHy ?? "insufficient_data") as DaiVanLuanGiai["dungHy"],
          chuDe: String(d.chuDe ?? "insufficient_data"),
          mucThuan: String(d.mucThuan ?? "insufficient_data") as DaiVanLuanGiai["mucThuan"],
        }))
      : [];

    const warnings = Array.isArray(input.warnings) ? input.warnings.map(String) : [];

    return { ok: true, output: { bat_tu, manh_phai, dai_van, warnings, model } };
  } catch (err) {
    return {
      ok: false,
      reason: "phan_hoi_khong_hop_le",
      detail: `Không đọc được cấu trúc phản hồi: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
