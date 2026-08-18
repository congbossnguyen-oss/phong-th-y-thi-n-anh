/**
 * Kiểm tra đầu vào dùng chung cho 3 route của module Ngày Giờ Nhận Chức
 * (test-calculate / checkout / result) — để 3 nơi không lệch luật nhau.
 *
 * Đặt tên bắt đầu bằng dấu gạch dưới để Astro KHÔNG coi đây là một route.
 */
import type { NhanChucInput } from "@thien-anh/trachnhat-engine";

export const TOOL_SLUG = "nhan-chuc";
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
  input: NhanChucInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/**
 * Đọc và kiểm tra body request thành input của engine.
 *
 * `ngaySinhNguoiNhanChuc` là TÙY CHỌN: bỏ trống thì engine chạy chế độ chung (chấm điểm ngày tốt
 * cho mọi người), có thì chạy thêm lớp Thập Thần + tuổi/mệnh của người nhận chức.
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

  let ngaySinh: { year: number; month: number; day: number } | undefined;
  if (b.ngaySinhNguoiNhanChuc) {
    const ns = docNgay(b.ngaySinhNguoiNhanChuc);
    if (!ns) {
      return { ok: false, error: "Ngày sinh người nhận chức không hợp lệ — cần đủ ngày, tháng, năm." };
    }
    if (ns.year < 1900 || ns.year > 2100) {
      return { ok: false, error: "Năm sinh người nhận chức không hợp lệ (1900-2100)." };
    }
    ngaySinh = ns;
  }

  // Khung giờ ưu tiên (mục 29) — tùy chọn. Chấp nhận start/end là giờ 0-24.
  let khungGioUuTien: { start: number; end: number } | undefined;
  if (b.khungGioUuTien && typeof b.khungGioUuTien === "object") {
    const k = b.khungGioUuTien as Record<string, unknown>;
    const start = Number(k.start);
    const end = Number(k.end);
    if (Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end <= 24 && end > start) {
      khungGioUuTien = { start, end };
    }
  }

  const tenChucVu = typeof b.tenChucVu === "string" ? b.tenChucVu.trim().slice(0, 120) : undefined;

  return {
    ok: true,
    input: {
      tuNgay,
      denNgay,
      timeZone: TIMEZONE,
      ...(ngaySinh ? { ngaySinhNguoiNhanChuc: ngaySinh } : {}),
      ...(khungGioUuTien ? { khungGioUuTien } : {}),
      ...(tenChucVu ? { tenChucVu } : {}),
      soKetQua: 5,
    },
  };
}
