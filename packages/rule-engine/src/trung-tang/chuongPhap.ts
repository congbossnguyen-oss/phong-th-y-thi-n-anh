/**
 * TRÙNG TANG — Chưởng pháp Trùng Tang / Nhập Mộ / Thiên Di (Bước 1-2 trong skill
 * `luan-trung-tang`, nguồn "Sổ Tay Tang Sự" Chương 6 §1-2, đối chiếu Tam Giáo Chính Hội).
 *
 * Nguyên tắc khởi cung: Nam nhất thập khởi Dần, thuận; Nữ nhất thập khởi Thân, nghịch.
 * Niên hạ sinh Nguyệt — Nguyệt hạ sinh Nhật — Nhật hạ sinh Thời (mỗi chặng khởi từ cung
 * liền sau cung vừa dừng). Công thức đã được đối chiếu khớp 100% với ví dụ nguyên văn trong
 * sách (Nam, giờ Dần, ngày 6, tháng 3, thọ 66 tuổi → tứ cung đều Nhập Mộ).
 *
 * ⚠️ Người mất dưới 10 tuổi: sách nói "không tính trùng tang" — hàm gọi ở tầng trên phải tự
 * chặn trường hợp này trước khi gọi các hàm ở đây.
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export type GioiTinh = "nam" | "nu";

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

const CHI_INDEX = new Map<Chi, number>(Data.CHI.map((c, i) => [c, i]));

/** Cung Thìn-Tuất-Sửu-Mùi. */
export const CUNG_NHAP_MO: readonly Chi[] = ["Thìn", "Tuất", "Sửu", "Mùi"];
/** Cung Tý-Ngọ-Mão-Dậu. */
export const CUNG_THIEN_DI: readonly Chi[] = ["Tý", "Ngọ", "Mão", "Dậu"];
/** Cung Dần-Thân-Tỵ-Hợi. */
export const CUNG_TRUNG_TANG: readonly Chi[] = ["Dần", "Thân", "Tỵ", "Hợi"];

export type PhanLoaiCung = "nhap-mo" | "thien-di" | "trung-tang";

export function phanLoaiCung(chi: Chi): PhanLoaiCung {
  if ((CUNG_NHAP_MO as readonly Chi[]).includes(chi)) return "nhap-mo";
  if ((CUNG_TRUNG_TANG as readonly Chi[]).includes(chi)) return "trung-tang";
  return "thien-di";
}

export interface BonCungTrungTang {
  cungTuoi: Chi;
  cungThang: Chi;
  cungNgay: Chi;
  /** null nếu không rõ giờ mất — chỉ luận được 3/4 cung. */
  cungGio: Chi | null;
}

/**
 * Tính 4 cung Tuổi/Tháng/Ngày/Giờ theo chưởng pháp. `tuoiMat` là tuổi ta (âm lịch) lúc mất,
 * `thangMat`/`ngayMat` là tháng/ngày âm lịch, `gioMat` là 1 trong 12 Chi giờ (bỏ trống nếu
 * không rõ).
 */
export function tinhBonCungTrungTang(
  gioiTinh: GioiTinh,
  tuoiMat: number,
  thangMat: number,
  ngayMat: number,
  gioMat: Chi | null,
): BonCungTrungTang {
  const s = gioiTinh === "nam" ? 1 : -1;
  const start = gioiTinh === "nam" ? CHI_INDEX.get("Dần")! : CHI_INDEX.get("Thân")!;
  const d = Math.floor(tuoiMat / 10);
  const u = tuoiMat % 10;

  const idxTuoi = mod12(start + s * (d - 1 + u));
  const idxThang = mod12(idxTuoi + s * thangMat);
  const idxNgay = mod12(idxThang + s * ngayMat);

  let cungGio: Chi | null = null;
  if (gioMat) {
    const k = CHI_INDEX.get(gioMat)! + 1; // Tý=1 ... Hợi=12
    const idxGio = mod12(idxNgay + s * k);
    cungGio = Data.CHI[idxGio]!;
  }

  return {
    cungTuoi: Data.CHI[idxTuoi]!,
    cungThang: Data.CHI[idxThang]!,
    cungNgay: Data.CHI[idxNgay]!,
    cungGio,
  };
}
