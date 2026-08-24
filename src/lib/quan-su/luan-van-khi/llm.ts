/**
 * Gọi Claude để viết lời luận Vận Khí — CHỈ tầng gọi mạng + ép JSON đúng khuôn, không tính toán gì.
 *
 * Theo đúng quy ước dự án (giống quan-su/luan-giai/llm.ts, chart-profile/llm.ts): gọi thẳng REST
 * bằng fetch, không thêm SDK; dùng tool-use để ép JSON; bật prompt caching cho khối tri thức tĩnh.
 */
import { layAnthropicApiKey } from "../../chart-profile/api-key";
import { ghiLogChiPhi, type UsageAnthropic } from "../../chart-profile/ghi-log-chi-phi";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1500;
const TOOL_NAME = "tra_ve_loi_luan_van_khi";

export interface LoiLuan4LinhVuc {
  tai_van: string;
  quan_van: string;
  suc_khoe: string;
  tinh_duyen: string;
}

export type KetQuaLlmVanKhi =
  | { ok: true; loiLuan: LoiLuan4LinhVuc }
  | { ok: false; ly_do: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; chi_tiet: string };

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    tai_van: { type: "string", description: "Lời luận Tài vận, 2-4 câu, viết từ canCu được cung cấp." },
    quan_van: { type: "string", description: "Lời luận Quan vận/Sự nghiệp, 2-4 câu." },
    suc_khoe: { type: "string", description: "Lời luận Sức khỏe, 2-4 câu, không nêu bệnh danh cụ thể." },
    tinh_duyen: { type: "string", description: "Lời luận Tình duyên/Hôn nhân, 2-4 câu, không nói ly hôn/chia tay/mất người." },
  },
  required: ["tai_van", "quan_van", "suc_khoe", "tinh_duyen"],
} as const;

export async function goiLoiLuanVanKhi(
  promptTriThuc: string,
  promptQuyTac: string,
  promptNguoiDung: string,
): Promise<KetQuaLlmVanKhi> {
  const apiKey = layAnthropicApiKey();
  if (!apiKey) {
    return {
      ok: false,
      ly_do: "khong_co_api_key",
      chi_tiet: "Chưa cấu hình ANTHROPIC_API_KEY. Điểm số vẫn tính được (thuần code), dùng câu mẫu an toàn thay lời luận AI.",
    };
  }

  const model = (typeof process !== "undefined" ? process.env?.ANTHROPIC_MODEL : undefined) || DEFAULT_MODEL;

  const reqBody = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: promptTriThuc, cache_control: { type: "ephemeral" } },
      { type: "text", text: promptQuyTac, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: promptNguoiDung }],
    tools: [{ name: TOOL_NAME, description: "Trả về lời luận Vận Khí đúng cấu trúc 4 lĩnh vực.", input_schema: INPUT_SCHEMA }],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
  let res: Response | null = null;
  let loiCuoi = "";
  for (let lan = 1; lan <= 3; lan++) {
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
        body: reqBody,
      });
    } catch (err) {
      loiCuoi = err instanceof Error ? err.message : "Lỗi mạng khi gọi Anthropic API.";
      res = null;
    }
    if (res && res.ok) break;
    if (res && !RETRYABLE.has(res.status)) break;
    if (lan < 3) await new Promise((r) => setTimeout(r, 800 * lan));
  }

  if (!res) return { ok: false, ly_do: "loi_goi_api", chi_tiet: loiCuoi || "Lỗi mạng khi gọi Anthropic API." };
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, ly_do: "loi_goi_api", chi_tiet: `Anthropic API trả HTTP ${res.status}: ${body.slice(0, 500)}` };
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[]; usage?: UsageAnthropic };
  ghiLogChiPhi("Vận Khí", model, data.usage);

  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Model không trả tool_use hợp lệ." };
  }

  const inp = toolUse.input as Record<string, unknown>;
  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const loiLuan: LoiLuan4LinhVuc = {
    tai_van: chuoi(inp.tai_van),
    quan_van: chuoi(inp.quan_van),
    suc_khoe: chuoi(inp.suc_khoe),
    tinh_duyen: chuoi(inp.tinh_duyen),
  };
  if (!loiLuan.tai_van || !loiLuan.quan_van || !loiLuan.suc_khoe || !loiLuan.tinh_duyen) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Model trả thiếu 1 trong 4 lĩnh vực." };
  }
  return { ok: true, loiLuan };
}
