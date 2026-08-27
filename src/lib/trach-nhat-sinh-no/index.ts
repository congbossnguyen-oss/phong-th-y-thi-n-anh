/**
 * ĐIỂM VÀO DUY NHẤT — Giai đoạn 1: sinh ứng viên → lọc cứng L1–L8 → ngưỡng chất lượng gốc → chấm
 * cấu trúc + Đại Vận → lớp Tử Vi (phủ quyết) → xếp hạng không cộng điểm chéo → kết luận.
 *
 * Toàn bộ THUẦN CÔNG THỨC (deterministic) — không gọi AI, không phát sinh chi phí Anthropic.
 */
import { sinhTatCaUngVien } from "./candidate-generator";
import { locCungL1L8 } from "./hard-filter-bat-tu";
import { chamCauTrucBatTu } from "./structural-bat-tu";
import { tinhDaiVanBand } from "./dai-van-band";
import { chamLopTuVi } from "./tu-vi-layer";
import { chamBonLinhVuc } from "./bon-linh-vuc";
import { xepHangKhongCongDiemCheo, duoiNguongChatLuongGoc } from "./ranking";
import { ketLuanCuoiCung } from "./decision-engine";
import type { BirthSelectionInput, BirthCandidate, BuocPhezuLoc, FinalBirthRecommendation } from "./types";

export * from "./types";

export interface PhanTichTrachNhatKetQua {
  recommendation: FinalBirthRecommendation;
  tatCaUngVien: BirthCandidate[]; // đủ 36-120, dùng cho chế độ chuyên gia (Giai đoạn 3)
  thongKeLoai: Record<string, number>; // đếm số ứng viên loại theo từng lý do (mã L1-L8, GOC_DUOI_NGUONG, ZW_*, MEDICAL_*)
}

function ghiThongKe(thongKe: Record<string, number>, ma: string): void {
  thongKe[ma] = (thongKe[ma] ?? 0) + 1;
}

