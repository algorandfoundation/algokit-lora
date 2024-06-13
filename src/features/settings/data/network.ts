import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { PROVIDER_ID, clearAccounts, useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'

type ServiceConfig = {
  server: string
  port: number
  token?: string
}

export type NetworkConfig = {
  id: string
  name: string
  indexer: ServiceConfig
  algod: ServiceConfig
  kmd?: ServiceConfig
  walletProviders: PROVIDER_ID[]
}

export const mainnetConfig: NetworkConfig = {
  id: 'mainnet',
  name: 'MainNet',
  indexer: {
    server: 'https://mainnet-idx.algonode.cloud/',
    port: 443,
  },
  algod: {
    server: 'https://mainnet-api.algonode.cloud/',
    port: 443,
  },
  walletProviders: [PROVIDER_ID.DEFLY, PROVIDER_ID.DAFFI, PROVIDER_ID.PERA, PROVIDER_ID.EXODUS, PROVIDER_ID.LUTE],
}
const testnetConfig: NetworkConfig = {
  id: 'testnet',
  name: 'TestNet',
  indexer: {
    server: 'https://testnet-idx.algonode.cloud/',
    port: 443,
  },
  algod: {
    server: 'https://testnet-api.algonode.cloud/',
    port: 443,
  },
  walletProviders: mainnetConfig.walletProviders,
}
export const localnetConfig: NetworkConfig = {
  id: 'localnet',
  name: 'LocalNet',
  indexer: {
    server: 'http://localhost/',
    port: 8980,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
  algod: {
    server: 'http://localhost/',
    port: 4001,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
  kmd: {
    server: 'http://localhost/',
    port: 4002,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
  walletProviders: [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC],
}

export const networksConfigs = [mainnetConfig, testnetConfig, localnetConfig]

const networkLocalStorageKey = 'network'
// TODO: find and remove logic of the query string
const storageNetworkAtom = atomWithStorage(networkLocalStorageKey, localnetConfig.id, undefined, { getOnInit: true })
const urlNetworkAtom = atom<string | undefined>(() => {
  const networkId = window.location.pathname.split('/')[1]
  if (networksConfigs.find((c) => c.id === networkId)) {
    return networkId
  }
  return undefined
})
const selectedNetworkAtom = atom((get) => get(urlNetworkAtom) || get(storageNetworkAtom))

export const networkConfigAtom = atom((get) => {
  const id = get(selectedNetworkAtom)

  if (id === localnetConfig.id) {
    mainnetConfig.walletProviders.forEach((provider) => {
      clearAccounts(provider)
    })
  } else {
    localnetConfig.walletProviders.forEach((provider) => {
      clearAccounts(provider)
    })
  }

  const config = networksConfigs.find((n) => n.id === id)

  if (!config) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${id}, fallback to ${localnetConfig.name}`)
    return localnetConfig
  }

  return config
})

export const useNetworkConfig = () => {
  return useAtomValue(networkConfigAtom, { store: settingsStore })
}

export const useSelectedNetwork = () => {
  const setSelectedNetwork = useSetSelectedNetwork()
  return [useAtomValue(selectedNetworkAtom, { store: settingsStore }), setSelectedNetwork] as const
}

export const useSetSelectedNetwork = () => {
  const { providers } = useWallet()
  const setSelectedNetwork = useSetAtom(storageNetworkAtom, { store: settingsStore })

  return useCallback(
    async (selectedNetwork: string) => {
      if (providers) {
        await Promise.all(
          providers.map(async (provider) => {
            if (provider.isConnected) {
              await provider.disconnect()
            }
          })
        )
      }
      setSelectedNetwork(selectedNetwork)
    },
    [providers, setSelectedNetwork]
  )
}
