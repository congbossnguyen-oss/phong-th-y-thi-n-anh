/**
 * Đọc biến môi trường cho phần thông báo — theo đúng lệ đã có ở `chart-profile/api-key.ts`.
 *
 * Vì sao không đọc thẳng `import.meta.env`: Astro/Vite thay giá trị đó vào code lúc BUILD. Biến
 * thêm trên Render SAU lần build gần nhất sẽ không thấy, dù bảng Environment đã điền đúng. Nên
 * đọc `process.env` trước (giá trị thật lúc chạy), rồi mới tới `import.meta.env` (chạy dev cục bộ).
 */
export function docBien(ten: string): string | undefined {
  const tuRuntime = typeof process !== "undefined" ? process.env?.[ten] : undefined;
  const tuBuild = (import.meta.env as Record<string, string | undefined> | undefined)?.[ten];
  const v = (tuRuntime || tuBuild || "").trim();
  return v.length > 0 ? v : undefined;
}
