import type { APIRoute } from "astro";
import { goiYTen, type GioiTinh } from "@thien-anh/tinhdanh-engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const namNay = new Date().getFullYear();

/**
 * Đặt tên cho con — Việt Danh Học (đang giai đoạn thử nghiệm, CHƯA thu phí, giống các trang VIP
 * khác). Dùng POST + JSON vì có thông tin cá nhân của bé; không lưu DB.
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const ho = typeof body.ho === "string" ? body.ho.trim() : "";
  if (!ho) return jsonResponse({ error: "Vui lòng nhập họ của bé." }, 400);

  const gioiTinhRaw = body.gioiTinh === "nam" || body.gioiTinh === "nu" ? body.gioiTinh : null;
  if (!gioiTinhRaw) return jsonResponse({ error: "Vui lòng chọn giới tính của bé." }, 400);

  const nam = Number(body.nam);
  const thang = Number(body.thang);
  const ngay = Number(body.ngay);
  if (
    !Number.isInteger(nam) || nam < 1900 || nam > namNay ||
    !Number.isInteger(thang) || thang < 1 || thang > 12 ||
    !Number.isInteger(ngay) || ngay < 1 || ngay > 31
  ) {
    return jsonResponse({ error: "Ngày sinh dương lịch không hợp lệ." }, 400);
  }

  // Đệm: chuỗi cách nhau bằng khoảng trắng, tối đa 2 đệm cho gọn.
  const demRaw = typeof body.dem === "string" ? body.dem.trim() : "";
  const dem = demRaw ? demRaw.split(/\s+/).slice(0, 2) : [];

  const gioNum = Number(body.gio);
  const gio = Number.isInteger(gioNum) && gioNum >= 0 && gioNum <= 23 ? gioNum : undefined;
  const phutNum = Number(body.phut);
  const phut = Number.isInteger(phutNum) && phutNum >= 0 && phutNum <= 59 ? phutNum : undefined;

  try {
    const ketQua = goiYTen({
      ho,
      dem,
      gioiTinh: gioiTinhRaw as GioiTinh,
      nam,
      thang,
      ngay,
      ...(gio !== undefined ? { gio } : {}),
      ...(phut !== undefined ? { phut } : {}),
      soLuong: 20,
    });
    return jsonResponse({ ok: true, ketQua }, 200);
  } catch (err) {
    console.error("[dat-ten-cho-con] Lỗi khi gợi ý tên:", err);
    return jsonResponse({ error: "Có lỗi khi gợi ý tên. Vui lòng thử lại." }, 500);
  }
};
