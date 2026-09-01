// Bản ĐỘC LẬP cho app Quân Sư của "Chọn Năm Sinh Con" (anh Công chốt 1/9/2026: Quân Sư không đấu
// nối code với web nữa — áp dụng cả cho module miễn phí, không chỉ module VIP). CỐ Ý gần như y hệt
// `src/pages/api/chon-nam-sinh-con.ts` — chấp nhận trùng lặp thay vì dùng chung. Module này KHÔNG
// có toolSlug/thanh toán nên không cần đổi tên hàm tính, chỉ đổi namespace route.
import type { APIRoute } from "astro";
import { calculateChonNamSinhCon } from "@thien-anh/trachnhat-engine";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

const GIOI_TINH_CON_HOP_LE = ["nam", "nu"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Luôn quét khoảng năm (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-qs-chon-nam-sinh", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const namSinhChaRaw = params.get("namSinhCha");
  const namSinhMeRaw = params.get("namSinhMe");
  const gioiTinhCon = params.get("gioiTinhCon");
  const tuNamRaw = params.get("tuNam");
  const denNamRaw = params.get("denNam");

  if (namSinhChaRaw === null || namSinhMeRaw === null || tuNamRaw === null || denNamRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinhCha, namSinhMe, tuNam, denNam." }, 400);
  }
  if (gioiTinhCon === null || !GIOI_TINH_CON_HOP_LE.includes(gioiTinhCon)) {
    return jsonResponse({ error: "gioiTinhCon không hợp lệ." }, 400);
  }

  const namSinhCha = Number(namSinhChaRaw);
  const namSinhMe = Number(namSinhMeRaw);
  const tuNam = Number(tuNamRaw);
  const denNam = Number(denNamRaw);
  if (!Number.isInteger(namSinhCha) || !Number.isInteger(namSinhMe) || !Number.isInteger(tuNam) || !Number.isInteger(denNam)) {
    return jsonResponse({ error: "namSinhCha, namSinhMe, tuNam, denNam phải là số nguyên." }, 400);
  }

  try {
    const results = calculateChonNamSinhCon({
      namSinhCha,
      namSinhMe,
      gioiTinhCon: gioiTinhCon as "nam" | "nu",
      tuNam,
      denNam,
    });
    return jsonResponse({ results }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
