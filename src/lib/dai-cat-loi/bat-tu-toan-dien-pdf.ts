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
  const cao = 8;
  b.chua(cao + 30);
  b.dong(`Vượng Suy: ${pct}% — ${capDo}`, { size: 9, font: f.dam, mau: MAU.muc, dan: 6 });
  b.xuong(3); // tách nhãn ra khỏi thanh 1 chút cho thoáng.
  const rong = A4.w - LE * 2;
  const yDay = b.y - cao;
  b.page.drawRectangle({ x: LE, y: yDay, width: rong, height: cao, color: XAM_NHAT, opacity: 0.4 });
  b.page.drawRectangle({ x: LE, y: yDay, width: (rong * pct) / 100, height: cao, color: MAU.vang });
  // ⚠️ Con trỏ dòng phải hạ xuống HẲN dưới đáy thanh (yDay), cộng thêm khoảng đệm — nếu chỉ b.xuong
  // nhỏ thì dòng chữ kế (Điều Hậu) có phần thân chữ nhô lên đè vào thanh (anh Công báo 2/9/2026:
  // "chữ điều hậu đang bị chèn bởi đồ hình"). Đặt b.y tuyệt đối theo đáy thanh cho chắc.
  b.y = yDay - 12;
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
  b.xuong(8); // tách lưới Tứ Trụ với dòng chữ bên dưới, tránh cảm giác bí bách (anh Công 2/9/2026).

  b.doan(`Ngày sinh (dương lịch): ${ngaySinhDuongChu(laSo.ngaySinhDuong)}  ·  Giới tính: ${laSo.gioiTinh}`, { size: 9.5, font: f.vua });
  b.doan(`Nhật Chủ: ${laSo.nhatChu}`, { size: 9.5 });

  b.xuong(6); // hạ hàng pill Dụng/Hỷ/Kỵ Thần xuống 1 chút, tách khỏi dòng Nhật Chủ (anh Công 2/9/2026).
  b.chua(16);
  let x = LE;
  const nhanThan = (nhan: string, mau: RGB) => {
    x += b.nhan(nhan, x, b.y - 2.5, { mau, size: 8 }) + 6;
  };
  nhanThan(`Dụng Thần ${laSo.dungThan}`, MAU.luc);
  nhanThan(`Hỷ Thần ${laSo.hyThan}`, MAU.lam);
  nhanThan(`Kỵ Thần ${laSo.kyThan}`, MAU.son);
  b.xuong(24);

  veNguHanhPentagon(b, f, laSo.tuTru);
  b.xuong(10);
  veGaugeVuongSuy(b, f, laSo.diemVuongSuy, laSo.capDoVuongSuy);

  if (laSo.dieuHauNote) {
    b.xuong(2);
    b.doan(`Điều Hậu: ${laSo.dieuHauNote}`, { size: 9.5, mau: MAU.vang });
  }
  b.xuong(6);
}

const KHIA_CANH: { khoa: keyof Pick<DiemGiaiDoanVan, "sucKhoe" | "congViec" | "taiLoc" | "lucThan">; nhan: string; mau: RGB }[] = [
  // Màu 4 lĩnh vực đồng bộ với app "Xem Thời Vận" (MAU_LINH_VUC ở xem-thoi-van.astro) để 2 nơi nhìn nhất quán.
  { khoa: "sucKhoe", nhan: "Sức khỏe", mau: hex("#7fb8a0") },
  { khoa: "congViec", nhan: "Công việc", mau: hex("#8f6bff") },
  { khoa: "taiLoc", nhan: "Tài lộc", mau: hex("#f1c85a") },
  { khoa: "lucThan", nhan: "Lục thân", mau: hex("#e8a45c") },
];

/** Nhãn trục X ngắn gọn cho 1 mốc — Đại Vận lấy tuổi bắt đầu ("4-13" → "4"), Lưu Niên lấy nguyên nhãn (năm). */
function nhanTrucX(d: DiemGiaiDoanVan): string {
  return /^\d+\s*[-–]/.test(d.tuoi) ? d.tuoi.split(/[-–]/)[0].trim() : d.nhan;
}

/** Chú giải 4 lĩnh vực (chấm màu + tên) + ghi chú "cao = thuận lợi" — thay cho chú giải heatmap cũ. */
function veChuGiaiLinhVuc(b: But, f: Fonts): void {
  let x = LE;
  const o = 7;
  for (const kc of KHIA_CANH) {
    b.page.drawEllipse({ x: x + o / 2, y: b.y - o / 2, xScale: o / 2, yScale: o / 2, color: kc.mau });
    b.page.drawText(kc.nhan, { x: x + o + 3, y: b.y - o + 1, size: 6.5, font: f.thuong, color: MAU.mucNhat });
    x += o + 3 + f.thuong.widthOfTextAtSize(kc.nhan, 6.5) + 12;
  }
  b.page.drawText("(đường/cột càng cao càng thuận lợi)", { x, y: b.y - o + 1, size: 6.5, font: f.nghieng, color: MAU.mucNhat });
  b.xuong(o + 5);
}

