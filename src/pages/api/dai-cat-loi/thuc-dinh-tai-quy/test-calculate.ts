import type { APIRoute } from "astro";
import { tinhThucDinhTaiQuy, type ThucDinhTaiQuyInput } from "@thien-anh/trachnhat-engine";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * ⏸️ THỬ NGHIỆM NỘI BỘ — module "Chọn Ngày Thúc Đinh · Tài · Quý" (gói zip chủ dự án cung cấp
 * 3/9/2026). Chưa có thanh toán/đơn hàng — CHỈ tài khoản quản trị được gọi API này để tự kiểm
 * chứng trước khi mở bán. Component `.astro` cũng khóa song song (2 lớp, giống hop-hon).
 */

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const MUC_TIEU_HOP_LE = ["tai", "dinh", "quy", "all"];
const LOAI_TRACH_HOP_LE = ["am", "duong"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function docNgay(v: unknown): { nam: number; thang: number; ngay: number } | null {
  const o = v as Record<string, unknown> | undefined;
  const d = { nam: Number(o?.nam), thang: Number(o?.thang), ngay: Number(o?.ngay) };
  if (!Number.isInteger(d.nam) || !Number.isInteger(d.thang) || !Number.isInteger(d.ngay)) return null;
  return d;
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Module đang thử nghiệm nội bộ — chỉ tài khoản quản trị dùng được." }, 403);
  }

  const limited = checkRateLimit({ request, clientAddress }, { key: "testcalc-thuc-dinh-tai-quy", max: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const sonName = typeof b.sonName === "string" && b.sonName ? b.sonName : undefined;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;
  const mucTieu = b.mucTieu;
  const loaiTrach = b.loaiTrach;

  if (!sonName && toaDoSo === undefined) {
    return jsonResponse({ ok: false, error: "Cần nhập tên sơn hoặc độ số la kinh của tọa." }, 400);
  }
  if (sonName !== undefined && !SON_HOP_LE.includes(sonName)) {
    return jsonResponse({ ok: false, error: "Tên sơn không hợp lệ." }, 400);
  }
  if (toaDoSo !== undefined && (!Number.isFinite(toaDoSo) || toaDoSo < 0 || toaDoSo >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la kinh phải trong khoảng 0-359.99." }, 400);
  }
  if (typeof mucTieu !== "string" || !MUC_TIEU_HOP_LE.includes(mucTieu)) {
    return jsonResponse({ ok: false, error: "Mục tiêu không hợp lệ." }, 400);
  }
  if (typeof loaiTrach !== "string" || !LOAI_TRACH_HOP_LE.includes(loaiTrach)) {
    return jsonResponse({ ok: false, error: "Loại trạch không hợp lệ." }, 400);
  }

  let khoangThoiGian: ThucDinhTaiQuyInput["khoangThoiGian"];
  if (b.tuNgay || b.denNgay) {
    const tuNgay = docNgay(b.tuNgay);
    const denNgay = docNgay(b.denNgay);
    if (!tuNgay || !denNgay) {
      return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." }, 400);
    }
    khoangThoiGian = { tuNgay, denNgay };
  }

  const input: ThucDinhTaiQuyInput = {
    ...(sonName ? { sonName } : {}),
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    mucTieu: mucTieu as ThucDinhTaiQuyInput["mucTieu"],
    loaiTrach: loaiTrach as ThucDinhTaiQuyInput["loaiTrach"],
    ...(khoangThoiGian ? { khoangThoiGian } : {}),
  };

  try {
    const result = tinhThucDinhTaiQuy(input);
    return jsonResponse({ ok: true, result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
