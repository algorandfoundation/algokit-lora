import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils'
import { networkConfigAtom } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import algosdk from 'algosdk'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { localnetId, NetworkConfig, NetworkConfigWithId } from '@/features/network/data/types'
import { ClientManager } from '@algorandfoundation/algokit-utils/types/client-manager'

Config.configure({
  logger: Config.getLogger(true),
})

const shouldCreateKmdClient = (config: NetworkConfig) => {
  return config.kmd && config.kmd.token && config.walletProviders.includes(PROVIDER_ID.KMD)
}

// Init the network config from local storage
const networkConfig = settingsStore.get(networkConfigAtom)
export let indexer = ClientManager.getIndexerClient(networkConfig.indexer)
export let algod = ClientManager.getAlgodClient(networkConfig.algod)
export let kmd: algosdk.Kmd | undefined = shouldCreateKmdClient(networkConfig) ? ClientManager.getKmdClient(networkConfig.kmd!) : undefined
export let algorandClient = AlgorandClient.fromClients({ algod, indexer, kmd })

export const updateClientConfig = (networkConfig: NetworkConfigWithId) => {
  indexer = ClientManager.getIndexerClient(networkConfig.indexer)
  algod = ClientManager.getAlgodClient(networkConfig.algod)
  kmd = shouldCreateKmdClient(networkConfig) ? ClientManager.getKmdClient(networkConfig.kmd!) : undefined
  algorandClient = AlgorandClient.fromClients({ algod, indexer, kmd })
  if (networkConfig.id !== localnetId) {
    algorandClient.setDefaultValidityWindow(30)
  }
}
