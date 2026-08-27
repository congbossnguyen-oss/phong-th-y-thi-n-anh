// Bản vẽ PDF (pdf-lib) tương ứng bieuDo.ts — dùng CHUNG hình học (toaDoDinh) và màu (mauTheoDiem) với
// bản SVG trên web để 2 nơi không lệch nhau, chỉ khác kỹ thuật vẽ (đường/hình thay vì thẻ SVG).

import { rgb, type RGB } from "pdf-lib";
import { A4, LE, MAU, hex, catVua, type But, type Fonts } from "../../dai-cat-loi/pdf-khung";
import { mauTheoDiem, toaDoDinh, NHAN_RADAR_6 } from "./bieuDo";
import type { DuLieuLaSoTuVi, CungDuLieu } from "./adapter";
import { GIO_RANGE_THEO_CHI } from "./adapter";
import { TRUNG_TINH_CAT, TRUNG_TINH_HUNG } from "./chamDiem";

const XAM_NHAT = rgb(0.75, 0.72, 0.66);

/** Radar 6 lĩnh vực — vẽ khung lưới mờ + trục + đa giác điểm (viền, không tô, để khỏi cần path-fill
 *  phức tạp trên pdf-lib) + chấm màu theo điểm ở mỗi đỉnh + nhãn tên/điểm quanh ngoài. */
export function veRadarPdf(b: But, f: Fonts, diem: Record<string, number>): void {
  const rMax = 66;
  const CAO = rMax * 2 + 66;
  b.chua(CAO);
  const cx = A4.w / 2;
  const cy = b.y - 22 - rMax;
  const n = NHAN_RADAR_6.length;

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

  const diemVertex = NHAN_RADAR_6.map((d, i) => {
    const v = diem[d.key] ?? 3;
    return { ...toaDoDinh(i, n, cx, cy, (rMax * v) / 5, true), v, label: d.label };
  });
  for (let i = 0; i < n; i++) {
    b.page.drawLine({ start: diemVertex[i], end: diemVertex[(i + 1) % n], thickness: 1.6, color: hex("#ad8843") });
  }
  for (const p of diemVertex) {
    b.page.drawEllipse({ x: p.x, y: p.y, xScale: 3, yScale: 3, color: hex(mauTheoDiem(p.v)) });
  }

  for (let i = 0; i < n; i++) {
    const p = toaDoDinh(i, n, cx, cy, rMax + 22, true);
    const v = diemVertex[i].v;
    const nhan = `${diemVertex[i].label} ${v}/5`;
    const size = 8;
    const w = f.dam.widthOfTextAtSize(nhan, size);
    const dx = Math.abs(p.x - cx) < 2 ? w / 2 : p.x > cx ? 0 : w;
    b.page.drawText(nhan, { x: p.x - dx, y: p.y - size / 2, size, font: f.dam, color: hex(mauTheoDiem(v)) });
  }

  b.y = cy - rMax - 26;
}

/** Thanh điểm 12 cung — 1 hàng/cung: tên cung + track màu xám + thanh tô theo điểm + số điểm. */
export function veThanhDiem12CungPdf(b: But, f: Fonts, cung: { ten: string; diem: number }[]): void {
  const nhanRong = 92;
  const soRong = 26;
  const rongTrack = A4.w - LE * 2 - nhanRong - soRong - 8;
  const xTrack = LE + nhanRong;
  const danh = [...cung].sort((a, bItem) => bItem.diem - a.diem);
  for (const c of danh) {
    b.chua(15);
    const yDay = b.y - 8;
    b.page.drawText(c.ten, { x: LE, y: b.y - 8, size: 8.5, font: f.vua, color: MAU.muc });
    b.page.drawRectangle({ x: xTrack, y: yDay, width: rongTrack, height: 6, color: XAM_NHAT, opacity: 0.35 });
    b.page.drawRectangle({ x: xTrack, y: yDay, width: (rongTrack * c.diem) / 5, height: 6, color: hex(mauTheoDiem(c.diem)) });
    b.page.drawText(`${c.diem}/5`, { x: xTrack + rongTrack + 8, y: b.y - 8, size: 8, font: f.dam, color: hex(mauTheoDiem(c.diem)) });
    b.xuong(15);
  }
}

