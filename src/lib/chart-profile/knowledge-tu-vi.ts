/**
 * Nạp tri thức TỬ VI GỌN (trích lọc file) cho LLM luận mệnh cách + cát/hung cung + chủ đề Đại Hạn.
 *
 * ⚠️ KHÔNG nạp cả 2 skill Tử Vi (~4.3MB — xem knowledge.ts). Chỉ trích các file GIÁ TRỊ CAO, GỌN từ
 * `luan-giai-tu-vi-nam-phai` phục vụ đúng nhu cầu module nghề: tính lý 14 chính tinh, phương pháp
 * luận cung vị (cát/hung), sức mạnh cung vị & cách cục, Bát Pháp, Vô Chính Diệu, Tuần Triệt, luận
 * hạn, tổng luận, quy trình. Bỏ danh mục "144 cách cục" (hàng trăm KB) — không cần cho mức chính tinh.
 *
 * Nguồn DUY NHẤT cho phần luận Tử Vi (thiếu bằng chứng → insufficient_data, KHÔNG bịa).
 *
 * ⚠️ MIGRATION Cloudflare Workers (24/8/2026, nhánh cloudflare-migration): đổi từ readFileSync lúc
 * runtime sang Vite `import.meta.glob` (nhúng nội dung vào bundle lúc build — Workers không có
 * filesystem). Vẫn CHỈ nhúng đúng file trong `CURATED_FILES` (glob quét cả thư mục nam-phái để
 * Vite resolve, nhưng vòng lặp bên dưới chỉ lấy đúng những file có tên trong danh sách, đúng thứ
 * tự, giữ nguyên hành vi "trích lọc gọn" — không nhúng nhầm phần "144 cách cục" nặng hàng trăm KB
 * mà comment ở trên đã nói rõ là cố tình bỏ).
 */

// Glob pattern phải là chuỗi tĩnh (bắt buộc của Vite). Quét cả thư mục nam-phái để Vite biết file
// nào tồn tại; việc CHỌN đúng 11 file nào và ĐÚNG THỨ TỰ nào vẫn do vòng lặp CURATED_FILES quyết
// định bên dưới, y hệt logic cũ.
const rawFiles = import.meta.glob<string>(
  "../../../handoff/knowledge/luan-giai-tu-vi-nam-phai/**/*.md",
  { eager: true, query: "?raw", import: "default" },
);
function timNoiDung(rel: string): string | null {
  const marker = `luan-giai-tu-vi-nam-phai/${rel}`;
  for (const [filePath, content] of Object.entries(rawFiles)) {
    if (filePath.endsWith(marker)) return content;
  }
  return null;
}

// Trích lọc — đường dẫn tương đối trong skill nam-phái. Thứ tự = thứ tự nạp vào prompt.
const CURATED_FILES = [
  "SKILL.md",
  "references/quy-trinh-luan-chi-tiet.md",
  "references/phuong-phap-luan-cung-vi.md",
  "references/suc-manh-cung-vi-va-cach-cuc.md",
  "references/bat-phap-va-phoi-hop-tinh-ly.md",
  "references/chinh-tinh-tinh-ly.md",
  "references/vo-chinh-dieu.md",
  "references/tuan-triet.md",
  "references/luan-han.md",
  "references/tong-luan.md",
  "references/ky-thuat-doan-doc-dao.md",
] as const;

export interface KnowledgeBundle {
  files: string[];
  totalBytes: number;
  text: string;
}

let cached: KnowledgeBundle | null = null;

export function loadTuViKnowledge(): KnowledgeBundle {
  if (cached) return cached;
  const parts: string[] = [];
  const okFiles: string[] = [];
  let totalBytes = 0;
  for (const rel of CURATED_FILES) {
    const content = timNoiDung(rel);
    if (content === null) continue; // File thiếu thì bỏ qua — không làm sập luận (các file khác vẫn đủ nền).
    parts.push(`\n\n===== [luan-giai-tu-vi-nam-phai/${rel}] =====\n` + content);
    totalBytes += Buffer.byteLength(content, "utf-8");
    okFiles.push(rel);
  }
  cached = { files: okFiles, totalBytes, text: parts.join("") };
  return cached;
}
