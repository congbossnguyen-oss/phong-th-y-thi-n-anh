/**
 * PHIẾU PDF — Luận Giải Bát Tự Toàn Diện (Cơ Bản 299.000đ / Nâng Cao 499.000đ). Dựng từ
 * `BaoCaoCoBan`/`BaoCaoNangCao` (đã tính sẵn từ `orchestrator.ts`), dùng khung PDF chung
 * `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 */
import { rgb, type RGB } from "pdf-lib";
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, catVua, hex, LE, A4, MAU, type Fonts, type But } from "./pdf-khung";
import type { BaoCaoCoBan, BaoCaoNangCao, LaSoHienThi, DiemGiaiDoanVan, MocDoHinhMoi } from "../luan-giai-toan-dien/types";
import { hanhCan, hanhChi } from "../bat-tu-engine/engine";
import { toaDoDinh } from "../tu-vi/luan-giai/bieuDo";

// Cùng bảng màu Ngũ Hành dùng thống nhất trên toàn site (web + các PDF khác, vd bieuDoPdf.ts của Tử Vi).
const MAU_HANH: Record<string, RGB> = {
  Mộc: hex("#16a34a"),
  Hỏa: hex("#dc2626"),
  Thổ: hex("#8b5a2b"),
  Kim: hex("#64748b"),
  Thủy: hex("#2563eb"),
};

const XAM_NHAT = rgb(0.75, 0.72, 0.66);

/**
 * Lưới 4 trụ Năm/Tháng/Ngày/Giờ dạng "thẻ bài" — Can/Chi cỡ lớn, tô màu theo Ngũ Hành, cùng tinh
 * thần với bản web "Tứ Trụ Mệnh Bàn" (lap-la-so-bat-tu.astro) nhưng vẽ lại bằng pdf-lib vì server
 * không có DOM để chụp ảnh như bản web (html-to-image). Anh Công yêu cầu 1/9/2026: PDF trả về nên
 * có hình lá số thay vì chỉ liệt kê chữ.
 *
 * `catVua` (tự thêm "…" nếu quá khổ) bọc quanh MỌI chữ vẽ trong ô — phòng khi phông chữ đậm ở size
 * lớn render rộng hơn tính toán trên 1 số máy/thư viện, chữ tự cắt gọn thay vì tràn sang ô bên cạnh
 * (anh Công báo 2/9/2026: "các chữ không nên đè nhau").
 */
function veLuoiTuTru(b: But, f: Fonts, tuTru: LaSoHienThi["tuTru"]): void {
  const caoO = 60;
  const rongO = (A4.w - LE * 2) / tuTru.length;
  const oPad = 3;
  b.chua(caoO + 8);
  const yTop = b.y;

  tuTru.forEach((t, i) => {
    const x = LE + i * rongO;
    const oX = x + 2;
    const oW = rongO - 4;
    const rongChu = oW - oPad * 2; // bề ngang tối đa cho phép chữ, chừa lề trong mỗi ô.
    b.page.drawRectangle({ x: oX, y: yTop - caoO, width: oW, height: caoO, color: rgb(0xfb / 255, 0xf5 / 255, 0xea / 255) });
    b.page.drawRectangle({ x: oX, y: yTop - caoO, width: oW, height: caoO, borderColor: MAU.vangNhat, borderWidth: 1 });

    const cx = x + rongO / 2;
    const nhanTru = catVua(t.tru.toUpperCase(), f.vua, 7.5, rongChu);
    b.page.drawText(nhanTru, {
      x: cx - f.vua.widthOfTextAtSize(nhanTru, 7.5) / 2,
      y: yTop - 15,
      size: 7.5,
      font: f.vua,
      color: MAU.mucNhat,
    });
    const canChu = catVua(t.can, f.dam, 14, rongChu);
    b.page.drawText(canChu, {
      x: cx - f.dam.widthOfTextAtSize(canChu, 14) / 2,
      y: yTop - 32,
      size: 14,
      font: f.dam,
      color: MAU_HANH[hanhCan(t.can)] ?? MAU.muc,
    });
    const chiChu = catVua(t.chi, f.dam, 14, rongChu);
    b.page.drawText(chiChu, {
      x: cx - f.dam.widthOfTextAtSize(chiChu, 14) / 2,
      y: yTop - 50,
      size: 14,
      font: f.dam,
      color: MAU_HANH[hanhChi(t.chi)] ?? MAU.muc,
    });
  });

  b.y = yTop - caoO - 8;
}

