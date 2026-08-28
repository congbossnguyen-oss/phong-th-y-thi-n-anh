/**
 * Kim Lâu / Hoang Ốc — RIÊNG cho module Xem Ngày Cao Cấp (chỉ áp cho động thổ/khởi công).
 *
 * ⚠️ Anh Công CHỦ ĐỘNG chốt (28/8/2026): "cho Kim Lâu Hoang Ốc vào Xem Cao Cấp, phần thần sát" —
 * dùng đúng công thức trong tài liệu skill của MODULE NÀY (`tang2-chon-thang-theo-toa.md` mục
 * "Soát tuổi gia chủ"), KHÔNG dùng lại module `hoang-oc-kim-lau/` (đang dùng ở module khác — công
 * thức khác, tự nhận "dân gian phổ biến, không đối chiếu được nguồn cụ thể"). Cố ý đặt file RIÊNG,
 * KHÔNG sửa `hoang-oc-kim-lau/` — tránh ảnh hưởng các module khác đang dùng công thức đó.
 *
 * Công thức dưới đây SUY RA từ 2 ví dụ minh họa trong chính tài liệu (không suy đoán ngoài tài
 * liệu) — đã verify khớp CHÍNH XÁC cả 2 ví dụ:
 *   - "VD tuổi 33: 30 ở Tam Địa Sát → 31 Tứ Tấn Tài → 32 Ngũ Thọ Tử → 33 Lục Hoang Ốc (xấu)."
 *   - "VD tuổi 54: 50 Trung cung → 51 Cấn → 52 Chấn → 53 Tốn → 54 Ly (tốt theo Kim Lâu). Nhưng
 *     theo Hoang Ốc: 50 Ngũ Thọ Tử → 51 Lục Hoang Ốc → 52 Nhất Kiết → 53 Nhì Nghi → 54 Tam Địa
 *     Sát (xấu)."
 * Quy tắc: mỗi mốc chục (10,20,...,60, quay lại 70=10...) ứng CỐ ĐỊNH 1 cung theo đúng thứ tự liệt
 * kê trong tài liệu; tuổi lẻ giữa 2 mốc "đếm tiếp" từng tuổi 1 cung, xoay vòng, RESET lại đúng cung
 * mốc ở mỗi đầu chục — không phải xoay vòng liên tục xuyên suốt các mốc chục.
 *
 * ⚠️ Tuổi mụ dưới 10 CHƯA có ví dụ xác nhận trực tiếp trong tài liệu — công thức áp dụng cho tuổi
 * đó là ngoại suy theo cùng quy luật, không phải trích nguyên văn.
 */

const HOANG_OC_CUNG = ["Nhất Kiết", "Nhì Nghi", "Tam Địa Sát", "Tứ Tấn Tài", "Ngũ Thọ Tử", "Lục Hoang Ốc"] as const;
const HOANG_OC_XAU = new Set<string>(["Tam Địa Sát", "Ngũ Thọ Tử", "Lục Hoang Ốc"]);
const KIM_LAU_CUNG = ["Khôn", "Đoài", "Càn", "Khảm", "Trung Cung", "Cấn", "Chấn", "Tốn", "Ly"] as const;
const KIM_LAU_XAU = new Set<string>(["Khôn", "Càn", "Trung Cung", "Cấn"]);

/** 8 tuổi miễn kỵ xây dựng mọi năm — nguyên văn tài liệu. */
const TUOI_MIEN_KY_XAY_DUNG = new Set<string>([
  "Tân Mùi", "Nhâm Thân", "Kỷ Sửu", "Canh Dần", "Tân Sửu", "Nhâm Dần", "Kỷ Mùi", "Canh Thân",
]);

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/** Cung tại tuổi mụ `t`, chu kỳ `n` cung, mỗi mốc chục X ứng cung index (X/10 - 1) mod n (0-based). */
function cungTheoTuoiMu(t: number, n: number): number {
  const x = Math.floor(t / 10) * 10;
  const kMoc = mod(x / 10 - 1, n);
  const du = t - x;
  return mod(kMoc + du, n);
}

export interface HoangOcXemCaoCapResult {
  cung: (typeof HOANG_OC_CUNG)[number];
  tot: boolean;
}
export interface KimLauXemCaoCapResult {
  cung: (typeof KIM_LAU_CUNG)[number];
  tot: boolean;
}

export function traHoangOcXemCaoCap(tuoiMu: number): HoangOcXemCaoCapResult {
  const cung = HOANG_OC_CUNG[cungTheoTuoiMu(tuoiMu, 6)]!;
  return { cung, tot: !HOANG_OC_XAU.has(cung) };
}
export function traKimLauXemCaoCap(tuoiMu: number): KimLauXemCaoCapResult {
  const cung = KIM_LAU_CUNG[cungTheoTuoiMu(tuoiMu, 9)]!;
  return { cung, tot: !KIM_LAU_XAU.has(cung) };
}
export function mienKyXayDung(canChiTuoi: string): boolean {
  return TUOI_MIEN_KY_XAY_DUNG.has(canChiTuoi);
}

export interface SoatTuoiGiaChuKetQua {
  tuoiMu: number;
  hoangOc: HoangOcXemCaoCapResult;
  kimLau: KimLauXemCaoCapResult;
  mienKy: boolean;
  /** Theo tài liệu: cả 2 đạt mới thực sự "được vận khí"; đạt 1/2 là thứ cát; cả 2 xấu → khuyên mượn tuổi/lùi năm. */
  mucDo: "duoc_van_khi" | "thu_kiet" | "nen_muon_tuoi";
}

export function soatTuoiGiaChu(namSinh: number, namXem: number, canChiTuoi: string): SoatTuoiGiaChuKetQua {
  const tuoiMu = namXem - namSinh + 1;
  const hoangOc = traHoangOcXemCaoCap(tuoiMu);
  const kimLau = traKimLauXemCaoCap(tuoiMu);
  const mienKy = mienKyXayDung(canChiTuoi);
  const soDat = (hoangOc.tot ? 1 : 0) + (kimLau.tot ? 1 : 0);
  const mucDo = mienKy || soDat === 2 ? "duoc_van_khi" : soDat === 1 ? "thu_kiet" : "nen_muon_tuoi";
  return { tuoiMu, hoangOc, kimLau, mienKy, mucDo };
}
