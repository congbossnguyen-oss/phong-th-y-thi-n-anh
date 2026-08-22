/**
 * CÂU CHỐT DƯỚI MỖI ĐỒ HÌNH — ý lấy từ 3 mẫu dashboard anh Công gửi 22/8/2026: mẫu nào cũng có một
 * câu in nghiêng ngay dưới tiêu đề biểu đồ nói thẳng kết luận ("Nov. 2014 recorded the highest gross
 * profit"), để người xem không biết đọc biểu đồ vẫn nắm được ý.
 *
 * Toàn bộ câu ở đây dựng từ dữ liệu ĐÃ TÍNH, không phỏng đoán, không gọi AI.
 */
import type { BaziAnalysis, DaiVanBandItem, TuViAnalysis, TuViDaiHanBandItem, CandidateSummaryCard } from "./types";

const BAND_DIEM_SONG: Record<string, number> = {
  rat_thuan: 5, thuan: 2.5, trung_binh: 0, thu_thach: -2.5, nghich: -5,
};

/** Điểm sóng của một Đại Vận Bát Tự — dùng chung cho biểu đồ và câu chốt. */
export function diemSongDaiVan(v: DaiVanBandItem): number {
  return BAND_DIEM_SONG[v.band] ?? 0;
}

function khoangTuoi(a: { tuTuoi: number; denTuoi: number }): string {
  return `${a.tuTuoi}–${a.denTuoi} tuổi`;
}

/** "Quãng 23–32 tuổi thuận nhất đời; riêng 13–22 tuổi trũng nhất, cần đỡ thêm." */
export function tomTatDaiVanBatTu(daiVan: DaiVanBandItem[]): string {
  if (daiVan.length === 0) return "Chưa đủ dữ liệu Đại Vận để nhận xét.";
  const sapXep = [...daiVan].sort((a, b) => diemSongDaiVan(b) - diemSongDaiVan(a));
  const cao = sapXep[0]!;
  const thap = sapXep[sapXep.length - 1]!;
  const soThuan = daiVan.filter((v) => v.band === "rat_thuan" || v.band === "thuan").length;

  if (diemSongDaiVan(cao) <= 0) {
    return `Không vận nào thực sự nổi trội trong ${daiVan.length} vận đầu; ${khoangTuoi(thap)} là quãng khó nhất.`;
  }
  if (diemSongDaiVan(thap) >= 0) {
    return `Cả ${daiVan.length} vận đầu đều từ trung bình trở lên — ${khoangTuoi(cao)} là quãng thuận nhất.`;
  }
  return `${khoangTuoi(cao)} là quãng thuận nhất (${soThuan}/${daiVan.length} vận thuận dụng thần); riêng ${khoangTuoi(thap)} trũng nhất, cần đỡ thêm.`;
}

/** "Đại Hạn 23–32 tuổi tốt nhất; 3/6 hạn trùng Tuần/Triệt nên đường đời có đoạn phải chậm lại." */
export function tomTatDaiHanTuVi(daiHan: TuViDaiHanBandItem[]): string {
  if (daiHan.length === 0) return "Chưa đủ dữ liệu Đại Hạn để nhận xét.";
  const sapXep = [...daiHan].sort((a, b) => b.diem - a.diem);
  const cao = sapXep[0]!;
  const thap = sapXep[sapXep.length - 1]!;
  const soTuanTriet = daiHan.filter((h) => h.bietTuanTriet).length;

  const ve = soTuanTriet > 0
    ? `${soTuanTriet}/${daiHan.length} hạn trùng Tuần/Triệt nên có đoạn phải chậm lại`
    : "không hạn nào trùng Tuần/Triệt";
  if (cao.diem <= 0) return `Không hạn nào nổi trội; ${khoangTuoi(thap)} khó nhất — ${ve}.`;
  return `${khoangTuoi(cao)} (cung ${cao.cungName}) là hạn tốt nhất, ${khoangTuoi(thap)} khó nhất — ${ve}.`;
}

