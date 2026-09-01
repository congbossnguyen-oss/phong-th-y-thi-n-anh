// API con riêng cho app Quân Sư — phục vụ component XemNgayTotXau.astro (tách khỏi web 1/9/2026,
// xem project_quan_su_tach_doc_lap_khoi_web.md). Bản độc lập của /api/dong-phong.
import type { APIRoute } from "astro";
import { checkRateLimit } from "../../../lib/rate-limit";
import { calculateDongPhongRange } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function daysInGregorianMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Quét khoảng ngày (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-qs-dong-phong", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;
  const chiChongRaw = params.get("chiChong");
  const chiVoRaw = params.get("chiVo");

  if (yearRaw === null || monthRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: year, month." }, 400);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return jsonResponse({ error: "year, month không hợp lệ." }, 400);
  }

  if (chiChongRaw !== null && !CHI_HOP_LE.includes(chiChongRaw)) {
    return jsonResponse({ error: "chiChong không hợp lệ." }, 400);
  }
  if (chiVoRaw !== null && !CHI_HOP_LE.includes(chiVoRaw)) {
    return jsonResponse({ error: "chiVo không hợp lệ." }, 400);
  }

  try {
    const result = calculateDongPhongRange({
      startDate: { year, month, day: 1 },
      endDate: { year, month, day: daysInGregorianMonth(year, month) },
      timeZone,
      ...(chiChongRaw !== null ? { chiTuoiChong: chiChongRaw as (typeof CHI_HOP_LE)[number] } : {}),
      ...(chiVoRaw !== null ? { chiTuoiVo: chiVoRaw as (typeof CHI_HOP_LE)[number] } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
