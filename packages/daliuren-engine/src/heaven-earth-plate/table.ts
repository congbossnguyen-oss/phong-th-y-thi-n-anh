/**
 * Địa Bàn (Algorithm Spec §5 mục 1): "vị trí thứ i (0=Tý…11=Hợi) mang chi thứ i" — CỐ ĐỊNH,
 * không phụ thuộc lá số nào. Tái dùng trực tiếp `Data.CHI` (@thien-anh/calendar-core, nguồn
 * thứ tự Chi DUY NHẤT của dự án — xem types/ganzhi.ts) làm giá trị, KHÔNG tự liệt kê lại 12
 * Chi bằng tay để tránh 2 nguồn sự thật cho cùng 1 thứ tự.
 */
import { Data } from "@thien-anh/calendar-core";
import type { EarthPlate } from "../types/plates.js";

export const EARTH_PLATE: EarthPlate = Data.CHI;
