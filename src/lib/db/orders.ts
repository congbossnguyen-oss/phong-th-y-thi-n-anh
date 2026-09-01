import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { orders, orderItems, courseEnrollments, users, subscriptions } from "../../../db/schema";
import { SO_THANG_THEO_KY_HAN, type SubscriptionTier, type SubscriptionDuration } from "../payments/gia-subscription";
import { generateOrderCode } from "../payments/sepay";
import { products } from "../placeholder-data";
import { getCourseBySlug } from "../cms/queries";
import {
  sendProductOrderConfirmedEmail,
  sendCourseOrderConfirmedEmail,
  sendBaoCaoGoogleSheetEmail,
  sendHoSoTangLeEmail,
  sendNghePdfEmail,
  sendTrachNhatSinhNoPdfEmail,
  sendHopHonPdfEmail,
  sendKyMonMenhPdfEmail,
  sendBatTuToanDienCoBanPdfEmail,
  sendBatTuToanDienNangCaoPdfEmail,
  sendBatTuToanDienPdfEmail,
  sendLuanGiaiTuViCoBanPdfEmail,
  sendLuanGiaiTuViNangCaoPdfEmail,
  sendLuanGiaiTuViToanDienPdfEmail,
} from "../email/send";
import { taoHoSoTangLe, type DauVaoHoSo } from "../dai-cat-loi/tao-ho-so-tang-le";
import { taoHoSoNghe, type NgheInput } from "../nghe-nghiep/tao-ho-so-nghe";
import { generateNghePdf } from "../dai-cat-loi/nghe-nghiep-pdf";
import { phanTichTrachNhatSinhNo, type BirthSelectionInput } from "../trach-nhat-sinh-no";
import { generateTrachNhatSinhNoPdf } from "../dai-cat-loi/trach-nhat-sinh-no-pdf";
import { tinhHopHon } from "../hop-hon";
import type { DauVaoHopHon } from "../../pages/api/dai-cat-loi/hop-hon/checkout";
import { generateHopHonPdf } from "../dai-cat-loi/hop-hon-pdf";
import { lapLaBan, luanGiaiMenh, luanGiaiMenhChiTiet } from "../kymon";
import { generateKyMonMenhPdf } from "../dai-cat-loi/ky-mon-menh-pdf";
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "../luan-giai-toan-dien/ai-narrative";
import { hashLaSo, cacheCoBan, cacheNangCao } from "../luan-giai-toan-dien/cache";
import { taoBaoCaoCoBanChiTinh1Lan, taoBaoCaoNangCaoChiTinh1Lan } from "../luan-giai-toan-dien/tinh-1-lan";
import { generateBatTuCoBanPdf, generateBatTuNangCaoPdf, generateBatTuToanDienPdf } from "../dai-cat-loi/bat-tu-toan-dien-pdf";
import type { BatTuInput } from "../bat-tu";
import { taoLuanGiaiTuVi, type LuanGiaiTuViInput } from "../tu-vi/luan-giai/taoLuanGiaiTuVi";
import { generateTuViCoBanPdf, generateTuViNangCaoPdf } from "../tu-vi/luan-giai/pdf";
import { apDungMaKhiThanhToan } from "../payments/promo";
import { ghiDonThuPhiLenSheet, TEN_CONG_CU_HIEN_THI } from "../google-sheets-don-thu-phi";
import { ghiDonSimPhongThuyLenSheet } from "../google-sheets-sim-phong-thuy";
import { NHAN_MONG_MUON, NHAN_MANG, NHAN_KHOANG_GIA, type SimPhongThuyInput } from "../sim-phong-thuy-khai-van/labels";
import { Scoring } from "@thien-anh/rule-engine";
import { LoiNguoiDung, boiLoiHeThong } from "../loi-an-toan";

export interface CartLine {
  slug: string;
  qty: number;
}

/**
 * Tạo đơn hàng vật phẩm — giá luôn lấy từ nguồn dữ liệu server (placeholder-data, sau này là
 * Sanity), KHÔNG bao giờ tin giá client gửi lên, để tránh khách hàng sửa giá qua devtools.
 */
async function _createProductOrderNoiBo(params: {
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  note: string | null;
  paymentMethod: "sepay_qr" | "cod";
  lines: CartLine[];
}) {
  const resolvedLines = params.lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      if (!product || line.qty < 1) return null;
      return { product, qty: line.qty };
    })
    .filter((l): l is { product: (typeof products)[number]; qty: number } => l !== null);

  if (resolvedLines.length === 0) {
    throw new LoiNguoiDung("Giỏ hàng không hợp lệ hoặc trống.");
  }

  const totalAmount = resolvedLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "product",
      status: "pending_payment",
      paymentMethod: params.paymentMethod,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      shippingAddress: params.shippingAddress,
      note: params.note,
      totalAmount: String(totalAmount),
      orderCode,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  await db.insert(orderItems).values(
    resolvedLines.map((l) => ({
      orderId: order.id,
      productRef: l.product.slug,
      productNameSnapshot: l.product.name,
      unitPriceSnapshot: String(l.product.price),
      quantity: l.qty,
    }))
  );

  return { orderId: order.id, orderCode: order.orderCode, totalAmount };
}

/** Tạo đơn hàng vật phẩm — bọc lỗi hệ thống (DB...) không cho lộ chi tiết ra client, chỉ lỗi
 * nghiệp vụ (giỏ hàng trống...) mới hiển thị nguyên văn. */
