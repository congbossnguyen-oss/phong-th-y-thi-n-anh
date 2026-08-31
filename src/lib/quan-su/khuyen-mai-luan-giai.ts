/**
 * Khuyến mãi Quân Sư (anh Công 31/8/2026): "20 acc đăng ký sớm nhất sẽ sử dụng được 10 lượt miễn
 * phí quẻ dịch" — thay cho ý ban đầu là tạo sẵn 10 tài khoản test (xem lịch sử chat), giờ tự động
 * theo THỨ TỰ ĐĂNG KÝ, không cần tài khoản/danh sách email nào tạo tay.
 *
 * "20 tài khoản đăng ký SỚM NHẤT" tính từ THỜI ĐIỂM KHUYẾN MÃI NÀY LÊN SÓNG (`TU_THOI_DIEM` bên
 * dưới) — KHÔNG phải 20 tài khoản đầu tiên trong toàn bộ lịch sử users (site đã có khách thật đăng
 * ký từ trước, tính từ đầu sẽ toàn khách cũ không liên quan gì tới đợt khuyến mãi này).
 *
 * CÓ HẠN (bổ sung 31/8/2026, anh Công: "chỉ áp dụng cho 20 tài khoản này trong khoảng 1 tháng
 * trước khi anh ra mắt chính thức thôi") — hết `DEN_THOI_DIEM` thì khuyến mãi tắt hẳn, kể cả 1
 * trong 20 tài khoản đó chưa dùng hết 10 lượt cũng không dùng miễn phí được nữa (phải đăng ký gói
 * thật) — không phải "10 lượt dùng bao giờ hết thì thôi", mà là "hết cả 2 điều kiện (đủ 10 lượt
 * HOẶC hết hạn 1 tháng) thì dừng, cái nào tới trước tính cái đó".
 *
 * Chỉ ảnh hưởng ĐÚNG 1 chỗ: hạn mức luận giải Kinh Dịch (tốn AI thật) ở luan.ts — mọi tính năng
 * khác trong Quân Sư không đụng tới, tự nhiên "dùng thoải mái" vì các trang/API đó không gọi hàm
 * này. Tài khoản đủ điều kiện vẫn phải đăng nhập bình thường như mọi khách (không cần gói thuê bao)
 * — /quan-su/* đã public từ Giai Đoạn A.
 */
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../../../db/schema";

/** Mốc bắt đầu tính "đăng ký sớm nhất" — đúng lúc khuyến mãi này lên production (31/8/2026). */
const TU_THOI_DIEM = new Date("2026-08-31T13:13:09.000Z");

/** Mốc hết hạn khuyến mãi — 30 ngày sau TU_THOI_DIEM ("khoảng 1 tháng trước khi ra mắt chính thức"). */
const DEN_THOI_DIEM = new Date(TU_THOI_DIEM.getTime() + 30 * 24 * 60 * 60 * 1000);

/** Số tài khoản (tính từ TU_THOI_DIEM) được hưởng khuyến mãi. */
export const SO_TAI_KHOAN_KHUYEN_MAI = 20;

/** Hạn mức TỔNG (không phải theo tháng) mỗi tài khoản đủ điều kiện được luận giải miễn phí. */
export const TONG_LUOT_MIEN_PHI_KHUYEN_MAI = 10;

/**
 * true nếu tài khoản này nằm trong 20 tài khoản đăng ký sớm nhất TÍNH TỪ `TU_THOI_DIEM`, VÀ hiện
 * đang trong hạn 1 tháng của khuyến mãi (`DEN_THOI_DIEM`). Đọc thẳng DB mỗi lần gọi (không cache)
 * — chỉ 1 query đơn giản, tần suất gọi bằng đúng số lần luận giải Kinh Dịch nên không đáng lo hiệu năng.
 */
export async function duocKhuyenMai(userId: string): Promise<boolean> {
  const now = new Date();
  if (now < TU_THOI_DIEM || now > DEN_THOI_DIEM) return false;

  const [me] = await db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1);
  if (!me || me.createdAt < TU_THOI_DIEM) return false;

  const [row] = await db
    .select({ soThuTu: sql<number>`count(*)` })
    .from(users)
    .where(and(gte(users.createdAt, TU_THOI_DIEM), lte(users.createdAt, me.createdAt)));

  return Number(row?.soThuTu ?? 0) <= SO_TAI_KHOAN_KHUYEN_MAI;
}