/** "Thổ chiếm 38% — nhiều nhất; Thủy chỉ 8% nên Thủy được chọn làm Dụng Thần." */
export function tomTatNguHanh(
  phanBo: { hanh: string; phanTram: number }[],
  dungThan: string,
  kyThan: string,
): string {
  if (phanBo.length === 0) return "";
  const sapXep = [...phanBo].sort((a, b) => b.phanTram - a.phanTram);
  const nhieuNhat = sapXep[0]!;
  const itNhat = sapXep[sapXep.length - 1]!;
  const pDung = phanBo.find((p) => p.hanh === dungThan)?.phanTram ?? 0;

  const veDungThan = pDung === 0
    ? `${dungThan} vắng mặt trong tứ trụ nên Dụng Thần ${dungThan} phải chờ vận mới có`
    : `${dungThan} chỉ ${pDung}% nên được chọn làm Dụng Thần — cần bồi thêm`;
  const veKy = nhieuNhat.hanh === kyThan
    ? ` Hành nhiều nhất lại đúng là Kỵ Thần ${kyThan} — đây là chỗ mất cân bằng chính.`
    : "";
  return `${nhieuNhat.hanh} chiếm ${nhieuNhat.phanTram}% — nhiều nhất, ${itNhat.hanh} ít nhất (${itNhat.phanTram}%); ${veDungThan}.${veKy}`;
}

/** Câu chốt cho lá số Tử Vi 12 cung. */
export function tomTatLaSoTuVi(tv: TuViAnalysis): string {
  const soCat = tv.luanCacCung.filter((l) => l.danhGia === "cat").length;
  const soHung = tv.luanCacCung.filter((l) => l.danhGia === "hung").length;
  const menh = tv.chinhTinhMenh.length > 0
    ? `Mệnh có ${tv.chinhTinhMenh.map((s) => `${s.ten} (${s.trangThai})`).join(", ")}`
    : "Mệnh Vô Chính Diệu";
  return `${menh}, Thân cư ${tv.than_cu}. Trong ${tv.luanCacCung.length} cung trọng yếu: ${soCat} cung cát, ${soHung} cung cần lưu ý.`;
}

/** Câu chốt cho bảng Tứ Trụ. */
export function tomTatTuTru(bt: BaziAnalysis): string {
  const gocVe = bt.goc.lop === "A" || bt.goc.lop === "B"
    ? `gốc lớp ${bt.goc.lop} nên Nhật Chủ đứng vững`
    : `gốc chỉ lớp ${bt.goc.lop ?? "—"} nên Nhật Chủ hơi mỏng`;
  return `Nhật Chủ ${bt.nhatChu.can} (${bt.nhatChu.nguHanh}) ở mức ${bt.vuongSuy}, ${gocVe}; cần ${bt.dungThan}, kiêng ${bt.kyThan}.`;
}

/** Câu chốt cho bảng so sánh 3 phương án. */
export function tomTatSoSanh(primary: CandidateSummaryCard, alternatives: CandidateSummaryCard[]): string {
  if (alternatives.length === 0) {
    return `Chỉ có một phương án đạt đủ tiêu chí trong khung ngày đã cho — không còn lựa chọn nào khác để so sánh.`;
  }
  const nhi = alternatives[0]!;
  const chenh = Math.round(primary.diem.tong - nhi.diem.tong);
  const manh = primary.diem.batTu - nhi.diem.batTu >= primary.diem.tuVi - nhi.diem.tuVi ? "cấu trúc Bát Tự" : "lá số Tử Vi";
  if (chenh <= 0) {
    return `Các phương án bám nhau rất sát — phương án chính thắng nhờ điểm cấu trúc Bát Tự dùng để xếp hạng NGÀY, không phải nhờ tổng điểm hiển thị.`;
  }
  return `Phương án chính hơn phương án kế ${chenh} điểm, chủ yếu nhờ ${manh}.`;
}
