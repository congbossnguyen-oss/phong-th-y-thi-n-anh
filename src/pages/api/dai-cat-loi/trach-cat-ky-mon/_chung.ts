import { traViec } from "../../../../lib/kymon/trachCat/danhMucViec";
import { SO_NGAY_QUET_TOI_DA } from "../../../../lib/kymon/trachCat";

export const TOOL_SLUG = "trach-cat-ky-mon" as const;

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Dữ liệu đơn hàng lưu vào snapshot — đủ để dựng lại toàn bộ kết quả về sau. */
export type TrachCatToolInput = {
  namSinh: number;
  thangSinh: number;
  ngaySinh: number;
  gioSinh: number;
  phutSinh: number;
  viecId: string;
  tuNgay: string;
  denNgay: string;
  toaSonCung?: number;
};

const CUNG_HOP_LE = new Set([1, 2, 3, 4, 6, 7, 8, 9]);

function laSoTrong(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

function laNgayISO(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const nam = Number(m[1]);
  const thang = Number(m[2]);
  const ngay = Number(m[3]);
  if (nam < 1901 || nam > 2100 || thang < 1 || thang > 12 || ngay < 1 || ngay > 31) return null;
  return v.trim();
}

export type DocKetQua = { ok: true; input: TrachCatToolInput } | { ok: false; error: string };

/**
 * Kiểm tra toàn bộ đầu vào Ở PHÍA MÁY CHỦ — không tin bất cứ giá trị nào client gửi lên.
 * Đặc biệt: việc gắn với công trình cố định (động thổ / nhập trạch / an táng) BẮT BUỘC có toạ sơn,
 * vì không có toạ sơn thì không kiểm được quy tắc xung toạ và phương Thái Tuế.
 */
export function docInput(body: unknown): DocKetQua {
  const b = (body ?? {}) as Record<string, unknown>;

  const namSinh = laSoTrong(b.namSinh, 1901, 2100);
  const thangSinh = laSoTrong(b.thangSinh, 1, 12);
  const ngaySinh = laSoTrong(b.ngaySinh, 1, 31);
  const gioSinh = laSoTrong(b.gioSinh, 0, 23);
  const phutSinh = laSoTrong(b.phutSinh, 0, 59);
  if (namSinh === null || thangSinh === null || ngaySinh === null || gioSinh === null || phutSinh === null) {
    return { ok: false, error: "Ngày giờ sinh của chủ sự chưa hợp lệ." };
  }

  const viecId = typeof b.viecId === "string" ? b.viecId.trim() : "";
  const viec = traViec(viecId);
  if (!viec) return { ok: false, error: "Chưa chọn việc dụng sự hợp lệ." };

  const tuNgay = laNgayISO(b.tuNgay);
  const denNgay = laNgayISO(b.denNgay);
  if (!tuNgay || !denNgay) return { ok: false, error: "Khoảng ngày cần chọn chưa hợp lệ." };

  const mocTu = Date.parse(`${tuNgay}T00:00:00Z`);
  const mocDen = Date.parse(`${denNgay}T00:00:00Z`);
  if (mocDen < mocTu) return { ok: false, error: "Ngày kết thúc phải sau ngày bắt đầu." };
  const soNgay = Math.round((mocDen - mocTu) / 86400000) + 1;
  if (soNgay > SO_NGAY_QUET_TOI_DA) {
    return { ok: false, error: `Khoảng ngày tối đa là ${SO_NGAY_QUET_TOI_DA} ngày.` };
  }

  let toaSonCung: number | undefined;
  if (b.toaSonCung !== undefined && b.toaSonCung !== null && b.toaSonCung !== "") {
    const n = laSoTrong(b.toaSonCung, 1, 9);
    if (n === null || !CUNG_HOP_LE.has(n)) return { ok: false, error: "Toạ sơn chưa hợp lệ." };
    toaSonCung = n;
  }
  if (viec.canToaSon && toaSonCung === undefined) {
    return {
      ok: false,
      error: `Việc "${viec.nhan}" bắt buộc phải cho biết toạ sơn của công trình/mộ phần.`,
    };
  }

  return {
    ok: true,
    input: { namSinh, thangSinh, ngaySinh, gioSinh, phutSinh, viecId, tuNgay, denNgay, toaSonCung },
  };
}
