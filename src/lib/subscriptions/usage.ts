/**
 * Hạn mức lượt hỏi/tháng cho gói thuê bao Quân Sư.
 *
 * VÌ SAO CẦN: mỗi câu hỏi Kinh Dịch = 1 lượt gọi AI THẬT, KHÔNG cache được (quẻ gieo mỗi lần luôn
 * khác nhau, không như `vanKhiCache` cache theo Đại Vận cố định) — trước đây `luan.ts` chỉ kiểm tra
 * "còn hạn gói" mà không đếm lượt, tức 1 khách trả tiền có thể hỏi KHÔNG GIỚI HẠN. Đúng cảnh báo đã
 * ghi sẵn ở ROADMAP.md §Rủi ro: "cần theo dõi cost logging, tránh vỡ mô hình giá" — nhưng phần đó
 * chưa được xây. File này bù đúng chỗ thiếu đó (anh Công duyệt hướng "có bảng so sánh + hạn mức
 * lượt/tháng", 27/8/2026).
 *
 * Đếm theo THÁNG DƯƠNG LỊCH (giờ Việt Nam), không phải 30 ngày kể từ lúc mua — dễ hiểu với khách và
 * đơn giản để cài (không cần biết ngày bắt đầu chu kỳ riêng của từng gói).
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { quanSuUsage } from "../../../db/schema";
import type { SubscriptionTier } from "../payments/gia-subscription";

/**
 * Hạn mức lượt hỏi/tháng theo hạng gói — Cao cấp cao hơn hẳn Cơ bản (không chỉ vì trả tiền nhiều
 * hơn, mà vì Cao cấp còn dùng được cả câu hỏi "so sánh phương án"/"luận sâu" tốn nhiều quẻ hơn/lượt).
 * BẢN NHÁP — chưa có dữ liệu chi phí AI thật để calibrate (chi phí `deepseek-v4-flash` qua
 * tom.qnt.world chưa xác nhận), anh Công cần theo dõi thực tế 1-2 tháng đầu rồi chỉnh lại số này.
 */
export const HAN_MUC_LUOT_THEO_GOI: Record<SubscriptionTier, number> = {
  co_ban: 15,
  cao_cap: 25,
};

/**
 * Hạn mức RIÊNG cho tài khoản đang DÙNG THỬ (7 ngày, hưởng hạng Cao cấp — xem trial.ts) — THẤP HƠN
 * HẲN hạn mức Cao cấp trả tiền (25/tháng). Khách chưa trả đồng nào không được "cày" gần hết hạn mức
 * y hệt khách trả tiền — anh Công yêu cầu 27/8/2026: "bản dùng thử không được để tốn chi phí AI
 * thoải mái như bản trả tiền". Đủ để thấy giá trị (vài câu hỏi thật) nhưng không đủ để lạm dụng.
 */
export const HAN_MUC_LUOT_DUNG_THU = 5;

/** "yyyy-MM" theo giờ Việt Nam — cùng idiom `Intl.DateTimeFormat` đã dùng ở `divination.ts` (castInputNow). */
export function thangHienTaiVN(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  return `${y}-${m}`;
}

export interface TrangThaiHanMuc {
  conLuot: boolean;
  daDung: number;
  hanMuc: number;
}

/**
 * Kiểm tra còn lượt hỏi trong tháng này không — KHÔNG tự tăng đếm (chỉ đọc).
 * @param isTrial true nếu gói đang dùng là bản dùng thử — dùng hạn mức thấp hơn hẳn (xem
 *   `HAN_MUC_LUOT_DUNG_THU`), bất kể `tier` là gì (dùng thử luôn hưởng tier "cao_cap" nhưng KHÔNG
 *   được dùng hạn mức Cao cấp trả tiền).
 *
 * ⚠️ Đếm theo THÁNG DƯƠNG LỊCH (giống gói trả tiền) — nếu 1 lượt dùng thử hiếm khi vắt qua ranh giới
 * tháng (vd bắt đầu 29/1, hết hạn 5/2), bộ đếm sẽ "làm mới" đúng lúc sang tháng mới, cho thêm
 * `HAN_MUC_LUOT_DUNG_THU` lượt nữa trong vài ngày còn lại — chấp nhận được vì hiếm và mức chênh nhỏ,
 * không xây riêng cơ chế đếm "tổng cả đợt thử" cho trường hợp cạnh này.
 */
export async function conLuotHoiKhong(userId: string, tier: SubscriptionTier, isTrial = false): Promise<TrangThaiHanMuc> {
  const thang = thangHienTaiVN();
  const [row] = await db
    .select({ soLuot: quanSuUsage.soLuotDaDung })
    .from(quanSuUsage)
    .where(and(eq(quanSuUsage.userId, userId), eq(quanSuUsage.thangNam, thang)))
    .limit(1);
  const daDung = row?.soLuot ?? 0;
  const hanMuc = isTrial ? HAN_MUC_LUOT_DUNG_THU : HAN_MUC_LUOT_THEO_GOI[tier];
  return { conLuot: daDung < hanMuc, daDung, hanMuc };
}

/**
 * Tổng lượt hỏi đã dùng CỘNG DỒN MỌI THÁNG (không reset) — dùng riêng cho khuyến mãi "20 tài khoản
 * đăng ký sớm nhất" (xem `quan-su/khuyen-mai-luan-giai.ts`, 31/8/2026), KHÁC hẳn `conLuotHoiKhong()`
 * ở trên (đếm theo tháng dương lịch, dành cho gói trả tiền/dùng thử thật).
 */
export async function tongLuotDaDung(userId: string): Promise<number> {
  const [row] = await db
    .select({ tong: sql<number>`coalesce(sum(${quanSuUsage.soLuotDaDung}), 0)` })
    .from(quanSuUsage)
    .where(eq(quanSuUsage.userId, userId));
  return Number(row?.tong ?? 0);
}

/**
 * Ghi nhận 1 lượt hỏi đã dùng (upsert theo user+tháng, tăng dần) — gọi SAU KHI luận giải thành công,
 * không tính lượt cho request lỗi đầu vào (400) hay lỗi hệ thống (500) — khách không nhận được gì thì
 * không nên bị trừ lượt.
 */
export async function ghiNhanLuotHoi(userId: string): Promise<void> {
  const thang = thangHienTaiVN();
  await db
    .insert(quanSuUsage)
    .values({ userId, thangNam: thang, soLuotDaDung: 1 })
    .onConflictDoUpdate({
      target: [quanSuUsage.userId, quanSuUsage.thangNam],
      set: { soLuotDaDung: sql`${quanSuUsage.soLuotDaDung} + 1`, updatedAt: new Date() },
    });
}
