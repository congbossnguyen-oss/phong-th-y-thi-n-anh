/**
 * LỚP GỌI AI DÙNG CHUNG — một cửa duy nhất cho mọi lệnh gọi AI trong repo.
 *
 * Lý do tồn tại: trước đây mỗi module tự `fetch` thẳng tới Anthropic, nên muốn đổi nhà cung cấp phải
 * sửa 6 chỗ. Nay mọi nơi gọi qua đây, và chọn nhà cung cấp bằng BẢNG dưới — đổi 1 dòng là đổi được
 * cả tính năng, không phải sửa logic nghiệp vụ.
 *
 * Hai nhà cung cấp có ĐỊNH DẠNG KHÁC HẲN NHAU, đây là lý do phải có lớp chuyển đổi chứ không đổi
 * mỗi URL được:
 *
 *   |                | Anthropic                          | OpenAI-compatible (tom.qnt.world)        |
 *   |----------------|------------------------------------|------------------------------------------|
 *   | Xác thực       | `x-api-key` + `anthropic-version`  | `Authorization: Bearer`                  |
 *   | System prompt  | mảng block riêng, có cache_control  | 1 message role "system"                  |
 *   | Khai báo tool  | `input_schema`                     | `function.parameters`                    |
 *   | Ép gọi tool    | `{type:"tool",name}`               | `{type:"function",function:{name}}`      |
 *   | Kết quả        | `content[].input` là OBJECT        | `...arguments` là CHUỖI JSON, phải parse |
 *   | Đếm token      | `input_tokens`/`output_tokens`     | `prompt_tokens`/`completion_tokens`      |
 */
import { layAnthropicApiKey } from "../chart-profile/api-key";
import type { UsageAnthropic } from "../chart-profile/ghi-log-chi-phi";
import { ANTHROPIC_MESSAGES_URL, anthropicHeaders } from "../anthropic-gateway";

export type NhaCungCap = "anthropic" | "openai-tuong-thich";

/** Tên tính năng dùng AI — thêm tính năng mới thì khai báo ở đây rồi map bên dưới. */
export type TinhNangAi =
  | "bat-tu-giai-doan"
  | "bat-tu-cham-diem"
  | "bat-tu-kiem-duyet"
  | "quan-su-kinh-dich"
  | "quan-su-van-khi"
  | "chart-profile-bat-tu"
  | "chart-profile-tu-vi"
  | "nghe-nghiep-luan-van"
  | "luan-giai-tu-vi-co-ban"
  | "luan-giai-tu-vi-nang-cao";

/**
 * BẢNG CHỌN NHÀ CUNG CẤP CHO TỪNG TÍNH NĂNG — chỗ duy nhất cần sửa khi muốn đổi.
 *
 * Nguyên tắc đang áp dụng (anh Công chốt 26/8/2026): phần khách ĐỌC KỸ NHẤT và trả tiền cao nhất
 * (văn xuôi luận giải Bát Tự, hồ sơ nghề nghiệp 499k) giữ nguyên Anthropic cho chắc chất lượng;
 * phần thiên về số liệu/câu ngắn hoặc gói rẻ hơn thì chuyển sang bên rẻ để tiết kiệm.
 *
 * Có thể ép TOÀN BỘ về 1 nhà cung cấp bằng biến môi trường `AI_EP_NHA_CUNG_CAP`
 * ("anthropic" hoặc "openai-tuong-thich") — dùng khi 1 bên sự cố/hết credit, khỏi phải deploy lại.
 */
const BANG_NHA_CUNG_CAP: Record<TinhNangAi, NhaCungCap> = {
  "bat-tu-giai-doan": "anthropic",
  "bat-tu-cham-diem": "openai-tuong-thich",
  "bat-tu-kiem-duyet": "openai-tuong-thich",
  "quan-su-kinh-dich": "openai-tuong-thich",
  "quan-su-van-khi": "openai-tuong-thich",
  "chart-profile-bat-tu": "anthropic",
  "chart-profile-tu-vi": "anthropic",
  "nghe-nghiep-luan-van": "anthropic",
  // Gói 149k/299k, khách đọc kỹ và trả tiền cao — giữ Anthropic cho chắc chất lượng.
  "luan-giai-tu-vi-co-ban": "anthropic",
  "luan-giai-tu-vi-nang-cao": "anthropic",
};

