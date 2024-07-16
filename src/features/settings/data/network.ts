import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { clearAccounts, PROVIDER_ID, useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'
import { localnetId, mainnetId, NetworkConfig, NetworkConfigWithId, NetworkId, NetworkTokens, testnetId } from './types'

const localnetWalletProviders = [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC]
const nonLocalnetWalletProviders = [PROVIDER_ID.DEFLY, PROVIDER_ID.DAFFI, PROVIDER_ID.PERA, PROVIDER_ID.EXODUS, PROVIDER_ID.LUTE]

export const defaultNetworkConfigs: Record<NetworkId, NetworkConfig> = {
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

// TODO: Prompt for token - Up to 3 (at least 2)
// TODO: Allow customising the localnet settings as part of viewing localnet
// TODO: Check clearing logic works for all wallet providers

const customNetworkConfigsAtom = atomWithStorage<Record<NetworkId, NetworkConfig>>('network-configs', {}, undefined, {
  getOnInit: true,
})

const networkConfigsAtom = atom<Record<NetworkId, NetworkConfig>>((get) => {
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
  const setCustomNetworksConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })

  return useCallback(
    (id: NetworkId, networkConfig: NetworkConfig) => {
      setCustomNetworksConfigs((prev) => ({
        ...prev,
        [id]: networkConfig,
      }))
    },
    [setCustomNetworksConfigs]
  )
}

export const useDeleteCustomNetworkConfig = () => {
  const setCustomNetworksConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })
  return useCallback(
    (id: NetworkId) => {
      setCustomNetworksConfigs((prev) => {
        delete prev[id]
        return { ...prev }
      })
    },
    [setCustomNetworksConfigs]
  )
}

const storedSelectedNetworkIdAtom = atomWithStorage('network', localnetId, undefined, { getOnInit: true })
const selectedNetworkAtomId = atomWithRefresh((get) => {
  const networkId = window.location.pathname.split('/')[1]
  const networkConfigs = get(networkConfigsAtom)

  if (networkId in networkConfigs) {
    return networkId
  }
  return get(storedSelectedNetworkIdAtom)
})

const networksPromptedTokensAtom = atom<Record<NetworkId, NetworkTokens>>({})

export const useNetworkPromptedTokens = (id: NetworkId) => {
  const networksPromptedTokens = useAtomValue(networksPromptedTokensAtom, { store: settingsStore })
  return id in networksPromptedTokens ? networksPromptedTokens[id] : undefined
}

export const useSetNetworkPromptedTokens = () => {
  const setPromptedNetworkTokens = useSetAtom(networksPromptedTokensAtom, { store: settingsStore })

  return useCallback(
    (id: NetworkId, tokens: NetworkTokens) => {
      setPromptedNetworkTokens((prev) => ({
        ...prev,
        [id]: tokens,
      }))
    },
    [setPromptedNetworkTokens]
  )
}

const shouldPromptForTokens = atom((get) => {
  const networkConfig = get(networkConfigAtom)
  return (
    (networkConfig.algod.promptForToken && !networkConfig.algod.token) ||
    (networkConfig.indexer.promptForToken && !networkConfig.indexer.token) ||
    (networkConfig.kmd?.promptForToken && !networkConfig?.kmd.token)
  )
})

export const useShouldPromptForTokens = () => {
  return useAtomValue(shouldPromptForTokens, { store: settingsStore })
}

export const networkConfigAtom = atom<NetworkConfigWithId>((get) => {
  const selectedNetworkId = get(selectedNetworkAtomId)
  const networkConfigs = get(networkConfigsAtom)
  const networksPromptedTokens = get(networksPromptedTokensAtom)

  // TODO: NC - This should be done more generically, so it handles all custom network configurations
  if (selectedNetworkId === localnetId) {
    nonLocalnetWalletProviders.forEach((providerId) => {
      clearAccounts(providerId)
    })
    clearAccounts(PROVIDER_ID.MNEMONIC) // This clears a connected mnemonic wallet after a page reload, as the mnemonic is not stored and cannot be used to sign transactions.
  } else {
    localnetWalletProviders.forEach((providerId) => {
      clearAccounts(providerId)
    })
  }

  let id = selectedNetworkId
  if (!(selectedNetworkId in networkConfigs)) {
    id = localnetId
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${selectedNetworkId}, fallback to ${defaultNetworkConfigs.localnet.name}`)
  }

  const config = {
    id,
    ...networkConfigs[id],
  }

  // Use prompted tokens if they have been supplied
  const networkTokens = id in networksPromptedTokens ? networksPromptedTokens[id] : undefined
  if (networkTokens) {
    if (config.algod.promptForToken === true) {
      config.algod.token = networkTokens.algod
    }
    if (config.indexer.promptForToken === true) {
      config.indexer.token = networkTokens.indexer
    }
    if (config.kmd && config.kmd.promptForToken === true) {
      config.kmd.token = networkTokens.kmd
    }
  }

  return config
})

export const useNetworkConfig = () => {
  return useAtomValue(networkConfigAtom, { store: settingsStore })
}

export const useSelectedNetwork = () => {
  const setSelectedNetwork = useSetSelectedNetwork()
  return [useAtomValue(selectedNetworkAtomId, { store: settingsStore }), setSelectedNetwork] as const
}

export const useSetSelectedNetwork = () => {
  const { providers } = useWallet()
  const setStorageNetwork = useSetAtom(storedSelectedNetworkIdAtom, { store: settingsStore })

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
      settingsStore.set(selectedNetworkAtomId)
    },
    [providers, setStorageNetwork]
  )
}
