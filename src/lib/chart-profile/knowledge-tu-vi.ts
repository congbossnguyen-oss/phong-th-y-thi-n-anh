/**
 * Nạp tri thức TỬ VI GỌN (trích lọc file) cho LLM luận mệnh cách + cát/hung cung + chủ đề Đại Hạn.
 *
 * ⚠️ KHÔNG nạp cả 2 skill Tử Vi (~4.3MB — xem knowledge.ts). Chỉ trích các file GIÁ TRỊ CAO, GỌN từ
 * `luan-giai-tu-vi-nam-phai` phục vụ đúng nhu cầu module nghề: tính lý 14 chính tinh, phương pháp
 * luận cung vị (cát/hung), sức mạnh cung vị & cách cục, Bát Pháp, Vô Chính Diệu, Tuần Triệt, luận
 * hạn, tổng luận, quy trình. Bỏ danh mục "144 cách cục" (hàng trăm KB) — không cần cho mức chính tinh.
 *
 * Nguồn DUY NHẤT cho phần luận Tử Vi (thiếu bằng chứng → insufficient_data, KHÔNG bịa).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const NAM_PHAI_ROOT = join(process.cwd(), "handoff", "knowledge", "luan-giai-tu-vi-nam-phai");

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
    try {
      const content = readFileSync(join(NAM_PHAI_ROOT, rel), "utf-8");
      parts.push(`\n\n===== [luan-giai-tu-vi-nam-phai/${rel}] =====\n` + content);
      totalBytes += Buffer.byteLength(content, "utf-8");
      okFiles.push(rel);
    } catch {
      // File thiếu thì bỏ qua — không làm sập luận (các file khác vẫn đủ nền).
    }
  }
  cached = { files: okFiles, totalBytes, text: parts.join("") };
  return cached;
}
