import type { APIRoute } from "astro";
import { checkRateLimit } from "../../lib/rate-limit";

// Proxy server-side sang CONG TAIYI engine's yearly-reading endpoint (dự án Python/aiohttp riêng,
// ngoài repo này, deploy độc lập trên Render — xem CONG_TAIYI_INTEGRATION.md). Cùng kiến trúc với
// api/thai-at.ts (same-origin, không CORS), khác ở 2 điểm: (1) body là ngày/giờ/timezone thay vì
// school/dun/ju_index, (2) engine production yêu cầu HTTP Basic Auth -- header dựng ở đây từ
// process.env, KHÔNG bao giờ gửi tới browser, KHÔNG hardcode.
//
// KHÔNG tính toán gì ở đây -- chỉ forward request/response nguyên văn. Trang gọi route này
// (huyen-mon-tam-thuc/thai-at-nam.astro) là công cụ nội bộ, không public.

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

interface YearlyReadingRequestBody {
  year?: unknown;
  month?: unknown;
  day?: unknown;
  hour?: unknown;
  minute?: unknown;
  timezone?: unknown;
}

function isInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const body = (await request.json().catch(() => null)) as YearlyReadingRequestBody | null;

  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "invalid_request", message: "Thiếu body JSON." }, 400);
  }
  if (!isInRange(body.year, 1, 9999)) {
    return jsonResponse({ error: "invalid_request", message: "year phải là số nguyên từ 1 đến 9999." }, 400);
  }
  if (!isInRange(body.month, 1, 12)) {
    return jsonResponse({ error: "invalid_request", message: "month phải là số nguyên từ 1 đến 12." }, 400);
  }
  if (!isInRange(body.day, 1, 31)) {
    return jsonResponse({ error: "invalid_request", message: "day phải là số nguyên từ 1 đến 31." }, 400);
  }
  if (!isInRange(body.hour, 0, 23)) {
    return jsonResponse({ error: "invalid_request", message: "hour phải là số nguyên từ 0 đến 23." }, 400);
  }
  if (!isInRange(body.minute, 0, 59)) {
    return jsonResponse({ error: "invalid_request", message: "minute phải là số nguyên từ 0 đến 59." }, 400);
  }
  if (typeof body.timezone !== "string" || body.timezone.trim() === "") {
    return jsonResponse({ error: "invalid_request", message: "timezone là bắt buộc (vd: Asia/Ho_Chi_Minh)." }, 400);
  }

  // Công cụ nội bộ, chỉ Công dùng -- giới hạn rộng rãi, chỉ để chặn lỗi client lặp vô hạn, không
  // phải chống lạm dụng công khai (route không có link public, không index).
  const limited = checkRateLimit(
    { request, clientAddress },
    { key: "yearly-reading", max: 60, windowMs: 60_000, message: "Bạn đang gửi yêu cầu quá nhanh. Vui lòng chờ một chút rồi thử lại." },
  );
  if (limited) return limited;

  const engineUrl = process.env.TAIYI_ENGINE_URL;
  const authUser = process.env.TAIYI_BASIC_AUTH_USER;
  const authPassword = process.env.TAIYI_BASIC_AUTH_PASSWORD;

  if (!engineUrl || !authUser || !authPassword) {
    // Không lộ biến nào cụ thể đang thiếu ra response (tránh dò cấu hình) -- chi tiết chỉ ở log server.
    console.error("yearly-reading: missing TAIYI_ENGINE_URL/TAIYI_BASIC_AUTH_USER/TAIYI_BASIC_AUTH_PASSWORD");
    return jsonResponse({ error: "engine_unavailable", message: "Công cụ Thái Ất hiện chưa sẵn sàng, vui lòng thử lại sau." }, 503);
  }

  const authHeader = `Basic ${Buffer.from(`${authUser}:${authPassword}`).toString("base64")}`;

  try {
    const upstream = await fetch(`${engineUrl.replace(/\/$/, "")}/api/taiyi/yearly-reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({
        year: body.year, month: body.month, day: body.day,
        hour: body.hour, minute: body.minute, timezone: body.timezone,
      }),
      // Render free-tier có thể "ngủ" khi rảnh -- cold start đo được tới ~60-90s; 30s để lỡ vẫn còn
      // cửa cho warm-instance request bình thường không phải chờ vô hạn.
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json().catch(() => null);
    if (data === null) {
      return jsonResponse({ error: "engine_unavailable", message: "Không nhận được phản hồi hợp lệ từ công cụ Thái Ất." }, 502);
    }
    // Forward NGUYÊN VĂN -- kể cả 4xx (validation message của chính engine) lẫn 200 (kết quả tính
    // toán, bao gồm mọi BLOCKED/NOT_AVAILABLE bên trong `blocked[]` -- đó là kết quả hợp lệ, không
    // phải lỗi). Route này không diễn giải lại kết quả.
    return jsonResponse(data, upstream.status);
  } catch {
    return jsonResponse({ error: "engine_unavailable", message: "Không thể kết nối công cụ Thái Ất lúc này, vui lòng thử lại." }, 502);
  }
};
