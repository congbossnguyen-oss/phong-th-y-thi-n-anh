/**
 * Hàm thuần (pure function) dựng ID xác định — CÙNG input LUÔN ra CÙNG output (Phase 5A mục 17
 * "deterministic calculation"). Tách riêng để Rule Engine (chưa xây) và test harness dùng chung
 * đúng 1 quy ước, không mỗi nơi tự ghép chuỗi 1 kiểu.
 */

/** Quy ước `${chartId}-${ruleId}-${index}`, xem docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 2. */
export function buildSignalId(chartId: string, ruleId: string, index: number): string {
  return `${chartId}-${ruleId}-${index}`;
}

/** Quy ước tất định, không phụ thuộc thứ tự truyền `signalA`/`signalB` (sắp xếp trước khi ghép). */
export function buildConflictId(signalA: string, signalB: string): string {
  const [first, second] = [signalA, signalB].sort();
  return `conflict-${first}--${second}`;
}
