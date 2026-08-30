/**
 * BÁT TRẠCH NHÀ — quy đổi độ số la bàn ↔ 8 cung / 24 sơn, và Hướng ↔ Tọa.
 * Nguồn: gói build `data/03-toa-huong-24-son.md` (trích từ skill `bat-trach-luan-nha`).
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";

export const HUONG_8_LIST = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"] as const;
export type Huong8 = (typeof HUONG_8_LIST)[number];

/** 8 hướng địa lý → quái Hậu Thiên Bát Quái. Độ trung tâm của mỗi hướng (dùng khi người dùng chỉ chọn nhanh, không đo độ số). */
export const HUONG_8_TOI_CUNG: Record<Huong8, CungBatTrach> = {
  Bắc: "Khảm",
  "Đông Bắc": "Cấn",
  Đông: "Chấn",
  "Đông Nam": "Tốn",
  Nam: "Ly",
  "Tây Nam": "Khôn",
  Tây: "Đoài",
  "Tây Bắc": "Càn",
};

const HUONG_8_TOI_DO: Record<Huong8, number> = {
  Bắc: 0,
  "Đông Bắc": 45,
  Đông: 90,
  "Đông Nam": 135,
  Nam: 180,
  "Tây Nam": 225,
  Tây: 270,
  "Tây Bắc": 315,
};

/** 24 sơn theo thứ tự bắt đầu từ Nhâm (337.5°), mỗi sơn 15°. */
export const SON_24_LIST = [
  "Nhâm", "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ",
  "Bính", "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi",
] as const;
export type Son24 = (typeof SON_24_LIST)[number];

export const SON_24_TOI_CUNG: Record<Son24, CungBatTrach> = {
  Nhâm: "Khảm", Tý: "Khảm", Quý: "Khảm",
  Sửu: "Cấn", Cấn: "Cấn", Dần: "Cấn",
  Giáp: "Chấn", Mão: "Chấn", Ất: "Chấn",
  Thìn: "Tốn", Tốn: "Tốn", Tỵ: "Tốn",
  Bính: "Ly", Ngọ: "Ly", Đinh: "Ly",
  Mùi: "Khôn", Khôn: "Khôn", Thân: "Khôn",
  Canh: "Đoài", Dậu: "Đoài", Tân: "Đoài",
  Tuất: "Càn", Càn: "Càn", Hợi: "Càn",
};

/** Chuẩn hóa độ số về [0, 360). */
export function chuanHoaDo(d: number): number {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

/** Độ số → 1 trong 8 cung Bát Quái. Cung Khảm bắc qua mốc 0° nên xử lý riêng (data/03). */
export function doToCung(d: number): CungBatTrach {
  const x = chuanHoaDo(d);
  if (x >= 337.5 || x < 22.5) return "Khảm";
  const CUNG_THEO_INDEX: CungBatTrach[] = ["Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài", "Càn"];
  const index = Math.floor((x - 22.5) / 45);
  return CUNG_THEO_INDEX[index]!;
}

/** Độ số → 1 trong 24 sơn (15°/sơn), bắt đầu từ Nhâm ở 337.5° (data/03). */
export function doToSon(d: number): Son24 {
  const x = chuanHoaDo(d);
  const index = Math.floor(chuanHoaDo(x + 22.5) / 15);
  return SON_24_LIST[index]!;
}

/** Tọa = đối diện Hướng, lệch 180°. */
export function huongToToa(huongDo: number): number {
  return chuanHoaDo(huongDo + 180);
}

export interface CanhBaoLapHuong {
  /** true nếu độ nhập rơi đúng 1 trong 4 chính hướng tuyệt đối (0/90/180/270°). */
  chinhHuongTuyetDoi: boolean;
  /** true nếu độ nhập rơi đúng ranh giới 2 cung (không vong) — nên đo lại bằng la kinh. */
  ranhGioiKhongVong: boolean;
}

const RANH_GIOI_CUNG = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

/** Cảnh báo hiển thị cho người dùng khi lập hướng — KHÔNG chặn tính toán (data/03). */
export function canhBaoLapHuong(d: number, dungSai = 0.5): CanhBaoLapHuong {
  const x = chuanHoaDo(d);
  const chinhHuongTuyetDoi = [0, 90, 180, 270].some((mc) => Math.abs(x - mc) < dungSai || Math.abs(x - mc - 360) < dungSai);
  const ranhGioiKhongVong = RANH_GIOI_CUNG.some((mc) => Math.abs(x - mc) < dungSai);
  return { chinhHuongTuyetDoi, ranhGioiKhongVong };
}

/** Đầu vào hướng nhà — 1 trong 3 kiểu nhập (data/03 mục "Nhập hướng"), quy hết về độ số. */
export type DauVaoHuong = { kieu: "8huong"; huong: Huong8 } | { kieu: "do"; do: number } | { kieu: "laBanDienThoai"; do: number };

/** Quy đổi đầu vào Hướng (bất kể kiểu nhập) về độ số 0-360. */
export function doTuDauVaoHuong(input: DauVaoHuong): number {
  if (input.kieu === "8huong") return HUONG_8_TOI_DO[input.huong];
  return chuanHoaDo(input.do);
}
