// LỤC HÀO — TAM HỢP CỤC HOÁ CỤC (三合局).
//
// 4 Tam Hợp cục (Sinh-Vượng-Mộ của mỗi hành, khớp bảng Trường Sinh của dự án — Đế Vượng luôn rơi
// đúng 1 trong 4 chi Tý/Ngọ/Mão/Dậu):
//   Hỏa cục  Dần(sinh) - Ngọ(Đế Vượng) - Tuất(mộ)
//   Thủy cục Thân(sinh) - Tý(Đế Vượng)  - Thìn(mộ)
//   Kim cục  Tị(sinh)  - Dậu(Đế Vượng) - Sửu(mộ)
//   Mộc cục  Hợi(sinh) - Mão(Đế Vượng) - Mùi(mộ)
//
// KHÔNG PHẢI cứ đủ 3 chi trong quẻ là tự động thành cục — nguồn (LUAN_QUE_LUC_HAO_SPEC.md §3.7) chỉ
// công nhận 3 điều kiện sau (đúng 1 trong 3 là đủ, không cần cả 3):
//   (1) Đủ 3 hào ĐỘNG mang đủ 3 chi của cục.
//   (2) 2 hào động mang 2/3 chi (bắt buộc trong đó có Đế Vượng) + MƯỢN Nhật hoặc Nguyệt làm chi còn
//       thiếu (Chi Ngày hoặc Chi Tháng gieo quẻ trùng đúng chi thiếu).
//   (3) 2 hào động mang 2/3 chi (bắt buộc trong đó có Đế Vượng) + chính hào Đế Vượng đó ĐỘNG HÓA ra
//       đúng chi còn thiếu (chi hào BIẾN của hào Đế Vượng = chi thiếu).
// Hào TĨNH không tham gia hình thành cục (chỉ hào động mới "động" nên mới đủ lực hợp cục).
//
// ⚠️ File THUẦN TÍNH TOÁN — không phán cát hung, không luận văn vẻ. Cục hình thành là TỐT hay XẤU
// còn tùy hành của cục sinh/khắc gì với Dụng Thần — thuộc lớp luận (LLM), không thuộc lớp này.

import { CHI, type NguHanh } from "./menh-nap-am";
import { CHI_NGU_HANH } from "./bat-tu";
import type { FullCastResult } from "./luc-hao";

interface DinhNghiaCuc {
  nguHanh: NguHanh;
  sinh: number; // chiIndex
  vuong: number; // chiIndex — Đế Vượng
  mo: number; // chiIndex
}

const TAM_HOP_CUC: DinhNghiaCuc[] = [
  { nguHanh: "Hỏa", sinh: 2, vuong: 6, mo: 10 }, // Dần-Ngọ-Tuất
  { nguHanh: "Thủy", sinh: 8, vuong: 0, mo: 4 }, // Thân-Tý-Thìn
  { nguHanh: "Kim", sinh: 5, vuong: 9, mo: 1 }, // Tị-Dậu-Sửu
  { nguHanh: "Mộc", sinh: 11, vuong: 3, mo: 7 }, // Hợi-Mão-Mùi
];

export type DieuKienTamHopCuc = "du-3-hao-dong" | "muon-nhat-nguyet" | "de-vuong-hoa-ra";

export interface TamHopCucFormed {
  nguHanh: NguHanh;
  tenCuc: string; // "Hỏa cục (Dần-Ngọ-Tuất)"
  dieuKien: DieuKienTamHopCuc;
  /** Vị trí hào (1-6) trực tiếp tham gia (hào động mang chi của cục). */
  viTriHaoDong: number[];
  /** Chỉ có khi dieuKien = "muon-nhat-nguyet" — mượn từ đâu. */
  muonTu?: "Nhật" | "Nguyệt";
  moTa: string;
}

export interface KetQuaTamHopCuc {
  co: boolean;
  danhSach: TamHopCucFormed[];
  ghiChu: string[];
}

/** Tên hiển thị "Dần-Ngọ-Tuất" theo đúng thứ tự Sinh-Vượng-Mộ. */
function tenChiCuc(d: DinhNghiaCuc): string {
  return `${CHI[d.sinh]}-${CHI[d.vuong]}-${CHI[d.mo]}`;
}

