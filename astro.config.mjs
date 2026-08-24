// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
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

  // host: true -> lắng nghe trên 0.0.0.0. Giữ lại vì chỉ ảnh hưởng `astro dev`/`astro preview` cục
  // bộ (Render/Docker cần cổng mở ra ngoài container) — không liên quan runtime Cloudflare Workers,
  // nơi không có khái niệm "server nghe cổng" theo kiểu Node.
  server: {
    host: true,
  },

  // MIGRATION Render -> Cloudflare (nhánh cloudflare-migration, KHÔNG ảnh hưởng bản Render đang
  // chạy trên main): thay @astrojs/node bằng @astrojs/cloudflare. Adapter v14 không còn tham số
  // `mode` (directory/advanced) như bản cũ — đơn giản hơn, dựa trên @cloudflare/vite-plugin.
  //
  // imageService: 'passthrough' — mặc định adapter tự bật "Cloudflare Images" (cần projectId của
  // tài khoản Cloudflare thật, build cục bộ báo lỗi "Configuration must contain `projectId`" vì
  // chưa đăng nhập tài khoản nào). Xác nhận toàn repo KHÔNG dùng `<Image />`/astro:assets ở đâu cả
  // (chỉ dùng thẻ <img> thường) — nên tắt hẳn xử lý ảnh của adapter không đổi hành vi gì, ảnh vẫn
  // phục vụ y hệt cũ qua Static Assets.
  adapter: cloudflare({
    imageService: 'passthrough',
    // Mặc định adapter prerender 51 trang tĩnh bằng cách giả lập workerd cục bộ (miniflare) — bị
    // lỗi "Configuration must contain `projectId`" vì máy build (kể cả CI của Cloudflare) không có
    // sẵn tài khoản Cloudflare thật gắn vào lúc build. Đổi về 'node' — Astro dùng đúng môi trường
    // Node bình thường để dựng HTML tĩnh lúc build (y hệt cách Render vẫn làm), không ảnh hưởng gì
    // đến runtime Workers thật sau khi deploy (trang tĩnh ra rồi thì chỉ còn là HTML, không chạy
    // code nữa).
    prerenderEnvironment: 'node',
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
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // pdf-lib/fontkit + 4 font base64 + logo được import từ 3 nơi độc lập (certificate/generate.ts,
          // dai-cat-loi/pdf-khung.ts dùng chung cho ho-so-tang-le-pdf.ts + nghe-nghiep-pdf.ts +
          // trach-nhat-sinh-no-pdf.ts). Rollup mặc định KHÔNG tự gộp chung 1 chunk giữa các nhánh
          // import độc lập này (đã xác nhận qua build thật: cùng nội dung font bị nhân đôi ở cả
          // "BeVietnamPro-Italic_*.mjs" lẫn "orders_*.mjs") — ép về đúng 1 chunk dùng chung, KHÔNG
          // đổi logic/kết quả PDF, chỉ đổi cách Rollup gói mã.
          manualChunks(id) {
            if (
              id.includes('/certificate/fonts/') ||
              id.includes('/certificate/generate') ||
              id.includes('/dai-cat-loi/pdf-khung') ||
              id.includes('/dai-cat-loi/assets/logo-thien-anh') ||
              id.includes('node_modules/pdf-lib') ||
              id.includes('node_modules/@pdf-lib')
            ) {
              return 'pdf-shared';
            }
          },
        },
      },
    },
  }
});