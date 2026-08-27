/**
 * THẦN SÁT + LỤC HẠI/LỤC PHÁ cho 4 lĩnh vực — lớp thông tin mà chính tài liệu lĩnh vực YÊU CẦU:
 *   • `hon-nhan.md` §Ứng dụng: "Kết hợp thêm than-sat.md (Đào Hoa, Hồng Loan, Cô Thần-Quả Tú,
 *     Âm Dương Sai Thố, Cô Loan Sát)".
 *   • `benh-tat.md` §4.5: "Kiểm tra Thần Sát liên quan sức khỏe: Dương Nhận, Kiếp Sát, Tai Sát,
 *     Tang Môn, Huyết Nhẫn".
 * Mọi bảng tra chép NGUYÊN VĂN từ `content/bat-tu/knowledge/than-sat.md` (kể cả chỗ khác sách phổ
 * thông — tài liệu dự án là chuẩn, không "sửa" theo trí nhớ nền). Bảng Hại/Phá từ
 * `quan-he-can-chi.md` §1, khớp 100% với bảng độc lập ở `src/lib/kymon/trachCat/thanSat.ts`.
 *
 * 3 nguyên tắc vận dụng bắt buộc (than-sat.md §Nguyên tắc 1-3), đã cài thành code:
 *   (1) Thần Sát là PHỤ — chỉ cộng/trừ quanh mức NHẸ-VỪA, không bao giờ lấn át phân tích Dụng Thần.
 *   (2) Cát thần bị hình/xung/khắc/hại → mất tác dụng; Hung thần được HỢP GIẢI → mất tác dụng.
 *   (3) Hung thần đồng trụ với cát thần "gặp dữ hóa lành" (Thiên Đức/Nguyệt Đức/Thiên Ất) → được
 *       hóa giải, thậm chí đảo chiều ("không những tránh được họa mà còn chủ quyền chức/địa vị").
 */
import type { BatTuChart, Gender } from "../bat-tu";
import { chiChuan, hanhChi, type Hanh } from "../bat-tu-engine/engine";
import type { BaziAnalysis, CanCuLinhVuc, LinhVucKey } from "./types";

const NHE = 0.8, VUA = 1.5;

