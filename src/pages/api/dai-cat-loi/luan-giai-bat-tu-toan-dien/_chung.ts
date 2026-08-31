/**
 * Kiểm tra đầu vào dùng chung cho các route của module Luận Giải Bát Tự Toàn Diện.
 * Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
import type { BatTuInput } from "../../../../lib/bat-tu";

/** Gói duy nhất bán từ 1/9/2026 — 700k, đủ 12 giai đoạn (trước đây tách Cơ Bản/Nâng Cao). */
export const TOOL_SLUG_TOAN_DIEN = "luan-giai-bat-tu-toan-dien" as const;
/** 2 slug CŨ — không còn bán mới, chỉ dùng để nhận diện đơn cũ (grandfather quyền truy cập đủ). */
export const TOOL_SLUG_CO_BAN = "luan-giai-bat-tu-co-ban" as const;
export const TOOL_SLUG_NANG_CAO = "luan-giai-bat-tu-nang-cao" as const;

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export interface KetQuaDoc {
  ok: true;
  input: BatTuInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/** Đọc & kiểm tra body → BatTuInput. Cần đủ NGÀY–THÁNG–NĂM–GIỜ + giới tính (lá số cần giờ sinh). */
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
    return { ok: false, error: "Vui lòng chọn giờ sinh (0–23). Lá số Bát Tự cần giờ sinh để lập đủ Tứ Trụ." };
  }
  let minute: number | undefined;
  if (b.phut !== undefined && b.phut !== null && b.phut !== "") {
    const m = Number(b.phut);
    if (Number.isInteger(m) && m >= 0 && m <= 59) minute = m;
  }

  const gioiTinh = b.gioiTinh;
  if (gioiTinh !== "Nam" && gioiTinh !== "Nữ") {
    return { ok: false, error: "Vui lòng chọn giới tính (Nam/Nữ)." };
  }

  return {
    ok: true,
    input: { day, month, year, hour, ...(minute !== undefined ? { minute } : {}), gender: gioiTinh },
  };
}