/**
 * Quét toàn quẻ, tìm mọi Tam Hợp cục thực sự hình thành theo đúng 3 điều kiện nguồn. Chỉ xét hào
 * ĐỘNG (chinh.hao có isDong theo dongPositions) — hào tĩnh không đủ lực hợp cục.
 */
export function tinhTamHopCuc(cast: FullCastResult): KetQuaTamHopCuc {
  const danhSach: TamHopCucFormed[] = [];

  if (cast.dongPositions.length === 0) {
    return { co: false, danhSach: [], ghiChu: ["Quẻ không có hào động — không xét Tam Hợp cục (hào tĩnh không đủ lực hợp cục)."] };
  }

  const dayChiIndex = CHI.indexOf(cast.dayChi);
  const monthChiIndex = CHI.indexOf(cast.monthChi);

  for (const cuc of TAM_HOP_CUC) {
    const required = new Set([cuc.sinh, cuc.vuong, cuc.mo]);
    // Mỗi hào động khớp với ĐÚNG 1 chi cần (nếu có) — gom theo chi để biết chi nào có hào phủ, hào nào phủ.
    const phuTheo = new Map<number, number[]>(); // chiIndex cần -> danh sách vị trí hào động phủ đúng chi đó
    for (const pos of cast.dongPositions) {
      const chi = cast.chinh.hao[pos - 1]?.chiIndex;
      if (chi !== undefined && required.has(chi)) {
        phuTheo.set(chi, [...(phuTheo.get(chi) ?? []), pos]);
      }
    }
    const chiDaPhu = [...phuTheo.keys()];
    const tenCuc = `${cuc.nguHanh} cục (${tenChiCuc(cuc)})`;

    // Điều kiện (1) — đủ 3 hào động mang đủ 3 chi.
    if (chiDaPhu.length === 3) {
      const viTriHaoDong = chiDaPhu.map((chi) => phuTheo.get(chi)![0]);
      danhSach.push({
        nguHanh: cuc.nguHanh,
        tenCuc,
        dieuKien: "du-3-hao-dong",
        viTriHaoDong,
        moTa: `${tenCuc} hình thành đủ 3 hào động (hào ${viTriHaoDong.join(", ")}) mang đủ 3 chi ${tenChiCuc(cuc)}.`,
      });
      continue; // đã hình thành theo cách mạnh nhất, không cần xét thêm điều kiện (2)/(3) cho cục này
    }

    // Điều kiện (2)/(3) — cần đúng 2/3 chi được phủ, bắt buộc có chi Đế Vượng trong 2 chi đó.
    if (chiDaPhu.length === 2 && phuTheo.has(cuc.vuong)) {
      const chiThieu = [cuc.sinh, cuc.vuong, cuc.mo].find((c) => !phuTheo.has(c))!;
      const viTriHaoDeVuong = phuTheo.get(cuc.vuong)![0];
      const viTriHaoDong = chiDaPhu.flatMap((c) => phuTheo.get(c)!);

      // (2) Mượn Nhật/Nguyệt làm chi thiếu.
      if (dayChiIndex === chiThieu || monthChiIndex === chiThieu) {
        const muonTu: "Nhật" | "Nguyệt" = dayChiIndex === chiThieu ? "Nhật" : "Nguyệt";
        danhSach.push({
          nguHanh: cuc.nguHanh,
          tenCuc,
          dieuKien: "muon-nhat-nguyet",
          viTriHaoDong,
          muonTu,
          moTa: `${tenCuc} hình thành: 2 hào động (hào ${viTriHaoDong.join(", ")}, có hào Đế Vượng ${CHI[cuc.vuong]}) mượn Chi ${muonTu === "Nhật" ? "Ngày" : "Tháng"} (${CHI[chiThieu]}) làm chi còn thiếu.`,
        });
      }

      // (3) Chính hào Đế Vượng động hóa ra đúng chi thiếu.
      const bienChiDeVuong = cast.bien?.hao[viTriHaoDeVuong - 1]?.chiIndex;
      if (bienChiDeVuong === chiThieu) {
        danhSach.push({
          nguHanh: cuc.nguHanh,
          tenCuc,
          dieuKien: "de-vuong-hoa-ra",
          viTriHaoDong,
          moTa: `${tenCuc} hình thành: 2 hào động (hào ${viTriHaoDong.join(", ")}) mang ${CHI[cuc.sinh]}/${CHI[cuc.mo]}, hào Đế Vượng (hào ${viTriHaoDeVuong}, ${CHI[cuc.vuong]}) động hóa ra đúng ${CHI[chiThieu]} — chi còn thiếu tự sinh ra từ trong quẻ.`,
        });
      }
    }
  }

  const ghiChu: string[] =
    danhSach.length === 0
      ? ["Không hào động nào đủ điều kiện hợp thành Tam Hợp cục (thiếu hào mang đủ chi, hoặc thiếu Đế Vượng trong nhóm hào động)."]
      : [
          "Tam Hợp cục hình thành làm ĐỔI HẲN tính chất của các hào tham gia (chuyển hết sang ngũ hành của cục) — TỐT hay XẤU tùy hành cục đó sinh/khắc gì với Dụng Thần, không tự nó là điềm lành hay dữ.",
        ];

  return { co: danhSach.length > 0, danhSach, ghiChu };
}

