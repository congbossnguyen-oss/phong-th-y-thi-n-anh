import type { APIRoute } from "astro";
import { phanTich, chuanHoaSon } from "../../../../lib/tam-hop-phai/engine";
import { dungSystemPrompt } from "../../../../lib/tam-hop-phai/ai-prompt";
import { goiAiToolUseVoiRetry } from "../../../../lib/ai/goi-ai";
import { ghiLogChiPhi } from "../../../../lib/chart-profile/ghi-log-chi-phi";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * 🔒 THẦY-ONLY: chỉ tài khoản quản trị được gọi (module Tam Hợp đang giai đoạn nội bộ).
 * Cờ isAdmin lấy từ PHIÊN đăng nhập phía máy chủ, KHÔNG nhận từ client.
 *
 * Endpoint tự chạy lại engine `phanTich` từ input thô (không tin JSON client gửi), rồi nhờ AI
 * viết luận giải bằng system prompt NGUYÊN VĂN trong data/ai-prompt-luan-giai.md. Dùng lớp AI
 * dùng chung `goiAiToolUseVoiRetry` (không thêm SDK). modelOverride "deepseek-chat" bắt buộc vì
 * goiAiToolUse luôn ép tool_choice — model DeepSeek "thinking" mặc định sẽ từ chối.
 */

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const SCHEMA = {
  type: "object",
  properties: {
    noi_dung: {
      type: "string",
      description:
        "Toàn bộ bài luận giải Tam Hợp viết văn xuôi tiếng Việt theo đúng dữ liệu JSON và các quy tắc đã nêu trong system prompt, KẾT THÚC bằng đúng dòng cảnh báo ở quy tắc 5.",
    },
  },
  required: ["noi_dung"],
} as const;

export const POST: APIRoute = async (context) => {
  // Không destructure `clientAddress` ở đây: getter của nó NÉM LỖI với adapter @astrojs/cloudflare.
  // Truyền cả `context` cho checkRateLimit → getClientIp() tự try/catch clientAddress, fallback XFF.
  const { request, locals } = context;
  const limited = checkRateLimit(context, { key: "tam-hop-luan-giai", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Công cụ đang trong giai đoạn nội bộ (chỉ quản trị dùng)." }, 403);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonResponse({ ok: false, error: "Body không hợp lệ." }, 400);

  const huong = Number(body.huong);
  if (!Number.isFinite(huong) || huong < 0 || huong > 360) {
    return jsonResponse({ ok: false, error: "Hướng nhà (độ) phải là số trong khoảng 0–360." }, 400);
  }

  // Chuẩn hóa các sơn quan sát (bỏ trống được); sơn lạ → 400 thay vì đoán bừa.
  let thamSo;
  try {
    thamSo = {
      thuyKhau: chuanHoaSon(body.thuyKhau as string | null | undefined),
      giangLong: chuanHoaSon(body.giangLong as string | null | undefined),
      giangKhi: chuanHoaSon(body.giangKhi as string | null | undefined),
      laiThuy: chuanHoaSon(body.laiThuy as string | null | undefined),
      khuThuy: chuanHoaSon(body.khuThuy as string | null | undefined),
    };
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Sơn không hợp lệ." }, 400);
  }

  const moTaLoanDau = typeof body.moTaLoanDau === "string" ? body.moTaLoanDau.trim() : "";

  // Tự tính lại bằng engine (nguồn sự thật), serialize đầy đủ làm dữ liệu thô cho AI.
  const ketQua = phanTich(huong, thamSo);
  const ketQuaJson = JSON.stringify(ketQua, null, 2);
  const systemPrompt = dungSystemPrompt(ketQuaJson, moTaLoanDau);

  const kq = await goiAiToolUseVoiRetry({
    tinhNang: "tam-hop-luan-giai",
    systemCoDinh: systemPrompt,
    userMessage: "Hãy viết bài luận giải Tam Hợp theo đúng dữ liệu JSON và các quy tắc đã nêu trong phần hệ thống.",
    toolName: "tra_ve_bai_luan_giai",
    schema: SCHEMA,
    maxTokens: 2500,
    modelOverride: { "openai-tuong-thich": "deepseek-chat" },
  });
  ghiLogChiPhi("Tam Hợp — luận giải AI", kq.model, kq.usage);

  const noiDung = kq.input && typeof kq.input.noi_dung === "string" ? kq.input.noi_dung.trim() : "";
  if (noiDung.length === 0) {
    return jsonResponse({ ok: false, error: "AI chưa trả về nội dung. Vui lòng thử lại sau ít phút." }, 502);
  }

  return jsonResponse({ ok: true, noi_dung: noiDung }, 200);
};
