// ============================================================================
// Máy đăng bài blog lên Sanity (dùng cho tự động hóa content phong thủy).
//
// Nhiệm vụ:
//   - Đọc 1 file JSON mô tả bài viết (chuẩn SEO) theo "hợp đồng" bên dưới.
//   - Upload ảnh bìa lên Sanity làm asset.
//   - Chuyển thân bài (mảng block đơn giản) -> Portable Text của Sanity.
//   - Tạo tài liệu `blogPost`:
//       + Mặc định: bản NHÁP (drafts.*) để Thầy duyệt trong Studio.
//       + Có cờ --publish: đăng thẳng (khi đã tin tưởng, bỏ bước duyệt).
//
// Cách chạy:
//   node scripts/dang-bai-blog.mjs <duong-dan-file.json>            # tạo nháp
//   node scripts/dang-bai-blog.mjs <duong-dan-file.json> --publish  # đăng thẳng
//
// Hợp đồng JSON (các trường scheduled task sẽ sinh ra):
// {
//   "title":           "Tiêu đề hiển thị (H1)",
//   "seoTitle":        "Tiêu đề cho thẻ <title> (tùy chọn, ~60 ký tự, từ khóa đầu)",
//   "focusKeyword":    "từ khóa chính",
//   "metaDescription": "Mô tả meta ~150-160 ký tự",
//   "slug":            "duong-dan-khong-dau",
//   "category":        "nha-o | kien-thuc-ung-dung | van-phong-kinh-doanh | vat-pham",
//   "tags":            ["...", "..."],
//   "coverImage":      "đường dẫn ảnh (tương đối gốc dự án hoặc tuyệt đối); có thể bỏ trống",
//   "coverImageAlt":   "mô tả ảnh (alt) cho SEO",
//   "internalLinks":   [{ "label": "...", "href": "/..." }],
//   "faq":             [{ "question": "...", "answer": "..." }],
//   "body": [
//     { "type": "p",          "text": "Đoạn văn, hỗ trợ **in đậm** và [liên kết](/duong-dan)" },
//     { "type": "h2",         "text": "Tiêu đề mục" },
//     { "type": "h3",         "text": "Tiêu đề phụ" },
//     { "type": "ul",         "items": ["ý 1", "ý 2"] },
//     { "type": "blockquote", "text": "Trích dẫn / CTA" }
//   ]
// }
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { basename, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { taoAnhBiaSVG } from "./tao-anh-bia.mjs";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));

// ---- Nạp .env thủ công (giống astro.config.mjs / các script migrate) --------
function loadEnv() {
  const envPath = resolve(PROJECT_ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ---- Tiện ích --------------------------------------------------------------
let keySeq = 0;
const newKey = () => `k${Date.now().toString(36)}${(keySeq++).toString(36)}`;

const VALID_CATEGORIES = ["kien-thuc-ung-dung", "nha-o", "van-phong-kinh-doanh", "vat-pham"];

// Phân tích inline **đậm** và [text](href) -> spans + markDefs của Portable Text.
function parseInline(text) {
  const markDefs = [];
  const children = [];
  // Tách theo link trước, rồi tách đậm trong từng đoạn.
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  const segments = [];
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index) });
    segments.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });

  for (const seg of segments) {
    const linkMark = [];
    if (seg.href) {
      const key = newKey();
      markDefs.push({ _type: "link", _key: key, href: seg.href });
      linkMark.push(key);
    }
    // Tách **đậm** trong đoạn.
    const boldRe = /\*\*([^*]+)\*\*/g;
    let l = 0, bm;
    const pushSpan = (t, extraMarks) => {
      if (!t) return;
      children.push({ _type: "span", _key: newKey(), text: t, marks: [...linkMark, ...extraMarks] });
    };
    while ((bm = boldRe.exec(seg.text)) !== null) {
      if (bm.index > l) pushSpan(seg.text.slice(l, bm.index), []);
      pushSpan(bm[1], ["strong"]);
      l = bm.index + bm[0].length;
    }
    if (l < seg.text.length) pushSpan(seg.text.slice(l), []);
  }
  if (children.length === 0) children.push({ _type: "span", _key: newKey(), text: "", marks: [] });
  return { children, markDefs };
}

function block(style, text, extra = {}) {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: newKey(), style, markDefs, children, ...extra };
}

