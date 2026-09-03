// Bản ĐỘC LẬP cho app Quân Sư của "Chọn Ngày Thúc Đinh · Tài · Quý" (anh Công chốt 1/9/2026: Quân
// Sư không đấu nối code với web nữa). CỐ Ý gần như y hệt
// `src/pages/api/dai-cat-loi/thuc-dinh-tai-quy/checkout.ts` — chấp nhận trùng lặp thay vì import
// chéo sang namespace `dai-cat-loi`. Thêm 4/9/2026 (bỏ sót lúc mở bán bản web 3/9 — khiến khách
// bấm vào module này trong app bị văng về trang chủ).
import type { APIRoute } from "astro";
import { tinhThucDinhTaiQuy, type ThucDinhTaiQuyInput } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../../lib/loi-an-toan";

export const prerender = false;

const TOOL_SLUG = "thuc-dinh-tai-quy-qs";

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
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-thuc-dinh-tai-quy-qs", max: 10, windowMs: 60_000 });
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
  const customerPhone = (typeof b.customerPhone === "string" ? b.customerPhone.trim() : "") || "Không cung cấp";
  const customerName =
    locals.user?.name ?? ((typeof b.customerName === "string" ? b.customerName.trim() : "") || "Khách Thúc Đinh Tài Quý");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);

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

  const snapshot: ThucDinhTaiQuyInput = {
    ...(sonName ? { sonName } : {}),
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    mucTieu: mucTieu as ThucDinhTaiQuyInput["mucTieu"],
    loaiTrach: loaiTrach as ThucDinhTaiQuyInput["loaiTrach"],
    ...(khoangThoiGian ? { khoangThoiGian } : {}),
  };

  try {
    tinhThucDinhTaiQuy(snapshot);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      laQuanTri: locals.user?.isAdmin === true,
      toolInput: snapshot,
      userId: locals.user?.id ?? null,
      customerName,
      customerPhone,
      customerEmail,
      maKhuyenMai: typeof b.maKhuyenMai === "string" ? b.maKhuyenMai : "",
    });
    return jsonResponse(kq, kq.ok ? 200 : 400);
  } catch (err) {
    return jsonResponse(
      { ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") },
      400,
    );
  }
};
