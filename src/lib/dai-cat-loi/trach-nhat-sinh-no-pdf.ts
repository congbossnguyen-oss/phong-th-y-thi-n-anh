/**
 * PHIẾU PDF — Trạch Nhật Sinh Nở. Dựng từ `PhanTichTrachNhatKetQua` (đã tính sẵn), dùng khung PDF
 * chung `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán — TRẢ ĐỦ theo `06-phan-xu-ban-
 * giao.md` §3: tứ trụ đầy đủ, nhật chủ/vượng suy/gốc/Ấn/lưu thông, dụng-kỵ, Mệnh-Thân-Cục Tử Vi,
 * Tuần-Triệt, chuỗi Đại Vận kèm năm dương lịch + Đại Hạn, khuyết điểm KHÔNG được giấu.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, LE, type But, type Fonts } from "./pdf-khung";
import type { PhanTichTrachNhatKetQua } from "../trach-nhat-sinh-no";
import type { BirthCandidate, CandidateSummaryCard } from "../trach-nhat-sinh-no/types";

const BAND_NHAN: Record<string, string> = {
  rat_thuan: "Rất thuận", thuan: "Thuận", trung_binh: "Trung bình", thu_thach: "Có thử thách", nghich: "Nghịch",
};
const BAND_MAU: Record<string, import("pdf-lib").RGB> = {
  rat_thuan: MAU.luc, thuan: MAU.luc, trung_binh: MAU.vang, thu_thach: MAU.vang, nghich: MAU.son,
};

function timUngVien(all: BirthCandidate[], id: string | undefined): BirthCandidate | undefined {
  return id ? all.find((c) => c.id === id) : undefined;
}

function vePhuongAn(b: But, f: Fonts, tieuDe: string, card: CandidateSummaryCard, candidate: BirthCandidate | undefined): void {
  b.muc(tieuDe);
  const moc = b.danhDau();
  b.dong(`Ngày: ${card.ngayDuongLich}  ·  Khung giờ: ${card.khungGio}`, { size: 10.5, font: f.dam });
  b.dong(`Tứ trụ: ${card.tuTru}`, { size: 9.5, font: f.vua });
  b.dong(`Nhật Chủ vượng suy: ${card.vuongSuy}  ·  Dụng Thần: ${card.dungThan}`, { size: 9.5 });
  b.dong(`Tử Vi — Cung Mệnh: ${card.cungMenh}  ·  Cục: ${card.cuc}`, { size: 9.5 });

  if (candidate?.baziAnalysis) {
    const bt = candidate.baziAnalysis;
    b.dong(`Gốc: lớp ${bt.goc.lop ?? "—"} (${bt.goc.diemThongCan} điểm thông căn)  ·  Ấn tinh: ${bt.anTinh.dienGiai}`, { size: 8.5, mau: MAU.mucNhat });
    b.dong(`Ngũ hành lưu thông: ${bt.luuThong.dienGiai.join(" ")}`, { size: 8.5, mau: MAU.mucNhat });
    if (bt.daiVan.length > 0) {
      b.dong("Chuỗi Đại Vận Bát Tự:", { size: 9, font: f.vua, x: LE + 4 });
      for (const v of bt.daiVan) {
        b.chua(13);
        const w = b.nhan(BAND_NHAN[v.band] ?? v.band, LE + 16, b.y - 2.5, { mau: BAND_MAU[v.band] ?? MAU.mucNhat, size: 7.5 });
        b.dong(
          `${v.canChi} (${v.tuTuoi}–${v.denTuoi} tuổi, ~${v.namDuongLich})${v.xungNguyetChi ? " — xung nguyệt chi" : ""}${v.xungNhatChi ? " — xung nhật chi" : ""}`,
          { size: 8.5, x: LE + 16 + w + 6, dan: 3 },
        );
      }
    }
  }
  if (candidate?.tuViAnalysis) {
    const tv = candidate.tuViAnalysis;
    b.dong(`Thân cư: ${tv.than_cu}  ·  Tuổi khởi hạn: ${tv.tuoiKhoiHan}`, { size: 8.5, mau: MAU.mucNhat });
    if (tv.chinhTinhMenh.length > 0) b.dong(`Chính tinh Mệnh: ${tv.chinhTinhMenh.map((s) => `${s.ten} (${s.trangThai})`).join(", ")}`, { size: 8.5, mau: MAU.mucNhat });
    if (tv.daiHan.length > 0) {
      b.dong("Đại Hạn Tử Vi:", { size: 9, font: f.vua, x: LE + 4 });
      for (const h of tv.daiHan) {
        b.doan(`• ${h.tuTuoi}–${h.denTuoi} tuổi: cung ${h.cungName}${h.soSatTinhTuTap > 0 ? `, ${h.soSatTinhTuTap} sát tinh tụ` : ""}${h.bietTuanTriet ? ", có Tuần/Triệt" : ""}`, { size: 8.5, x: LE + 16 });
      }
    }
  }

  if (card.diemNoiBat.length > 0) {
    b.dong("Điểm nổi bật:", { size: 9, font: f.vua, mau: MAU.luc, x: LE + 4 });
    for (const d of card.diemNoiBat) b.doan(`✓ ${d}`, { size: 8.5, x: LE + 16, mau: MAU.luc });
  }
  b.dong("Khuyết điểm cần lưu ý (không gỡ được):", { size: 9, font: f.vua, mau: MAU.son, x: LE + 4 });
  for (const d of card.diemCanLuuY) b.doan(`△ ${d}`, { size: 8.5, x: LE + 16, mau: MAU.son });

  // Bốn mặt chấm riêng — không suy từ một điểm tổng (`luan-giai-bat-tu-manh-phai/SKILL.md` Bước 6 & 10).
  if (card.bonLinhVuc?.length) {
    b.dong("Bốn mặt của lá số (chấm riêng từng mặt):", { size: 9, font: f.vua, mau: MAU.vang, x: LE + 4 });
    for (const lv of card.bonLinhVuc) {
      const nhan = lv.danhGia === "tot" ? "Thuận rõ" : lv.danhGia === "kha" ? "Khá thuận" : lv.danhGia === "trung_binh" ? "Trung bình" : "Cần lưu ý";
      b.doan(`• ${lv.nhan} — ${nhan} (Bát Tự ${lv.diemBatTu > 0 ? "+" : ""}${lv.diemBatTu}, Tử Vi ${lv.diemTuVi > 0 ? "+" : ""}${lv.diemTuVi}). ${lv.nhanXet}`, { size: 8.5, x: LE + 16 });
    }
  }

  b.thanhNhan(moc, MAU.vangNhat);
}

export async function generateTrachNhatSinhNoPdf(kq: PhanTichTrachNhatKetQua, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Chọn ngày giờ sinh cho bé",
    phuDe: "Chọn ngày giờ sinh cho bé — kết hợp Bát Tự × Tử Vi",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(4);

  const r = kq.recommendation;
  b.muc("Tổng quan");
  b.dong(`Đã lập ${r.soUngVienSinhRa} ứng viên, còn ${r.soUngVienConLaiSauLoc} phương án đạt đủ tiêu chí sau khi lọc.`, { size: 9.5 });
  b.doan(r.medicalConstraintSummary, { size: 9, mau: MAU.mucNhat });

  if (!r.primary) {
    b.muc("Kết luận");
    b.doan("Không có phương án nào thực sự nổi trội trong khung dự sinh đã cho. Vui lòng nới rộng khung ngày hoặc khung giờ bệnh viện, hoặc liên hệ trực tiếp để được tư vấn thêm.", { size: 10, font: f.dam, mau: MAU.son });
  } else {
    const primaryCandidate = timUngVien(kq.tatCaUngVien, r.primary.candidateId);
    vePhuongAn(b, f, "⭐ Phương án ưu tiên", r.primary, primaryCandidate);

    if (r.decisiveFactors.length > 0) {
      b.muc("Vì sao chọn phương án này?");
      for (const factor of r.decisiveFactors) {
        b.dong(factor.label, { size: 9.5, font: f.vua });
        b.doan(factor.detail, { size: 9, x: LE + 12 });
      }
    }

    r.alternatives.forEach((alt, i) => {
      const c = timUngVien(kq.tatCaUngVien, alt.candidateId);
      vePhuongAn(b, f, `Phương án dự phòng ${i + 2}`, alt, c);
    });
  }

  veLuuYVaLienHe(
    b, f,
    `${r.disclaimer.medical} ${r.disclaimer.metaphysics}`,
  );
  veChanTrang(doc, f);
  return doc.save();
}
