// PDF cho Luận Giải Tử Vi — dùng khung PDF chung `pdf-khung.ts` (cùng mẫu ky-mon-menh-pdf.ts).
// Nâng Cao ghép "Cơ Bản cũ + phần Nâng Cao nối tiếp" trong CÙNG 1 file PDF — đúng SPEC.md mục 7:
// "không sinh lại từ đầu".

import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, type Fonts, type But } from "../../dai-cat-loi/pdf-khung";
import type { KetQuaCoBan, LuanCung } from "./aiCoBan";
import { TEN_CUNG_HIEN_THI, TEN_CUNG_SNAKE } from "./aiCoBan";
import type { KetQuaNangCao, LuanHan } from "./aiNangCao";
import type { DuLieuLaSoTuVi } from "./adapter";
import { veRadarPdf, veThanhDaiHanPdf, veThanhDiem12CungPdf, veLaSoPdf } from "./bieuDoPdf";

function veCungLuan(b: But, f: Fonts, ten: string, diem: number, l: LuanCung): void {
  b.chua(60);
  const sao = "●".repeat(diem) + "○".repeat(5 - diem);
  b.dong(`${ten}  ${sao}`, { size: 12, font: f.dam, mau: MAU.son, dan: 4 });
  b.doan(l.ketLuanNhanh, { size: 9.5, font: f.vua });
  b.xuong(2);
  b.doan(l.phanTichCauTruc, { size: 9 });
  b.xuong(2);
  b.dong("Điểm mạnh", { size: 9, font: f.dam, mau: MAU.luc, dan: 2 });
  b.doan(l.diemManh, { size: 9 });
  b.dong("Điểm yếu", { size: 9, font: f.dam, mau: MAU.son, dan: 2 });
  b.doan(l.diemYeu, { size: 9 });
  b.dong("Nguyên nhân", { size: 9, font: f.dam, dan: 2 });
  b.doan(l.nguyenNhan, { size: 9 });
  b.dong("Khả năng ứng nghiệm", { size: 9, font: f.dam, dan: 2 });
  b.doan(l.khaNangUngNghiem, { size: 9 });
  b.dong("Khuyến nghị", { size: 9, font: f.dam, mau: MAU.lam, dan: 2 });
  b.doan(l.khuyenNghi, { size: 9 });
  b.xuong(6);
}

function veCoBan(b: But, f: Fonts, coBan: KetQuaCoBan, duLieu: DuLieuLaSoTuVi): void {
  b.muc("Tổng quan lá số");
  b.doan(
    `Bản mệnh ${duLieu.banMenhNapAm} (${duLieu.banMenhElement}) — ${duLieu.cucName} — Quan hệ Mệnh-Cục: ${duLieu.quanHeMenhCuc}. ` +
      `Mệnh an tại ${duLieu.menhChi}. Thân: ${duLieu.thanCungTen}.`,
    { size: 9.5, font: f.vua },
  );
  b.xuong(4);

  b.muc("Lá số Tử Vi");
  veLaSoPdf(b, f, duLieu);

  b.muc("Luận Thiên Bàn");
  b.doan(coBan.luanThienBan, { size: 9.5 });
  b.xuong(4);

  b.muc("Radar 6 lĩnh vực");
  veRadarPdf(b, f, duLieu.radar6LinhVuc);
  b.xuong(4);

  b.muc("Các chủ đề chính");
  const cd = coBan.chuDe;
  const dsChuDe: [string, string][] = [
    ["Học vấn - tư duy", cd.hocVan], ["Nghề nghiệp - công danh", cd.ngheNghiep], ["Tài chính", cd.taiChinh],
    ["Hôn nhân", cd.honNhan], ["Sức khỏe", cd.sucKhoe], ["Khó khăn - thử thách", cd.khoKhan], ["Định hướng phát triển", cd.dinhHuong],
  ];
  for (const [ten, noiDung] of dsChuDe) {
    if (!noiDung) continue;
    b.dong(ten, { size: 9.5, font: f.dam, dan: 2 });
    b.doan(noiDung, { size: 9 });
    b.xuong(2);
  }
  b.xuong(4);

  b.muc("Bánh xe Cát – Hung 12 cung");
  veThanhDiem12CungPdf(b, f, duLieu.cung.map((c) => ({ ten: c.ten, diem: c.diem })));
  b.xuong(4);

  b.muc("Luận đủ 12 cung");
  const diemTheoTen = new Map(duLieu.cung.map((c) => [c.ten, c.diem]));
  for (const k of TEN_CUNG_SNAKE) {
    const ten = TEN_CUNG_HIEN_THI[k];
    veCungLuan(b, f, ten, diemTheoTen.get(ten) ?? 3, coBan.cung[k]);
  }
}

