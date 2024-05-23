import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig, localnetConfig } from '../../settings/data/network'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

export let indexer = getAlgoIndexerClient(localnetConfig.indexer)

export let algod = getAlgoClient(localnetConfig.algod)

export const setNetwork = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexer)
  algod = getAlgoClient(networkConfig.algod)
}