/** Đồ hình phân bố Ngũ Hành dạng NGŨ GIÁC (5 trục, 1 trục/hành) — đếm Can+Chi cả 4 trụ, cùng dữ
 *  liệu/màu với donut trên web (renderGoiMoNguHanh ở lap-la-so-bat-tu.astro). Anh Công yêu cầu
 *  2/9/2026 dùng đúng dạng "hình ngũ giác" thay vì thanh ngang — dùng lại nguyên hình học
 *  `toaDoDinh()` đã chạy đúng trên production ở radar 6 lĩnh vực của Tử Vi (veRadarPdf,
 *  bieuDoPdf.ts), chỉ đổi 6 trục thành 5 trục Ngũ Hành. */
function veNguHanhPentagon(b: But, f: Fonts, tuTru: LaSoHienThi["tuTru"]): void {
  const THU_TU: (keyof typeof MAU_HANH)[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];
  const dem: Record<string, number> = { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0 };
  for (const t of tuTru) {
    dem[hanhCan(t.can)] = (dem[hanhCan(t.can)] ?? 0) + 1;
    dem[hanhChi(t.chi)] = (dem[hanhChi(t.chi)] ?? 0) + 1;
  }
  const vMax = Math.max(1, ...THU_TU.map((h) => dem[h] ?? 0));

  const rMax = 58;
  const n = THU_TU.length;
  b.chua(13 + 4 + rMax * 2 + 40); // tiêu đề + cả hình + nhãn ngoài viền cùng 1 khối, không tách trang giữa chừng.
  b.dong("Phân bố Ngũ Hành", { size: 9, font: f.dam, mau: MAU.muc, dan: 4 });
  const cx = A4.w / 2;
  const cy = b.y - 16 - rMax;

  // Lưới mờ 5 vòng đồng tâm + trục từ tâm ra từng đỉnh — nền tham chiếu, không mang dữ liệu.
  for (const muc of [1, 2, 3, 4, 5]) {
    const r = (rMax * muc) / 5;
    for (let i = 0; i < n; i++) {
      const a = toaDoDinh(i, n, cx, cy, r, true);
      const bpt = toaDoDinh((i + 1) % n, n, cx, cy, r, true);
      b.page.drawLine({ start: a, end: bpt, thickness: 0.5, color: XAM_NHAT, opacity: 0.6 });
    }
  }
  for (let i = 0; i < n; i++) {
    const p = toaDoDinh(i, n, cx, cy, rMax, true);
    b.page.drawLine({ start: { x: cx, y: cy }, end: p, thickness: 0.5, color: XAM_NHAT, opacity: 0.6 });
  }

  // Đa giác dữ liệu thật — 1 đỉnh/hành, bán kính theo tỉ lệ so với hành nhiều nhất trong lá số.
  const dinh = THU_TU.map((h, i) => ({ ...toaDoDinh(i, n, cx, cy, (rMax * (dem[h] ?? 0)) / vMax, true), h, v: dem[h] ?? 0 }));
  for (let i = 0; i < n; i++) {
    b.page.drawLine({ start: dinh[i], end: dinh[(i + 1) % n], thickness: 1.6, color: hex("#ad8843") });
  }
  for (const p of dinh) {
    b.page.drawEllipse({ x: p.x, y: p.y, xScale: 3, yScale: 3, color: MAU_HANH[p.h] });
  }

  // Nhãn tên hành + số lượng, đặt ngoài viền ngũ giác, căn theo vị trí đỉnh so với tâm.
  for (let i = 0; i < n; i++) {
    const p = toaDoDinh(i, n, cx, cy, rMax + 20, true);
    const h = THU_TU[i];
    const nhan = `${h} ${dem[h] ?? 0}`;
    const size = 8;
    const w = f.dam.widthOfTextAtSize(nhan, size);
    const dx = Math.abs(p.x - cx) < 2 ? w / 2 : p.x > cx ? 0 : w;
    b.page.drawText(nhan, { x: p.x - dx, y: p.y - size / 2, size, font: f.dam, color: MAU_HANH[h] });
  }

  b.y = cy - rMax - 24;
}

