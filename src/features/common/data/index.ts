import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig, mainnetConfig } from './network'
import { createStore } from 'jotai'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

export let indexer = getAlgoIndexerClient(mainnetConfig.indexerConfig)

export let algod = getAlgoClient(mainnetConfig.algodConfig)

export const setNetwork = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexerConfig)
  algod = getAlgoClient(networkConfig.algodConfig)
}

export const globalStore = createStore()
