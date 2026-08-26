// ĐỒ HÌNH dùng chung cho trang web (SVG) và PDF (pdf-lib) — chỉ NHẬN điểm đã chấm sẵn từ chamDiem.ts,
// không tự suy luận/tính lại. Tách riêng để 1 chỗ đổi màu/hình học là đổi đồng bộ cả web lẫn PDF.

/** Thang màu 1-5: đỏ (cần cẩn trọng) → cam → vàng đồng (cát hung lẫn lộn) → xanh (tốt/rất tốt) — bám
 *  đúng các màu accent cố định của site (cinnabar/gold/success, xem global.css) để không lệch tông. */
const MAU_HEX: Record<number, string> = {
  1: "#e35c4d", // --color-danger-500
  2: "#c9714a", // pha giữa cinnabar-500 và gold-400
  3: "#c9a256", // --color-gold-400
  4: "#8fa85a", // pha giữa gold-400 và success-500
  5: "#5a9c6c", // --color-success-500
};

export function mauTheoDiem(diem: number): string {
  return MAU_HEX[Math.min(5, Math.max(1, Math.round(diem)))] ?? MAU_HEX[3];
}

export const NHAN_RADAR_6: { key: string; label: string }[] = [
  { key: "cong_danh", label: "Công Danh" },
  { key: "tai_loc", label: "Tài Lộc" },
  { key: "tinh_duyen", label: "Tình Duyên" },
  { key: "suc_khoe", label: "Sức Khỏe" },
  { key: "gia_dao", label: "Gia Đạo" },
  { key: "quan_he_xa_hoi", label: "Quan Hệ XH" },
];

/** Toạ độ 1 đỉnh trên vòng tròn bán kính `r`, đỉnh 0 ở đúng 12h rồi xoay thuận chiều kim đồng hồ.
 *  `yUp=true` cho hệ trục PDF (y tăng lên trên); `yUp=false` cho SVG/HTML (y tăng xuống dưới). */
export function toaDoDinh(index: number, tongSo: number, cx: number, cy: number, r: number, yUp: boolean): { x: number; y: number } {
  const theta = -Math.PI / 2 + index * ((2 * Math.PI) / tongSo);
  const x = cx + r * Math.cos(theta);
  const y = yUp ? cy - r * Math.sin(theta) : cy + r * Math.sin(theta);
  return { x, y };
}

/** Vẽ radar 6 lĩnh vực dạng SVG (dùng thẳng trên web, server-render — không cần JS client). */
export function veRadarSvg(diem: Record<string, number>, opt: { size?: number } = {}): string {
  const size = opt.size ?? 280;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const rMax = size * 0.32;
  const n = NHAN_RADAR_6.length;

  const vien = (r: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = toaDoDinh(i, n, cx, cy, r, false);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

  const luoi = [1, 2, 3, 4, 5].map((muc) => `<polygon points="${vien((rMax * muc) / 5)}" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>`).join("");
  const truc = NHAN_RADAR_6.map((_, i) => {
    const p = toaDoDinh(i, n, cx, cy, rMax, false);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="currentColor" stroke-opacity="0.18" stroke-width="1"/>`;
  }).join("");

  const diemPoly = NHAN_RADAR_6.map((d, i) => {
    const v = diem[d.key] ?? 3;
    const p = toaDoDinh(i, n, cx, cy, (rMax * v) / 5, false);
    return { ...p, v };
  });
  const polyPoints = diemPoly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const cham = diemPoly
    .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="${mauTheoDiem(p.v)}" stroke="#fff" stroke-width="1"/>`)
    .join("");

  const nhanHtml = NHAN_RADAR_6.map((d, i) => {
    const v = diem[d.key] ?? 3;
    const p = toaDoDinh(i, n, cx, cy, rMax + 26, false);
    const anchor = Math.abs(p.x - cx) < 4 ? "middle" : p.x > cx ? "start" : "end";
    return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="11" font-weight="700" fill="currentColor">${d.label}</text>` +
      `<text x="${p.x.toFixed(1)}" y="${(p.y + 13).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="10" font-weight="800" fill="${mauTheoDiem(v)}">${v}/5</text>`;
  }).join("");

  const MAU_KHOI = "#ad8843"; // --color-gold-500 — màu khối dữ liệu, tách khỏi màu từng đỉnh (theo điểm)
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="auto" style="max-width:${size}px;color:var(--color-ink-600,#7a5f45);overflow:visible;">
    ${luoi}${truc}
    <polygon points="${polyPoints}" fill="${MAU_KHOI}" fill-opacity="0.22" stroke="${MAU_KHOI}" stroke-width="2" />
    ${cham}
    ${nhanHtml}
  </svg>`;
}
