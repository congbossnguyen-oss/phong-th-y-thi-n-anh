// Liệt kê các bài blog đã có trên Sanity (cả đã đăng lẫn nháp) để lịch tự động tránh trùng chủ đề.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const envPath = resolve(ROOT, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const rows = await client.fetch(
  `*[_type == "blogPost" && defined(slug.current)]{ "slug": slug.current, title, "isDraft": _id in path("drafts.**") } | order(title asc)`,
);
if (!rows.length) {
  console.log("(Chưa có bài blog nào trên Sanity)");
} else {
  console.log(`Đã có ${rows.length} bài blog trên Sanity (tránh trùng chủ đề/slug sau):`);
  for (const r of rows) console.log(`- [${r.isDraft ? "nháp" : "đăng"}] ${r.slug} — ${r.title}`);
}
