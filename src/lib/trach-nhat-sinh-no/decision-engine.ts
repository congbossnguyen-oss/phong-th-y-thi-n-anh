/**
 * VÒNG 7 — Giải thích quyết định + bàn giao, đúng `references/06-phan-xu-ban-giao.md` §3. Rule-based
 * hoàn toàn (không LLM ở Giai đoạn 1) — mọi câu chữ dựng sẵn từ dữ liệu đã tính, luôn nêu khuyết
 * điểm, không hứa hẹn kết quả (đúng §51 SKILL gốc).
 */
import type { BirthCandidate, CandidateSummaryCard, DecisionFactor, FinalBirthRecommendation, SelectionStatus } from "./types";
import type { NgayXepHang } from "./ranking";

const BAND_NHAN: Record<string, string> = {
  rat_thuan: "rất thuận", thuan: "thuận", trung_binh: "trung bình", thu_thach: "có thử thách", nghich: "nghịch",
};

export function dungTheCard(c: BirthCandidate): CandidateSummaryCard {
  const bt = c.baziAnalysis!;
  const tv = c.tuViAnalysis!;
  const ngayDuongLich = `${String(c.date.day).padStart(2, "0")}/${String(c.date.month).padStart(2, "0")}/${c.date.year}`;
  const tuTru = `${bt.tuTru.nam.can} ${bt.tuTru.nam.chi} / ${bt.tuTru.thang.can} ${bt.tuTru.thang.chi} / ${bt.tuTru.ngay.can} ${bt.tuTru.ngay.chi} / ${bt.tuTru.gio.can} ${bt.tuTru.gio.chi}`;

  const diemNoiBat: string[] = [];
  const diemCanLuuY: string[] = [];

  if (bt.vuongSuy === "Trung hòa") diemNoiBat.push("Vượng suy Trung hòa — nền tảng bền, dụng thần linh hoạt theo vận.");
  if (bt.goc.lop === "A" || bt.goc.lop === "B") diemNoiBat.push(`Gốc lớp ${bt.goc.lop} — Nhật Chủ vững, không chỉ có căn suông.`);
  if (bt.anTinh.muc === "dep") diemNoiBat.push("Ấn tinh đúng liều — có chỗ dựa, không bị bao bọc quá mức.");
  if (bt.anTinh.hoaDuocQuanSat) diemNoiBat.push("Ấn hóa được Quan Sát — cấu trúc đáng săn nhất theo tài liệu.");
  if (bt.dungThanChatLuong.coMat && bt.dungThanChatLuong.coCan) diemNoiBat.push(`Dụng Thần ${bt.dungThan} có mặt và có căn trong nguyên cục — dùng được ngay, không phải chờ vận.`);
  if (bt.luuThong.matXichDut.length === 0 && bt.luuThong.matXichNghen.length === 0) diemNoiBat.push("Ngũ hành lưu thông trọn vòng, không đứt không nghẽn.");
  const vanCaoNhatThuan = bt.daiVan.filter((v) => v.trongSo === "cao_nhat").every((v) => v.band === "rat_thuan" || v.band === "thuan");
  if (vanCaoNhatThuan && bt.daiVan.some((v) => v.trongSo === "cao_nhat")) diemNoiBat.push("Đại Vận giai đoạn 25–45 tuổi (lập nghiệp, đỉnh sự nghiệp) thuận dụng thần.");
  // Chỉ khen "không có cờ đỏ" khi ĐỦ 3 điều: không Tuần/Triệt, không sát tinh, VÀ chính tinh thủ
  // Mệnh không hãm địa (anh Công phát hiện 22/8/2026: lá Mệnh Tham Lang hãm vẫn bị khen nhầm).
  const chinhTinhMenhHam = tv.chinhTinhMenh.length > 0 && tv.chinhTinhMenh.every((s) => s.trangThai === "Hãm");
  if (!tv.veto.menhBiTuanTriet && tv.veto.soSatTinhHoiMenh === 0 && !chinhTinhMenhHam && tv.chinhTinhMenh.length > 0) {
    diemNoiBat.push(`Tử Vi: Mệnh có ${tv.chinhTinhMenh.map((s) => `${s.ten} (${s.trangThai})`).join(", ")}, không Tuần/Triệt, không sát tinh hội — không có cờ đỏ chính.`);
  }
  if (tv.than_cu === "Mệnh" || tv.than_cu === "Quan Lộc" || tv.than_cu === "Phúc Đức") diemNoiBat.push(`Thân cư ${tv.than_cu} — ${tv.than_cu === "Phúc Đức" ? "hưởng phúc ấm" : "tự chủ, sự nghiệp rõ"}.`);

  if (bt.goc.lop === "C" || bt.goc.lop === "D") diemCanLuuY.push(`Gốc chỉ lớp ${bt.goc.lop} — gốc xa hoặc mỏng, phát muộn hoặc cần thêm ngoại lực.`);
  if (!bt.dungThanChatLuong.coMat || !bt.dungThanChatLuong.coCan) diemCanLuuY.push(bt.dungThanChatLuong.dienGiai);
  else if (bt.dungThanChatLuong.kyThanThauCanDacLenh) diemCanLuuY.push(bt.dungThanChatLuong.dienGiai);
  if (bt.anTinh.muc === "thua") diemCanLuuY.push("Ấn hơi thừa (Nhật Chủ đã vượng) — dễ được bao bọc, cần môi trường khuyến khích tự lập.");
  if (bt.anTinh.muc === "du") diemCanLuuY.push("Ấn ở mức đủ dùng, chưa tới mức lý tưởng.");
  if (bt.luuThong.matXichDut.length > 0) diemCanLuuY.push(`Mắt xích Ngũ Hành yếu/đứt: ${bt.luuThong.matXichDut.join(", ")}.`);
  if (bt.luuThong.matXichNghen.length > 0) diemCanLuuY.push(`Mắt xích nghẽn: ${bt.luuThong.matXichNghen.join(", ")}.`);
  if (bt.tuHinhTuTruHinh.length > 0) diemCanLuuY.push(`Phát hiện: ${bt.tuHinhTuTruHinh.join(", ")}.`);
  const vanXungTrongCaoNhat = bt.daiVan.filter((v) => v.trongSo === "cao_nhat" && (v.xungNguyetChi || v.xungNhatChi));
  if (vanXungTrongCaoNhat.length > 0) diemCanLuuY.push(`Đại Vận ${vanXungTrongCaoNhat.map((v) => v.canChi).join(", ")} (giai đoạn 25–45 tuổi) xung nguyên cục — cần lưu ý giai đoạn này.`);
  if (tv.veto.soSatTinhHoiMenh > 0) diemCanLuuY.push(`Có ${tv.veto.soSatTinhHoiMenh} sát tinh hội Mệnh (${tv.veto.satTinhHoiMenh.join(", ")}) — chưa tới ngưỡng loại nhưng nên lưu ý.`);
  if (chinhTinhMenhHam) diemCanLuuY.push(`Chính tinh thủ Mệnh hãm địa (${tv.chinhTinhMenh.map((s) => s.ten).join(", ")}) — sao chủ mệnh không phát huy hết được.`);
  const hanTuanTriet = tv.daiHan.filter((h) => h.bietTuanTriet);
  if (hanTuanTriet.length > 0) {
    diemCanLuuY.push(`${hanTuanTriet.length}/${tv.daiHan.length} Đại Hạn trùng Tuần/Triệt (${hanTuanTriet.map((h) => `${h.tuTuoi}–${h.denTuoi}t`).join(", ")}) — các giai đoạn này dễ trắc trở hơn.`);
  }
  if (tv.than_cu === "Thiên Di") diemCanLuuY.push("Thân cư Thiên Di — đời có thể xa nhà/phiêu bạt, do ngoại cảnh định.");
  if (diemCanLuuY.length === 0) diemCanLuuY.push("Chưa phát hiện khuyết điểm lớn trong phạm vi tính toán Giai đoạn 1 — vẫn cần đối chiếu thêm khi có đủ dữ liệu cha mẹ/phương vị.");

  return {
    candidateId: c.id,
    ngayDuongLich,
    khungGio: c.khungGio,
    tuTru,
    vuongSuy: bt.vuongSuy,
    dungThan: bt.dungThan,
    cungMenh: tv.cungMenh,
    cuc: tv.cuc,
    diemNoiBat,
    diemCanLuuY,
  };
}