/** Thanh tiến trình Đại Hạn trên trục tuổi 0-90 — dải màu highlight đúng khoảng tuổi Đại Hạn hiện tại,
 *  vạch đứng đánh dấu tuổi đang xem. */
export function veThanhDaiHanPdf(
  b: But,
  f: Fonts,
  daiHan: { tuoiTu: number; tuoiDen: number; diem: number },
  tuoiHienTai: number | null,
): void {
  b.chua(46);
  const rong = A4.w - LE * 2;
  const cao = 8;
  const yDay = b.y - cao;
  const pct = (tuoi: number) => Math.min(1, Math.max(0, tuoi / 90));
  b.page.drawRectangle({ x: LE, y: yDay, width: rong, height: cao, color: XAM_NHAT, opacity: 0.3 });
  const x1 = LE + rong * pct(daiHan.tuoiTu);
  const x2 = LE + rong * pct(daiHan.tuoiDen);
  b.page.drawRectangle({ x: x1, y: yDay, width: x2 - x1, height: cao, color: hex(mauTheoDiem(daiHan.diem)) });
  if (tuoiHienTai !== null) {
    const xt = LE + rong * pct(tuoiHienTai);
    b.page.drawLine({ start: { x: xt, y: yDay - 3 }, end: { x: xt, y: yDay + cao + 3 }, thickness: 1.6, color: MAU.muc });
  }
  b.xuong(cao + 4);
  b.page.drawText("0 tuổi", { x: LE, y: b.y, size: 7.5, font: f.thuong, color: MAU.mucNhat });
  const chu90 = "90 tuổi";
  b.page.drawText(chu90, { x: A4.w - LE - f.thuong.widthOfTextAtSize(chu90, 7.5), y: b.y, size: 7.5, font: f.thuong, color: MAU.mucNhat });
  b.xuong(14);
}

// --- Lá số Tử Vi 12 cung (lưới 4×4) — bản PDF của LaSoTuViGrid.astro (web), cùng dữ liệu/cùng
// nguyên tắc màu (cát/bình/hung theo điểm engine, cát/hung phụ tinh theo TRUNG_TINH_CAT/HUNG). ---

const NEN_O: Record<"cat" | "binh" | "hung", RGB> = { cat: hex("#F0FDF4"), binh: hex("#FFFFFF"), hung: hex("#FEF2F2") };
const VIEN_O: Record<"cat" | "binh" | "hung", RGB> = { cat: hex("#86EFAC"), binh: hex("#E2E8F0"), hung: hex("#FCA5A5") };
const NHAN_DG_O: Record<"cat" | "binh" | "hung", { chu: string; mau: RGB }> = {
  cat: { chu: "Tốt", mau: hex("#166534") },
  binh: { chu: "Bình", mau: hex("#64748B") },
  hung: { chu: "Cần lưu ý", mau: hex("#B91C1C") },
};
const MAU_TRANG_THAI_O: Record<string, RGB> = {
  "Miếu": hex("#166534"), "Vượng": hex("#15803D"), "Đắc": hex("#0369A1"), "Bình": hex("#64748B"), "Hãm": hex("#B91C1C"),
};
const MAU_VANG_DAM = hex("#B8860B");

/** Vị trí (hàng, cột) 1-indexed trong lưới 4×4, hàng 1 ở trên cùng — khớp bố cục CSS grid-area
 *  của bản web (Tỵ-Ngọ-Mùi-Thân hàng trên, Dần-Sửu-Tý-Hợi hàng dưới). */
const VI_TRI_PDF: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

