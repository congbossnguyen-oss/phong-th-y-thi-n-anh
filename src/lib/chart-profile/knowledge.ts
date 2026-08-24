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
 *
 * ⚠️ MIGRATION Cloudflare Workers (24/8/2026, nhánh cloudflare-migration): Workers không có
 * filesystem lúc runtime, nên đổi từ readdirSync/readFileSync (đọc đĩa lúc chạy) sang Vite
 * `import.meta.glob` — quét + NHÚNG NỘI DUNG file .md thẳng vào bundle lúc BUILD, cùng nguyên tắc
 * `?raw` mà `src/lib/quan-su/luan-giai/kien-thuc.ts` đã dùng, chỉ khác là quét theo glob vì số
 * lượng file trong mỗi thư mục skill không cố định (không thể liệt kê tay như quan-su làm với 5
 * file biết trước).
 *
 * Hành vi giữ NGUYÊN 100% so với bản đọc đĩa cũ: cùng 2 thư mục skill, cùng cách sắp xếp (SKILL.md
 * lên đầu, còn lại theo bảng chữ cái), cùng định dạng ghép chuỗi — không cắt, không đổi thứ tự,
 * không đổi nội dung tri thức.
 */

// Glob pattern PHẢI là chuỗi tĩnh (bắt buộc của Vite, không dùng biến được) — quét lúc build, nhúng
// thẳng nội dung vào bundle. CHỈ quét đúng 2 thư mục Bát Tự (không quét cả handoff/knowledge/**),
// để không vô tình nhúng thêm 2 skill Tử Vi (~4,3MB) vào bundle này — đúng ranh giới phạm vi v1 đã
// ghi rõ ở đầu file.
const rawFiles = import.meta.glob<string>(
  "../../../handoff/knowledge/{luan-giai-bat-tu,luan-giai-bat-tu-manh-phai}/**/*.md",
  { eager: true, query: "?raw", import: "default" },
);

/** Lọc + sắp xếp các file .md thuộc 1 thư mục skill từ tập đã nhúng sẵn lúc build. */
function readSkillMarkdown(skillDir: string): { path: string; content: string }[] {
  const marker = `knowledge/${skillDir}/`;
  const out: { path: string; content: string }[] = [];
  for (const [filePath, content] of Object.entries(rawFiles)) {
    const idx = filePath.indexOf(marker);
    if (idx === -1) continue;
    out.push({ path: filePath.slice(idx + marker.length), content });
  }

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
