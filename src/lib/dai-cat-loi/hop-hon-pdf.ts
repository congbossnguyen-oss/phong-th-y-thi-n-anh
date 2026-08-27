/**
 * PHIẾU PDF — Hợp Hôn Bát Tự × Tử Vi (999.000đ). Dựng từ `HopHonKetQua` (đã tính sẵn), dùng khung
 * PDF chung `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, catVua, MAU, LE, A4, type But, type Fonts } from "./pdf-khung";
import { diemRadarTheoTruc, diemVongTron, type HopHonKetQua, type TrucKetQua, type MucTruc } from "../hop-hon";
import type { RGB } from "pdf-lib";

const MAU_MUC: Record<MucTruc, RGB> = {
  rat_thuan: MAU.luc,
  thuan: MAU.luc,
  can_dieu_chinh: MAU.vang,
  can_can_nhac: MAU.son,
  khong_du_du_lieu: MAU.mucNhat,
};
const NHAN_MUC: Record<MucTruc, string> = {
  rat_thuan: "Rất thuận",
  thuan: "Thuận",
  can_dieu_chinh: "Cần chủ động điều chỉnh",
  can_can_nhac: "Cần luận kỹ",
  khong_du_du_lieu: "Chưa đủ dữ liệu",
};
const MAU_DONG_THUAN: Record<string, RGB> = { cao: MAU.luc, trung: MAU.vang, thap: MAU.son, chua_du_du_lieu: MAU.mucNhat };
const MAU_NHAN_TONG_QUAN: Record<HopHonKetQua["nhanTongQuan"], RGB> = {
  rat_thuan: MAU.luc, thuan: MAU.luc, can_chu_dong_dieu_chinh: MAU.vang, nen_gap_chuyen_gia: MAU.son,
};

const BAN_KINH_RADAR = 85;

/**
 * Radar ngũ giác "Bản đồ 5 trục" — dùng chung hình học `diemRadarTheoTruc`/`diemVongTron` với bản
 * SVG trên trang web (hop-hon.astro) nên hai bản luôn khớp nhau. Vẽ VIỀN vùng dữ liệu bằng các đoạn
 * thẳng nối tiếp thay vì tô nền — pdf-lib không có API tô đa giác tuỳ ý an toàn như canvas, còn
 * `drawSvgPath` lại lật trục y kiểu SVG khác hẳn quy ước y-hướng-lên đang dùng xuyên suốt file này,
 * dễ vẽ sai mà không lỗi rõ ràng để phát hiện.
 */
function veRadarPdf(b: But, f: Fonts, ketQua: HopHonKetQua): void {
  const cao = BAN_KINH_RADAR * 2 + 50;
  b.chua(cao);
  b.xuong(6);
  const cx = A4.w / 2;
  const cy = b.y - 14 - BAN_KINH_RADAR;
  const diems = diemRadarTheoTruc(ketQua.cacTruc);
  const toaDo = (goc: number, tyLe: number) => {
    const { dx, dy } = diemVongTron(goc, tyLe);
    return { x: cx + dx * BAN_KINH_RADAR, y: cy + dy * BAN_KINH_RADAR };
  };

  for (const tyLe of [0.25, 0.5, 0.75, 1]) {
    const pts = diems.map((d) => toaDo(d.goc, tyLe));
    for (let i = 0; i < pts.length; i++) {
      b.page.drawLine({ start: pts[i]!, end: pts[(i + 1) % pts.length]!, thickness: 0.6, color: MAU.vangNhat });
    }
  }
  for (const d of diems) {
    b.page.drawLine({ start: { x: cx, y: cy }, end: toaDo(d.goc, 1), thickness: 0.6, color: MAU.vangNhat });
  }

  const ptsDuLieu = diems.map((d) => toaDo(d.goc, d.tyLe));
  for (let i = 0; i < ptsDuLieu.length; i++) {
    b.page.drawLine({ start: ptsDuLieu[i]!, end: ptsDuLieu[(i + 1) % ptsDuLieu.length]!, thickness: 1.8, color: MAU.vang });
  }
  diems.forEach((d, i) => {
    const p = ptsDuLieu[i]!;
    b.page.drawEllipse({ x: p.x, y: p.y, xScale: 3.2, yScale: 3.2, color: MAU_MUC[d.muc] });
  });

  const size = 7.5;
  for (const d of diems) {
    const p = toaDo(d.goc, 1.22);
    const chu = catVua(d.ten, f.vua, size, 92);
    const w = f.vua.widthOfTextAtSize(chu, size);
    const { dx } = diemVongTron(d.goc, 1);
    const x = dx > 0.3 ? p.x : dx < -0.3 ? p.x - w : p.x - w / 2;
    b.page.drawText(chu, { x, y: p.y - size / 2.6, size, font: f.vua, color: MAU.muc });
  }

  b.y = cy - BAN_KINH_RADAR - 26;
}

