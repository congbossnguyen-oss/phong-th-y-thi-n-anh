// API con riêng cho app Quân Sư — phục vụ component XemNgayTotXau.astro (tách khỏi web 1/9/2026,
// xem project_quan_su_tach_doc_lap_khoi_web.md). Bản độc lập của /api/trach-nhat-thang.
import type { APIRoute } from "astro";
import { calculateMonthGrid } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;

  if (yearRaw === null || monthRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return jsonResponse({ error: "year, month phải là số nguyên." }, 400);
  }

  try {
    const result = calculateMonthGrid({ year, month, timeZone });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Tháng không hợp lệ." }, 400);
  }
};
