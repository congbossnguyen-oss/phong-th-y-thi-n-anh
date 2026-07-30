// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // host: true -> lắng nghe trên 0.0.0.0 (bắt buộc để Render/Docker/VPS scan thấy cổng mở ra ngoài,
  // thay vì chỉ mở ở localhost bên trong container).
  server: {
    host: true,
  },

  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()]
  }
});