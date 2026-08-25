// Đọc nội dung tĩnh Bát Tự (content/bat-tu/) lúc chạy thật (Node adapter trên Render).
//
// KHÁC font/logo (embed base64 trong .ts) — ở đây đọc thẳng bằng fs vì content/bat-tu/ là thư mục
// SOURCE (ngang hàng src/), không nằm trong `public/` (nơi tách rời tiến trình server trên Render).
// Đã có tiền lệ trong repo: `chart-profile/ghi-log-chi-phi.ts` đọc `handoff/config/gia-ai.json`
// bằng đúng cách này lúc chạy thật, hoạt động ổn định.
//
// Cache trong bộ nhớ theo tiến trình — nội dung không đổi giữa các lần deploy, không cần đọc lại
// mỗi request. Muốn cập nhật thì chạy lại Bước 0 (xuất nội dung từ skill) rồi deploy lại.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE_DIR = join(process.cwd(), "content", "bat-tu");

const mdCache = new Map<string, string>();
const jsonCache = new Map<string, unknown>();

/** Đọc nguyên văn 1 file .md trong content/bat-tu/knowledge/ (không rút gọn/diễn giải). */
export function docKnowledge(tenFile: string): string {
  const key = tenFile.endsWith(".md") ? tenFile : `${tenFile}.md`;
  if (mdCache.has(key)) return mdCache.get(key)!;
  const text = readFileSync(join(BASE_DIR, "knowledge", key), "utf-8");
  mdCache.set(key, text);
  return text;
}

/** Đọc nhiều file knowledge cùng lúc, ghép lại có tiêu đề phân cách (dùng khi 1 giai đoạn cần >1 tài liệu). */
export function docNhieuKnowledge(tenFiles: string[]): string {
  return tenFiles.map((f) => `--- ${f} ---\n${docKnowledge(f)}`).join("\n\n");
}

/** Đọc + parse 1 file .json trong content/bat-tu/data/. */
export function docData<T = unknown>(tenFile: string): T {
  const key = tenFile.endsWith(".json") ? tenFile : `${tenFile}.json`;
  if (jsonCache.has(key)) return jsonCache.get(key) as T;
  const text = readFileSync(join(BASE_DIR, "data", key), "utf-8");
  const data = JSON.parse(text) as T;
  jsonCache.set(key, data);
  return data;
}
