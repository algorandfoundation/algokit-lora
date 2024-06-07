import { Config, getAlgoClient, getAlgoIndexerClient, getAlgoKmdClient } from '@algorandfoundation/algokit-utils'
import { NetworkConfig, networkConfigAtom } from '../../settings/data/network'
import { settingsStore } from '@/features/settings/data'
import algosdk from 'algosdk'

Config.configure({
  logger: Config.getLogger(true),
})

// Init the network config from local storage
const networkConfig = settingsStore.get(networkConfigAtom)
export let indexer = getAlgoIndexerClient(networkConfig.indexer)
export let algod = getAlgoClient(networkConfig.algod)
export let kmd: algosdk.Kmd | undefined = networkConfig.kmd ? getAlgoKmdClient(networkConfig.kmd) : undefined

export const updateClientConfig = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexer)
  algod = getAlgoClient(networkConfig.algod)
  kmd = networkConfig.id === 'localnet' ? getAlgoKmdClient(networkConfig.kmd) : undefined
}