/**
 * ⚠️ Dùng `deepseek-v4-flash` chứ KHÔNG dùng `deepseek-v4-pro` — đã đo thật 26/8/2026:
 * `pro` mất 110-126 giây mỗi lượt và HỎNG khoảng một nửa số lần với lỗi HTTP 524 (timeout), kể cả
 * khi đầu ra rất nhỏ. Nguyên nhân: chính `tom.qnt.world` đứng sau Cloudflare, mà Cloudflare cắt kết
 * nối proxy ở khoảng 100 giây. `flash` chạy 20-50 giây, ổn định, và cache tiền tố rất tốt (lượt lặp
 * chỉ còn ~34 token đầu vào).
 */
const MODEL_MAC_DINH: Record<NhaCungCap, string> = {
  anthropic: "claude-sonnet-5",
  "openai-tuong-thich": "deepseek-v4-flash",
};

const ANTHROPIC_VERSION = "2023-06-01";

function bienMoiTruong(ten: string): string {
  const tuRuntime = typeof process !== "undefined" ? process.env?.[ten] : undefined;
  return (tuRuntime ?? "").trim();
}

export function chonNhaCungCap(tinhNang: TinhNangAi): NhaCungCap {
  const ep = bienMoiTruong("AI_EP_NHA_CUNG_CAP");
  if (ep === "anthropic" || ep === "openai-tuong-thich") return ep;
  return BANG_NHA_CUNG_CAP[tinhNang];
}

export interface ThamSoGoiAi {
  tinhNang: TinhNangAi;
  /** Phần system CỐ ĐỊNH giữa các lệnh cùng loại (tri thức, quy tắc) — được đánh dấu cache. */
  systemCoDinh: string;
  /** Phần system THAY ĐỔI theo từng lệnh (lá số, dữ liệu riêng). Để trống nếu không tách. */
  systemThayDoi?: string;
  userMessage: string;
  toolName: string;
  schema: object;
  maxTokens: number;
}

export interface KetQuaGoiAi {
  input: Record<string, unknown> | null;
  usage?: UsageAnthropic;
  /** Model thực tế đã chạy — để ghi log chi phí đúng đơn giá. */
  model: string;
  nhaCungCap: NhaCungCap;
}

const CO_THE_THU_LAI = new Set([429, 500, 502, 503, 504, 529]);

/** Gọi có thử lại. Trả về Response cuối cùng (có thể !ok) hoặc null nếu lỗi mạng cả 3 lần. */
async function fetchThuLai(url: string, init: RequestInit): Promise<Response | null> {
  let res: Response | null = null;
  for (let lan = 1; lan <= 3; lan++) {
    try {
      res = await fetch(url, init);
    } catch {
      res = null;
    }
    if (res && res.ok) return res;
    if (res && !CO_THE_THU_LAI.has(res.status)) return res;
    if (lan < 3) await new Promise((r) => setTimeout(r, 800 * lan));
  }
  return res;
}

async function goiAnthropic(t: ThamSoGoiAi, model: string): Promise<KetQuaGoiAi> {
  const apiKey = layAnthropicApiKey();
  if (!apiKey) {
    console.error(`[goi-ai] ${t.tinhNang}: thiếu ANTHROPIC_API_KEY.`);
    return { input: null, model, nhaCungCap: "anthropic" };
  }

  // Khối cố định đặt TRƯỚC và đánh cache_control để các lệnh cùng loại dùng chung cache (0,1x)
  // thay vì ghi mới (1,25x). Xem ghi chú chi tiết ở luu-nien-dai-van.ts.
  const system = t.systemThayDoi
    ? [
        { type: "text", text: t.systemCoDinh, cache_control: { type: "ephemeral" } },
        { type: "text", text: t.systemThayDoi },
      ]
    : [{ type: "text", text: t.systemCoDinh, cache_control: { type: "ephemeral" } }];

  const res = await fetchThuLai(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey, ANTHROPIC_VERSION),
    body: JSON.stringify({
      model,
      max_tokens: t.maxTokens,
      system,
      messages: [{ role: "user", content: t.userMessage }],
      tools: [{ name: t.toolName, description: "Trả về kết quả đã yêu cầu.", input_schema: t.schema }],
      tool_choice: { type: "tool", name: t.toolName },
    }),
  });

  if (!res || !res.ok) {
    const chiTiet = res ? `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}` : "lỗi mạng";
    console.error(`[goi-ai] ${t.tinhNang} (anthropic) thất bại: ${chiTiet}`);
    return { input: null, model, nhaCungCap: "anthropic" };
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[]; usage?: UsageAnthropic };
  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return { input: null, usage: data.usage, model, nhaCungCap: "anthropic" };
  }
  return { input: toolUse.input as Record<string, unknown>, usage: data.usage, model, nhaCungCap: "anthropic" };
}

