/**
 * Gọi Claude để viết lời luận Vận Khí — CHỈ tầng gọi mạng + ép JSON đúng khuôn, không tính toán gì.
 *
 * Theo đúng quy ước dự án (giống quan-su/luan-giai/llm.ts, chart-profile/llm.ts): gọi thẳng REST
 * bằng fetch, không thêm SDK; dùng tool-use để ép JSON; bật prompt caching cho khối tri thức tĩnh.
 */
import { layAnthropicApiKey } from "../../chart-profile/api-key";
import { ghiLogChiPhi, type UsageAnthropic } from "../../chart-profile/ghi-log-chi-phi";
import { ANTHROPIC_MESSAGES_URL as ANTHROPIC_API_URL, anthropicHeaders } from "../../anthropic-gateway";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
// 10 năm × 4 lĩnh vực trong 1 lệnh — rộng rãi hơn nhiều lần mức 1500 cũ (khi đó là 1 năm/lệnh).
const MAX_TOKENS = 6000;
const TOOL_NAME = "tra_ve_loi_luan_van_khi";

export interface LoiLuan4LinhVuc {
  tai_van: string;
  quan_van: string;
  suc_khoe: string;
  tinh_duyen: string;
}

export type KetQuaLlmVanKhi =
  | { ok: true; loiLuan: Map<number, LoiLuan4LinhVuc> }
  | { ok: false; ly_do: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; chi_tiet: string };

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    danh_sach: {
      type: "array",
      description: "Đúng 1 phần tử cho MỖI năm trong danh sách đầu vào, theo đúng thứ tự chi_so — không bỏ sót, không thêm năm lạ.",
      items: {
        type: "object",
        properties: {
          chi_so: { type: "integer", description: "Số thứ tự của năm trong danh sách đầu vào, bắt đầu từ 0." },
          tai_van: { type: "string", description: "Lời luận Tài vận, 2-4 câu, viết từ canCu được cung cấp." },
          quan_van: { type: "string", description: "Lời luận Quan vận/Sự nghiệp, 2-4 câu." },
          suc_khoe: { type: "string", description: "Lời luận Sức khỏe, 2-4 câu, không nêu bệnh danh cụ thể." },
          tinh_duyen: { type: "string", description: "Lời luận Tình duyên/Hôn nhân, 2-4 câu, không nói ly hôn/chia tay/mất người." },
        },
        required: ["chi_so", "tai_van", "quan_van", "suc_khoe", "tinh_duyen"],
      },
    },
  },
  required: ["danh_sach"],
} as const;

/** Gọi AI 1 LẦN DUY NHẤT cho cả danh sách năm (không phải N lệnh riêng — xem index.ts để hiểu lý do). */
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
    tools: [{ name: TOOL_NAME, description: "Trả về lời luận Vận Khí cho từng năm trong danh sách.", input_schema: INPUT_SCHEMA }],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
  let res: Response | null = null;
  let loiCuoi = "";
  for (let lan = 1; lan <= 3; lan++) {
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: anthropicHeaders(apiKey, ANTHROPIC_VERSION),
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
  const danhSach = Array.isArray(inp.danh_sach) ? (inp.danh_sach as Record<string, unknown>[]) : [];
  if (danhSach.length === 0) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Model không trả danh_sach hoặc danh_sach rỗng." };
  }

  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const loiLuan = new Map<number, LoiLuan4LinhVuc>();
  for (const d of danhSach) {
    const chiSo = Number(d.chi_so);
    if (!Number.isInteger(chiSo)) continue;
    const item: LoiLuan4LinhVuc = {
      tai_van: chuoi(d.tai_van),
      quan_van: chuoi(d.quan_van),
      suc_khoe: chuoi(d.suc_khoe),
      tinh_duyen: chuoi(d.tinh_duyen),
    };
    if (item.tai_van && item.quan_van && item.suc_khoe && item.tinh_duyen) loiLuan.set(chiSo, item);
  }
  if (loiLuan.size === 0) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Không có mục nào đủ 4 lĩnh vực hợp lệ." };
  }
  return { ok: true, loiLuan };
}
