import type { APIRoute } from "astro";
import { calculateLichCuoiHoi } from "@thien-anh/trachnhat-engine";
import type { CuoiHoi } from "@thien-anh/rule-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const UU_TIEN_HOP_LE = ["can-bang", "uu-tien-co-dau", "uu-tien-chu-re"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function parseDate(raw: string | null): { year: number; month: number; day: number } | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams;
  const namSinhCoDau = Number(p.get("namSinhCoDau"));
  const namSinhChuRe = Number(p.get("namSinhChuRe"));
  const start = parseDate(p.get("tuNgay"));
  const end = parseDate(p.get("denNgay"));
  const uuTien = p.get("uuTien") ?? "can-bang";

  if (!Number.isInteger(namSinhCoDau) || !Number.isInteger(namSinhChuRe)) {
    return jsonResponse({ error: "Năm sinh cô dâu / chú rể không hợp lệ." }, 400);
  }
  if (!start || !end) {
    return jsonResponse({ error: "Khoảng ngày không hợp lệ (định dạng YYYY-MM-DD)." }, 400);
  }
  if (!UU_TIEN_HOP_LE.includes(uuTien)) {
    return jsonResponse({ error: "Chế độ ưu tiên không hợp lệ." }, 400);
  }
  if (Date.UTC(start.year, start.month - 1, start.day) > Date.UTC(end.year, end.month - 1, end.day)) {
    return jsonResponse({ error: '"Từ ngày" phải trước "Đến ngày".' }, 400);
  }

  try {
    const result = calculateLichCuoiHoi({
      namSinhCoDau,
      namSinhChuRe,
      startDate: start,
      endDate: end,
      uuTien: uuTien as CuoiHoi.UuTienCuoiHoi,
      timeZone: DEFAULT_TIME_ZONE,
    });
    return jsonResponse({ ok: true, result }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
