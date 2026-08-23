/**
 * Apps Script gắn vào Google Sheet "Sim Phong Thủy Khai Vận Khí - Đơn đăng ký - Phong Thủy Thiên Anh".
 *
 * Sheet RIÊNG cho module Sim Phong Thủy Khai Vận Khí (khác sheet "Khách hàng trả phí" dùng chung
 * cho các công cụ VIP khác) — anh Công yêu cầu 2026-08-23, vì dịch vụ này là THỦ CÔNG (chuyên gia
 * tự tìm sim), cần đủ chi tiết (CCCD, ngày giờ sinh, mong muốn, mạng, đầu số, khoảng giá...) ngay
 * trên Sheet để tra cứu nhanh, không phải mở email từng đơn.
 *
 * Sheet chỉ có 1 tab "Đơn đăng ký" — mỗi đơn thu phí được thanh toán thì tự thêm 1 dòng.
 *
 * ⚠️ CỘT "Ghi chú" là cột anh tự gõ. Script chỉ THÊM dòng mới (appendRow), không bao giờ ghi đè
 * dòng cũ, nên ghi chú của anh luôn an toàn.
 *
 * CÁCH CÀI ĐẶT (giống 3 sheet trước — consultation / promo / đơn thu phí):
 * 1. Vào script.google.com → "Dự án mới".
 * 2. Xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 3. Đổi SECRET_TOKEN bên dưới thành 1 chuỗi bí mật tự đặt — KHÁC token của các sheet kia.
 * 4. SHEET_ID bên dưới đã điền sẵn đúng id của Sheet mới (Claude tạo sẵn).
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

/** Id của Sheet "Sim Phong Thủy Khai Vận Khí - Đơn đăng ký - Phong Thủy Thiên Anh". */
const SHEET_ID = "1aSH-Pyrl4wT2922ItQhh-W-HmSvqwJx81d--e_DDaZE";

const TAB_DON = "Đơn đăng ký";

const COT_DON = [
  "Thời điểm thanh toán",
  "Mã đơn",
  "Họ tên",
  "SĐT/Zalo",
  "Giới tính",
  "Ngày sinh",
  "Giờ sinh",
  "Bản mệnh",
  "Số CCCD",
  "Địa chỉ nhận sim",
  "Công việc hiện tại",
  "Mong muốn tìm sim",
  "Mạng mong muốn",
  "Đầu số ưu tiên",
  "Khoảng giá",
  "Yêu cầu riêng",
  "Giá gốc",
  "Mã khuyến mãi",
  "Được giảm",
  "Thực thu",
  "Ghi chú", // ← cột anh tự gõ, script không bao giờ ghi đè
];

function layTab(ten, cotTieuDe) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(ten);

  // Sheet được Claude tạo bằng import CSV nên tab đầu mang tên mặc định của Google (vd "Sheet1").
  // Nếu chưa có tab đúng tên mà cả bảng tính mới chỉ có 1 tab thì đổi tên nó.
  if (!sheet && ss.getSheets().length === 1) {
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
    d.hoTen || "",
    // Ép về chuỗi để Sheet không cắt mất số 0 đứng đầu của số điện thoại.
    d.soDienThoaiZalo ? "'" + d.soDienThoaiZalo : "",
    d.gioiTinh || "",
    d.ngaySinh || "",
    d.gioSinh || "",
    d.banMenh || "",
    d.soCCCD ? "'" + d.soCCCD : "",
    d.diaChiNhanSim || "",
    d.congViecHienTai || "",
    d.mongMuonTimSim || "",
    d.mangMongMuon || "",
    d.dauSoUuTien || "",
    d.khoangGia || "",
    d.yeuCauRieng || "",
    Number(d.giaGoc || 0),
    d.maKhuyenMai || "",
    Number(d.duocGiam || 0),
    Number(d.thucThu || 0),
    "",
  ]);
  sheet.autoResizeColumns(1, COT_DON.length);
  return { ok: true };
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
    return traLoi({ ok: false, error: "Hành động không hợp lệ: " + body.hanhDong });
  } catch (err) {
    return traLoi({ ok: false, error: String(err) });
  }
}