export function phanTichTrachNhatSinhNo(input: BirthSelectionInput): PhanTichTrachNhatKetQua {
  const thongKeLoai: Record<string, number> = {};
  let soLoaiLocCung = 0;
  let soLoaiNguongGoc = 0;
  const tatCaUngVien = sinhTatCaUngVien(input);
  const soUngVienSinhRa = tatCaUngVien.length;
  const soDaLocYTe = tatCaUngVien.filter((c) => !c.medicalEligible).length;

  for (const c of tatCaUngVien) {
    if (!c.medicalEligible) { ghiThongKe(thongKeLoai, "MEDICAL_REJECTED"); continue; }

    // Vòng 2 — lọc cứng L1-L8.
    const { chart, reasons } = locCungL1L8({ date: c.date, hourRepr: c.hourRepr, chiGio: c.chiGio, gender: input.babyGender });
    if (reasons.length > 0) {
      c.status = "BAZI_REJECTED";
      c.hardFilterRejections = reasons;
      reasons.forEach((r) => ghiThongKe(thongKeLoai, r.code));
      soLoaiLocCung++;
      continue;
    }

    // Vòng 3 — chấm cấu trúc Bát Tự.
    const baziAnalysis = chamCauTrucBatTu(chart, input.babyGender);
    if (duoiNguongChatLuongGoc(baziAnalysis)) {
      c.status = "BAZI_REJECTED";
      c.hardFilterRejections = [{ code: "L3", title: "Chất lượng gốc dưới ngưỡng", explanation: `Gốc lớp ${baziAnalysis.goc.lop ?? "—"} / ${baziAnalysis.goc.diemThongCan} điểm thông căn — dưới ngưỡng tối thiểu (03-cham-diem-bat-tu.md §2).` }];
      ghiThongKe(thongKeLoai, "GOC_DUOI_NGUONG");
      soLoaiNguongGoc++;
      continue;
    }

    // Vòng 5 §1-3 — Đại Vận băng.
    baziAnalysis.daiVan = tinhDaiVanBand(chart, baziAnalysis.dungThan, baziAnalysis.hyThan, baziAnalysis.kyThan, c.date);
    c.baziAnalysis = baziAnalysis;
    c.status = "BAZI_SURVIVOR";

    // Vòng 4 — lớp Tử Vi (phủ quyết).
    const { analysis: tuViAnalysis, redFlags } = chamLopTuVi({ day: c.date.day, month: c.date.month, year: c.date.year, hourRepr: c.hourRepr, gender: input.babyGender });
    c.tuViAnalysis = tuViAnalysis;
    c.redFlags = redFlags;

    const coCriticalZw = redFlags.some((f) => f.severity === "critical");
    if (coCriticalZw) {
      c.status = "ZIWEI_REJECTED";
      redFlags.filter((f) => f.severity === "critical").forEach((f) => ghiThongKe(thongKeLoai, f.code));
      continue;
    }

    // Chấm RIÊNG 4 mặt (Sức khỏe · Gia đạo · Tài vận · Nhân duyên) — bắt buộc tách riêng, không suy
    // từ điểm phú quý (`luan-giai-bat-tu-manh-phai/SKILL.md` Bước 6 & 10).
    c.bonLinhVuc = chamBonLinhVuc(baziAnalysis, tuViAnalysis, chart, input.babyGender);

    c.status = "FINALIST";
  }

  const finalists = tatCaUngVien.filter((c) => c.status === "FINALIST");
  finalists.forEach((c) => { c.status = "RANKED"; });
  const xepHangNgay = xepHangKhongCongDiemCheo(finalists, input.familyPriority);
  if (xepHangNgay[0]) xepHangNgay[0].ungVienTotNhat.status = "RECOMMENDED";

  const medicalConstraintSummary =
    input.deliveryMode === "scheduled_c_section"
      ? `Đã lọc theo khung giờ bệnh viện cho phép mổ (${soDaLocYTe}/${soUngVienSinhRa} ứng viên bị loại vì ngoài khung y tế).`
      : "Sinh thường / chưa rõ hình thức sinh — chưa giả định chọn được giờ chính xác, kết quả chỉ mang tính tham khảo cho việc chọn NGÀY.";

  // Phễu lọc — đếm số còn sống sót sau TỪNG chặng, để vẽ đồ hình "sinh ra bao nhiêu, rụng ở đâu".
  const quaYTe = tatCaUngVien.filter((c) => c.medicalEligible).length;
  const quaLocCung = quaYTe - soLoaiLocCung;
  const quaNguongGoc = quaLocCung - soLoaiNguongGoc;
  const phezuLoc: BuocPhezuLoc[] = [
    { ten: "Lập ứng viên", giaiThich: "Mỗi ngày trong khung dự sinh × 12 khung giờ Địa Chi.", conLai: soUngVienSinhRa, loai: 0 },
    { ten: "Khung giờ y tế", giaiThich: "Chỉ giữ những khung giờ bệnh viện cho phép.", conLai: quaYTe, loai: soUngVienSinhRa - quaYTe },
    { ten: "Lọc cứng Bát Tự", giaiThich: "Xung khắc trong tứ trụ, thiếu hành, thiếu gốc, thiếu Ấn tinh, nghi Tòng Cách.", conLai: quaLocCung, loai: quaYTe - quaLocCung },
    { ten: "Ngưỡng gốc Nhật Chủ", giaiThich: "Gốc phải đạt tối thiểu lớp C và đủ điểm thông căn.", conLai: quaNguongGoc, loai: quaLocCung - quaNguongGoc },
    { ten: "Phủ quyết Tử Vi", giaiThich: "Loại lá số có Mệnh bị Tuần/Triệt, nhiều sát tinh hội Mệnh, chuỗi Đại Hạn xấu.", conLai: finalists.length, loai: quaNguongGoc - finalists.length },
  ];

  const recommendation = ketLuanCuoiCung({
    xepHangNgay,
    soUngVienSinhRa,
    soUngVienConLaiSauLoc: finalists.length,
    medicalConstraintSummary,
    phezuLoc,
    thongKeLoai,
  });

  return { recommendation, tatCaUngVien, thongKeLoai };
}
