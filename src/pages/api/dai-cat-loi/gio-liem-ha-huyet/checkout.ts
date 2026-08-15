import type { APIRoute } from "astro";
import { calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { Astronomy, type Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const prerender = false;

// Giá lấy từ bảng giá phía máy chủ (lib/payments/gia-cong-cu.ts) — không tin số tiền client gửi.
const TOOL_SLUG = "gio-liem-ha-huyet";

const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const GIOI_TINH_HOP_LE = ["nam", "nu"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function parseChiOptional(value: unknown): Chi | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  if (!CHI_HOP_LE.includes(value)) throw new Error("Giá trị Chi không hợp lệ.");
  return value as Chi;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // ⚠️ Module này CỐ Ý KHÔNG bắt đăng nhập (quyết định của Công): khách dùng ngay lúc gia đình
  // vừa có tang, thường nửa đêm và đang rối — bắt tạo tài khoản lúc đó là rào cản sai chỗ.
  // Kết quả truy cập bằng orderCode làm "vé". Khác với Xem Ngày Cao Cấp (có bắt đăng nhập).

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const gioiTinh = b.gioiTinh;
  const namSinhDuongLich = Number(b.namSinhDuongLich);
  const namMat = Number(b.namMat);
  const thangMat = Number(b.thangMat);
  const ngayMat = Number(b.ngayMat);
  const chiGioMat = b.chiGioMat;
  // Không bắt đăng nhập nên thông tin liên hệ lấy từ form. Nếu khách TÌNH CỜ đang đăng nhập thì
  // ưu tiên tên/email của tài khoản (đáng tin hơn) và gắn đơn vào tài khoản đó.
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (typeof gioiTinh !== "string" || !GIOI_TINH_HOP_LE.includes(gioiTinh)) {
    return jsonResponse({ ok: false, error: "gioiTinh không hợp lệ." }, 400);
  }
  if (typeof chiGioMat !== "string" || !CHI_HOP_LE.includes(chiGioMat)) {
    return jsonResponse({ ok: false, error: "Giờ mất không hợp lệ." }, 400);
  }
  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ." }, 400);
  }

  // Ngày giờ mất không được ở tương lai — quy tắc nghiệp vụ (không thuộc engine thuần, vì engine
  // không phụ thuộc "giờ hiện tại" để giữ tính xác định/dễ test).
  const jdnMat = Astronomy.julianDayNumber(namMat, thangMat, ngayMat);
  const homNay = new Date();
  const jdnHomNay = Astronomy.julianDayNumber(homNay.getFullYear(), homNay.getMonth() + 1, homNay.getDate());
  if (Number.isFinite(jdnMat) && jdnMat > jdnHomNay) {
    return jsonResponse({ ok: false, error: "Ngày giờ mất không được ở tương lai." }, 400);
  }

  let thanQuyen: GioLiemHaHuyetInput["thanQuyen"];
  try {
    const tq = (b.thanQuyen ?? {}) as Record<string, unknown>;
    const chiTruongNam = parseChiOptional(tq.chiTruongNam);
    const chiConDauLon = parseChiOptional(tq.chiConDauLon);
    const chiChauDichTon = parseChiOptional(tq.chiChauDichTon);
    const chiAnhTraiLon = parseChiOptional(tq.chiAnhTraiLon);
    if (chiTruongNam || chiConDauLon || chiChauDichTon || chiAnhTraiLon) {
      thanQuyen = {
        ...(chiTruongNam ? { chiTruongNam } : {}),
        ...(chiConDauLon ? { chiConDauLon } : {}),
        ...(chiChauDichTon ? { chiChauDichTon } : {}),
        ...(chiAnhTraiLon ? { chiAnhTraiLon } : {}),
      };
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu thân quyến không hợp lệ." }, 400);
  }

  const input: GioLiemHaHuyetInput = {
    gioiTinh: gioiTinh as GioLiemHaHuyetInput["gioiTinh"],
    namSinhDuongLich,
    namMat,
    thangMat,
    ngayMat,
    chiGioMat: chiGioMat as GioLiemHaHuyetInput["chiGioMat"],
    ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
    ...(thanQuyen ? { thanQuyen } : {}),
    // Quãng đường nhà → huyệt, dùng để trừ lùi ra giờ động quan (bước 6b). Bỏ trống thì không
    // tính giờ động quan — engine tự validate khoảng 5-480 phút ở "dry run" bên dưới.
    ...(b.thoiGianDiChuyenPhut ? { thoiGianDiChuyenPhut: Number(b.thoiGianDiChuyenPhut) } : {}),
  };

  // "Dry run" — tính thử trước khi tạo đơn, để không thu tiền cho input không tính được.
  let dryRun: ReturnType<typeof calculateGioLiemHaHuyet>;
  try {
    dryRun = calculateGioLiemHaHuyet(input);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }
  if (dryRun.duoi10Tuoi) {
    return jsonResponse({ ok: false, error: "Người mất dưới 10 tuổi — không tính theo phương pháp này." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      toolInput: input,
      userId: locals.user?.id ?? null,
      customerName,
      customerPhone,
      customerEmail,
      maKhuyenMai: typeof b.maKhuyenMai === "string" ? b.maKhuyenMai : "",
    });
    return jsonResponse(kq, kq.ok ? 200 : 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