// =================================================================================================
// SÁU TRƯỜNG HỢP TAM HỢP (theo tài liệu nguồn) — phân loại KIỂU hình thành + Ứng Kỳ, gồm cả cục KHUYẾT
// (chờ hào an tĩnh/Phục Thần tới kỳ). KHÁC `tinhTamHopCuc` ở trên (chỉ nhận cục ĐÃ THÀNH từ hào động).
// THUẦN FACT: không phán cát hung, không điểm số. Mỗi case là 1 detector riêng — KHÔNG gộp.
export type TamHopCase =
  | "TH1_FULL" // 3 hào động
  | "TH2_MISSING_STATIC" // 2 động + 1 an tĩnh (khuyết)
  | "TH3_MINH_DONG_AM_DONG_STATIC" // minh động + ám động + an tĩnh (khuyết)
  | "TH4_DAY_MONTH_MOVING" // Nhật + Nguyệt + 1 hào động
  | "TH5_TWO_MOVING_ONE_TRANSFORMED" // 2 động + 1 hào biến (biến từ chính 1 trong 2 động)
  | "TH6_TWO_MOVING_PHUC_THAN"; // 2 động + 1 Phục Thần (khuyết)

export interface SauTamHopFormed {
  case: TamHopCase;
  nguHanh: NguHanh;
  tenCuc: string; // "Hỏa cục (Dần-Ngọ-Tuất)"
  diaChi: [string, string, string]; // 3 Địa Chi theo Sinh-Vượng-Mộ
  full: boolean; // true = đủ (TH1/4/5); false = khuyết (TH2/3/6)
  /** Vị trí hào (1-6) tham gia trực tiếp trên quẻ. */
  participatingLines: number[];
  /** Hào an tĩnh giữ chỗ (TH2/TH3) — vị trí hào. */
  staticLine?: number;
  /** Hào biến giữ chỗ (TH5) — vị trí hào động biến ra chi thiếu. */
  transformedLine?: number;
  /** Phục Thần giữ chỗ (TH6) — vị trí phi thần mang nó + có "quá suy" hay không. */
  phucLine?: { hao: number; quaSuy: boolean };
  /** Hào "mang bệnh" trong cục nếu xác định được (Không Vong/Phá/Nhập Mộ) — ưu tiên Ứng Kỳ. */
  benhLine?: number;
  /** Chi ứng kỳ deterministic (tên chi) nếu suy được; null nếu để lớp Ứng Kỳ khác quyết. */
  ungKyChi: string | null;
  moTa: string;
}

export interface KetQuaSauTamHop {
  co: boolean;
  danhSach: SauTamHopFormed[];
  ghiChu: string[];
}

/** Hào "mang bệnh" = Không Vong / Nguyệt Phá / Nhật Phá / Nhập Mộ (FACT engine). */
function laHaoBenh(h: FullCastResult["chinh"]["hao"][number]): boolean {
  return h.xunKong || h.relations.some((r) => r.type === "Nguyệt Phá" || r.type === "Nhật Phá" || r.type === "Nhập Mộ");
}

/**
 * Phân loại 6 trường hợp Tam Hợp trên 1 quẻ. Với mỗi cục (Hỏa/Thủy/Kim/Mộc) thử khớp theo thứ tự
 * TH1 → TH5 → TH4 → TH3 → TH2 → TH6 (đủ trước, khuyết sau; ưu tiên nguồn phủ mạnh hơn).
 */
