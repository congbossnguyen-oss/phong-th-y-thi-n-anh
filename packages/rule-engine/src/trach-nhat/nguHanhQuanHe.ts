/**
 * Quan hệ Tương Sinh / Tương Khắc giữa 2 Ngũ Hành bất kỳ — chu kỳ Ngũ Hành cố định:
 * Sinh: Mộc→Hỏa→Thổ→Kim→Thủy→Mộc. Khắc: Mộc→Thổ→Thủy→Hỏa→Kim→Mộc.
 *
 * Đây là kiến thức nền tảng cố định của Ngũ Hành học (không có dị bản giữa các trường phái,
 * không cần đối chiếu nguồn riêng — cùng cách xử lý với `lucXung.ts` đã có).
 */
import type { Data } from "@thien-anh/calendar-core";

type NguHanh = Data.NguHanh;

const NGU_HANH_SINH: Record<NguHanh, NguHanh> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};

const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

export type NguHanhQuanHe = "tuong-hoa" | "a-sinh-b" | "b-sinh-a" | "a-khac-b" | "b-khac-a";

/** Quan hệ Ngũ Hành giữa `a` và `b` (thứ tự tham số quyết định chiều "a" hay "b" trong kết quả). */
export function getNguHanhQuanHe(a: NguHanh, b: NguHanh): NguHanhQuanHe {
  if (a === b) return "tuong-hoa";
  if (NGU_HANH_SINH[a] === b) return "a-sinh-b";
  if (NGU_HANH_SINH[b] === a) return "b-sinh-a";
  if (NGU_HANH_KHAC[a] === b) return "a-khac-b";
  if (NGU_HANH_KHAC[b] === a) return "b-khac-a";
  /* c8 ignore next -- mọi cặp trong 5 Ngũ Hành đều rơi vào 1 trong 5 nhánh trên. */
  throw new Error(`Không xác định được quan hệ Ngũ Hành giữa ${a} và ${b}`);
}
