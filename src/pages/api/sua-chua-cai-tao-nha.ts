import type { APIRoute } from "astro";
import { calculateSuaChuaCaiTaoNhaRange, calculateSuaChuaCaiTaoNhaMotNgay, type RenovationType } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const RENOVATION_TYPE_HOP_LE: readonly RenovationType[] = [
  "light",
  "medium",
  "major",
  "ground_breaking",
  "kitchen",
  "main_door",
  "stair",
  "roof",
  "extension",
];
const CUNG_HOP_LE = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"] as const;
type CungBatTrach = (typeof CUNG_HOP_LE)[number];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const renovationType = params.get("renovationType");
  const affectsStructureRaw = params.get("affectsStructure");
  const digsGroundRaw = params.get("digsGround");
  const affectedCungRaw = params.getAll("affectedCung");
  const namSinhRaw = params.get("namSinh");
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const dayRaw = params.get("day");
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");

  if (renovationType === null || !RENOVATION_TYPE_HOP_LE.includes(renovationType as RenovationType)) {
    return jsonResponse({ error: "renovationType không hợp lệ." }, 400);
  }
  if (affectedCungRaw.length === 0 || affectedCungRaw.some((c) => !CUNG_HOP_LE.includes(c as CungBatTrach))) {
    return jsonResponse({ error: "Cần chọn ít nhất 1 phương vị bị động hợp lệ." }, 400);
  }
  if (namSinhRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (năm sinh)." }, 400);
  }
  const namSinh = Number(namSinhRaw);
  if (!Number.isInteger(namSinh)) {
    return jsonResponse({ error: "namSinh phải là số nguyên." }, 400);
  }
  const chung = {
    namSinh,
    renovationType: renovationType as RenovationType,
    affectsStructure: affectsStructureRaw === "1",
    digsGround: digsGroundRaw === "1",
    affectedCungList: affectedCungRaw as CungBatTrach[],
    timeZone: "Asia/Ho_Chi_Minh",
  };

  // Chế độ "chỉ xem giờ": đã có sẵn 1 ngày cụ thể (year/month/day).
  if (yearRaw !== null || monthRaw !== null || dayRaw !== null) {
    if (yearRaw === null || monthRaw === null || dayRaw === null) {
      return jsonResponse({ error: "Thiếu tham số ngày (year/month/day)." }, 400);
    }
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return jsonResponse({ error: "year/month/day phải là số nguyên." }, 400);
    }
    try {
      const xepHang = calculateSuaChuaCaiTaoNhaMotNgay({ ...chung, solarDate: { year, month, day } });
      return jsonResponse({ xepHang }, 200);
    } catch (err) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
    }
  }

  if (
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (khoảng ngày)." }, 400);
  }

  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonth) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endYear) ||
    !Number.isInteger(endMonth) ||
    !Number.isInteger(endDay)
  ) {
    return jsonResponse({ error: "Các tham số ngày phải là số nguyên." }, 400);
  }

  try {
    const result = calculateSuaChuaCaiTaoNhaRange({
      ...chung,
      startDate: { year: startYear, month: startMonth, day: startDay },
      endDate: { year: endYear, month: endMonth, day: endDay },
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
