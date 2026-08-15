/**
 * Phần kiểm tra đầu vào dùng chung cho 3 route của module Ngày Ký Hợp Đồng cao cấp
 * (test-calculate / checkout / result) — để 3 nơi không lệch luật nhau.
 *
 * Đặt tên bắt đầu bằng dấu gạch dưới để Astro KHÔNG coi đây là một route.
 */
import type { NgayKyHopDongCaoCapInput } from "@thien-anh/trachnhat-engine";

export const TOOL_SLUG = "ngay-ky-hop-dong-cao-cap";
export const TIMEZONE = "Asia/Ho_Chi_Minh";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function docNgay(v: unknown): { year: number; month: number; day: number } | null {
  const o = v as Record<string, unknown> | undefined;
  const d = { year: Number(o?.year), month: Number(o?.month), day: Number(o?.day) };
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) return null;
  if (d.month < 1 || d.month > 12 || d.day < 1 || d.day > 31) return null;
  return d;
}

export interface KetQuaDoc {
  ok: true;
  input: NgayKyHopDongCaoCapInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/**
 * Đọc và kiểm tra body request thành input của engine.
 *
 * `ngaySinhNguoiKy` là TÙY CHỌN: bỏ trống thì engine chạy chế độ chung (chấm điểm ngày tốt cho
 * mọi người), có thì chạy thêm lớp Thập Thần/Thê Tài theo Nhật Chủ.
 */
export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  }
  const b = body as Record<string, unknown>;

  const tuNgay = docNgay(b.tuNgay);
  const denNgay = docNgay(b.denNgay);
  if (!tuNgay || !denNgay) {
    return { ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." };
  }

  let ngaySinhNguoiKy: { year: number; month: number; day: number } | undefined;
  if (b.ngaySinhNguoiKy) {
    const ns = docNgay(b.ngaySinhNguoiKy);
    if (!ns) {
      return { ok: false, error: "Ngày sinh người ký không hợp lệ — cần đủ ngày, tháng, năm." };
    }
    if (ns.year < 1900 || ns.year > 2100) {
      return { ok: false, error: "Năm sinh người ký không hợp lệ (1900-2100)." };
    }
    ngaySinhNguoiKy = ns;
  }

  return {
    ok: true,
    input: {
      tuNgay,
      denNgay,
      timeZone: TIMEZONE,
      ...(ngaySinhNguoiKy ? { ngaySinhNguoiKy } : {}),
      soKetQua: 10,
    },
  };
}
