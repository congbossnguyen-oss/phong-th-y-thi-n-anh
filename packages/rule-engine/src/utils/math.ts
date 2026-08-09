/**
 * Modulo dương: luôn trả về giá trị trong [0, m), kể cả khi `n` âm. Giống hệt tiện ích cùng
 * tên ở `calendar-core/src/utils/math.ts` — tách riêng bản nhỏ ở đây để rule-engine không
 * phải phụ thuộc runtime vào calendar-core chỉ vì một hàm toán học thuần túy.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
