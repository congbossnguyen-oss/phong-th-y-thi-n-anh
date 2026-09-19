/**
 * Bảng phụ trợ cho 涉害法: (a) phân nhóm 孟/仲/季 của 12 Địa Chi — kiến thức nền tảng cố định
 * (Dần/Tỵ/Thân/Hợi = 孟 đầu mỗi tam hợp cục; Tý/Mão/Ngọ/Dậu = 仲 giữa; Thìn/Tuất/Sửu/Mùi = 季
 * cuối — không có dị bản giữa các trường phái, cùng cách xử lý như Ngũ Hành/Lục Xung ở
 * `@thien-anh/rule-engine`); (b) bảng NGƯỢC của 寄宮 (Chi → (các) Can ký thác tại đó) — suy ra
 * TRỰC TIẾP từ `JI_GONG_TABLE` (four-lessons/table.ts), KHÔNG phải nguồn mới, KHÔNG lặp dữ
 * liệu tay (một số Chi có 2 Can cùng ký thác, vd Tỵ có cả Bính lẫn Mậu — sinh ra ĐÚNG từ việc
 * đảo bảng gốc, không tự liệt kê lại).
 *
 * XÁC MINH ĐỘC LẬP (Phase 9B, dò tay `d1210182010/daliuren-web-engine`, commit `d5cb9a7`,
 * `shipan.py` hàm `__涉害` dòng 596-629): dùng đúng 3 nhóm 孟/仲/季 này làm tie-break khi nhiều
 * khóa cùng "độ sâu thiệp hại" tối đa — nguồn DUY NHẤT đã xác minh trực tiếp cho quy tắc
 * tie-break cụ thể này (xem provenance.ts, confidence B, single-source cho CHI TIẾT tie-break
 * dù cấu trúc cascade tổng thể đã B theo report-C độc lập).
 */
import type { Can, Chi } from "../types/ganzhi.js";
import { JI_GONG_TABLE } from "../four-lessons/table.js";

export const MENG_CHI: ReadonlySet<Chi> = new Set<Chi>(["Dần", "Tỵ", "Thân", "Hợi"]);
export const ZHONG_CHI: ReadonlySet<Chi> = new Set<Chi>(["Tý", "Mão", "Ngọ", "Dậu"]);
export const JI_CHI: ReadonlySet<Chi> = new Set<Chi>(["Thìn", "Tuất", "Sửu", "Mùi"]);

/**
 * 5 ngày 八專 cố định (Algorithm Spec §7.2 mục 7, confidence A — "đúng 5 ngày cố định, điều
 * kiện rõ"): 甲寅/己未/丁未/庚申/癸丑. Dùng ở ĐÂY chỉ để loại trừ 遙克法 trên các ngày này
 * (`d1210182010/daliuren-web-engine` shipan.py `__遥克` dòng 635-636: `if 干支(...) in
 * self.bazhuan: raise NoSanchuan('八傳日不用遙克')`) — KHÔNG dùng để implement chính 八專法
 * (vẫn ngoài phạm vi Phase 9B/Remediation). LƯU Ý: `bazhuan` trong repo A chỉ liệt kê 4/5 cặp
 * (thiếu 癸丑) — dùng đủ 5 cặp theo Algorithm Spec (nguồn mạnh hơn, đã cross-check A+B+C+F cho
 * chính danh sách 5 ngày này) thay vì chỉ 4 cặp của riêng repo A.
 */
export const BAZHUAN_DAYS: ReadonlySet<`${Can}-${Chi}`> = new Set(["Giáp-Dần", "Kỷ-Mùi", "Đinh-Mùi", "Canh-Thân", "Quý-Sửu"]);

export function isBaZhuanDay(can: Can, chi: Chi): boolean {
  return BAZHUAN_DAYS.has(`${can}-${chi}`);
}

function buildJiGongInverse(): Partial<Record<Chi, readonly Can[]>> {
  const inverse: Partial<Record<Chi, Can[]>> = {};
  for (const [can, chi] of Object.entries(JI_GONG_TABLE) as [Can, Chi][]) {
    (inverse[chi] ??= []).push(can);
  }
  return inverse;
}

/**
 * Chi → (các) Can ký thác tại đó — bảng ngược của `JI_GONG_TABLE`. CỐ Ý `Partial` (không phải
 * `Record` đầy đủ): 1 số Chi có 2 Can (vd Tỵ: Bính+Mậu; Mùi: Đinh+Kỷ), 1 số Chi HOÀN TOÀN
 * KHÔNG có Can nào ký thác (Tý/Mão/Ngọ/Dậu không xuất hiện trong `JI_GONG_TABLE`) — tầng gọi
 * PHẢI tự xử lý `undefined` (= mảng rỗng), KHÔNG được giả định luôn có giá trị.
 */
export const JI_GONG_INVERSE: Partial<Record<Chi, readonly Can[]>> = buildJiGongInverse();
