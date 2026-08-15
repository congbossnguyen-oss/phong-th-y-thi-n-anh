/**
 * Apps Script gắn vào Google Sheet "Khách hàng trả phí - Phong Thủy Thiên Anh".
 *
 * Đây là sheet THỨ BA, độc lập với 2 sheet kia (đăng ký tư vấn, mã khuyến mãi) — mỗi sheet có
 * Apps Script riêng, URL riêng, SECRET_TOKEN riêng.
 *
 * Sheet này có 2 tab, script tự tạo nếu chưa có:
 *   • "Đơn đã thanh toán" — mỗi đơn thu phí được thanh toán thì tự thêm 1 dòng.
 *   • "Tổng hợp"          — bảng tự tính doanh thu theo công cụ và theo tháng.
 *
 * ⚠️ CỘT "Ghi chú" ở tab "Đơn đã thanh toán" là cột anh tự gõ. Script chỉ THÊM dòng mới
 * (appendRow), không bao giờ ghi đè dòng cũ, nên ghi chú của anh luôn an toàn.
 *
 * CÁCH CÀI ĐẶT:
 * 1. Mở Sheet "Khách hàng trả phí - Phong Thủy Thiên Anh" (đã tạo sẵn trong thư mục
 *    PHONG THỦY THIÊN ANH trên Drive).
 * 2. Extensions (Tiện ích mở rộng) → Apps Script.
 * 3. Xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 4. Đổi SECRET_TOKEN bên dưới thành 1 chuỗi bí mật tự đặt — KHÁC token của 2 sheet kia.
 * 5. Ctrl+S để lưu.
 * 6. "Deploy" → "New deployment" → loại "Web app":
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  (an toàn vì đã có SECRET_TOKEN chặn request giả mạo)
 *    - Bấm Deploy, chấp nhận khi Google hỏi quyền.
 * 7. Copy URL Web App rồi gửi lại cho Claude kèm SECRET_TOKEN.
 *
 * LƯU Ý: mỗi lần sửa code này phải "Deploy" → "Manage deployments" → bút chì → chọn version mới
 * → "Deploy" lại thì thay đổi mới có hiệu lực (chỉ Ctrl+S là chưa đủ).
 */

const SECRET_TOKEN = "ĐỔI_CHUỖI_NÀY_THÀNH_MẬT_KHẨU_BÍ_MẬT_CỦA_ANH";

const TAB_DON = "Đơn đã thanh toán";
const TAB_TONG_HOP = "Tổng hợp";

const COT_DON = [
  "Thời điểm thanh toán",
  "Mã đơn",
  "Công cụ",
  "Họ tên",
  "Số điện thoại",
  "Email",
  "Giá gốc",
  "Mã khuyến mãi",
  "Được giảm",
  "Thực thu",
  "Ghi chú", // ← cột anh tự gõ, script không bao giờ ghi đè
];

