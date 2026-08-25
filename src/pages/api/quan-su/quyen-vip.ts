import type { APIRoute } from "astro";
import { coQuyenTruyCap } from "../../../lib/subscriptions/access";
import { daTungDungThu } from "../../../lib/subscriptions/trial";

export const prerender = false;

/**
 * Trạng thái quyền dùng dịch vụ VIP của người đang đăng nhập — cho banner client-side trên các trang
 * dịch vụ VIP quyết định hiển thị: "miễn phí theo gói" / "dùng thử" / "nâng gói" / "đăng nhập".
 * Chỉ trả cờ boolean, không lộ chi tiết gói.
 */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user ?? null;
  const dangNhap = !!user;

  let coQuyenCaoCap = false;
  let daThu = false;
  if (user) {
    coQuyenCaoCap = await coQuyenTruyCap(user.id, "cao_cap", user.isAdmin === true);
    daThu = await daTungDungThu(user.id);
  }

  // Trial hiện đang admin-only ("giai đoạn thử nghiệm nội bộ" — xem api/.../dung-thu.ts). Cờ này phản
  // ánh đúng điều kiện được kích hoạt trial ngay lúc này; khi mở bán cho khách, nới điều kiện ở đây.
  const coTheDungThu = dangNhap && !coQuyenCaoCap && !daThu && user!.isAdmin === true;

  return new Response(JSON.stringify({ dangNhap, coQuyenCaoCap, daTungDungThu: daThu, coTheDungThu }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
