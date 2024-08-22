/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISPENSER_AUTH0_DOMAIN: string
  readonly VITE_DISPENSER_AUTH0_CLIENT_ID: string
  readonly VITE_DISPENSER_AUTH0_AUDIENCE: string
  readonly VITE_TESTNET_DISPENSER_API_URL: string
  readonly VITE_TESTNET_DISPENSER_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
