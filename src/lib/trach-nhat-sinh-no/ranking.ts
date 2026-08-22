/**
 * VÒNG 3+4 tổng hợp — Xếp hạng KHÔNG cộng điểm chéo, đúng `references/06-phan-xu-ban-giao.md` §1:
 * Bát Tự xếp hạng NGÀY, Tử Vi chọn GIỜ trong ngày đã chọn, phủ quyết thắng xếp hạng. Điểm nội bộ ở
 * đây CHỈ để SẮP XẾP thứ tự — không hiển thị số điểm "huyền bí" cho khách (đúng §38 spec gốc).
 */
import { loadTrachNhatConfig } from "./config";
import type { BirthCandidate, BaziAnalysis, TuViAnalysis } from "./types";

const VUONG_SUY_DIEM: Record<string, number> = {
  "Trung hòa": 3, "Vượng": 2, "Nhược": 2, "Cường vượng": 1, "Suy": 1,
};
const GOC_DIEM: Record<string, number> = { A: 3, B: 2, C: 1, D: 0 };
const AN_DIEM: Record<string, number> = { dep: 3, du: 2, thua: 1, thieu: 0, qua_thua: 0 };
const BAND_DIEM: Record<string, number> = { rat_thuan: 3, thuan: 2, trung_binh: 0, thu_thach: -2, nghich: -3 };
const TRONG_SO_HE_SO: Record<string, number> = { cao_nhat: 1.5, cao: 1.0, trung_binh: 0.6, thap: 0.3 };

/** Ngưỡng tối thiểu §2 03-cham-diem-bat-tu.md — gốc dưới lớp C hoặc quá ít điểm thông căn → loại. */
export function duoiNguongChatLuongGoc(a: BaziAnalysis): boolean {
  const cfg = loadTrachNhatConfig();
  if (a.goc.lop === null || a.goc.lop === "D") return true;
  const thuTu = ["D", "C", "B", "A"];
  const chuanLop = thuTu.indexOf(a.goc.lop) < thuTu.indexOf(cfg.chat_luong_goc.nguong_toi_thieu_lop);
  return chuanLop || a.goc.diemThongCan < cfg.chat_luong_goc.nguong_toi_thieu_diem_thong_can;
}

/** Điểm cấu trúc Bát Tự (nội bộ, dùng để SO SÁNH giữa các NGÀY — không hiển thị số cho khách). */
export function diemCauTrucBatTu(a: BaziAnalysis): number {
  let d = VUONG_SUY_DIEM[a.vuongSuy] ?? 0;
  d += GOC_DIEM[a.goc.lop ?? "D"] ?? 0;
  d += AN_DIEM[a.anTinh.muc];
  // Ấn hóa Quan Sát — tài liệu §3 xếp "✅✅ Tốt nhất, cấu trúc đáng săn nhất khi chọn ngày sinh".
  if (a.anTinh.hoaDuocQuanSat) d += 2;
  d += a.luuThong.matXichDut.length === 0 && a.luuThong.matXichNghen.length === 0 ? 2 : a.luuThong.matXichDut.length > 0 && a.luuThong.matXichNghen.length > 0 ? 0 : 1;
  d -= a.tuHinhTuTruHinh.length; // tự hình/tam hình: trừ nhẹ mỗi cái phát hiện
  for (const van of a.daiVan) {
    d += (BAND_DIEM[van.band] ?? 0) * (TRONG_SO_HE_SO[van.trongSo] ?? 0.5);
  }
  return Math.round(d * 100) / 100;
}

/** Điểm chọn GIỜ theo Tử Vi trong 1 ngày đã chốt (không so giữa các ngày khác nhau). */
export function diemChonGioTuVi(a: TuViAnalysis): number {
  let d = 0;
  d -= a.veto.soSatTinhHoiMenh; // càng ít sát tinh càng tốt (đã loại nếu >=3, còn lại 0-2 vẫn trừ nhẹ)
  d += a.chinhTinhMenh.some((s) => s.trangThai === "Miếu" || s.trangThai === "Vượng") ? 2 : a.chinhTinhMenh.some((s) => s.trangThai === "Đắc") ? 1 : a.chinhTinhMenh.some((s) => s.trangThai === "Hãm") ? -1 : 0;
  d += a.than_cu === "Mệnh" || a.than_cu === "Quan Lộc" || a.than_cu === "Phúc Đức" ? 1 : a.than_cu === "Phu Thê" ? -1 : 0;
  d -= a.daiHan.filter((h) => h.bietTuanTriet).length; // Đại Hạn sớm dính Tuần/Triệt: trừ nhẹ
  d -= a.daiHan.reduce((s, h) => s + h.soSatTinhTuTap, 0) * 0.5;
  return Math.round(d * 100) / 100;
}

export interface NgayXepHang {
  ngay: string; // "2026-08-22"
  diemDaiDien: number; // điểm cấu trúc Bát Tự cao nhất trong số các giờ finalist của ngày này
  ungVienTotNhat: BirthCandidate; // giờ đã được Tử Vi chọn là tốt nhất trong ngày này
  soGioConLai: number;
}

/** Bát Tự xếp hạng NGÀY (điểm cấu trúc cao nhất trong ngày làm đại diện) → Tử Vi chọn GIỜ trong từng ngày. */
export function xepHangKhongCongDiemCheo(finalists: BirthCandidate[]): NgayXepHang[] {
  const theoNgay = new Map<string, BirthCandidate[]>();
  for (const c of finalists) {
    const key = `${c.date.year}-${String(c.date.month).padStart(2, "0")}-${String(c.date.day).padStart(2, "0")}`;
    if (!theoNgay.has(key)) theoNgay.set(key, []);
    theoNgay.get(key)!.push(c);
  }

  const ketQua: NgayXepHang[] = [];
  for (const [ngay, ungViens] of theoNgay) {
    // Điểm đại diện ngày = điểm Bát Tự cao nhất trong số các giờ còn sống sót của ngày đó.
    let diemDaiDien = -Infinity;
    for (const uv of ungViens) if (uv.baziAnalysis) diemDaiDien = Math.max(diemDaiDien, diemCauTrucBatTu(uv.baziAnalysis));

    // Trong ngày đó, Tử Vi chọn giờ tốt nhất — KHÔNG so điểm Bát Tự giữa các giờ (đã dùng điểm đại
    // diện chung cho cả ngày), chỉ so điểm Tử Vi để chọn GIỜ.
    const gioTotNhat = [...ungViens].sort((a, b) => {
      const da = a.tuViAnalysis ? diemChonGioTuVi(a.tuViAnalysis) : -Infinity;
      const db = b.tuViAnalysis ? diemChonGioTuVi(b.tuViAnalysis) : -Infinity;
      return db - da;
    })[0]!;

    ketQua.push({ ngay, diemDaiDien, ungVienTotNhat: gioTotNhat, soGioConLai: ungViens.length });
  }

  return ketQua.sort((a, b) => b.diemDaiDien - a.diemDaiDien);
}