export function createProductOrder(params: Parameters<typeof _createProductOrderNoiBo>[0]) {
  return boiLoiHeThong("createProductOrder", "Không tạo được đơn hàng, vui lòng thử lại sau.", () =>
    _createProductOrderNoiBo(params)
  );
}

/**
 * Tạo đơn hàng khóa học online — mỗi đơn ứng với đúng 1 khóa học, bắt buộc đăng nhập.
 */
async function _createCourseOrderNoiBo(params: {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  courseSlug: string;
}) {
  const courseData = await getCourseBySlug(params.courseSlug);
  const course = courseData && courseData.format === "online" ? courseData : null;
  if (!course) {
    throw new LoiNguoiDung("Khóa học không hợp lệ.");
  }

  // Tránh tạo đơn trùng nếu học viên tải lại trang thanh toán nhiều lần — tái sử dụng
  // đơn "đang chờ thanh toán" gần nhất cho cùng học viên + khóa học nếu có.
  const [pending] = await db
    .select({ id: orders.id, orderCode: orders.orderCode, totalAmount: orders.totalAmount })
    .from(orders)
    .where(
      and(
        eq(orders.userId, params.userId),
        eq(orders.courseRef, course.slug),
        eq(orders.status, "pending_payment"),
        eq(orders.orderType, "course")
      )
    )
    .limit(1);

  if (pending) {
    return { orderId: pending.id, orderCode: pending.orderCode, totalAmount: Number(pending.totalAmount) };
  }

  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "course",
      status: "pending_payment",
      paymentMethod: "sepay_qr",
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      courseRef: course.slug,
      totalAmount: String(course.price),
      orderCode,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  return { orderId: order.id, orderCode: order.orderCode, totalAmount: course.price };
}

/** Tạo đơn hàng khóa học — bọc lỗi hệ thống, xem `createProductOrder`. */
export function createCourseOrder(params: Parameters<typeof _createCourseOrderNoiBo>[0]) {
  return boiLoiHeThong("createCourseOrder", "Không tạo được đơn hàng, vui lòng thử lại sau.", () =>
    _createCourseOrderNoiBo(params)
  );
}

/**
 * Tạo đơn hàng công cụ trả phí (vd "gio-liem-ha-huyet"). Có công cụ bắt đăng nhập, có công cụ
 * không (xem chú thích ở `userId`). `toolInput` lưu nguyên object input đã validate được
 * (JSON.stringify) để sau khi thanh toán xong, tầng API tính lại kết quả từ chính input này —
 * không lưu sẵn kết quả để tránh lệch dữ liệu nếu công thức tính được sửa sau khi đơn đã tạo.
 */
async function _createToolOrderNoiBo(params: {
  toolSlug: string;
  toolInput: unknown;
  // Gắn đơn vào tài khoản khi công cụ có bắt đăng nhập (vd Xem Ngày Cao Cấp) — để khách xem lại
  // được kết quả cũ và để đối soát khách hàng.
  //
  // null với công cụ CỐ Ý không bắt đăng nhập: module Giờ Liệm – Hạ Huyệt dùng ngay lúc gia đình
  // vừa có tang, thường nửa đêm và đang rối — bắt tạo tài khoản lúc đó là rào cản sai chỗ.
  // Những đơn này dùng orderCode làm "vé" truy cập kết quả.
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalAmount: number;
  // Mã khuyến mãi đã áp — CHƯA trừ lượt ở đây, chỉ ghi nhớ để trừ lúc đơn được thanh toán.
  promoCodeId?: string | null;
  promoDiscountAmount?: number | null;
}) {
  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "tool",
      status: "pending_payment",
      paymentMethod: "sepay_qr",
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      toolSlug: params.toolSlug,
      toolInputSnapshot: JSON.stringify(params.toolInput),
      totalAmount: String(params.totalAmount),
      orderCode,
      promoCodeId: params.promoCodeId ?? null,
      promoDiscountAmount:
        params.promoDiscountAmount != null ? String(params.promoDiscountAmount) : null,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  return { orderId: order.id, orderCode: order.orderCode, totalAmount: params.totalAmount };
}

/** Tạo đơn hàng công cụ trả phí — bọc lỗi hệ thống, xem `createProductOrder`. */
export function createToolOrder(params: Parameters<typeof _createToolOrderNoiBo>[0]) {
  return boiLoiHeThong("createToolOrder", "Không tạo được đơn hàng, vui lòng thử lại sau.", () =>
    _createToolOrderNoiBo(params)
  );
}

/**
 * Tạo đơn hàng gói thuê bao "Quân Sư" (Cơ bản / Cao cấp × 1-3-6-12 tháng). KHÁC `createToolOrder`:
 * BẮT BUỘC đăng nhập (`userId` không được null) — quyền truy cập gói tính theo tài khoản, không
 * theo orderCode của 1 lần mua, nên không có tài khoản thì không có gì để gắn quyền vào.
 */
