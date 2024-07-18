import { Config, getAlgoClient, getAlgoIndexerClient, getAlgoKmdClient } from '@algorandfoundation/algokit-utils'
import { networkConfigAtom } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import algosdk from 'algosdk'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { NetworkConfig } from '@/features/network/data/types'

Config.configure({
  logger: Config.getLogger(true),
})

const shouldCreateKmdClient = (config: NetworkConfig) => {
  return config.kmd && config.kmd.token && config.walletProviders.includes(PROVIDER_ID.KMD)
}

// Init the network config from local storage
const networkConfig = settingsStore.get(networkConfigAtom)
export let indexer = getAlgoIndexerClient(networkConfig.indexer)
export let algod = getAlgoClient(networkConfig.algod)
export let kmd: algosdk.Kmd | undefined = shouldCreateKmdClient(networkConfig) ? getAlgoKmdClient(networkConfig.kmd) : undefined

export const updateClientConfig = (networkConfig: NetworkConfig) => {
  indexer = getAlgoIndexerClient(networkConfig.indexer)
  algod = getAlgoClient(networkConfig.algod)
  kmd = shouldCreateKmdClient(networkConfig) ? getAlgoKmdClient(networkConfig.kmd) : undefined
}