// ── Bảng tra (nguyên văn than-sat.md) ───────────────────────────────────────────────────────────
/** Thiên Ất Quý Nhân — tra Can Năm/Can Ngày → tìm ở Địa Chi các trụ (than-sat.md §Thiên Ất). */
const THIEN_AT: Record<string, string[]> = {
  Giáp: ["Sửu", "Mùi"], Ất: ["Tý", "Thân"], Bính: ["Dậu", "Hợi"], Đinh: ["Dậu", "Hợi"],
  Mậu: ["Sửu", "Mùi"], Kỷ: ["Tý", "Thân"], Canh: ["Dần", "Ngọ"], Tân: ["Dần", "Ngọ"],
  Nhâm: ["Mão", "Tị"], Quý: ["Mão", "Tị"],
};
/** Thiên Đức — tra Chi Tháng; giá trị có thể là Can HOẶC Chi (4 tháng Mão/Ngọ/Dậu/Tý ra Chi). */
const THIEN_DUC: Record<string, string> = {
  Dần: "Đinh", Mão: "Thân", Thìn: "Nhâm", Tị: "Tân", Ngọ: "Hợi", Mùi: "Giáp",
  Thân: "Quý", Dậu: "Dần", Tuất: "Bính", Hợi: "Ất", Tý: "Tị", Sửu: "Canh",
};
/** Nguyệt Đức — tra Chi Tháng theo nhóm Tam Hợp, luôn là Can. */
const NGUYET_DUC: Record<string, string> = {
  Dần: "Bính", Ngọ: "Bính", Tuất: "Bính", Thân: "Nhâm", Tý: "Nhâm", Thìn: "Nhâm",
  Hợi: "Giáp", Mão: "Giáp", Mùi: "Giáp", Tị: "Canh", Dậu: "Canh", Sửu: "Canh",
};
/** Dương Nhận — Đế Vượng của Can Ngày, CHỈ 5 Dương Can (than-sat.md ghi rõ Âm Can còn tranh cãi). */
const DUONG_NHAN: Record<string, string> = { Giáp: "Mão", Bính: "Ngọ", Mậu: "Ngọ", Canh: "Dậu", Nhâm: "Tý" };
/** Nhóm Tam Hợp của 1 Chi → giá trị thần sát (Tai Sát/Kiếp Sát/Đào Hoa/Cô Thần/Quả Tú tra kiểu này). */
const NHOM_TAM_HOP: Record<string, string> = {
  Thân: "TTT", Tý: "TTT", Thìn: "TTT", Dần: "DNT", Ngọ: "DNT", Tuất: "DNT",
  Tị: "TDS", Dậu: "TDS", Sửu: "TDS", Hợi: "HMM", Mão: "HMM", Mùi: "HMM",
};
const TAI_SAT: Record<string, string> = { TTT: "Ngọ", DNT: "Tý", TDS: "Mão", HMM: "Dậu" };
const KIEP_SAT: Record<string, string> = { TTT: "Tị", DNT: "Hợi", TDS: "Dần", HMM: "Thân" };
const DAO_HOA: Record<string, string> = { TTT: "Dậu", DNT: "Mão", TDS: "Ngọ", HMM: "Tý" };
/** Huyết Nhẫn — tra Chi Năm (than-sat.md §Huyết Nhẫn). */
const HUYET_NHAN: Record<string, string> = {
  Tý: "Tuất", Sửu: "Dậu", Dần: "Thân", Mão: "Mùi", Thìn: "Ngọ", Tị: "Tị",
  Ngọ: "Thìn", Mùi: "Mão", Thân: "Dần", Dậu: "Sửu", Tuất: "Tý", Hợi: "Hợi",
};
/** Cô Thần / Quả Tú — tra Chi Năm theo nhóm Tam Hội mùa (than-sat.md §Cô Thần — Quả Tú). */
const CO_THAN: Record<string, string> = {
  Hợi: "Dần", Tý: "Dần", Sửu: "Dần", Dần: "Tị", Mão: "Tị", Thìn: "Tị",
  Tị: "Thân", Ngọ: "Thân", Mùi: "Thân", Thân: "Hợi", Dậu: "Hợi", Tuất: "Hợi",
};
const QUA_TU: Record<string, string> = {
  Hợi: "Tuất", Tý: "Tuất", Sửu: "Tuất", Dần: "Sửu", Mão: "Sửu", Thìn: "Sửu",
  Tị: "Thìn", Ngọ: "Thìn", Mùi: "Thìn", Thân: "Mùi", Dậu: "Mùi", Tuất: "Mùi",
};
/** Hồng Loan — tra Chi Năm (than-sat.md §Hồng Loan — Thiên Hỷ). */
const HONG_LOAN: Record<string, string> = {
  Tý: "Mão", Sửu: "Dần", Dần: "Sửu", Mão: "Tý", Thìn: "Hợi", Tị: "Tuất",
  Ngọ: "Dậu", Mùi: "Thân", Thân: "Mùi", Dậu: "Ngọ", Tuất: "Tị", Hợi: "Thìn",
};
/** Thiên Y = Chi liền trước Chi Tháng (than-sat.md §Thiên Y). */
const CHI_VONG = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const thienY = (chiThang: string): string => CHI_VONG[(CHI_VONG.indexOf(chiChuan(chiThang)) + 11) % 12]!;
/** Cô Loan Sát — 8 Trụ Ngày (than-sat.md; tài liệu tự ghi "còn tranh luận, chỉ tham khảo"). */
const CO_LOAN = new Set(["Ất Tị", "Đinh Tị", "Tân Hợi", "Mậu Thân", "Nhâm Dần", "Mậu Ngọ", "Nhâm Tý", "Bính Ngọ"]);
/** Âm Dương Sai Thố — 12 Trụ Ngày (than-sat.md). */
const AM_DUONG_SAI_THO = new Set([
  "Bính Tý", "Đinh Sửu", "Mậu Dần", "Tân Mão", "Nhâm Thìn", "Quý Tị",
  "Bính Ngọ", "Đinh Mùi", "Mậu Thân", "Tân Dậu", "Nhâm Tuất", "Quý Hợi",
]);