// ⚠️ PHẢI dùng doan() (tự xuống dòng) chứ không phải dong() (1 dòng, cắt cụt + "…" nếu quá dài) —
// bug thật 1/9/2026: các câu AI viết cho "Tổng kết toàn bộ lá số" (5 điểm mạnh/yếu, Nên/Không nên ở
// veHan) đủ dài để bị cắt cụt giữa câu khi dùng dong(), anh Công báo lỗi kèm ảnh chụp PDF.
function veLoiKhuyen(b: But, f: Fonts, danh: string[], mau = MAU.luc): void {
  for (const s of danh) b.doan(`• ${s}`, { size: 9, mau, x: 60 });
}

function veHan(b: But, f: Fonts, tieuDe: string, h: LuanHan): void {
  b.chua(60);
  b.muc(tieuDe);
  b.doan(h.doanMoDau, { size: 9.5, font: f.vua });
  b.xuong(2);
  b.dong("Quan tâm nhiều nhất", { size: 9, font: f.dam, dan: 2 });
  b.doan(h.quanTamNhieuNhat, { size: 9 });
  const sk = h.suKienQuanTrong;
  const dsSuKien = [
    ["Công việc", sk.congViec], ["Tài bạch", sk.taiBach], ["Tình cảm", sk.tinhCam], ["Con cái", sk.conCai], ["Sức khỏe", sk.sucKhoe],
  ].filter(([, v]) => v);
  if (dsSuKien.length) {
    b.dong("Sự kiện có thể xảy ra", { size: 9, font: f.dam, dan: 2 });
    for (const [nhan, noiDung] of dsSuKien) b.doan(`${nhan}: ${noiDung}`, { size: 9, x: 60 });
  }
  if (h.toXauSoVoiHanKhac) {
    b.dong("So với hạn trước/sau", { size: 9, font: f.dam, dan: 2 });
    b.doan(h.toXauSoVoiHanKhac, { size: 9 });
  }
  if (h.loiKhuyenNen.length) {
    b.dong("✅ Nên", { size: 9, font: f.dam, mau: MAU.luc, dan: 2 });
    veLoiKhuyen(b, f, h.loiKhuyenNen, MAU.luc);
  }
  if (h.loiKhuyenKhongNen.length) {
    b.dong("⛔ Không nên", { size: 9, font: f.dam, mau: MAU.son, dan: 2 });
    veLoiKhuyen(b, f, h.loiKhuyenKhongNen, MAU.son);
  }
  b.xuong(2);
  b.dong("Chốt lại của Thầy", { size: 9, font: f.dam, dan: 2 });
  b.doan(h.chotLai, { size: 9, font: f.nghieng });
  b.xuong(6);
}

