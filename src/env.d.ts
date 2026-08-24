/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
  readonly SANITY_API_TOKEN: string;
  readonly DATABASE_URL: string;
  readonly SESSION_COOKIE_SECRET: string;
  readonly BUNNY_STREAM_LIBRARY_ID: string;
  readonly BUNNY_STREAM_TOKEN_AUTH_KEY: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: import("./lib/auth/session").SessionUser | null;
  }
}

// Không cài @cloudflare/workers-types (tránh thêm phụ thuộc chỉ vì type) — khai báo tối thiểu
// đúng phần thực sự dùng (env.ASSETS.fetch) trong src/lib/kymon/tables.ts. Module này chỉ tồn
// tại thật lúc chạy dưới Cloudflare Workers; nhánh code đọc nó luôn được canh bởi kiểm tra
// runtime (navigator.userAgent === "Cloudflare-Workers") trước khi import.
declare module "cloudflare:workers" {
  export const env: { ASSETS: { fetch(req: Request): Promise<Response> } };
}
