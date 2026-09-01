// Bản ĐỘC LẬP cho app Quân Sư của "Hợp Hôn Bát Tự × Tử Vi" (anh Công chốt 1/9/2026: Quân Sư không
// đấu nối code với web nữa, kể cả module đã dùng chung trước đó). File này CỐ Ý gần như y hệt
// `src/pages/api/dai-cat-loi/hop-hon/checkout.ts` — chấp nhận trùng lặp thay vì import chéo sang
// namespace `dai-cat-loi`. Chỉ khác: `TOOL_SLUG` riêng (hậu tố `-qs`) để tách bạch đơn hàng
// web/app trong thống kê — vẫn dùng CHUNG engine tính toán (`tinhHopHon`) và hạ tầng thanh toán
// (`taoDonCongCu`), vì đó là logic/nghiệp vụ thuần, không phải "web".
import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../../lib/loi-an-toan";
import { tinhHopHon, type NguoiHopHon } from "../../../../../lib/hop-hon";

export const prerender = false;

export const TOOL_SLUG = "hop-hon-qs";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Đọc 1 người từ body. `hour` là TÙY CHỌN — thiếu thì Bát Tự chạy chế độ tương đối, Tử Vi bỏ hẳn. */
function docNguoi(raw: unknown, nhan: string): { ok: true; nguoi: NguoiHopHon } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: `Thiếu thông tin ${nhan}.` };
  const o = raw as Record<string, unknown>;
  const namNay = new Date().getFullYear();

  const nam = Number(o.year);
  const thang = Number(o.month);
  const ngay = Number(o.day);
  if (
    !Number.isInteger(nam) || nam < 1900 || nam > namNay ||
    !Number.isInteger(thang) || thang < 1 || thang > 12 ||
    !Number.isInteger(ngay) || ngay < 1 || ngay > 31
  ) {
    return { ok: false, error: `Ngày sinh dương lịch của ${nhan} không hợp lệ.` };
  }

  const gender = o.gender === "Nam" || o.gender === "Nữ" ? o.gender : null;
  if (!gender) return { ok: false, error: `Vui lòng chọn giới tính của ${nhan}.` };

  const gioNum = Number(o.hour);
  const hour = Number.isInteger(gioNum) && gioNum >= 0 && gioNum <= 23 ? gioNum : undefined;
  const ten = typeof o.ten === "string" ? o.ten.trim().slice(0, 60) : undefined;

  return { ok: true, nguoi: { day: ngay, month: thang, year: nam, gender, ...(hour !== undefined ? { hour } : {}), ...(ten ? { ten } : {}) } };
}

export interface DauVaoHopHon {
  nguoiA: NguoiHopHon;
  nguoiB: NguoiHopHon;
}

/**
 * Tạo đơn Hợp Hôn Bát Tự × Tử Vi (1.000.000đ, xem GIA_CONG_CU) — bản app Quân Sư, toolSlug riêng
 * `hop-hon-qs`. Không bắt đăng nhập — orderCode làm "vé" mở kết quả. Tài khoản QUẢN TRỊ đi luồng 0đ
 * để kiểm thử trọn quy trình.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-hop-hon-qs", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  const b = body as Record<string, unknown>;

  const docA = docNguoi(b.nguoiA, "người thứ nhất");
  if (!docA.ok) return jsonResponse({ ok: false, error: docA.error }, 400);
  const docB = docNguoi(b.nguoiB, "người thứ hai");
  if (!docB.ok) return jsonResponse({ ok: false, error: docB.error }, 400);

  if (docA.nguoi.gender === docB.nguoi.gender) {
    return jsonResponse(
      { ok: false, error: "Phương pháp hợp hôn cổ truyền dựng trên cặp nam – nữ (sao phối ngẫu nam xét Tài, nữ xét Quan). Vui lòng liên hệ chuyên gia để được tư vấn phù hợp." },
      400,
    );
  }

  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ?? (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập họ tên và số điện thoại liên hệ." }, 400);
  }

  // "Dry run" thuần công thức (không AI, không tốn gì) — chặn ngày giờ engine không dựng được TRƯỚC
  // khi thu tiền.
  const input: DauVaoHopHon = { nguoiA: docA.nguoi, nguoiB: docB.nguoi };
  try {
    tinhHopHon(input);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Ngày giờ sinh không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
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
    return jsonResponse({ ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") }, 400);
  }
};
