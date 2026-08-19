// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Trên Render, biến môi trường có sẵn thật trong process.env. Khi build ở máy local, process.env
// chưa được nạp từ .env tại thời điểm astro.config.mjs chạy — nên đọc thủ công làm dự phòng
// (cùng cách các script migrate trong thư mục scripts/ đã dùng).
function loadLocalEnvFallback() {
  const envPath = fileURLToPath(new URL('./.env', import.meta.url));
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    if (!line.includes('=') || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = line.slice(i + 1).trim();
  }
}
loadLocalEnvFallback();

// Khóa học đọc động từ Sanity (prerender=false) nên @astrojs/sitemap không tự phát hiện được —
// lấy danh sách slug trực tiếp qua Content API để bổ sung thủ công vào sitemap.
// Lỗi mạng khi build không được làm gãy toàn bộ deploy, nên luôn fallback về mảng rỗng.
async function getCourseSitemapUrls() {
  try {
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET || 'production';
    if (!projectId) return [];
    const query = encodeURIComponent('*[_type == "course"]{"slug": slug.current}');
    const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
    if (!res.ok) return [];
    const { result } = await res.json();
    return (result ?? [])
      .filter((c) => c?.slug)
      .map((c) => `https://phongthuythienanh.com/khoa-hoc/${c.slug}`);
  } catch {
    return [];
  }
}

// Bài viết blog: trang chi tiết đọc động từ Sanity (prerender=false) nên @astrojs/sitemap không tự
// phát hiện — bổ sung thủ công cả bài Sanity (Content API) lẫn bài mẫu tĩnh cũ (placeholder-data).
async function getBlogSitemapUrls() {
  const urls = [];
  try {
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET || 'production';
    if (projectId) {
      const query = encodeURIComponent('*[_type == "blogPost" && defined(slug.current)]{"slug": slug.current, category}');
      const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
      if (res.ok) {
        const { result } = await res.json();
        for (const p of result ?? []) {
          if (p?.slug) urls.push(`https://phongthuythienanh.com/kien-thuc/${p.category || 'kien-thuc-ung-dung'}/${p.slug}`);
        }
      }
    }
  } catch {}
  try {
    const { posts } = await import('./src/lib/placeholder-data.ts');
    for (const p of posts ?? []) {
      if (p?.slug && p?.categorySlug) urls.push(`https://phongthuythienanh.com/kien-thuc/${p.categorySlug}/${p.slug}`);
    }
  } catch {}
  return [...new Set(urls)];
}

const courseSitemapUrls = await getCourseSitemapUrls();
const blogSitemapUrls = await getBlogSitemapUrls();

// https://astro.build/config
export default defineConfig({
  // site: bắt buộc để Astro tạo đúng canonical URL + sitemap.xml trỏ về domain thật
  // thay vì rơi về localhost trên bản production.
  site: 'https://phongthuythienanh.com',

  // host: true -> lắng nghe trên 0.0.0.0 (bắt buộc để Render/Docker/VPS scan thấy cổng mở ra ngoài,
  // thay vì chỉ mở ở localhost bên trong container).
  server: {
    host: true,
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [
    sitemap({
      // Loại các trang riêng tư/giao dịch khỏi sitemap — không cần Google index.
      filter: (page) =>
        !page.includes('/hoc-vien') &&
        !page.includes('/gio-hang') &&
        !page.includes('/don-hang') &&
        !page.includes('/thanh-toan') &&
        !page.includes('/api/'),
      // Bổ sung các trang khóa học đọc động từ Sanity (không tự phát hiện được vì prerender=false).
      customPages: courseSitemapUrls,
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});