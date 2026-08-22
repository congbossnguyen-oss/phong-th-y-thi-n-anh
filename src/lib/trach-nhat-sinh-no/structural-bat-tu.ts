/**
 * VÒNG 3 & 6 — Chấm điểm cấu trúc Bát Tự, đúng `references/03-cham-diem-bat-tu.md`. Chạy trên ứng
 * viên đã qua Vòng 2 (lọc cứng). Tái dùng `phanTichBatTu()` (Vượng Suy + Dụng/Hỷ/Kỵ/Cừu Thần dứt
 * khoát, không viết lại) — chỉ thêm phần MỚI: chất lượng gốc A/B/C/D, liều lượng Ấn, ngũ hành lưu
 * thông, tự hình/tam hình.
 */
import type { BatTuChart } from "../bat-tu";
import {
  phanTichBatTu, hanhCan, hanhChi, hanhSinhCho, coLucXung, TANG, TAM_HOP, TAM_HOI, xetHopHoaThienCan,
  KHAC_MAP, SINH_MAP, chiChuan, type Hanh, type TuTruInput,
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

  // Phép trừ 2 — GỐC BỊ HỢP HÓA MẤT (tài liệu ghi "hay sót nhất"). Chỉ tính khi CHÍNH chi gốc tham
  // gia một tổ hợp có thể hóa sang hành KHÁC hành Nhật Chủ:
  //   (a) Chi gốc nằm trong cục Tam Hợp/Tam Hội TRỌN 3 chi → khí bản chi bị cuốn theo hành cục.
  //   (b) Thiên Can CÙNG TRỤ với chi gốc bị ngũ hợp hóa sang hành khác (trước đây quét cả cục,
  //       không cần liên quan gì tới chi gốc → báo nhầm rất nhiều).
  let biHopHoaMat = false;
  let lyDoHopHoa = "";
  const chiGocChuan = chiChuan(tot.chi);
  for (const [bo, hoaHanh] of [...Object.entries(TAM_HOP), ...Object.entries(TAM_HOI)]) {
    const chisBo = bo.split("-").map(chiChuan);
    if (!chisBo.includes(chiGocChuan)) continue;
    const duTronCuc = chisBo.every((c) => cacChi.map(chiChuan).includes(c));
    if (duTronCuc && hoaHanh !== nhatChuHanh) {
      biHopHoaMat = true;
      lyDoHopHoa = `Chi gốc ${tot.chi} nằm trong cục ${bo} trọn 3 chi (hóa ${hoaHanh}, khác hành Nhật Chủ ${nhatChuHanh})`;
      break;
    }
  }
  if (!biHopHoaMat) {
    // (b) Can CÙNG TRỤ với chi gốc bị ngũ hợp HÓA sang hành khác.
    //
    // ⚠️ Sửa 22/8/2026 (anh Công phát hiện trên lá 25/8/2026): trước đây chỗ này tự kiểm tra kiểu
    // thô — chỉ cần hai Can của cặp cùng có mặt trong tứ trụ là trừ hạng luôn, không xét liền kề,
    // không xét tranh hợp, không xét tháng, không xét Nhật Chủ. Lá 25/8/2026 có 2 Bính (Tranh Hợp
    // → không hợp được) và sinh tháng Thân (Kim, không vượng cho Thủy) mà vẫn bị báo "Bính-Tân khả
    // năng hóa Thủy → hạ 1 bậc". Nay gọi chung `xetHopHoaThienCan()` và CHỈ trừ khi hóa THẬT.
    const cansTheoTru = [chart.year.can, chart.month.can, chart.day.can, chart.hour.can];
    const truCuaGocIdx = [chart.year, chart.month, chart.day, chart.hour].findIndex((t) => chiChuan(t.chi) === chiGocChuan);
    if (truCuaGocIdx >= 0) {
      const canCuaGoc = cansTheoTru[truCuaGocIdx]!;
      const tt = {
        nam: { can: chart.year.can, chi: chart.year.chi }, thang: { can: chart.month.can, chi: chart.month.chi },
        ngay: { can: chart.day.can, chi: chart.day.chi }, gio: { can: chart.hour.can, chi: chart.hour.chi },
      };
      for (const kq of xetHopHoaThienCan(tt)) {
        if (!kq.hoa) continue; // hợp mà không hóa thì bản chất Can giữ nguyên → gốc không mất
        if (kq.hoaHanh === nhatChuHanh) continue;
        const canGocThamGia = (kq.viTriA === truCuaGocIdx && kq.canA === canCuaGoc) || (kq.viTriB === truCuaGocIdx && kq.canB === canCuaGoc);
        if (!canGocThamGia) continue;
        biHopHoaMat = true;
        lyDoHopHoa = `Can ${canCuaGoc} cùng trụ với chi gốc hợp ${kq.cap} và HÓA ${kq.hoaHanh} (${kq.lyDo})`;
        break;
      }
    }
  }

  // Phép trừ 3 — GỐC NGỒI DƯỚI HÀNH KHẮC TRỰC TIẾP (vd Canh tọa Ngọ: Hỏa khắc Kim; Đinh tọa Hợi:
  // Thủy khắc Hỏa). Đúng định nghĩa: hành CHÍNH của chi gốc KHẮC hành Nhật Chủ — tra thẳng bảng
  // KHAC_MAP thay vì đếm bước trong vòng ngũ hành (công thức cũ tính nhầm chiều).
  const hanhChiGoc = hanhChi(tot.chi);
  const duoiHanhKhac = KHAC_MAP[hanhChiGoc] === nhatChuHanh;

  let lop: GocResult["lop"] = tot.nguon === "nhat_chi" && tot.laChinhKhi ? "A"
    : tot.nguon === "nguyet_chi" && tot.laChinhKhi ? "B"
    : tot.laChinhKhi ? "C" : "D";
  if (biXung) { dg.push(`Gốc tại ${tot.chi} bị xung → coi như mất.`); lop = null; }
  if (biHopHoaMat) { dg.push(`${lyDoHopHoa} → nghi gốc bị hợp hóa mất, hạ 1 bậc.`); lop = lop === "A" ? "B" : lop === "B" ? "C" : lop === "C" ? "D" : lop; }
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

  // ẤN HÓA QUAN SÁT (Sát → Ấn → Thân) — tài liệu §3 gọi là "cấu trúc đáng săn nhất khi chọn ngày
  // sinh": biến áp lực thành nguồn nuôi. Điều kiện: (1) trong cục CÓ Quan Sát (hành khắc Nhật Chủ),
  // (2) Ấn có căn để đủ sức hóa, (3) Quan Sát sinh được cho Ấn — luôn đúng theo vòng ngũ hành, vì
  // hành khắc Nhật Chủ chính là hành mà Ấn được sinh ra từ đó... nên chỉ cần kiểm (1) và (2).
  const hanhQuanSat = HANH_CHUOI.find((h) => KHAC_MAP[h] === nhatChuHanh);
  const quanSatCoMat = !!hanhQuanSat && [chart.year, chart.month, chart.day, chart.hour].some((tru) =>
    hanhCan(tru.can) === hanhQuanSat || tru.tangCan.some((t) => hanhCan(t.can) === hanhQuanSat),
  );
  const anCoCanTruoc = [chart.year, chart.month, chart.day, chart.hour].some((tru) => hanhCan(tru.tangCan[0]?.can ?? "") === anHanh);
  // Quan Sát sinh Ấn: SINH_MAP[hanhQuanSat] phải bằng anHanh (kiểm tường minh, không suy đoán).
  const quanSatSinhDuocAn = !!hanhQuanSat && SINH_MAP[hanhQuanSat] === anHanh;
  // ⚠️ CHỈ tính là ĐIỂM TỐT khi Nhật Chủ KHÔNG vượng (anh Công chốt 22/8/2026): "Ấn chỉ là Dụng
  // Thần khi Nhật Chủ thực sự cần được sinh thêm. Nếu Nhật Chủ đã dư lực mà vẫn sinh thêm bằng Ấn
  // thì Ấn chuyển từ Dụng/Hỷ sang KỴ." Thân vượng mà khen "Ấn hóa Quan Sát" là khen ngược.
  const thanDaVuong = vuongSuyCapDo.includes("Vượng") || vuongSuyCapDo.includes("Cường") || vuongSuyCapDo.includes("cường");
  const hoaDuocQuanSat = quanSatCoMat && anCoCanTruoc && quanSatSinhDuocAn && !thanDaVuong;

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

  if (hoaDuocQuanSat) {
    dienGiai += ` ✦ Có cấu trúc Ấn hóa Quan Sát (${hanhQuanSat} → ${anHanh} → ${nhatChuHanh}) — biến áp lực thành nguồn nuôi, cấu trúc đáng săn nhất khi chọn ngày sinh.`;
  }

  return { muc, soPhan, coCan: anCoCan, hoaDuocQuanSat, dienGiai };
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

/**
 * §4 — Chất lượng Dụng Thần: "Dụng thần có mặt trong nguyên cục VÀ có căn. Dụng thần vô căn hoặc
 * vắng mặt = 'biết cần gì nhưng không có gì' → điểm thấp. Kỵ thần thấu can lại đắc lệnh → trừ nặng."
 */
function chamChatLuongDungThan(chart: BatTuChart, dungThan: Hanh, kyThan: Hanh) {
  let coMat = false;
  let coCan = false;
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    if (hanhCan(tru.can) === dungThan) coMat = true;
    tru.tangCan.forEach((t, i) => {
      if (hanhCan(t.can) === dungThan) {
        coMat = true;
        if (i === 0) coCan = true; // bản khí = có căn thật
      }
    });
  }
  const kyThauCan = [chart.year.can, chart.month.can, chart.hour.can].some((c) => hanhCan(c) === kyThan);
  const kyDacLenh = hanhChi(chart.month.chi) === kyThan || hanhCan(TANG[chiChuan(chart.month.chi)]?.[0] ?? "") === kyThan;
  const kyThanThauCanDacLenh = kyThauCan && kyDacLenh;

  const phan: string[] = [];
  if (!coMat) phan.push(`Dụng Thần ${dungThan} KHÔNG có mặt trong nguyên cục — "biết cần gì nhưng không có gì".`);
  else if (!coCan) phan.push(`Dụng Thần ${dungThan} có mặt nhưng KHÔNG có căn (chỉ ở khí phụ) — lực mỏng, khó dùng.`);
  else phan.push(`Dụng Thần ${dungThan} có mặt và có căn trong nguyên cục — dùng được.`);
  if (kyThanThauCanDacLenh) phan.push(`Kỵ Thần ${kyThan} vừa thấu can vừa nắm lệnh tháng — trừ nặng.`);

  return { coMat, coCan, kyThanThauCanDacLenh, dienGiai: phan.join(" ") };
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
    dungThanChatLuong: chamChatLuongDungThan(chart, dungThan.dungThan, dungThan.kyThan),
    goc: chamChatLuongGoc(chart),
    anTinh: chamAnTinh(chart, vuongSuy.capDo, cfg),
    luuThong: chamLuuThong(chart),
    tuHinhTuTruHinh: timTuHinhTamHinh(chart),
    daiVan: [], // điền ở dai-van-band.ts (cần chart.daiVan + dungThan/hyThan/kyThan)
  };
}
