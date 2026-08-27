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
