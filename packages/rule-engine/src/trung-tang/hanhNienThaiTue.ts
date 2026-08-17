/**
 * TRÙNG TANG — Hành Niên Tầm Thái Tuế Áp Tuế Chủ (bổ trợ Bước 5, nguồn Chương 1 §1 + Chương 9
 * "Sổ Tay Tang Sự"). Mỗi năm (Can Chi năm mất) có đúng 6 tuổi (Can Chi lục thập hoa giáp) bị
 * Thái Tuế áp.
 *
 * CÁCH KIÊNG — nguyên văn Chương IX (đã tra lại 2026-08-17 theo yêu cầu chủ dự án):
 *   "(6 người cần tránh mặt lúc tẩm liệm và hạ huyệt) ... Những [người] có 6 tuổi này, trong lúc
 *    tẩm liệm, hạ [huyệt] nên TRÁNH RA XA HUYỆT thì đặng kiết."
 *
 * Tức đúng HAI khâu: tẩm liệm và hạ huyệt — KHÔNG mở rộng sang nhập quan hay đóng cá. Và mức
 * kiêng là tránh ra xa, mạnh hơn "đứng lánh, quay mặt đi" áp cho các nhóm tuổi khác.
 *
 * PHẠM VI — chủ dự án tra bản sách giấy và cấp nguyên văn câu mà bản OCR làm vỡ (2026-08-17):
 *   "Hoặc 6 tuổi này trong lúc tang ma của làng xóm, bà con, trong lúc tẩm liệm, hạ táng không
 *    nên ở gần huyệt."
 *
 * Tức phạm vi KHÔNG chỉ đám tang trong nhà: sáu tuổi này đi đám tang của làng xóm, bà con cũng
 * phải tránh ở gần huyệt, vẫn đúng hai khâu tẩm liệm và hạ táng. Đây là điểm rộng hơn hẳn các
 * nhóm tuổi khác (vốn chỉ xét trong tang lễ đang tính), nên phải nói rõ cho gia đình.
 *
 * Bảng gốc trong sách (tr. 63-67) bị lỗi OCR (cột lệch) nên KHÔNG dùng — bảng dưới đây là bảng
 * tra sẵn đầy đủ 60 dòng, đã đối chiếu khớp 100% với công thức gốc ("khởi Nhất Khảm tại năm kế
 * tiếp, đếm Nhất Khảm-Nhì Khôn-Tam Ly... theo Lạc Thư, năm nào rơi Cửu Ly thì phạm, đếm tiếp
 * 5 lần nữa") và cả 2 ví dụ nguyên văn trong sách (Ất Dậu → 6 tuổi áp: Giáp Ngọ/Quý Mão/Nhâm
 * Tý/Tân Dậu/Canh Ngọ/Kỷ Mão; Quý Sửu → Nhâm Tuất/Tân Mùi/Canh Thìn/Kỷ Sửu/Mậu Tuất/Đinh Mùi).
 *
 * Tra theo Can Chi của NĂM MẤT (không phải năm sinh của vong).
 */