/** Thanh gauge Vượng Suy (0-100) — cùng số liệu với gauge cung tròn trên web (renderGoiMoGauge),
 *  đổi sang thanh ngang cho PDF (an toàn hơn vẽ cung tròn bằng pdf-lib khi không xem trước được). */
function veGaugeVuongSuy(b: But, f: Fonts, diem: number, capDo: string): void {
  const pct = Math.max(0, Math.min(100, Math.round(diem)));
  b.chua(28);
  b.dong(`Vượng Suy: ${pct}% — ${capDo}`, { size: 9, font: f.dam, mau: MAU.muc, dan: 4 });
  const rong = A4.w - LE * 2;
  const cao = 8;
  const yDay = b.y - cao;
  b.page.drawRectangle({ x: LE, y: yDay, width: rong, height: cao, color: XAM_NHAT, opacity: 0.4 });
  b.page.drawRectangle({ x: LE, y: yDay, width: (rong * pct) / 100, height: cao, color: MAU.vang });
  b.xuong(cao + 6);
}

/** "05/03/1990, 10h20" — ghi rõ ngày sinh DƯƠNG LỊCH của mệnh chủ (anh Công yêu cầu 2/9/2026: nhiều
 *  lá số dễ lẫn nhau nếu bản gửi khách chỉ có Can Chi Tứ Trụ, không có ngày sinh gốc để đối chiếu). */
function ngaySinhDuongChu(ns: LaSoHienThi["ngaySinhDuong"]): string {
  const ngay = `${String(ns.day).padStart(2, "0")}/${String(ns.month).padStart(2, "0")}/${ns.year}`;
  const phut = ns.minute !== undefined ? String(ns.minute).padStart(2, "0") : "00";
  return `${ngay}, ${ns.hour}h${phut}`;
}

function veLaSo(b: But, f: Fonts, laSo: LaSoHienThi): void {
  b.muc("Lá số");
  veLuoiTuTru(b, f, laSo.tuTru);

  b.doan(`Ngày sinh (dương lịch): ${ngaySinhDuongChu(laSo.ngaySinhDuong)}  ·  Giới tính: ${laSo.gioiTinh}`, { size: 9.5, font: f.vua });
  b.doan(`Nhật Chủ: ${laSo.nhatChu}`, { size: 9.5 });

  b.chua(16);
  let x = LE;
  const nhanThan = (nhan: string, mau: RGB) => {
    x += b.nhan(nhan, x, b.y - 2.5, { mau, size: 8 }) + 6;
  };
  nhanThan(`Dụng Thần ${laSo.dungThan}`, MAU.luc);
  nhanThan(`Hỷ Thần ${laSo.hyThan}`, MAU.lam);
  nhanThan(`Kỵ Thần ${laSo.kyThan}`, MAU.son);
  b.xuong(20);

  veNguHanhPentagon(b, f, laSo.tuTru);
  b.xuong(6);
  veGaugeVuongSuy(b, f, laSo.diemVuongSuy, laSo.capDoVuongSuy);

  if (laSo.dieuHauNote) b.doan(`Điều Hậu: ${laSo.dieuHauNote}`, { size: 9.5, mau: MAU.vang });
  b.xuong(4);
}

