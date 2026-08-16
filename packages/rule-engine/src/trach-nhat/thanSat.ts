/**
 * Thần Sát theo tháng âm lịch (cát thần + hung sát).
 *
 * Nguồn: phần lớn từ "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR, chủ dự án cung cấp
 * 2026-08-05) — mỗi mục trích từ đúng 1 mục riêng trong sách (tên mục ghi trong `nguon`),
 * dạng bảng "tháng âm lịch → Chi ngày" rõ ràng, không bị OCR làm hỏng — khác với phần Hoàng
 * Đạo/Hắc Đạo theo giờ hay 28 Tú (xem ghi chú giới hạn ở 2 file đó). Đây KHÔNG PHẢI danh sách
 * đầy đủ mọi thần sát trong sách (sách có hàng chục mục rải rác suốt ~3000 dòng) — chỉ là tập
 * đã trích xuất và xác minh xong, mở rộng dần khi cần. Một số mục (Địa Giải, Sinh Khí, Thiên
 * Giải (nguồn khác)) do chủ dự án cung cấp trực tiếp 2026-08-11 (xem `nguon` từng mục).
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
  // ⚠️ ĐÃ GỠ KHỎI ENGINE — bảng "Nguyệt Đức" theo ĐỊA CHI (chủ dự án quyết định 2026-08-15).
  //
  //     tháng 1→Hợi, 2→Tuất, 3→Dậu, 4→Thân, 5→Mùi, 6→Ngọ,
  //     tháng 7→Tỵ,  8→Thìn, 9→Mão, 10→Dần, 11→Sửu, 12→Tý
  //     (nguồn cũ ghi là "NHỮNG NGÀY NGUYỆT ĐỨC")
  //
  // Lý do gỡ: Nguyệt Đức cổ truyền tra theo THIÊN CAN (Tam Mệnh Thông Hội; Khâm định Hiệp Kỷ
  // Biện Phương Thư) — xem `catTinhTheoCan.ts`. Bảng theo Chi ở trên chọn ra tập ngày hoàn toàn
  // khác, nên không thể là cùng một sao. Có thể nó thuộc một hệ thần sát khác, hoặc bị truyền
  // sai tên.
  //
  // Chủ dự án chỉ đạo rõ: KHÔNG tự ý đặt cho nó một tên thần sát khác chỉ vì bảng cần có tên.
  // Không tính điểm, không hiển thị, không tham gia engine. Giữ lại số liệu ở dạng chú thích
  // (không có tác dụng lúc chạy) để sau này tra ra đúng tên thì khôi phục được.
  // ⚠️ ĐÃ GỠ KHỎI ENGINE — bảng "Thiên Giải" theo sách (chủ dự án chốt 2026-08-16 lấy bảng 11/8).
  //
  //     tháng 1→Ngọ, 2→Thân, 3→Tuất, 4→Tý,  5→Dần,  6→Thìn,
  //     tháng 7→Ngọ, 8→Thân, 9→Tuất, 10→Tý, 11→Dần, 12→Thìn
  //     (nguồn cũ ghi là "NHỮNG NGÀY THIÊN GIẢI")
  //
  // Cùng cách xử lý đã áp dụng cho bảng "Nguyệt Đức" theo Địa Chi: không tính điểm, không hiển
  // thị, không tham gia engine, KHÔNG tự đặt tên thần sát khác. Giữ số liệu ở dạng chú thích
  // (không có tác dụng lúc chạy) để sau này cần đối chiếu thì có.
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
  {
    name: "Địa Giải",
    catHung: "cát",
    nguon: "Bảng ngày tốt theo tháng âm lịch — chủ dự án cung cấp trực tiếp 2026-08-11",
    chiTheoThang: ["Ngọ", "Thân", "Tuất", "Tý", "Dần", "Mão", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Mão"],
  },
  {
    name: "Sinh Khí (cầu tài)",
    catHung: "cát",
    nguon: "Bảng ngày tốt theo tháng âm lịch — chủ dự án cung cấp trực tiếp 2026-08-11",
    chiTheoThang: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"],
  },
  {
    name: "Thiên Giải",
    catHung: "cát",
    nguon: "Bảng ngày tốt theo tháng âm lịch — chủ dự án cung cấp trực tiếp 2026-08-11",
    // Chủ dự án chốt 2026-08-16: lấy bảng 11/8 làm chuẩn, bảng theo sách đã gỡ (xem chú thích ở
    // trên) nên tên "Thiên Giải" từ đây chỉ còn một nghĩa duy nhất.
    //
    // ✅ ĐÃ SỬA THÁNG 4: Dần → Sửu (chủ dự án chốt 2026-08-17 sau khi đối chiếu bảng gốc 11/8).
    //
    // Lỗi gốc: bảng cũ ghi tháng 4 = Dần, làm tháng 4 và tháng 5 TRÙNG NHAU và chi Sửu biến mất
    // khỏi cả bảng. Sau khi sửa, tháng 3→12 chạy liên tục đủ 10 chi không sót:
    //   3=Tý · 4=Sửu · 5=Dần · 6=Mão · 7=Thìn · 8=Tỵ · 9=Ngọ · 10=Mùi · 11=Thân · 12=Dậu
    //
    // Tháng 1 (Tỵ) và tháng 2 (Hợi) KHÔNG nằm trong dãy liên tục đó — giữ nguyên theo bảng gốc,
    // chủ dự án chỉ đạo rõ không được suy diễn hay đổi hai tháng này.
    // Công thức tính Thiên Giải không đổi, chỉ đổi đúng một ô dữ liệu.
    chiTheoThang: ["Tỵ", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu"],
  },
] as const;

/** Toàn bộ thần sát (cát + hung) có mặt trong một ngày cụ thể (tháng âm lịch + Chi ngày). */
export function getThanSatTrongNgay(lunarMonth: number, dayChi: Chi): ThanSatThangEntry[] {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  return THAN_SAT_THANG.filter((entry) => entry.chiTheoThang[lunarMonth - 1] === dayChi);
}
