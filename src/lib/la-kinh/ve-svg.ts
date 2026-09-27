// Dựng SVG la kinh (chuỗi markup) từ kết quả tinhLaKinh — 1 nguồn duy nhất cho cả component
// LaKinh.astro (nhúng bằng set:html) LẪN script preview độc lập (render khi chưa chạy được dev
// server). KHÔNG chứa logic phong thủy — chỉ trình bày; mọi số liệu lấy nguyên từ `kq`.
//
// Màu dùng biến CSS của site (var(--color-...)) nên tự đổi theo light/dark. Riêng 2 màu ngữ nghĩa
// cát/hung + chính/linh thần hard-code (đọc tốt ở cả 2 theme), giống các module phong thủy khác.
import { CungMenhBatTrach } from "@thien-anh/rule-engine";
import type { KetQuaLaKinh } from "./engine";

const CX = 440;
const CY = 440;

// Bán kính từng vòng (trong → ngoài).
const R = {
  poolNgoai: 80,
  batTrach: [80, 144],
  tamHop: [144, 200],
  phiTinh: [200, 258],
  daiQuai: [258, 380],
  rim: [380, 404],
  nhanLaBan: 416,
} as const;

const MAU_CAT = "#1f8a70"; // xanh ngọc — vượng/cát
const MAU_HUNG = "#c14a3a"; // chu sa — suy/hung
const MAU_CHINH_THAN = "#1f8a70";
const MAU_LINH_THAN = "#3b6ea5";

function diem(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
}
function fmt(n: number): string {
  return (Math.round(n * 1000) / 1000).toString();
}
function wedge(rTrong: number, rNgoai: number, d1: number, d2: number): string {
  const [x1, y1] = diem(rNgoai, d1);
  const [x2, y2] = diem(rNgoai, d2);
  const [x3, y3] = diem(rTrong, d2);
  const [x4, y4] = diem(rTrong, d1);
  const lon = d2 - d1 > 180 ? 1 : 0;
  return `M${fmt(x1)} ${fmt(y1)}A${rNgoai} ${rNgoai} 0 ${lon} 1 ${fmt(x2)} ${fmt(y2)}L${fmt(x3)} ${fmt(y3)}A${rTrong} ${rTrong} 0 ${lon} 0 ${fmt(x4)} ${fmt(y4)}Z`;
}
function vach(r1: number, r2: number, deg: number, mau: string, w: number, opacity = 1, dash = ""): string {
  const [x1, y1] = diem(r1, deg);
  const [x2, y2] = diem(r2, deg);
  return `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${mau}" stroke-width="${w}" stroke-opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ""} />`;
}
function vongTron(r: number, mau: string, w: number, opacity = 1): string {
  return `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${mau}" stroke-width="${w}" stroke-opacity="${opacity}" />`;
}
function chu(x: number, y: number, s: string, size: number, mau: string, opts: { bold?: boolean; rot?: number; anchor?: string } = {}): string {
  const anchor = opts.anchor ?? "middle";
  const weight = opts.bold ? ' font-weight="700"' : "";
  const rot = opts.rot != null ? ` transform="rotate(${fmt(opts.rot)} ${fmt(x)} ${fmt(y)})"` : "";
  return `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="${size}" fill="${mau}"${weight}${rot}>${s}</text>`;
}

/** Ô có chứa hướng đang xét không (so tâm ô ± nửa bề rộng). */
function laO(centerDeg: number, widthDeg: number, huongMod: number): boolean {
  const d = Math.abs((((huongMod - centerDeg + 540) % 360) - 180));
  return d <= widthDeg / 2 + 1e-6;
}

const FILL_LE = "var(--color-ivory-100)"; // ô lẻ tô nhạt để phân ô, ô chẵn để trong suốt
const VIEN = "var(--color-gold-400)";
const VIEN_MO = "var(--color-gold-500)";
const NEN_CHU = "var(--color-ink-800)";

