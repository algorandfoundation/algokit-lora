/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISPENSER_AUTH0_DOMAIN: string
  readonly VITE_DISPENSER_AUTH0_CLIENT_ID: string
  readonly VITE_DISPENSER_AUTH0_AUDIENCE: string
  readonly VITE_TESTNET_DISPENSER_API_URL: string
  readonly VITE_TESTNET_DISPENSER_ADDRESS: string
  readonly VITE_CUSTOM_NETWORK_NAME?: string
  readonly VITE_CUSTOM_NETWORK_ID?: string
  readonly VITE_CUSTOM_NETWORK_FEE_SINK_ADDRESS?: string
  readonly VITE_CUSTOM_NETWORK_ALGOD_URL?: string
  readonly VITE_CUSTOM_NETWORK_ALGOD_TOKEN?: string
  readonly VITE_CUSTOM_NETWORK_INDEXER_URL?: string
  readonly VITE_CUSTOM_NETWORK_INDEXER_TOKEN?: string
  readonly VITE_DEFAULT_NETWORK_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