function layTab(ten, cotTieuDe) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ten);

  // Sheet được tạo bằng import CSV nên tab đầu mang tên mặc định của Google. Nếu chưa có tab đúng
  // tên mà cả bảng tính mới chỉ có 1 tab thì đổi tên nó, tránh dữ liệu nằm mồ côi ở tab cũ.
  if (!sheet && ten === TAB_DON && ss.getSheets().length === 1) {
    sheet = ss.getSheets()[0].setName(ten);
  }
  if (!sheet) sheet = ss.insertSheet(ten);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cotTieuDe);
    sheet.getRange(1, 1, 1, cotTieuDe.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function gioVN() {
  return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
}

/** Thêm 1 dòng khi có đơn được thanh toán. */
function ghiDon(d) {
  const sheet = layTab(TAB_DON, COT_DON);

  // Chống ghi trùng: nếu mã đơn đã có trong sheet thì bỏ qua. Cần thiết vì webhook SePay có thể
  // gửi lại tối đa 7 lần trong 5 giờ nếu lần đầu lỗi.
  const soDong = sheet.getLastRow();
  if (soDong > 1) {
    const maDaCo = sheet.getRange(2, 2, soDong - 1, 1).getValues().map(function (r) {
      return String(r[0] || "").trim();
    });
    if (maDaCo.indexOf(String(d.maDon || "").trim()) !== -1) {
      return { ok: true, boQua: "Mã đơn đã có trong sheet" };
    }
  }

  sheet.appendRow([
    d.thoiDiem || gioVN(),
    d.maDon || "",
    d.congCu || "",
    d.hoTen || "",
    // Ép về chuỗi để Sheet không cắt mất số 0 đứng đầu của số điện thoại.
    d.soDienThoai ? "'" + d.soDienThoai : "",
    d.email || "",
    Number(d.giaGoc || 0),
    d.maKhuyenMai || "",
    Number(d.duocGiam || 0),
    Number(d.thucThu || 0),
    "",
  ]);
  sheet.autoResizeColumns(1, COT_DON.length);
  capNhatTongHop();
  return { ok: true };
}

/**
 * Dựng lại tab "Tổng hợp" bằng CÔNG THỨC (không phải số cứng), để anh sửa tay ở tab đơn thì
 * tổng hợp tự cập nhật theo, không cần chạy lại script.
 */
function capNhatTongHop() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TAB_TONG_HOP);
  if (!sheet) sheet = ss.insertSheet(TAB_TONG_HOP);
  sheet.clear();

  const q = "'" + TAB_DON + "'";
  sheet.getRange("A1").setValue("TỔNG QUAN").setFontWeight("bold");
  sheet.getRange("A2").setValue("Tổng số đơn");
  sheet.getRange("B2").setFormula("=COUNTA(" + q + "!B2:B)");
  sheet.getRange("A3").setValue("Tổng thực thu");
  sheet.getRange("B3").setFormula("=SUM(" + q + "!J2:J)");
  sheet.getRange("A4").setValue("Tổng đã giảm giá");
  sheet.getRange("B4").setFormula("=SUM(" + q + "!I2:I)");
  sheet.getRange("A5").setValue("Số đơn dùng mã khuyến mãi");
  sheet.getRange("B5").setFormula("=COUNTIF(" + q + "!H2:H,\"<>\")");

  sheet.getRange("A7").setValue("DOANH THU THEO CÔNG CỤ").setFontWeight("bold");
  sheet.getRange("A8").setFormula(
    "=QUERY(" + q + "!C2:J, \"select C, count(C), sum(J) where C is not null group by C label count(C) 'Số đơn', sum(J) 'Thực thu'\", 0)"
  );

  sheet.getRange("A14").setValue("DOANH THU THEO THÁNG").setFontWeight("bold");
  // Cột A của tab đơn là chuỗi "dd/MM/yyyy HH:mm:ss" → cắt 7 ký tự cuối của phần ngày để ra MM/yyyy.
  sheet.getRange("A15").setFormula(
    "=QUERY({ARRAYFORMULA(IF(" + q + "!A2:A=\"\",,MID(" + q + "!A2:A,4,7))), " + q + "!J2:J}, \"select Col1, count(Col1), sum(Col2) where Col1 is not null group by Col1 order by Col1 desc label count(Col1) 'Số đơn', sum(Col2) 'Thực thu'\", 0)"
  );

  sheet.autoResizeColumns(1, 4);
}

function traLoi(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET_TOKEN) {
      return traLoi({ ok: false, error: "Sai secret token" });
    }
    if (body.hanhDong === "ghi_don") {
      return traLoi(ghiDon(body.don || {}));
    }
    if (body.hanhDong === "dong_bo_lai") {
      // Nạp lại toàn bộ từ CSDL: xoá sạch dòng cũ rồi ghi lại. Cột "Ghi chú" của anh sẽ mất, nên
      // chỉ dùng khi thật sự cần dựng lại sheet từ đầu.
      const sheet = layTab(TAB_DON, COT_DON);
      const soDong = sheet.getLastRow();
      if (soDong > 1) sheet.getRange(2, 1, soDong - 1, COT_DON.length).clearContent();
      const ds = body.danhSach || [];
      for (let i = 0; i < ds.length; i++) ghiDon(ds[i]);
      return traLoi({ ok: true, soDong: ds.length });
    }
    return traLoi({ ok: false, error: "Hành động không hợp lệ: " + body.hanhDong });
  } catch (err) {
    return traLoi({ ok: false, error: String(err) });
  }
}
