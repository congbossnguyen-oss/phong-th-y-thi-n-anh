/**
 * VÒNG 3 & 6 — Chấm điểm cấu trúc Bát Tự, đúng `references/03-cham-diem-bat-tu.md`. Chạy trên ứng
 * viên đã qua Vòng 2 (lọc cứng). Tái dùng `phanTichBatTu()` (Vượng Suy + Dụng/Hỷ/Kỵ/Cừu Thần dứt
 * khoát, không viết lại) — chỉ thêm phần MỚI: chất lượng gốc A/B/C/D, liều lượng Ấn, ngũ hành lưu
 * thông, tự hình/tam hình.
 */
import type { BatTuChart } from "../bat-tu";
import {
  phanTichBatTu, hanhCan, hanhChi, hanhSinhCho, coLucXung, TANG, HOP_HOA, chiChuan,
  type Hanh, type TuTruInput,
} from "../bat-tu-engine/engine";
import { loadTrachNhatConfig } from "./config";
import type { BaziAnalysis, GocResult, AnTinhResult, NguHanhLuuThongResult } from "./types";

const HANH_CHUOI: Hanh[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"]; // Mộc→Hỏa→Thổ→Kim→Thủy→Mộc

/** §2 — Chất lượng gốc A/B/C/D + 3 phép trừ (gốc bị xung / hợp hóa mất / dưới hành khắc). */
function chamChatLuongGoc(chart: BatTuChart): GocResult {
  const nhatChuHanh = hanhCan(chart.day.can);
  const dg: string[] = [];
  const cacChi = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi];

  type UngVienGoc = { chi: string; nguon: "nhat_chi" | "nguyet_chi" | "khac_chi"; laChinhKhi: boolean; diem: number };
  const ungVien: UngVienGoc[] = [];
  const truMap: { chi: string; nguon: UngVienGoc["nguon"] }[] = [
    { chi: chart.day.chi, nguon: "nhat_chi" },
    { chi: chart.month.chi, nguon: "nguyet_chi" },
    { chi: chart.year.chi, nguon: "khac_chi" },
    { chi: chart.hour.chi, nguon: "khac_chi" },
  ];
  for (const { chi, nguon } of truMap) {
    const tang = TANG[chiChuan(chi)] ?? [];
    tang.forEach((c, i) => {
      if (hanhCan(c) === nhatChuHanh) ungVien.push({ chi, nguon, laChinhKhi: i === 0, diem: i === 0 ? 2 : 1 });
    });
  }

  if (ungVien.length === 0) {
    return { lop: null, diemThongCan: 0, chiGoc: null, biXung: false, biHopHoaMat: false, duoiHanhKhac: false, dienGiai: ["Không có gốc nào (đã bị lọc L3)."] };
  }

  // Chọn gốc tốt nhất (ưu tiên nhật chi chính khí > nguyệt chi chính khí > chi khác chính khí > trung/dư khí).
  const rank = (u: UngVienGoc) => (u.nguon === "nhat_chi" ? 3 : u.nguon === "nguyet_chi" ? 2 : 1) * 10 + (u.laChinhKhi ? 1 : 0);
  ungVien.sort((a, b) => rank(b) - rank(a));
  const tot = ungVien[0]!;

  const biXung = coLucXung(tot.chi, cacChi.filter((c) => c !== tot.chi));
  // Hợp hóa mất: nếu chi gốc tham gia 1 cặp Lục Hợp/ngũ hợp mà hành hóa khác hành nhật chủ — xấp xỉ bằng
  // kiểm tra Thiên Can hợp hóa trên CAN cùng trụ với chi gốc (đủ dữ kiện đơn giản cho Giai đoạn 1).
  let biHopHoaMat = false;
  for (const [cap, hoaHanh] of Object.entries(HOP_HOA)) {
    const [a, b] = cap.split("-");
    const cans = [chart.year.can, chart.month.can, chart.day.can, chart.hour.can];
    if (cans.includes(a!) && cans.includes(b!) && hoaHanh !== nhatChuHanh) { biHopHoaMat = true; break; }
  }
  const duoiHanhKhac = hanhChi(tot.chi) !== nhatChuHanh && HANH_CHUOI.indexOf(hanhChi(tot.chi)) === (HANH_CHUOI.indexOf(nhatChuHanh) + 2) % 5; // xấp xỉ: chi tọa dưới hành khắc nhật chủ hoặc bị nhật chủ khắc — xem dienGiai

  let lop: GocResult["lop"] = tot.nguon === "nhat_chi" && tot.laChinhKhi ? "A"
    : tot.nguon === "nguyet_chi" && tot.laChinhKhi ? "B"
    : tot.laChinhKhi ? "C" : "D";
  if (biXung) { dg.push(`Gốc tại ${tot.chi} bị xung → coi như mất.`); lop = null; }
  if (biHopHoaMat) { dg.push("Có Thiên Can hợp hóa sang hành khác Nhật Chủ — nghi gốc bị hợp hóa mất, cần đối chiếu thêm."); }
  if (duoiHanhKhac && lop) { dg.push(`Gốc tại ${tot.chi} ngồi dưới hành khắc trực diện — còn nhưng bị đè, hạ 1 bậc.`); lop = lop === "A" ? "B" : lop === "B" ? "C" : "D"; }

  const diemThongCan = ungVien.reduce((s, u) => s + u.diem, 0);
  dg.unshift(`Gốc tốt nhất tại ${tot.chi} (${tot.nguon === "nhat_chi" ? "nhật chi" : tot.nguon === "nguyet_chi" ? "nguyệt chi" : "chi khác"}, ${tot.laChinhKhi ? "chính khí" : "trung/dư khí"}) → lớp ${lop ?? "—"}. Tổng điểm thông căn: ${diemThongCan}.`);

  return { lop, diemThongCan, chiGoc: tot.chi, biXung, biHopHoaMat, duoiHanhKhac, dienGiai: dg };
}

