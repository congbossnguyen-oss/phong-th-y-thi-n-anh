import type { APIRoute } from "astro";
import { calculateConSoMayMan, type ConSoMayManInput } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const PURPOSE_HOP_LE: readonly NonNullable<ConSoMayManInput["purpose"]>[] = [
  "TONG_VAN",
  "TAI_LOC",
  "CONG_VIEC",
  "GIAO_TIEP",
  "TINH_CAM",
];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const namSinhRaw = params.get("namSinh");
  const dayRaw = params.get("day");
  const monthRaw = params.get("month");
  const yearRaw = params.get("year");
  const purpose = params.get("purpose");

  if (namSinhRaw === null || dayRaw === null || monthRaw === null || yearRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh, day, month, year." }, 400);
  }

  const namSinh = Number(namSinhRaw);
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  if (!Number.isInteger(namSinh) || !Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return jsonResponse({ error: "namSinh, day, month, year phải là số nguyên." }, 400);
  }
  if (purpose !== null && !PURPOSE_HOP_LE.includes(purpose)) {
    return jsonResponse({ error: `purpose không hợp lệ, phải là 1 trong: ${PURPOSE_HOP_LE.join(", ")}.` }, 400);
  }

  try {
    const results = calculateConSoMayMan({
      namSinh,
      ngayTinh: { day, month, year },
      ...(purpose ? { purpose: purpose as NonNullable<ConSoMayManInput["purpose"]> } : {}),
    });
    return jsonResponse({ results }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
