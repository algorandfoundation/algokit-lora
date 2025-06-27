/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISPENSER_AUTH0_DOMAIN: string
  readonly VITE_DISPENSER_AUTH0_CLIENT_ID: string
  readonly VITE_DISPENSER_AUTH0_AUDIENCE: string
  readonly VITE_TESTNET_DISPENSER_API_URL: string
  readonly VITE_TESTNET_DISPENSER_ADDRESS: string
  // Version-related environment variables
  readonly VITE_APP_VERSION: string
  readonly VITE_BUILD_DATE: string
  readonly VITE_COMMIT_HASH: string
  readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
