import type { APIRoute } from "astro";
import { calculateNgayXuatHanhRange } from "@thien-anh/trachnhat-engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");
  const namSinhRaw = params.get("namSinh");

  if (
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số ngày bắt đầu/kết thúc." }, 400);
  }

  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);
  // Năm sinh không bắt buộc — để trống thì chỉ tính ngày xuất hành chung, không phải lỗi validation.
  const namSinh = namSinhRaw !== null && namSinhRaw !== "" ? Number(namSinhRaw) : undefined;

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonth) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endYear) ||
    !Number.isInteger(endMonth) ||
    !Number.isInteger(endDay) ||
    (namSinh !== undefined && !Number.isInteger(namSinh))
  ) {
    return jsonResponse({ error: "Các tham số ngày và năm sinh phải là số nguyên." }, 400);
  }

  try {
    const result = calculateNgayXuatHanhRange({
      startDate: { year: startYear, month: startMonth, day: startDay },
      endDate: { year: endYear, month: endMonth, day: endDay },
      timeZone: "Asia/Ho_Chi_Minh",
      ...(namSinh !== undefined ? { namSinh } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
