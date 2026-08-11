/**
 * Tam Hợp (4 cục 3 Chi hòa hợp): Thân-Tý-Thìn (Thủy cục), Dần-Ngọ-Tuất (Hỏa cục), Tỵ-Dậu-Sửu
 * (Kim cục), Hợi-Mão-Mùi (Mộc cục).
 *
 * Đây là kiến thức nền tảng cố định của Can Chi học (không có dị bản giữa các trường phái,
 * không cần đối chiếu nguồn riêng — cùng cách xử lý với `lucXung.ts` đã có). Cùng 4 nhóm này
 * đã dùng làm `nhomTuoi` trong `tamTai.ts` — tách thành module riêng ở đây vì Tam Hợp là khái
 * niệm độc lập (quan hệ hòa hợp giữa 2 Chi bất kỳ), không gắn với hạn Tam Tai.
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const TAM_HOP_NHOM: readonly (readonly [Chi, Chi, Chi])[] = [
  ["Thân", "Tý", "Thìn"],
  ["Dần", "Ngọ", "Tuất"],
  ["Tỵ", "Dậu", "Sửu"],
  ["Hợi", "Mão", "Mùi"],
];

/** 2 Chi khác nhau có cùng thuộc 1 cục Tam Hợp hay không. */
export function isTamHop(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return TAM_HOP_NHOM.some((nhom) => (nhom as readonly Chi[]).includes(chiA) && (nhom as readonly Chi[]).includes(chiB));
}
