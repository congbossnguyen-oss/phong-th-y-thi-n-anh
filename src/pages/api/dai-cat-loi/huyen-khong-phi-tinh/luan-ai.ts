import type { APIRoute } from "astro";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { phanTichLuuNien, tinhToanHuyenKhong } from "../../../../lib/huyen-khong-phi-tinh/engine";
import { luanHuyenKhongBangAi, type NhomBLoanDau } from "../../../../lib/huyen-khong-phi-tinh/luan-ai";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const HUONG_8 = [1, 8, 3, 4, 9, 2, 7, 6];

function cungHopLe(v: unknown): number | null {
  return typeof v === "number" && HUONG_8.includes(v) ? v : null;
}
function dsCungHopLe(v: unknown): number[] {
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === "number" && HUONG_8.includes(x)) : [];
}

/**
 * Luận chi tiết bằng AI (DeepSeek) cho module Huyền Không Phi Tinh — ĐANG TEST NỘI BỘ, chưa chốt
 * giá nên chỉ admin gọi được (403 cho khách thường), cùng mẫu luan-giai-tu-vi/checkout.ts.
 *
 * Tính lại tinh bàn ở SERVER từ tọa độ/vận thô thay vì tin dữ liệu tinh bàn client gửi lên — tránh
 * việc client có thể gửi tinh bàn giả để AI luận sai (cùng nguyên tắc "không nhận số tiền client
 * gửi" ở gia-cong-cu.ts, áp dụng tương tự cho dữ liệu tính toán).
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "huyen-khong-luan-ai", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user || locals.user.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Tính năng đang test nội bộ, chưa mở cho khách." }, 403);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  const b = body as Record<string, unknown>;

  const doHuong = Number(b.doHuong);
  const van = Number(b.van);
  if (!Number.isFinite(doHuong) || doHuong < 0 || doHuong > 360) {
    return jsonResponse({ ok: false, error: "Độ hướng không hợp lệ." }, 400);
  }
  if (!Number.isInteger(van) || van < 1 || van > 9) {
    return jsonResponse({ ok: false, error: "Vận không hợp lệ." }, 400);
  }

  const nb = (b.nhomB && typeof b.nhomB === "object" ? b.nhomB : {}) as Record<string, unknown>;
  const nhomB: NhomBLoanDau = {
    nui: dsCungHopLe(nb.nui),
    nuoc: dsCungHopLe(nb.nuoc),
    cuaChinh: cungHopLe(nb.cuaChinh),
    bep: cungHopLe(nb.bep),
    giuongNgu: cungHopLe(nb.giuongNgu),
    banLamViec: cungHopLe(nb.banLamViec),
    cauThang: cungHopLe(nb.cauThang),
    wc: dsCungHopLe(nb.wc),
    gieng: cungHopLe(nb.gieng),
    soTang: typeof b.soTang === "number" && Number.isFinite(b.soTang) ? b.soTang : null,
  };

  const namXem = Number(b.namXem);
  const thangXem = Number(b.thangXem);
  const coNamXem = Number.isInteger(namXem) && namXem >= 1900 && namXem <= 2100;
  const coThangXem = coNamXem && Number.isInteger(thangXem) && thangXem >= 1 && thangXem <= 12;

  let kq;
  try {
    kq = tinhToanHuyenKhong(doHuong, van);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được tinh bàn." }, 400);
  }

  let luuNienData: Parameters<typeof luanHuyenKhongBangAi>[2] = null;
  if (coNamXem) {
    const ln = phanTichLuuNien(kq.tinh_ban, namXem, coThangXem ? thangXem : null);
    luuNienData = {
      nam: namXem,
      thang: coThangXem ? thangXem : null,
      nienTinh: ln.nien_tinh_nhap_trung,
      nguyetTinh: ln.nguyet_tinh_nhap_trung,
      canhBao: ln.canh_bao,
    };
  }

  const ketQua = await luanHuyenKhongBangAi(kq, nhomB, luuNienData);
  if (!ketQua) {
    return jsonResponse({ ok: false, error: "AI không trả được kết quả, vui lòng thử lại." }, 502);
  }
  return jsonResponse({ ok: true, data: ketQua }, 200);
};