async function _createSubscriptionOrderNoiBo(params: {
  userId: string;
  tier: SubscriptionTier;
  duration: SubscriptionDuration;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalAmount: number;
  promoCodeId?: string | null;
  promoDiscountAmount?: number | null;
}) {
  const orderCode = generateOrderCode();

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      orderType: "subscription",
      status: "pending_payment",
      paymentMethod: "sepay_qr",
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      // Không có "tool_slug" riêng cho gói thuê bao — tái dùng cột JSON snapshot sẵn có để lưu
      // {tier, duration}, đọc lại đúng lúc thanh toán xong (markOrderPaidAndFulfill).
      toolInputSnapshot: JSON.stringify({ tier: params.tier, duration: params.duration }),
      totalAmount: String(params.totalAmount),
      orderCode,
      promoCodeId: params.promoCodeId ?? null,
      promoDiscountAmount:
        params.promoDiscountAmount != null ? String(params.promoDiscountAmount) : null,
    })
    .returning({ id: orders.id, orderCode: orders.orderCode });

  return { orderId: order.id, orderCode: order.orderCode, totalAmount: params.totalAmount };
}

/** Tạo đơn hàng gói thuê bao — bọc lỗi hệ thống, xem `createProductOrder`. */
export function createSubscriptionOrder(params: Parameters<typeof _createSubscriptionOrderNoiBo>[0]) {
  return boiLoiHeThong("createSubscriptionOrder", "Không tạo được đơn hàng, vui lòng thử lại sau.", () =>
    _createSubscriptionOrderNoiBo(params)
  );
}

export function getOrderByCode(orderCode: string) {
  return boiLoiHeThong("getOrderByCode", "Có lỗi hệ thống, vui lòng thử lại sau.", async () => {
    const [order] = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).limit(1);
    return order ?? null;
  });
}

/**
 * Đơn "tool" GẦN NHẤT đã thanh toán của 1 tài khoản cho 1 công cụ — dùng cho công cụ bắt đăng nhập
 * (vd luan-giai-bat-tu-toan-dien) để kiểm tra quyền truy cập khi khách quay lại KHÔNG mang orderCode
 * (đã đóng tab lúc thanh toán, hoặc bookmark thẳng trang). Khác `getOrderByCode`: tra theo tài
 * khoản, không theo mã đơn cụ thể.
 */
export function getConfirmedToolOrderForUser(userId: string, toolSlug: string) {
  return boiLoiHeThong("getConfirmedToolOrderForUser", "Có lỗi hệ thống, vui lòng thử lại sau.", async () => {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.toolSlug, toolSlug), eq(orders.status, "confirmed")))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    return order ?? null;
  });
}

/**
 * TOÀN BỘ đơn đã xác nhận của 1 người cho 1 tool (không chỉ đơn mới nhất) — dùng khi cần biết đã
 * mua CHO ĐÚNG LÁ SỐ nào (vd Bát Tự Toàn Diện, Tử Vi: khách "xem hộ người khác" nhập lá số MỚI, phải
 * phân biệt được với lá số đã mua trước đó, không thể coi "có ít nhất 1 đơn" là đã mua lá số hiện
 * tại — bug thật đã gặp 31/8/2026: khách/admin nhập lá số khác hẳn vẫn bị báo "đã mua", không cho
 * mua tiếp, vì `getConfirmedToolOrderForUser` chỉ nhìn đơn MỚI NHẤT bất kể lá số nào).
 */
export function getAllConfirmedToolOrdersForUser(userId: string, toolSlug: string) {
  return boiLoiHeThong("getAllConfirmedToolOrdersForUser", "Có lỗi hệ thống, vui lòng thử lại sau.", async () => {
    return db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.toolSlug, toolSlug), eq(orders.status, "confirmed")))
      .orderBy(desc(orders.createdAt));
  });
}

/**
 * Đánh dấu đơn hàng đã thanh toán (gọi từ webhook SePay sau khi đối soát số tiền khớp) —
 * với đơn khóa học, tự động tạo lượt đăng ký (course_enrollments) và gửi email xác nhận.
 */