const MAU_DIEM = [
  rgb(0xb9 / 255, 0x1c / 255, 0x1c / 255), // -2
  rgb(0xf0 / 255, 0xa8 / 255, 0x98 / 255), // -1
  rgb(0xd8 / 255, 0xcd / 255, 0xb4 / 255), // 0
  rgb(0xa8 / 255, 0xd5 / 255, 0xb0 / 255), // 1
  rgb(0x16 / 255, 0x80 / 255, 0x3d / 255), // 2
];
const mauTheoDiem = (diem: number) => MAU_DIEM[Math.max(-2, Math.min(2, Math.round(diem))) + 2];

/** Chú giải màu -2..2 — anh Công phản ánh 2/9/2026: đồ hình có màu nhưng KHÔNG có chú thích màu
 *  nào tốt/xấu, khách/admin nhìn vào không đoán được ý nghĩa. 5 ô vuông màu đúng thang MAU_DIEM,
 *  kèm nhãn ngắn — đặt ngay dưới mô tả, phía trên lưới điểm, cùng chỗ với bản trên web. */
const NHAN_MUC_DIEM = ["Rất bất lợi", "Bất lợi", "Trung tính", "Thuận lợi", "Rất thuận lợi"];
function veChuGiaiMauDiem(b: But, f: Fonts): void {
  let x = LE;
  const o = 8;
  for (let i = 0; i < MAU_DIEM.length; i++) {
    b.page.drawRectangle({ x, y: b.y - o, width: o, height: o, color: MAU_DIEM[i] });
    const nhan = NHAN_MUC_DIEM[i];
    b.page.drawText(nhan, { x: x + o + 3, y: b.y - o + 1, size: 6.5, font: f.thuong, color: MAU.mucNhat });
    x += o + 3 + f.thuong.widthOfTextAtSize(nhan, 6.5) + 10;
  }
  b.xuong(o + 4);
}

const KHIA_CANH: { khoa: keyof Pick<DiemGiaiDoanVan, "sucKhoe" | "congViec" | "taiLoc" | "lucThan">; nhan: string }[] = [
  { khoa: "sucKhoe", nhan: "Sức khỏe" },
  { khoa: "congViec", nhan: "Công việc" },
  { khoa: "taiLoc", nhan: "Tài lộc" },
  { khoa: "lucThan", nhan: "Lục thân" },
];

/** Đồ hình bảng nhiệt (heatmap) 4 khía cạnh x N giai đoạn/năm — bản PDF của BieuDoGiaiDoanVan.astro. */
function veBieuDoGiaiDoan(b: But, f: Fonts, tieuDe: string, moTa: string, danhSach: DiemGiaiDoanVan[]): void {
  if (danhSach.length === 0) return;
  const NHAN_RONG = 62;
  const caoO = 13;
  const rongCot = (A4.w - LE * 2 - NHAN_RONG) / danhSach.length;

  // Giữ tiêu đề + mô tả + chú giải màu + lưới điểm cùng 1 trang — tránh tiêu đề bị mồ côi ở cuối
  // trang trước còn lưới điểm rơi sang trang sau (chừa chỗ cho cả cụm trước khi vẽ bất kỳ phần nào).
  b.chua(34 + 14 + 4 + 16 + caoO * (KHIA_CANH.length + 1) + 10);
  b.muc(tieuDe);
  b.doan(moTa, { size: 8, mau: MAU.mucNhat });
  b.xuong(4);
  veChuGiaiMauDiem(b, f);

  let x = LE + NHAN_RONG;
  for (const d of danhSach) {
    b.page.drawText(catVua(d.nhan, f.dam, 6, rongCot - 2), { x, y: b.y, size: 6, font: f.dam, color: MAU.mucNhat });
    x += rongCot;
  }
  b.y -= caoO;

  for (const kc of KHIA_CANH) {
    b.page.drawText(kc.nhan, { x: LE, y: b.y + 2, size: 7.5, font: f.vua, color: MAU.muc });
    let x2 = LE + NHAN_RONG;
    for (const d of danhSach) {
      b.page.drawRectangle({ x: x2, y: b.y - 2, width: rongCot - 2, height: caoO - 3, color: mauTheoDiem(d[kc.khoa]) });
      x2 += rongCot;
    }
    b.y -= caoO;
  }
  b.xuong(8);

  for (const d of danhSach) {
    const nhanDungThan = d.dungThanVan
      ? `  ·  Dụng Thần ${d.dungThanVan}${d.dungThanDoi ? " (đổi so với nguyên cục)" : ""}`
      : "";
    b.dong(`${d.nhan} (${d.canChi})${nhanDungThan}`, { size: 8, font: f.vua, dan: 2 });
    b.doan(d.tomTat, { size: 7.5, x: LE + 8, mau: MAU.mucNhat });
    if (d.chiTiet) b.doan(d.chiTiet, { size: 8, x: LE + 8 });
    b.xuong(d.chiTiet ? 5 : 2);
  }
  b.xuong(4);
}

