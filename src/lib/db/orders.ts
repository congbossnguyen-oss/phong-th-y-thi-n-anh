import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { orders, orderItems, courseEnrollments, users } from "../../../db/schema";
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
} from "../email/send";
import { taoHoSoTangLe, type DauVaoHoSo } from "../dai-cat-loi/tao-ho-so-tang-le";
import { taoHoSoNghe, type NgheInput } from "../nghe-nghiep/tao-ho-so-nghe";
import { generateNghePdf } from "../dai-cat-loi/nghe-nghiep-pdf";
import { phanTichTrachNhatSinhNo, type BirthSelectionInput } from "../trach-nhat-sinh-no";
import { generateTrachNhatSinhNoPdf } from "../dai-cat-loi/trach-nhat-sinh-no-pdf";
import { apDungMaKhiThanhToan } from "../payments/promo";
import { ghiDonThuPhiLenSheet, TEN_CONG_CU_HIEN_THI } from "../google-sheets-don-thu-phi";
import { ghiDonSimPhongThuyLenSheet } from "../google-sheets-sim-phong-thuy";
import { NHAN_MONG_MUON, NHAN_MANG, NHAN_KHOANG_GIA, type SimPhongThuyInput } from "../sim-phong-thuy-khai-van/labels";
import { Scoring } from "@thien-anh/rule-engine";

export interface CartLine {
  slug: string;
  qty: number;
}

/**
 * Tạo đơn hàng vật phẩm — giá luôn lấy từ nguồn dữ liệu server (placeholder-data, sau này là
 * Sanity), KHÔNG bao giờ tin giá client gửi lên, để tránh khách hàng sửa giá qua devtools.
 */
export async function createProductOrder(params: {
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
    throw new Error("Giỏ hàng không hợp lệ hoặc trống.");
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

/**
 * Tạo đơn hàng khóa học online — mỗi đơn ứng với đúng 1 khóa học, bắt buộc đăng nhập.
 */
export async function createCourseOrder(params: {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  courseSlug: string;
}) {
  const courseData = await getCourseBySlug(params.courseSlug);
  const course = courseData && courseData.format === "online" ? courseData : null;
  if (!course) {
    throw new Error("Khóa học không hợp lệ.");
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

/**
 * Tạo đơn hàng công cụ trả phí (vd "gio-liem-ha-huyet"). Có công cụ bắt đăng nhập, có công cụ
 * không (xem chú thích ở `userId`). `toolInput` lưu nguyên object input đã validate được
 * (JSON.stringify) để sau khi thanh toán xong, tầng API tính lại kết quả từ chính input này —
 * không lưu sẵn kết quả để tránh lệch dữ liệu nếu công thức tính được sửa sau khi đơn đã tạo.
 */
export async function createToolOrder(params: {
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

export async function getOrderByCode(orderCode: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).limit(1);
  return order ?? null;
}

/**
 * Đánh dấu đơn hàng đã thanh toán (gọi từ webhook SePay sau khi đối soát số tiền khớp) —
 * với đơn khóa học, tự động tạo lượt đăng ký (course_enrollments) và gửi email xác nhận.
 */
export async function markOrderPaidAndFulfill(orderId: string) {
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

export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}
