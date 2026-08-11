import type { APIRoute } from "astro";
import { calculateNgayDaiCatCaNhan } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const PURPOSE_HOP_LE = ["TONG_VAN", "CAU_TAI", "CONG_VIEC", "GIAO_TIEP_TIEC_TUNG", "TINH_CAM"];

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
  const namSinhRaw = params.get("namSinh");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;
  const purposeRaw = params.get("purpose");

  if (yearRaw === null || monthRaw === null || namSinhRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month, namSinh." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const namSinh = Number(namSinhRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(namSinh)) {
    return jsonResponse({ error: "year, month, namSinh không hợp lệ." }, 400);
  }

  if (purposeRaw !== null && !PURPOSE_HOP_LE.includes(purposeRaw)) {
    return jsonResponse({ error: "purpose không hợp lệ." }, 400);
  }

  try {
    const result = calculateNgayDaiCatCaNhan({
      startDate: { year, month, day: 1 },
      endDate: { year, month, day: daysInGregorianMonth(year, month) },
      timeZone,
      namSinh,
      ...(purposeRaw !== null ? { purpose: purposeRaw as (typeof PURPOSE_HOP_LE)[number] } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
