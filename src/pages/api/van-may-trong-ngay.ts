import type { APIRoute } from "astro";
import { calculateVanMayTrongNgay } from "@thien-anh/trachnhat-engine";

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
  const dayRaw = params.get("day");
  const namSinhRaw = params.get("namSinh");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;

  if (yearRaw === null || monthRaw === null || dayRaw === null || namSinhRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month, day, namSinh." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const namSinh = Number(namSinhRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(namSinh)) {
    return jsonResponse({ error: "year, month, day, namSinh phải là số nguyên." }, 400);
  }

  try {
    const result = calculateVanMayTrongNgay({ solarDate: { year, month, day }, timeZone, namSinh });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
