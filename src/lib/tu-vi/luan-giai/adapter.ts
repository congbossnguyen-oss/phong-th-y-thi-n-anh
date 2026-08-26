// ADAPTER — chuyển TuViChart (engine an sao có sẵn) + KetQuaChamDiem (chamDiem.ts) thành dữ liệu
// có cấu trúc đưa vào prompt AI. Bám đúng SPEC.md mục 6: "Input JSON (từ engine an sao + engine
// chấm điểm): Mệnh, Thân, 12 cung (chính tinh/trung tinh cát-hung/Tuần Triệt + điểm đã chấm sẵn),
// Đại Hạn, Tiểu Hạn (kèm điểm)".
//
// CHỈ chuyển đổi SỰ THẬT (sao gì, trạng thái gì, điểm bao nhiêu) — KHÔNG diễn giải/gọi tên cách cục.
// Việc gọi tên cách cục (Tử Phủ Vũ Tướng, Sát Phá Tham, Tham Vũ Đồng Hành...) là việc của AI, dựa
// trên tri thức trong content/tu-vi-luan-giai/knowledge/ đưa kèm — đúng nguyên tắc README-CLAUDE-CODE
// mục 1: "AI KHÔNG BAO GIỜ tự tính lá số, và KHÔNG tự chấm điểm Cát/Hung", chỉ viết phần chữ.

import type { CungKetQua, TuViChart } from "../engine";
import { getTieuHanPalace, getTuoiTieuHan } from "../tieu-han";
import { chamDiemLaSo, nhanDiem, type ChiTietChamDiem, type KetQuaChamDiem } from "./chamDiem";
import { quanHeMenhCuc } from "./tongQuanFree";

export type CungDuLieu = {
  ten: string;
  chi: string;
  canThienBan: string;
  isMenh: boolean;
  isThan: boolean;
  chinhTinh: { ten: string; trangThai: string; tuHoa?: string }[];
  phuTinh: { ten: string; tuHoa?: string }[];
  tuan: boolean;
  triet: boolean;
  daiVanTuoi: [number, number];
  diem: number;
  nhanDiem: string;
  loaiChinhTinh: ChiTietChamDiem["loaiChinhTinh"];
  soCat: number;
  soHung: number;
  laDaiHanHienTai: boolean;
  laTieuHanNamNay: boolean;
  laTieuHanNamSau: boolean;
};

export type MocHan = { tuoi: number; tenCung: string; chi: string; diem: number };

export type DuLieuLaSoTuVi = {
  hoTen: string;
  gioiTinh: "Nam" | "Nữ";
  ngaySinhDuong: string;
  gioSinh: number;
  amDuongNam: string;
  banMenhNapAm: string;
  banMenhElement: string;
  cucName: string;
  quanHeMenhCuc: string;
  menhChi: string;
  thanCungTen: string;
  thanDongCungMenh: boolean;
  tuoiHienTai: number | null;
  namHienTai: number | null;
  cung: CungDuLieu[];
  daiHanHienTai?: { tenCung: string; tuoiTu: number; tuoiDen: number; chi: string; diem: number };
  tieuHanNamNay?: MocHan;
  tieuHanNamSau?: MocHan;
};

function chuyenDoiCung(chart: TuViChart, c: CungKetQua, ct: ChiTietChamDiem, coHan: {
  daiHan: number | null;
  tieuHanNay: number | null;
  tieuHanSau: number | null;
}): CungDuLieu {
  return {
    ten: c.cungName,
    chi: c.chiName,
    canThienBan: c.canName,
    isMenh: c.isMenh,
    isThan: c.isThan,
    chinhTinh: c.chinhTinh.map((s) => ({ ten: s.name, trangThai: s.trangThai, tuHoa: s.tuHoa })),
    phuTinh: c.phuTinh.map((s) => ({ ten: s.name, tuHoa: s.tuHoa })),
    tuan: c.tuan,
    triet: c.triet,
    daiVanTuoi: c.daiVanTuoi,
    diem: ct.diem,
    nhanDiem: nhanDiem(ct.diem),
    loaiChinhTinh: ct.loaiChinhTinh,
    soCat: ct.soCat,
    soHung: ct.soHung,
    laDaiHanHienTai: coHan.daiHan === c.chiIndex,
    laTieuHanNamNay: coHan.tieuHanNay === c.chiIndex,
    laTieuHanNamSau: coHan.tieuHanSau === c.chiIndex,
  };
}

type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
function hanhTu(s: string): NguHanh | null {
  for (const h of ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as NguHanh[]) if (s.includes(h)) return h;
  return null;
}

