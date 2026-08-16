import type { APIRoute } from "astro";
import { kiemToaHuongTruocThanhToan } from "@thien-anh/trachnhat-engine";

export const prerender = false;

/**
 * CỔNG KIỂM TỌA HƯỚNG — GỌI TRƯỚC KHI TẠO ĐƠN HÀNG.
 *
 * Đặc tả Phase 2 mục 2.1b: nếu tọa huyệt phạm sát ở cấp NĂM thì không ngày giờ nào cứu được, nên
 * phải phát hiện TRƯỚC trang thanh toán. Thu 999k rồi mới báo không làm được là điều chủ dự án
 * cấm — với gia đình đang tang gia, trải nghiệm hoàn tiền rất xấu.
 *
 * Endpoint này CỐ Ý tách khỏi `checkout.ts`: nó không tạo đơn, không đụng DB, không sinh QR. Tầng
 * giao diện phải gọi endpoint này và chỉ mở nút thanh toán khi nhận được `duocPhepThuPhi: true`.
 */

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const doSoToa = Number(b.doSoToa);
  const namMat = Number(b.namMat);
  const thangMat = Number(b.thangMat);
  const ngayMat = Number(b.ngayMat);

  if (!Number.isFinite(doSoToa)) {
    return jsonResponse({ ok: false, error: "Cần nhập tọa độ huyệt mộ đo bằng la kinh (0-360°)." }, 400);
  }
  if (!Number.isFinite(namMat) || !Number.isFinite(thangMat) || !Number.isFinite(ngayMat)) {
    return jsonResponse({ ok: false, error: "Ngày mất không hợp lệ." }, 400);
  }

  try {
    const ketQua = kiemToaHuongTruocThanhToan({ doSoToa, namMat, thangMat, ngayMat });
    // Trả nguyên trạng thái engine, kể cả cờ `duocPhepThuPhi` — tầng giao diện không được tự suy.
    return jsonResponse({ ok: true, ketQua }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không kiểm được." }, 400);
  }
};
