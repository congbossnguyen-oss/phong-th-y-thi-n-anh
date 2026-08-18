import type { APIRoute } from "astro";
import { calculateXemTuoiXongDat } from "@thien-anh/trachnhat-engine";
import { checkRateLimit } from "../../lib/rate-limit";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Luôn quét nhiều tuổi ứng viên (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-xem-tuoi-xong-dat", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const giaChuNamSinhRaw = params.get("giaChuNamSinh");
  const namXongRaw = params.get("namXong");
  const tuNamSinhUngVienRaw = params.get("tuNamSinhUngVien");
  const denNamSinhUngVienRaw = params.get("denNamSinhUngVien");
  const limitRaw = params.get("limit");

  if (giaChuNamSinhRaw === null || namXongRaw === null || tuNamSinhUngVienRaw === null || denNamSinhUngVienRaw === null) {
    return jsonResponse(
      { error: "Thiếu tham số bắt buộc: giaChuNamSinh, namXong, tuNamSinhUngVien, denNamSinhUngVien." },
      400,
    );
  }

  const giaChuNamSinh = Number(giaChuNamSinhRaw);
  const namXong = Number(namXongRaw);
  const tuNamSinhUngVien = Number(tuNamSinhUngVienRaw);
  const denNamSinhUngVien = Number(denNamSinhUngVienRaw);
  const limit = limitRaw !== null ? Number(limitRaw) : undefined;

  if (
    !Number.isInteger(giaChuNamSinh) ||
    !Number.isInteger(namXong) ||
    !Number.isInteger(tuNamSinhUngVien) ||
    !Number.isInteger(denNamSinhUngVien) ||
    (limit !== undefined && !Number.isInteger(limit))
  ) {
    return jsonResponse({ error: "Các tham số năm và limit phải là số nguyên." }, 400);
  }

  try {
    const result = calculateXemTuoiXongDat({
      giaChuNamSinh,
      namXong,
      tuNamSinhUngVien,
      denNamSinhUngVien,
      ...(limit !== undefined ? { limit } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