/**
 * Xây dựng dữ liệu đầy đủ cho AI. `cham` truyền vào từ ngoài (không tính lại) để đảm bảo cùng 1
 * lần chấm điểm dùng xuyên suốt Free → Cơ Bản → Nâng Cao, tránh lệch điểm giữa các tầng.
 */
export function dungDuLieuLaSo(chart: TuViChart, cham: KetQuaChamDiem, hoTen: string): DuLieuLaSoTuVi {
  const theoChiIndex = new Map(cham.chiTiet.map((ct) => [ct.chiIndex, ct]));

  // Đại Hạn hiện tại: cung có daiVanTuoi bao trùm tuổi đang xem.
  let daiHanChiIndex: number | null = null;
  if (chart.tuoiNamXem !== null) {
    const c = chart.cungs.find((x) => chart.tuoiNamXem! >= x.daiVanTuoi[0] && chart.tuoiNamXem! <= x.daiVanTuoi[1]);
    if (c) daiHanChiIndex = c.chiIndex;
  }

  const tuoiTieuHan = getTuoiTieuHan(chart);
  const tieuHanNayChiIndex = tuoiTieuHan !== null ? getTieuHanPalace(chart, tuoiTieuHan).chiIndex : null;
  const tieuHanSauChiIndex = tuoiTieuHan !== null ? getTieuHanPalace(chart, tuoiTieuHan + 1).chiIndex : null;

  const cungDuLieu = chart.cungs.map((c) => {
    const ct = theoChiIndex.get(c.chiIndex);
    if (!ct) throw new Error(`Thiếu điểm chấm cho cung chiIndex=${c.chiIndex}`);
    return chuyenDoiCung(chart, c, ct, { daiHan: daiHanChiIndex, tieuHanNay: tieuHanNayChiIndex, tieuHanSau: tieuHanSauChiIndex });
  });

  const cungThan = chart.cungs.find((c) => c.isThan);
  const dongCung = chart.menhChiIndex === chart.thanChiIndex;

  const hMenh = hanhTu(chart.banMenhElement);
  const hCuc = hanhTu(chart.cucName);
  const qhMC = hMenh && hCuc ? quanHeMenhCuc(hMenh, hCuc) : "Bình Hòa";

  let daiHanHienTai: DuLieuLaSoTuVi["daiHanHienTai"];
  if (daiHanChiIndex !== null) {
    const c = chart.cungs.find((x) => x.chiIndex === daiHanChiIndex)!;
    const ct = theoChiIndex.get(daiHanChiIndex)!;
    daiHanHienTai = { tenCung: c.cungName, tuoiTu: c.daiVanTuoi[0], tuoiDen: c.daiVanTuoi[1], chi: c.chiName, diem: ct.diem };
  }
  const lamMocHan = (tuoi: number | null, chiIdx: number | null): MocHan | undefined => {
    if (tuoi === null || chiIdx === null) return undefined;
    const c = chart.cungs.find((x) => x.chiIndex === chiIdx)!;
    const ct = theoChiIndex.get(chiIdx)!;
    return { tuoi, tenCung: c.cungName, chi: c.chiName, diem: ct.diem };
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    hoTen: hoTen || "quý khách",
    gioiTinh: chart.input.gender,
    ngaySinhDuong: `${pad(chart.input.day)}/${pad(chart.input.month)}/${chart.input.year}`,
    gioSinh: chart.input.hour,
    amDuongNam: chart.amDuongNam,
    banMenhNapAm: chart.banMenhNapAm,
    banMenhElement: chart.banMenhElement,
    cucName: chart.cucName,
    quanHeMenhCuc: qhMC,
    menhChi: chart.cungs.find((c) => c.isMenh)!.chiName,
    thanCungTen: dongCung ? "Đồng cung với Mệnh" : (cungThan?.cungName ?? "—"),
    thanDongCungMenh: dongCung,
    tuoiHienTai: chart.tuoiNamXem,
    namHienTai: chart.input.viewingYear ?? null,
    cung: cungDuLieu,
    daiHanHienTai,
    tieuHanNamNay: lamMocHan(tuoiTieuHan, tieuHanNayChiIndex),
    tieuHanNamSau: tuoiTieuHan !== null ? lamMocHan(tuoiTieuHan + 1, tieuHanSauChiIndex) : undefined,
  };
}

/** Tính điểm 1 lần, dùng chung cho toàn bộ pipeline (Free/Cơ Bản/Nâng Cao) — export tiện cho nơi gọi. */
export function chamVaXayDungDuLieu(chart: TuViChart, hoTen: string): { cham: KetQuaChamDiem; duLieu: DuLieuLaSoTuVi } {
  const cham = chamDiemLaSo(chart);
  const duLieu = dungDuLieuLaSo(chart, cham, hoTen);
  return { cham, duLieu };
}