/** Đồ hình MỒI — 1 hàng điểm thô (không tách 4 khía cạnh như bản Nâng Cao thật) cho Cơ Bản, mời nâng
 *  cấp. Dùng chung style với `veBieuDoGiaiDoan` nhưng đơn giản hơn hẳn — cố ý, để phân biệt rõ với
 *  đồ hình AI thật của Nâng Cao. */
function veDoHinhMoi(b: But, f: Fonts, tieuDe: string, danhSach: MocDoHinhMoi[]): void {
  if (danhSach.length === 0) return;
  const NHAN_RONG = 0;
  const caoO = 13;
  const rongCot = (A4.w - LE * 2 - NHAN_RONG) / danhSach.length;

  b.chua(14 + 4 + caoO * 2 + 6);
  b.dong(tieuDe, { size: 8.5, font: f.dam, mau: MAU.muc, dan: 2 });

  let x = LE + NHAN_RONG;
  for (const d of danhSach) {
    b.page.drawText(catVua(d.nhan, f.dam, 6, rongCot - 2), { x, y: b.y, size: 6, font: f.dam, color: MAU.mucNhat });
    x += rongCot;
  }
  b.y -= caoO;

  let x2 = LE + NHAN_RONG;
  for (const d of danhSach) {
    b.page.drawRectangle({ x: x2, y: b.y - 2, width: rongCot - 2, height: caoO - 3, color: mauTheoDiem(d.diem) });
    x2 += rongCot;
  }
  b.y -= caoO;
  b.xuong(6);
}

function veMoiNangCap(b: But, f: Fonts, moiDaiVan: MocDoHinhMoi[], moiLuuNien: MocDoHinhMoi[]): void {
  if (moiDaiVan.length === 0 && moiLuuNien.length === 0) return;
  b.muc("Xem trước: Đại Vận & Lưu Niên");
  b.doan(
    "Ước tính thô 1 chỉ số theo Dụng/Hỷ/Kỵ Thần nguyên cục — chưa tính lại Dụng Thần theo từng Đại Vận, chưa tách 4 khía cạnh (Sức khỏe/Công việc/Tài lộc/Lục thân), chưa có luận chi tiết từng năm bằng AI. Bản Nâng Cao có đầy đủ.",
    { size: 8, mau: MAU.mucNhat },
  );
  b.xuong(4);
  veDoHinhMoi(b, f, "Đại Vận trọn đời", moiDaiVan);
  veDoHinhMoi(b, f, `Lưu Niên ${moiLuuNien.length} năm tới`, moiLuuNien);
  b.doan("👉 Nâng cấp lên bản Nâng Cao để xem đầy đủ 4 khía cạnh từng giai đoạn + luận chi tiết từng năm.", { size: 8.5, font: f.dam, mau: MAU.son });
  b.xuong(6);
}

function veGiaiDoan(b: But, f: Fonts, ma: string, tieuDe: string, noiDung: string): void {
  b.chua(15);
  const w = b.nhan(ma, LE, b.y - 3, { mau: MAU.son, size: 9 });
  b.dong(tieuDe, { size: 11, font: f.dam, mau: MAU.son, x: LE + w + 8, dan: 6 });
  b.doanCoCauTruc(noiDung, { size: 9.5 });
  // Giãn cách rộng hơn giữa các giai đoạn (anh Công 2/9/2026: "dàn trang lại cho thưa ra... đỡ dày
  // đặc khiến người xem ngại đọc") — tăng từ 6 lên 12, rõ ràng là 1 mục đã kết thúc trước khi sang mục kế.
  b.xuong(12);
}

