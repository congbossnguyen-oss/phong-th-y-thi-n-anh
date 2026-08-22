/**
 * ĐỌC KHOÁ AI — một cửa duy nhất.
 *
 * Trước 22/8/2026 các file LLM đọc thẳng `import.meta.env.ANTHROPIC_API_KEY`. Astro/Vite thay giá
 * trị đó vào code lúc BUILD, nên nếu khoá được thêm trên Render SAU lần build gần nhất (hoặc chỉ
 * được cấp lúc chạy, không cấp lúc build) thì code không thấy khoá dù bảng Environment đã điền
 * đúng — biểu hiện đúng như anh Công gặp: "chưa cấu hình khoá AI trên máy chủ".
 *
 * Nay đọc `process.env` trước (giá trị thật lúc chạy trên Node adapter), rồi mới tới
 * `import.meta.env` (phục vụ chạy dev cục bộ bằng file .env).
 */
export function layAnthropicApiKey(): string | undefined {
  const tuRuntime = typeof process !== "undefined" ? process.env?.ANTHROPIC_API_KEY : undefined;
  const tuBuild = (import.meta.env as Record<string, string | undefined> | undefined)?.ANTHROPIC_API_KEY;
  const key = (tuRuntime || tuBuild || "").trim();
  return key.length > 0 ? key : undefined;
}

export const coAnthropicApiKey = (): boolean => Boolean(layAnthropicApiKey());
