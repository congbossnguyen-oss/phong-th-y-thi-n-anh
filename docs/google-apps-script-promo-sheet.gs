/**
 * Apps Script gắn vào Google Sheet "Mã khuyến mãi - Phong Thủy Thiên Anh".
 *
 * Đây là sheet THỨ HAI, độc lập với sheet "Danh sách đăng ký tư vấn" — mỗi sheet có Apps Script
 * riêng, URL riêng, SECRET_TOKEN riêng. Không dùng chung để lỡ hỏng cái này không ảnh hưởng cái kia.
 *
 * Sheet này có 2 tab, script tự tạo nếu chưa có:
 *   • "Danh sách mã"   — toàn bộ mã hiện có trong hệ thống, đồng bộ từ CSDL xuống.
 *   • "Lượt sử dụng"   — mỗi lần khách dùng mã thì tự thêm 1 dòng (ai dùng, dùng cho công cụ nào).
 *
 * ⚠️ CỘT "Tặng cho ai" ở tab "Danh sách mã" là cột anh tự gõ tay. Mỗi lần đồng bộ, script GIỮ
 * NGUYÊN nội dung anh đã gõ (khớp theo mã), không ghi đè. Cứ yên tâm ghi chú vào đó.
 *
 * CÁCH CÀI ĐẶT:
 * 1. Tạo Google Sheet mới tên "Mã khuyến mãi - Phong Thủy Thiên Anh", để cùng thư mục con với
 *    sheet đăng ký tư vấn.
 * 2. Mở sheet → Extensions (Tiện ích mở rộng) → Apps Script.
 * 3. Xoá code mẫu có sẵn, dán toàn bộ nội dung file này vào.
 * 4. Đổi SECRET_TOKEN bên dưới thành 1 chuỗi bí mật tự đặt (32 ký tự ngẫu nhiên là đủ) —
 *    KHÁC với token của sheet đăng ký tư vấn.
 * 5. Ctrl+S để lưu.
 * 6. Bấm "Deploy" (Triển khai) → "New deployment" (Triển khai mới):
 *    - Loại: "Web app".
 *    - Execute as (Thực thi với tư cách): "Me".
 *    - Who has access (Ai có quyền truy cập): "Anyone" — bắt buộc để server gọi được,
 *      an toàn vì đã có SECRET_TOKEN chặn request giả mạo.
 *    - Bấm "Deploy", chấp nhận khi Google hỏi quyền truy cập Sheet.
 * 7. Copy URL Web App (dạng https://script.google.com/macros/s/.../exec).
 * 8. Gửi lại cho Claude: URL này + SECRET_TOKEN ở bước 4.
 *
 * LƯU Ý: mỗi lần sửa code này phải "Deploy" → "Manage deployments" → bút chì → chọn version mới
 * → "Deploy" lại thì thay đổi mới có hiệu lực (chỉ Ctrl+S là chưa đủ).
 */

const SECRET_TOKEN = "ĐỔI_CHUỖI_NÀY_THÀNH_MẬT_KHẨU_BÍ_MẬT_CỦA_ANH";

const TAB_DANH_SACH = "Danh sách mã";
const TAB_LUOT_DUNG = "Lượt sử dụng";

const COT_DANH_SACH = [
  "Mã",
  "Ưu đãi",
  "Công cụ áp dụng",
  "Số lượt",
  "Đã dùng",
  "Còn lại",
  "Hạn dùng",
  "Trạng thái",
  "Ngày tạo",
  "Ghi chú hệ thống",
  "Tặng cho ai", // ← cột anh tự gõ, script không bao giờ ghi đè
];

const COT_LUOT_DUNG = [
  "Thời điểm",
  "Mã",
  "Công cụ",
  "Họ tên khách",
  "Email",
  "Số điện thoại",
  "Mã đơn",
  "Giá gốc",
  "Được giảm",
  "Phải trả",
];

function layTab(ten, cotTieuDe) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ten);
  if (!sheet) {
    sheet = ss.insertSheet(ten);
  }
  // Đặt hàng tiêu đề nếu sheet còn trống.
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

/**
 * Đồng bộ toàn bộ danh sách mã từ CSDL xuống tab "Danh sách mã".
 * Ghi đè sạch rồi ghi lại, NHƯNG giữ nguyên cột "Tặng cho ai" theo từng mã.
 */
function dongBoDanhSachMa(danhSach) {
  const sheet = layTab(TAB_DANH_SACH, COT_DANH_SACH);
  const cotTangCho = COT_DANH_SACH.indexOf("Tặng cho ai");

  // Đọc ghi chú "Tặng cho ai" hiện có, lập bản đồ mã → ghi chú.
  const ghiChuCu = {};
  const soDong = sheet.getLastRow();
  if (soDong > 1) {
    const cu = sheet.getRange(2, 1, soDong - 1, COT_DANH_SACH.length).getValues();
    for (let i = 0; i < cu.length; i++) {
      const ma = String(cu[i][0] || "").trim();
      const ghiChu = String(cu[i][cotTangCho] || "").trim();
      if (ma && ghiChu) ghiChuCu[ma] = ghiChu;
    }
    sheet.getRange(2, 1, soDong - 1, COT_DANH_SACH.length).clearContent();
  }

  if (!danhSach || danhSach.length === 0) return 0;

  const dong = danhSach.map(function (m) {
    return [
      m.ma,
      m.uuDai,
      m.congCu || "Mọi công cụ",
      m.soLuot,
      m.daDung,
      m.conLai,
      m.hanDung || "Không hạn",
      m.trangThai,
      m.ngayTao,
      m.ghiChu || "",
      ghiChuCu[m.ma] || "",
    ];
  });

  sheet.getRange(2, 1, dong.length, COT_DANH_SACH.length).setValues(dong);
  sheet.autoResizeColumns(1, COT_DANH_SACH.length);
  return dong.length;
}

/** Thêm 1 dòng vào tab "Lượt sử dụng" khi khách dùng mã thành công. */
function ghiLuotDung(l) {
  const sheet = layTab(TAB_LUOT_DUNG, COT_LUOT_DUNG);
  sheet.appendRow([
    gioVN(),
    l.ma || "",
    l.congCu || "",
    l.hoTen || "",
    l.email || "",
    l.soDienThoai || "",
    l.maDon || "",
    l.giaGoc || "",
    l.duocGiam || "",
    l.phaiTra || "",
  ]);
  return 1;
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

    if (body.hanhDong === "dong_bo_ma") {
      const soDong = dongBoDanhSachMa(body.danhSach);
      return traLoi({ ok: true, soDong: soDong });
    }

    if (body.hanhDong === "ghi_luot_dung") {
      ghiLuotDung(body.luot || {});
      return traLoi({ ok: true });
    }

    return traLoi({ ok: false, error: "Hành động không hợp lệ: " + body.hanhDong });
  } catch (err) {
    return traLoi({ ok: false, error: String(err) });
  }
}
