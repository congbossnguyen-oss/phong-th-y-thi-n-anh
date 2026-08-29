import type { APIRoute } from "astro";
import { coQuyenTruyCap } from "../../../lib/subscriptions/access";

export const prerender = false;

/**
 * Trạng thái quyền dùng dịch vụ VIP của người đang đăng nhập — cho banner client-side trên các trang
 * dịch vụ VIP quyết định hiển thị: "miễn phí theo gói" / "nâng gói" / "đăng nhập". Chỉ trả cờ boolean,
 * không lộ chi tiết gói.
 *
 * KHÔNG còn nhánh "dùng thử" — anh Công quyết định bỏ hẳn (29/8/2026, vì các công cụ miễn phí sẵn có
 * đã đủ làm phễu), sau khi endpoint kích hoạt (`dung-thu.ts`) đã bị khóa vĩnh viễn từ 27/8/2026.
 */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user ?? null;
  const dangNhap = !!user;

  const coQuyenCaoCap = user ? await coQuyenTruyCap(user.id, "cao_cap", user.isAdmin === true) : false;

  return new Response(JSON.stringify({ dangNhap, coQuyenCaoCap }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