function xayDungFactors(top: NgayXepHang, card: CandidateSummaryCard, hangThuNhi?: NgayXepHang): DecisionFactor[] {
  const bt = top.ungVienTotNhat.baziAnalysis!;
  const tv = top.ungVienTotNhat.tuViAnalysis!;
  const factors: DecisionFactor[] = [
    { label: "1. Ngày này tốt hơn ở đâu?", detail: `Vượng suy ${bt.vuongSuy}, gốc lớp ${bt.goc.lop ?? "—"}, Ấn tinh ${bt.anTinh.muc === "dep" ? "đúng liều" : bt.anTinh.muc}, ${bt.luuThong.matXichDut.length === 0 && bt.luuThong.matXichNghen.length === 0 ? "Ngũ Hành lưu thông trọn vòng" : "Ngũ Hành lưu thông có điểm cần lưu ý"}.` },
    { label: "2. Giờ này tốt hơn ở đâu (trong số các giờ còn lại của ngày)?", detail: `Cung Mệnh tại ${tv.cungMenh}, Thân cư ${tv.than_cu}, ${tv.veto.soSatTinhHoiMenh === 0 ? "không sát tinh hội Mệnh" : `${tv.veto.soSatTinhHoiMenh} sát tinh hội Mệnh`}, ${tv.veto.menhBiTuanTriet ? "⚠️ có Tuần/Triệt" : "Mệnh không Tuần/Triệt"}.` },
    { label: "3. Đại Vận có ưu thế gì?", detail: bt.daiVan.filter((v) => v.trongSo === "cao_nhat").map((v) => `${v.canChi} (${v.tuTuoi}-${v.denTuoi}t, ~${v.namDuongLich}): ${BAND_NHAN[v.band]}`).join("; ") || "Chưa đủ dữ liệu Đại Vận giai đoạn trọng số cao." },
    { label: "4. Tử Vi xác nhận điều gì?", detail: `Cục ${tv.cuc}, tuổi khởi hạn ${tv.tuoiKhoiHan}. ${tv.chinhTinhMenh.length > 0 ? `Chính tinh Mệnh: ${tv.chinhTinhMenh.map((s) => `${s.ten} (${s.trangThai})`).join(", ")}.` : "Mệnh Vô Chính Diệu."}` },
    { label: "5. Điểm yếu còn lại là gì?", detail: card.diemCanLuuY.join(" ") },
  ];
  if (hangThuNhi) {
    const bt2 = hangThuNhi.ungVienTotNhat.baziAnalysis!;
    factors.push({ label: "6. Vì sao phương án dự phòng thấp hạng hơn?", detail: `Ngày ${hangThuNhi.ngay}: vượng suy ${bt2.vuongSuy}, gốc lớp ${bt2.goc.lop ?? "—"} — điểm cấu trúc tổng hợp thấp hơn phương án chính.` });
  }
  return factors;
}

