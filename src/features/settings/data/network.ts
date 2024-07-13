import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { clearAccounts, PROVIDER_ID, useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'
import { NetworkConfig, NetworkConfigWithId } from './types'

const localnetWalletProviders = [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC]
const nonLocalnetWalletProviders = [PROVIDER_ID.DEFLY, PROVIDER_ID.DAFFI, PROVIDER_ID.PERA, PROVIDER_ID.EXODUS, PROVIDER_ID.LUTE]

export const localnetId = 'localnet'
export const testnetId = 'testnet'
export const mainnetId = 'mainnet'

export const defaultNetworkConfigs: Record<string, NetworkConfig> = {
  [localnetId]: {
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
    walletProviders: localnetWalletProviders,
  },
  [testnetId]: {
    name: 'TestNet',
    indexer: {
      server: 'https://testnet-idx.algonode.cloud/',
      port: 443,
    },
    algod: {
      server: 'https://testnet-api.algonode.cloud/',
      port: 443,
    },
    walletProviders: nonLocalnetWalletProviders,
  },
  [mainnetId]: {
    name: 'MainNet',
    indexer: {
      server: 'https://mainnet-idx.algonode.cloud/',
      port: 443,
    },
    algod: {
      server: 'https://mainnet-api.algonode.cloud/',
      port: 443,
    },
    walletProviders: nonLocalnetWalletProviders,
  },
}

// TODO: Detect when a network has been reconfigured and reset the app state
// TODO: Prompt for token - Up to 3 (at least 2)
// TODO: Allow users to select the wallet providers as part of configuring a network. Don't allow selection of kmd or mnemonic for mainnet or testnet.
// TODO: Check uniquess of the network name. Derive the network id from the network name (e.g. Frog Pond --> frog-pond)

const customNetworkConfigsAtom = atomWithStorage<Record<string, NetworkConfig>>('network-configs', {}, undefined, {
  getOnInit: true,
})

const networkConfigsAtom = atom<Record<string, NetworkConfig>>((get) => {
  const customNetworkConfigs = get(customNetworkConfigsAtom)

  return {
    ...defaultNetworkConfigs,
    ...customNetworkConfigs,
  }
})

export const useNetworkConfigs = () => {
  return useAtomValue(networkConfigsAtom, { store: settingsStore })
}
export const useSetCustomNetworkConfig = () => {
  const setNetworksConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })

  return useCallback(
    (networkId: string, networkConfig: NetworkConfig) => {
      setNetworksConfigs((prev) => ({
        ...prev,
        [networkId]: networkConfig,
      }))
    },
    [setNetworksConfigs]
  )
}
export const useDeleteCustomNetworkConfig = () => {
  const setNetworksConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })
  return useCallback(
    (networkId: string) => {
      setNetworksConfigs((prev) => {
        delete prev[networkId]
        return prev
      })
    },
    [setNetworksConfigs]
  )
}

const storedSelectedNetworkAtom = atomWithStorage('network', localnetId, undefined, { getOnInit: true })
const selectedNetworkAtom = atomWithRefresh((get) => {
  const networkId = window.location.pathname.split('/')[1]
  const networkConfigs = get(networkConfigsAtom)

  if (networkId in networkConfigs) {
    return networkId
  }
  return get(storedSelectedNetworkAtom)
})

export const networkConfigAtom = atom<NetworkConfigWithId>((get) => {
  const id = get(selectedNetworkAtom)
  const networkConfigs = get(networkConfigsAtom)

  if (id === localnetId) {
    nonLocalnetWalletProviders.forEach((providerId) => {
      clearAccounts(providerId)
    })
    clearAccounts(PROVIDER_ID.MNEMONIC) // This clears a connected mnemonic wallet after a page reload, as the mnemonic is not stored and cannot be used to sign transactions.
  } else {
    localnetWalletProviders.forEach((providerId) => {
      clearAccounts(providerId)
    })
  }

  if (id in networkConfigs) {
    return {
      id,
      ...networkConfigs[id],
    }
  }

  // eslint-disable-next-line no-console
  console.warn(`Unknown network: ${id}, fallback to ${defaultNetworkConfigs.localnet.name}`)
  return {
    id: localnetId,
    ...defaultNetworkConfigs.localnet,
  }
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
