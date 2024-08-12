import { PROVIDER_ID } from '@txnlab/use-wallet'

export const localnetId = 'localnet'
export const testnetId = 'testnet'
export const mainnetId = 'mainnet'

export type ServiceConfig = {
  server: string
  port: number
  promptForToken?: boolean
  token?: string
}

export type NetworkId = typeof localnetId | typeof testnetId | typeof mainnetId | string

export type NetworkConfig = {
  name: string
  indexer: ServiceConfig
  algod: ServiceConfig
  kmd?: ServiceConfig
  walletProviders: PROVIDER_ID[]
  dispenserApiUrl?: string
}

export type NetworkConfigWithId = {
  id: NetworkId
} & NetworkConfig

export type NetworkTokens = {
  algod?: string
  indexer?: string
  kmd?: string
}