async function _markOrderPaidAndFulfillNoiBo(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status === "confirmed") return;

  await db.update(orders).set({ status: "confirmed", paidAt: new Date() }).where(eq(orders.id, orderId));

  // Trừ lượt mã khuyến mãi ở ĐÂY chứ không phải lúc tạo đơn: đơn khách xem QR rồi bỏ ngang sẽ
  // không đốt mất mã. Đổi lại, về lý thuyết 2 người cùng giữ lượt cuối có thể cùng thanh toán —
  // với mã tặng riêng từng người thì khả năng đó không đáng kể, còn mã chết oan thì rất phiền.
  let maKhuyenMaiDaDung: string | null = null;
  if (order.promoCodeId) {
    maKhuyenMaiDaDung = await apDungMaKhiThanhToan({
      promoCodeId: order.promoCodeId,
      orderId: order.id,
      orderCode: order.orderCode,
      soTienGiam: Number(order.promoDiscountAmount ?? 0),
      toolSlug: order.toolSlug ?? "",
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: Number(order.totalAmount),
    });
  }

  // Sổ doanh thu cho anh Công (Google Sheet "Khách hàng trả phí"). Ghi ở ĐÂY — thời điểm tiền
  // thực sự về — chứ không phải lúc tạo đơn, để sổ chỉ chứa doanh thu thật.
  //
  // Hiện chỉ ghi đơn CÔNG CỤ thu phí, đúng phạm vi anh Công yêu cầu. Muốn thống kê cả khóa học /
  // vật phẩm thì bỏ điều kiện orderType bên dưới và bổ sung tên hiển thị tương ứng.
  if (order.orderType === "tool") {
    // Đơn của TÀI KHOẢN QUẢN TRỊ là đơn kiểm thử 0đ — không được ghi vào sổ doanh thu, cũng
    // không gửi email báo cáo. Sổ chỉ được chứa doanh thu thật, nếu không mỗi lần anh Công test
    // là sổ lại phát sinh một dòng ảo phải đi dọn.
    let laDonKiemThu = false;
    if (order.userId) {
      const [nguoiDat] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, order.userId)).limit(1);
      laDonKiemThu = nguoiDat?.isAdmin === true;
    }

    const duocGiam = Number(order.promoDiscountAmount ?? 0);
    const thucThu = Number(order.totalAmount);
    const giaGoc = thucThu + duocGiam;
    const tenCongCu = TEN_CONG_CU_HIEN_THI[order.toolSlug ?? ""] ?? order.toolSlug ?? "";

    const daGhiSheet = laDonKiemThu ? true : await ghiDonThuPhiLenSheet({
      maDon: order.orderCode,
      toolSlug: order.toolSlug ?? "",
      hoTen: order.customerName,
      soDienThoai: order.customerPhone,
      email: order.customerEmail ?? "",
      // Giá gốc = số thực thu + phần đã giảm, nên đơn giảm giá vẫn thấy được giá niêm yết.
      giaGoc,
      maKhuyenMai: maKhuyenMaiDaDung ?? "",
      duocGiam,
      thucThu,
    });

    // Email báo cáo song song với Sheet (yêu cầu anh Công 2026-08-16). Sheet có thể ghi hụt mà
    // không ai biết; email là bản sao độc lập để đối chiếu, và khi Sheet lỗi thì email có cảnh
    // báo để anh nhập tay.
    const tien = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

    // Sim Phong Thủy Khai Vận Khí là DỊCH VỤ THỦ CÔNG (chuyên gia tự tay chọn sim, không có hàm
    // tính "kết quả" tự động) — nên toàn bộ chi tiết yêu cầu PHẢI có trong email báo cáo, đây là
    // nơi DUY NHẤT anh Công nhận được thông tin để đi tìm sim. Đọc lại `_chung.ts` cho các map nhãn.
    let dongChiTietSim: { nhan: string; giaTri: string }[] = [];
    if (order.toolSlug === "sim-phong-thuy-khai-van" && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as SimPhongThuyInput;
        const gioiTinhNhan = input.gioiTinh === "nam" ? "Nam" : "Nữ";
        const ngaySinhNhan = `${input.ngaySinh.day}/${input.ngaySinh.month}/${input.ngaySinh.year}`;
        const gioSinhNhan = input.gioSinh !== undefined ? `${input.gioSinh}h` : "Không nhớ";
        const mongMuonNhan = input.mongMuonTimSim === "khac" ? `Khác — ${input.mongMuonKhac ?? ""}` : NHAN_MONG_MUON[input.mongMuonTimSim];
        const banMenh = Scoring.getNapAm(input.ngaySinh.year);
        const banMenhNhan = `${banMenh.name} — ${banMenh.element}`;

        dongChiTietSim = [
          { nhan: "Giới tính", giaTri: gioiTinhNhan },
          { nhan: "Ngày sinh (dương lịch)", giaTri: ngaySinhNhan },
          { nhan: "Giờ sinh", giaTri: gioSinhNhan },
          { nhan: "Số CCCD", giaTri: input.soCCCD },
          { nhan: "Địa chỉ nhận sim", giaTri: input.diaChiNhanSim },
          { nhan: "Công việc hiện tại", giaTri: input.congViecHienTai },
          { nhan: "Mong muốn tìm sim", giaTri: mongMuonNhan },
          { nhan: "Mạng mong muốn", giaTri: NHAN_MANG[input.mangMongMuon] },
          { nhan: "Đầu số ưu tiên", giaTri: input.dauSoUuTien.join(", ") },
          { nhan: "Khoảng giá", giaTri: NHAN_KHOANG_GIA[input.khoangGia] },
          ...(input.yeuCauRieng ? [{ nhan: "Yêu cầu riêng", giaTri: input.yeuCauRieng }] : []),
        ];

        // Sheet RIÊNG cho module này (anh Công yêu cầu 2026-08-23) — bỏ qua đơn kiểm thử admin,
        // cùng nguyên tắc với sheet "Khách hàng trả phí" (chỉ chứa doanh thu thật).
        if (!laDonKiemThu) {
          await ghiDonSimPhongThuyLenSheet({
            maDon: order.orderCode,
            hoTen: order.customerName,
            soDienThoaiZalo: order.customerPhone,
            gioiTinh: gioiTinhNhan,
            ngaySinh: ngaySinhNhan,
            gioSinh: gioSinhNhan,
            banMenh: banMenhNhan,
            soCCCD: input.soCCCD,
            diaChiNhanSim: input.diaChiNhanSim,
            congViecHienTai: input.congViecHienTai,
            mongMuonTimSim: mongMuonNhan,
            mangMongMuon: NHAN_MANG[input.mangMongMuon],
            dauSoUuTien: input.dauSoUuTien.join(", "),
            khoangGia: NHAN_KHOANG_GIA[input.khoangGia],
            yeuCauRieng: input.yeuCauRieng ?? "",
            giaGoc: Number(order.totalAmount) + Number(order.promoDiscountAmount ?? 0),
            maKhuyenMai: maKhuyenMaiDaDung ?? "",
            duocGiam: Number(order.promoDiscountAmount ?? 0),
            thucThu: Number(order.totalAmount),
          });
        }
      } catch (err) {
        console.error(`[sim-phong-thuy] Không đọc được chi tiết đơn ${order.orderCode}:`, err);
      }
    }

    if (!laDonKiemThu) await sendBaoCaoGoogleSheetEmail({
      loai: "Đơn thu phí",
      tomTat: `${tenCongCu} — ${order.customerName} — ${tien(thucThu)}`,
      dong: [
        { nhan: "Mã đơn", giaTri: order.orderCode },
        { nhan: "Công cụ", giaTri: tenCongCu },
        { nhan: "Họ tên", giaTri: order.customerName },
        { nhan: "Số điện thoại", giaTri: order.customerPhone },
        ...(order.customerEmail ? [{ nhan: "Email", giaTri: order.customerEmail }] : []),
        { nhan: "Giá gốc", giaTri: tien(giaGoc) },
        ...(maKhuyenMaiDaDung
          ? [
              { nhan: "Mã khuyến mãi", giaTri: maKhuyenMaiDaDung },
              { nhan: "Được giảm", giaTri: tien(duocGiam) },
            ]
          : []),
        { nhan: "Thực thu", giaTri: tien(thucThu) },
        ...dongChiTietSim,
      ],
      sheetLoi: !daGhiSheet,
    });

    // Gửi hồ sơ PDF tang lễ kèm email. Đặt ở ĐÂY vì hàm này chỉ chạy đúng một lần cho mỗi đơn
    // (đã chặn bởi `order.status === "confirmed"` ở đầu hàm) — nếu gửi từ endpoint `result.ts`
    // thì trang kết quả poll 3 giây/lần sẽ bắn ra hàng loạt email trùng.
    //
    // Bọc try/catch riêng: dựng PDF nặng hơn hẳn gửi email thường, và webhook SePay phải trả 200
    // trong 30s. Hỏng khâu này thì đơn vẫn phải được ghi nhận là đã thanh toán — khách vẫn tải
    // được hồ sơ từ trang kết quả nên không mất thứ đã mua.
    if (order.toolSlug === "gio-liem-ha-huyet" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const dauVao = JSON.parse(order.toolInputSnapshot) as DauVaoHoSo;
        const hoSo = await taoHoSoTangLe(dauVao);
        if (hoSo.taoDuoc) {
          await sendHoSoTangLeEmail({
            to: order.customerEmail,
            orderCode: order.orderCode,
            customerName: order.customerName,
            hoTenNguoiMat: dauVao.hoTenNguoiMat ?? null,
            pdfBytes: hoSo.pdf,
          });
        } else {
          // Kết cục C lẽ ra đã bị chặn TRƯỚC trang thanh toán, nên tới đây là bất thường —
          // log để còn lần ra, chứ không im lặng bỏ qua.
          console.error(`[ho-so-tang-le] Đơn ${order.orderCode} không dựng được hồ sơ: ${hoSo.lyDo}`);
        }
      } catch (err) {
        console.error(`[ho-so-tang-le] Lỗi dựng/gửi hồ sơ cho đơn ${order.orderCode}:`, err);
      }
    }

    // Định Hướng Nghề Nghiệp: dựng PDF (gọi AI luận Bát Tự nếu có key — cache theo hash lá số) rồi
    // gửi kèm email khách. Bọc try/catch riêng: dựng PDF/gọi AI nặng, hỏng khâu này thì đơn vẫn
    // được ghi nhận đã thanh toán, khách còn xem/tải lại được từ trang kết quả bằng mã đơn.
    if (order.toolSlug === "dinh-huong-nghe-nghiep" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as NgheInput;
        const ketQua = await taoHoSoNghe(input);
        const pdf = await generateNghePdf(ketQua, order.customerName);
        await sendNghePdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[dinh-huong-nghe] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Trạch Nhật Sinh Nở: thuần công thức (không AI) — dựng PDF rồi gửi kèm email khách. Bọc
    // try/catch riêng cùng lý do các module khác: hỏng khâu này đơn vẫn ghi nhận đã thanh toán,
    // khách còn xem/tải lại từ trang kết quả bằng mã đơn.
    if (order.toolSlug === "trach-nhat-sinh-no" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as BirthSelectionInput;
        const ketQua = phanTichTrachNhatSinhNo(input);
        const pdf = await generateTrachNhatSinhNoPdf(ketQua, order.customerName);
        await sendTrachNhatSinhNoPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[trach-nhat-sinh-no] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Trạch Nhật Sinh Nở — bản ĐỘC LẬP cho app Quân Sư (toolSlug `trach-nhat-sinh-no-qs`, từ
    // 1/9/2026). Tái dùng đúng engine/PDF/email đã import ở trên cho bản web — chỉ khác toolSlug
    // để tách bạch thống kê.
    if (order.toolSlug === "trach-nhat-sinh-no-qs" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as BirthSelectionInput;
        const ketQua = phanTichTrachNhatSinhNo(input);
        const pdf = await generateTrachNhatSinhNoPdf(ketQua, order.customerName);
        await sendTrachNhatSinhNoPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[trach-nhat-sinh-no-qs] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Hợp Hôn Bát Tự × Tử Vi: thuần công thức (không AI) — dựng PDF rồi gửi kèm email khách. Bọc
    // try/catch riêng cùng lý do các module khác: hỏng khâu này đơn vẫn ghi nhận đã thanh toán,
    // khách còn xem lại kết quả trên trang bằng mã đơn.
    if (order.toolSlug === "hop-hon" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as DauVaoHopHon;
        const ketQua = tinhHopHon(input);
        const pdf = await generateHopHonPdf(ketQua, order.customerName);
        await sendHopHonPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[hop-hon] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Hợp Hôn — bản ĐỘC LẬP cho app Quân Sư (toolSlug `hop-hon-qs`, từ 1/9/2026). Tái dùng đúng
    // engine/PDF/email đã import ở trên cho bản web — chỉ khác toolSlug để tách bạch thống kê.
    if (order.toolSlug === "hop-hon-qs" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as DauVaoHopHon;
        const ketQua = tinhHopHon(input);
        const pdf = await generateHopHonPdf(ketQua, order.customerName);
        await sendHopHonPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[hop-hon-qs] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Kỳ Môn Mệnh (chi tiết): thuần công thức (không AI) — dựng PDF rồi gửi kèm email
    // khách. Bọc try/catch riêng cùng lý do các module khác: hỏng khâu này đơn vẫn ghi nhận đã
    // thanh toán, khách còn xem lại kết quả trên trang bằng mã đơn.
    if (order.toolSlug === "ky-mon-menh-chi-tiet" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as { nam: number; thang: number; ngay: number; gio: number; phut: number };
        // PHẢI await: trên nhánh Cloudflare lapLaBan() là async (đọc km_data qua Static Assets vì
        // Worker không có filesystem). Thiếu await thì luanGiaiMenh() nhận vào Promise, ném lỗi,
        // bị try/catch nuốt mất → khách trả tiền mà không bao giờ nhận được email PDF.
        const laBan = await lapLaBan({ cheDo: "menh", ...input });
        const free = luanGiaiMenh(laBan);
        const chiTiet = luanGiaiMenhChiTiet(laBan);
        const pdf = await generateKyMonMenhPdf(free, chiTiet, order.customerName);
        await sendKyMonMenhPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[ky-mon-menh-chi-tiet] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Kỳ Môn Mệnh (chi tiết) — bản ĐỘC LẬP cho app Quân Sư (toolSlug
    // `ky-mon-menh-chi-tiet-qs`, từ 1/9/2026). Tái dùng đúng engine/PDF/email đã import ở trên cho
    // bản web — chỉ khác toolSlug để tách bạch thống kê.
    if (order.toolSlug === "ky-mon-menh-chi-tiet-qs" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as { nam: number; thang: number; ngay: number; gio: number; phut: number };
        const laBan = await lapLaBan({ cheDo: "menh", ...input });
        const free = luanGiaiMenh(laBan);
        const chiTiet = luanGiaiMenhChiTiet(laBan);
        const pdf = await generateKyMonMenhPdf(free, chiTiet, order.customerName);
        await sendKyMonMenhPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[ky-mon-menh-chi-tiet-qs] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Bát Tự Toàn Diện — Cơ Bản: gọi AI dựng báo cáo rồi xuất PDF gửi kèm email khách.
    // Bọc try/catch riêng cùng lý do các module khác: hỏng khâu này đơn vẫn ghi nhận đã thanh toán,
    // khách còn xem lại trên trang kết quả (báo cáo tính lại/lấy từ cache theo hash lá số).
    if (order.toolSlug === "luan-giai-bat-tu-co-ban" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as BatTuInput;
        const baoCao = await taoBaoCaoCoBanChiTinh1Lan(input);
        const pdf = await generateBatTuCoBanPdf(baoCao, order.customerName);
        await sendBatTuToanDienCoBanPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[luan-giai-bat-tu-co-ban] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Bát Tự Toàn Diện — Nâng Cao: cùng logic như Cơ Bản ở trên.
    // ⚠️ 2 nhánh Cơ Bản/Nâng Cao ở trên KHÔNG còn tạo được đơn mới từ 1/9/2026 (checkout chỉ tạo
    // slug "luan-giai-bat-tu-toan-dien" ở nhánh dưới) — giữ lại 2 nhánh này CHỈ để không vỡ nếu có
    // đơn cũ đang chờ webhook xác nhận đúng lúc chuyển đổi, không xoá vì vô hại.
    if (order.toolSlug === "luan-giai-bat-tu-nang-cao" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as BatTuInput;
        const baoCao = await taoBaoCaoNangCaoChiTinh1Lan(input);
        const pdf = await generateBatTuNangCaoPdf(baoCao, order.customerName);
        await sendBatTuToanDienNangCaoPdfEmail({
          to: order.customerEmail,
          orderCode: order.orderCode,
          customerName: order.customerName,
          pdfBytes: pdf,
        });
      } catch (err) {
        console.error(`[luan-giai-bat-tu-nang-cao] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Bát Tự Toàn Diện — gói duy nhất 700k (1/9/2026, thay 2 tầng Cơ Bản/Nâng Cao ở
    // trên): tính đủ 12 giai đoạn (2 hàm chạy song song, độc lập nhau), gộp 1 PDF, gửi 1 email.
    //
    // ⚠️ Mỗi giai đoạn tự gọi AI RIÊNG và ĐỘC LẬP (taoNoiDungGiaiDoanAnToan trả null nếu lỗi, orchestrator
    // lọc bỏ null) — khác Tử Vi (fail 1 bước là chặn hẳn cả báo cáo), Bát Tự có thể "thành công" mà
    // THIẾU MẤT 1-2 GIAI ĐOẠN nếu đúng giai đoạn đó lỗi cả 2 lần thử (goiAiToolUseVoiRetry) — báo cáo
    // vẫn coi là hopLe, PDF vẫn dựng, mail vẫn gửi, nhưng khách nhận bản THIẾU mà không ai biết. Anh
    // Công báo lỗi thật 1/9/2026 ("thấy ngắn quá"). Chặn theo đúng đủ số giai đoạn trước khi gửi —
    // giống hệt cách Tử Vi đang an toàn (không gửi bản thiếu, khách bấm "Tải PDF" thử lại được).
    if (order.toolSlug === "luan-giai-bat-tu-toan-dien" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as BatTuInput;
        const [baoCaoCoBan, baoCaoNangCao] = await Promise.all([taoBaoCaoCoBanChiTinh1Lan(input), taoBaoCaoNangCaoChiTinh1Lan(input)]);
        const thieuCoBan = GIAI_DOAN_CO_BAN.length - baoCaoCoBan.giaiDoan.length;
        const thieuNangCao = GIAI_DOAN_NANG_CAO.length - baoCaoNangCao.giaiDoan.length;
        if (thieuCoBan > 0 || thieuNangCao > 0) {
          const coDay = new Set(baoCaoCoBan.giaiDoan.map((g) => g.ma));
          const ncDay = new Set(baoCaoNangCao.giaiDoan.map((g) => g.ma));
          const thieuMa = [
            ...GIAI_DOAN_CO_BAN.filter((c) => !coDay.has(c.ma)).map((c) => c.ma),
            ...GIAI_DOAN_NANG_CAO.filter((c) => !ncDay.has(c.ma)).map((c) => c.ma),
          ];
          console.error(`[luan-giai-bat-tu-toan-dien] Đơn ${order.orderCode} THIẾU giai đoạn ${thieuMa.join(", ")} (đủ ${GIAI_DOAN_CO_BAN.length + GIAI_DOAN_NANG_CAO.length}, chỉ có ${baoCaoCoBan.giaiDoan.length + baoCaoNangCao.giaiDoan.length}) — KHÔNG gửi bản thiếu, chờ tính lại.`);
        } else {
          // 1/9/2026: lưu vào ĐÚNG cache mà trang kết quả/tai-pdf.ts đọc (hashLaSo) — để khách quay
          // lại trang sau khi thanh toán thấy ngay bản luận giải trên web (không chỉ nằm trong PDF
          // gửi email), không tính lại tốn thêm 1 lượt AI nữa (xem ghi chú ở .astro + result.ts).
          const key = hashLaSo(input);
          cacheCoBan.set(key, baoCaoCoBan);
          cacheNangCao.set(key, baoCaoNangCao);

          const pdf = await generateBatTuToanDienPdf(baoCaoCoBan, baoCaoNangCao, order.customerName);
          await sendBatTuToanDienPdfEmail({
            to: order.customerEmail,
            orderCode: order.orderCode,
            customerName: order.customerName,
            pdfBytes: pdf,
          });
        }
      } catch (err) {
        console.error(`[luan-giai-bat-tu-toan-dien] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Tử Vi — Cơ Bản: gọi AI dựng luận giải đủ 12 cung rồi xuất PDF gửi kèm email khách.
    // Cùng lý do bọc try/catch: hỏng khâu này đơn vẫn ghi nhận đã thanh toán, khách xem lại được
    // trên trang (admin) hoặc chờ email (khách thường) — kết quả tính lại/lấy từ cache theo hash lá số.
    if (order.toolSlug === "luan-giai-tu-vi-co-ban" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as Omit<LuanGiaiTuViInput, "goi">;
        const kq = await taoLuanGiaiTuVi({ ...input, goi: "co_ban" });
        if (kq.hopLe && kq.coBan && kq.duLieu) {
          const pdf = await generateTuViCoBanPdf(kq.coBan, kq.duLieu, order.customerName);
          await sendLuanGiaiTuViCoBanPdfEmail({
            to: order.customerEmail,
            orderCode: order.orderCode,
            customerName: order.customerName,
            pdfBytes: pdf,
          });
        } else {
          console.error(`[luan-giai-tu-vi-co-ban] Không tính được luận giải cho đơn ${order.orderCode}: ${kq.loi ?? "AI chưa trả kết quả"}`);
        }
      } catch (err) {
        console.error(`[luan-giai-tu-vi-co-ban] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Tử Vi — Nâng Cao: taoLuanGiaiTuVi() tự đảm bảo Cơ Bản đã tính (cache hoặc gọi mới)
    // trước khi ghép Nâng Cao — PDF xuất ra là "Cơ Bản đầy đủ + Nâng Cao nối tiếp" trong 1 file.
    // ⚠️ Nhánh này KHÔNG còn tạo được đơn mới từ 1/9/2026 (checkout chỉ tạo slug "…-toan-dien" ở
    // dưới) — giữ lại chỉ để không vỡ nếu có đơn cũ đang chờ webhook xác nhận đúng lúc chuyển đổi.
    if (order.toolSlug === "luan-giai-tu-vi-nang-cao" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as Omit<LuanGiaiTuViInput, "goi">;
        const kq = await taoLuanGiaiTuVi({ ...input, goi: "nang_cao" });
        if (kq.hopLe && kq.coBan && kq.nangCao && kq.duLieu) {
          const pdf = await generateTuViNangCaoPdf(kq.coBan, kq.nangCao, kq.duLieu, order.customerName);
          await sendLuanGiaiTuViNangCaoPdfEmail({
            to: order.customerEmail,
            orderCode: order.orderCode,
            customerName: order.customerName,
            pdfBytes: pdf,
          });
        } else {
          console.error(`[luan-giai-tu-vi-nang-cao] Không tính được luận giải cho đơn ${order.orderCode}: ${kq.loi ?? "AI chưa trả kết quả"}`);
        }
      } catch (err) {
        console.error(`[luan-giai-tu-vi-nang-cao] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }

    // Luận Giải Tử Vi — gói duy nhất 500k (1/9/2026, thay 2 tầng Cơ Bản/Nâng Cao ở trên): luôn tính
    // "nang_cao" vì taoLuanGiaiTuVi() đã tự ghép sẵn Cơ Bản + Nâng Cao trong kết quả đó.
    if (order.toolSlug === "luan-giai-tu-vi-toan-dien" && order.customerEmail && order.toolInputSnapshot) {
      try {
        const input = JSON.parse(order.toolInputSnapshot) as Omit<LuanGiaiTuViInput, "goi">;
        const kq = await taoLuanGiaiTuVi({ ...input, goi: "nang_cao" });
        if (kq.hopLe && kq.coBan && kq.nangCao && kq.duLieu) {
          const pdf = await generateTuViNangCaoPdf(kq.coBan, kq.nangCao, kq.duLieu, order.customerName);
          await sendLuanGiaiTuViToanDienPdfEmail({
            to: order.customerEmail,
            orderCode: order.orderCode,
            customerName: order.customerName,
            pdfBytes: pdf,
          });
        } else {
          console.error(`[luan-giai-tu-vi-toan-dien] Không tính được luận giải cho đơn ${order.orderCode}: ${kq.loi ?? "AI chưa trả kết quả"}`);
        }
      } catch (err) {
        console.error(`[luan-giai-tu-vi-toan-dien] Lỗi dựng/gửi PDF cho đơn ${order.orderCode}:`, err);
      }
    }
  }

  if (order.orderType === "subscription" && order.userId && order.toolInputSnapshot) {
    try {
      const { tier, duration } = JSON.parse(order.toolInputSnapshot) as {
        tier: SubscriptionTier;
        duration: SubscriptionDuration;
      };
      const soThang = SO_THANG_THEO_KY_HAN[duration];

      // Còn gói ACTIVE chưa hết hạn → GIA HẠN từ ngày hết hạn hiện tại (mua sớm không mất ngày còn
      // lại), không tạo dòng mới. Hết hạn hoặc chưa từng mua → tạo dòng mới tính từ hôm nay.
      // Đơn giản hoá: hạng mới LUÔN ghi đè hạng cũ (đúng với "mua Cao cấp" khi đang có Cơ bản —
      // nâng hạng ngay; nếu Thầy cần logic không-hạ-hạng phức tạp hơn thì bổ sung sau).
      const [active] = await db
        .select({ id: subscriptions.id, expiresAt: subscriptions.expiresAt })
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, order.userId), eq(subscriptions.status, "active")))
        .limit(1);

      const now = new Date();
      const baseDate = active && active.expiresAt > now ? active.expiresAt : now;
      const expiresAt = new Date(baseDate);
      expiresAt.setMonth(expiresAt.getMonth() + soThang);

      if (active) {
        // isTrial: false — dù dòng active cũ đang là gói dùng thử, mua thật thì hết còn là dùng thử.
        await db.update(subscriptions).set({ tier, duration, expiresAt, orderId: order.id, isTrial: false }).where(eq(subscriptions.id, active.id));
      } else {
        await db.insert(subscriptions).values({ userId: order.userId, tier, duration, expiresAt, orderId: order.id, isTrial: false });
      }
    } catch (err) {
      console.error(`[subscription] Lỗi kích hoạt gói cho đơn ${order.orderCode}:`, err);
    }
    return;
  }

  if (order.orderType === "course" && order.courseRef && order.userId) {
    await db.insert(courseEnrollments).values({
      userId: order.userId,
      courseRef: order.courseRef,
      source: "online_purchase",
      orderId: order.id,
    });

    const course = await getCourseBySlug(order.courseRef);
    if (course && order.customerEmail) {
      await sendCourseOrderConfirmedEmail({
        to: order.customerEmail,
        orderCode: order.orderCode,
        customerName: order.customerName,
        courseName: course.name,
        courseSlug: course.slug,
        totalAmount: Number(order.totalAmount),
      });
    }
    return;
  }

  if (order.orderType === "product" && order.customerEmail) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    await sendProductOrderConfirmedEmail({
      to: order.customerEmail,
      orderCode: order.orderCode,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      items: items.map((i) => ({ name: i.productNameSnapshot, qty: i.quantity, price: Number(i.unitPriceSnapshot) })),
      shippingAddress: order.shippingAddress ?? "",
    });
  }
}

/** Đánh dấu đơn đã thanh toán + fulfill — bọc lỗi hệ thống (DB...) không cho lộ chi tiết ra client
 * (route webhook/checkout gọi hàm này trong try/catch của chúng). Các bước gửi email/PDF con bên
 * trong ĐÃ tự bọc try/catch riêng từ trước (không rethrow), không bị ảnh hưởng bởi lớp bọc này. */
export function markOrderPaidAndFulfill(orderId: string) {
  return boiLoiHeThong("markOrderPaidAndFulfill", "Có lỗi hệ thống khi xác nhận đơn hàng, vui lòng liên hệ hỗ trợ.", () =>
    _markOrderPaidAndFulfillNoiBo(orderId)
  );
}

export function getOrderById(orderId: string) {
  return boiLoiHeThong("getOrderById", "Có lỗi hệ thống, vui lòng thử lại sau.", async () => {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return order ?? null;
  });
}
