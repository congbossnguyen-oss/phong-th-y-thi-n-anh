/**
 * Kiểm tra đầu vào dùng chung cho các route của module Hỏi Đáp Kỳ Môn (1 sự việc cụ thể — chế độ
 * Thời Gian/Bốc Độn, KHÔNG phải Mệnh). Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
import { traTinhHuong, laQuanHeCauHoi, type QuanHeCauHoi } from "../../../../lib/kymon/danhMucCauHoi";

export const TOOL_SLUG = "ky-mon-hoi-dap";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Lá bàn dùng để hỏi — chế độ Thời Gian (nam/thang/ngay/gio/phut) hoặc Bốc Độn (soCuc/amDuong/hoaGiap). */
export type LaBanChoHoi =
  | { cheDo: "gio"; nam: number; thang: number; ngay: number; gio: number; phut: number }
  | { cheDo: "1080"; soCuc: number; amDuong: "+" | "-"; hoaGiap: string };

export interface KyMonHoiDapInput {
  laBan: LaBanChoHoi;
  chuDeId: string;
  tinhHuongId: string;
  quanHe: QuanHeCauHoi;
  cauHoi: string;
  thongTinBoSung: string;
}

export interface KetQuaDoc {
  ok: true;
  input: KyMonHoiDapInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

// km_data.json phủ 1901-01-01 → 2051-02-07 — chặn ngoài khoảng này trước khi tốn công tính/thu tiền.
const NAM_TOI_THIEU = 1901;
const NAM_TOI_DA = 2051;

function docLaBan(b: Record<string, unknown>): LaBanChoHoi | { error: string } {
  const cheDo = b.cheDo;
  if (cheDo === "1080") {
    const soCuc = Number(b.soCuc);
    const amDuong = b.amDuong;
    const hoaGiap = b.hoaGiap;
    if (!Number.isInteger(soCuc) || soCuc < 1 || soCuc > 9) return { error: "soCuc phải là số nguyên 1-9." };
    if (amDuong !== "+" && amDuong !== "-") return { error: 'amDuong phải là "+" hoặc "-".' };
    if (typeof hoaGiap !== "string" || !hoaGiap) return { error: "Thiếu hoa giáp." };
    return { cheDo: "1080", soCuc, amDuong, hoaGiap };
  }
  if (cheDo === "gio") {
    const nam = Number(b.nam);
    const thang = Number(b.thang);
    const ngay = Number(b.ngay);
    const gio = Number(b.gio);
    const phut = Number(b.phut);
    if (![nam, thang, ngay, gio, phut].every(Number.isInteger)) return { error: "Ngày giờ không hợp lệ." };
    if (nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) return { error: `Năm phải trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.` };
    if (thang < 1 || thang > 12) return { error: "Tháng không hợp lệ." };
    if (ngay < 1 || ngay > 31) return { error: "Ngày không hợp lệ." };
    if (gio < 0 || gio > 23) return { error: "Giờ không hợp lệ." };
    if (phut < 0 || phut > 59) return { error: "Phút không hợp lệ." };
    return { cheDo: "gio", nam, thang, ngay, gio, phut };
  }
  return { error: 'cheDo phải là "gio" hoặc "1080" (Hỏi Đáp không dùng chế độ Mệnh).' };
}

export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  const b = body as Record<string, unknown>;

  const laBan = docLaBan(b);
  if ("error" in laBan) return { ok: false, error: laBan.error };

  const chuDeId = typeof b.chuDeId === "string" ? b.chuDeId : "";
  const tinhHuongId = typeof b.tinhHuongId === "string" ? b.tinhHuongId : "";
  const tra = traTinhHuong(chuDeId, tinhHuongId);
  if (!tra) return { ok: false, error: "Chủ đề/tình huống không hợp lệ." };

  if (!laQuanHeCauHoi(b.quanHe)) return { ok: false, error: "Vui lòng chọn bạn hỏi cho ai." };

  const cauHoi = typeof b.cauHoi === "string" ? b.cauHoi.trim() : "";
  if (!cauHoi) return { ok: false, error: "Vui lòng nhập câu hỏi của bạn." };
  if (cauHoi.length > 1000) return { ok: false, error: "Câu hỏi quá dài (tối đa 1000 ký tự)." };

  const thongTinBoSungRaw = typeof b.thongTinBoSung === "string" ? b.thongTinBoSung.trim() : "";
  if (thongTinBoSungRaw.length > 1000) return { ok: false, error: "Thông tin bổ sung quá dài (tối đa 1000 ký tự)." };

  return {
    ok: true,
    input: { laBan, chuDeId, tinhHuongId, quanHe: b.quanHe, cauHoi, thongTinBoSung: thongTinBoSungRaw },
  };
}
