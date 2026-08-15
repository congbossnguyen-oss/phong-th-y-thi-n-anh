import type { APIRoute } from "astro";
import { calculateXemNgayCaoCap, type XemNgayCaoCapInput } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";

export const prerender = false;

/**
 * Tạo đơn cho module Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch).
 *
 * MỘT GIÁ cho cả 3 chế độ (quyết định của Công): giám định 1 ngày, tìm ngày trong khoảng, tìm
 * tháng trong năm — khách trả tiền để lấy KẾT QUẢ CUỐI CÙNG, không tính theo khối lượng máy chạy.
 *
 * Module này BẮT ĐĂNG NHẬP (khác module Giờ Liệm – Hạ Huyệt): khách chủ động chọn ngày, không gấp,
 * nên gắn đơn vào tài khoản để xem lại kết quả về sau là hợp lý.
 */

const TOOL_SLUG = "xem-ngay-cao-cap";

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const LOAI_VIEC_HOP_LE = ["dong_tho", "nhap_trach"];
const CHE_DO_HOP_LE = ["giam_dinh", "tim_ngay", "tim_thang"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function docNgay(v: unknown): { nam: number; thang: number; ngay: number } | null {
  const o = v as Record<string, unknown> | undefined;
  const d = { nam: Number(o?.nam), thang: Number(o?.thang), ngay: Number(o?.ngay) };
  if (!Number.isInteger(d.nam) || !Number.isInteger(d.thang) || !Number.isInteger(d.ngay)) return null;
  return d;
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
  const cheDo = b.cheDo;
  const loaiViec = b.loaiViec;
  const toaNha = b.toaNha;
  const huongNha = typeof b.huongNha === "string" && b.huongNha ? b.huongNha : undefined;
  const namSinhGiaChuChinh = Number(b.namSinhGiaChuChinh);
  const namSinhVoChong = b.namSinhVoChong ? Number(b.namSinhVoChong) : undefined;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (typeof cheDo !== "string" || !CHE_DO_HOP_LE.includes(cheDo)) {
    return jsonResponse({ ok: false, error: "Chế độ không hợp lệ." }, 400);
  }
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

  const chung = {
    loaiViec: loaiViec as XemNgayCaoCapInput["loaiViec"],
    toaNha: toaNha as XemNgayCaoCapInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(huongNha ? { huongNha: huongNha as XemNgayCaoCapInput["toaNha"] } : {}),
    namSinhGiaChuChinh,
    ...(namSinhVoChong !== undefined ? { namSinhVoChong } : {}),
  };

  // `snapshot` là thứ được lưu vào đơn; sau khi thanh toán, result.ts tính lại kết quả từ đây.
  let snapshot: Record<string, unknown>;
  // Ngày dùng để "tính thử" xem bộ input có chạy được không (xem giải thích bên dưới).
  let ngayThu: { nam: number; thang: number; ngay: number };

  if (cheDo === "giam_dinh") {
    const ngay = docNgay(b.ngayGiamDinh);
    if (!ngay) return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày cần giám định." }, 400);
    snapshot = { cheDo, ...chung, ngayGiamDinh: ngay };
    ngayThu = ngay;
  } else if (cheDo === "tim_thang") {
    const namDuongLich = Number(b.namDuongLich);
    if (!Number.isInteger(namDuongLich) || namDuongLich < 1968 || namDuongLich > 2068) {
      return jsonResponse({ ok: false, error: "Năm cần tìm phải trong khoảng 1968-2068 (phạm vi bảng Cửu Cung)." }, 400);
    }
    snapshot = { cheDo, ...chung, namDuongLich };
    ngayThu = { nam: namDuongLich, thang: 1, ngay: 15 };
  } else {
    const tuNgay = docNgay(b.tuNgay);
    const denNgay = docNgay(b.denNgay);
    if (!tuNgay || !denNgay) {
      return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." }, 400);
    }
    snapshot = { cheDo, ...chung, tuNgay, denNgay };
    ngayThu = tuNgay;
  }

  // "Tính thử" để không thu tiền cho bộ input không chạy được.
  //
  // CHỈ tính thử ĐÚNG 1 NGÀY, kể cả với 2 chế độ tìm kiếm: quét cả năm mất 20-30 giây, chạy thêm
  // một lượt nữa chỉ để kiểm tra là lãng phí gấp đôi và bắt khách chờ vô ích. Mọi lỗi đầu vào
  // (tọa/độ số/năm sinh/ngoài phạm vi bảng Cửu Cung) đều lộ ra ngay ở 1 ngày duy nhất này.
  try {
    calculateXemNgayCaoCap({ ...chung, ngayGiamDinh: ngayThu });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      toolInput: snapshot,
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
