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
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