// ── Lục Hại / Lục Phá / Lục Hợp (quan-he-can-chi.md §1, khớp kymon/trachCat/thanSat.ts) ─────────
const LUC_HAI: Record<string, string> = {
  Dần: "Tị", Tị: "Dần", Mão: "Thìn", Thìn: "Mão", Sửu: "Ngọ", Ngọ: "Sửu",
  Tý: "Mùi", Mùi: "Tý", Thân: "Hợi", Hợi: "Thân", Dậu: "Tuất", Tuất: "Dậu",
};
const LUC_PHA: Record<string, string> = {
  Dần: "Hợi", Hợi: "Dần", Ngọ: "Mão", Mão: "Ngọ", Thìn: "Sửu", Sửu: "Thìn",
  Thân: "Tị", Tị: "Thân", Tuất: "Mùi", Mùi: "Tuất", Tý: "Dậu", Dậu: "Tý",
};
const LUC_HOP: Record<string, string> = {
  Tý: "Sửu", Sửu: "Tý", Dần: "Hợi", Hợi: "Dần", Mão: "Tuất", Tuất: "Mão",
  Thìn: "Dậu", Dậu: "Thìn", Tị: "Thân", Thân: "Tị", Ngọ: "Mùi", Mùi: "Ngọ",
};
const LUC_XUNG: Record<string, string> = {
  Tý: "Ngọ", Ngọ: "Tý", Sửu: "Mùi", Mùi: "Sửu", Dần: "Thân", Thân: "Dần",
  Mão: "Dậu", Dậu: "Mão", Thìn: "Tuất", Tuất: "Thìn", Tị: "Hợi", Hợi: "Tị",
};

const TEN_TRU = ["Năm", "Tháng", "Ngày", "Giờ"] as const;

interface BoiCanh {
  cans: string[]; // Can 4 trụ theo thứ tự Năm-Tháng-Ngày-Giờ
  chis: string[]; // Chi 4 trụ (đã chiChuan)
  canNgay: string;
  chiNam: string;
  chiNgay: string;
  chiThang: string;
  /** Cát thần "gặp dữ hóa lành" có mặt ở trụ nào (index) — Thiên Ất (chi) / Thiên Đức / Nguyệt Đức (can|chi). */
  cuuTinhTaiTru: Set<number>;
}

function dungBoiCanh(chart: BatTuChart): BoiCanh {
  const trus = [chart.year, chart.month, chart.day, chart.hour];
  const cans = trus.map((t) => t.can);
  const chis = trus.map((t) => chiChuan(t.chi));
  const chiThang = chis[1]!;
  const cuuTinhTaiTru = new Set<number>();
  const tdGiaTri = THIEN_DUC[chiThang];
  const ndGiaTri = NGUYET_DUC[chiThang];
  const thienAtChis = new Set([...(THIEN_AT[cans[0]!] ?? []), ...(THIEN_AT[cans[2]!] ?? [])]);
  chis.forEach((chi, i) => {
    if (thienAtChis.has(chi)) cuuTinhTaiTru.add(i);
    if (tdGiaTri && (cans[i] === tdGiaTri || chi === tdGiaTri)) cuuTinhTaiTru.add(i);
    if (ndGiaTri && cans[i] === ndGiaTri) cuuTinhTaiTru.add(i);
  });
  return { cans, chis, canNgay: cans[2]!, chiNam: chis[0]!, chiNgay: chis[2]!, chiThang, cuuTinhTaiTru };
}

