/**
 * Thần Sát theo tháng âm lịch (cát thần + hung sát).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR, chủ dự án cung cấp 2026-08-05).
 * Mỗi thần sát dưới đây được trích từ đúng 1 mục riêng trong sách (tên mục ghi trong
 * `nguon`), toàn bộ đều là dạng bảng "tháng âm lịch → Chi ngày" rõ ràng, không bị OCR làm
 * hỏng — khác với phần Hoàng Đạo/Hắc Đạo theo giờ hay 28 Tú (xem ghi chú giới hạn ở 2 file
 * đó). Đây KHÔNG PHẢI danh sách đầy đủ mọi thần sát trong sách (sách có hàng chục mục rải
 * rác suốt ~3000 dòng) — chỉ là tập đã trích xuất và xác minh xong, mở rộng dần khi cần.
 *
 * Quy ước dữ liệu: `chiTheoThang[i]` = Chi của ngày ứng với thần sát này trong tháng âm lịch
 * (i+1). Một số thần sát dùng chung 1 Chi cho cặp tháng cách nhau 6 hoặc 2 tháng — được khai
 * triển tường minh đủ 12 phần tử ở đây (không dùng công thức rút gọn) để tránh nhầm lẫn khi
 * đọc lại/đối chiếu với sách.
 */

import { Data } from "@thien-anh/calendar-core";
import type { CatHung } from "./catHung.js";

type Chi = Data.Chi;

export interface ThanSatThangEntry {
  name: string;
  catHung: CatHung;
  /** Tên mục gốc trong sách, dùng để tra lại khi cần đối chiếu. */
  nguon: string;
  /** Chi của ngày ứng với thần sát này, theo tháng âm lịch — index 0 = tháng 1 … index 11 = tháng 12. */
  chiTheoThang: readonly [Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi];
}

export const THAN_SAT_THANG: readonly ThanSatThangEntry[] = [
  {
    name: "Thiên Đức",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN ĐỨC",
    chiTheoThang: ["Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão"],
  },
  {
    name: "Nguyệt Đức",
    catHung: "cát",
    nguon: "NHỮNG NGÀY NGUYỆT ĐỨC",
    chiTheoThang: ["Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý"],
  },
  {
    name: "Thiên Giải",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN GIẢI",
    chiTheoThang: ["Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn"],
  },
  {
    name: "Thiên Hỷ",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN HỶ AN TÁNG",
    chiTheoThang: ["Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu"],
  },
  {
    name: "Thiên Quý",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN QUÝ",
    chiTheoThang: ["Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất", "Tỵ", "Hợi", "Ngọ", "Tý", "Mùi", "Sửu"],
  },
  {
    name: "Tam Hợp",
    catHung: "cát",
    nguon: "NHỮNG NGÀY TAM HỢP",
    chiTheoThang: ["Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ"],
  },
  {
    name: "Thiên Thành",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN THÀNH CƯỚI GẢ, GIAO DỊCH TỐT",
    chiTheoThang: ["Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ"],
  },
  {
    name: "Thiên Quan",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN QUAN XUẤT HÀNH GIAO DỊCH TỐT",
    chiTheoThang: ["Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân"],
  },
  {
    name: "Lộc Mã",
    catHung: "cát",
    nguon: "NHỮNG NGÀY LỘC MÃ XUẤT HÀNH, DI CHUYỂN TỐT",
    chiTheoThang: ["Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn"],
  },
  {
    name: "Phúc Sinh",
    catHung: "cát",
    nguon: "NHỮNG NGÀY PHÚC SINH ĐƯỢC PHÚC TỐT",
    chiTheoThang: ["Dậu", "Mão", "Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân"],
  },
  {
    name: "Giải Thần",
    catHung: "cát",
    nguon: "NHỮNG NGÀY GIẢI THẦN GIẢI TRỪ SAO XẤU",
    chiTheoThang: ["Thân", "Thân", "Tuất", "Tuất", "Tý", "Tý", "Dần", "Dần", "Thìn", "Thìn", "Ngọ", "Ngọ"],
  },
  {
    name: "Thiên Ân",
    catHung: "cát",
    nguon: "NHỮNG NGÀY THIÊN ÂN ĐƯỢC HƯỞNG PHÚC LÀM NHÀ, KHAI TRƯƠNG",
    // Nguyên văn: tháng 9 và tháng 11 CÙNG ghi "Thân" — không phải lỗi gõ, giữ đúng nguyên bản.
    chiTheoThang: ["Tuất", "Sửu", "Dần", "Tỵ", "Dậu", "Mão", "Tý", "Ngọ", "Thân", "Thìn", "Thân", "Mùi"],
  },
  {
    name: "Thụ Tử",
    catHung: "hung",
    nguon: "NHỮNG NGÀY THỤ TỬ",
    chiTheoThang: ["Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu"],
  },
  {
    name: "Đại Hao",
    catHung: "hung",
    nguon: "NHỮNG NGÀY ĐẠI HAO TỨ KHÍ QUAN PHÙ KỴ AN TÁNG",
    chiTheoThang: ["Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ"],
  },
  {
    name: "Tiểu Hao",
    catHung: "hung",
    nguon: "NHỮNG NGÀY TIỂU HAO KỴ XUẤT NHẬP TIỀN TÀI",
    chiTheoThang: ["Tỵ", "Ngọ", "Mùi", "Hợi", "Tý", "Sửu", "Thân", "Dậu", "Tuất", "Dần", "Mão", "Thìn"],
  },
] as const;

/** Toàn bộ thần sát (cát + hung) có mặt trong một ngày cụ thể (tháng âm lịch + Chi ngày). */
export function getThanSatTrongNgay(lunarMonth: number, dayChi: Chi): ThanSatThangEntry[] {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  return THAN_SAT_THANG.filter((entry) => entry.chiTheoThang[lunarMonth - 1] === dayChi);
}
