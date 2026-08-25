// Đọc nội dung tĩnh Bát Tự (content/bat-tu/) — BUNDLE LÚC BUILD qua `import.meta.glob`, KHÔNG đọc
// bằng `node:fs` lúc chạy.
//
// ⚠️ Lịch sử: bản đầu dùng `fs.readFileSync(join(process.cwd(), "content/bat-tu/..."))`, đúng khi
// site còn chạy Node/Render (có tiền lệ `chart-profile/ghi-log-chi-phi.ts` đọc y hệt vậy). Sau khi
// site chuyển sang Cloudflare Workers (2026-08-25, xem wrangler.jsonc) thì VỠ ngay lúc chạy thật:
// Workers không có filesystem, `nodejs_compat` polyfill KHÔNG cài `fs.readFileSync` (lỗi
// "[unenv] fs.readFileSync is not implemented yet!"). `import.meta.glob` (Vite) bundle nội dung
// thành chuỗi/JSON ngay trong file JS lúc build — chạy được ở CẢ Node lẫn Workers, không phụ thuộc
// runtime có fs hay không. Muốn cập nhật nội dung thì chạy lại Bước 0 rồi build+deploy lại (không
// đọc động được nữa — chấp nhận được vì nội dung này vốn chỉ đổi khi skill cập nhật, không phải mỗi
// request).
const knowledgeModules = import.meta.glob("../../../content/bat-tu/knowledge/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const dataModules = import.meta.glob("../../../content/bat-tu/data/*.json", {
  import: "default",
  eager: true,
}) as Record<string, unknown>;

function timModule<T>(modules: Record<string, T>, tenFile: string): T {
  const key = Object.keys(modules).find((k) => k.endsWith(`/${tenFile}`));
  if (!key) throw new Error(`Không tìm thấy content/bat-tu/.../${tenFile} (đã bundle lúc build chưa?).`);
  return modules[key];
}

/** Đọc nguyên văn 1 file .md trong content/bat-tu/knowledge/ (không rút gọn/diễn giải). */
export function docKnowledge(tenFile: string): string {
  const key = tenFile.endsWith(".md") ? tenFile : `${tenFile}.md`;
  return timModule(knowledgeModules, key);
}

/** Đọc nhiều file knowledge cùng lúc, ghép lại có tiêu đề phân cách (dùng khi 1 giai đoạn cần >1 tài liệu). */
export function docNhieuKnowledge(tenFiles: string[]): string {
  return tenFiles.map((f) => `--- ${f} ---\n${docKnowledge(f)}`).join("\n\n");
}

/** Đọc + trả về 1 file .json trong content/bat-tu/data/ (đã parse sẵn lúc build). */
export function docData<T = unknown>(tenFile: string): T {
  const key = tenFile.endsWith(".json") ? tenFile : `${tenFile}.json`;
  return timModule(dataModules, key) as T;
}
