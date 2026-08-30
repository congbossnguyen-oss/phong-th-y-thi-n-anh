/**
 * LỚP GỌI AI DÙNG CHUNG — một cửa duy nhất cho mọi lệnh gọi AI trong repo.
 *
 * Lý do tồn tại: trước đây mỗi module tự `fetch` thẳng tới Anthropic, nên muốn đổi nhà cung cấp phải
 * sửa 6 chỗ. Nay mọi nơi gọi qua đây, và chọn nhà cung cấp bằng BẢNG dưới — đổi 1 dòng là đổi được
 * cả tính năng, không phải sửa logic nghiệp vụ.
 *
 * Có 2 ĐỊNH DẠNG request khác hẳn nhau (Anthropic riêng; DeepSeek/Gemini dùng CHUNG 1 định dạng
 * kiểu OpenAI chat-completions + function-calling), đây là lý do phải có lớp chuyển đổi chứ không
 * đổi mỗi URL được:
 *
 *   |                | Anthropic                          | Kiểu OpenAI (DeepSeek, Gemini)            |
 *   |----------------|------------------------------------|------------------------------------------|
 *   | Xác thực       | `x-api-key` + `anthropic-version`  | `Authorization: Bearer`                  |
 *   | System prompt  | mảng block riêng, có cache_control  | 1 message role "system"                  |
 *   | Khai báo tool  | `input_schema`                     | `function.parameters`                    |
 *   | Ép gọi tool    | `{type:"tool",name}`               | `{type:"function",function:{name}}`      |
 *   | Kết quả        | `content[].input` là OBJECT        | `...arguments` là CHUỖI JSON, phải parse |
 *   | Đếm token      | `input_tokens`/`output_tokens`     | `prompt_tokens`/`completion_tokens`      |
 *
 * DeepSeek dùng API CHÍNH THỨC (api.deepseek.com, đổi từ lớp trung gian tom.qnt.world 30/8/2026).
 * Gemini dùng cổng tương thích OpenAI của Google AI Studio (`.../v1beta/openai`) — cùng định dạng
 * request/response với DeepSeek nên dùng chung 1 hàm gọi, chỉ khác base URL/key/model.
 */
import { layAnthropicApiKey } from "../chart-profile/api-key";
import type { UsageAnthropic } from "../chart-profile/ghi-log-chi-phi";
import { ANTHROPIC_MESSAGES_URL, anthropicHeaders } from "../anthropic-gateway";

export type NhaCungCap = "anthropic" | "openai-tuong-thich" | "gemini-tuong-thich";

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
  | "luan-giai-tu-vi-nang-cao"
  | "huyen-khong-luan-chi-tiet";

/**
 * BẢNG CHỌN NHÀ CUNG CẤP CHO TỪNG TÍNH NĂNG — chỗ duy nhất cần sửa khi muốn đổi.
 *
 * Nguyên tắc đang áp dụng (anh Công chốt 26/8/2026): phần khách ĐỌC KỸ NHẤT và trả tiền cao nhất
 * (văn xuôi luận giải Bát Tự, hồ sơ nghề nghiệp 499k) giữ nguyên Anthropic cho chắc chất lượng;
 * phần thiên về số liệu/câu ngắn hoặc gói rẻ hơn thì chuyển sang bên rẻ để tiết kiệm.
 *
 * Có thể ép TOÀN BỘ về 1 nhà cung cấp bằng biến môi trường `AI_EP_NHA_CUNG_CAP`
 * ("anthropic" | "openai-tuong-thich" | "gemini-tuong-thich") — dùng khi 1 bên sự cố/hết credit
 * (khỏi phải deploy lại), HOẶC khi anh Công muốn so sánh DeepSeek với Gemini xem bên nào luận
 * chuẩn hơn (30/8/2026) — đổi biến này là đổi được toàn site, không cần sửa từng dòng trong bảng.
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
  // Đang test nội bộ (chưa chốt giá) — anh Công 30/8/2026: "anh vẫn đang dùng bên DeepSeek".
  "huyen-khong-luan-chi-tiet": "openai-tuong-thich",
};

/**
 * ⚠️ Dùng `deepseek-v4-flash` chứ KHÔNG dùng `deepseek-v4-pro` — đo thật 26/8/2026 qua lớp trung
 * gian tom.qnt.world (đã đổi sang API chính thức api.deepseek.com từ 30/8/2026, xem đầu file):
 * `pro` mất 110-126 giây mỗi lượt và HỎNG khoảng một nửa số lần với lỗi timeout, trong khi `flash`
 * chạy 20-50 giây, ổn định, cache tiền tố tốt. Chưa đo lại trên API chính thức — nếu độ trễ khác
 * hẳn thì cân nhắc thử lại `pro`, nhưng `flash` vẫn là lựa chọn an toàn mặc định.
 */
