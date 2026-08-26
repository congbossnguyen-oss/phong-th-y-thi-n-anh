// Bản vẽ PDF (pdf-lib) tương ứng bieuDo.ts — dùng CHUNG hình học (toaDoDinh) và màu (mauTheoDiem) với
// bản SVG trên web để 2 nơi không lệch nhau, chỉ khác kỹ thuật vẽ (đường/hình thay vì thẻ SVG).

import { rgb } from "pdf-lib";
import { A4, LE, MAU, hex, type But, type Fonts } from "../../dai-cat-loi/pdf-khung";
import { mauTheoDiem, toaDoDinh, NHAN_RADAR_6 } from "./bieuDo";

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
