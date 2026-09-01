// API riêng cho app Quân Sư — bản độc lập của /api/luan-so-dien-thoai (tách khỏi web 1/9/2026, xem
// project_quan_su_tach_doc_lap_khoi_web.md). Chỉ dùng chung engine tính toán, không dùng chung route.
// Rate-limit key đổi sang "luan-so-ngay-qs" để không dùng chung hạn mức 3 số/ngày với bản web.
import type { APIRoute } from "astro";
import {
  LoiCccd,
  LoiSoDienThoai,
  luanSoDienThoai,
  NHOM_NGHE,
  type MucDich,
  type GioiTinh,
} from "@thien-anh/phone-energy-engine";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

/** Chống lạm dụng/spam: mỗi thiết bị (IP) chỉ luận tối đa 3 số/ngày (yêu cầu chủ dự án 2026-08-19). */
const MOI_NGAY_TOI_DA = 3;
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;

const MUC_DICH_HOP_LE: readonly MucDich[] = [
  "tổng quát",
  "tài lộc",
  "hôn nhân",
  "sự nghiệp",
  "sức khỏe",
  "học hành",
];

const GIOI_TINH_HOP_LE: readonly GioiTinh[] = ["nam", "nữ"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Công cụ MIỄN PHÍ, không cần đăng nhập, không tạo đơn — chỉ tính rồi trả kết quả.
 *
 * Dùng POST + JSON thay vì GET query string vì số điện thoại và căn cước là thông tin cá nhân,
 * không nên nằm trên thanh địa chỉ hay trong log truy cập. Cũng khớp quy ước chung của dự án: form
 * gửi bằng fetch/JSON để không dính chặn CSRF trong trình duyệt trong ứng dụng Zalo/Facebook.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const soDienThoai = typeof body.soDienThoai === "string" ? body.soDienThoai.trim() : "";
  if (!soDienThoai) {
    return jsonResponse({ error: "Vui lòng nhập số điện thoại cần luận." }, 400);
  }

  // Hạn mức 3 số/ngày/thiết bị — đặt SAU khi đã có số điện thoại hợp lệ để không tính oan các lần
  // bấm nhầm thiếu số. Vượt hạn mức trả 429 kèm thông báo rõ ràng cho khách.
  const limited = checkRateLimit(
    { request, clientAddress },
    {
      key: "luan-so-ngay-qs",
      max: MOI_NGAY_TOI_DA,
      windowMs: MOT_NGAY_MS,
      message:
        "Mỗi ngày mỗi thiết bị chỉ luận tối đa 3 số điện thoại (để tránh lạm dụng). Vui lòng quay lại vào ngày mai, " +
        "hoặc liên hệ hotline để được chuyên gia tư vấn trực tiếp.",
    },
  );
  if (limited) return limited;

  const cccdRaw = typeof body.cccd === "string" ? body.cccd.trim() : "";
  const namNay = new Date().getFullYear();
  const namSinh =
    typeof body.namSinh === "number" && Number.isInteger(body.namSinh)
      ? body.namSinh
      : undefined;
  // Năm sinh phi lý thì bỏ qua chứ không báo lỗi — nó là trường tuỳ chọn, chặn cả yêu cầu vì một ô
  // phụ nhập sai là làm khó khách.
  const namSinhHopLe = namSinh && namSinh >= 1900 && namSinh <= namNay ? namSinh : undefined;
  const gioiTinhRaw = typeof body.gioiTinh === "string" ? body.gioiTinh : "";
  const mucDichRaw = typeof body.mucDich === "string" ? body.mucDich : "";

  const gioiTinh = GIOI_TINH_HOP_LE.includes(gioiTinhRaw as GioiTinh)
    ? (gioiTinhRaw as GioiTinh)
    : undefined;
  const mucDich = MUC_DICH_HOP_LE.includes(mucDichRaw as MucDich)
    ? (mucDichRaw as MucDich)
    : undefined;

  // Nghề nghiệp là trường tuỳ chọn, chỉ nhận đúng mã có trong bảng nhóm nghề của engine. Mã lạ thì
  // bỏ qua để engine khỏi phải đoán khách làm gì.
  const ngheRaw = typeof body.ngheNghiep === "string" ? body.ngheNghiep : "";
  const ngheNghiep = NHOM_NGHE.some((n) => n.ma === ngheRaw) ? ngheRaw : undefined;

  try {
    const ketQua = luanSoDienThoai({
      soDienThoai,
      ...(cccdRaw ? { cccd: cccdRaw } : {}),
      ...(gioiTinh ? { gioiTinh } : {}),
      ...(mucDich ? { mucDich } : {}),
      ...(namSinhHopLe ? { namSinh: namSinhHopLe } : {}),
      ...(ngheNghiep ? { ngheNghiep } : {}),
    });
    return jsonResponse({ ok: true, ketQua }, 200);
  } catch (err) {
    // Lỗi đầu vào thì nói rõ cho khách sửa; lỗi khác mới coi là lỗi hệ thống.
    if (err instanceof LoiSoDienThoai || err instanceof LoiCccd) {
      return jsonResponse({ error: err.message }, 400);
    }
    console.error("[luan-so-dien-thoai] Lỗi khi luận:", err);
    return jsonResponse({ error: "Có lỗi khi luận số. Vui lòng thử lại." }, 500);
  }
};
