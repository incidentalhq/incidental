/// <reference types="vite/client" />

// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_STATUS_PAGE_DOMAIN: string
  readonly VITE_STATUS_PAGE_CNAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