export async function generateBatTuCoBanPdf(baoCao: BaoCaoCoBan, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  b.giaDong = 6; // giãn dòng cho báo cáo dài, đỡ căng mắt khi đọc trên giấy/PDF (anh Công yêu cầu 1/9/2026)
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Bát Tự Toàn Diện",
    phuDe: "Bản Cơ Bản — 7 giai đoạn luận giải",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  veLaSo(b, f, baoCao.laSo);
  b.doan(baoCao.disclaimerDauBai, { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });
  b.xuong(6);

  veMoiNangCap(b, f, baoCao.moiDaiVan, baoCao.moiLuuNien);

  b.muc("Luận giải chi tiết");
  for (const gd of baoCao.giaiDoan) veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}

/** Gói duy nhất 700k (1/9/2026) — 1 PDF gộp đủ 12 giai đoạn Cơ Bản + Nâng Cao, thay 2 hàm rời ở trên. */
export async function generateBatTuToanDienPdf(
  baoCaoCoBan: BaoCaoCoBan,
  baoCaoNangCao: BaoCaoNangCao,
  customerName: string,
): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  b.giaDong = 6; // giãn dòng cho báo cáo dài, đỡ căng mắt khi đọc trên giấy/PDF (anh Công yêu cầu 1/9/2026)
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Bát Tự Toàn Diện",
    phuDe: "12 giai đoạn luận giải trọn vẹn",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  veLaSo(b, f, baoCaoCoBan.laSo);
  b.doan(baoCaoCoBan.disclaimerDauBai, { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  for (const gd of baoCaoCoBan.giaiDoan) veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
  for (const gd of baoCaoNangCao.giaiDoan) {
    veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
    if (gd.ma === "K") {
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Đại Vận trọn đời",
        `So với Dụng Thần ${baoCaoNangCao.laSo.dungThan} · Hỷ Thần ${baoCaoNangCao.laSo.hyThan} · Kỵ Thần ${baoCaoNangCao.laSo.kyThan}`,
        baoCaoNangCao.daiVanBieuDo,
      );
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Lưu Niên — 10 năm tới",
        `Từ năm ${baoCaoNangCao.luuNienBieuDo[0]?.nhan ?? ""} đến ${baoCaoNangCao.luuNienBieuDo.at(-1)?.nhan ?? ""}`,
        baoCaoNangCao.luuNienBieuDo,
      );
    }
  }

  veLuuYVaLienHe(b, f, baoCaoNangCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}

export async function generateBatTuNangCaoPdf(baoCao: BaoCaoNangCao, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  b.giaDong = 6; // giãn dòng cho báo cáo dài, đỡ căng mắt khi đọc trên giấy/PDF (anh Công yêu cầu 1/9/2026)
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Bát Tự Toàn Diện",
    phuDe: "Bản Nâng Cao — Thần Sát, lục thân, sức khỏe, Đại Vận",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  veLaSo(b, f, baoCao.laSo);
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  for (const gd of baoCao.giaiDoan) {
    veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
    if (gd.ma === "K") {
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Đại Vận trọn đời",
        `So với Dụng Thần ${baoCao.laSo.dungThan} · Hỷ Thần ${baoCao.laSo.hyThan} · Kỵ Thần ${baoCao.laSo.kyThan}`,
        baoCao.daiVanBieuDo,
      );
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Lưu Niên — 10 năm tới",
        `Từ năm ${baoCao.luuNienBieuDo[0]?.nhan ?? ""} đến ${baoCao.luuNienBieuDo.at(-1)?.nhan ?? ""}`,
        baoCao.luuNienBieuDo,
      );
    }
  }

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}
