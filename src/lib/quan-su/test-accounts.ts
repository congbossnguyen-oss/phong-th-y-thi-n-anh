/**
 * Danh sách email tài khoản TEST cho app Quân Sư (anh Công 31/8/2026: "10 tài khoản test cho anh
 * đưa mọi người test được không, mỗi tài khoản chỉ được phép luận giải 10 lần kinh dịch thôi, còn
 * các dịch vụ không phải gọi AI thì dùng thoải mái").
 *
 * KHÁC isAdmin: tài khoản test KHÔNG có toàn quyền — chỉ được:
 *   1. Đi qua cổng khóa "chỉ admin" của /quan-su/* ở middleware.ts (xem TÀI KHOẢN TEST bên dưới).
 *   2. Bỏ qua yêu cầu có gói thuê bao (coQuyenTruyCap) khi gọi /api/quan-su/luan.ts — nhưng bị chặn
 *      cứng ở TONG_LUOT_TOI_DA (10, tính TỔNG suốt đời, KHÔNG reset theo tháng như gói trả tiền —
 *      xem tongLuotDaDung() trong usage.ts) — cố tình KHÔNG dùng chung cờ isTrial/HAN_MUC_LUOT_DUNG_THU
 *      sẵn có vì đó là hạn mức/tháng dùng chung cho toàn bộ tính năng dùng thử thật, đổi số ở đó sẽ
 *      ảnh hưởng khách dùng thử thật ngoài ý muốn.
 * Các trang/tính năng KHÔNG gọi AI trong khu Quân Sư (vd xem lại lá bàn, tra cứu...) không bị đụng
 * tới ở đây — chỉ middleware.ts (vào được trang) + luan.ts (đúng chỗ tốn tiền AI) cần biết danh
 * sách này.
 *
 * Xóa cả file này (và 2 chỗ dùng nó trong middleware.ts + luan.ts) khi kết thúc đợt test.
 */
export const TAI_KHOAN_TEST_QUAN_SU = new Set<string>([
  // TODO: anh Công điền email 10 tài khoản test vào đây (đã tạo bằng scripts/tao-tai-khoan-test-quan-su.mjs).
]);

export function laTaiKhoanTest(email: string | null | undefined): boolean {
  return !!email && TAI_KHOAN_TEST_QUAN_SU.has(email.toLowerCase());
}

/** Giới hạn TỔNG (không phải theo tháng) cho tài khoản test — xem ghi chú đầu file. */
export const TONG_LUOT_TOI_DA_TAI_KHOAN_TEST = 10;
