import { PROVIDER_ID } from '@txnlab/use-wallet'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

type ServiceConfig = {
  server: string
  port: number
  token?: string
}

export type NetworkConfig = {
  name: string
  indexer: ServiceConfig
  algod: ServiceConfig
  kmd?: ServiceConfig
  walletProviders: PROVIDER_ID[]
}

export type NetworkConfigWithId = {
  id: string
} & NetworkConfig
