/**
 * Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
 *
 * Kiểm tra đầu vào dùng chung cho các route của module Định Hướng Nghề Nghiệp (Bát Tự × Tử Vi).
 * Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
import type { NgheInput } from "../../../../../lib/nghe-nghiep/tao-ho-so-nghe";
import type { Gender } from "../../../../../lib/chart-profile/types";

export const TOOL_SLUG = "dinh-huong-nghe-nghiep-qs";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export interface KetQuaDoc {
  ok: true;
  input: NgheInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/** Đọc & kiểm tra body → NgheInput. Cần đủ NGÀY–THÁNG–NĂM–GIỜ + giới tính (lá số cần giờ sinh). */
export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  const b = body as Record<string, unknown>;

  const ns = b.ngaySinh as Record<string, unknown> | undefined;
  const day = Number(ns?.day);
  const month = Number(ns?.month);
  const year = Number(ns?.year);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Vui lòng chọn đầy đủ ngày, tháng, năm sinh." };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return { ok: false, error: "Ngày/tháng sinh không hợp lệ." };
  if (year < 1900 || year > 2100) return { ok: false, error: "Năm sinh không hợp lệ (1900–2100)." };

  const hour = Number(b.gio);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { ok: false, error: "Vui lòng chọn giờ sinh (0–23). Lá số cần giờ sinh để an Tứ Trụ & 12 cung." };
  }
  let minute: number | undefined;
  if (b.phut !== undefined && b.phut !== null && b.phut !== "") {
    const m = Number(b.phut);
    if (Number.isInteger(m) && m >= 0 && m <= 59) minute = m;
  }

  const gioiTinh = b.gioiTinh;
  if (gioiTinh !== "Nam" && gioiTinh !== "Nu") {
    return { ok: false, error: "Vui lòng chọn giới tính (Nam/Nữ)." };
  }

  return {
    ok: true,
    input: { day, month, year, hour, ...(minute !== undefined ? { minute } : {}), gender: gioiTinh as Gender },
  };
}
