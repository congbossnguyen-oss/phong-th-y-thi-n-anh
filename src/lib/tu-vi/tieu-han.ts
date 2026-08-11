// PHASE 35 (docs/TUVI_PHASE35_TIEU_HAN_IMPLEMENTATION.md) — FUTURE MODULE, KHÔNG thuộc Natal Core (đã
// LOCKED ở Phase 31, xem docs/TUVI_NATAL_CORE_LOCK.md mục VI). File này CHỈ ĐỌC TuViChart (PUBLIC CHART
// MODEL), không import rules.ts để tính lại Chi năm sinh/giới tính, không mutate chart, không phụ thuộc
// renderer.
//
// NGUỒN (Level 2, xác nhận ở Phase 34 — docs/TUVI_PHASE34_TIEU_HAN_SOURCE_LOCK.md, status
// TIEU_HAN_SOURCE_SUPPORTED): Bửu Đình, "Tử Vi Ứng Dụng", bài "Cách xem hạn (tử vi ứng dụng)"
// (vuihoctuvi.blogspot.com/2016/02/cach-xem-han-tu-vi-ung-dung.html). Nguyên văn:
// "● Tiểu Hạn: là thời gian 1 năm, được ghi theo vòng chu vi Địa bàn, mỗi cung ghi một tên. Nếu là Trai
// thì ghi theo chiều Thuận. Gái thì ghi theo chiều Nghịch. Cách xác định gốc Tiểu Vận được tổng hợp
// trong "Bảng 3-2"..." — Bảng 3-2: Dần/Ngọ/Tuất→Thìn, Thân/Tý/Thìn→Tuất, Tỵ/Dậu/Sửu→Mùi, Hợi/Mão/Mùi→Sửu.
//
// PHÂN BIỆT QUAN TRỌNG (Phase 34 mục 6/8, Phase 35 mục II): Tiểu Hạn KHÔNG dùng `isThuanChung` (Đại Vận/
// Tràng Sinh/Kình Dương-Đà La — phụ thuộc Âm Dương năm sinh + giới tính). Cùng 1 nguồn, cùng 1 đoạn văn,
// viết Đại Hạn = "Dương Nam, Âm Nữ thì ghi theo chiều Thuận, Âm Nam, Dương Nữ thì ghi theo chiều Nghịch"
// (= isThuanChung) NHƯNG Tiểu Hạn = "Trai thì Thuận, Gái thì Nghịch" (CHỈ giới tính, không có Âm Dương).
// Đây là 2 rule khác nhau có chủ đích — file này KHÔNG import/gọi `isThuanChung`, không tạo logic
// thuận/nghịch thứ hai trùng với Đại Vận, tự viết đúng công thức riêng "Nam → thuận, Nữ → nghịch".

import type { TuViChart } from "./engine";
import { CHI } from "../menh-nap-am";
import { mod12 } from "./rules";

// Mục III spec: KHÔNG dùng phép suy diễn tam hợp để tạo mapping runtime — liệt kê tường minh cả 12 Chi.
// Giá trị là chiIndex (0=Tý...11=Hợi, theo đúng thứ tự CHI đã dùng xuyên suốt project).
export const TIEU_HAN_START_BY_YEAR_CHI: Record<string, number> = {
  "Dần": 4, "Ngọ": 4, "Tuất": 4, // → Thìn (4)
  "Thân": 10, "Tý": 10, "Thìn": 10, // → Tuất (10)
  "Tỵ": 7, "Dậu": 7, "Sửu": 7, // → Mùi (7)
  "Hợi": 1, "Mão": 1, "Mùi": 1, // → Sửu (1)
};

export interface TieuHanPlacement {
  age: number;
  chiIndex: number;
  chiName: string;
}

// Pure, deterministic, KHÔNG mutate `chart`. `age` = tuổi Tiểu Hạn (tuổi 1 = năm sinh, cung khởi từ
// TIEU_HAN_START_BY_YEAR_CHI). Input = PUBLIC CHART MODEL (TuViChart) — đọc `chart.yearChiName` (Chi năm
// sinh, Natal Core, KHÔNG tính lại) và `chart.input.gender` (KHÔNG suy ra từ Âm Dương/`amDuongNam`).
export function getTieuHanPalace(chart: TuViChart, age: number): TieuHanPlacement {
  const startChiIndex = TIEU_HAN_START_BY_YEAR_CHI[chart.yearChiName];
  if (startChiIndex === undefined) {
    throw new Error("RULE_NOT_DEFINED: getTieuHanPalace — Chi năm sinh không hợp lệ: " + chart.yearChiName);
  }
  // Mục IV/II spec: "Nam → thuận, Nữ → nghịch" — CHỈ phụ thuộc giới tính, KHÔNG dùng Âm Dương/Cục/
  // Mệnh/Thân để đảo chiều (khác isThuanChung).
  const isThuan = chart.input.gender === "Nam";
  const step = age - 1; // tuổi 1 = offset 0 tại cung khởi
  const chiIndex = mod12(startChiIndex + (isThuan ? step : -step));
  return { age, chiIndex, chiName: CHI[chiIndex] };
}

// Mục VI spec: KHÔNG tự quyết định tuổi mụ/tuổi thực nếu chưa có nguồn riêng cho Tiểu Hạn (Phase 33/34
// đều ghi nhận đây là khoảng trống — xem docs/TUVI_PHASE34_TIEU_HAN_SOURCE_LOCK.md mục 12/17). Theo đúng
// chỉ dẫn "Nếu UI hiện tại đã có convention: giữ nguyên convention đó và ghi rõ" — tái sử dụng NGUYÊN VẸN
// `chart.tuoiNamXem` (Natal Core, đã LOCKED, công thức `viewingYear - year + 1`, hiện đang hiển thị ở
// renderer cho Đại Vận). KHÔNG tính lại bằng công thức thứ hai.
// NEED_REVIEW: chưa có nguồn Tiểu Hạn nào (Bửu Đình hay nguồn khác) xác nhận trực tiếp đây là cách đếm
// tuổi ĐÚNG riêng cho Tiểu Hạn (tuổi mụ vs tuổi thực) — đây là quyết định KIẾN TRÚC (tái dùng convention
// có sẵn), KHÔNG phải bằng chứng huyền học mới, cần Phase Change Request nếu sau này tìm được nguồn nói
// khác.
export function getTuoiTieuHan(chart: TuViChart): number | null {
  return chart.tuoiNamXem;
}