// Chuyển body (mảng block đơn giản) -> Portable Text.
function toPortableText(body) {
  const out = [];
  for (const b of body || []) {
    if (b.type === "p") out.push(block("normal", b.text));
    else if (b.type === "h2") out.push(block("h2", b.text));
    else if (b.type === "h3") out.push(block("h3", b.text));
    else if (b.type === "blockquote") out.push(block("blockquote", b.text));
    else if (b.type === "ul") for (const item of b.items || []) out.push(block("normal", item, { listItem: "bullet", level: 1 }));
    else if (b.type === "ol") for (const item of b.items || []) out.push(block("normal", item, { listItem: "number", level: 1 }));
    else if (typeof b.text === "string") out.push(block("normal", b.text));
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const publish = args.includes("--publish");
  const jsonPath = args.find((a) => !a.startsWith("--"));
  if (!jsonPath) {
    console.error("Thiếu đường dẫn file JSON.\n  node scripts/dang-bai-blog.mjs <file.json> [--publish]");
    process.exit(1);
  }
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error("Thiếu SANITY_PROJECT_ID hoặc SANITY_API_TOKEN trong .env");
    process.exit(1);
  }

  const art = JSON.parse(readFileSync(resolve(process.cwd(), jsonPath), "utf8"));

  // -- Kiểm tra tối thiểu --
  if (!art.title || !art.slug) throw new Error("Bài viết phải có title và slug.");
  if (art.category && !VALID_CATEGORIES.includes(art.category))
    throw new Error(`category không hợp lệ: ${art.category} (chỉ chấp nhận ${VALID_CATEGORIES.join(", ")})`);

  // -- Ảnh bìa: dùng ảnh kho nếu có, không thì TỰ TẠO ảnh bìa thương hiệu (SVG) --
  let coverImage;
  let coverSource = "không";
  const coverAlt = art.coverImageAlt || `Ảnh minh họa bài viết: ${art.title}`;
  const localImgPath = art.coverImage
    ? isAbsolute(art.coverImage)
      ? art.coverImage
      : resolve(PROJECT_ROOT, art.coverImage)
    : null;

  if (localImgPath && existsSync(localImgPath)) {
    process.stdout.write(`↑ Upload ảnh bìa từ kho: ${basename(localImgPath)} ... `);
    const asset = await client.assets.upload("image", readFileSync(localImgPath), { filename: basename(localImgPath) });
    coverImage = { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: coverAlt };
    coverSource = "kho";
    console.log("xong");
  } else {
    if (localImgPath) console.warn(`⚠ Không thấy ảnh tại ${localImgPath} — chuyển sang tự tạo.`);
    process.stdout.write("↑ Tự tạo ảnh bìa thương hiệu (SVG) ... ");
    const svg = taoAnhBiaSVG(art.title, art.category);
    const asset = await client.assets.upload("image", Buffer.from(svg, "utf8"), {
      filename: `bia-${art.slug}.svg`,
      contentType: "image/svg+xml",
    });
    coverImage = { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: coverAlt };
    coverSource = "tự tạo";
    console.log("xong");
  }

  // -- Dựng tài liệu blogPost --
  const baseId = `blogPost-${art.slug}`.replace(/[^a-zA-Z0-9._-]/g, "-");
  const _id = publish ? baseId : `drafts.${baseId}`;

  const doc = {
    _id,
    _type: "blogPost",
    title: art.title,
    slug: { _type: "slug", current: art.slug },
    category: art.category || undefined,
    excerpt: art.metaDescription || art.excerpt || undefined,
    coverImage,
    body: toPortableText(art.body),
    publishedAt: art.publishedAt || new Date().toISOString(),
    // ---- Trường SEO mở rộng (schema sẽ khai báo để Thầy sửa được trong Studio;
    //      Sanity vẫn lưu kể cả khi schema chưa có, nên đăng trước không sao) ----
    seoTitle: art.seoTitle || undefined,
    focusKeyword: art.focusKeyword || undefined,
    coverImageAlt: art.coverImageAlt || undefined,
    tags: Array.isArray(art.tags) && art.tags.length ? art.tags : undefined,
    internalLinks: Array.isArray(art.internalLinks)
      ? art.internalLinks.filter((l) => l && l.href).map((l) => ({ _type: "internalLink", _key: newKey(), label: l.label || l.href, href: l.href }))
      : undefined,
    faq: Array.isArray(art.faq)
      ? art.faq.filter((f) => f && f.question).map((f) => ({ _type: "faqItem", _key: newKey(), question: f.question, answer: f.answer || "" }))
      : undefined,
  };

  const saved = await client.createOrReplace(doc);
  const mode = publish ? "ĐÃ ĐĂNG (công khai)" : "ĐÃ TẠO NHÁP (chờ duyệt)";
  console.log(`\n✅ ${mode}`);
  console.log(`   _id:      ${saved._id}`);
  console.log(`   title:    ${saved.title}`);
  console.log(`   slug:     /kien-thuc/${saved.category || "?"}/${art.slug}`);
  console.log(`   ảnh bìa:  ${coverSource}`);
  console.log(`   Studio:   https://phong-thuy-thien-anh.sanity.studio/  → Kiến thức → Bài viết`);
  if (!publish) console.log(`   (Duyệt xong: bấm Publish trong Studio, hoặc chạy lại với --publish)`);
}

main().catch((e) => {
  console.error("\n❌ Lỗi:", e && e.message ? e.message : e);
  process.exit(1);
});
