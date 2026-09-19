/**
 * Bảng 驛馬 (Yi Ma / Post-Horse — CHỈ phần VỊ TRÍ, không có ý nghĩa luận giải) — sao chép
 * NGUYÊN VẸN từ docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §10 (không tự đổi thứ tự/giá trị):
 * 寅午戌馬在申, 申子辰馬在寅, 巳酉丑馬在亥, 亥卯未馬在巳.
 *
 * Confidence B — 2 nguồn độc lập: (a) commit bug-fix thật `98f47f9` của repo C
 * (`banderzhm/ZhouYiLab`), (b) hàm tính LIVE (không phải dead code như ghi chú cũ suy đoán —
 * đã xác nhận lại Phase 9C bằng đọc trực tiếp) trong `d1210182010/daliuren-web-engine`
 * shipan.py `SanChuan.__返呤` dòng 767-774: duyệt Chi ngày qua tam hợp cục (+4 mỗi bước) tới
 * khi gặp chữ 孟 (đầu cục: Dần/Tỵ/Thân/Hợi) rồi lấy Lục Xung — khớp CHÍNH XÁC bảng dưới đây.
 */
import type { Chi } from "../types/ganzhi.js";

export const YI_MA_TABLE: Readonly<Record<Chi, Chi>> = {
  Dần: "Thân",
  Ngọ: "Thân",
  Tuất: "Thân",
  Thân: "Dần",
  Tý: "Dần",
  Thìn: "Dần",
  Tỵ: "Hợi",
  Dậu: "Hợi",
  Sửu: "Hợi",
  Hợi: "Tỵ",
  Mão: "Tỵ",
  Mùi: "Tỵ",
};
