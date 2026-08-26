/**
 * Gọi Claude để luận quẻ — CHỈ tầng gọi mạng + ép JSON đúng khuôn. Không luận gì ở đây.
 *
 * Theo đúng quy ước dự án (giống chart-profile/llm.ts): gọi thẳng REST bằng fetch, không thêm SDK;
 * dùng tool-use để ép JSON thay vì xin JSON dạng văn bản rồi tự parse; bật prompt caching cho khối
 * tri thức vì nó giống hệt nhau ở mọi lượt gọi.
 */
import { layAnthropicApiKey } from "../../chart-profile/api-key";
import { ghiLogChiPhi, type UsageAnthropic } from "../../chart-profile/ghi-log-chi-phi";
import { ANTHROPIC_MESSAGES_URL as ANTHROPIC_API_URL, anthropicHeaders } from "../../anthropic-gateway";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 3000;
const TOOL_NAME = "tra_ve_luan_giai_kinh_dich";

export const KET_LUAN_ENUM = ["NEN", "KHONG_NEN", "NEN_CHO", "CO_DIEU_KIEN"] as const;
export type KetLuanKinhDich = (typeof KET_LUAN_ENUM)[number];

export interface LuanGiaiKinhDich {
  dung_than: string;
  phan_tich: string[];
  nguyen_nhan_cot_loi: string;
  ket_luan: KetLuanKinhDich;
  diem_can_luu_y: string[];
  quan_su_khuyen: string[];
  phuong_phap_hoa_giai: string[];
  thoi_diem_khuyen_nghi: string;
}

export type KetQuaLlm =
  | { ok: true; luan: LuanGiaiKinhDich }
  | { ok: false; ly_do: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; chi_tiet: string };

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    dung_than: { type: "string", description: "Dụng Thần đã chọn, ví dụ 'Thê Tài'. Kèm một câu ngắn vì sao chọn." },
    phan_tich: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    nguyen_nhan_cot_loi: { type: "string" },
    ket_luan: { type: "string", enum: [...KET_LUAN_ENUM] },
    diem_can_luu_y: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    quan_su_khuyen: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    phuong_phap_hoa_giai: {
      type: "array",
      items: { type: "string" },
      description: "Để MẢNG RỖNG nếu quẻ không báo hung. Không bịa vấn đề để hóa giải.",
    },
    thoi_diem_khuyen_nghi: { type: "string", description: "Chuỗi rỗng nếu quẻ không có chỉ dấu thời điểm." },
  },
  required: [
    "dung_than", "phan_tich", "nguyen_nhan_cot_loi", "ket_luan",
    "diem_can_luu_y", "quan_su_khuyen", "phuong_phap_hoa_giai", "thoi_diem_khuyen_nghi",
  ],
} as const;

export async function goiLuanGiaiKinhDich(
  promptTriThuc: string,
  promptQuyTac: string,
  promptNguoiDung: string,
): Promise<KetQuaLlm> {
  const apiKey = layAnthropicApiKey();
  if (!apiKey) {
    return {
      ok: false,
      ly_do: "khong_co_api_key",
      chi_tiet: "Chưa cấu hình ANTHROPIC_API_KEY. Quẻ vẫn lập được (thuần code), chỉ chưa luận sâu được.",
    };
  }

  const model = (typeof process !== "undefined" ? process.env?.ANTHROPIC_MODEL : undefined) || DEFAULT_MODEL;

  const reqBody = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    // Khối tri thức giống hệt nhau ở mọi khách → đánh dấu cache, các lượt sau đọc lại rẻ hơn nhiều.
    // Khối quy tắc đặt SAU breakpoint vì nó đổi theo giới tính/mức nhạy cảm của từng câu.
    system: [
      { type: "text", text: promptTriThuc, cache_control: { type: "ephemeral" } },
      { type: "text", text: promptQuyTac },
    ],
    messages: [{ role: "user", content: promptNguoiDung }],
    tools: [{ name: TOOL_NAME, description: "Trả về bài luận quẻ Kinh Dịch đúng cấu trúc.", input_schema: INPUT_SCHEMA }],
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
  ghiLogChiPhi("Kinh Dịch", model, data.usage);

  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Model không trả tool_use hợp lệ." };
  }

  const inp = toolUse.input as Record<string, unknown>;
  const mang = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map((x) => (x as string).trim()) : [];
  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

  const ketLuan = chuoi(inp.ket_luan) as KetLuanKinhDich;
  if (!KET_LUAN_ENUM.includes(ketLuan)) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: `Kết luận không hợp lệ: "${chuoi(inp.ket_luan)}".` };
  }

  return {
    ok: true,
    luan: {
      dung_than: chuoi(inp.dung_than),
      phan_tich: mang(inp.phan_tich),
      nguyen_nhan_cot_loi: chuoi(inp.nguyen_nhan_cot_loi),
      ket_luan: ketLuan,
      diem_can_luu_y: mang(inp.diem_can_luu_y),
      quan_su_khuyen: mang(inp.quan_su_khuyen),
      phuong_phap_hoa_giai: mang(inp.phuong_phap_hoa_giai),
      thoi_diem_khuyen_nghi: chuoi(inp.thoi_diem_khuyen_nghi),
    },
  };
}
