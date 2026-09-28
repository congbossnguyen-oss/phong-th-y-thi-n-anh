// QUÂN SƯ THIÊN ANH — bảng Ngũ Hành sinh/khắc CANONICAL cho lớp quan-su (Lục Hào).
//
// Nguồn sự thật DUY NHẤT cho quan hệ ngũ hành ở lớp quan-su. `nguHanhTac` (advisory-engine) dùng bảng
// này. KHÔNG đổi giá trị (map bất biến kinh điển). Ghi chú phạm vi (Phase 19 hardening):
//   • `luc-hao.ts` (engine gốc) giữ bản nội bộ riêng — CỐ Ý không đụng engine.
//   • `__four-god.test.ts` / `__phi-phuc.test.ts` giữ oracle ĐỘC LẬP — test phải tự tính lại để đối chứng.
//   • `bat-tu.ts` / `luan-van-khi` thuộc HỆ KHÁC (Bát Tự / vận khí, type riêng) — không gộp chéo hệ.

import type { NguHanh } from "../menh-nap-am";

/** X sinh SINH[X] (Mộc→Hỏa→Thổ→Kim→Thủy→Mộc). */
export const NGU_HANH_SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
/** X khắc KHAC[X] (Mộc→Thổ, Thổ→Thủy, Thủy→Hỏa, Hỏa→Kim, Kim→Mộc). */
export const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