async function goiOpenAiTuongThich(t: ThamSoGoiAi, model: string): Promise<KetQuaGoiAi> {
  const baseUrl = bienMoiTruong("AI_OPENAI_BASE_URL");
  const apiKey = bienMoiTruong("AI_OPENAI_API_KEY");
  if (!baseUrl || !apiKey) {
    console.error(`[goi-ai] ${t.tinhNang}: thiếu AI_OPENAI_BASE_URL hoặc AI_OPENAI_API_KEY.`);
    return { input: null, model, nhaCungCap: "openai-tuong-thich" };
  }

  // OpenAI chỉ nhận 1 chuỗi system → nối 2 phần lại. Thứ tự vẫn để phần cố định trước để nếu nhà
  // cung cấp có tự động cache theo tiền tố thì vẫn hưởng lợi.
  const system = t.systemThayDoi ? `${t.systemCoDinh}\n\n${t.systemThayDoi}` : t.systemCoDinh;

  const res = await fetchThuLai(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: t.maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: t.userMessage },
      ],
      tools: [{ type: "function", function: { name: t.toolName, description: "Trả về kết quả đã yêu cầu.", parameters: t.schema } }],
      tool_choice: { type: "function", function: { name: t.toolName } },
    }),
  });

  if (!res || !res.ok) {
    const chiTiet = res ? `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}` : "lỗi mạng";
    console.error(`[goi-ai] ${t.tinhNang} (openai-tuong-thich) thất bại: ${chiTiet}`);
    return { input: null, model, nhaCungCap: "openai-tuong-thich" };
  }

  const data = (await res.json()) as {
    choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  // Quy đổi cách đếm token về chuẩn Anthropic để dùng lại nguyên hệ thống log chi phí sẵn có.
  const usage: UsageAnthropic = {
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
  };

  // KHÁC Anthropic: arguments là CHUỖI JSON, phải tự parse. Model đôi khi trả JSON hỏng → bắt lỗi
  // để trả null (bên gọi tự lùi về phương án dự phòng) thay vì làm sập cả báo cáo.
  const raw = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (typeof raw !== "string" || raw.trim() === "") {
    console.error(`[goi-ai] ${t.tinhNang}: phản hồi không có tool_calls hợp lệ.`);
    return { input: null, usage, model, nhaCungCap: "openai-tuong-thich" };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) throw new Error("không phải object");
    return { input: parsed as Record<string, unknown>, usage, model, nhaCungCap: "openai-tuong-thich" };
  } catch (err) {
    console.error(`[goi-ai] ${t.tinhNang}: parse JSON từ tool_calls thất bại — ${err instanceof Error ? err.message : String(err)}`);
    return { input: null, usage, model, nhaCungCap: "openai-tuong-thich" };
  }
}

/** Cửa vào duy nhất: gọi AI ép trả JSON theo schema, tự chọn nhà cung cấp theo tính năng. */
export async function goiAiToolUse(t: ThamSoGoiAi): Promise<KetQuaGoiAi> {
  const ncc = chonNhaCungCap(t.tinhNang);
  const model =
    bienMoiTruong(ncc === "anthropic" ? "ANTHROPIC_MODEL" : "AI_OPENAI_MODEL") || MODEL_MAC_DINH[ncc];
  return ncc === "anthropic" ? goiAnthropic(t, model) : goiOpenAiTuongThich(t, model);
}