/** Đồ thị ĐƯỜNG — 4 lĩnh vực xuyên suốt danh sách Đại Vận (small-multiples, mỗi lĩnh vực 1 dòng
 *  sparkline). Bản PDF của "4 lĩnh vực xuyên suốt cả đời" trong app Xem Thời Vận. Điểm -2..2 map
 *  vào chiều cao dòng; đường vàng đứt = mốc hiện tại thì không cần (PDF tĩnh). */
function veDoThi4LinhVucDuong(b: But, f: Fonts, danhSach: DiemGiaiDoanVan[]): void {
  const NHAN_RONG = 54;
  const caoDong = 26;
  const rongVe = A4.w - LE * 2 - NHAN_RONG;
  const x0 = LE + NHAN_RONG;
  const n = danhSach.length;
  const xTai = (i: number) => (n === 1 ? x0 + rongVe / 2 : x0 + (rongVe * i) / (n - 1));
  const yTai = (yTop: number, v: number) => yTop - caoDong / 2 - (Math.max(-2, Math.min(2, v)) / 2) * (caoDong / 2 - 2);

  b.chua(caoDong * KHIA_CANH.length + 16);
  for (const kc of KHIA_CANH) {
    const yTop = b.y;
    // Đường nền 0 (trung tính) mờ + tên lĩnh vực bên trái.
    b.page.drawLine({ start: { x: x0, y: yTop - caoDong / 2 }, end: { x: x0 + rongVe, y: yTop - caoDong / 2 }, thickness: 0.4, color: XAM_NHAT, opacity: 0.5 });
    b.page.drawText(kc.nhan, { x: LE, y: yTop - caoDong / 2 - 3, size: 7.5, font: f.vua, color: MAU.muc });
    // Đường nối các điểm + chấm tròn mỗi mốc.
    const diem = danhSach.map((d, i) => ({ x: xTai(i), y: yTai(yTop, d[kc.khoa]) }));
    for (let i = 1; i < diem.length; i++) {
      b.page.drawLine({ start: diem[i - 1], end: diem[i], thickness: 1.4, color: kc.mau });
    }
    for (const p of diem) b.page.drawEllipse({ x: p.x, y: p.y, xScale: 1.8, yScale: 1.8, color: kc.mau });
    b.y = yTop - caoDong;
  }

  // Trục X: nhãn tuổi/năm ngay dưới dòng cuối.
  for (let i = 0; i < n; i++) {
    const nhan = nhanTrucX(danhSach[i]);
    b.page.drawText(nhan, { x: xTai(i) - f.thuong.widthOfTextAtSize(nhan, 6) / 2, y: b.y, size: 6, font: f.thuong, color: MAU.mucNhat });
  }
  b.xuong(12);
}

/** Đồ hình CỘT NHÓM — mỗi mốc 1 cụm 4 cột (Sức khỏe/Công việc/Tài lộc/Lục thân). Bản PDF của
 *  "Xu hướng 10 năm" trong app Xem Thời Vận. Dùng cho Lưu Niên. */
function veBieuDoCot4LinhVuc(b: But, f: Fonts, danhSach: DiemGiaiDoanVan[]): void {
  const caoVe = 42;
  const rongVe = A4.w - LE * 2;
  const n = danhSach.length || 1;
  const nhomW = rongVe / n;
  const cotW = (nhomW - 3) / KHIA_CANH.length;

  b.chua(caoVe + 16);
  const yDay = b.y - caoVe;
  b.page.drawLine({ start: { x: LE, y: yDay }, end: { x: LE + rongVe, y: yDay }, thickness: 0.5, color: XAM_NHAT, opacity: 0.6 });

  danhSach.forEach((d, i) => {
    const x0 = LE + i * nhomW + 1.5;
    KHIA_CANH.forEach((kc, j) => {
      const v = Math.max(-2, Math.min(2, d[kc.khoa]));
      const h = ((v + 2) / 4) * caoVe; // -2 → 0px, 2 → full — cột cao = thuận lợi.
      b.page.drawRectangle({ x: x0 + j * cotW, y: yDay, width: cotW * 0.82, height: Math.max(h, 0.6), color: kc.mau });
    });
    const nhan = nhanTrucX(d);
    b.page.drawText(nhan, { x: LE + i * nhomW + nhomW / 2 - f.thuong.widthOfTextAtSize(nhan, 6) / 2, y: yDay - 9, size: 6, font: f.thuong, color: MAU.mucNhat });
  });
  b.y = yDay - 12;
  b.xuong(6);
}

