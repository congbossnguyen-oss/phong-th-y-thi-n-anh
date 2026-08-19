/**
 * Nạp tri thức từ `handoff/knowledge/*` — nguồn DUY NHẤT cho phần luận giải của LLM (handoff
 * README: "LLM chỉ dùng tri thức trong handoff/knowledge; thiếu -> insufficient_data, không bịa").
 *
 * ⚠️ PHẠM VI v1: CHỈ nạp 2 skill Bát Tự (`luan-giai-bat-tu`, `luan-giai-bat-tu-manh-phai`) —
 * đúng theo hướng "làm nhẹ hơn" mà chính handoff/README-GIAO-CLAUDE-CODE.md mục E đề xuất.
 *
 * Lý do kỹ thuật (phát hiện khi đo dung lượng thật, không phải suy đoán): 2 skill Tử Vi
 * (`luan-giai-tu-vi-nam-phai` ~3MB, `luan-giai-tu-vi-tam-hop-phai` ~1.3MB) nặng gấp ~17 lần 2
 * skill Bát Tự (~252KB gộp) — nhồi thẳng cả 2 vào một prompt một lượt sẽ vừa cực tốn phí mỗi lần
 * gọi vừa có nguy cơ vượt giới hạn ngữ cảnh hợp lý. Việc bật `tu_vi_profile` cần một chiến lược
 * nạp tri thức khác (chọn lọc theo cách cục thay vì nhồi hết) — để dành cho phase sau, KHÔNG tự ý
 * làm nửa vời ở v1.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const HANDOFF_ROOT = join(process.cwd(), "handoff", "knowledge");

/** Đọc đệ quy toàn bộ .md trong 1 thư mục skill, SKILL.md trước rồi tới references/ (theo tên). */
function readSkillMarkdown(skillDir: string): { path: string; content: string }[] {
  const root = join(HANDOFF_ROOT, skillDir);
  const out: { path: string; content: string }[] = [];

  function walk(dir: string, relBase: string): void {
    const entries = readdirSync(dir).sort();
    for (const name of entries) {
      const full = join(dir, name);
      const rel = relBase ? `${relBase}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, rel);
      } else if (name.endsWith(".md")) {
        out.push({ path: rel, content: readFileSync(full, "utf-8") });
      }
    }
  }
  walk(root, "");

  // SKILL.md luôn đứng đầu (là bảng chỉ dẫn quy trình — Claude cần đọc trước khi vào references/).
  out.sort((a, b) => (a.path === "SKILL.md" ? -1 : b.path === "SKILL.md" ? 1 : a.path.localeCompare(b.path)));
  return out;
}

export interface KnowledgeBundle {
  skills: string[];
  totalBytes: number;
  /** Toàn bộ nội dung đã ghép, kèm tiêu đề nguồn từng file — dán thẳng vào system prompt. */
  text: string;
}

const BAT_TU_SKILLS = ["luan-giai-bat-tu", "luan-giai-bat-tu-manh-phai"] as const;

let cachedBatTuKnowledge: KnowledgeBundle | null = null;

/**
 * Nạp + ghép tri thức Bát Tự (2 skill). Cache trong bộ nhớ tiến trình — nội dung tri thức không
 * đổi giữa các request, đọc lại ổ đĩa mỗi lần là lãng phí.
 */
export function loadBatTuKnowledge(): KnowledgeBundle {
  if (cachedBatTuKnowledge) return cachedBatTuKnowledge;

  const parts: string[] = [];
  let totalBytes = 0;
  for (const skill of BAT_TU_SKILLS) {
    const files = readSkillMarkdown(skill);
    for (const f of files) {
      const header = `\n\n===== [${skill}/${f.path}] =====\n`;
      parts.push(header + f.content);
      totalBytes += Buffer.byteLength(f.content, "utf-8");
    }
  }

  cachedBatTuKnowledge = { skills: [...BAT_TU_SKILLS], totalBytes, text: parts.join("") };
  return cachedBatTuKnowledge;
}
