/**
 * Thiên Đức Hợp theo tháng Âm lịch — nguồn: bảng "Ngày tốt theo tháng âm lịch" chủ dự án cung
 * cấp trực tiếp 2026-08-11 (tháng 1 đã được chủ dự án tự sửa thành Nhâm so với bản nháp ban
 * đầu). Đây là "hợp" của Thiên Đức tháng đó — hầu hết các tháng Thiên Đức Hợp là 1 Thiên Can
 * (Ngũ Hợp của Can Thiên Đức), riêng tháng 11 là 1 Địa Chi (Thân — Lục Hợp của Chi Tỵ, vì
 * tháng 11 Thiên Đức chính là Chi chứ không phải Can) — giữ nguyên hỗn hợp Can/Chi theo đúng
 * bảng gốc, không tự quy về 1 loại.
 *
 * Ngày khớp Thiên Đức Hợp của 1 tháng là ngày có Can HOẶC Chi (tuỳ tháng đó ghi Can hay Chi)
 * đúng bằng giá trị trong bảng — vì tên Can và tên Chi trong tiếng Việt không trùng nhau nên
 * chỉ cần so sánh với cả Can lẫn Chi của ngày mà không cần biết trước tháng đó thuộc loại nào.
 */
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export const THIEN_DUC_HOP_THEO_THANG: readonly (Can | Chi)[] = [
  "Nhâm", // tháng 1
  "Kỷ", // tháng 2
  "Đinh", // tháng 3
  "Ất", // tháng 4
  "Tân", // tháng 5
  "Kỷ", // tháng 6
  "Đinh", // tháng 7
  "Ất", // tháng 8
  "Tân", // tháng 9
  "Kỷ", // tháng 10
  "Thân", // tháng 11 — Chi, không phải Can
  "Ất", // tháng 12
];

/** Ngày (Can, Chi) có phải Thiên Đức Hợp của tháng Âm lịch cho trước hay không. */
export function isThienDucHopNgay(lunarMonth: number, dayCan: Can, dayChi: Chi): boolean {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  const giaTri = THIEN_DUC_HOP_THEO_THANG[lunarMonth - 1]!;
  return giaTri === dayCan || giaTri === dayChi;
}
