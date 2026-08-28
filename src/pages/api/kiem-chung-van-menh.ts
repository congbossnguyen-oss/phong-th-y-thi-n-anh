import type { APIRoute } from "astro";
import { checkRateLimit } from "../../lib/rate-limit";
import { kiemChungVanMenh, type SuKienDauVao } from "../../lib/kiem-chung-van-menh";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const SO_SU_KIEN_TOI_DA = 15;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "kiem-chung-van-menh", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  const b = body as Record<string, unknown>;

  const ns = b.ngaySinh as Record<string, unknown> | undefined;
  const day = Number(ns?.day);
  const month = Number(ns?.month);
  const year = Number(ns?.year);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày, tháng, năm sinh." }, 400);
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return jsonResponse({ ok: false, error: "Ngày/tháng sinh không hợp lệ." }, 400);
  if (year < 1900 || year > 2100) return jsonResponse({ ok: false, error: "Năm sinh không hợp lệ (1900–2100)." }, 400);

  const hour = Number(b.gio);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return jsonResponse({ ok: false, error: "Vui lòng chọn giờ sinh (0–23)." }, 400);
  }
  let minute: number | undefined;
  if (b.phut !== undefined && b.phut !== null && b.phut !== "") {
    const m = Number(b.phut);
    if (Number.isInteger(m) && m >= 0 && m <= 59) minute = m;
  }

  const gioiTinh = b.gioiTinh;
  if (gioiTinh !== "Nam" && gioiTinh !== "Nữ") {
    return jsonResponse({ ok: false, error: "Vui lòng chọn giới tính (Nam/Nữ)." }, 400);
  }

  const suKienRaw = b.suKien;
  if (!Array.isArray(suKienRaw) || suKienRaw.length < 1) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập ít nhất 1 sự kiện đã xảy ra." }, 400);
  }
  if (suKienRaw.length > SO_SU_KIEN_TOI_DA) {
    return jsonResponse({ ok: false, error: `Chỉ nhận tối đa ${SO_SU_KIEN_TOI_DA} sự kiện mỗi lượt.` }, 400);
  }

  const suKien: SuKienDauVao[] = [];
  for (const item of suKienRaw) {
    if (!item || typeof item !== "object") return jsonResponse({ ok: false, error: "Danh sách sự kiện không hợp lệ." }, 400);
    const it = item as Record<string, unknown>;
    const nam = Number(it.nam);
    if (!Number.isInteger(nam) || nam < year || nam > new Date().getFullYear()) {
      return jsonResponse({ ok: false, error: `Năm sự kiện không hợp lệ: phải từ năm sinh (${year}) đến năm hiện tại.` }, 400);
    }
    const huong = it.huong;
    if (huong !== "tich_cuc" && huong !== "tieu_cuc") {
      return jsonResponse({ ok: false, error: "Mỗi sự kiện cần chọn Tích cực hoặc Tiêu cực." }, 400);
    }
    const moTa = typeof it.moTa === "string" ? it.moTa.slice(0, 200) : undefined;
    suKien.push({ nam, huong, ...(moTa ? { moTa } : {}) });
  }

  try {
    const ketQua = kiemChungVanMenh(
      { day, month, year, hour, ...(minute !== undefined ? { minute } : {}), gender: gioiTinh },
      suKien,
    );
    return jsonResponse({ ok: true, ...ketQua }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được, vui lòng kiểm tra lại thông tin." }, 400);
  }
};
