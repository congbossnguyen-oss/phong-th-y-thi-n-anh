// Render Portable Text (thân bài blogPost trong Sanity) -> chuỗi HTML, dùng đúng
// các class Tailwind của site để bài từ CMS hiển thị giống hệt bài mẫu tĩnh.
// Cố ý viết gọn, không thêm dependency; hỗ trợ: đoạn văn, h2/h3/h4, trích dẫn,
// danh sách (bullet/number), và inline mark: strong, em, link.

interface Span {
  _type: string;
  text?: string;
  marks?: string[];
}
interface MarkDef {
  _key: string;
  _type: string;
  href?: string;
}
interface Block {
  _type: string;
  style?: string;
  listItem?: string;
  children?: Span[];
  markDefs?: MarkDef[];
}

const CLASS = {
  p: "mt-4 text-base leading-relaxed text-(--color-ink-700) first:mt-0",
  h2: "mt-10 font-display text-2xl font-semibold text-(--color-ink-950)",
  h3: "mt-8 font-display text-lg font-semibold text-(--color-ink-950)",
  blockquote:
    "mt-6 rounded-r-(--radius-card) border-l-4 border-(--color-gold-400)/60 bg-(--color-ivory-100) py-3 pl-5 pr-4 text-(--color-ink-700)",
  ul: "mt-4 space-y-2",
  ol: "mt-4 ml-5 list-decimal space-y-2 text-base leading-relaxed text-(--color-ink-700)",
  li: "flex items-start gap-2 text-base leading-relaxed text-(--color-ink-700)",
  dot: "mt-1.5 size-1.5 shrink-0 rounded-full bg-(--color-gold-300)",
  a: "font-medium text-(--color-gold-300) hover:underline",
};

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSpans(children: Span[] = [], markDefs: MarkDef[] = []): string {
  return children
    .map((sp) => {
      if (sp._type !== "span") return "";
      let html = esc(sp.text ?? "");
      const marks = sp.marks ?? [];
      if (marks.includes("strong")) html = `<strong>${html}</strong>`;
      if (marks.includes("em")) html = `<em>${html}</em>`;
      for (const m of marks) {
        const def = markDefs.find((d) => d._key === m);
        if (def && def._type === "link" && def.href) {
          const href = esc(def.href);
          const external = /^https?:\/\//.test(def.href) && !def.href.includes("phongthuythienanh.com");
          const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
          html = `<a class="${CLASS.a}" href="${href}"${attrs}>${html}</a>`;
        }
      }
      return html;
    })
    .join("");
}

export function portableTextToHtml(blocks: Block[] | null | undefined): string {
  if (!Array.isArray(blocks)) return "";
  const out: string[] = [];
  let listBuf: { type: string; inner: string }[] = [];
  let listType = "";

  const flush = () => {
    if (!listBuf.length) return;
    if (listType === "number") {
      out.push(`<ol class="${CLASS.ol}">${listBuf.map((i) => `<li class="pl-1">${i.inner}</li>`).join("")}</ol>`);
    } else {
      out.push(
        `<ul class="${CLASS.ul}">${listBuf
          .map((i) => `<li class="${CLASS.li}"><span class="${CLASS.dot}"></span><span>${i.inner}</span></li>`)
          .join("")}</ul>`,
      );
    }
    listBuf = [];
    listType = "";
  };

  for (const b of blocks) {
    if (!b || b._type !== "block") continue; // bỏ qua ảnh chèn giữa bài (nếu có) — xử lý sau nếu cần
    const inner = renderSpans(b.children, b.markDefs);
    if (b.listItem) {
      if (listType && listType !== b.listItem) flush();
      listType = b.listItem;
      listBuf.push({ type: b.listItem, inner });
      continue;
    }
    flush();
    const style = b.style || "normal";
    if (style === "h2") out.push(`<h2 class="${CLASS.h2}">${inner}</h2>`);
    else if (style === "h3") out.push(`<h3 class="${CLASS.h3}">${inner}</h3>`);
    else if (style === "h4") out.push(`<h4 class="${CLASS.h3}">${inner}</h4>`);
    else if (style === "blockquote") out.push(`<blockquote class="${CLASS.blockquote}">${inner}</blockquote>`);
    else out.push(`<p class="${CLASS.p}">${inner}</p>`);
  }
  flush();
  return out.join("\n");
}
