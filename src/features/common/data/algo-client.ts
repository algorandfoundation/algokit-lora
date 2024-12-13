import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils'
import { networkConfigAtom } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import algosdk from 'algosdk'
import { WalletId } from '@txnlab/use-wallet-react'
import { localnetId, NetworkConfig, NetworkConfigWithId } from '@/features/network/data/types'
import { ClientManager } from '@algorandfoundation/algokit-utils/types/client-manager'

Config.configure({
  logger: Config.getLogger(true),
})

const shouldCreateKmdClient = (config: NetworkConfig) => {
  return config.kmd && config.kmd.token && config.walletIds.includes(WalletId.KMD)
}

// Init the network config from local storage
const networkConfig = settingsStore.get(networkConfigAtom)

export let indexer = ClientManager.getIndexerClient(networkConfig.indexer)
indexer.setIntEncoding(algosdk.IntDecoding.MIXED)

export let algod = ClientManager.getAlgodClient(networkConfig.algod)
algod.setIntEncoding(algosdk.IntDecoding.MIXED)

export let kmd: algosdk.Kmd | undefined = shouldCreateKmdClient(networkConfig) ? ClientManager.getKmdClient(networkConfig.kmd!) : undefined
kmd?.setIntEncoding(algosdk.IntDecoding.MIXED)

export let algorandClient = AlgorandClient.fromClients({ algod, indexer, kmd })

export const updateClientConfig = (networkConfig: NetworkConfigWithId) => {
  indexer = ClientManager.getIndexerClient(networkConfig.indexer)
  indexer.setIntEncoding(algosdk.IntDecoding.MIXED)

  algod = ClientManager.getAlgodClient(networkConfig.algod)
  algod.setIntEncoding(algosdk.IntDecoding.MIXED)

  kmd = shouldCreateKmdClient(networkConfig) ? ClientManager.getKmdClient(networkConfig.kmd!) : undefined
  kmd?.setIntEncoding(algosdk.IntDecoding.MIXED)

  algorandClient = AlgorandClient.fromClients({ algod, indexer, kmd })
  if (networkConfig.id !== localnetId) {
    algorandClient.setDefaultValidityWindow(30)
  }
}
