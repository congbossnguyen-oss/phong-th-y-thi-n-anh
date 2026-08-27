/**
 * PHIẾU PDF — Hợp Hôn Bát Tự × Tử Vi (999.000đ). Dựng từ `HopHonKetQua` (đã tính sẵn), dùng khung
 * PDF chung `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, LE, type But, type Fonts } from "./pdf-khung";
import type { HopHonKetQua, TrucKetQua, MucTruc } from "../hop-hon";
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
