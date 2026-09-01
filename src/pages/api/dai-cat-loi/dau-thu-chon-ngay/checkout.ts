import type { APIRoute } from "astro";
import { tinhDauThuChonNgay, type DauThuChonNgayInput } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Đẩu Thủ Chọn Ngày. Cùng khuôn `xem-ngay-cao-cap/checkout.ts`: MỘT giá cho
 * cả 2 chế độ (giám định 1 ngày / tìm ngày trong khoảng), không bắt đăng nhập (orderCode làm vé).
 */

const TOOL_SLUG = "dau-thu-chon-ngay";

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const LOAI_VIEC_HOP_LE = ["nhap_trach", "dong_tho", "sua_nha", "an_tang", "cai_tang", "khac"];
const CHE_DO_HOP_LE = ["giam_dinh", "tim_ngay"];

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
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-dau-thu", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const cheDo = b.cheDo;
  const toaNha = b.toaNha;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;
  const loaiViec = typeof b.loaiViec === "string" && b.loaiViec ? b.loaiViec : undefined;
  const chiGio = typeof b.chiGio === "string" && b.chiGio ? b.chiGio : undefined;
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);

  if (typeof cheDo !== "string" || !CHE_DO_HOP_LE.includes(cheDo)) {
    return jsonResponse({ ok: false, error: "Chế độ không hợp lệ." }, 400);
  }
  if (typeof toaNha !== "string" || !SON_HOP_LE.includes(toaNha)) {
    return jsonResponse({ ok: false, error: "Tọa (Sơn Đầu) không hợp lệ." }, 400);
  }
  if (toaDoSo !== undefined && (!Number.isFinite(toaDoSo) || toaDoSo < 0 || toaDoSo >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la bàn phải trong khoảng 0-359.99." }, 400);
  }
  if (loaiViec !== undefined && !LOAI_VIEC_HOP_LE.includes(loaiViec)) {
    return jsonResponse({ ok: false, error: "Loại việc không hợp lệ." }, 400);
  }
  if (chiGio !== undefined && !CHI_HOP_LE.includes(chiGio)) {
    return jsonResponse({ ok: false, error: "Chi giờ không hợp lệ." }, 400);
  }
  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ." }, 400);
  }

  const chung = {
    toaNha: toaNha as DauThuChonNgayInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(loaiViec ? { loaiViec: loaiViec as DauThuChonNgayInput["loaiViec"] } : {}),
    ...(chiGio ? { chiGio: chiGio as DauThuChonNgayInput["chiGio"] } : {}),
  };

  let snapshot: Record<string, unknown>;
  let ngayThu: { nam: number; thang: number; ngay: number };

  if (cheDo === "giam_dinh") {
    const ngay = docNgay(b.ngayGiamDinh);
    if (!ngay) return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày cần giám định." }, 400);
    snapshot = { cheDo, ...chung, ngayGiamDinh: ngay };
    ngayThu = ngay;
  } else {
    const tuNgay = docNgay(b.tuNgay);
    const denNgay = docNgay(b.denNgay);
    if (!tuNgay || !denNgay) {
      return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." }, 400);
    }
    snapshot = { cheDo, ...chung, tuNgay, denNgay };
    ngayThu = tuNgay;
  }

  // "Tính thử" đúng 1 ngày để không thu tiền cho input không chạy được (giống xem-ngay-cao-cap).
  try {
    tinhDauThuChonNgay({ ...chung, ngayGiamDinh: ngayThu });
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
