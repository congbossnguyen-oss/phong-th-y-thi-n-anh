// FUTURE MODULE — AN 12 NGUYỆT HẠN (Phase 41). Quy tắc do Công cung cấp:
//   1. Cung Mệnh = Tháng 1.
//   2. Từ cung Mệnh đi NGHỊCH theo 12 địa chi: cung kế tiếp theo chiều nghịch = Th12, rồi Th11, Th10...
//      cho tới Th2.
//   3. Input DUY NHẤT là vị trí cung Mệnh (menhChiIndex) — TUYỆT ĐỐI KHÔNG dùng tháng sinh âm lịch.
//
// CẢNH BÁO KHÔNG ĐƯỢC NHẦM: đây KHÁC hoàn toàn nhóm sao an theo THÁNG SINH (Tả Phù, Hữu Bật, Thiên Hình,
// Thiên Diêu, Thai Phụ, Phong Cáo...). Module này không đọc lunarMonth và cũng không được phép đọc.
//
// Module chỉ đọc TuViChart (model công khai của engine), không import rules.ts để tính lại Natal Core.

import type { TuViChart } from "./engine";

export interface NguyetHanPlacement {
  chiIndex: number;
  /** Nhãn hiển thị: "Th1".."Th12" */
  monthlyLabel: string;
  /** Số tháng 1-12, tách riêng để nơi khác dùng logic không phải parse lại chuỗi. */
  month: number;
}

/**
 * Số tháng hạn của một cung, theo đúng quy tắc "Mệnh = Th1, đi nghịch giảm dần Th12 → Th2".
 *
 * Đi NGHỊCH k bước từ Mệnh (k = 0..11) rơi vào cung `mod12(menh - k)` và mang nhãn `k === 0 ? 1 : 13 - k`.
 * Đảo lại theo cung: với cung `chiIndex`, k = mod12(menh - chiIndex) nên nhãn = mod12(chiIndex - menh) + 1.
 * Hai cách phát biểu cho cùng một kết quả — kiểm chứng đủ 12/12 với ví dụ Mệnh tại Sửu mà Công đưa.
 */
export function nguyetHanMonth(menhChiIndex: number, chiIndex: number): number {
  return (((chiIndex - menhChiIndex) % 12) + 12) % 12 + 1;
}

export function nguyetHanLabel(menhChiIndex: number, chiIndex: number): string {
  return `Th${nguyetHanMonth(menhChiIndex, chiIndex)}`;
}

/** Trả nhãn Nguyệt Hạn cho cả 12 cung, sắp theo chiIndex tăng dần. */
export function getNguyetHan(chart: TuViChart): NguyetHanPlacement[] {
  const menh = chart.menhChiIndex;
  return Array.from({ length: 12 }, (_, chiIndex) => {
    const month = nguyetHanMonth(menh, chiIndex);
    return { chiIndex, month, monthlyLabel: `Th${month}` };
  });
}
