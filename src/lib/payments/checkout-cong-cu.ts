/**
 * Luồng tạo đơn dùng chung cho các công cụ thu phí (Giờ Liệm – Hạ Huyệt, Xem Ngày Cao Cấp).
 *
 * Gom vào một chỗ vì phần khó nằm ở đây chứ không ở từng công cụ: áp mã khuyến mãi đúng thứ tự,
 * xử lý trường hợp mã miễn phí 100% (không có gì để thanh toán), và không để đơn giảm giá nào tồn
 * tại mà không trừ lượt mã tương ứng.
 *
 * ⚠️ Số tiền LUÔN tính ở đây từ bảng giá phía máy chủ. Client gửi `soTien` gì cũng bị bỏ qua.
 */
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { orders } from "../../../db/schema";
import { createToolOrder, markOrderPaidAndFulfill } from "../db/orders";
import { getSepayQrUrl } from "./sepay";
import { kiemMaKhuyenMai, ghiNhanDungMa, chuanHoaMa } from "./promo";
import { ghiLuotDungMaLenSheet } from "../google-sheets-promo";
import { GIA_CONG_CU, type ToolSlug } from "./gia-cong-cu";

export interface KetQuaTaoDon {
  ok: true;
  orderId: string;
  orderCode: string;
  soTienGoc: number;
  soTienGiam: number;
  totalAmount: number;
  /** true khi mã miễn phí 100% — đơn đã được xác nhận luôn, khách xem kết quả ngay, không cần QR. */
  mienPhi: boolean;
  qrUrl: string | null;
  moTaGiam?: string;
}

export interface LoiTaoDon {
  ok: false;
  error: string;
  /** true nếu lỗi nằm ở mã khuyến mãi — để giao diện tô đúng ô nhập mã. */
  loiMaKhuyenMai?: boolean;
}

export async function taoDonCongCu(params: {
  toolSlug: ToolSlug;
  toolInput: unknown;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  /** Mã khách nhập (có thể rỗng/không có). */
  maKhuyenMai?: string;
}): Promise<KetQuaTaoDon | LoiTaoDon> {
  const soTienGoc = GIA_CONG_CU[params.toolSlug];
  const ma = chuanHoaMa(params.maKhuyenMai ?? "");

  let soTienGiam = 0;
  let promoCodeId: string | undefined;
  let moTaGiam: string | undefined;

  if (ma) {
    const kq = await kiemMaKhuyenMai({ ma, toolSlug: params.toolSlug, soTienGoc });
    if (!kq.hopLe) {
      return { ok: false, error: kq.lyDo ?? "Mã khuyến mãi không dùng được.", loiMaKhuyenMai: true };
    }
    soTienGiam = kq.soTienGiam ?? 0;
    promoCodeId = kq.promoCodeId;
    moTaGiam = kq.moTaGiam;
  }

  const totalAmount = Math.max(0, soTienGoc - soTienGiam);

  const { orderId, orderCode } = await createToolOrder({
    toolSlug: params.toolSlug,
    toolInput: params.toolInput,
    userId: params.userId,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    totalAmount,
  });

  // Trừ lượt mã NGAY SAU khi đơn tồn tại (cần orderId để ghi sổ). Nếu trong tích tắc vừa rồi có
  // người khác dùng mất lượt cuối thì hủy đơn luôn — thà báo khách nhập lại còn hơn để tồn tại một
  // đơn đã giảm giá mà không có lượt mã nào đối ứng.
  if (promoCodeId) {
    const daTru = await ghiNhanDungMa({ promoCodeId, orderId, soTienGiam });
    if (!daTru) {
      await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
      return {
        ok: false,
        error: "Mã khuyến mãi vừa hết lượt sử dụng. Vui lòng thử mã khác.",
        loiMaKhuyenMai: true,
      };
    }

    // Ghi sang Google Sheet cho anh Công theo dõi. Lỗi Sheet không được ảnh hưởng tới đơn của
    // khách — hàm này tự nuốt lỗi bên trong, ở đây không cần try/catch thêm.
    await ghiLuotDungMaLenSheet({
      ma,
      congCu: params.toolSlug,
      hoTen: params.customerName,
      email: params.customerEmail ?? "",
      soDienThoai: params.customerPhone,
      maDon: orderCode,
      giaGoc: soTienGoc,
      duocGiam: soTienGiam,
      phaiTra: totalAmount,
    });
  }

  // Mã miễn phí 100%: không còn gì để chuyển khoản, xác nhận đơn luôn để khách xem kết quả ngay.
  // Nếu vẫn sinh QR 0đ thì khách kẹt vĩnh viễn ở màn hình chờ thanh toán.
  if (totalAmount === 0) {
    await markOrderPaidAndFulfill(orderId);
    return {
      ok: true,
      orderId,
      orderCode,
      soTienGoc,
      soTienGiam,
      totalAmount,
      mienPhi: true,
      qrUrl: null,
      ...(moTaGiam ? { moTaGiam } : {}),
    };
  }

  return {
    ok: true,
    orderId,
    orderCode,
    soTienGoc,
    soTienGiam,
    totalAmount,
    mienPhi: false,
    qrUrl: getSepayQrUrl({ amount: totalAmount, orderCode }),
    ...(moTaGiam ? { moTaGiam } : {}),
  };
}