/** Năm (Can Chi) mất → 6 tuổi (Can Chi) bị Thái Tuế áp trong năm đó. */
export const HANH_NIEN_THAI_TUE: Readonly<Record<string, readonly string[]>> = {
  "Giáp Tý": ["Quý Dậu", "Nhâm Ngọ", "Tân Mão", "Canh Tý", "Kỷ Dậu", "Mậu Ngọ"],
  "Ất Sửu": ["Giáp Tuất", "Quý Mùi", "Nhâm Thìn", "Tân Sửu", "Canh Tuất", "Kỷ Mùi"],
  "Bính Dần": ["Ất Hợi", "Giáp Thân", "Quý Tỵ", "Nhâm Dần", "Tân Hợi", "Canh Thân"],
  "Đinh Mão": ["Bính Tý", "Ất Dậu", "Giáp Ngọ", "Quý Mão", "Nhâm Tý", "Tân Dậu"],
  "Mậu Thìn": ["Đinh Sửu", "Bính Tuất", "Ất Mùi", "Giáp Thìn", "Quý Sửu", "Nhâm Tuất"],
  "Kỷ Tỵ": ["Mậu Dần", "Đinh Hợi", "Bính Thân", "Ất Tỵ", "Giáp Dần", "Quý Hợi"],
  "Canh Ngọ": ["Kỷ Mão", "Mậu Tý", "Đinh Dậu", "Bính Ngọ", "Ất Mão", "Giáp Tý"],
  "Tân Mùi": ["Canh Thìn", "Kỷ Sửu", "Mậu Tuất", "Đinh Mùi", "Bính Thìn", "Ất Sửu"],
  "Nhâm Thân": ["Tân Tỵ", "Canh Dần", "Kỷ Hợi", "Mậu Thân", "Đinh Tỵ", "Bính Dần"],
  "Quý Dậu": ["Nhâm Ngọ", "Tân Mão", "Canh Tý", "Kỷ Dậu", "Mậu Ngọ", "Đinh Mão"],
  "Giáp Tuất": ["Quý Mùi", "Nhâm Thìn", "Tân Sửu", "Canh Tuất", "Kỷ Mùi", "Mậu Thìn"],
  "Ất Hợi": ["Giáp Thân", "Quý Tỵ", "Nhâm Dần", "Tân Hợi", "Canh Thân", "Kỷ Tỵ"],
  "Bính Tý": ["Ất Dậu", "Giáp Ngọ", "Quý Mão", "Nhâm Tý", "Tân Dậu", "Canh Ngọ"],
  "Đinh Sửu": ["Bính Tuất", "Ất Mùi", "Giáp Thìn", "Quý Sửu", "Nhâm Tuất", "Tân Mùi"],
  "Mậu Dần": ["Đinh Hợi", "Bính Thân", "Ất Tỵ", "Giáp Dần", "Quý Hợi", "Nhâm Thân"],
  "Kỷ Mão": ["Mậu Tý", "Đinh Dậu", "Bính Ngọ", "Ất Mão", "Giáp Tý", "Quý Dậu"],
  "Canh Thìn": ["Kỷ Sửu", "Mậu Tuất", "Đinh Mùi", "Bính Thìn", "Ất Sửu", "Giáp Tuất"],
  "Tân Tỵ": ["Canh Dần", "Kỷ Hợi", "Mậu Thân", "Đinh Tỵ", "Bính Dần", "Ất Hợi"],
  "Nhâm Ngọ": ["Tân Mão", "Canh Tý", "Kỷ Dậu", "Mậu Ngọ", "Đinh Mão", "Bính Tý"],
  "Quý Mùi": ["Nhâm Thìn", "Tân Sửu", "Canh Tuất", "Kỷ Mùi", "Mậu Thìn", "Đinh Sửu"],
  "Giáp Thân": ["Quý Tỵ", "Nhâm Dần", "Tân Hợi", "Canh Thân", "Kỷ Tỵ", "Mậu Dần"],
  "Ất Dậu": ["Giáp Ngọ", "Quý Mão", "Nhâm Tý", "Tân Dậu", "Canh Ngọ", "Kỷ Mão"],
  "Bính Tuất": ["Ất Mùi", "Giáp Thìn", "Quý Sửu", "Nhâm Tuất", "Tân Mùi", "Canh Thìn"],
  "Đinh Hợi": ["Bính Thân", "Ất Tỵ", "Giáp Dần", "Quý Hợi", "Nhâm Thân", "Tân Tỵ"],
  "Mậu Tý": ["Đinh Dậu", "Bính Ngọ", "Ất Mão", "Giáp Tý", "Quý Dậu", "Nhâm Ngọ"],
  "Kỷ Sửu": ["Mậu Tuất", "Đinh Mùi", "Bính Thìn", "Ất Sửu", "Giáp Tuất", "Quý Mùi"],
  "Canh Dần": ["Kỷ Hợi", "Mậu Thân", "Đinh Tỵ", "Bính Dần", "Ất Hợi", "Giáp Thân"],
  "Tân Mão": ["Canh Tý", "Kỷ Dậu", "Mậu Ngọ", "Đinh Mão", "Bính Tý", "Ất Dậu"],
  "Nhâm Thìn": ["Tân Sửu", "Canh Tuất", "Kỷ Mùi", "Mậu Thìn", "Đinh Sửu", "Bính Tuất"],
  "Quý Tỵ": ["Nhâm Dần", "Tân Hợi", "Canh Thân", "Kỷ Tỵ", "Mậu Dần", "Đinh Hợi"],
  "Giáp Ngọ": ["Quý Mão", "Nhâm Tý", "Tân Dậu", "Canh Ngọ", "Kỷ Mão", "Mậu Tý"],
  "Ất Mùi": ["Giáp Thìn", "Quý Sửu", "Nhâm Tuất", "Tân Mùi", "Canh Thìn", "Kỷ Sửu"],
  "Bính Thân": ["Ất Tỵ", "Giáp Dần", "Quý Hợi", "Nhâm Thân", "Tân Tỵ", "Canh Dần"],
  "Đinh Dậu": ["Bính Ngọ", "Ất Mão", "Giáp Tý", "Quý Dậu", "Nhâm Ngọ", "Tân Mão"],
  "Mậu Tuất": ["Đinh Mùi", "Bính Thìn", "Ất Sửu", "Giáp Tuất", "Quý Mùi", "Nhâm Thìn"],
  "Kỷ Hợi": ["Mậu Thân", "Đinh Tỵ", "Bính Dần", "Ất Hợi", "Giáp Thân", "Quý Tỵ"],
  "Canh Tý": ["Kỷ Dậu", "Mậu Ngọ", "Đinh Mão", "Bính Tý", "Ất Dậu", "Giáp Ngọ"],
  "Tân Sửu": ["Canh Tuất", "Kỷ Mùi", "Mậu Thìn", "Đinh Sửu", "Bính Tuất", "Ất Mùi"],
  "Nhâm Dần": ["Tân Hợi", "Canh Thân", "Kỷ Tỵ", "Mậu Dần", "Đinh Hợi", "Bính Thân"],
  "Quý Mão": ["Nhâm Tý", "Tân Dậu", "Canh Ngọ", "Kỷ Mão", "Mậu Tý", "Đinh Dậu"],
  "Giáp Thìn": ["Quý Sửu", "Nhâm Tuất", "Tân Mùi", "Canh Thìn", "Kỷ Sửu", "Mậu Tuất"],
  "Ất Tỵ": ["Giáp Dần", "Quý Hợi", "Nhâm Thân", "Tân Tỵ", "Canh Dần", "Kỷ Hợi"],
  "Bính Ngọ": ["Ất Mão", "Giáp Tý", "Quý Dậu", "Nhâm Ngọ", "Tân Mão", "Canh Tý"],
  "Đinh Mùi": ["Bính Thìn", "Ất Sửu", "Giáp Tuất", "Quý Mùi", "Nhâm Thìn", "Tân Sửu"],
  "Mậu Thân": ["Đinh Tỵ", "Bính Dần", "Ất Hợi", "Giáp Thân", "Quý Tỵ", "Nhâm Dần"],
  "Kỷ Dậu": ["Mậu Ngọ", "Đinh Mão", "Bính Tý", "Ất Dậu", "Giáp Ngọ", "Quý Mão"],
  "Canh Tuất": ["Kỷ Mùi", "Mậu Thìn", "Đinh Sửu", "Bính Tuất", "Ất Mùi", "Giáp Thìn"],
  "Tân Hợi": ["Canh Thân", "Kỷ Tỵ", "Mậu Dần", "Đinh Hợi", "Bính Thân", "Ất Tỵ"],
  "Nhâm Tý": ["Tân Dậu", "Canh Ngọ", "Kỷ Mão", "Mậu Tý", "Đinh Dậu", "Bính Ngọ"],
  "Quý Sửu": ["Nhâm Tuất", "Tân Mùi", "Canh Thìn", "Kỷ Sửu", "Mậu Tuất", "Đinh Mùi"],
  "Giáp Dần": ["Quý Hợi", "Nhâm Thân", "Tân Tỵ", "Canh Dần", "Kỷ Hợi", "Mậu Thân"],
  "Ất Mão": ["Giáp Tý", "Quý Dậu", "Nhâm Ngọ", "Tân Mão", "Canh Tý", "Kỷ Dậu"],
  "Bính Thìn": ["Ất Sửu", "Giáp Tuất", "Quý Mùi", "Nhâm Thìn", "Tân Sửu", "Canh Tuất"],
  "Đinh Tỵ": ["Bính Dần", "Ất Hợi", "Giáp Thân", "Quý Tỵ", "Nhâm Dần", "Tân Hợi"],
  "Mậu Ngọ": ["Đinh Mão", "Bính Tý", "Ất Dậu", "Giáp Ngọ", "Quý Mão", "Nhâm Tý"],
  "Kỷ Mùi": ["Mậu Thìn", "Đinh Sửu", "Bính Tuất", "Ất Mùi", "Giáp Thìn", "Quý Sửu"],
  "Canh Thân": ["Kỷ Tỵ", "Mậu Dần", "Đinh Hợi", "Bính Thân", "Ất Tỵ", "Giáp Dần"],
  "Tân Dậu": ["Canh Ngọ", "Kỷ Mão", "Mậu Tý", "Đinh Dậu", "Bính Ngọ", "Ất Mão"],
  "Nhâm Tuất": ["Tân Mùi", "Canh Thìn", "Kỷ Sửu", "Mậu Tuất", "Đinh Mùi", "Bính Thìn"],
  "Quý Hợi": ["Nhâm Thân", "Tân Tỵ", "Canh Dần", "Kỷ Hợi", "Mậu Thân", "Đinh Tỵ"],
};

/** Tra 6 tuổi bị Thái Tuế áp theo Can Chi năm mất, vd. `getHanhNienThaiTue("Ất", "Dậu")`. */
export function getHanhNienThaiTue(canNamMat: string, chiNamMat: string): readonly string[] {
  const key = `${canNamMat} ${chiNamMat}`;
  const ket = HANH_NIEN_THAI_TUE[key];
  if (!ket) throw new Error(`Không tìm thấy Can Chi năm: ${key}`);
  return ket;
}
