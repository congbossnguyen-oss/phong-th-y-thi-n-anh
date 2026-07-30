/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
  readonly SANITY_API_TOKEN: string;
  readonly DATABASE_URL: string;
  readonly SESSION_COOKIE_SECRET: string;
  readonly BUNNY_STREAM_LIBRARY_ID: string;
  readonly BUNNY_STREAM_API_KEY: string;
  readonly BUNNY_STREAM_CDN_HOSTNAME: string;
  readonly R2_ENDPOINT: string;
  readonly R2_ACCESS_KEY_ID: string;
  readonly R2_SECRET_ACCESS_KEY: string;
  readonly R2_BUCKET_NAME: string;
  readonly PUBLIC_R2_HLS_BASE_URL: string;
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