const MODEL_MAC_DINH: Record<NhaCungCap, string> = {
  anthropic: "claude-sonnet-5",
  "openai-tuong-thich": "deepseek-v4-flash",
  "gemini-tuong-thich": "gemini-3.6-flash",
};

const ANTHROPIC_VERSION = "2023-06-01";

function bienMoiTruong(ten: string): string {
  const tuRuntime = typeof process !== "undefined" ? process.env?.[ten] : undefined;
  return (tuRuntime ?? "").trim();
}

export function chonNhaCungCap(tinhNang: TinhNangAi): NhaCungCap {
  const ep = bienMoiTruong("AI_EP_NHA_CUNG_CAP");
  if (ep === "anthropic" || ep === "openai-tuong-thich" || ep === "gemini-tuong-thich") return ep;
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

/** Tên biến môi trường (base URL / API key / model) cho mỗi nhà cung cấp "kiểu OpenAI". */
const BIEN_KIEU_OPENAI: Record<"openai-tuong-thich" | "gemini-tuong-thich", { baseUrl: string; apiKey: string; model: string }> = {
  "openai-tuong-thich": { baseUrl: "AI_OPENAI_BASE_URL", apiKey: "AI_OPENAI_API_KEY", model: "AI_OPENAI_MODEL" },
  "gemini-tuong-thich": { baseUrl: "AI_GEMINI_BASE_URL", apiKey: "AI_GEMINI_API_KEY", model: "AI_GEMINI_MODEL" },
};

/**
 * Gọi CHUNG cho mọi nhà cung cấp nói định dạng OpenAI chat-completions + function-calling
 * (DeepSeek qua api.deepseek.com, Gemini qua cổng tương thích OpenAI của Google AI Studio) — chỉ
 * khác base URL/key/model, đọc theo `BIEN_KIEU_OPENAI[ncc]`.
 */
async function goiKieuOpenAi(t: ThamSoGoiAi, model: string, ncc: "openai-tuong-thich" | "gemini-tuong-thich"): Promise<KetQuaGoiAi> {
  const bien = BIEN_KIEU_OPENAI[ncc];
  const baseUrl = bienMoiTruong(bien.baseUrl);
  const apiKey = bienMoiTruong(bien.apiKey);
  if (!baseUrl || !apiKey) {
    console.error(`[goi-ai] ${t.tinhNang}: thiếu ${bien.baseUrl} hoặc ${bien.apiKey}.`);
    return { input: null, model, nhaCungCap: ncc };
  }

  // Chỉ nhận 1 chuỗi system → nối 2 phần lại. Thứ tự vẫn để phần cố định trước để nếu nhà cung cấp
  // có tự động cache theo tiền tố thì vẫn hưởng lợi.
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
    console.error(`[goi-ai] ${t.tinhNang} (${ncc}) thất bại: ${chiTiet}`);
    return { input: null, model, nhaCungCap: ncc };
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
    return { input: null, usage, model, nhaCungCap: ncc };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) throw new Error("không phải object");
    return { input: parsed as Record<string, unknown>, usage, model, nhaCungCap: ncc };
  } catch (err) {
    console.error(`[goi-ai] ${t.tinhNang}: parse JSON từ tool_calls thất bại — ${err instanceof Error ? err.message : String(err)}`);
    return { input: null, usage, model, nhaCungCap: ncc };
  }
}

/** Cửa vào duy nhất: gọi AI ép trả JSON theo schema, tự chọn nhà cung cấp theo tính năng. */
export async function goiAiToolUse(t: ThamSoGoiAi): Promise<KetQuaGoiAi> {
  const ncc = chonNhaCungCap(t.tinhNang);
  if (ncc === "anthropic") {
    const model = bienMoiTruong("ANTHROPIC_MODEL") || MODEL_MAC_DINH[ncc];
    return goiAnthropic(t, model);
  }
  const model = bienMoiTruong(BIEN_KIEU_OPENAI[ncc].model) || MODEL_MAC_DINH[ncc];
  return goiKieuOpenAi(t, model, ncc);
}
