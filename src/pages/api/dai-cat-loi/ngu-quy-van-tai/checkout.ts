import type { APIRoute } from "astro";
import { tinhNguQuyVanTai, type NguQuyVanTaiInput } from "../../../../lib/ngu-quy-van-tai/engine";
import { vanTuNam } from "../../../../lib/huyen-khong-phi-tinh/engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Ngũ Quỷ Vận Tài (300.000đ). Không bắt tên/SĐT (giống Đẩu Thủ/Thúc Đinh Tài
 * Quý — anh Công 1/9/2026: "đấu nối cho thanh toán là được") — orderCode làm vé lấy kết quả.
 */

const TOOL_SLUG = "ngu-quy-van-tai";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-ngu-quy-van-tai", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }
  const b = body as Record<string, unknown>;

  const capDo = b.capDo;
  const chieuTra = b.chieuTra;
  if (capDo !== "nha" && capDo !== "phong") {
    return jsonResponse({ ok: false, error: "Cấp độ không hợp lệ." }, 400);
  }
  if (chieuTra !== "thuan" && chieuTra !== "nghich") {
    return jsonResponse({ ok: false, error: "Chiều tra không hợp lệ." }, 400);
  }

  const docSo = (v: unknown): number | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const doHuongCua = docSo(b.doHuongCua);
  const doDiemNghich = docSo(b.doDiemNghich);
  const loaiDiemNghich = b.loaiDiemNghich;
  const doHuongNha = docSo(b.doHuongNha);
  let vanNha = docSo(b.vanNha);
  const namNhapTrach = docSo(b.namNhapTrach);
  const vanHienTai = docSo(b.vanHienTai);

  for (const [ten, v] of [["doHuongCua", doHuongCua], ["doDiemNghich", doDiemNghich], ["doHuongNha", doHuongNha], ["vanNha", vanNha], ["namNhapTrach", namNhapTrach], ["vanHienTai", vanHienTai]] as const) {
    if (Number.isNaN(v)) return jsonResponse({ ok: false, error: `Giá trị "${ten}" không hợp lệ.` }, 400);
  }
  if (doHuongCua !== undefined && (doHuongCua < 0 || doHuongCua >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la kinh phải trong khoảng 0-359.99." }, 400);
  }
  if (doDiemNghich !== undefined && (doDiemNghich < 0 || doDiemNghich >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la kinh phải trong khoảng 0-359.99." }, 400);
  }
  if (doHuongNha !== undefined && (doHuongNha < 0 || doHuongNha >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số Hướng Nhà phải trong khoảng 0-359.99." }, 400);
  }

  if (chieuTra === "thuan" && doHuongCua === undefined) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập độ số Hướng Cửa (hoặc hướng nằm ngủ nếu luận cấp phòng)." }, 400);
  }
  if (chieuTra === "nghich") {
    if (doDiemNghich === undefined) {
      return jsonResponse({ ok: false, error: "Vui lòng nhập độ số điểm Long/Thủy có sẵn ngoài thực địa." }, 400);
    }
    if (loaiDiemNghich !== "long" && loaiDiemNghich !== "thuy") {
      return jsonResponse({ ok: false, error: "Vui lòng chọn điểm nhập vào là Giáng Long hay Giáng Thủy." }, 400);
    }
  }
  if (namNhapTrach !== undefined) {
    if (namNhapTrach < 1900 || namNhapTrach > 2100) {
      return jsonResponse({ ok: false, error: "Năm nhập trạch phải trong khoảng 1900-2100." }, 400);
    }
    vanNha = vanTuNam(namNhapTrach);
  }
  if (vanNha !== undefined && (!Number.isInteger(vanNha) || vanNha < 1 || vanNha > 9)) {
    return jsonResponse({ ok: false, error: "Vận Nhà phải là số nguyên 1-9." }, 400);
  }
  if (vanHienTai !== undefined && (!Number.isInteger(vanHienTai) || vanHienTai < 1 || vanHienTai > 9)) {
    return jsonResponse({ ok: false, error: "Vận Hiện Tại phải là số nguyên 1-9." }, 400);
  }

  const snapshot: NguQuyVanTaiInput = {
    capDo: capDo as NguQuyVanTaiInput["capDo"],
    chieuTra: chieuTra as NguQuyVanTaiInput["chieuTra"],
    ...(doHuongCua !== undefined ? { doHuongCua } : {}),
    ...(doDiemNghich !== undefined ? { doDiemNghich } : {}),
    ...(loaiDiemNghich ? { loaiDiemNghich: loaiDiemNghich as NguQuyVanTaiInput["loaiDiemNghich"] } : {}),
    ...(doHuongNha !== undefined ? { doHuongNha } : {}),
    ...(vanNha !== undefined ? { vanNha } : {}),
    ...(vanHienTai !== undefined ? { vanHienTai } : {}),
  };

  try {
    tinhNguQuyVanTai(snapshot);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  const customerPhone = (typeof b.customerPhone === "string" ? b.customerPhone.trim() : "") || "Không cung cấp";
  const customerName =
    locals.user?.name ?? ((typeof b.customerName === "string" ? b.customerName.trim() : "") || "Khách Ngũ Quỷ Vận Tài");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);

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