/** §3 — Liều lượng Ấn tinh (tiêu chí 8). Ấn = hành sinh cho Nhật Chủ. */
function chamAnTinh(chart: BatTuChart, vuongSuyCapDo: string, cfg: ReturnType<typeof loadTrachNhatConfig>): AnTinhResult {
  const nhatChuHanh = hanhCan(chart.day.can);
  const anHanh = hanhSinhCho(nhatChuHanh);
  let soPhan = 0;
  let coCanNguyetNhat = false;
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    if (hanhCan(tru.can) === anHanh) soPhan++;
    tru.tangCan.forEach((t) => { if (hanhCan(t.can) === anHanh) soPhan++; });
  }
  const anCoCan = [chart.year, chart.month, chart.day, chart.hour].some((tru) => hanhCan(tru.tangCan[0]?.can ?? "") === anHanh);
  if (hanhChi(chart.month.chi) === anHanh || hanhChi(chart.day.chi) === anHanh) coCanNguyetNhat = true;

  const hanQuanSat = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"].find((h) => h !== nhatChuHanh) as Hanh; // đặt chỗ, xem dienGiai
  void hanQuanSat;

  const nhuocHoacTrungHoa = ["Nhược", "Suy", "Trung hòa", "Nhược "].includes(vuongSuyCapDo) || vuongSuyCapDo.includes("Trung hòa") || vuongSuyCapDo.includes("Nhược") || vuongSuyCapDo.includes("Suy");
  const daVuong = vuongSuyCapDo.includes("Vượng") || vuongSuyCapDo.includes("Cường");

  let muc: AnTinhResult["muc"];
  let dienGiai: string;
  if (soPhan >= cfg.an_tinh.nguong_qua_thua_so_phan) {
    muc = "qua_thua";
    dienGiai = `Ấn (${anHanh}) có ${soPhan} phần — Kiêu Ấn đoạt Thực, chặn đường thể hiện, mẹ can thiệp sâu.`;
  } else if (soPhan === 0 || !anCoCan) {
    muc = "thieu";
    dienGiai = `Ấn (${anHanh}) ${soPhan === 0 ? "không có mặt" : "không có căn"} — thiếu chỗ dựa.`;
  } else if (daVuong) {
    muc = "thua";
    dienGiai = `Ấn (${anHanh}) có căn nhưng Nhật Chủ đã vượng — Ấn thành kỵ, dễ bao bọc/ỷ lại, cần Tài chế Ấn mới cân.`;
  } else if (nhuocHoacTrungHoa && soPhan <= 2) {
    muc = "dep";
    dienGiai = `Ấn (${anHanh}) có căn, ${soPhan} phần, Nhật Chủ ${vuongSuyCapDo.toLowerCase()} — liều lượng lý tưởng.${coCanNguyetNhat ? " Ấn gần thân (nguyệt/nhật chi), dùng được ngay." : ""}`;
  } else {
    muc = "du";
    dienGiai = `Ấn (${anHanh}) có mặt và có căn, liều lượng đủ dùng.`;
  }

  return { muc, soPhan, coCan: anCoCan, hoaDuocQuanSat: false, dienGiai };
}

