/**
 * PHIẾU PDF — Chọn Ngày Giờ Nhận Chức. Dựng từ `NhanChucResult` (đã tính sẵn), dùng khung PDF
 * chung ở `pdf-khung.ts`. Đây là bản khách tải/nhận qua email sau khi thanh toán.
 */
import type { NhanChucResult, NhanChucNgay } from "@thien-anh/trachnhat-engine";
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, LE, type But, type Fonts } from "./pdf-khung";
import type { RGB } from "pdf-lib";

/** Màu điểm số theo mức xếp hạng — cho phiếu bớt khô, khớp tinh thần bản web. */
function mauTheoStatus(status: string): RGB {
  if (status === "ĐẠI TỐT" || status === "TỐT") return MAU.luc;
  if (status === "KHÁ") return MAU.lam;
  if (status === "XẤU" || status === "LOẠI") return MAU.son;
  return MAU.vang; // TRUNG BÌNH
}

const HANG = ["TOP 1", "TOP 2", "TOP 3", "TOP 4", "TOP 5"];

function veMotNgay(b: But, f: Fonts, n: NhanChucNgay, i: number): void {
  b.xuong(6);
  b.chua(46);
  const hang = HANG[i] ?? `TOP ${i + 1}`;
  const mau = mauTheoStatus(n.status);
  const moc = b.danhDau();

  // Dòng đầu: nhãn TOP + ngày dương — ngày Can Chi
  const wHang = b.nhan(hang, LE + 12, b.y - 3.5, { mau: MAU.muc, size: 9 });
  b.dong(`${n.solarDate.day}/${n.solarDate.month}/${n.solarDate.year} — ngày ${n.canChiNgay}`, {
    size: 11,
    font: f.dam,
    x: LE + 12 + wHang + 8,
    dan: 2,
  });

  // Dòng nhãn đánh giá, màu theo mức xếp hạng
  b.nhan(`${n.diem}/10 · ${n.status}`, LE + 12, b.y - 3.5, { mau, size: 9 });
  b.xuong(20);

  const am = `Âm lịch ${n.lunarDate.day}/${n.lunarDate.month}${n.lunarDate.isLeapMonth ? " (nhuận)" : ""}`;
  const tt = n.thapThan ? `   ·   Thập Thần: ${n.thapThan}` : "";
  b.dong(`${am}${tt}`, { size: 8.5, mau: MAU.mucNhat, x: LE + 12, dan: 3 });

  // Giờ nên nhận chức — xếp theo tốt nhất (engine đã sắp giảm dần theo điểm), chỉ giờ hành chính.
  const gio = n.gioDeXuat ?? [];
  if (gio.length > 0) {
    const dsGio = gio
      .map((g, k) => `${k === 0 ? "★ tốt nhất " : `${k + 1}. `}${g.chiGio} (${g.khungGio})`)
      .join("   ·   ");
    b.doan(`Giờ nên nhận chức (giờ hành chính, xếp theo tốt nhất): ${dsGio}`, {
      size: 9,
      font: f.vua,
      x: LE + 12,
    });
  }

  // Các yếu tố chấm điểm
  for (const y of (n.yeuTo ?? []).slice(0, 8)) {
    const ghi = (y as { ghiChu?: string }).ghiChu;
    b.doan(`• ${y.ten}  (${y.diem})`, { size: 8.5, x: LE + 12, mau: MAU.muc });
    if (ghi) b.doan(ghi, { size: 8, x: LE + 24, font: f.nghieng, mau: MAU.mucNhat });
  }

  b.thanhNhan(moc, mau);
}

export async function generateNhanChucPdf(result: NhanChucResult): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Phiếu chọn ngày giờ nhận chức",
    phuDe: "Nhận chức · Nhậm chức · Bổ nhiệm · Bắt đầu chức vụ mới",
  });

  // --- Tổng quan ---
  b.muc("Tổng quan");
  if (result.tenChucVu) b.dong(`Chức vụ: ${result.tenChucVu}`, { size: 10, font: f.vua });
  b.dong(
    result.nhatChu
      ? `Nhật Chủ người nhận chức: ${result.nhatChu} — đã áp dụng lớp Thập Thần & xét tuổi.`
      : "Chế độ chung (không nhập ngày sinh) — chưa áp dụng lớp Thập Thần & xét tuổi.",
    { size: 9, mau: MAU.mucNhat },
  );
  b.dong(`Tìm được ${result.soNgayDung} ngày dùng được / ${result.tongSoNgayQuet} ngày đã quét.`, {
    size: 10,
    font: f.vua,
  });

  // --- Các ngày đề xuất ---
  b.muc("Các ngày & giờ đề xuất");
  if (result.ketQua.length === 0) {
    b.doan("Không có ngày nào dùng được trong khoảng đã quét. Vui lòng nới rộng khoảng ngày hoặc liên hệ tư vấn trực tiếp.");
  } else {
    result.ketQua.forEach((n, i) => veMotNgay(b, f, n, i));
  }

  // --- Cần xem xét thêm (nếu có) ---
  if (result.canXacNhan && result.canXacNhan.length > 0) {
    b.muc("Cần xem xét thêm");
    b.doan("Một số yếu tố cổ có công thức nhưng chưa được xác nhận đầy đủ — hệ thống nêu ra để chuyên gia đối chiếu, không tự kết luận:", {
      size: 8.5,
      font: f.nghieng,
      mau: MAU.mucNhat,
    });
    for (const c of result.canXacNhan) b.doan(`• ${c}`, { size: 8.5, x: LE + 12, mau: MAU.mucNhat });
  }

  veLuuYVaLienHe(
    b,
    f,
    "Theo đúng nguyên tắc nghề: Hoàng Đạo chỉ là yếu tố hỗ trợ, không phải điều kiện đủ. " +
      "Ngày đã qua bộ lọc hung sát mới được xếp hạng; ngày phạm đại sát (Kim Thần, Sát Chủ, Thọ Tử, Lục Xung tuổi…) bị loại thẳng.",
  );
  veChanTrang(doc, f);
  return doc.save();
}
