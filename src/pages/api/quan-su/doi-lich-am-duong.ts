// Bản ĐỘC LẬP cho app Quân Sư của "Đổi Dương Lịch ↔ Âm Lịch" — xem ghi chú đầu file
// `chon-nam-sinh-con.ts` cùng thư mục. Module miễn phí, không có toolSlug/thanh toán.
import type { APIRoute } from "astro";
import { convertSolarToLunar, convertLunarToSolar } from "@thien-anh/trachnhat-engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const direction = params.get("direction");

  if (direction === "duong-sang-am") {
    const dayRaw = params.get("day");
    const monthRaw = params.get("month");
    const yearRaw = params.get("year");
    if (dayRaw === null || monthRaw === null || yearRaw === null) {
      return jsonResponse({ error: "Thiếu tham số bắt buộc: day, month, year." }, 400);
    }
    const day = Number(dayRaw);
    const month = Number(monthRaw);
    const year = Number(yearRaw);
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
      return jsonResponse({ error: "day, month, year phải là số nguyên." }, 400);
    }
    try {
      return jsonResponse(convertSolarToLunar({ day, month, year }), 200);
    } catch (err) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Không đổi được." }, 400);
    }
  }

  if (direction === "am-sang-duong") {
    const dayRaw = params.get("day");
    const monthRaw = params.get("month");
    const yearRaw = params.get("year");
    const isLeapMonth = params.get("isLeapMonth") === "true";
    if (dayRaw === null || monthRaw === null || yearRaw === null) {
      return jsonResponse({ error: "Thiếu tham số bắt buộc: day, month, year." }, 400);
    }
    const day = Number(dayRaw);
    const month = Number(monthRaw);
    const year = Number(yearRaw);
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
      return jsonResponse({ error: "day, month, year phải là số nguyên." }, 400);
    }
    try {
      return jsonResponse(convertLunarToSolar({ day, month, year, isLeapMonth }), 200);
    } catch (err) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Không đổi được." }, 400);
    }
  }

  return jsonResponse({ error: "Tham số direction phải là 'duong-sang-am' hoặc 'am-sang-duong'." }, 400);
};
