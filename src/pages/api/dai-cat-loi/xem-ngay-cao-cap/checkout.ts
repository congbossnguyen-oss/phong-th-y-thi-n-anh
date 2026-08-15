import type { APIRoute } from "astro";
import { calculateXemNgayCaoCap, type XemNgayCaoCapInput } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";

export const prerender = false;

/**
 * Tạo đơn cho module Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch) — chế độ GIÁM ĐỊNH 1 NGÀY.
 *
 * Module này BẮT ĐĂNG NHẬP (khác module Giờ Liệm – Hạ Huyệt): khách có thời gian, chủ động chọn
 * ngày, nên gắn đơn vào tài khoản để xem lại kết quả về sau là hợp lý.
 *
 * Giá lấy từ bảng giá phía máy chủ; mã khuyến mãi được kiểm và trừ lượt trong taoDonCongCu.
 */

const TOOL_SLUG = "xem-ngay-cao-cap";

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const LOAI_VIEC_HOP_LE = ["dong_tho", "nhap_trach"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập để sử dụng dịch vụ này." }, 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const loaiViec = b.loaiViec;
  const toaNha = b.toaNha;
  const huongNha = typeof b.huongNha === "string" && b.huongNha ? b.huongNha : undefined;
  const namSinhGiaChuChinh = Number(b.namSinhGiaChuChinh);
  const namSinhVoChong = b.namSinhVoChong ? Number(b.namSinhVoChong) : undefined;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (typeof loaiViec !== "string" || !LOAI_VIEC_HOP_LE.includes(loaiViec)) {
    return jsonResponse({ ok: false, error: "Loại việc không hợp lệ." }, 400);
  }
  if (typeof toaNha !== "string" || !SON_HOP_LE.includes(toaNha)) {
    return jsonResponse({ ok: false, error: "Tọa nhà không hợp lệ." }, 400);
  }
  if (huongNha !== undefined && !SON_HOP_LE.includes(huongNha)) {
    return jsonResponse({ ok: false, error: "Hướng nhà không hợp lệ." }, 400);
  }
  if (!Number.isInteger(namSinhGiaChuChinh) || namSinhGiaChuChinh < 1900 || namSinhGiaChuChinh > 2100) {
    return jsonResponse({ ok: false, error: "Năm sinh gia chủ không hợp lệ (1900-2100)." }, 400);
  }
  if (namSinhVoChong !== undefined && (!Number.isInteger(namSinhVoChong) || namSinhVoChong < 1900 || namSinhVoChong > 2100)) {
    return jsonResponse({ ok: false, error: "Năm sinh vợ/chồng không hợp lệ (1900-2100)." }, 400);
  }
  if (toaDoSo !== undefined && (!Number.isFinite(toaDoSo) || toaDoSo < 0 || toaDoSo >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la bàn phải trong khoảng 0-359.99." }, 400);
  }
  if (!customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập số điện thoại liên hệ." }, 400);
  }

  const ng = b.ngayGiamDinh as Record<string, unknown> | undefined;
  const ngayGiamDinh = { nam: Number(ng?.nam), thang: Number(ng?.thang), ngay: Number(ng?.ngay) };
  if (!Number.isInteger(ngayGiamDinh.nam) || !Number.isInteger(ngayGiamDinh.thang) || !Number.isInteger(ngayGiamDinh.ngay)) {
    return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày cần giám định." }, 400);
  }

  const input: XemNgayCaoCapInput = {
    loaiViec: loaiViec as XemNgayCaoCapInput["loaiViec"],
    toaNha: toaNha as XemNgayCaoCapInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(huongNha ? { huongNha: huongNha as XemNgayCaoCapInput["toaNha"] } : {}),
    namSinhGiaChuChinh,
    ...(namSinhVoChong !== undefined ? { namSinhVoChong } : {}),
    ngayGiamDinh,
  };

  // "Dry run" — tính thử trước khi tạo đơn, để không thu tiền cho input không tính được.
  try {
    calculateXemNgayCaoCap(input);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      toolInput: input,
      userId: locals.user.id,
      customerName: locals.user.name,
      customerPhone,
      customerEmail: locals.user.email,
      maKhuyenMai: typeof b.maKhuyenMai === "string" ? b.maKhuyenMai : "",
    });
    return jsonResponse(kq, kq.ok ? 200 : 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
