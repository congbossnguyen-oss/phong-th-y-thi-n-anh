/**
 * Confidence — nhãn ĐỊNH TÍNH theo mức bằng chứng (xem
 * docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md mục 1). TUYỆT ĐỐI KHÔNG được quy đổi sang
 * xác suất/phần trăm ở BẤT KỲ tầng nào (Tầng 2 rule engine lẫn Tầng 3 AI) — đây là quy tắc
 * cứng nhất của toàn bộ dự án (Phase 4 mục 9 "SCORING", Phase 5A mục 15 "CẤM: scoring").
 *
 * A = nguồn cổ điển/học thuật xác định + implementation được kiểm chứng.
 * B = có nguồn cổ điển nhưng implementation cần thêm test, HOẶC ≥2 nguồn độc lập thật đồng ý.
 * C = chỉ có implementation hiện đại/1 nguồn yếu, chưa xác minh nguồn cổ điển.
 * D = chưa đủ bằng chứng ở cả 2 phía.
 */
export type Confidence = "A" | "B" | "C" | "D";

/**
 * Không có hàm `confidenceToProbability()` hay tương tự trong module này — VÀ SẼ KHÔNG BAO GIỜ
 * CÓ. Nếu tương lai có nhu cầu "so sánh độ mạnh yếu", dùng thứ tự liệt kê (A trước D) chỉ để
 * SẮP XẾP HIỂN THỊ, không dùng để tính toán/cộng dồn.
 */
export const CONFIDENCE_DISPLAY_ORDER: readonly Confidence[] = ["A", "B", "C", "D"];

/** Vị trí của 1 Confidence trong CONFIDENCE_DISPLAY_ORDER — CHỈ dùng để SO SÁNH thứ hạng (A tốt nhất → D kém nhất), KHÔNG PHẢI điểm số/xác suất. */
export function confidenceRank(confidence: Confidence): number {
  return CONFIDENCE_DISPLAY_ORDER.indexOf(confidence);
}

/**
 * Confidence "kém hơn" (rank cao hơn) trong 2 giá trị — dùng cho mọi phép "worst-of" trong dự
 * án (vd IP-6, Signal.calculationConfidence tổng hợp nhiều provenance). Đây là SO SÁNH THỨ
 * HẠNG THUẦN TUÝ (`Math.max` theo rank), KHÔNG PHẢI phép toán số học/cộng dồn — tuân thủ đúng
 * cấm scoring ở đầu file này.
 */
export function worstConfidence(a: Confidence, b: Confidence): Confidence {
  return confidenceRank(a) > confidenceRank(b) ? a : b;
}
