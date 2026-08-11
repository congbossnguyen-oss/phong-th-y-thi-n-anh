import type { APIRoute } from "astro";
import { calculateTrungTang } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const GIOI_TINH_HOP_LE = ["nam", "nu"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseChiParam(params: URLSearchParams, key: string): string | undefined {
  const raw = params.get(key);
  if (raw === null || raw === "") return undefined;
  if (!CHI_HOP_LE.includes(raw)) throw new Error(`${key} không hợp lệ.`);
  return raw;
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;

  const gioiTinh = params.get("gioiTinh");
  const namSinhRaw = params.get("namSinh");
  const namMatRaw = params.get("namMat");
  const thangMatRaw = params.get("thangMat");
  const ngayMatRaw = params.get("ngayMat");
  const thangNhuan = params.get("thangNhuan") === "true";
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;

  if (!gioiTinh || !namSinhRaw || !namMatRaw || !thangMatRaw || !ngayMatRaw) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: gioiTinh, namSinh, namMat, thangMat, ngayMat." }, 400);
  }
  if (!GIOI_TINH_HOP_LE.includes(gioiTinh)) {
    return jsonResponse({ error: "gioiTinh không hợp lệ." }, 400);
  }

  const namSinh = Number(namSinhRaw);
  const namMat = Number(namMatRaw);
  const thangMat = Number(thangMatRaw);
  const ngayMat = Number(ngayMatRaw);

  if (!Number.isInteger(namSinh) || !Number.isInteger(namMat) || !Number.isInteger(thangMat) || !Number.isInteger(ngayMat)) {
    return jsonResponse({ error: "namSinh, namMat, thangMat, ngayMat phải là số nguyên." }, 400);
  }

  try {
    const gioMat = parseChiParam(params, "gioMat");
    const truongNam = parseChiParam(params, "truongNam");
    const conDauLon = parseChiParam(params, "conDauLon");
    const chauNoiLon = parseChiParam(params, "chauNoiLon");

    const thanQuyen = truongNam || conDauLon || chauNoiLon ? { truongNam, conDauLon, chauNoiLon } : undefined;

    const result = calculateTrungTang({
      gioiTinh: gioiTinh as "nam" | "nu",
      namSinhAmLich: namSinh,
      namMatAmLich: namMat,
      thangMatAmLich: thangMat,
      ngayMatAmLich: ngayMat,
      thangNhuan,
      timeZone,
      ...(gioMat ? { gioMat: gioMat as (typeof CHI_HOP_LE)[number] } : {}),
      ...(thanQuyen ? { thanQuyen } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