export function phanLoaiSauTamHop(cast: FullCastResult): KetQuaSauTamHop {
  const danhSach: SauTamHopFormed[] = [];
  const dayChiIndex = CHI.indexOf(cast.dayChi);
  const monthChiIndex = CHI.indexOf(cast.monthChi);
  const dongSet = new Set(cast.dongPositions);

  const hao = cast.chinh.hao;
  const laAmDong = (h: (typeof hao)[number]) => !h.isDong && h.relations.some((r) => r.type === "Ám Động");

  for (const cuc of TAM_HOP_CUC) {
    const chis = [cuc.sinh, cuc.vuong, cuc.mo];
    const tenCuc = `${cuc.nguHanh} cục (${tenChiCuc(cuc)})`;
    const diaChi: [string, string, string] = [CHI[cuc.sinh], CHI[cuc.vuong], CHI[cuc.mo]];

    // Gom coverage theo từng loại nguồn cho từng chi cần.
    const dongOf = (chi: number) => cast.dongPositions.find((p) => hao[p - 1]?.chiIndex === chi);
    const amDongOf = (chi: number) => hao.find((h) => h.chiIndex === chi && laAmDong(h))?.hao;
    const staticOf = (chi: number) => hao.find((h) => h.chiIndex === chi && !dongSet.has(h.hao) && !laAmDong(h))?.hao;
    const phucOf = (chi: number) => hao.find((h) => h.phucThan?.chiIndex === chi)?.hao;

    const dongChi = chis.filter((c) => dongOf(c) !== undefined);
    const push = (f: SauTamHopFormed) => danhSach.push(f);

    // TH1 — 3 hào động.
    if (dongChi.length === 3) {
      const lines = chis.map((c) => dongOf(c)!);
      const benh = lines.find((p) => laHaoBenh(hao[p - 1]));
      push({
        case: "TH1_FULL", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: true,
        participatingLines: lines, benhLine: benh, ungKyChi: benh !== undefined ? CHI[hao[benh - 1].chiIndex] : null,
        moTa: `${tenCuc} đủ 3 hào động (hào ${lines.join(", ")}).`,
      });
      continue;
    }

    // TH5 — 2 động + hào biến của chính 1 trong 2 động ra chi thiếu.
    if (dongChi.length === 2) {
      const thieu = chis.find((c) => dongOf(c) === undefined)!;
      const dongLines = dongChi.map((c) => dongOf(c)!);
      const bienLine = dongLines.find((p) => cast.bien?.hao[p - 1]?.chiIndex === thieu);
      if (bienLine !== undefined) {
        const benh = dongLines.find((p) => laHaoBenh(hao[p - 1]));
        push({
          case: "TH5_TWO_MOVING_ONE_TRANSFORMED", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: true,
          participatingLines: dongLines, transformedLine: bienLine,
          benhLine: benh, ungKyChi: benh !== undefined ? CHI[hao[benh - 1].chiIndex] : null,
          moTa: `${tenCuc}: 2 hào động (hào ${dongLines.join(", ")}) + hào ${bienLine} động hóa ra ${CHI[thieu]} — cục đủ.`,
        });
        continue;
      }
    }

    // TH4 — 1 động + mượn CẢ Nhật và Nguyệt làm 2 chi còn lại.
    if (dongChi.length === 1) {
      const conLai = chis.filter((c) => c !== dongChi[0]);
      const covByDayMonth =
        (conLai[0] === dayChiIndex && conLai[1] === monthChiIndex) ||
        (conLai[0] === monthChiIndex && conLai[1] === dayChiIndex);
      if (covByDayMonth) {
        const dongLine = dongOf(dongChi[0])!;
        push({
          case: "TH4_DAY_MONTH_MOVING", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: true,
          participatingLines: [dongLine], benhLine: laHaoBenh(hao[dongLine - 1]) ? dongLine : undefined,
          ungKyChi: laHaoBenh(hao[dongLine - 1]) ? CHI[hao[dongLine - 1].chiIndex] : null,
          moTa: `${tenCuc}: Nhật (${CHI[dayChiIndex]}) + Nguyệt (${CHI[monthChiIndex]}) + hào động ${dongLine} — cục đủ.`,
        });
        continue;
      }
    }

    // Các cục KHUYẾT — cần đúng 2 chi có nguồn "động/ám động" + 1 chi giữ chỗ (an tĩnh / phục thần).
    // TH3 — minh động + ám động + an tĩnh.
    {
      const minh = chis.filter((c) => dongOf(c) !== undefined);
      const am = chis.filter((c) => amDongOf(c) !== undefined && dongOf(c) === undefined);
      const tinh = chis.filter((c) => staticOf(c) !== undefined && dongOf(c) === undefined && amDongOf(c) === undefined);
      if (minh.length === 1 && am.length === 1 && tinh.length === 1) {
        const staticLine = staticOf(tinh[0])!;
        const lines = [dongOf(minh[0])!, amDongOf(am[0])!, staticLine];
        push({
          case: "TH3_MINH_DONG_AM_DONG_STATIC", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: false,
          participatingLines: lines, staticLine, benhLine: laHaoBenh(hao[staticLine - 1]) ? staticLine : undefined,
          ungKyChi: CHI[tinh[0]], // ngày/tháng trùng Chi hào an tĩnh
          moTa: `${tenCuc} KHUYẾT: minh động (hào ${lines[0]}) + ám động (hào ${lines[1]}) + an tĩnh (hào ${staticLine}). Ứng khi gặp ${CHI[tinh[0]]}.`,
        });
        continue;
      }
    }

    // TH2 — 2 động + 1 an tĩnh.
    if (dongChi.length === 2) {
      const thieu = chis.find((c) => dongOf(c) === undefined)!;
      const staticLine = staticOf(thieu);
      if (staticLine !== undefined) {
        const lines = [...dongChi.map((c) => dongOf(c)!), staticLine];
        push({
          case: "TH2_MISSING_STATIC", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: false,
          participatingLines: lines, staticLine, benhLine: laHaoBenh(hao[staticLine - 1]) ? staticLine : undefined,
          ungKyChi: CHI[thieu], // ngày trùng Chi hào an tĩnh
          moTa: `${tenCuc} KHUYẾT: 2 hào động (hào ${dongChi.map((c) => dongOf(c)!).join(", ")}) + an tĩnh (hào ${staticLine}). Ứng khi gặp ${CHI[thieu]}.`,
        });
        continue;
      }

      // TH6 — 2 động + 1 Phục Thần.
      const phucLine = phucOf(thieu);
      if (phucLine !== undefined) {
        const phucNH = CHI_NGU_HANH[thieu];
        // "Quá suy" = Nhật VÀ Nguyệt đều khắc Phục Thần (không đủ sức thoát ra).
        const quaSuy =
          khacBoi(phucNH, CHI_NGU_HANH[dayChiIndex]) &&
          khacBoi(phucNH, CHI_NGU_HANH[monthChiIndex]);
        push({
          case: "TH6_TWO_MOVING_PHUC_THAN", nguHanh: cuc.nguHanh, tenCuc, diaChi, full: false,
          participatingLines: dongChi.map((c) => dongOf(c)!), phucLine: { hao: phucLine, quaSuy },
          benhLine: phucLine, ungKyChi: CHI[thieu], // Phục chính là hào mang bệnh; ứng khi gặp Chi Phục
          moTa: `${tenCuc} KHUYẾT: 2 hào động + Phục Thần (hào ${phucLine}, chi ${CHI[thieu]})${quaSuy ? " — Phục quá suy, khó thoát ra, cục khó thành" : ""}. Ứng khi gặp ${CHI[thieu]}.`,
        });
        continue;
      }
    }
  }

  return {
    co: danhSach.length > 0,
    danhSach,
    ghiChu:
      danhSach.length === 0
        ? ["Không có tổ hợp 3 Địa Chi nào thành Tam Hợp (đủ hoặc khuyết) trên quẻ."]
        : ["Tam Hợp phân loại theo KIỂU hình thành + Ứng Kỳ (FACT). Cục TỐT/XẤU tùy hành cục sinh/khắc Dụng Thần — thuộc lớp luận."],
  };
}

/** b khắc a? (KHAC: Mộc→Thổ, Thổ→Thủy, Thủy→Hỏa, Hỏa→Kim, Kim→Mộc). */
function khacBoi(a: NguHanh, b: NguHanh): boolean {
  const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  return KHAC[b] === a;
}
