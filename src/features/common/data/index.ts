import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig, mainnetConfig } from '../../settings/data/network'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

export let indexer = getAlgoIndexerClient(mainnetConfig.indexer)

export let algod = getAlgoClient(mainnetConfig.algod)

export const setNetwork = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexer)
  algod = getAlgoClient(networkConfig.algod)
}
