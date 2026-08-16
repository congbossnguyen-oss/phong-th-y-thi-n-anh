/**
 * Luồng tạo đơn dùng chung cho các công cụ thu phí (Giờ Liệm – Hạ Huyệt, Xem Ngày Cao Cấp).
 *
 * Gom vào một chỗ vì phần khó nằm ở đây chứ không ở từng công cụ: áp mã khuyến mãi đúng thứ tự,
 * xử lý trường hợp mã miễn phí 100% (không có gì để thanh toán), và không để đơn giảm giá nào tồn
 * tại mà không trừ lượt mã tương ứng.
 *
 * ⚠️ Số tiền LUÔN tính ở đây từ bảng giá phía máy chủ. Client gửi `soTien` gì cũng bị bỏ qua.
 */
import { createToolOrder, markOrderPaidAndFulfill } from "../db/orders";
import { getSepayQrUrl } from "./sepay";
import { kiemMaKhuyenMai, chuanHoaMa } from "./promo";
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
  /**
   * Ghi đè giá gốc cho công cụ có NHIỀU BẬC GIÁ (hiện chỉ module tang lễ: 499k gói cơ bản /
   * 999k gói đầy đủ khi có tọa hướng mộ).
   *
   * ⚠️ Tầng gọi phải tự tính con số này Ở PHÍA MÁY CHỦ từ dữ liệu đã kiểm — tuyệt đối không
   * chuyền thẳng số tiền client gửi lên, nếu không khách tự khai giá bao nhiêu cũng được.
   */
  soTienGocGhiDe?: number;
  /**
   * Tài khoản QUẢN TRỊ đang kiểm thử → đơn 0đ, tự xác nhận, đi trọn luồng thật (tạo đơn → xác
   * nhận → trả kết quả → gửi email) mà không phải chuyển khoản.
   *
   * ⚠️ Tầng gọi PHẢI lấy cờ này từ phiên đăng nhập phía máy chủ (`locals.user.isAdmin`), tuyệt
   * đối không nhận từ dữ liệu client gửi lên — nếu không thì ai cũng tự khai là quản trị để dùng
   * miễn phí toàn bộ công cụ thu phí.
   */
  laQuanTri?: boolean;
}): Promise<KetQuaTaoDon | LoiTaoDon> {
  const soTienGoc = params.soTienGocGhiDe ?? GIA_CONG_CU[params.toolSlug];
  const ma = chuanHoaMa(params.maKhuyenMai ?? "");

  let soTienGiam = 0;
  let promoCodeId: string | undefined;
  let moTaGiam: string | undefined;

  // Quản trị kiểm thử: miễn toàn bộ. CỐ Ý không đụng tới mã khuyến mãi — nếu vẫn chạy nhánh mã
  // thì mỗi lần anh test sẽ đốt mất một lượt của mã thật đang phát cho khách.
  if (params.laQuanTri) {
    soTienGiam = soTienGoc;
    moTaGiam = "Tài khoản quản trị — miễn phí để kiểm thử";
  } else if (ma) {
    const kq = await kiemMaKhuyenMai({ ma, toolSlug: params.toolSlug, soTienGoc });
    if (!kq.hopLe) {
      return { ok: false, error: kq.lyDo ?? "Mã khuyến mãi không dùng được.", loiMaKhuyenMai: true };
    }
    soTienGiam = kq.soTienGiam ?? 0;
    promoCodeId = kq.promoCodeId;
    moTaGiam = kq.moTaGiam;
  }

  const totalAmount = Math.max(0, soTienGoc - soTienGiam);

  // Mã CHƯA bị trừ lượt ở đây — chỉ ghi vào đơn. Lượt được trừ (và ghi Google Sheet) lúc đơn
  // thực sự được thanh toán, trong markOrderPaidAndFulfill(). Làm vậy để khách xem QR rồi bỏ
  // ngang không đốt mất mã tặng: mã 1 lượt mà chết oan thì anh Công phải tạo mã mới.
  const { orderId, orderCode } = await createToolOrder({
    toolSlug: params.toolSlug,
    toolInput: params.toolInput,
    userId: params.userId,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    totalAmount,
    promoCodeId: promoCodeId ?? null,
    promoDiscountAmount: promoCodeId ? soTienGiam : null,
  });

  // Mã miễn phí 100%: không còn gì để chuyển khoản, xác nhận đơn luôn để khách xem kết quả ngay.
  // Nếu vẫn sinh QR 0đ thì khách kẹt vĩnh viễn ở màn hình chờ thanh toán.
  // (markOrderPaidAndFulfill cũng chính là chỗ trừ lượt mã, nên đường này vẫn ghi sổ đầy đủ.)
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