function moTaSao(s: { ten: string; trangThai?: string; tuHoa?: string }): string {
  const trang = s.trangThai ? ` (${s.trangThai})` : "";
  const hoa = s.tuHoa ? ` [Hóa ${s.tuHoa}]` : "";
  return `${s.ten}${trang}${hoa}`;
}

function moTaCungMotDong(c: CungDuLieu): string {
  const chinh = c.chinhTinh.length ? c.chinhTinh.map(moTaSao).join(", ") : "Vô Chính Diệu";
  const phu = c.phuTinh.length ? c.phuTinh.map(moTaSao).join(", ") : "(không phụ tinh đáng kể)";
  const co: string[] = [];
  if (c.tuan) co.push("Tuần");
  if (c.triet) co.push("Triệt");
  if (c.laDaiHanHienTai) co.push("★ĐẠI HẠN HIỆN TẠI");
  if (c.laTieuHanNamNay) co.push("★TIỂU HẠN NĂM NAY");
  if (c.laTieuHanNamSau) co.push("★TIỂU HẠN NĂM SAU");
  const nhanMark = [c.isMenh ? "MỆNH" : "", c.isThan ? "THÂN" : ""].filter(Boolean).join("+");
  return (
    `- **${c.ten}** (${c.chi}, Đại Hạn ${c.daiVanTuoi[0]}-${c.daiVanTuoi[1]} tuổi)${nhanMark ? ` [${nhanMark}]` : ""} — ` +
    `Chính tinh: ${chinh}. Phụ/trung tinh: ${phu}.${co.length ? ` Cờ: ${co.join(", ")}.` : ""} ` +
    `Engine chấm: **${c.diem}/5 (${c.nhanDiem})** — loại ${c.loaiChinhTinh}, ${c.soCat} sao cát / ${c.soHung} sao hung ở Tam Phương Tứ Chính.`
  );
}

/** Chuỗi text đưa vào user message — nhãn tiếng Việt rõ ràng, KHÔNG phải JSON thô (AI đọc tự nhiên hơn). */
export function serializeDuLieuChoPrompt(d: DuLieuLaSoTuVi): string {
  const phan: string[] = [];
  phan.push(`## Thông tin chủ lá số`);
  phan.push(`- Họ tên: ${d.hoTen}`);
  phan.push(`- Giới tính: ${d.gioiTinh}`);
  phan.push(`- Ngày sinh dương lịch: ${d.ngaySinhDuong}, giờ ${d.gioSinh}h`);
  phan.push(`- ${d.amDuongNam}`);
  phan.push(`- Bản mệnh: ${d.banMenhNapAm} (hành ${d.banMenhElement})`);
  phan.push(`- Cục: ${d.cucName}`);
  phan.push(`- Quan hệ Mệnh - Cục: ${d.quanHeMenhCuc}`);
  phan.push(`- Mệnh an tại: ${d.menhChi}`);
  phan.push(`- Thân: ${d.thanCungTen}`);
  if (d.tuoiHienTai !== null) phan.push(`- Tuổi hiện tại (năm ${d.namHienTai}): ${d.tuoiHienTai}`);

  phan.push(`\n## 12 cung (đầy đủ chính tinh, phụ/trung tinh, điểm engine đã chấm sẵn — KHÔNG được tự đổi điểm)`);
  for (const c of d.cung) phan.push(moTaCungMotDong(c));

  if (d.daiHanHienTai) {
    phan.push(`\n## Đại Hạn hiện tại`);
    phan.push(`- Cung ${d.daiHanHienTai.tenCung} (${d.daiHanHienTai.chi}), ${d.daiHanHienTai.tuoiTu}-${d.daiHanHienTai.tuoiDen} tuổi, điểm engine ${d.daiHanHienTai.diem}/5.`);
  }
  if (d.tieuHanNamNay) {
    phan.push(`\n## Tiểu Hạn năm nay (${d.namHienTai}, ${d.tieuHanNamNay.tuoi} tuổi)`);
    phan.push(`- Cung ${d.tieuHanNamNay.tenCung} (${d.tieuHanNamNay.chi}), điểm engine ${d.tieuHanNamNay.diem}/5.`);
  }
  if (d.tieuHanNamSau) {
    phan.push(`\n## Tiểu Hạn năm sau (${(d.namHienTai ?? 0) + 1}, ${d.tieuHanNamSau.tuoi} tuổi)`);
    phan.push(`- Cung ${d.tieuHanNamSau.tenCung} (${d.tieuHanNamSau.chi}), điểm engine ${d.tieuHanNamSau.diem}/5.`);
  }

  return phan.join("\n");
}
