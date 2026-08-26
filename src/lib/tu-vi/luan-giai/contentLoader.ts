// Đọc nội dung tri thức Luận Giải Tử Vi (content/tu-vi-luan-giai/knowledge/) — BUNDLE LÚC BUILD qua
// `import.meta.glob`, KHÔNG đọc bằng `node:fs` lúc chạy.
//
// Y HỆT quy ước `luan-giai-toan-dien/content-loader.ts` cho Bát Tự: production là Cloudflare Worker
// (không có filesystem), `import.meta.glob` (Vite) bundle nội dung thành chuỗi ngay trong JS lúc
// build — chạy được ở cả Node lẫn Workers.
//
// ⚠️ CỐ Ý KHÔNG có `han-tu-biet.md` và `ky-thuat-doan-doc-dao.md` trong thư mục nguồn — 2 file này
// từ skill gốc chứa nội dung hạn tử biệt/ngày chết, README-CLAUDE-CODE.md của gói tài liệu cấm tuyệt
// đối trong luồng tự động. Đừng thêm lại dù có tìm thấy trong skill.
const knowledgeModules = import.meta.glob("../../../../content/tu-vi-luan-giai/knowledge/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function timModule(tenFile: string): string {
  const key = Object.keys(knowledgeModules).find((k) => k.endsWith(`/${tenFile}`));
  if (!key) {
    throw new Error(`Không tìm thấy content/tu-vi-luan-giai/knowledge/${tenFile} (đã bundle lúc build chưa?).`);
  }
  return knowledgeModules[key];
}

/** Đọc nguyên văn 1 file .md trong content/tu-vi-luan-giai/knowledge/ (không rút gọn/diễn giải). */
export function docKnowledge(tenFile: string): string {
  const key = tenFile.endsWith(".md") ? tenFile : `${tenFile}.md`;
  return timModule(key);
}

/** Ghép nhiều file, mỗi file có tiêu đề phân cách rõ ràng để AI biết ranh giới nguồn. */
export function docNhieuKnowledge(tenFiles: string[]): string {
  return tenFiles.map((f) => `\n---\n## Nguồn: ${f}\n---\n\n${docKnowledge(f)}`).join("\n");
}
