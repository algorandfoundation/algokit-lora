import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { PROVIDER_ID, clearAccounts, useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'

type ServiceConfig = {
  server: string
  port: number
  promptForToken: boolean
  token?: string
}

export type NetworkConfig = {
  id: string
  name: string
  indexer: ServiceConfig
  algod: ServiceConfig
  kmd?: ServiceConfig
  walletProviders: PROVIDER_ID[]
  isBuiltIn: boolean
}

export const mainnetConfig: NetworkConfig = {
  id: 'mainnet',
  name: 'MainNet',
  indexer: {
    server: 'https://mainnet-idx.algonode.cloud/',
    port: 443,
    promptForToken: false,
  },
  algod: {
    server: 'https://mainnet-api.algonode.cloud/',
    port: 443,
    promptForToken: false,
  },
  walletProviders: [PROVIDER_ID.DEFLY, PROVIDER_ID.DAFFI, PROVIDER_ID.PERA, PROVIDER_ID.EXODUS, PROVIDER_ID.LUTE],
  isBuiltIn: true,
}
const testnetConfig: NetworkConfig = {
  id: 'testnet',
  name: 'TestNet',
  indexer: {
    server: 'https://testnet-idx.algonode.cloud/',
    port: 443,
    promptForToken: false,
  },
  algod: {
    server: 'https://testnet-api.algonode.cloud/',
    port: 443,
    promptForToken: false,
  },
  walletProviders: mainnetConfig.walletProviders,
  isBuiltIn: true,
}
export const localnetConfig: NetworkConfig = {
  id: 'localnet',
  name: 'LocalNet',
  indexer: {
    server: 'http://localhost/',
    port: 8980,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    promptForToken: false,
  },
  algod: {
    server: 'http://localhost/',
    port: 4001,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    promptForToken: false,
  },
  kmd: {
    server: 'http://localhost/',
    port: 4002,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    promptForToken: false,
  },
  walletProviders: [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC],
  isBuiltIn: true,
}

export const networksConfigsAtom = atomWithStorage('networksConfigs', [mainnetConfig, testnetConfig, localnetConfig], undefined, {
  getOnInit: true,
})
export const useNetworksConfigs = () => {
  return useAtomValue(networksConfigsAtom, { store: settingsStore })
}
export const useSetNetworkConfig = () => {
  const setNetworksConfigs = useSetAtom(networksConfigsAtom, { store: settingsStore })

  return useCallback(
    (networkConfig: NetworkConfig) => {
      setNetworksConfigs((prev) => [...prev.map((p) => (p.id === networkConfig.id ? networkConfig : p))])
    },
    [setNetworksConfigs]
  )
}

const storedSelectedNetworkAtom = atomWithStorage('network', localnetConfig.id, undefined, { getOnInit: true })
const selectedNetworkAtom = atomWithRefresh((get) => {
  const networksConfigs = get(networksConfigsAtom)
  const networkId = window.location.pathname.split('/')[1]
  if (networksConfigs.find((c) => c.id === networkId)) {
    return networkId
  }
  return get(storedSelectedNetworkAtom)
})

export const networkConfigAtom = atom((get) => {
  const networksConfigs = get(networksConfigsAtom)
  const id = get(selectedNetworkAtom)

  if (id === localnetConfig.id) {
    mainnetConfig.walletProviders.forEach((provider) => {
      clearAccounts(provider)
    })
    clearAccounts(PROVIDER_ID.MNEMONIC)
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
  const setStorageNetwork = useSetAtom(storedSelectedNetworkAtom, { store: settingsStore })

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
      setStorageNetwork(selectedNetwork)
      // Refresh selected network atom value
      settingsStore.set(selectedNetworkAtom)
    },
    [providers, setStorageNetwork]
  )
}
