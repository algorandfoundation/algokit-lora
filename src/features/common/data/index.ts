import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig } from './network'
import { createStore } from 'jotai'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

export let indexer = getAlgoIndexerClient({
  server: 'https://mainnet-idx.algonode.cloud/',
  port: 443,
})

export let algod = getAlgoClient({
  server: 'https://mainnet-api.algonode.cloud/',
  port: 443,
})

export const setNetwork = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexerConfig)
  algod = getAlgoClient(networkConfig.algodConfig)
}

export const globalStore = createStore()
