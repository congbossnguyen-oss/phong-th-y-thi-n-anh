/**
 * Nhị Thập Bát Tú (28 Sao).
 *
 * Dữ liệu tên + phân loại cát/hung: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR, chủ dự án
 * cung cấp 2026-08-05), mục "PHÙ ĐOÁN THẬP BÁT TÚ 28 SAO... CHẤP BÁT TINH LÂM NHẬT" (tr.69-78).
 *
 * Công thức gán ngày → sao: sách KHÔNG có mục nào nêu thuật toán này (khác 12 Trực, xem
 * truc.ts). Thay vì suy đoán, đã GIẢI BẰNG ĐỐI CHIẾU THỰC NGHIỆM (2026-08-09) với
 * hocvienlyso.org/lichvansu/ — trang tham khảo chuẩn cho toàn bộ Trạch Nhật Engine — theo
 * đúng phương pháp đã dùng để xác định offset công thức Can Chi Ngày trước đây (đối chiếu
 * mốc đã biết, không suy diễn):
 *
 * | Ngày (dương lịch) | JDN     | Sao hocvienlyso.org hiển thị | index dự đoán mod(JDN+11,28) |
 * |--------------------|---------|-------------------------------|-------------------------------|
 * | 2026-08-08          | 2461261 | Vị                             | 16 = Vị  ✓                     |
 * | 2026-08-09          | 2461262 | Mão                            | 17 = Mão ✓                     |
 * | 2026-08-15          | 2461268 | Liễu                           | 23 = Liễu ✓                    |
 *
 * Cả 3 điểm khớp tuyệt đối → công thức `index = mod(JDN + 11, 28)` (JDN theo quy ước Fliegel
 * & Van Flandern của calendar-core) được coi là đã xác nhận, không phải suy đoán. Cũng khớp
 * với quan sát trước đó rằng 28 Tú chạy theo chu kỳ Thất Diệu 7 ngày x 4 vòng không đổi,
 * không reset theo tháng/năm — giống bản chất chu kỳ 60 Can Chi Ngày.
 */

import type { CatHung } from "./catHung.js";
import { mod } from "../utils/math.js";

export interface NhiThapBatTuEntry {
  index: number; // 0-27, thứ tự cố định trong sách (không phải thứ tự theo ngày)
  name: string;
  /** Ngũ Hành + linh vật tượng trưng, nguyên văn rút gọn từ sách (vd. "Mộc giao", "Kim long"). */
  bieuTuong: string;
  catHung: CatHung;
}

/**
 * 28 sao theo đúng thứ tự liệt kê trong sách (1-28), kèm phân loại cát/hung nguyên văn.
 * index 16 (Sao Vị, thứ 17) — OCR bị mất nhãn "Tốt/Xấu" rõ ràng, chỉ còn câu "Vị tinh quý với
 * vinh hoa" (có vẻ tích cực) — ĐÁNH DẤU "cần xác nhận", KHÔNG tự suy ra "cát" dù văn cảnh gợi ý.
 */
export const NHI_THAP_BAT_TU: readonly NhiThapBatTuEntry[] = [
  { index: 0, name: "Giác", bieuTuong: "Mộc giao", catHung: "cát" },
  { index: 1, name: "Cang", bieuTuong: "Kim long", catHung: "hung" },
  { index: 2, name: "Đê", bieuTuong: "Thổ lạc", catHung: "hung" },
  { index: 3, name: "Phòng", bieuTuong: "Nhật thỏ", catHung: "cát" },
  { index: 4, name: "Tâm", bieuTuong: "Nguyệt hổ", catHung: "hung" },
  { index: 5, name: "Vĩ", bieuTuong: "Hỏa hổ", catHung: "cát" },
  { index: 6, name: "Cơ", bieuTuong: "Thủy báo", catHung: "cát" },
  { index: 7, name: "Đẩu", bieuTuong: "Mộc giải", catHung: "cát" },
  { index: 8, name: "Ngưu", bieuTuong: "Kim ngưu", catHung: "hung" },
  { index: 9, name: "Nữ", bieuTuong: "Thổ bức", catHung: "hung" },
  { index: 10, name: "Hư", bieuTuong: "Nhật thử", catHung: "hung" },
  { index: 11, name: "Nguy", bieuTuong: "Nguyệt yến", catHung: "hung" },
  { index: 12, name: "Thất", bieuTuong: "Hỏa trư", catHung: "cát" },
  { index: 13, name: "Bích", bieuTuong: "Thủy dư", catHung: "cát" },
  { index: 14, name: "Khuê", bieuTuong: "Mộc lang", catHung: "hung" },
  { index: 15, name: "Lâu", bieuTuong: "Kim cẩu", catHung: "cát" },
  // index 16 = Sao Vị — nhãn "Tốt/Xấu" bị OCR làm mất trong chính sách, nhưng đã xác nhận
  // độc lập là "cát" qua hocvienlyso.org/lichvansu/ (hiển thị "Sao Vị (Cát)" cho ngày
  // 8/8/2026, xem lịch sử đối chiếu ở docs/02-rule-engine.md mục 6) — không còn là suy đoán
  // từ văn cảnh nữa.
  { index: 16, name: "Vị", bieuTuong: "Thổ trĩ", catHung: "cát" },
  { index: 17, name: "Mão", bieuTuong: "Nhật kê", catHung: "hung" },
  { index: 18, name: "Tất", bieuTuong: "Nguyệt ô", catHung: "cát" },
  { index: 19, name: "Chủy", bieuTuong: "Hỏa hầu", catHung: "hung" },
  { index: 20, name: "Sâm", bieuTuong: "Thủy viên", catHung: "cát" },
  { index: 21, name: "Tỉnh", bieuTuong: "Mộc hãn", catHung: "cát" },
  { index: 22, name: "Quỷ", bieuTuong: "Kim dương", catHung: "hung" },
  { index: 23, name: "Liễu", bieuTuong: "Thổ chương", catHung: "hung" },
  { index: 24, name: "Tinh", bieuTuong: "Nhật mã", catHung: "hung" },
  { index: 25, name: "Trương", bieuTuong: "Nguyệt lộc", catHung: "cát" },
  { index: 26, name: "Dực", bieuTuong: "Hỏa xà", catHung: "hung" },
  { index: 27, name: "Chẩn", bieuTuong: "Thủy dẫn", catHung: "cát" },
] as const;

/**
 * Sao (1 trong 28) ứng với một Julian Day Number cho trước.
 * @param jdn JDN nguyên (quy ước Fliegel & Van Flandern — `julianDayNumber()` của calendar-core).
 */
export function getNhiThapBatTu(jdn: number): NhiThapBatTuEntry {
  const index = mod(jdn + 11, 28);
  return NHI_THAP_BAT_TU[index]!;
}

/**
 * CÒN LẠI CẦN BỔ SUNG (không chặn việc dùng công thức tính ngày ở trên):
 * Nội dung chi tiết "nên/kỵ việc gì" của từng sao — sách có nhưng văn bản thơ bị OCR xáo trộn
 * thứ tự nặng, chưa trích xuất được thành dữ liệu có cấu trúc đáng tin cậy. hocvienlyso.org
 * hiển thị nội dung này theo từng sao (xem ví dụ "Sao Vị" đã đối chiếu) — có thể dùng làm
 * nguồn đối chiếu bổ sung khi trích xuất tiếp, tương tự cách đã giải công thức tính ngày.
 */