function danhGiaCuaPdf(diem: number): "cat" | "binh" | "hung" {
  if (diem >= 4) return "cat";
  if (diem === 3) return "binh";
  return "hung";
}

function textGiuaO(
  page: But["page"],
  text: string,
  font: Fonts["thuong"],
  size: number,
  cx: number,
  y: number,
  color: RGB,
  rongToiDa: number,
): void {
  const chu = catVua(text, font, size, rongToiDa);
  page.drawText(chu, { x: cx - font.widthOfTextAtSize(chu, size) / 2, y, size, font, color });
}

function veOCung(b: But, f: Fonts, c: CungDuLieu, x: number, yTop: number, cw: number, ch: number): void {
  const dg = danhGiaCuaPdf(c.diem);
  b.page.drawRectangle({ x, y: yTop - ch, width: cw, height: ch, color: NEN_O[dg] });
  b.page.drawRectangle({
    x, y: yTop - ch, width: cw, height: ch,
    borderColor: c.isMenh ? MAU_VANG_DAM : VIEN_O[dg],
    borderWidth: c.isMenh ? 1.6 : 1,
  });

  const padX = 5;
  const cx = x + cw / 2;
  let y = yTop - 11;

  // Dòng đầu: Can Chi (trái) + khoảng tuổi Đại Hạn (phải).
  b.page.drawText(`${c.canThienBan} ${c.chi}`, { x: x + padX, y, size: 6.5, font: f.dam, color: MAU.mucNhat });
  const dvText = `${c.daiVanTuoi[0]}–${c.daiVanTuoi[1]}`;
  b.page.drawText(dvText, { x: x + cw - padX - f.dam.widthOfTextAtSize(dvText, 6.5), y, size: 6.5, font: f.dam, color: MAU.mucNhat });
  y -= 11;

  // Tên cung (+ THÂN nếu trùng).
  textGiuaO(b.page, `${c.ten}${c.isThan ? " · THÂN" : ""}`, f.dam, 7.5, cx, y, c.isMenh ? MAU_VANG_DAM : MAU.muc, cw - padX * 2);
  y -= 12;

  // Chính tinh — tối đa 2 dòng để không tràn ô.
  if (c.chinhTinh.length === 0) {
    textGiuaO(b.page, "Vô Chính Diệu", f.nghieng, 7.5, cx, y, hex("#94A3B8"), cw - padX * 2);
    y -= 11;
  } else {
    for (const s of c.chinhTinh.slice(0, 2)) {
      textGiuaO(b.page, `${s.ten} (${s.trangThai})`, f.dam, 7.5, cx, y, MAU_TRANG_THAI_O[s.trangThai] ?? MAU.muc, cw - padX * 2);
      y -= 10;
    }
  }

  // Badge Hóa/cát/hung — gộp thành 1 dòng ngắn gọn, cắt cho vừa.
  const nhan: string[] = [];
  for (const s of c.chinhTinh) if (s.tuHoa) nhan.push(`Hóa ${s.tuHoa}`);
  for (const s of c.phuTinh) if (s.tuHoa) nhan.push(`Hóa ${s.tuHoa}`);
  const catTinh = c.phuTinh.filter((s) => TRUNG_TINH_CAT.has(s.ten)).map((s) => s.ten);
  const hungTinh = c.phuTinh.filter((s) => TRUNG_TINH_HUNG.has(s.ten)).map((s) => s.ten);
  const dongPhu = [...nhan, ...catTinh, ...hungTinh].join(" · ");
  if (dongPhu) {
    textGiuaO(b.page, dongPhu, f.thuong, 6, cx, y, MAU.mucNhat, cw - padX * 2);
  }

  // Chân ô: Tuần/Triệt (trái) + đánh giá (phải).
  const yChan = yTop - ch + 8;
  const tt = c.tuan && c.triet ? "TUẦN·TRIỆT" : c.tuan ? "TUẦN" : c.triet ? "TRIỆT" : "";
  if (tt) b.page.drawText(tt, { x: x + padX, y: yChan, size: 6, font: f.dam, color: hex("#B45309") });
  const nhanDg = NHAN_DG_O[dg].chu;
  b.page.drawText(nhanDg, {
    x: x + cw - padX - f.dam.widthOfTextAtSize(nhanDg, 6),
    y: yChan, size: 6, font: f.dam, color: NHAN_DG_O[dg].mau,
  });
}

