// TRẠCH CÁT KỲ MÔN — lớp KỲ MÔN TỨ HẠI: Kích Hình, Nhập Mộ, Không Vong, Môn Bách.
//
// Nguồn: zhicong-11.md Video 5 mục 1.1-1.4 (Đồng Khôn Nguyên). Đây là bước LỌC CỨNG đầu tiên:
// "Lọc bỏ các ngày có kỳ môn tứ hại (kể cả có 12 kiến tinh và 12 trực thần tốt)".
//
// ⚠️ ĐIỂM MẤU CHỐT: cả 4 hại đều xét theo TỪNG ĐỊA CHI, KHÔNG phải theo cả cung. Một cung góc
// giữ 2 chi thì hoàn toàn có thể 1 chi hỏng, 1 chi vẫn dùng được. Nguồn nói rõ ở 3 chỗ:
//   - "Cung Khôn (ngày mùi, thân): có quý địa bàn nhập mộ tại mùi, lại có không vong tại thân"
//   - "Cung Càn (ngày Tuất - Hợi): có Ất nhập mộ tại Tuất [...] ngày Hợi thì Ất không nhập mộ"
//   - "cung khôn của nam có không vong ở Thân nên chỉ có thể dùng được ngày Mùi"
// Vì vậy KHÔNG dùng cờ `CungInfo.KV` (cờ theo cung) cho trạch cát — phải suy Không Vong theo
// `tuanKhongChi` của lá bàn rồi so từng chi.

import type { CungInfo, LapLaBanResult } from "../types";

/**
 * NHẬP MỘ — theo MỘ KHỐ của từng thiên can, tính cho CẢ can thiên bàn lẫn can địa bàn
 * (zhicong-11.md mục 1.2: "tính cho cả thiên can thiên bàn và thiên can địa bàn").
 * Đã đối chiếu khớp 10/10 ví dụ trong nguồn: Canh/Đinh/Kỷ mộ tại Sửu, Ất/Bính/Mậu mộ tại Tuất,
 * Tân/Nhâm mộ tại Thìn, Giáp/Quý mộ tại Mùi.
 */
const MO_KHO_CUA_CAN: Record<string, string> = {
  Giáp: "Mùi", Quý: "Mùi",
  Ất: "Tuất", Bính: "Tuất", Mậu: "Tuất",
  Đinh: "Sửu", Kỷ: "Sửu", Canh: "Sửu",
  Tân: "Thìn", Nhâm: "Thìn",
};

/**
 * KÍCH HÌNH — mỗi can nghi đại diện một tuần Giáp; chi của tuần đó HÌNH chi của vị trí đang xét.
 * Nguồn giải thích trực tiếp trong 4 ví dụ: "Canh = giáp Thân tại vị trí Dần là kích hình",
 * "Quý = giáp Dần hình với Tỵ", "kỷ = giáp Tuất hình mùi". Bảng suy ra dưới đây cũng khớp đúng
 * bố cục bảng tra ở mục 1.3 của nguồn (Nhâm+Quý ở cung Tốn, Mậu ở Chấn, Canh ở Cấn).
 */
const CHI_TUAN_CUA_CAN: Record<string, string> = {
  Mậu: "Tý", Kỷ: "Tuất", Canh: "Thân", Tân: "Ngọ", Nhâm: "Thìn", Quý: "Dần",
};
/** Chi bị hình bởi chi tuần (tam hình + tự hình). */
const CHI_BI_HINH: Record<string, string> = {
  Tý: "Mão", Tuất: "Mùi", Thân: "Dần", Ngọ: "Ngọ", Thìn: "Thìn", Dần: "Tỵ",
};

