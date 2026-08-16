import type { APIRoute } from "astro";
import {
  calculateGioLiemHaHuyet,
  kiemToaHuongTruocThanhToan,
  type GioLiemHaHuyetInput,
} from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { giaGioLiemHaHuyet } from "../../../../lib/payments/gia-cong-cu";
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

  // Phần bổ sung của Phase 2 — phải lưu cùng snapshot, nếu không email gửi sau thanh toán sẽ
  // dựng ra hồ sơ THIẾU mục tọa hướng mà khách đã trả tiền cho nó.
  const doSoToa = b.doSoToa === undefined || b.doSoToa === "" ? undefined : Number(b.doSoToa);
  if (doSoToa !== undefined && !Number.isFinite(doSoToa)) {
    return jsonResponse({ ok: false, error: "Tọa độ huyệt mộ không hợp lệ." }, 400);
  }

  const input: GioLiemHaHuyetInput & {
    hoTenNguoiMat?: string;
    nguyenNhanMat?: "benh-tuoi-gia" | "tai-nan-dot-ngot";
    doSoToa?: number;
  } = {
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
    ...(typeof b.hoTenNguoiMat === "string" && b.hoTenNguoiMat.trim() ? { hoTenNguoiMat: b.hoTenNguoiMat.trim().slice(0, 80) } : {}),
    ...(b.nguyenNhanMat === "tai-nan-dot-ngot" ? { nguyenNhanMat: "tai-nan-dot-ngot" as const } : {}),
    ...(doSoToa !== undefined ? { doSoToa } : {}),
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

  // ⚠️ CHẶN KẾT CỤC C Ở MÁY CHỦ, TRƯỚC KHI TẠO ĐƠN.
  //
  // Trang web đã gọi `kiem-toa-huong` trước khi nộp form, nhưng đó chỉ là hàng rào phía trình
  // duyệt: gọi thẳng endpoint này vẫn tạo được đơn và thu tiền cho một ca mà không ngày giờ nào
  // cứu được. Quy tắc "phạm sát cấp năm thì KHÔNG THU PHÍ" là cam kết nghiệp vụ, nên phải được
  // giữ ở nơi khách không sửa được.
  if (doSoToa !== undefined) {
    const cong = kiemToaHuongTruocThanhToan({ doSoToa, namMat, thangMat, ngayMat });
    if (cong.ketCuc === "can-do-lai") {
      return jsonResponse({ ok: false, error: cong.thongDiep }, 400);
    }
    if (cong.ketCuc === "C") {
      // 409 để tầng gọi phân biệt được với lỗi nhập liệu thường: đây không phải nhập sai, mà là
      // trường hợp chúng tôi chủ động không nhận phí.
      return jsonResponse({ ok: false, chuaThuPhi: true, error: cong.thongDiep }, 409);
    }
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      // Cờ lấy từ PHIÊN ĐĂNG NHẬP phía máy chủ, không phải từ dữ liệu client gửi lên.
      laQuanTri: locals.user?.isAdmin === true,
      // Bậc giá suy từ CHÍNH tọa độ đã kiểm ở trên, không lấy từ client. Khách khai gói nào
      // không quan trọng — có tọa mộ thì mới chạy Phase 2, và đúng lúc đó mới tính giá đầy đủ.
      soTienGocGhiDe: giaGioLiemHaHuyet(doSoToa !== undefined),
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
