/**
 * Kiểm tra và áp dụng mã khuyến mãi cho công cụ thu phí.
 *
 * ⚠️ Mọi việc tính tiền đều làm PHÍA MÁY CHỦ. Client chỉ gửi lên chuỗi mã; số tiền cuối cùng do
 * hàm này quyết định, không bao giờ tin `soTien` client gửi (cùng nguyên tắc với đơn vật phẩm).
 */
import { and, eq, sql as rawSql } from "drizzle-orm";
import { db } from "../db/client";
import { promoCodes, promoRedemptions } from "../../../db/schema";
import { ghiLuotDungMaLenSheet } from "../google-sheets-promo";

export interface KetQuaKiemMa {
  hopLe: boolean;
  lyDo?: string;
  promoCodeId?: string;
  /** Số tiền được giảm (VNĐ). */
  soTienGiam?: number;
  /** Số tiền khách phải trả sau giảm. */
  soTienPhaiTra?: number;
  moTaGiam?: string;
}

/** Chuẩn hoá mã: bỏ khoảng trắng, viết hoa — để khách gõ thường/hoa/có dấu cách đều nhận. */
export function chuanHoaMa(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

/**
 * Kiểm tra mã có dùng được cho đơn này không và tính số tiền giảm.
 * KHÔNG trừ lượt ở đây — chỉ trừ khi đơn thực sự được tạo (`ghiNhanDungMa`).
 */
export async function kiemMaKhuyenMai(params: {
  ma: string;
  toolSlug: string;
  soTienGoc: number;
}): Promise<KetQuaKiemMa> {
  const code = chuanHoaMa(params.ma);
  if (!code) return { hopLe: false, lyDo: "Chưa nhập mã khuyến mãi." };

  const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
  if (!row) return { hopLe: false, lyDo: "Mã khuyến mãi không tồn tại." };
  if (!row.isActive) return { hopLe: false, lyDo: "Mã khuyến mãi đã bị ngừng sử dụng." };
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { hopLe: false, lyDo: "Mã khuyến mãi đã hết hạn." };
  }
  if (row.maxUses !== null && row.usedCount >= row.maxUses) {
    return { hopLe: false, lyDo: "Mã khuyến mãi đã hết lượt sử dụng." };
  }
  if (row.toolSlug && row.toolSlug !== params.toolSlug) {
    return { hopLe: false, lyDo: "Mã khuyến mãi này không áp dụng cho công cụ đang dùng." };
  }

  let soTienGiam = 0;
  let moTaGiam = "";
  if (row.discountType === "mien_phi") {
    soTienGiam = params.soTienGoc;
    moTaGiam = "Miễn phí hoàn toàn";
  } else if (row.discountType === "phan_tram") {
    const pct = Math.min(100, Math.max(0, Number(row.discountValue ?? 0)));
    soTienGiam = Math.round((params.soTienGoc * pct) / 100);
    moTaGiam = `Giảm ${pct}%`;
  } else {
    soTienGiam = Math.min(params.soTienGoc, Number(row.discountValue ?? 0));
    moTaGiam = `Giảm ${soTienGiam.toLocaleString("vi-VN")}đ`;
  }

  return {
    hopLe: true,
    promoCodeId: row.id,
    soTienGiam,
    soTienPhaiTra: Math.max(0, params.soTienGoc - soTienGiam),
    moTaGiam,
  };
}

/**
 * Trừ lượt và ghi nhận mã đã dùng cho đơn — gọi NGAY SAU khi tạo đơn thành công.
 *
 * Trừ lượt bằng câu lệnh có điều kiện (`used_count < max_uses`) để 2 người bấm cùng lúc không thể
 * cùng dùng lượt cuối. Nếu không trừ được (đã hết lượt trong tích tắc vừa rồi) thì trả false để
 * tầng gọi hủy ưu đãi.
 */
export async function ghiNhanDungMa(params: {
  promoCodeId: string;
  orderId: string;
  soTienGiam: number;
}): Promise<boolean> {
  const daTru = await db
    .update(promoCodes)
    .set({ usedCount: rawSql`${promoCodes.usedCount} + 1` })
    .where(
      and(
        eq(promoCodes.id, params.promoCodeId),
        rawSql`(${promoCodes.maxUses} IS NULL OR ${promoCodes.usedCount} < ${promoCodes.maxUses})`,
      ),
    )
    .returning({ id: promoCodes.id });

  if (daTru.length === 0) return false;

  await db.insert(promoRedemptions).values({
    promoCodeId: params.promoCodeId,
    orderId: params.orderId,
    discountAmount: String(params.soTienGiam),
  });
  return true;
}

/**
 * Chốt mã khi đơn ĐÃ THANH TOÁN: trừ lượt, ghi sổ, đẩy sang Google Sheet.
 *
 * Gọi từ markOrderPaidAndFulfill(). Đặt ở thời điểm thanh toán (thay vì lúc tạo đơn) để đơn khách
 * bỏ ngang không đốt mất mã — xem giải thích tại chỗ gọi.
 *
 * KHÔNG được ném lỗi ra ngoài: đơn đã thanh toán rồi, hỏng khâu ghi sổ mã không được phép chặn
 * khách nhận kết quả. Mọi trục trặc chỉ log lại để đối soát tay.
 *
 * Trả về CHUỖI MÃ đã dùng (vd "TA6TU2XPGV") để tầng gọi ghi vào sổ doanh thu; null nếu không
 * chốt được.
 */
export async function apDungMaKhiThanhToan(params: {
  promoCodeId: string;
  orderId: string;
  orderCode: string;
  soTienGiam: number;
  toolSlug: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  totalAmount: number;
}): Promise<string | null> {
  try {
    const daTru = await ghiNhanDungMa({
      promoCodeId: params.promoCodeId,
      orderId: params.orderId,
      soTienGiam: params.soTienGiam,
    });
    if (!daTru) {
      console.error(
        `[promo] Đơn ${params.orderCode} đã thanh toán nhưng mã ${params.promoCodeId} hết lượt — cần đối soát tay.`,
      );
      return null;
    }

    const [row] = await db
      .select({ code: promoCodes.code })
      .from(promoCodes)
      .where(eq(promoCodes.id, params.promoCodeId))
      .limit(1);

    // Lượt dùng mã CHỈ ghi Google Sheet, KHÔNG gửi email báo cáo (chủ dự án chốt 2026-08-16).
    // Đơn thu phí thì vẫn có email — xem `markOrderPaidAndFulfill` trong lib/db/orders.ts.
    const ma = row?.code ?? "";
    await ghiLuotDungMaLenSheet({
      ma,
      congCu: params.toolSlug,
      hoTen: params.customerName,
      email: params.customerEmail ?? "",
      soDienThoai: params.customerPhone,
      maDon: params.orderCode,
      giaGoc: params.totalAmount + params.soTienGiam,
      duocGiam: params.soTienGiam,
      phaiTra: params.totalAmount,
    });

    return ma || null;
  } catch (err) {
    console.error(`[promo] Không chốt được mã cho đơn ${params.orderCode}:`, err);
    return null;
  }
}
