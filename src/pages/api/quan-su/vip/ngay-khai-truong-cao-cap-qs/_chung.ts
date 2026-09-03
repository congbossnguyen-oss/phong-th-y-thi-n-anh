/**
 * Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
 *
 * Kiểm tra đầu vào dùng chung cho các route module Ngày Khai Trương Cao Cấp
 * (test-calculate / checkout / result). Tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
import type { NgayKhaiTruongCaoCapInput } from "@thien-anh/trachnhat-engine";

export const TOOL_SLUG = "ngay-khai-truong-cao-cap-qs";
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
  input: NgayKhaiTruongCaoCapInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/**
 * `chuNgaySinh` TÙY CHỌN: bỏ trống → chạy bản thường (không lớp Bát Tự). Có → bật cao cấp.
 * `chuGioSinh` TÙY CHỌN: có → chạy thêm Lõi 3 (Dụng Thần/vượng suy).
 */
export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  }
  const b = body as Record<string, unknown>;

  const startDate = docNgay(b.tuNgay ?? b.startDate);
  const endDate = docNgay(b.denNgay ?? b.endDate);
  if (!startDate || !endDate) {
    return { ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." };
  }

  let chuNgaySinh: { year: number; month: number; day: number } | undefined;
  if (b.chuNgaySinh) {
    const ns = docNgay(b.chuNgaySinh);
    if (!ns) return { ok: false, error: "Ngày sinh chủ không hợp lệ — cần đủ ngày, tháng, năm." };
    if (ns.year < 1900 || ns.year > 2100) return { ok: false, error: "Năm sinh chủ không hợp lệ (1900-2100)." };
    chuNgaySinh = ns;
  }

  let chuGioSinh: number | undefined;
  if (chuNgaySinh && b.chuGioSinh !== undefined && b.chuGioSinh !== null && b.chuGioSinh !== "") {
    const g = Number(b.chuGioSinh);
    if (Number.isInteger(g) && g >= 0 && g <= 23) chuGioSinh = g;
  }

  return {
    ok: true,
    input: {
      startDate,
      endDate,
      timeZone: TIMEZONE,
      ...(chuNgaySinh ? { chuNgaySinh } : {}),
      ...(chuGioSinh !== undefined ? { chuGioSinh } : {}),
    },
  };
}
