/**
 * Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
 *
 * Kiểm tra đầu vào dùng chung cho các route dịch vụ Cưới Hỏi trọn gói
 * (test-calculate / checkout / result) — để các nơi không lệch luật nhau.
 *
 * Đặt tên bắt đầu bằng dấu gạch dưới để Astro KHÔNG coi đây là một route.
 */
import type { CuoiHoiTronGoiInput } from "@thien-anh/trachnhat-engine";

export const TOOL_SLUG = "ngay-cuoi-hoi-qs";
export const TIMEZONE = "Asia/Ho_Chi_Minh";

const NGHI_LE_HOP_LE = ["an-hoi", "don-dau", "thanh-hon", "dang-ky-ket-hon"];
const UU_TIEN_HOP_LE = ["can-bang", "uu-tien-co-dau", "uu-tien-chu-re"];
const CHE_DO_HOP_LE = ["tron-goi", "tung-nghi-le"];

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
  input: CuoiHoiTronGoiInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  }
  const b = body as Record<string, unknown>;

  const namSinhCoDau = Number(b.namSinhCoDau);
  const namSinhChuRe = Number(b.namSinhChuRe);
  if (!Number.isInteger(namSinhCoDau) || namSinhCoDau < 1940 || namSinhCoDau > 2010) {
    return { ok: false, error: "Năm sinh cô dâu không hợp lệ (1940–2010)." };
  }
  if (!Number.isInteger(namSinhChuRe) || namSinhChuRe < 1940 || namSinhChuRe > 2010) {
    return { ok: false, error: "Năm sinh chú rể không hợp lệ (1940–2010)." };
  }

  const startDate = docNgay(b.tuNgay);
  const endDate = docNgay(b.denNgay);
  if (!startDate || !endDate) {
    return { ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." };
  }
  if (Date.UTC(startDate.year, startDate.month - 1, startDate.day) > Date.UTC(endDate.year, endDate.month - 1, endDate.day)) {
    return { ok: false, error: '"Từ ngày" phải trước "Đến ngày".' };
  }

  const uuTien = typeof b.uuTien === "string" && UU_TIEN_HOP_LE.includes(b.uuTien) ? b.uuTien : "can-bang";
  const cheDo = typeof b.cheDo === "string" && CHE_DO_HOP_LE.includes(b.cheDo) ? b.cheDo : "tron-goi";

  let nghiLe: string | undefined;
  if (cheDo === "tung-nghi-le") {
    if (typeof b.nghiLe !== "string" || !NGHI_LE_HOP_LE.includes(b.nghiLe)) {
      return { ok: false, error: "Vui lòng chọn nghi lễ hợp lệ." };
    }
    nghiLe = b.nghiLe;
  }

  return {
    ok: true,
    input: {
      namSinhCoDau,
      namSinhChuRe,
      startDate,
      endDate,
      uuTien: uuTien as CuoiHoiTronGoiInput["uuTien"],
      timeZone: TIMEZONE,
      cheDo: cheDo as CuoiHoiTronGoiInput["cheDo"],
      ...(nghiLe ? { nghiLe: nghiLe as NonNullable<CuoiHoiTronGoiInput["nghiLe"]> } : {}),
    },
  };
}
