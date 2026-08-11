/**
 * Phạm Thái Tuế theo năm — 4 loại kinh điển: Trực (Tọa) Thái Tuế, Xung Thái Tuế, Hình Thái
 * Tuế, Hại Thái Tuế. Cho Chi của NĂM đang xét, trả về (các) Chi tuổi bị phạm mỗi loại.
 *
 * Đây là kiến thức nền tảng cố định của Can Chi học (Lục Xung, Tam Hình, Lục Hại — không có
 * dị bản giữa các trường phái, không cần đối chiếu nguồn riêng — cùng cách xử lý với
 * `lucXung.ts` đã có). KHÔNG bao gồm "Phá Thái Tuế" (Lục Phá) — một số tài liệu có thêm loại
 * này nhưng không thống nhất giữa các nguồn phổ biến bằng 4 loại trên, nên bỏ qua để tránh
 * suy đoán thêm.
 *
 * - Tam Hình có 4 nhóm: 2 nhóm tam giác xoay vòng (Dần-Tỵ-Thân, Sửu-Tuất-Mùi — mỗi Chi hình
 *   với 2 Chi còn lại trong nhóm), 1 cặp đôi (Tý-Mão hình lẫn nhau), và 4 Chi "tự hình" với
 *   chính mình (Thìn, Ngọ, Dậu, Hợi) — tự hình trùng với năm chính là năm Trực Thái Tuế của
 *   4 con giáp này (không phải tuổi khác), nên đánh dấu bằng cờ `namTuHinh` riêng thay vì gộp
 *   vào danh sách `tuoiHinhThaiTue`.
 */
import { Data } from "@thien-anh/calendar-core";
import { getLucXungChi } from "./lucXung.js";

type Chi = Data.Chi;

export const TAM_HINH_TAM_GIAC: readonly (readonly [Chi, Chi, Chi])[] = [
  ["Dần", "Tỵ", "Thân"], // Vô Ân Chi Hình
  ["Sửu", "Tuất", "Mùi"], // Trì Thế Chi Hình
];

export const TAM_HINH_DOI: readonly [Chi, Chi] = ["Tý", "Mão"]; // Vô Lễ Chi Hình

export const TU_HINH: readonly Chi[] = ["Thìn", "Ngọ", "Dậu", "Hợi"];

export const LUC_HAI: readonly (readonly [Chi, Chi])[] = [
  ["Tý", "Mùi"],
  ["Sửu", "Ngọ"],
  ["Dần", "Tỵ"],
  ["Mão", "Thìn"],
  ["Thân", "Hợi"],
  ["Dậu", "Tuất"],
];

/** (Các) Chi hình với Chi cho trước, theo Tam Hình (không tính tự hình — xem `TU_HINH`). */
export function getHinhThaiTueChi(chi: Chi): Chi[] {
  for (const tamGiac of TAM_HINH_TAM_GIAC) {
    if (tamGiac.includes(chi)) {
      return tamGiac.filter((c) => c !== chi);
    }
  }
  if (TAM_HINH_DOI.includes(chi)) {
    return TAM_HINH_DOI.filter((c) => c !== chi);
  }
  return [];
}

/** Chi hại với Chi cho trước, theo Lục Hại. */
export function getHaiThaiTueChi(chi: Chi): Chi {
  const cap = LUC_HAI.find((p) => p.includes(chi))!;
  return cap[0] === chi ? cap[1] : cap[0];
}

export interface PhamThaiTueResult {
  /** Chi của năm đang xét (Thái Tuế năm nay). */
  namChi: Chi;
  /** Tuổi Trực (Tọa) Thái Tuế — cùng Chi với năm. */
  tuoiPhamThaiTue: Chi;
  /** Tuổi Xung Thái Tuế — đối xung với năm (Lục Xung). */
  tuoiXungThaiTue: Chi;
  /** (Các) tuổi Hình Thái Tuế — theo Tam Hình, KHÔNG gồm trường hợp tự hình (xem `namTuHinh`). */
  tuoiHinhThaiTue: Chi[];
  /** Năm nay có phải 1 trong 4 Chi tự hình (Thìn/Ngọ/Dậu/Hợi) hay không — nếu có, tuổi Trực Thái Tuế ở trên còn bị thêm tự hình. */
  namTuHinh: boolean;
  /** Tuổi Hại Thái Tuế — theo Lục Hại. */
  tuoiHaiThaiTue: Chi;
}

export function getPhamThaiTueTheoNam(namChi: Chi): PhamThaiTueResult {
  return {
    namChi,
    tuoiPhamThaiTue: namChi,
    tuoiXungThaiTue: getLucXungChi(namChi),
    tuoiHinhThaiTue: getHinhThaiTueChi(namChi),
    namTuHinh: (TU_HINH as readonly Chi[]).includes(namChi),
    tuoiHaiThaiTue: getHaiThaiTueChi(namChi),
  };
}