/** Vị trí (index trụ) mà `chiCanTim` xuất hiện trong tứ trụ. */
const timViTri = (bc: BoiCanh, chiCanTim: string | undefined): number[] =>
  chiCanTim ? bc.chis.map((c, i) => (c === chiChuan(chiCanTim) ? i : -1)).filter((i) => i >= 0) : [];

/** Nguyên tắc 2 — hung thần tại trụ i được HỢP GIẢI nếu chi trụ đó lục hợp với chi trụ khác. */
const hungDuocHopGiai = (bc: BoiCanh, i: number): boolean =>
  bc.chis.some((c, j) => j !== i && LUC_HOP[bc.chis[i]!] === c);

/** Nguyên tắc 2 — cát thần tại trụ i MẤT TÁC DỤNG nếu chi trụ đó bị xung/hại bởi chi trụ khác. */
const catBiPhaVo = (bc: BoiCanh, i: number): boolean =>
  bc.chis.some((c, j) => j !== i && (LUC_XUNG[bc.chis[i]!] === c || LUC_HAI[bc.chis[i]!] === c));

const laVuong = (capDo: string) => capDo.includes("Vượng") || capDo.includes("Cường");

/**
 * Chấm Thần Sát + Lục Hại/Lục Phá cho 4 lĩnh vực. Trả về phần CỘNG THÊM vào điểm Bát Tự của từng
 * lĩnh vực (đã kẹp trong ±3 mỗi lĩnh vực — Thần Sát là phụ, không được lấn phân tích Dụng Thần).
 */
