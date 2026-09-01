/**
 * Tam Hội Địa Chi — 3 Chi liên tiếp cùng mùa (KHÁC Tam Hợp/Tam Hợp Cục đã có ở `trach-nhat/
 * tamHop.ts`, vốn là 3 Chi cách đều 120°). Dùng ở Bước 4 phương pháp Đẩu Thủ Chọn Ngày — cộng
 * điểm nếu Địa Chi Tứ Trụ tạo đủ 1 nhóm Tam Hội. Nguồn: `data/dau-thu-chon-ngay.md` Bước 4.
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const TAM_HOI_NHOM: readonly (readonly [Chi, Chi, Chi])[] = [
  ["Dần", "Mão", "Thìn"], // Xuân
  ["Tỵ", "Ngọ", "Mùi"], // Hạ
  ["Thân", "Dậu", "Tuất"], // Thu
  ["Hợi", "Tý", "Sửu"], // Đông
];

/** Tập hợp Chi cho trước có tạo đủ 1 nhóm Tam Hội không. */
export function coTamHoi(chis: readonly Chi[]): boolean {
  const set = new Set(chis);
  return TAM_HOI_NHOM.some((nhom) => nhom.every((c) => set.has(c)));
}