function veTruc(b: But, f: Fonts, t: TrucKetQua): void {
  const moc = b.danhDau();
  b.chua(20);
  const mau = MAU_MUC[t.muc];
  const w = b.nhan(NHAN_MUC[t.muc], LE, b.y - 3, { mau, size: 8.5 });
  b.dong(t.ten, { size: 12, font: f.dam, x: LE + w + 10, dan: 4 });
  b.doan(t.tomTat, { size: 9.5, x: LE + 12 });
  if (t.canCu.length > 0) {
    b.xuong(2);
    for (const c of t.canCu) b.doan(`· ${c}`, { size: 8.5, x: LE + 12, mau: MAU.mucNhat });
  }
  if (t.dieuChinh) {
    b.xuong(3);
    b.doan(`Nên làm: ${t.dieuChinh}`, { size: 9, font: f.vua, x: LE + 12, mau: MAU.vang });
  }
  b.thanhNhan(moc, mau);
  b.xuong(8);
}

export async function generateHopHonPdf(kq: HopHonKetQua, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Hợp Hôn Bát Tự × Tử Vi",
    phuDe: "Bản đồ 5 trục — không chấm điểm phán quyết",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  // --- Tổng quan ---
  b.muc("Tổng quan");
  b.nhan(kq.tenNhanTongQuan, LE, b.y - 4, { mau: MAU_NHAN_TONG_QUAN[kq.nhanTongQuan], size: 11 });
  b.xuong(18);
  b.doan(kq.cauTongQuan, { size: 10 });
  b.doan("Bản đồ này KHÔNG chấm điểm số — mỗi trục được luận riêng.", { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });

  // --- Hai lá số ---
  b.xuong(6);
  b.muc("Hai lá số");
  for (const [nhan, ls] of [["Người thứ nhất", kq.laSoA], ["Người thứ hai", kq.laSoB]] as const) {
    b.dong(nhan, { size: 10, font: f.vua, dan: 2 });
    b.doan(ls.tuTru, { size: 9.5, x: LE + 12, font: f.vua });
    b.doan(`Nhật Chủ ${ls.nhatChu} · Dụng Thần ${ls.dungThan} · Hỷ ${ls.hyThan} · Kỵ ${ls.kyThan}`, { size: 9, x: LE + 12 });
    if (!ls.gioSinhBiet) b.doan("⚠ Chưa có giờ sinh — kết quả ở mức tương đối, phần Tử Vi không chạy.", { size: 8.5, x: LE + 12, mau: MAU.vang });
    b.xuong(4);
  }

  // --- Sơ loại năm sinh ---
  b.muc("Vòng sơ loại theo năm sinh");
  b.doan(`${kq.soLoaiNamSinh.nhan} (${kq.soLoaiNamSinh.diem}/10)`, { size: 10, font: f.vua });
  b.doan("Tầng này chỉ đọc năm sinh (nạp âm, thiên can, địa chi, cung phi) — năm trục dưới đây mới luận theo đủ lá số.", { size: 8.5, mau: MAU.mucNhat });

  // --- 5 trục ---
  b.muc("Bản đồ 5 trục");
  veRadarPdf(b, f, kq);
  b.dongGiua("Càng ra ngoài rìa càng thuận; \"chưa đủ dữ liệu\" đặt ở giữa (trung tính), không phải điểm xấu.", {
    size: 8, font: f.nghieng, mau: MAU.mucNhat,
  });
  b.xuong(6);
  for (const t of kq.cacTruc) veTruc(b, f, t);

  // --- Đồng thuận 2 hệ ---
  b.muc("Mức đồng thuận Bát Tự × Tử Vi");
  const moc = b.danhDau();
  b.doan(kq.dongThuanHaiHe.moTa, { size: 9.5, x: LE + 12 });
  b.thanhNhan(moc, MAU_DONG_THUAN[kq.dongThuanHaiHe.muc] ?? MAU.mucNhat);
  b.xuong(6);

  // --- Điểm mạnh / cần điều chỉnh ---
  b.muc("Điểm mạnh của cặp này");
  for (const d of kq.diemManh) b.doan(`✓ ${d}`, { size: 9.5, x: LE + 12, mau: MAU.luc });
  b.xuong(4);
  b.muc("Cần chủ động vun đắp");
  if (kq.canDieuChinh.length > 0) {
    for (const d of kq.canDieuChinh) b.doan(`→ ${d}`, { size: 9.5, x: LE + 12, mau: MAU.vang });
  } else {
    b.doan("Không có điểm nào cần điều chỉnh gấp — giữ nếp hiện tại là được.", { size: 9.5, x: LE + 12 });
  }

  veLuuYVaLienHe(b, f, kq.disclaimer);
  veChanTrang(doc, f);
  return doc.save();
}