/** §5 — Ngũ hành lưu thông: dò chuỗi Mộc→Hỏa→Thổ→Kim→Thủy→Mộc, tìm mắt xích đứt/nghẽn. */
function chamLuuThong(chart: BatTuChart): NguHanhLuuThongResult {
  const nhatChuHanh = hanhCan(chart.day.can);
  const chuoi = HANH_CHUOI.map((hanh) => {
    let viTri: "thau_can" | "chinh_khi" | "tang_can" | "khong_co" = "khong_co";
    for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
      if (hanhCan(tru.can) === hanh) { viTri = "thau_can"; break; }
      if (hanhChi(tru.chi) === hanh) { viTri = "chinh_khi"; }
      if (viTri === "khong_co" && tru.tangCan.some((t) => hanhCan(t.can) === hanh)) viTri = "tang_can";
    }
    return { hanh, coMat: viTri !== "khong_co", viTri };
  });

  const matXichDut = chuoi.filter((c) => !c.coMat || c.viTri === "tang_can").map((c) => c.hanh);
  // Nghẽn: 2 hành khắc trực diện kề trong chuỗi mà hành thông quan giữa chúng chỉ nằm ở tàng can.
  const matXichNghen: Hanh[] = [];
  for (let i = 0; i < HANH_CHUOI.length; i++) {
    const a = HANH_CHUOI[i]!;
    const bIdx = (i + 2) % HANH_CHUOI.length; // hành cách 2 bước = hành nó khắc
    const b = HANH_CHUOI[bIdx]!;
    const thongQuan = HANH_CHUOI[(i + 1) % HANH_CHUOI.length]!;
    const aManh = chuoi.find((c) => c.hanh === a)?.viTri === "thau_can";
    const bManh = chuoi.find((c) => c.hanh === b)?.viTri === "thau_can";
    const tqChiTangCan = chuoi.find((c) => c.hanh === thongQuan)?.viTri === "tang_can";
    if (aManh && bManh && tqChiTangCan) matXichNghen.push(thongQuan);
  }

  const vaiTro: NguHanhLuuThongResult["vaiTroNhatChu"] =
    chuoi.find((c) => c.hanh === HANH_CHUOI[(HANH_CHUOI.indexOf(nhatChuHanh) + 4) % 5])?.coMat && nhatChuHanh
      ? "dau_nhan"
      : "dung_ngoai";

  const dienGiai = [
    `Chuỗi: ${chuoi.map((c) => `${c.hanh}${c.coMat ? `(${c.viTri === "thau_can" ? "thấu can" : c.viTri === "chinh_khi" ? "chính khí" : "tàng can"})` : "(vắng)"}`).join(" → ")}.`,
  ];
  if (matXichDut.length > 0) dienGiai.push(`Mắt xích yếu/đứt: ${matXichDut.join(", ")}.`);
  if (matXichNghen.length > 0) dienGiai.push(`Mắt xích nghẽn (thông quan chỉ ở tàng can): ${[...new Set(matXichNghen)].join(", ")}.`);

  return { chuoi: chuoi.map((c) => ({ hanh: c.hanh, coMat: c.coMat, viTri: c.viTri })), matXichDut, matXichNghen: [...new Set(matXichNghen)], vaiTroNhatChu: vaiTro, dienGiai };
}

/** §6 — Tự hình / Tam hình (trừ nặng). Lục Hại/Lục Phá CHƯA tích hợp (tài liệu nguồn không cho bảng — xem config._meta). */
function timTuHinhTamHinh(chart: BatTuChart): string[] {
  const chis = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi].map(chiChuan);
  const out: string[] = [];
  const TU_HINH = ["Thìn", "Ngọ", "Dậu", "Hợi"];
  for (const c of TU_HINH) {
    if (chis.filter((x) => x === c).length >= 2) out.push(`Tự hình ${c}–${c}`);
  }
  const TAM_HINH_1 = ["Dần", "Tị", "Thân"];
  const TAM_HINH_2 = ["Sửu", "Tuất", "Mùi"];
  if (TAM_HINH_1.every((c) => chis.includes(c))) out.push("Tam hình Dần–Tị–Thân");
  if (TAM_HINH_2.every((c) => chis.includes(c))) out.push("Tam hình Sửu–Tuất–Mùi");
  if (chis.includes("Tý") && chis.includes("Mão")) out.push("Tý–Mão hình");
  return out;
}

export function chamCauTrucBatTu(chart: BatTuChart, gioiTinh: "Nam" | "Nữ"): BaziAnalysis {
  const cfg = loadTrachNhatConfig();
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh,
  };
  const { vuongSuy, dungThan } = phanTichBatTu(tt);

  return {
    tuTru: { nam: tt.nam, thang: tt.thang, ngay: tt.ngay, gio: tt.gio },
    nhatChu: { can: chart.day.can, nguHanh: hanhCan(chart.day.can) },
    vuongSuy: vuongSuy.capDo,
    dungThan: dungThan.dungThan,
    hyThan: dungThan.hyThan,
    kyThan: dungThan.kyThan,
    goc: chamChatLuongGoc(chart),
    anTinh: chamAnTinh(chart, vuongSuy.capDo, cfg),
    luuThong: chamLuuThong(chart),
    tuHinhTuTruHinh: timTuHinhTamHinh(chart),
    daiVan: [], // điền ở dai-van-band.ts (cần chart.daiVan + dungThan/hyThan/kyThan)
  };
}