export function ketLuanCuoiCung(params: {
  xepHangNgay: NgayXepHang[];
  soUngVienSinhRa: number;
  soUngVienConLaiSauLoc: number;
  medicalConstraintSummary: string;
}): FinalBirthRecommendation {
  const { xepHangNgay, soUngVienSinhRa, soUngVienConLaiSauLoc, medicalConstraintSummary } = params;
  const disclaimer = {
    medical: "Chỉ định y khoa của bác sĩ luôn là quyết định cuối cùng — kết quả dưới đây chỉ được chọn trong khung thời gian y tế cho phép.",
    metaphysics: "Ngày giờ sinh là một biến trong nhiều biến của cuộc đời — giáo dục và môi trường nuôi dưỡng quan trọng không kém. Đây là định hướng theo mô hình phân tích cấu trúc lá số, không phải lời hứa hẹn hay tiên tri chắc chắn.",
  };

  if (xepHangNgay.length === 0) {
    return {
      alternatives: [], selectionStatus: "no_good_option",
      decisiveFactors: [], unresolvedRisks: ["Không có phương án nào thực sự nổi trội trong khung dự sinh đã cho."],
      soUngVienSinhRa, soUngVienConLaiSauLoc, medicalConstraintSummary, disclaimer,
    };
  }

  const top = xepHangNgay[0]!;
  const primaryCard = dungTheCard(top.ungVienTotNhat);
  const alternatives = xepHangNgay.slice(1, 3).map((n) => dungTheCard(n.ungVienTotNhat));

  const selectionStatus: SelectionStatus =
    xepHangNgay.length === 1 ? "limited_options" : top.diemDaiDien >= 8 ? "strong_recommendation" : "recommendation";

  return {
    primary: primaryCard,
    alternatives,
    selectionStatus,
    decisiveFactors: xayDungFactors(top, primaryCard, xepHangNgay[1]),
    unresolvedRisks: primaryCard.diemCanLuuY,
    soUngVienSinhRa,
    soUngVienConLaiSauLoc,
    medicalConstraintSummary,
    disclaimer,
  };
}