export function veLaKinhSvg(kq: KetQuaLaKinh): string {
  const huongMod = ((kq.huongDoSo % 360) + 360) % 360;
  const parts: string[] = [];

  // ── Nền + defs ──────────────────────────────────────────────────────────
  parts.push(`<defs>
    <radialGradient id="lk-pool" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="var(--color-ink-950)" />
      <stop offset="70%" stop-color="var(--color-ivory-200)" />
      <stop offset="100%" stop-color="var(--color-ivory-100)" />
    </radialGradient>
    <radialGradient id="lk-rim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--color-gold-500)" stop-opacity="0.10" />
      <stop offset="100%" stop-color="var(--color-gold-400)" stop-opacity="0.22" />
    </radialGradient>
  </defs>`);
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R.rim[1]}" fill="url(#lk-rim)" />`);

  const MAU_ACTIVE = "var(--color-gold-100)";
  const napHighlight = (r1: number, r2: number, w: { startDeg: number; endDeg: number }) =>
    `<path d="${wedge(r1, r2, w.startDeg, w.endDeg)}" fill="${VIEN}" fill-opacity="0.42" stroke="var(--color-gold-300)" stroke-width="2.5" />`;
  // Bỏ phần chú trong ngoặc của tên sao khi vẽ lên vòng (vòng hẹp, dễ đè nhau) — chú đầy đủ vẫn
  // còn ở bảng đọc bên dưới hình.
  const saoNgan = (s: string) => s.replace(/\s*\(.*\)\s*$/, "");

  // ── Vòng 1 Bát Trạch (8 cung; màu nền = cát/hung theo mệnh gia chủ) ────────
  kq.vongBatTrach.forEach((w, i) => {
    const active = laO(w.centerDeg, w.endDeg - w.startDeg, huongMod);
    const info = w.khi ? CungMenhBatTrach.KHI_BAT_TRACH_INFO[w.khi] : null;
    const nen = info ? (info.cat ? MAU_CAT : MAU_HUNG) : FILL_LE;
    const op = info ? 0.16 : i % 2 === 0 ? 0.5 : 0;
    parts.push(`<path d="${wedge(R.batTrach[0], R.batTrach[1], w.startDeg, w.endDeg)}" fill="${nen}" fill-opacity="${op}" />`);
    if (active) parts.push(napHighlight(R.batTrach[0], R.batTrach[1], w));
    const [tx, ty] = diem((R.batTrach[0] + R.batTrach[1]) / 2, w.centerDeg);
    parts.push(chu(tx, ty, w.cung, 15, active ? MAU_ACTIVE : NEN_CHU, { bold: true }));
  });

  // ── Vòng 2 Tam Hợp (8 phương — Thủy pháp trong / Sa pháp ngoài) ───────────
  kq.vongTamHop.forEach((w, i) => {
    const active = laO(w.centerDeg, w.endDeg - w.startDeg, huongMod);
    parts.push(`<path d="${wedge(R.tamHop[0], R.tamHop[1], w.startDeg, w.endDeg)}" fill="${FILL_LE}" fill-opacity="${i % 2 === 0 ? 0.5 : 0}" />`);
    if (active) parts.push(napHighlight(R.tamHop[0], R.tamHop[1], w));
    const [tx, ty] = diem(R.tamHop[0] + 15, w.centerDeg);
    parts.push(chu(tx, ty, saoNgan(w.thuy.sao), 9.5, w.thuy.loai === "cat" ? MAU_CAT : MAU_HUNG, { bold: active }));
    const [sx, sy] = diem(R.tamHop[1] - 14, w.centerDeg);
    parts.push(chu(sx, sy, saoNgan(w.sa.sao), 9.5, w.sa.loai === "cat" ? MAU_CAT : MAU_HUNG, { bold: active }));
  });

  // ── Vòng 3 Huyền Không Phi Tinh (24 sơn) ─────────────────────────────────
  kq.vongPhiTinh.forEach((w, i) => {
    const active = laO(w.centerDeg, w.endDeg - w.startDeg, huongMod);
    parts.push(`<path d="${wedge(R.phiTinh[0], R.phiTinh[1], w.startDeg, w.endDeg)}" fill="${FILL_LE}" fill-opacity="${i % 2 === 0 ? 0.5 : 0}" />`);
    if (active) parts.push(napHighlight(R.phiTinh[0], R.phiTinh[1], w));
    const [tx, ty] = diem((R.phiTinh[0] + R.phiTinh[1]) / 2, w.centerDeg);
    parts.push(chu(tx, ty, w.son, 12, active ? MAU_ACTIVE : NEN_CHU, { bold: active }));
  });

  // ── Vòng 4 Huyền Không Đại Quái (64 quẻ; nền = Chính/Linh Thần) ────────────
  kq.vongDaiQuai.forEach((w) => {
    const active = laO(w.centerDeg, w.endDeg - w.startDeg, huongMod);
    const nen = w.vungKhi === "chinh_than" ? MAU_CHINH_THAN : w.vungKhi === "linh_than" ? MAU_LINH_THAN : FILL_LE;
    const op = w.vungKhi ? 0.13 : 0;
    parts.push(`<path d="${wedge(R.daiQuai[0], R.daiQuai[1], w.startDeg, w.endDeg)}" fill="${nen}" fill-opacity="${op}" />`);
    if (active) parts.push(napHighlight(R.daiQuai[0], R.daiQuai[1], w));
    const lat = w.centerDeg > 90 && w.centerDeg < 270;
    const rTxt = lat ? R.daiQuai[1] - 8 : R.daiQuai[0] + 8;
    const [tx, ty] = diem(rTxt, w.centerDeg);
    parts.push(chu(tx, ty, w.que.tenQue, 10, active ? MAU_ACTIVE : NEN_CHU, { bold: active, rot: lat ? w.centerDeg + 180 : w.centerDeg, anchor: lat ? "end" : "start" }));
  });

  // ── Vạch chia ô (mỗi ranh giới ô) từng vòng ──────────────────────────────
  const veVachVong = (list: { startDeg: number }[], r1: number, r2: number, w: number, op: number) => {
    for (const it of list) parts.push(vach(r1, r2, it.startDeg, VIEN, w, op));
  };
  veVachVong(kq.vongBatTrach, R.batTrach[0], R.batTrach[1], 0.75, 0.5);
  veVachVong(kq.vongTamHop, R.tamHop[0], R.tamHop[1], 0.75, 0.5);
  veVachVong(kq.vongPhiTinh, R.phiTinh[0], R.phiTinh[1], 0.6, 0.35);
  veVachVong(kq.vongDaiQuai, R.daiQuai[0], R.daiQuai[1], 0.5, 0.3);

  // ── 4 nan bát quái (0/90/180/270) — mốc Đại Không Vong ────────────────────
  for (const d of [0, 90, 180, 270]) parts.push(vach(R.poolNgoai, R.daiQuai[1], d, VIEN, 1.25, 0.6, "3 4"));

  // ── Vòng tròn viền phân tách ──────────────────────────────────────────────
  for (const r of [R.batTrach[0], R.batTrach[1], R.tamHop[1], R.phiTinh[1], R.daiQuai[1]]) parts.push(vongTron(r, VIEN, 1.25, 0.85));
  parts.push(vongTron(R.rim[1], VIEN, 2, 1));
  parts.push(vongTron(R.rim[0], VIEN_MO, 1, 0.6));

  // ── Vành độ ngoài cùng (vạch mỗi 15°, số + tên 4 phương mỗi 45°) ──────────
  const TEN_PHUONG: Record<number, string> = { 0: "BẮC", 90: "ĐÔNG", 180: "NAM", 270: "TÂY" };
  for (let d = 0; d < 360; d += 15) {
    const dai = d % 45 === 0;
    parts.push(vach(dai ? R.rim[0] : R.rim[1] - 8, R.rim[1], d, VIEN, dai ? 1.25 : 0.75, dai ? 0.9 : 0.5));
  }
  for (let d = 0; d < 360; d += 45) {
    const [lx, ly] = diem(R.nhanLaBan, d);
    const ten = TEN_PHUONG[d];
    parts.push(chu(lx, ly, ten ?? `${d}°`, ten ? 15 : 11, ten ? VIEN : "var(--color-ink-600)", { bold: !!ten }));
  }

  // ── Kim chỉ Hướng: đường dẫn chu sa + mũi tam giác ở vành ──────────────────
  parts.push(vach(R.poolNgoai, R.rim[0], huongMod, MAU_HUNG, 1.75, 0.65));
  const [mx, my] = diem(R.rim[0] - 2, huongMod);
  const [ml, mln] = diem(R.rim[0] - 16, huongMod - 2.4);
  const [mr, mrn] = diem(R.rim[0] - 16, huongMod + 2.4);
  parts.push(`<path d="M${fmt(mx)} ${fmt(my)}L${fmt(ml)} ${fmt(mln)}L${fmt(mr)} ${fmt(mrn)}Z" fill="${MAU_HUNG}" />`);

  // ── Thiên Trì (tâm) ────────────────────────────────────────────────────────
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R.poolNgoai}" fill="url(#lk-pool)" stroke="${VIEN}" stroke-width="2" />`);
  parts.push(vongTron(R.poolNgoai - 6, VIEN, 0.75, 0.55));
  // Thiên tâm thập đạo (chữ thập mờ)
  parts.push(vach(-(R.poolNgoai - 10), R.poolNgoai - 10, 0, VIEN, 0.6, 0.35));
  const [hx1, hy1] = diem(R.poolNgoai - 10, 90);
  const [hx2, hy2] = diem(R.poolNgoai - 10, 270);
  parts.push(`<line x1="${fmt(hx1)}" y1="${fmt(hy1)}" x2="${fmt(hx2)}" y2="${fmt(hy2)}" stroke="${VIEN}" stroke-width="0.6" stroke-opacity="0.35" />`);
  parts.push(chu(CX, CY - 32, TEN_PHUONG[0], 9, VIEN, {}));
  parts.push(chu(CX, CY - 8, `${fmt(kq.huongDoSo)}°`, 26, "var(--color-gold-300)", { bold: true }));
  parts.push(chu(CX, CY + 18, kq.vanHienHanh != null ? `Vận ${kq.vanHienHanh} · ${kq.namLuan}` : "ngoài bảng Vận", 10.5, "var(--color-ink-700)", {}));

  // min-w giữ hình đủ lớn để đọc 64 ô trên điện thoại — màn hẹp thì cuộn ngang (khung ngoài
  // overflow-x-auto), đúng cách xử lý sơ đồ dày; desktop vẫn co về giữa tối đa 760px.
  return `<svg viewBox="0 0 880 880" role="img" aria-label="La kinh tổng hợp — hướng ${fmt(kq.huongDoSo)} độ" class="mx-auto block w-full min-w-[560px] max-w-[760px]" style="font-family:var(--font-display,Georgia,serif)">${parts.join("")}</svg>`;
}
