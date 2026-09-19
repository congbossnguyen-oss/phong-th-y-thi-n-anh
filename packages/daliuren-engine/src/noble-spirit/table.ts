/**
 * Bảng Quý Nhân "truyền thống" (9-nhóm, khớp khẩu quyết cổ) — gốc từ
 * docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §4. Bảng NÀY bao gồm 2 trục bằng chứng KHÁC NHAU
 * trộn lẫn — CẶP CHI theo nhóm Can (confidence B, không đổi) VÀ chiều ngày/đêm cho từng Can cụ
 * thể (độ tin cậy KHÔNG ĐỀU giữa các dòng — xem `noble-spirit/provenance.ts` và
 * docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md, Phase 5B-3R).
 *
 * ⚠️ CẬP NHẬT Phase 5B-3R — DÒNG GIÁP ĐÃ SỬA: đọc trực tiếp 六壬大全 卷一 「貴神」 (2 bản
 * Wikisource độc lập, xem audit doc mục 3) xác nhận rõ ràng "故晝寄丑宮，夜寄未宮" cho Giáp —
 * tức ngày=丑(Sửu), đêm=未(Mùi) — NGƯỢC với giá trị cũ kế thừa từ repo A/F (ngày=未, đêm=丑,
 * KHÔNG có nguồn cổ nào ủng hộ). Đây là 1 CORRECTION có bằng chứng trực tiếp, không phải suy
 * diễn. 9 dòng còn lại (Mậu/Canh/Ất/Kỷ/Bính/Đinh/Nhâm/Quý/Tân) GIỮ NGUYÊN giá trị cũ vì CHƯA
 * có nguồn cổ trực tiếp xác nhận thay thế nào đủ mạnh (dù có ≥2 nguồn khác — 黃帝授三子玄女經,
 * report-G — gợi ý chúng CŨNG sai theo cùng kiểu Giáp) — xem audit doc mục 6/9 để biết đầy đủ
 * lý do KHÔNG tự sửa 9 dòng này (tránh resolve bằng phỏng đoán/bình chọn).
 *
 * ⚠️ CHỈ implement mapping table 'traditional' — 'guopo-kangxi' (phái Quách Phác/Khang Hy, xác
 * nhận là 曹震圭 với công thức "陽貴以甲加丑逆行，陰貴以甲加未順行" — xem audit doc mục 5)
 * KHÔNG có giá trị Can→Chi cụ thể nào được xác minh ĐỦ TIN CẬY cho cả 10 Can trong nghiên cứu
 * — KHÔNG bịa bảng, xem `computeGuiRenPair` ném lỗi tường minh cho giá trị này.
 */
import type { Can } from "../types/ganzhi.js";
import type { Chi } from "../types/ganzhi.js";

export interface GuiRenPair {
  day: Chi;
  night: Chi;
}

/**
 * Khóa = Can NGÀY (`CalendarData.dayPillar.can`) — đúng 10 Can, bảng 'traditional' duy nhất đã
 * implement. Độ tin cậy KHÔNG ĐỒNG ĐỀU giữa các dòng — xem comment đầu file + audit doc:
 * - Giáp: CONFIDENCE B (đã sửa, có nguồn cổ trực tiếp).
 * - 9 Can còn lại: CONFIDENCE D (bị nghi ngờ bởi ≥2 nguồn khác, CHƯA có thay thế đủ mạnh).
 */
export const GUI_REN_TRADITIONAL_TABLE: Readonly<Record<Can, GuiRenPair>> = {
  // ĐÃ SỬA Phase 5B-3R — 六壬大全 卷一 xác nhận trực tiếp: "故晝寄丑宮，夜寄未宮" (Giáp).
  Giáp: { day: "Sửu", night: "Mùi" },
  // CHƯA SỬA — xem audit doc mục 6/9 (unresolved, confidence D).
  Mậu: { day: "Mùi", night: "Sửu" },
  Canh: { day: "Sửu", night: "Mùi" },
  Ất: { day: "Thân", night: "Tý" },
  Kỷ: { day: "Thân", night: "Tý" },
  Bính: { day: "Dậu", night: "Hợi" },
  Đinh: { day: "Hợi", night: "Dậu" },
  Nhâm: { day: "Mão", night: "Tỵ" },
  Quý: { day: "Tỵ", night: "Mão" },
  Tân: { day: "Dần", night: "Ngọ" },
};
