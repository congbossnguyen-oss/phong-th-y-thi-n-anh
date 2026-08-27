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

    // Giờ Tý vắt qua mốc đổi ngày — không còn loại (xem hard-filter L6) nhưng PHẢI cảnh báo, vì đây
    // là vấn đề xác định đúng lá số: sinh 23h00–23h59 thì Can Ngày đã tính sang ngày hôm sau.
    if (c.chiGio === "Tý") {
      c.redFlags.push({
        source: "bazi", severity: "medium", code: "L6_GIO_TY_MOC_DOI_NGAY",
        title: "Giờ Tý (23h–01h) nằm ở mốc đổi ngày",
        explanation: "Khung này vắt qua ranh giới ngày: sinh từ 23h00 đến trước 00h00 thì Trụ Ngày đã tính sang ngày hôm sau, còn từ 00h00 đến 01h00 vẫn thuộc ngày hiện tại — hai trường hợp cho ra lá số KHÁC NHAU. Nếu chọn khung này, gia đình cần chốt thật rõ mốc giờ với bệnh viện và báo lại để lập chính xác.",
      });
    }

    c.status = "FINALIST";
  }

  const finalists = tatCaUngVien.filter((c) => c.status === "FINALIST");
  finalists.forEach((c) => { c.status = "RANKED"; });
  const xepHangNgay = xepHangKhongCongDiemCheo(finalists, input.familyPriority);
  if (xepHangNgay[0]) xepHangNgay[0].ungVienTotNhat.status = "RECOMMENDED";

  // Đủ 12 canh giờ, không loại vì lịch bệnh viện (anh Công chốt 27/8/2026).
  const soNgoaiKhung = tatCaUngVien.filter((c) => c.ngoaiKhungGioBenhVien).length;
  const medicalConstraintSummary =
    soNgoaiKhung > 0
      ? `Đã chấm đủ 12 canh giờ mỗi ngày theo mệnh lý. Trong đó ${soNgoaiKhung}/${soUngVienSinhRa} khung giờ nằm ngoài lịch mổ gia đình khai — vẫn được xét và xếp hạng bình thường, chỉ ghi chú lại để gia đình tiện thu xếp với bệnh viện.`
      : "Đã chấm đủ 12 canh giờ mỗi ngày theo mệnh lý — không loại giờ nào vì lý do lịch bệnh viện.";

  // Phễu lọc — đếm số còn sống sót sau TỪNG chặng, để vẽ đồ hình "sinh ra bao nhiêu, rụng ở đâu".
  const quaYTe = tatCaUngVien.filter((c) => c.medicalEligible).length;
  const quaLocCung = quaYTe - soLoaiLocCung;
  const quaNguongGoc = quaLocCung - soLoaiNguongGoc;
  const phezuLoc: BuocPhezuLoc[] = [
    { ten: "Lập ứng viên", giaiThich: "Mỗi ngày trong khung dự sinh × đủ 12 canh giờ Địa Chi.", conLai: soUngVienSinhRa, loai: 0 },
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
