/**
 * XEM NGÀY CAO CẤP — Bước 2: chọn khung tháng theo Tọa nhà (phương pháp A — Đại Quái).
 * Nguồn: tang2-chon-thang-theo-toa.md.
 *
 * Đây KHÔNG phải điều kiện loại cứng — ngày ngoài các tháng ưu tiên vẫn dùng được, chỉ xếp hạng
 * thấp hơn (đúng như đặc tả module: "dùng để tiền lọc + xếp hạng, không phải điều kiện loại cứng").
 */
import type { Data } from "@thien-anh/calendar-core";
import type { PhuongChinh } from "./data/sonBatQuai.js";

type Chi = Data.Chi;

export type NhomThang = "tu_hop" | "sinh_hop" | "tam_hop";

/** Chi tháng theo quy ước cố định: tháng 1 ÂL = Dần ... tháng 12 ÂL = Sửu. */
export const CHI_THANG_AM_LICH: readonly Chi[] = [
  "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu",
];

/** 1. Tự hợp theo mùa — ưu tiên cao nhất ("Nhất khí thuần thanh"). */
const TU_HOP: Readonly<Record<PhuongChinh, readonly Chi[]>> = {
  Đông: ["Dần", "Mão", "Thìn"],
  Nam: ["Tỵ", "Ngọ", "Mùi"],
  Tây: ["Thân", "Dậu", "Tuất"],
  Bắc: ["Hợi", "Tý", "Sửu"],
};

/** 2. Sinh hợp theo mùa — mùa sinh ra hành của tọa. */
const SINH_HOP: Readonly<Record<PhuongChinh, readonly Chi[]>> = {
  Đông: ["Hợi", "Tý", "Sửu"],
  Nam: ["Dần", "Mão", "Thìn"],
  Tây: ["Tỵ", "Ngọ", "Mùi"],
  Bắc: ["Thân", "Dậu", "Tuất"],
};

/** 3. Tam hợp theo mùa. */
const TAM_HOP: Readonly<Record<PhuongChinh, readonly Chi[]>> = {
  Đông: ["Hợi", "Mão", "Mùi"],
  Nam: ["Dần", "Ngọ", "Tuất"],
  Tây: ["Tỵ", "Dậu", "Sửu"],
  Bắc: ["Thân", "Tý", "Thìn"],
};

/** Tứ Mộ — 4 tháng cần biết nửa đầu/nửa sau (ranh giới theo tiết khí) trước khi chốt ngày. */
export const CHI_TU_MO: readonly Chi[] = ["Thìn", "Tuất", "Sửu", "Mùi"];

export interface NhanThang {
  nhom: NhomThang | null;
  laTuMo: boolean;
}

/** Gắn nhãn cho 1 Chi tháng theo phương của Tọa. Trả `nhom: null` nếu tháng không thuộc nhóm nào. */
export function nhanThangTheoToa(phuongToa: PhuongChinh, chiThang: Chi): NhanThang {
  const laTuMo = CHI_TU_MO.includes(chiThang);
  if (TU_HOP[phuongToa].includes(chiThang)) return { nhom: "tu_hop", laTuMo };
  if (SINH_HOP[phuongToa].includes(chiThang)) return { nhom: "sinh_hop", laTuMo };
  if (TAM_HOP[phuongToa].includes(chiThang)) return { nhom: "tam_hop", laTuMo };
  return { nhom: null, laTuMo };
}

/** Danh sách Chi tháng ưu tiên của 1 phương tọa, xếp theo thứ tự ưu tiên giảm dần (đã khử trùng lặp). */
export function danhSachThangUuTien(phuongToa: PhuongChinh): readonly { chi: Chi; nhom: NhomThang }[] {
  const ketQua: { chi: Chi; nhom: NhomThang }[] = [];
  const daCo = new Set<Chi>();
  for (const [nhom, bang] of [
    ["tu_hop", TU_HOP],
    ["sinh_hop", SINH_HOP],
    ["tam_hop", TAM_HOP],
  ] as const) {
    for (const chi of bang[phuongToa]) {
      if (daCo.has(chi)) continue;
      daCo.add(chi);
      ketQua.push({ chi, nhom });
    }
  }
  return ketQua;
}
