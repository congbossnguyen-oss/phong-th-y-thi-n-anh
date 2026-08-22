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
  // (Đã chặn ở structural-bat-tu: chỉ true khi thân KHÔNG vượng — thân vượng thì Ấn là Kỵ.)
  if (a.anTinh.hoaDuocQuanSat) d += 2;
  // §4 — Dụng Thần phải có mặt VÀ có căn mới dùng được; vô căn/vắng mặt = "biết cần gì nhưng không
  // có gì" → điểm thấp. Kỵ Thần thấu can + đắc lệnh → trừ nặng.
  if (a.dungThanChatLuong.coMat && a.dungThanChatLuong.coCan) d += 2;
  else if (a.dungThanChatLuong.coMat) d -= 1;
  else d -= 2.5;
  if (a.dungThanChatLuong.kyThanThauCanDacLenh) d -= 2;
  d += a.luuThong.matXichDut.length === 0 && a.luuThong.matXichNghen.length === 0 ? 2 : a.luuThong.matXichDut.length > 0 && a.luuThong.matXichNghen.length > 0 ? 0 : 1;
  d -= a.tuHinhTuTruHinh.length; // tự hình/tam hình: trừ nhẹ mỗi cái phát hiện
  for (const van of a.daiVan) {
    d += (BAND_DIEM[van.band] ?? 0) * (TRONG_SO_HE_SO[van.trongSo] ?? 0.5);
  }
  return Math.round(d * 100) / 100;
}

/**
 * Điểm chọn GIỜ theo Tử Vi trong 1 ngày đã chốt (không so giữa các ngày khác nhau).
 * Trọng số theo `quy-trinh-chon-gio-sinh-mo-tu-vi.md`: Bước 6 (Đại Vận đầu đời) là "quan trọng nhất
 * về lâu dài" nên hệ số cao nhất; Bước 4 (Tam Phương Tứ Chính) xét đủ 4 cung chứ không chỉ Mệnh.
 */
export function diemChonGioTuVi(a: TuViAnalysis): number {
  let d = 0;

  // Bước 3+7 — sát tinh hội Mệnh (đã loại nếu ≥3; còn 0-2 vẫn trừ nhẹ).
  d -= a.veto.soSatTinhHoiMenh;

  // Bước 4 — Tam Phương Tứ Chính (Mệnh + Di + Tài + Quan): cát tinh cộng, sát tinh trừ, Tứ Hóa nặng hơn.
  d += a.tamPhuongTuChinh.soCatTinh * 0.8;
  d -= a.tamPhuongTuChinh.soSatTinh * 0.8;
  d += a.tamPhuongTuChinh.soHoaCat * 1.2;
  d -= a.tamPhuongTuChinh.soHoaKy * 1.2;

  // Bước 5 — chính tinh thủ Mệnh miếu/vượng/đắc/hãm + Mệnh cường Thân cường (tổ hợp tốt nhất).
  d += a.chinhTinhMenh.some((s) => s.trangThai === "Miếu" || s.trangThai === "Vượng") ? 2 : a.chinhTinhMenh.some((s) => s.trangThai === "Đắc") ? 1 : a.chinhTinhMenh.some((s) => s.trangThai === "Hãm") ? -1 : 0;
  if (a.cuongNhuocMenh === "cuong" && a.cuongNhuocThan === "cuong") d += 2;
  else if (a.cuongNhuocMenh === "nhuoc" && a.cuongNhuocThan === "nhuoc") d -= 1.5;

  // Bước 5 — Thân cư: ưu tiên Quan/Tài/Phúc/Mệnh, tránh Thiên Di (sớm xa gia đình) và Phu Thê.
  d += ["Mệnh", "Quan Lộc", "Phúc Đức", "Tài Bạch"].includes(a.than_cu) ? 1
    : a.than_cu === "Thiên Di" ? -0.5
    : a.than_cu === "Phu Thê" ? -1 : 0;

  // Bước 6 — Đại Hạn: 2 hạn đầu (~0-30t) trọng số cao nhất; hạn 3-5 (~25-65t, giai đoạn trưởng
  // thành lập nghiệp) KHÔNG còn coi nhẹ — anh Công phát hiện 22/8/2026: hệ số 0.5 quá nhẹ khiến lá
  // có 4 hạn liên tiếp Tuần/Triệt vẫn xếp hạng 1.
  a.daiHan.forEach((h, i) => {
    const heSo = i < 2 ? 2 : i < 5 ? 1.2 : 0.5;
    if (h.bietTuanTriet) d -= 1.5 * heSo;
    d -= h.soSatTinhTuTap * 0.5 * heSo;
  });
  // Phạt lũy tiến cho CHUỖI Tuần/Triệt liên tiếp — 3 hạn liên tiếp trở lên là "cuộc đời khá vất vả".
  let chuoi = 0;
  let chuoiMax = 0;
  for (const h of a.daiHan) {
    chuoi = h.bietTuanTriet ? chuoi + 1 : 0;
    if (chuoi > chuoiMax) chuoiMax = chuoi;
  }
  if (chuoiMax >= 3) d -= (chuoiMax - 2) * 3;

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
