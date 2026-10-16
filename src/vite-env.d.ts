/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin in production (e.g. https://api.example.com). Empty in dev. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