function veTongKet(b: But, f: Fonts, nc: KetQuaNangCao): void {
  const tk = nc.tongKet;
  b.chua(60);
  b.muc("Tổng kết toàn bộ lá số");
  if (tk.diemManh.length) {
    b.dong("✨ 5 điểm mạnh nổi bật", { size: 9.5, font: f.dam, mau: MAU.luc, dan: 2 });
    veLoiKhuyen(b, f, tk.diemManh, MAU.luc);
  }
  if (tk.diemYeu.length) {
    b.dong("⚠️ 5 điểm cần lưu ý", { size: 9.5, font: f.dam, mau: MAU.son, dan: 2 });
    veLoiKhuyen(b, f, tk.diemYeu, MAU.son);
  }
  b.dong("📈 Giai đoạn phát triển nhất", { size: 9.5, font: f.dam, dan: 2 });
  b.doan(tk.giaiDoanPhatTrienNhat, { size: 9 });
  b.dong("🛡️ Giai đoạn cần cẩn trọng nhất", { size: 9.5, font: f.dam, dan: 2 });
  b.doan(tk.giaiDoanCanCanTrong, { size: 9 });
  b.dong("💼 Ngành nghề/vai trò phù hợp", { size: 9.5, font: f.dam, dan: 2 });
  b.doan(tk.nganhNghePhuHop, { size: 9 });
  b.dong("🚫 Điều nên tránh", { size: 9.5, font: f.dam, dan: 2 });
  b.doan(tk.dieuNenTranh, { size: 9 });
  b.dong("🎯 Chiến lược sống dài hạn", { size: 9.5, font: f.dam, dan: 2 });
  b.doan(tk.chienLuocDaiHan, { size: 9 });
}

const LUU_Y =
  "Tử Vi Đẩu Số là công cụ tham khảo theo phương pháp truyền thống Nam Phái, không thay thế tư vấn " +
  "trực tiếp hoặc quyết định y tế/pháp lý/tài chính quan trọng.";

export async function generateTuViCoBanPdf(coBan: KetQuaCoBan, duLieu: DuLieuLaSoTuVi, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  b.giaDong = 6; // giãn dòng cho báo cáo dài, đỡ căng mắt khi đọc trên giấy/PDF (anh Công yêu cầu 1/9/2026)
  await veDauTrang(doc, b, f, { tieuDe: "Luận Giải Tử Vi — Cơ Bản", phuDe: "Luận đủ 12 cung theo Tử Vi Đẩu Số Nam Phái" });
  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);
  veCoBan(b, f, coBan, duLieu);
  veLuuYVaLienHe(b, f, LUU_Y);
  veChanTrang(doc, f);
  return doc.save();
}

export async function generateTuViNangCaoPdf(
  coBan: KetQuaCoBan,
  nangCao: KetQuaNangCao,
  duLieu: DuLieuLaSoTuVi,
  customerName: string,
): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  b.giaDong = 6; // giãn dòng cho báo cáo dài, đỡ căng mắt khi đọc trên giấy/PDF (anh Công yêu cầu 1/9/2026)
  await veDauTrang(doc, b, f, { tieuDe: "Luận Giải Tử Vi — Nâng Cao", phuDe: "Trọn bộ 12 cung + Đại Hạn + Tiểu Hạn + Tổng kết chiến lược" });
  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);
  veCoBan(b, f, coBan, duLieu);
  if (duLieu.daiHanHienTai) {
    b.chua(60);
    b.muc("Vị trí Đại Hạn trên hành trình tuổi tác");
    veThanhDaiHanPdf(b, f, duLieu.daiHanHienTai, duLieu.tuoiHienTai);
  }
  veHan(b, f, `Đại Hạn hiện tại${duLieu.daiHanHienTai ? ` (${duLieu.daiHanHienTai.tuoiTu}-${duLieu.daiHanHienTai.tuoiDen} tuổi)` : ""}`, nangCao.daiHan);
  veHan(b, f, `Tiểu Hạn năm nay${duLieu.tieuHanNamNay ? ` (${duLieu.namHienTai}, ${duLieu.tieuHanNamNay.tuoi} tuổi)` : ""}`, nangCao.tieuHanNamNay);
  veHan(b, f, `Tiểu Hạn năm sau${duLieu.tieuHanNamSau ? ` (${(duLieu.namHienTai ?? 0) + 1}, ${duLieu.tieuHanNamSau.tuoi} tuổi)` : ""}`, nangCao.tieuHanNamSau);
  veTongKet(b, f, nangCao);
  veLuuYVaLienHe(b, f, LUU_Y);
  veChanTrang(doc, f);
  return doc.save();
}
