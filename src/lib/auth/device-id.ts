// Định danh thiết bị bền cho việc chống lạm dụng dùng thử (mức "Vừa"). Lưu 1 UUID ngẫu nhiên trong
// cookie httpOnly (~400 ngày). KHÔNG phải fingerprint sinh trắc — chỉ là 1 mã ngẫu nhiên gắn với
// trình duyệt, giúp nhận ra "cùng một máy" giữa các lần đăng ký tài khoản khác nhau. Khách xóa cookie
// / ẩn danh / đổi trình duyệt vẫn lách được — đây là rào cản vừa phải, không phải bảo mật tuyệt đối.
import type { APIContext } from "astro";
import { randomUUID } from "node:crypto";

const COOKIE = "tt_device";
const MAX_AGE = 60 * 60 * 24 * 400; // ~400 ngày

/**
 * Lấy device id từ cookie; nếu chưa có thì tạo mới và set cookie (httpOnly). Trả về id để dùng cho
 * kiểm tra/ghi log trial. Chỉ set cookie khi CHƯA có, không ghi đè để giữ định danh ổn định.
 */
export function layHoacTaoDeviceId(context: Pick<APIContext, "cookies">): string {
  const existing = context.cookies.get(COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  context.cookies.set(COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}
