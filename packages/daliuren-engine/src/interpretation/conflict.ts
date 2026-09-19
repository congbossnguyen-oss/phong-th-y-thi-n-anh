/**
 * Conflict — 2 Signal mâu thuẫn nhau (polarity trái dấu), chưa có nguồn cổ điển xác định
 * bên nào thắng. Theo Phase 5A mục 7 (dùng `signalA`/`signalB` — 1 CẶP, không phải mảng —
 * nếu >2 signal cùng mâu thuẫn thì tạo nhiều Conflict theo từng cặp, giữ mô hình đơn giản).
 *
 * `resolutionStatus` là literal type CHỈ CÓ 1 GIÁ TRỊ ('UNRESOLVED') — đây là ràng buộc kiến
 * trúc quan trọng nhất của toàn bộ Tầng 2 (xem
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 4): TypeScript compiler CHẶN mọi nỗ
 * lực gán giá trị khác (vd 'AI_DECIDED', 'ENGINE_WEIGHTED') — nếu tương lai tìm được 1 RULE cổ
 * điển thật sự xác định priority, phải mở rộng type này thành union CÓ TÊN RULE cụ thể
 * (vd `` `RESOLVED_BY_RULE:${string}` ``), KHÔNG BAO GIỜ thêm 1 giá trị mù mờ kiểu "đã xử lý".
 */
export type ConflictResolutionStatus = "UNRESOLVED";

export interface Conflict {
  conflictId: string;
  /** signalId thứ nhất. */
  signalA: string;
  /** signalId thứ hai. */
  signalB: string;
  reason: string;
  resolutionStatus: ConflictResolutionStatus;
  /**
   * CHỈ tồn tại về mặt type để tài liệu hoá ý định tương lai — LUÔN `undefined` ở v1.
   * Kiểu `never` chặn compiler không cho gán bất kỳ giá trị nào (kể cả rỗng) trừ `undefined`.
   */
  resolutionRule?: never;
}
