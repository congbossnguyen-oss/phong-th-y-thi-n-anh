// PHASE 32 (docs/TUVI_PHASE32_BAC_SI.md) — FUTURE MODULE, KHÔNG thuộc Natal Core (đã LOCKED ở Phase 31,
// xem docs/TUVI_NATAL_CORE_LOCK.md mục VI). File này CHỈ ĐỌC TuViChart (PUBLIC CHART MODEL), không
// import rules.ts để tính lại Lộc Tồn, không mutate chart, không phụ thuộc renderer.
//
// NGUỒN (Level 1, Nam Phái, project-canonical — cùng nhóm nguồn hocvienlyso.org đã dùng cho Triệt/Tràng
// Sinh/Thái Tuế các phase trước):
// - https://hocvienlyso.org/vong-loc-ton.html (nguyên văn, đọc trực tiếp HTML nguồn, KHÔNG qua tóm tắt
//   AI): "Vòng Bác Sĩ cũng có tên gọi khác vòng Lộc Tồn vì Bác Sĩ đứng cùng một cung với Lộc Tồn, gồm
//   mười hai sao mỗi sao an một cung trên lá số: Bác Sĩ, Lực Sĩ, Thanh Long, Tiểu Hao, Tướng Quân, Tấu
//   Thư, Phi Liêm, Hỉ Thần, Bệnh Phù, Đại Hao, Phục Binh, Quan Phủ." và "Vòng này an theo hai chiều thuận
//   nghịch âm dương, cũng như vòng Tràng Sinh Tử Vi Việt an theo chiều thuận đối với Dương Nam Âm Nữ và
//   nghịch đối với Âm Nam Dương Nữ." — tức CHIỀU GIỐNG HỆT `isThuanChung` (Tràng Sinh/Kình Dương-Đà La/
//   Đại Vận), không phải rule mới.
// - Cross-check KHÔNG mâu thuẫn (cùng 12 tên, cùng thứ tự, cùng "Bác Sĩ đồng cung Lộc Tồn", cùng chiều
//   theo Dương Nam/Âm Nữ ↔ Âm Nam/Dương Nữ): thanglongdaoquan.vn ("tim-hieu-ve-vong-loc-ton-trong-tu-vi").
// - Không phát hiện SOURCE_CONFLICT/SCHOOL_CONFLICT ở bất kỳ nguồn nào đã kiểm tra trong Phase 32.
//
// Điểm khởi: LẤY LẠI vị trí Lộc Tồn đã có sẵn trong `chart.cungs[].phuTinh` (LOC_TON_TABLE, đã LOCKED từ
// trước Phase 31) — KHÔNG tính lại bằng thuật toán thứ hai, đúng yêu cầu spec Phase 32 mục VII.

import type { TuViChart } from "./engine";
import { mod12 } from "./rules";

// 12 sao vòng Bác Sĩ, đúng thứ tự nguồn (offset 0 = đồng cung Lộc Tồn).
export const BAC_SI_RING: readonly string[] = [
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
  "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
];

export interface BacSiPlacement {
  chiIndex: number;
  star: string;
}

// Pure, deterministic, KHÔNG mutate `chart`. Input = PUBLIC CHART MODEL (TuViChart), đúng ranh giới
// READ_ONLY_NATAL_INPUT của Phase 31 mục VI.
export function getBacSiRing(chart: TuViChart): BacSiPlacement[] {
  const locTonPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Lộc Tồn"));
  if (!locTonPalace) {
    throw new Error("RULE_NOT_DEFINED: getBacSiRing — không tìm thấy Lộc Tồn trong chart (input không hợp lệ)");
  }
  // Chiều: tái sử dụng NGUYÊN VẸN quy tắc isThuanChung đã có (Dương Nam/Âm Nữ = thuận, Âm Nam/Dương Nữ =
  // nghịch) — suy ra trực tiếp từ `chart.amDuongNam` (field công khai sẵn có trên TuViChart), KHÔNG tạo
  // logic thuận/nghịch thứ hai, KHÔNG cần thêm field mới vào TuViChart/engine.ts.
  const isThuanChung = chart.amDuongNam === "Dương Nam" || chart.amDuongNam === "Âm Nữ";
  return BAC_SI_RING.map((star, step) => ({
    chiIndex: mod12(locTonPalace.chiIndex + (isThuanChung ? step : -step)),
    star,
  }));
}
