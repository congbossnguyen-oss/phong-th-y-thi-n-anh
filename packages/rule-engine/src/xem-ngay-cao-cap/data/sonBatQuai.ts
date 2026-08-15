/**
 * 24 sơn la bàn — nền tảng dùng chung cho mọi bước (quy Tọa/Hướng về cung Bát Quái, về 1 trong 4
 * phương chính, tra Ngũ Hoàng CSV, tra Bát Sát...). Nguồn: skill xem-ngay-cao-cap (tang2, tang3,
 * cuu-cung-nam-thang-cach-dung.md) — đối chiếu khớp giữa các file.
 *
 * Độ số tâm mỗi sơn = i*15° (Tý=0°/Bắc, Mão=90°/Đông, Ngọ=180°/Nam, Dậu=270°/Tây), mỗi sơn phủ
 * ±7.5° quanh tâm. 4 phương chính (Đông/Nam/Tây/Bắc) mỗi phương phủ đúng 90°, tâm tại 4 sơn
 * chính khí (Mão/Ngọ/Dậu/Tý), ranh giới rơi đúng GIỮA 4 sơn duy (Cấn/Tốn/Khôn/Càn) — nghĩa là
 * riêng 4 sơn duy này bị chia đôi giữa 2 phương, đúng như tang2-chon-thang-theo-toa.md mô tả
 * ("Nửa ĐB2, ĐB3, Đ1..."). Vì vậy 4 sơn duy CẦN độ số chính xác mới xác định đúng phương — nếu
 * chỉ có tên sơn (không có độ số), phải báo thiếu dữ liệu, không suy đoán.
 */
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export type CungBatQuai = "Khảm" | "Cấn" | "Chấn" | "Tốn" | "Ly" | "Khôn" | "Đoài" | "Càn";
export type PhuongChinh = "Đông" | "Nam" | "Tây" | "Bắc";
export type TenSon = Can | Chi | "Càn" | "Khôn" | "Cấn" | "Tốn";

/** 4 sơn duy (quái) — luôn nằm đúng ranh giới giữa 2 phương chính, cần độ số mới tách được. */
export const SON_DUY: readonly TenSon[] = ["Cấn", "Tốn", "Khôn", "Càn"];

export interface DinhNghiaSon {
  ten: TenSon;
  doTam: number; // độ số tâm, 0-345, bước 15°
  cung: CungBatQuai;
}

/** Thứ tự 24 sơn theo chiều kim đồng hồ, bắt đầu từ Tý (0°/Bắc). */
export const DANH_SACH_24_SON: readonly DinhNghiaSon[] = [
  { ten: "Tý", doTam: 0, cung: "Khảm" },
  { ten: "Quý", doTam: 15, cung: "Khảm" },
  { ten: "Sửu", doTam: 30, cung: "Cấn" },
  { ten: "Cấn", doTam: 45, cung: "Cấn" },
  { ten: "Dần", doTam: 60, cung: "Cấn" },
  { ten: "Giáp", doTam: 75, cung: "Chấn" },
  { ten: "Mão", doTam: 90, cung: "Chấn" },
  { ten: "Ất", doTam: 105, cung: "Chấn" },
  { ten: "Thìn", doTam: 120, cung: "Tốn" },
  { ten: "Tốn", doTam: 135, cung: "Tốn" },
  { ten: "Tỵ", doTam: 150, cung: "Tốn" },
  { ten: "Bính", doTam: 165, cung: "Ly" },
  { ten: "Ngọ", doTam: 180, cung: "Ly" },
  { ten: "Đinh", doTam: 195, cung: "Ly" },
  { ten: "Mùi", doTam: 210, cung: "Khôn" },
  { ten: "Khôn", doTam: 225, cung: "Khôn" },
  { ten: "Thân", doTam: 240, cung: "Khôn" },
  { ten: "Canh", doTam: 255, cung: "Đoài" },
  { ten: "Dậu", doTam: 270, cung: "Đoài" },
  { ten: "Tân", doTam: 285, cung: "Đoài" },
  { ten: "Tuất", doTam: 300, cung: "Càn" },
  { ten: "Càn", doTam: 315, cung: "Càn" },
  { ten: "Hợi", doTam: 330, cung: "Càn" },
  { ten: "Nhâm", doTam: 345, cung: "Khảm" },
];

const SON_MAP = new Map<TenSon, DinhNghiaSon>(DANH_SACH_24_SON.map((s) => [s.ten, s]));

export function timDinhNghiaSon(ten: TenSon): DinhNghiaSon {
  const dn = SON_MAP.get(ten);
  if (!dn) throw new Error(`Không nhận diện được sơn: ${ten}`);
  return dn;
}

/** Quy 1 sơn về cung Bát Quái — LUÔN chính xác (ranh giới cung trùng ranh giới sơn, không mơ hồ). */
export function cungCuaSon(ten: TenSon): CungBatQuai {
  return timDinhNghiaSon(ten).cung;
}

function chuanHoaDo(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Quy độ số la bàn (0-359.99) về 1 trong 4 phương chính — luôn chính xác vì dùng độ số thật. */
export function phuongTuDoSo(doSo: number): PhuongChinh {
  const d = chuanHoaDo(doSo);
  if (d >= 315 || d < 45) return "Bắc";
  if (d >= 45 && d < 135) return "Đông";
  if (d >= 135 && d < 225) return "Nam";
  return "Tây";
}

export interface KetQuaPhuongTuSon {
  phuong: PhuongChinh | null;
  canDoSo: boolean;
}

/**
 * Quy 1 sơn (chỉ có tên, không có độ số) về phương chính. Với 20 sơn thường → luôn chính xác. Với
 * 4 sơn duy (Cấn/Tốn/Khôn/Càn) → không xác định được (nằm đúng ranh giới), trả `phuong: null,
 * canDoSo: true` — tầng gọi phải yêu cầu độ số chính xác, không được tự suy đoán 1 trong 2 phương.
 */
export function phuongTuSon(ten: TenSon): KetQuaPhuongTuSon {
  if ((SON_DUY as readonly TenSon[]).includes(ten)) {
    return { phuong: null, canDoSo: true };
  }
  return { phuong: phuongTuDoSo(timDinhNghiaSon(ten).doTam), canDoSo: false };
}

/** Tên cột grid_* trong CUU_CUNG_NAM_THANG ứng với mỗi cung Bát Quái. */
export const GRID_COT_THEO_CUNG: Readonly<Record<CungBatQuai, "DN" | "N" | "TN" | "D" | "T" | "DB" | "B" | "TB">> = {
  Tốn: "DN",
  Ly: "N",
  Khôn: "TN",
  Chấn: "D",
  Đoài: "T",
  Cấn: "DB",
  Khảm: "B",
  Càn: "TB",
};
