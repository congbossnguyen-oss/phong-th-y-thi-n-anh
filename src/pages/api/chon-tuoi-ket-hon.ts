import type { APIRoute } from "astro";
import { calculateChonTuoiKetHon, timTuoiKetHonPhuHop } from "@thien-anh/trachnhat-engine";
import { checkRateLimit } from "../../lib/rate-limit";

export const prerender = false;

const GIOI_TINH_HOP_LE = ["nam", "nu"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseGioiTinh(raw: string | null, nhan: string): "nam" | "nu" {
  if (raw === null || !GIOI_TINH_HOP_LE.includes(raw)) {
    throw new Error(`${nhan} không hợp lệ.`);
  }
  return raw as "nam" | "nu";
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const params = url.searchParams;
  const mode = params.get("mode") ?? "so-sanh";

  try {
    if (mode === "tim-hop") {
      // CHỈ chặn mode "tìm" (quét khoảng năm); mode so-sánh 2 người nhẹ không giới hạn.
      const limited = checkRateLimit({ request, clientAddress }, { key: "free-chon-tuoi", max: 20, windowMs: 60_000 });
      if (limited) return limited;

      const namSinhRaw = params.get("namSinh");
      const gioiTinhRaw = params.get("gioiTinh");
      const timGioiTinhRaw = params.get("timGioiTinh");
      const tuNamRaw = params.get("tuNam");
      const denNamRaw = params.get("denNam");
      if (namSinhRaw === null || tuNamRaw === null || denNamRaw === null) {
        return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh, tuNam, denNam." }, 400);
      }
      const namSinh = Number(namSinhRaw);
      const tuNam = Number(tuNamRaw);
      const denNam = Number(denNamRaw);
      if (!Number.isInteger(namSinh) || !Number.isInteger(tuNam) || !Number.isInteger(denNam)) {
        return jsonResponse({ error: "namSinh, tuNam, denNam phải là số nguyên." }, 400);
      }
      const gioiTinh = parseGioiTinh(gioiTinhRaw, "gioiTinh");
      const timGioiTinh = parseGioiTinh(timGioiTinhRaw, "timGioiTinh");

      const results = timTuoiKetHonPhuHop({ coDinh: { namSinh, gioiTinh }, timGioiTinh, tuNam, denNam });
      return jsonResponse({ results }, 200);
    }

    const namSinh1Raw = params.get("namSinh1");
    const gioiTinh1Raw = params.get("gioiTinh1");
    const namSinh2Raw = params.get("namSinh2");
    const gioiTinh2Raw = params.get("gioiTinh2");
    if (namSinh1Raw === null || namSinh2Raw === null) {
      return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh1, gioiTinh1, namSinh2, gioiTinh2." }, 400);
    }
    const namSinh1 = Number(namSinh1Raw);
    const namSinh2 = Number(namSinh2Raw);
    if (!Number.isInteger(namSinh1) || !Number.isInteger(namSinh2)) {
      return jsonResponse({ error: "namSinh1, namSinh2 phải là số nguyên." }, 400);
    }
    const gioiTinh1 = parseGioiTinh(gioiTinh1Raw, "gioiTinh1");
    const gioiTinh2 = parseGioiTinh(gioiTinh2Raw, "gioiTinh2");

    const result = calculateChonTuoiKetHon({
      nguoi1: { namSinh: namSinh1, gioiTinh: gioiTinh1 },
      nguoi2: { namSinh: namSinh2, gioiTinh: gioiTinh2 },
    });
    return jsonResponse({ result }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
