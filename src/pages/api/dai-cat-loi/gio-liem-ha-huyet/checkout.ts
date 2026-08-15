import type { APIRoute } from "astro";
import { calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { createToolOrder } from "../../../../lib/db/orders";
import { getSepayQrUrl } from "../../../../lib/payments/sepay";
import { Astronomy, type Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const prerender = false;

const TOOL_SLUG = "gio-liem-ha-huyet";
// Giá cố định phía server — không bao giờ tin số tiền client gửi lên (cùng nguyên tắc với đơn vật phẩm).
const TOOL_PRICE = 499000;

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
  // Dịch vụ thu phí: bắt buộc đăng nhập. Đây là chốt chặn THẬT (trang .astro chỉ ẩn form cho đẹp).
  if (!locals.user) {
    return new Response(
      JSON.stringify({ ok: false, error: "Vui lòng đăng nhập để sử dụng dịch vụ này." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

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
  // Họ tên + email lấy từ TÀI KHOẢN, không nhận từ client — client sửa được thì đối soát vô nghĩa.
  // Riêng số điện thoại vẫn nhận từ form vì tài khoản có thể chưa có (cột phone cho phép null),
  // và khách hay muốn để số khác số đăng ký — giống luồng thanh toán khóa học.
  const customerName = locals.user.name;
  const customerEmail = locals.user.email;
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (typeof gioiTinh !== "string" || !GIOI_TINH_HOP_LE.includes(gioiTinh)) {
    return jsonResponse({ ok: false, error: "gioiTinh không hợp lệ." }, 400);
  }
  if (typeof chiGioMat !== "string" || !CHI_HOP_LE.includes(chiGioMat)) {
    return jsonResponse({ ok: false, error: "Giờ mất không hợp lệ." }, 400);
  }
  if (!customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập số điện thoại liên hệ." }, 400);
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
    const { orderId, orderCode, totalAmount } = await createToolOrder({
      toolSlug: TOOL_SLUG,
      toolInput: input,
      userId: locals.user.id,
      customerName,
      customerPhone,
      customerEmail,
      totalAmount: TOOL_PRICE,
    });

    const qrUrl = getSepayQrUrl({ amount: totalAmount, orderCode });
    return jsonResponse({ ok: true, orderId, orderCode, totalAmount, qrUrl }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
