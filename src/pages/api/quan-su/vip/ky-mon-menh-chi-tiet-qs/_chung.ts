/**
 * Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
 *
 * Kiểm tra đầu vào dùng chung cho các route của module Luận Giải Kỳ Môn Mệnh (chi tiết).
 * Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
export const TOOL_SLUG = "ky-mon-menh-chi-tiet-qs";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Đầu vào = đúng ngày-giờ SINH đã dùng để lập lá bàn Mệnh miễn phí trên /quan-su/lap-ky-mon (không
 * hỏi lại khách) — khớp shape LapLaBanInputLich (trừ cheDo, luôn cố định "menh" ở nơi gọi). */
export interface KyMonMenhInput {
  nam: number;
  thang: number;
  ngay: number;
  gio: number;
  phut: number;
}

export interface KetQuaDoc {
  ok: true;
  input: KyMonMenhInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

// km_data.json phủ 1901-01-01 → 2051-02-07 (xem src/lib/kymon/data/km_data.json) — chặn ngoài
// khoảng này trước khi tốn công tính/thu tiền.
const NAM_TOI_THIEU = 1901;
const NAM_TOI_DA = 2051;

export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  const b = body as Record<string, unknown>;

  const nam = Number(b.nam);
  const thang = Number(b.thang);
  const ngay = Number(b.ngay);
  const gio = Number(b.gio);
  const phut = Number(b.phut);
  if (![nam, thang, ngay, gio, phut].every(Number.isInteger)) {
    return { ok: false, error: "Ngày giờ sinh không hợp lệ." };
  }
  if (nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    return { ok: false, error: `Năm sinh phải trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.` };
  }
  if (thang < 1 || thang > 12) return { ok: false, error: "Tháng sinh không hợp lệ." };
  if (ngay < 1 || ngay > 31) return { ok: false, error: "Ngày sinh không hợp lệ." };
  if (gio < 0 || gio > 23) return { ok: false, error: "Giờ sinh không hợp lệ." };
  if (phut < 0 || phut > 59) return { ok: false, error: "Phút sinh không hợp lệ." };

  return { ok: true, input: { nam, thang, ngay, gio, phut } };
}
