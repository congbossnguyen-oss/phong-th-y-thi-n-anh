/**
 * Lỗi tường minh cho Nine Methods (九宗門) — không silent fallback, không đoán công thức còn
 * thiếu. Mỗi nhánh chưa đủ evidence PHẢI ném đúng 1 trong các mã dưới đây (Phase 9B/9C), KHÔNG
 * bao giờ trả về `ThreeTransmissions` giả/rỗng.
 *
 * LỊCH SỬ (Phase 9C): mã `INSUFFICIENT_EVIDENCE_FANYIN_NO_KE` đã bị XÓA — 返吟-vô-khắc nay có
 * công thức đủ evidence (驛馬, xem `yi-ma/`) nên không còn là nhánh "chưa đủ evidence" nữa.
 */
export type NineMethodsErrorCode =
  /** Can/Chi không hợp lệ khi tra Ngũ Hành/Âm Dương — dữ liệu từ nguồn khác đã hỏng. */
  | "UNKNOWN_CAN_OR_CHI"
  /**
   * 伏吟 kích hoạt (Nguyệt Tướng gia thời) nhưng công thức chọn Sơ/Trung/Mạt truyền CHƯA đủ
   * evidence để code — Phase 9B phát hiện, Phase 9B Remediation RE-CHECK trực tiếp XÁC NHẬN
   * LẠI: 2 nguồn độc lập mô tả cơ chế KHÁC NHAU (report-C: tách 4 tiểu loại theo có/không 賊克
   * trong Tứ Khóa; repo A `d1210182010/daliuren-web-engine` shipan.py `__伏呤`: dùng chuỗi quan
   * hệ 刑 — bảng 刑 chưa tồn tại trong repo, và Trung/Mạt truyền KHÔNG theo chuỗi tra Thiên Bàn
   * chuẩn mà chuỗi khác đã dùng), KHÔNG chọn đại 1 trong 2 — xem provenance.ts.
   */
  | "INSUFFICIENT_EVIDENCE_FUYIN_SELECTION"
  /**
   * Tứ Khóa hoàn toàn vô khắc trực tiếp (賊克 raise) VÀ không rơi vào 伏吟/返吟, VÀ đã thử hết
   * TOÀN BỘ 9 pháp trong phạm vi đã implement (遙克/昴星/別責/八專, Phase 9B Remediation + 9C) —
   * không pháp nào áp dụng được. Theo Algorithm Spec §7.2, cascade 9 pháp (kể cả 伏吟/返吟
   * pre-check) đã bao phủ MỌI trường hợp còn lại — nếu vẫn gặp mã này, coi là lỗi engine thật,
   * KHÔNG silently trả giá trị đoán.
   */
  | "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE";

export class NineMethodsError extends Error {
  readonly code: NineMethodsErrorCode;

  constructor(code: NineMethodsErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NineMethodsError";
    this.code = code;
  }
}
