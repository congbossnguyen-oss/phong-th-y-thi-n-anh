import type { APIRoute } from "astro";
import { goiYTen, type GioiTinh } from "@thien-anh/tinhdanh-engine";
import { taoDonCongCu } from "../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

// Giá lấy từ bảng giá phía máy chủ (lib/payments/gia-cong-cu.ts) — không tin số tiền client gửi.
const TOOL_SLUG = "dat-ten-cho-con";

const namNay = new Date().getFullYear();

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Dữ liệu lưu vào đơn (snapshot). Sau khi thanh toán, `result.ts` dựng lại danh sách tên gợi ý từ
 * đúng snapshot này; `danh-gia.ts` dùng lại thông tin sinh của bé + danh sách tên khách tự chọn.
 * Một lần mua 499k mở cả HAI chức năng (gợi ý tên + đánh giá tên có sẵn) cho cùng mã đơn.
 */
export interface DauVaoDatTen {
  ho: string;
  dem: string[];
  gioiTinh: GioiTinh;
  nam: number;
  thang: number;
  ngay: number;
  gio?: number;
  phut?: number;
}

// Không bắt đăng nhập (giống Giờ Liệm): khách nhập tên + SĐT liên hệ, orderCode làm "vé" mở kết quả.
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-dat-ten", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }
  const b = body as Record<string, unknown>;

  const ho = typeof b.ho === "string" ? b.ho.trim() : "";
  if (!ho) return jsonResponse({ ok: false, error: "Vui lòng nhập họ của bé." }, 400);

  const gioiTinh = b.gioiTinh === "nam" || b.gioiTinh === "nu" ? b.gioiTinh : null;
  if (!gioiTinh) return jsonResponse({ ok: false, error: "Vui lòng chọn giới tính của bé." }, 400);

  const nam = Number(b.nam);
  const thang = Number(b.thang);
  const ngay = Number(b.ngay);
  if (
    !Number.isInteger(nam) || nam < 1900 || nam > namNay ||
    !Number.isInteger(thang) || thang < 1 || thang > 12 ||
    !Number.isInteger(ngay) || ngay < 1 || ngay > 31
  ) {
    return jsonResponse({ ok: false, error: "Ngày sinh dương lịch không hợp lệ." }, 400);
  }

  const demRaw = typeof b.dem === "string" ? b.dem.trim() : "";
  const dem = demRaw ? demRaw.split(/\s+/).slice(0, 2) : [];

  const gioNum = Number(b.gio);
  const gio = Number.isInteger(gioNum) && gioNum >= 0 && gioNum <= 23 ? gioNum : undefined;
  const phutNum = Number(b.phut);
  const phut = Number.isInteger(phutNum) && phutNum >= 0 && phutNum <= 59 ? phutNum : undefined;

  // Thông tin liên hệ: ưu tiên tài khoản nếu khách đang đăng nhập (đáng tin hơn), nếu không lấy form.
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập họ tên và số điện thoại liên hệ." }, 400);
  }

  const input: DauVaoDatTen = {
    ho,
    dem,
    gioiTinh: gioiTinh as GioiTinh,
    nam,
    thang,
    ngay,
    ...(gio !== undefined ? { gio } : {}),
    ...(phut !== undefined ? { phut } : {}),
  };

  // "Dry run" — tính thử trước khi tạo đơn, để không thu tiền cho input không tính được.
  try {
    const thu = goiYTen({ ...input, soLuong: 20 });
    if (thu.danhSachTen.length === 0) {
      return jsonResponse(
        { ok: false, error: "Chưa tìm được tên phù hợp trong kho cho trường hợp này — vui lòng liên hệ chuyên gia." },
        400,
      );
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      // Cờ quản trị lấy từ PHIÊN ĐĂNG NHẬP phía máy chủ, không phải từ client.
      laQuanTri: locals.user?.isAdmin === true,
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
