import { PROVIDER_ID } from '@txnlab/use-wallet'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

export type ServiceConfig = {
  server: string
  port: number
  promptForToken?: boolean
  token?: string
}

export const localnetId = 'localnet'
export const testnetId = 'testnet'
export const mainnetId = 'mainnet'

export type NetworkId = typeof localnetId | typeof testnetId | typeof mainnetId | string

export type NetworkConfig = {
  name: string
  indexer: ServiceConfig
  algod: ServiceConfig
  kmd?: ServiceConfig
  walletProviders: PROVIDER_ID[]
}

export type NetworkConfigWithId = {
  id: NetworkId
} & NetworkConfig

export type NetworkTokens = {
  algod?: string
  indexer?: string
  kmd?: string
}