export function chamThanSatVaHaiPha(
  chart: BatTuChart,
  bazi: BaziAnalysis,
  gioiTinh: Gender,
): Record<LinhVucKey, { diem: number; canCu: CanCuLinhVuc[] }> {
  const bc = dungBoiCanh(chart);
  const ra: Record<LinhVucKey, { diem: number; canCu: CanCuLinhVuc[] }> = {
    suc_khoe: { diem: 0, canCu: [] }, gia_dao: { diem: 0, canCu: [] },
    tai_van: { diem: 0, canCu: [] }, nhan_duyen: { diem: 0, canCu: [] },
  };
  const ghi = (k: LinhVucKey, diem: number, thuanLoi: boolean, noiDung: string, nguon: string) => {
    ra[k].diem += diem;
    ra[k].canCu.push({ thuanLoi, noiDung, nguon });
  };

  // ═══ SỨC KHỎE (benh-tat.md §4.5 chỉ định danh sách) ═══
  // Dương Nhận — 2 chiều theo vượng suy, tài liệu ghi tường minh cả hai vế.
  const dnChi = DUONG_NHAN[bc.canNgay];
  const dnViTri = timViTri(bc, dnChi);
  if (dnViTri.length > 0) {
    if (laVuong(bazi.vuongSuy)) {
      ghi("suc_khoe", -VUA, false,
        `Dương Nhận tại ${dnChi} (trụ ${dnViTri.map((i) => TEN_TRU[i]).join("/")}) trong khi Nhật Chủ đã vượng — Kị thần, "vượng đến cực điểm", dễ hao tổn, cần chú ý an toàn.`,
        "than-sat.md §Dương Nhận (Nhật chủ vượng → Kị thần)");
    } else {
      ghi("suc_khoe", NHE, true,
        `Dương Nhận tại ${dnChi} mà Nhật Chủ không vượng — thành Hỷ thần, trợ lực lớn cho thân, gánh được áp lực.`,
        "than-sat.md §Dương Nhận (Nhật chủ yếu → Hỷ thần)");
    }
  }
  // Tai Sát — hung nặng, NHƯNG đồng trụ cát thần "gặp dữ hóa lành" thì đảo chiều thành quý.
  // Khử trùng theo GIÁ TRỊ sao (Chi Năm và Chi Ngày cùng nhóm tam hợp sẽ tra ra cùng 1 sao — chỉ tính 1 lần).
  const taiSatChis = new Set([bc.chiNam, bc.chiNgay].map((g) => TAI_SAT[NHOM_TAM_HOP[g]!]!));
  for (const tsChi of taiSatChis) {
    const viTri = timViTri(bc, tsChi);
    if (viTri.length === 0) continue;
    const i = viTri[0]!;
    if (bc.cuuTinhTaiTru.has(i)) {
      ghi("suc_khoe", NHE / 2, true,
        `Tai Sát tại ${tsChi} nhưng đồng trụ có cát thần hộ mệnh (Thiên Ất/Thiên Đức/Nguyệt Đức) — tài liệu ghi "không những tránh được họa mà còn chủ quyền chức/địa vị".`,
        "than-sat.md §Tai Sát (đồng trụ Cát thần)");
    } else if (!hungDuocHopGiai(bc, i)) {
      ghi("suc_khoe", -VUA, false,
        `Tai Sát tại ${tsChi} (trụ ${TEN_TRU[i]}) — hung tinh chủ tai nạn/bệnh tật/phẫu thuật, loại hành ${hanhChi(tsChi)} nên chú ý phòng ${phongTheoHanh(hanhChi(tsChi))}.`,
        "than-sat.md §Tai Sát + benh-tat.md §4.5");
    }
    // Hung được hợp giải → không phát huy, không trừ (nguyên tắc 2).
  }
  // Huyết Nhẫn — liên quan mổ xẻ; 2 cái càng dễ ứng nghiệm.
  const hnChi = HUYET_NHAN[bc.chiNam];
  const hnViTri = timViTri(bc, hnChi);
  if (hnViTri.length > 0) {
    const soCai = hnViTri.length;
    ghi("suc_khoe", -NHE * Math.min(soCai, 2), false,
      `Huyết Nhẫn tại ${hnChi}${soCai >= 2 ? ` (xuất hiện ${soCai} lần — tài liệu: "có 2 Huyết Nhẫn càng dễ ứng nghiệm")` : ""} — liên quan mổ xẻ/phẫu thuật, nên chú ý ở các năm Lưu Niên lặp lại chi này.`,
      "than-sat.md §Huyết Nhẫn + benh-tat.md §4.5");
  }
  // Kiếp Sát — lưỡng tính: chỉ trừ khi tọa Kỵ Thần (khử trùng theo giá trị sao như Tai Sát).
  const kiepSatChis = new Set([bc.chiNam, bc.chiNgay].map((g) => KIEP_SAT[NHOM_TAM_HOP[g]!]!));
  for (const ksChi of kiepSatChis) {
    const viTri = timViTri(bc, ksChi);
    if (viTri.length > 0 && !hungDuocHopGiai(bc, viTri[0]!) && hanhChi(ksChi) === bazi.kyThan) {
      ghi("suc_khoe", -NHE, false,
        `Kiếp Sát tại ${ksChi} tọa đúng hành Kỵ Thần (${hanhChi(ksChi)}) — dễ phá tài, tai vạ bất ngờ, hành vi nóng vội.`,
        "than-sat.md §Kiếp Sát (tọa Kị thần)");
    }
  }
  // Thiên Y — cát thần sức khỏe; mất tác dụng nếu bị xung/hại.
  const tyChi = thienY(bc.chiThang);
  const tyViTri = timViTri(bc, tyChi);
  if (tyViTri.length > 0 && !catBiPhaVo(bc, tyViTri[0]!)) {
    ghi("suc_khoe", NHE, true,
      `Có Thiên Y Quý Nhân tại ${tyChi} — sao sức khỏe, đau ốm dễ gặp thầy gặp thuốc, hồi phục nhanh.`,
      "than-sat.md §Thiên Y Quý Nhân");
  }

  // ═══ NHÂN DUYÊN (hon-nhan.md §Ứng dụng chỉ định danh sách) ═══
  const laNam = gioiTinh === "Nam";
  const coThienAt = bc.chis.some((c) => (THIEN_AT[bc.cans[0]!] ?? []).includes(c) || (THIEN_AT[bc.canNgay] ?? []).includes(c));
  // Cô Thần (nặng với nam) / Quả Tú (nặng với nữ) — Thiên Ất hóa giải bớt một nửa.
  const coDonChi = laNam ? CO_THAN[bc.chiNam] : QUA_TU[bc.chiNam];
  const tenCoDon = laNam ? "Cô Thần" : "Quả Tú";
  if (timViTri(bc, coDonChi).length > 0) {
    const mucTru = coThienAt ? VUA / 2 : VUA;
    ghi("nhan_duyen", -mucTru, false,
      `${tenCoDon} tại ${coDonChi} — duyên bạc với bạn đời/lục thân, khuynh hướng sống khép kín về tình cảm.${coThienAt ? " May có Thiên Ất Quý Nhân trong mệnh hóa giải bớt (tài liệu ghi rõ khả năng này) — chỉ còn ảnh hưởng nhẹ." : ""}`,
      "than-sat.md §Cô Thần — Quả Tú" + (coThienAt ? " (Thiên Ất hóa giải)" : ""));
  }
  // Đào Hoa — 1 cái vừa đủ là duyên; từ 2 trở lên là quá đà.
  const daoHoaViTri = new Set<number>();
  for (const goc of new Set([bc.chiNam, bc.chiNgay])) {
    for (const i of timViTri(bc, DAO_HOA[NHOM_TAM_HOP[goc]!])) daoHoaViTri.add(i);
  }
  if (daoHoaViTri.size === 1) {
    ghi("nhan_duyen", NHE / 2, true,
      "Có 1 Đào Hoa vừa đủ — có duyên với người khác giới, ngoại hình/tính tình dễ mến; tài liệu hôn nhân xếp mức này vào dấu hiệu vợ chồng yêu thương nhau.",
      "hon-nhan.md §1 (Đào Hoa không quá đà) + than-sat.md §Đào Hoa");
  } else if (daoHoaViTri.size >= 2) {
    ghi("nhan_duyen", -VUA, false,
      `Có ${daoHoaViTri.size} Đào Hoa — tài liệu ghi "có 2 Đào Hoa → dễ có quan hệ trước hôn nhân, sau cưới dễ có quan hệ ngoài luồng"; đường tình cảm nhiều sóng.`,
      "than-sat.md §Đào Hoa (2 Đào Hoa)");
  }
  // Hồng Loan — tin vui đôi lứa.
  if (timViTri(bc, HONG_LOAN[bc.chiNam]).length > 0) {
    ghi("nhan_duyen", NHE, true,
      `Có Hồng Loan tại ${HONG_LOAN[bc.chiNam]} — chủ chuyện vui đôi lứa, người ôn nhu có sức hút, đường cưới hỏi thuận.`,
      "than-sat.md §Hồng Loan — Thiên Hỷ");
  }
  // Cô Loan Sát — tài liệu tự dặn chỉ là tham khảo, trừ nhẹ.
  const truNgay = `${bc.canNgay} ${bc.chiNgay}`;
  if (CO_LOAN.has(truNgay)) {
    ghi("nhan_duyen", -NHE, false,
      `Trụ Ngày ${truNgay} phạm Cô Loan Sát — dấu hiệu hôn nhân không thuận. Tài liệu lưu ý đây là thần sát còn tranh luận, chỉ dùng làm tham khảo phụ, không phải căn cứ chính.`,
      "than-sat.md §Cô Loan Sát (tham khảo)");
  }
  // Âm Dương Sai Thố — quan hệ với gia đình bên vợ/chồng.
  if (AM_DUONG_SAI_THO.has(truNgay)) {
    const coCuu = bc.cuuTinhTaiTru.has(2);
    if (!coCuu) {
      ghi("nhan_duyen", -NHE, false,
        `Trụ Ngày ${truNgay} phạm Âm Dương Sai Thố — dễ bất hòa với gia đình bên vợ/chồng, hôn nhân cần vun vén chủ động.`,
        "than-sat.md §Âm Dương Sai Thố");
    }
  }
  // Lục Hại/Lục Phá vào Cung Thê/Phu (Chi Ngày) — hon-nhan.md §2 nêu đích danh "bị Hình/Xung/HẠI".
  for (const [i, chi] of bc.chis.entries()) {
    if (i === 2) continue;
    if (LUC_HAI[bc.chiNgay] === chi) {
      ghi("nhan_duyen", -VUA, false,
        `Chi Ngày ${bc.chiNgay} bị chi ${chi} (trụ ${TEN_TRU[i]}) LỤC HẠI — Cung Thê/Phu bị hại ngay trong nguyên cục, tình cảm vợ chồng dễ bị người/việc bên ngoài chen ngang.`,
        "hon-nhan.md §2 (Cung bị Hình/Xung/Hại) + quan-he-can-chi.md §1");
      break;
    }
  }
  for (const [i, chi] of bc.chis.entries()) {
    if (i === 2) continue;
    if (LUC_PHA[bc.chiNgay] === chi) {
      ghi("nhan_duyen", -NHE, false,
        `Chi Ngày ${bc.chiNgay} bị chi ${chi} (trụ ${TEN_TRU[i]}) LỤC PHÁ — mức phá nhẹ hơn xung/hại nhưng vẫn là lực bào mòn âm ỉ cho cung vợ chồng.`,
        "quan-he-can-chi.md §1 (Lục Phá)");
      break;
    }
  }

  // ═══ GIA ĐẠO ═══
  // Thiên Đức/Nguyệt Đức đóng trụ Năm/Tháng — cha mẹ hiền lành, gia đình có phúc.
  if (bc.cuuTinhTaiTru.has(0) || bc.cuuTinhTaiTru.has(1)) {
    ghi("gia_dao", NHE, true,
      "Trụ Năm/Tháng có quý nhân hộ mệnh (Thiên Ất/Thiên Đức/Nguyệt Đức) — tài liệu lục thân ghi dấu hiệu cha mẹ hiền lành, gia đình được che chở, gặp dữ hóa lành.",
      "luc-than.md §1.1 + than-sat.md §Thiên Đức/Nguyệt Đức");
  }
  // Lục Hại vào Chi Năm (cung cha mẹ/tổ tiên).
  for (const [i, chi] of bc.chis.entries()) {
    if (i === 0) continue;
    if (LUC_HAI[bc.chiNam] === chi) {
      ghi("gia_dao", -NHE, false,
        `Chi Năm ${bc.chiNam} bị chi ${chi} (trụ ${TEN_TRU[i]}) LỤC HẠI — trụ đại diện cha mẹ/tổ tiên bị hại, quan hệ với gia đình gốc cần chăm chút. (Hại nhẹ hơn xung — xung đã xét riêng.)`,
        "quan-he-can-chi.md §1 + luc-than.md §0 (nguyên tắc trụ đại diện bị tổn)");
      break;
    }
  }

  // Kẹp mỗi lĩnh vực trong ±3 — nguyên tắc 1: "Thần Sát là phụ, Âm Dương Ngũ Hành + vượng suy là chính".
  for (const k of Object.keys(ra) as LinhVucKey[]) {
    ra[k].diem = Math.max(-3, Math.min(3, Math.round(ra[k].diem * 10) / 10));
  }
  return ra;
}

/** benh-tat.md §Tai Sát: loại tai nạn cần phòng theo hành của Chi chứa Tai Sát. */
function phongTheoHanh(h: Hanh): string {
  switch (h) {
    case "Hỏa": return "hỏa hoạn, bỏng";
    case "Thủy": return "sông nước, lũ lụt";
    case "Kim": return "vật kim loại sắc nhọn";
    case "Mộc": return "vật cứng, cây đổ";
    default: return "thương tích, dịch bệnh";
  }
}
