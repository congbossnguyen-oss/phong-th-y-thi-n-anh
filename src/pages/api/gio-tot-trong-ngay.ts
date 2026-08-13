import type { APIRoute } from "astro";
import { calculateGioTotTrongNgay } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

const PURPOSE_HOP_LE = ["GENERAL", "CAU_TAI", "GIAO_TIEP_TIEC_TUNG", "DONG_PHONG", "KHAI_TRUONG", "KY_HOP_DONG", "XUAT_HANH", "CUOI_HOI", "KHAI_QUANG"];

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
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;
  const purposeRaw = params.get("purpose");
  const namSinhRaw = params.get("namSinh");

  if (yearRaw === null || monthRaw === null || dayRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month, day." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return jsonResponse({ error: "year, month, day phải là số nguyên." }, 400);
  }

  if (purposeRaw !== null && !PURPOSE_HOP_LE.includes(purposeRaw)) {
    return jsonResponse({ error: "purpose không hợp lệ." }, 400);
  }

  const namSinh = namSinhRaw !== null ? Number(namSinhRaw) : undefined;
  if (namSinh !== undefined && !Number.isInteger(namSinh)) {
    return jsonResponse({ error: "namSinh phải là số nguyên." }, 400);
  }

  try {
    const result = calculateGioTotTrongNgay({
      solarDate: { year, month, day },
      timeZone,
      ...(purposeRaw !== null ? { purpose: purposeRaw as (typeof PURPOSE_HOP_LE)[number] } : {}),
      ...(namSinh !== undefined ? { namSinh } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
