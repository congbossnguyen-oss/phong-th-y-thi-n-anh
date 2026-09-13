/**
 * Serialize hoá bất kỳ giá trị nào thành JSON ỔN ĐỊNH — key của object luôn sắp xếp bảng chữ
 * cái đệ quy, `Date` luôn hoá thành chuỗi ISO 8601 tường minh (không dựa vào hành vi mặc định
 * của `JSON.stringify`/`Date.prototype.toJSON`). Dùng cho serialization NormalizedChart (golden
 * test, hashing, reproducibility) VÀ cho fingerprint BirthData — hai nơi cần đúng MỘT định
 * nghĩa "ổn định" giống hệt nhau, không viết trùng logic.
 *
 * KHÔNG phụ thuộc locale (không dùng `toLocaleString` ở bất kỳ đâu), KHÔNG phụ thuộc thứ tự
 * chèn field của object gốc.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => sortKeysDeep(item));
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const sorted: Record<string, unknown> = {};
    for (const [key, val] of entries) {
      sorted[key] = sortKeysDeep(val);
    }
    return sorted;
  }
  return value;
}