/** Lá số Tử Vi 12 cung — lưới 4×4, giữa là ô thông tin chung (Mệnh/Cục/Tứ trụ/Khởi đại hạn). */
export function veLaSoPdf(b: But, f: Fonts, duLieu: DuLieuLaSoTuVi): void {
  const cw = (A4.w - LE * 2) / 4;
  const ch = 90;
  b.chua(ch * 4 + 6);
  const top = b.y;

  for (const c of duLieu.cung) {
    const [row, col] = VI_TRI_PDF[c.chiIndex];
    veOCung(b, f, c, LE + (col - 1) * cw, top - (row - 1) * ch, cw, ch);
  }

  // Ô giữa (2×2, hàng 2-3 / cột 2-3) — nền đậm, chữ vàng, thông tin chung.
  const midX = LE + cw;
  const midY = top - ch;
  const midW = cw * 2;
  const midH = ch * 2;
  b.page.drawRectangle({ x: midX, y: midY - midH, width: midW, height: midH, color: hex("#2b2013") });
  b.page.drawRectangle({ x: midX, y: midY - midH, width: midW, height: midH, borderColor: MAU_VANG_DAM, borderWidth: 1.2 });
  const cxMid = midX + midW / 2;
  let yMid = midY - 22;
  const khungGio = GIO_RANGE_THEO_CHI[duLieu.gioChiName] ?? "";
  textGiuaO(b.page, "LÁ SỐ TỬ VI", f.dam, 10, cxMid, yMid, hex("#e8cf8f"), midW - 16); yMid -= 16;
  textGiuaO(b.page, `${duLieu.ngaySinhDuong} · giờ ${duLieu.gioSinh}h (${duLieu.gioChiName}${khungGio ? `, ${khungGio}` : ""})`, f.thuong, 7.5, cxMid, yMid, rgb(1, 1, 1), midW - 16); yMid -= 16;
  textGiuaO(b.page, "Tứ trụ", f.thuong, 7, cxMid, yMid, hex("#c9bda3"), midW - 16); yMid -= 11;
  textGiuaO(b.page, duLieu.tuTru, f.dam, 8, cxMid, yMid, rgb(1, 1, 1), midW - 16); yMid -= 18;
  textGiuaO(b.page, `${duLieu.cucName} — ${duLieu.banMenhNapAm}`, f.dam, 8.5, cxMid, yMid, hex("#e8cf8f"), midW - 16); yMid -= 13;
  textGiuaO(b.page, `Khởi đại hạn: ${duLieu.tuoiKhoiHan} tuổi`, f.thuong, 7.5, cxMid, yMid, hex("#c9bda3"), midW - 16);

  b.y = top - ch * 4 - 8;

  // Chú giải màu.
  const chu: [string, RGB, RGB][] = [
    ["Cung tốt", NEN_O.cat, VIEN_O.cat], ["Bình", NEN_O.binh, VIEN_O.binh], ["Cần lưu ý", NEN_O.hung, VIEN_O.hung],
  ];
  let xChu = LE;
  for (const [nhanChu, nen, vien] of chu) {
    b.page.drawRectangle({ x: xChu, y: b.y - 8, width: 8, height: 8, color: nen, borderColor: vien, borderWidth: 1 });
    b.page.drawText(nhanChu, { x: xChu + 11, y: b.y - 7, size: 7, font: f.thuong, color: MAU.mucNhat });
    xChu += 11 + f.thuong.widthOfTextAtSize(nhanChu, 7) + 14;
  }
  b.xuong(16);
}
