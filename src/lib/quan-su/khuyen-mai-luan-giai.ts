/**
 * Khuyến mãi Quân Sư (anh Công 31/8/2026, mở rộng 7/9/2026): "50 acc đăng ký sớm nhất sẽ sử dụng
 * được 10 lượt miễn phí quẻ dịch, trong 1 tháng kể từ NGÀY CHÍNH NGƯỜI ĐÓ ĐĂNG KÝ" — tự động theo
 * THỨ TỰ ĐĂNG KÝ, không cần tài khoản/danh sách email nào tạo tay.
 *
 * "50 tài khoản đăng ký SỚM NHẤT" tính từ THỜI ĐIỂM KHUYẾN MÃI NÀY LÊN SÓNG (`TU_THOI_DIEM` bên
 * dưới) — KHÔNG phải 50 tài khoản đầu tiên trong toàn bộ lịch sử users (site đã có khách thật đăng
 * ký từ trước, tính từ đầu sẽ toàn khách cũ không liên quan gì tới đợt khuyến mãi này).
 *
 * HẠN 1 THÁNG LÀ RIÊNG TỪNG NGƯỜI (đổi 7/9/2026, anh Công: "trong tháng đầu tiên kể từ ngày đăng
 * ký") — KHÁC bản gốc 31/8/2026 dùng 1 mốc hết hạn CHUNG cho mọi người (`TU_THOI_DIEM + 30 ngày`),
 * khiến người đăng ký gần cuối cửa sổ có ít hơn 30 ngày thật. Giờ mỗi người có hạn riêng =
 * `createdAt của chính họ + 30 ngày`, không phụ thuộc người khác đăng ký lúc nào.
 *
 * Hết hạn (đủ 10 lượt HOẶC hết 30 ngày riêng của mình, cái nào tới trước tính cái đó): tài khoản
 * trở về y hệt tài khoản bình thường, KHÔNG có gì "còn sót lại" — module này CHƯA BAO GIỜ tạo bản
 * ghi `subscriptions` cho các tài khoản khuyến mãi (chỉ đọc `users`, xem `duocKhuyenMai()` bên
 * dưới), nên khi `duocKhuyenMai()` trả về false, `luan.ts` tự rơi thẳng về nhánh `coQuyenTruyCap()`
 * bình thường — không có gói nào đang hoạt động thì bắt buộc mua gói mới dùng được, và frontend
 * (`quan-su/hoi/[id].astro`) tự dẫn khách sang `/quan-su/goi-thue-bao` khi API trả 403/429.
 *
 * Chỉ ảnh hưởng ĐÚNG 1 chỗ: hạn mức luận giải Kinh Dịch (tốn AI thật) ở luan.ts — mọi tính năng
 * khác trong Quân Sư không đụng tới, tự nhiên "dùng thoải mái" vì các trang/API đó không gọi hàm
 * này. Tài khoản đủ điều kiện vẫn phải đăng nhập bình thường như mọi khách (không cần gói thuê bao)
 * — /quan-su/* đã public từ Giai Đoạn A.
 */
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../../../db/schema";

/**
 * Mốc bắt đầu tính "đăng ký sớm nhất". BAN ĐẦU đặt = giờ code khuyến mãi lên production
 * (`2026-08-31T13:13:09.000Z`) — SAI, vì code lên production TRỄ HƠN lúc anh Công thực tế công bố/mở
 * đăng ký cho khách trong ngày. Hậu quả: 2 tài khoản đăng ký sớm nhất trong ngày (`hoatm09@gmail.com`
 * 11:00:42 UTC và `nhubinhcl@gmail.com` "Hà Lê" 12:34:27 UTC — cả 2 đều TRƯỚC mốc 13:13:09 cũ) bị
 * `duocKhuyenMai()` loại thẳng ở điều kiện `me.createdAt < TU_THOI_DIEM`, dù rõ ràng thuộc diện
 * "đăng ký sớm nhất" theo đúng tinh thần chương trình. Anh Công xác nhận 31/8/2026: lấy mốc 00:00
 * giờ Việt Nam ngày 31/8/2026 (= 17:00 UTC ngày 30/8/2026) làm mốc thật — bao trọn cả ngày công bố,
 * không phụ thuộc giờ deploy code cụ thể.
 */
const TU_THOI_DIEM = new Date("2026-08-30T17:00:00.000Z"); // 00:00 ngày 31/8/2026 giờ Việt Nam (UTC+7)

/** Số ngày mỗi tài khoản đủ điều kiện được hưởng khuyến mãi, tính TỪ NGÀY CHÍNH TÀI KHOẢN ĐÓ đăng ký. */
const SO_NGAY_HAN_RIENG = 30;

/** Số tài khoản (tính từ TU_THOI_DIEM) được hưởng khuyến mãi. */
export const SO_TAI_KHOAN_KHUYEN_MAI = 50;

/** Hạn mức TỔNG (không phải theo tháng) mỗi tài khoản đủ điều kiện được luận giải miễn phí. */
export const TONG_LUOT_MIEN_PHI_KHUYEN_MAI = 10;

interface ViTriKhuyenMai {
  /** true nếu tài khoản nằm trong 50 tài khoản đăng ký sớm nhất tính từ TU_THOI_DIEM. */
  hopLeSoThuTu: boolean;
  /** Hạn riêng của tài khoản này = createdAt của chính họ + 30 ngày. */
  hetHanLuc: Date;
}

/** Tra thứ tự đăng ký (so với TU_THOI_DIEM) + tính hạn riêng. null nếu tài khoản đăng ký TRƯỚC đợt khuyến mãi. */
async function traViTri(userId: string): Promise<ViTriKhuyenMai | null> {
  const [me] = await db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1);
  if (!me || me.createdAt < TU_THOI_DIEM) return null;

  const [row] = await db
    .select({ soThuTu: sql<number>`count(*)` })
    .from(users)
    .where(and(gte(users.createdAt, TU_THOI_DIEM), lte(users.createdAt, me.createdAt)));

  return {
    hopLeSoThuTu: Number(row?.soThuTu ?? 0) <= SO_TAI_KHOAN_KHUYEN_MAI,
    hetHanLuc: new Date(me.createdAt.getTime() + SO_NGAY_HAN_RIENG * 24 * 60 * 60 * 1000),
  };
}

/**
 * true nếu tài khoản này nằm trong 50 tài khoản đăng ký sớm nhất TÍNH TỪ `TU_THOI_DIEM`, VÀ hiện
 * đang trong hạn 30 ngày RIÊNG của chính tài khoản đó (không phải mốc chung). Đọc thẳng DB mỗi lần
 * gọi (không cache) — chỉ 1 query đơn giản, tần suất gọi bằng đúng số lần luận giải Kinh Dịch nên
 * không đáng lo hiệu năng.
 */
export async function duocKhuyenMai(userId: string): Promise<boolean> {
  const vt = await traViTri(userId);
  if (!vt) return false;
  return vt.hopLeSoThuTu && new Date() <= vt.hetHanLuc;
}

/**
 * Thông tin khuyến mãi để HIỂN THỊ cho khách (thông báo ngay sau đăng ký, banner nhắc hạn) — trả về
 * null nếu tài khoản không/không còn thuộc diện khuyến mãi (kể cả đã hết hạn riêng của họ).
 */
export async function thongTinKhuyenMai(userId: string): Promise<{ hetHanLuc: Date } | null> {
  const vt = await traViTri(userId);
  if (!vt || !vt.hopLeSoThuTu || new Date() > vt.hetHanLuc) return null;
  return { hetHanLuc: vt.hetHanLuc };
}