/**
 * Khối đồ hình Đại Vận / Lưu Niên. `kieu`: "duong" (biểu đồ đường 4 lĩnh vực xuyên suốt — dùng cho
 * Đại Vận cả đời) hoặc "cot" (biểu đồ cột nhóm — dùng cho Lưu Niên). Anh Công 2/9/2026: PDF nên có
 * đồ hình phong phú như app (Xem Thời Vận), bớt chữ — thay bảng nhiệt (heatmap) cũ bằng đúng 2 loại
 * biểu đồ app đang dùng, chú giải màu theo LĨNH VỰC (không phải thang -2..2 như trước).
 */
function veBieuDoGiaiDoan(b: But, f: Fonts, tieuDe: string, moTa: string, danhSach: DiemGiaiDoanVan[], kieu: "duong" | "cot"): void {
  if (danhSach.length === 0) return;
  b.chua(34 + 14 + 4 + 16 + (kieu === "duong" ? 26 * KHIA_CANH.length : 42) + 20);
  b.muc(tieuDe);
  b.doan(moTa, { size: 8, mau: MAU.mucNhat });
  b.xuong(4);
  veChuGiaiLinhVuc(b, f);

  if (kieu === "duong") veDoThi4LinhVucDuong(b, f, danhSach);
  else veBieuDoCot4LinhVuc(b, f, danhSach);
  b.xuong(4);

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

  b.xuong(18); // hạ dòng "Kính gửi" xuống cho cân đối với đầu trang (anh Công 2/9/2026, chỉnh thêm).
  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(10);

  veLaSo(b, f, baoCao.laSo);
  b.doan(baoCao.disclaimerDauBai, { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });
  b.xuong(6);

  veMoiNangCap(b, f, baoCao.moiDaiVan, baoCao.moiLuuNien);

  b.muc("Luận giải chi tiết");
  b.xuong(6); // tách gạch chân của mục với pill giai đoạn đầu tiên (Nền tảng) — anh Công 2/9/2026.
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

  b.xuong(18); // hạ dòng "Kính gửi" xuống cho cân đối với đầu trang (anh Công 2/9/2026, chỉnh thêm).
  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(10);

  veLaSo(b, f, baoCaoCoBan.laSo);
  b.doan(baoCaoCoBan.disclaimerDauBai, { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  b.xuong(6); // tách gạch chân của mục với pill giai đoạn đầu tiên (Nền tảng) — anh Công 2/9/2026.
  for (const gd of baoCaoCoBan.giaiDoan) veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
  for (const gd of baoCaoNangCao.giaiDoan) {
    veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
    if (gd.ma === "K") {
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Đại Vận trọn đời",
        `So với Dụng Thần ${baoCaoNangCao.laSo.dungThan} · Hỷ Thần ${baoCaoNangCao.laSo.hyThan} · Kỵ Thần ${baoCaoNangCao.laSo.kyThan}`,
        baoCaoNangCao.daiVanBieuDo,
        "duong",
      );
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Lưu Niên — 10 năm tới",
        `Từ năm ${baoCaoNangCao.luuNienBieuDo[0]?.nhan ?? ""} đến ${baoCaoNangCao.luuNienBieuDo.at(-1)?.nhan ?? ""}`,
        baoCaoNangCao.luuNienBieuDo,
        "cot",
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

  b.xuong(18); // hạ dòng "Kính gửi" xuống cho cân đối với đầu trang (anh Công 2/9/2026, chỉnh thêm).
  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(10);

  veLaSo(b, f, baoCao.laSo);
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  b.xuong(6); // tách gạch chân của mục với pill giai đoạn đầu tiên (Nền tảng) — anh Công 2/9/2026.
  for (const gd of baoCao.giaiDoan) {
    veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
    if (gd.ma === "K") {
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Đại Vận trọn đời",
        `So với Dụng Thần ${baoCao.laSo.dungThan} · Hỷ Thần ${baoCao.laSo.hyThan} · Kỵ Thần ${baoCao.laSo.kyThan}`,
        baoCao.daiVanBieuDo,
        "duong",
      );
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Lưu Niên — 10 năm tới",
        `Từ năm ${baoCao.luuNienBieuDo[0]?.nhan ?? ""} đến ${baoCao.luuNienBieuDo.at(-1)?.nhan ?? ""}`,
        baoCao.luuNienBieuDo,
        "cot",
      );
    }
  }

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}
