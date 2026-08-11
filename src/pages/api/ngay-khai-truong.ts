import type { APIRoute } from "astro";
import { calculateNgayKhaiTruongRange } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function daysInGregorianMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;
  const namSinhChuRaw = params.get("namSinhChu");

  if (yearRaw === null || monthRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return jsonResponse({ error: "year, month không hợp lệ." }, 400);
  }

  const namSinhChu = namSinhChuRaw !== null ? Number(namSinhChuRaw) : undefined;
  if (namSinhChu !== undefined && !Number.isInteger(namSinhChu)) {
    return jsonResponse({ error: "namSinhChu phải là số nguyên." }, 400);
  }

  try {
    const result = calculateNgayKhaiTruongRange({
      startDate: { year, month, day: 1 },
      endDate: { year, month, day: daysInGregorianMonth(year, month) },
      timeZone,
      ...(namSinhChu !== undefined ? { namSinhChu } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
