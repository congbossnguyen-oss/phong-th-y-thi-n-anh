/**
 * Kiểm tra đầu vào dùng chung cho các route của module Luận Giải Tử Vi (Cơ Bản/Nâng Cao).
 * Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route — cùng quy ước với
 * luan-giai-bat-tu-toan-dien/_chung.ts.
 */
import type { LuanGiaiTuViInput } from "../../../../lib/tu-vi/luan-giai/taoLuanGiaiTuVi";

/** Gói duy nhất bán từ 1/9/2026 — 500k, đủ nội dung (trước đây tách Cơ Bản/Nâng Cao). */
export const TOOL_SLUG_TOAN_DIEN = "luan-giai-tu-vi-toan-dien" as const;
/** 2 slug CŨ — không còn bán mới, chỉ dùng để nhận diện đơn cũ (grandfather quyền truy cập đủ). */
export const TOOL_SLUG_CO_BAN = "luan-giai-tu-vi-co-ban" as const;
export const TOOL_SLUG_NANG_CAO = "luan-giai-tu-vi-nang-cao" as const;

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export interface KetQuaDoc {
  ok: true;
  input: Omit<LuanGiaiTuViInput, "goi">;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

/** Đọc & kiểm tra body → dữ liệu ngày giờ sinh cần cho lá số Tử Vi. */
export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  const b = body as Record<string, unknown>;

  const day = Number(b.ngay);
  const month = Number(b.thang);
  const year = Number(b.nam);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Vui lòng chọn đầy đủ ngày, tháng, năm sinh." };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return { ok: false, error: "Ngày/tháng sinh không hợp lệ." };
  if (year < 1900 || year > 2100) return { ok: false, error: "Năm sinh không hợp lệ (1900–2100)." };

  const hour = Number(b.gio);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { ok: false, error: "Vui lòng chọn giờ sinh (0–23) — lá số Tử Vi cần giờ sinh để an sao." };
  }

  const gioiTinh = b.gioiTinh;
  if (gioiTinh !== "Nam" && gioiTinh !== "Nữ") {
    return { ok: false, error: "Vui lòng chọn giới tính (Nam/Nữ)." };
  }

  const hoTen = typeof b.hoTen === "string" ? b.hoTen.trim().slice(0, 100) : "";

  return {
    ok: true,
    input: { day, month, year, hour, gender: gioiTinh, hoTen },
  };
}
