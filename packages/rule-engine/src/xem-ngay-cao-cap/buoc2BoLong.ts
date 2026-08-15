/**
 * XEM NGÀY CAO CẤP — Bước 2 PHƯƠNG PHÁP B: BỔ LONG TAM CỤC (Ấn cục / Tài cục / Vượng cục).
 * Nguồn: skill xem-ngay-cao-cap/references/tang2-chon-thang-theo-toa.md, phần "Bổ Long Tam Cục".
 *
 * Nguyên lý: xác định ngũ hành của LONG (= tọa sơn theo CHÍNH NGŨ HÀNH 24 sơn), rồi chọn 1 trong
 * 3 tam hợp cục để "bổ" cho Long — cho Năm/Tháng/Ngày/Giờ rơi vào 3 chi của cục đó (nhất khí).
 * Chỉ xét ĐỊA CHI, không liên quan nạp âm.
 *
 *   - Ấn cục   = tam hợp cục SINH ra Long        → ưu tiên cao nhất (sinh nhập, nuôi dưỡng)
 *   - Tài cục  = tam hợp cục bị Long KHẮC        → dùng khi Ấn cục không khả thi
 *   - Vượng cục = tam hợp cục ĐỒNG HÀNH với Long → xét sau cùng
 *
 * ⚠️ Hành THỔ không tạo được tam hợp cục (chỉ Mộc/Hỏa/Kim/Thủy có). Nên:
 *   - Long thuộc Thổ → KHÔNG có Vượng cục.
 *   - Long có Ấn hoặc Tài rơi vào Thổ → cục đó cũng không tồn tại.
 *
 * ⚠️ Bảng Chính Ngũ Hành 24 sơn ở đây KHÁC bảng Hồng Phạm Ngũ Hành dùng cho Mộ Long (Bước 3b) —
 * không dùng lẫn.
 *
 * Phương pháp B ĐỘC LẬP với phương pháp A (Tự hợp/Sinh hợp/Tam hợp theo mùa). Nguồn ghi rõ: nếu
 * 2 phương pháp cho kết quả trùng nhau → độ tin cậy cao; nếu lệch → KHÔNG có quy tắc phân xử
 * cứng, phải trình bày cả 2 cho người dùng chọn, không tự chọn 1 bên.
 */
import type { Data } from "@thien-anh/calendar-core";
import type { TenSon } from "./data/sonBatQuai.js";

type Chi = Data.Chi;
type NguHanhTen = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

/** Chính Ngũ Hành của 24 sơn — nguồn tang2-chon-thang-theo-toa.md (Bổ Long Tam Cục). */
export const CHINH_NGU_HANH_24_SON: Readonly<Record<TenSon, NguHanhTen>> = {
  // Tứ chính + Thiên Can phối theo Chính Ngũ Hành
  Tý: "Thủy", Quý: "Thủy", Nhâm: "Thủy", Hợi: "Thủy",
  Mão: "Mộc", Giáp: "Mộc", Ất: "Mộc", Dần: "Mộc",
  Ngọ: "Hỏa", Bính: "Hỏa", Đinh: "Hỏa", Tỵ: "Hỏa",
  Dậu: "Kim", Canh: "Kim", Tân: "Kim", Thân: "Kim",
  // Tứ mộ + tứ duy thuộc Thổ
  Thìn: "Thổ", Tuất: "Thổ", Sửu: "Thổ", Mùi: "Thổ",
  Càn: "Thổ", Khôn: "Thổ", Cấn: "Thổ", Tốn: "Thổ",
};

/** 4 tam hợp cục theo hành (Thổ không có cục). */
export const TAM_HOP_CUC: Readonly<Record<Exclude<NguHanhTen, "Thổ">, readonly [Chi, Chi, Chi]>> = {
  Thủy: ["Thân", "Tý", "Thìn"],
  Mộc: ["Hợi", "Mão", "Mùi"],
  Hỏa: ["Dần", "Ngọ", "Tuất"],
  Kim: ["Tỵ", "Dậu", "Sửu"],
};

/** Hành nào SINH ra hành này (Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc). */
const SINH_RA: Readonly<Record<NguHanhTen, NguHanhTen>> = {
  Hỏa: "Mộc", Thổ: "Hỏa", Kim: "Thổ", Thủy: "Kim", Mộc: "Thủy",
};

/** Hành này KHẮC hành nào. */
const KHAC: Readonly<Record<NguHanhTen, NguHanhTen>> = {
  Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc",
};

export type LoaiCuc = "an_cuc" | "tai_cuc" | "vuong_cuc";

export interface CucBoLong {
  loai: LoaiCuc;
  /** Hành của cục. null = cục này không tồn tại (rơi vào Thổ — Thổ không tạo tam hợp). */
  hanh: NguHanhTen | null;
  chi: readonly Chi[] | null;
  khaDung: boolean;
  lyDo: string;
}

export interface KetQuaBoLong {
  tenSon: TenSon;
  hanhLong: NguHanhTen;
  cac: CucBoLong[];
  /** Cục nên ưu tiên nhất trong số các cục khả dụng (Ấn → Tài → Vượng). null nếu không cục nào dùng được. */
  uuTien: CucBoLong | null;
}

function dungCuc(loai: LoaiCuc, hanh: NguHanhTen, moTa: string): CucBoLong {
  if (hanh === "Thổ") {
    return { loai, hanh: null, chi: null, khaDung: false, lyDo: `${moTa} rơi vào hành Thổ — Thổ không tạo được tam hợp cục nên cục này không tồn tại.` };
  }
  return { loai, hanh, chi: TAM_HOP_CUC[hanh], khaDung: true, lyDo: `${moTa}: cục ${hanh} (${TAM_HOP_CUC[hanh].join(" - ")}).` };
}

/**
 * Tính Bổ Long Tam Cục cho 1 tọa sơn.
 *
 * Lưu ý dùng kết quả: đây là bước GỢI Ý khung tháng/năm, KHÔNG phải bộ lọc cứng. Cục được chọn
 * vẫn phải qua Bước 3 (phương vị sát) — nguồn có ví dụ Long tọa Mùi: Ấn cục Hỏa dùng được, nhưng
 * Tài cục Thủy (Thân Tý Thìn) lại dính Tam Sát nên phải loại.
 */
export function tinhBoLongTamCuc(tenSon: TenSon): KetQuaBoLong {
  const hanhLong = CHINH_NGU_HANH_24_SON[tenSon];
  if (!hanhLong) throw new Error(`Không xác định được Chính Ngũ Hành của sơn: ${tenSon}`);

  const cac: CucBoLong[] = [
    dungCuc("an_cuc", SINH_RA[hanhLong], `Ấn cục (hành sinh cho Long ${hanhLong})`),
    dungCuc("tai_cuc", KHAC[hanhLong], `Tài cục (hành bị Long ${hanhLong} khắc)`),
    dungCuc("vuong_cuc", hanhLong, `Vượng cục (đồng hành với Long ${hanhLong})`),
  ];

  const uuTien = cac.find((c) => c.khaDung) ?? null;
  return { tenSon, hanhLong, cac, uuTien };
}

/** Chi này có thuộc cục đang chọn không — dùng để chấm điểm Năm/Tháng/Ngày/Giờ. */
export function chiThuocCuc(cuc: CucBoLong, chi: Chi): boolean {
  return cuc.chi ? (cuc.chi as readonly Chi[]).includes(chi) : false;
}