/** Ngũ hành Bát Môn — dùng cho Môn Bách (môn khắc cung). */
const NGU_HANH_MON: Record<string, string> = {
  HƯU: "Thủy", SINH: "Thổ", THƯƠNG: "Mộc", ĐỖ: "Mộc",
  CẢNH: "Hỏa", TỬ: "Thổ", KINH: "Kim", KHAI: "Kim",
};
/** Ngũ hành cung theo Lạc Thư. */
const NGU_HANH_CUNG: Record<number, string> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};
const KHAC: Record<string, string> = {
  Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc",
};

/**
 * MÔN BÁCH (môn phá) = MÔN KHẮC CUNG. Nguồn nói thẳng công thức: "đỗ môn môn bách (môn khắc
 * cung - đỗ môn mộc khắc cung cấn thổ)". Đã đối chiếu khớp 7/7 ví dụ trong nguồn.
 * Đây là thuộc tính của CẢ CUNG (không phụ thuộc chi), khác 3 hại còn lại.
 */
export function laMonBach(cung: CungInfo): boolean {
  const hanhMon = NGU_HANH_MON[cung.mon];
  const hanhCung = NGU_HANH_CUNG[cung.soCung];
  if (!hanhMon || !hanhCung) return false;
  return KHAC[hanhMon] === hanhCung;
}

/** Hai chi Không Vong của lá bàn (theo tuần giáp), lấy trực tiếp từ kết quả lập bàn. */
export function chiKhongVong(laBan: LapLaBanResult): Set<string> {
  return new Set(laBan.tuanKhongChi ?? []);
}

export type ViPhamTuHai = {
  loai: "khong_vong" | "nhap_mo" | "kich_hinh" | "mon_bach";
  moTa: string;
};

/**
 * Kiểm tra Kỳ Môn Tứ Hại cho MỘT ĐỊA CHI cụ thể nằm trong một cung.
 * Trả về danh sách vi phạm (rỗng = sạch, dùng được).
 */
export function kiemTraTuHai(
  laBan: LapLaBanResult,
  cung: CungInfo,
  chi: string,
  kvSet: Set<string>,
  /** Nhãn đơn vị đang xét — "ngày" khi chọn ngày, "giờ" khi chọn giờ trên tử cục. */
  nhan: "ngày" | "giờ" = "ngày",
): ViPhamTuHai[] {
  const viPham: ViPhamTuHai[] = [];

  if (kvSet.has(chi)) {
    viPham.push({ loai: "khong_vong", moTa: `${nhan} ${chi} rơi vào Không Vong` });
  }

  // Nhập Mộ — xét cả can thiên bàn và can địa bàn. Trực Phù đại diện Giáp nên cũng tính:
  // nguồn ghi rõ "Trực Phù = Giáp nhập mộ Mùi - Tây Nam".
  const canCanXet: { can: string; nhan: string }[] = [
    { can: cung.thienBanCan, nhan: "can thiên bàn" },
    { can: cung.diaBanCan, nhan: "can địa bàn" },
  ];
  if (cung.soCung === laBan.trucPhuCung) {
    canCanXet.push({ can: "Giáp", nhan: "Trực Phù (Giáp)" });
  }
  for (const { can, nhan } of canCanXet) {
    if (can && MO_KHO_CUA_CAN[can] === chi) {
      viPham.push({ loai: "nhap_mo", moTa: `${can} (${nhan}) nhập mộ tại ${chi}` });
    }
  }

  // Kích Hình — can nghi tại cung này, chi tuần của nó hình chi đang xét.
  for (const { can, nhan } of canCanXet) {
    const chiTuan = can ? CHI_TUAN_CUA_CAN[can] : undefined;
    if (chiTuan && CHI_BI_HINH[chiTuan] === chi) {
      viPham.push({
        loai: "kich_hinh",
        moTa: `${can} (${nhan}, tuần Giáp ${chiTuan}) kích hình tại ${chi}`,
      });
    }
  }

  if (laMonBach(cung)) {
    viPham.push({
      loai: "mon_bach",
      moTa: `${cung.mon} Môn khắc cung ${cung.huong} — phạm Môn Bách`,
    });
  }

  return viPham;
}
