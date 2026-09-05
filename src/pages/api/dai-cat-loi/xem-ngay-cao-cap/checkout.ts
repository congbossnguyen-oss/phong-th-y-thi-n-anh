import type { APIRoute } from "astro";
import {
  calculateXemNgayCaoCap,
  timNgayXemNgayCaoCap,
  timThangTrongNam,
  type XemNgayCaoCapInput,
} from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch).
 *
 * MỘT GIÁ cho cả 3 chế độ (quyết định của Công): giám định 1 ngày, tìm ngày trong khoảng, tìm
 * tháng trong năm — khách trả tiền để lấy KẾT QUẢ CUỐI CÙNG, không tính theo khối lượng máy chạy.
 *
 * Module này BẮT ĐĂNG NHẬP (khác module Giờ Liệm – Hạ Huyệt): khách chủ động chọn ngày, không gấp,
 * nên gắn đơn vào tài khoản để xem lại kết quả về sau là hợp lý.
 *
 * ⚠️ CHỐT 5/9/2026 (anh Công phát hiện): 2 chế độ TÌM KIẾM (tìm tháng/tìm ngày trong khoảng) chạy
 * quét THẬT ngay tại đây (miễn phí) và CHỈ tạo đơn thu tiền nếu tìm được ≥1 kết quả — quét ra 0
 * ngày/tháng dùng được thì không thu tiền (khách không mất tiền cho 1 kết quả rỗng). Trước đây chỉ
 * "tính thử" 1 ngày để kiểm tra input hợp lệ, KHÔNG kiểm tra thật xem cả năm/khoảng có ra kết quả
 * không — thu tiền xong khách mới biết 0 kết quả là không công bằng.
 * Chế độ GIÁM ĐỊNH 1 NGÀY giữ nguyên như cũ (thu tiền trước): đánh giá 1 ngày cụ thể luôn ra được
 * kết luận (tốt hoặc xấu), không có khái niệm "0 kết quả" nên không cần đổi.
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

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-xncc", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  // ⚠️ CỐ Ý KHÔNG bắt đăng nhập (chủ dự án chốt 2026-08-16) — giống 2 module thu phí còn lại.
  // Kết quả truy cập bằng orderCode làm "vé".

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
  const apDungLocDanGian = typeof b.apDungLocDanGian === "boolean" ? b.apDungLocDanGian : undefined;
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);

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
  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ." }, 400);
  }

  const chung = {
    loaiViec: loaiViec as XemNgayCaoCapInput["loaiViec"],
    toaNha: toaNha as XemNgayCaoCapInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(huongNha ? { huongNha: huongNha as XemNgayCaoCapInput["toaNha"] } : {}),
    namSinhGiaChuChinh,
    ...(namSinhVoChong !== undefined ? { namSinhVoChong } : {}),
    ...(apDungLocDanGian !== undefined ? { apDungLocDanGian } : {}),
  };

  // `snapshot` là thứ được lưu vào đơn; sau khi thanh toán, result.ts tính lại kết quả từ đây.
  let snapshot: Record<string, unknown>;

  if (cheDo === "giam_dinh") {
    const ngay = docNgay(b.ngayGiamDinh);
    if (!ngay) return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày cần giám định." }, 400);

    // Giám định 1 ngày LUÔN ra được kết luận (tốt hoặc xấu) — không có khái niệm "0 kết quả", nên
    // chỉ cần tính thử để lộ lỗi đầu vào (tọa/độ số/năm sinh/ngoài phạm vi bảng Cửu Cung) trước khi
    // tạo đơn.
    try {
      calculateXemNgayCaoCap({ ...chung, ngayGiamDinh: ngay });
    } catch (err) {
      return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
    }
    snapshot = { cheDo, ...chung, ngayGiamDinh: ngay };
  } else if (cheDo === "tim_thang") {
    const namDuongLich = Number(b.namDuongLich);
    if (!Number.isInteger(namDuongLich) || namDuongLich < 1968 || namDuongLich > 2068) {
      return jsonResponse({ ok: false, error: "Năm cần tìm phải trong khoảng 1968-2068 (phạm vi bảng Cửu Cung)." }, 400);
    }

    // Quét THẬT cả năm ngay tại đây (miễn phí) — chỉ tạo đơn thu tiền nếu có ít nhất 1 tháng tìm
    // được ngày dùng được. Việc quét mất 20-30 giây (đã báo rõ cho khách ở phía giao diện).
    let ketQuaThang: ReturnType<typeof timThangTrongNam>;
    try {
      ketQuaThang = timThangTrongNam({ ...chung, namDuongLich });
    } catch (err) {
      return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
    }
    if (!ketQuaThang.some((t) => t.ngayTotNhat)) {
      return jsonResponse(
        {
          ok: false,
          error: `Không tìm được ngày phù hợp trong cả năm ${namDuongLich} với tọa/hướng và loại việc này — vui lòng thử năm khác hoặc dùng chế độ Giám Định 1 Ngày để xem chi tiết từng ngày.`,
        },
        200,
      );
    }
    snapshot = { cheDo, ...chung, namDuongLich };
  } else {
    const tuNgay = docNgay(b.tuNgay);
    const denNgay = docNgay(b.denNgay);
    if (!tuNgay || !denNgay) {
      return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." }, 400);
    }

    // Cùng nguyên tắc như tim_thang ở trên: quét THẬT cả khoảng trước, chỉ tạo đơn nếu có kết quả.
    let ketQuaNgay: ReturnType<typeof timNgayXemNgayCaoCap>;
    try {
      ketQuaNgay = timNgayXemNgayCaoCap({ ...chung, tuNgay, denNgay, soKetQua: 10 });
    } catch (err) {
      return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
    }
    if (ketQuaNgay.ketQua.length === 0) {
      return jsonResponse(
        {
          ok: false,
          error: "Không tìm được ngày nào phù hợp trong khoảng đã chọn — vui lòng mở rộng khoảng ngày hoặc dùng chế độ Giám Định 1 Ngày để xem chi tiết từng ngày.",
        },
        200,
      );
    }
    snapshot = { cheDo, ...chung, tuNgay, denNgay };
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      // Cờ lấy từ PHIÊN ĐĂNG NHẬP phía máy chủ, không phải từ dữ liệu client gửi lên.
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
