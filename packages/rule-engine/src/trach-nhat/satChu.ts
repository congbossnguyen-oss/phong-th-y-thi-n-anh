/**
 * Sát Chủ theo mùa — 4 giá trị Xuân/Hạ/Thu/Đông, dùng chung ranh giới mùa (theo tiết khí)
 * với Trực (`Calendar.monthBoundaryOrderIndex`).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR), mục "NGÀY SÁT CHỦ VỀ BỐN MÙA":
 * "Xuân Thân, hạ Ngọ, Thu Mùi, đông Mão." Kỵ: khai trương, động thổ, xuất hành việc lớn
 * (sách ghi chung "hao tài, hại chủ").
 *
 * ⚠️ Sách còn 1 bảng khác chi tiết hơn ("SÁT CHỦ HAI THÁNG PHẠM MỘT NGÀY", theo cặp tháng,
 * dạng thơ ẩn dụ con giáp) nhưng giải mã cho kết quả KHÔNG khớp với chính bảng 4 mùa này
 * (vd tháng 1-2 giải ra Mão nhưng bảng mùa nói Xuân là Thân) — bỏ qua bảng đó, chỉ dùng bảng
 * 4 mùa rõ ràng, không dị bản, để tránh mâu thuẫn dữ liệu.
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export type MuaName = "Xuân" | "Hạ" | "Thu" | "Đông";

export const SAT_CHU_THEO_MUA: Record<MuaName, Chi> = {
  "Xuân": "Thân",
  "Hạ": "Ngọ",
  "Thu": "Mùi",
  "Đông": "Mão",
};

/** monthOrderIndex 0-11 (0=Dần sau Lập Xuân...11=Sửu sau Tiểu Hàn) -> mùa. */
export function getMuaFromMonthOrderIndex(monthOrderIndex: number): MuaName {
  if (monthOrderIndex <= 2) return "Xuân"; // Dần, Mão, Thìn
  if (monthOrderIndex <= 5) return "Hạ"; // Tỵ, Ngọ, Mùi
  if (monthOrderIndex <= 8) return "Thu"; // Thân, Dậu, Tuất
  return "Đông"; // Hợi, Tý, Sửu
}

export function isSatChuNgay(dayChi: Chi, monthOrderIndex: number): boolean {
  return SAT_CHU_THEO_MUA[getMuaFromMonthOrderIndex(monthOrderIndex)] === dayChi;
}
