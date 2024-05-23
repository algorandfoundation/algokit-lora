import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig, networkConfigAtom } from '../../settings/data/network'
import { settingsStore } from '@/features/settings/data'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

// Init the network config from local storage
const networkConfig = settingsStore.get(networkConfigAtom)
export let indexer = getAlgoIndexerClient(networkConfig.indexer)

export let algod = getAlgoClient(networkConfig.algod)

export const setNetwork = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexer)
  algod = getAlgoClient(networkConfig.algod)
}
