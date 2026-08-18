import type { APIRoute } from "astro";
import { checkRateLimit } from "../../lib/rate-limit";
import { calculateNgayLeViengMoRange, type LeViengMoPurpose } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const PURPOSE_HOP_LE: readonly LeViengMoPurpose[] = ["WORSHIP", "GRAVE_VISIT"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Quét khoảng ngày (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-vieng-mo", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const purpose = params.get("purpose");
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");
  const namSinhRaw = params.get("namSinh");

  if (purpose === null || !PURPOSE_HOP_LE.includes(purpose as LeViengMoPurpose)) {
    return jsonResponse({ error: "purpose không hợp lệ (phải là WORSHIP hoặc GRAVE_VISIT)." }, 400);
  }
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
  // Năm sinh không bắt buộc — để trống thì chỉ tính ngày chung, không phải lỗi validation.
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
    const result = calculateNgayLeViengMoRange({
      purpose: purpose as LeViengMoPurpose,
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
