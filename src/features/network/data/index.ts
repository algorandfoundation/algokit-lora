import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithDefault, atomWithRefresh, atomWithStorage } from 'jotai/utils'
import { clearAccounts, PROVIDER_ID, useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'
import { NetworkConfig, NetworkConfigWithId, NetworkId, NetworkTokens, localnetId, testnetId, mainnetId, fnetId, betanetId } from './types'
import { settingsStore } from '@/features/settings/data'
import config from '@/config'
import { createAtomStorageWithoutSubscription } from '@/features/common/data/atom-storage'

export { localnetId, testnetId, mainnetId, fnetId } from './types'
export const localnetWalletProviders = [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC, PROVIDER_ID.LUTE]
export const nonLocalnetWalletProviders = [PROVIDER_ID.DEFLY, PROVIDER_ID.DAFFI, PROVIDER_ID.PERA, PROVIDER_ID.EXODUS, PROVIDER_ID.LUTE]
const supportedWalletProviders = Array.from(new Set([...localnetWalletProviders, ...nonLocalnetWalletProviders]))
export const allWalletProviderNames: Record<PROVIDER_ID, string> = {
  kmd: 'KMD',
  mnemonic: 'MNEMONIC',
  defly: 'Defly',
  daffi: 'Daffi',
  pera: 'Pera',
  exodus: 'Exodus',
  lute: 'Lute',
  // The below providers aren't used
  custom: 'Custom',
  myalgo: 'My Algo',
  algosigner: 'Algo Signer',
  kibisis: 'Kibisis',
  walletconnect: 'Wallet Connect',
  magic: 'Magic',
}

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
  [fnetId]: {
    name: 'FNet',
    indexer: {
      server: 'https://fnet-idx.4160.nodely.io/',
      port: 443,
    },
    algod: {
      server: 'https://fnet-api.4160.nodely.io/',
      port: 443,
    },
    walletProviders: [PROVIDER_ID.LUTE],
  },
  [betanetId]: {
    name: 'BetaNet',
    indexer: {
      server: 'https://betanet-idx.algonode.cloud/',
      port: 443,
    },
    algod: {
      server: 'https://betanet-api.algonode.cloud/',
      port: 443,
    },
    walletProviders: [PROVIDER_ID.LUTE],
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
    dispenserApi: {
      url: config.testNetDispenserApiUrl,
      address: config.testNetDispenserAddress,
    },
    nfdApiUrl: 'https://api.testnet.nf.domains',
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
    nfdApiUrl: 'https://api.nf.domains',
  },
}

export const temporaryLocalNetSearchParams = {
  algodServer: 'algod_url',
  algodPort: 'algod_port',
  indexerServer: 'indexer_url',
  indexerPort: 'indexer_port',
  kmdServer: 'kmd_url',
  kmdPort: 'kmd_port',
}

const customNetworkConfigsAtom = atomWithStorage<Record<NetworkId, NetworkConfig>>('network-configs', {}, undefined, {
  getOnInit: true,
})

export const temporaryLocalNetConfigAtom = atomWithDefault<NetworkConfig | undefined>(() => {
  const url = new URL(window.location.href)
  const networkId = url.pathname.split('/')[1]

  if (
    networkId === localnetId &&
    url.searchParams.size > 0 &&
    (url.searchParams.has(temporaryLocalNetSearchParams.algodServer) ||
      url.searchParams.has(temporaryLocalNetSearchParams.algodPort) ||
      url.searchParams.has(temporaryLocalNetSearchParams.indexerServer) ||
      url.searchParams.has(temporaryLocalNetSearchParams.indexerPort) ||
      url.searchParams.has(temporaryLocalNetSearchParams.kmdServer) ||
      url.searchParams.has(temporaryLocalNetSearchParams.kmdPort))
  ) {
    const algodServer = url.searchParams.get(temporaryLocalNetSearchParams.algodServer)
    const algodPort = url.searchParams.get(temporaryLocalNetSearchParams.algodPort)
    const indexerServer = url.searchParams.get(temporaryLocalNetSearchParams.indexerServer)
    const indexerPort = url.searchParams.get(temporaryLocalNetSearchParams.indexerPort)
    const kmdServer = url.searchParams.get(temporaryLocalNetSearchParams.kmdServer)
    const kmdPort = url.searchParams.get(temporaryLocalNetSearchParams.kmdPort)

    url.searchParams.delete(temporaryLocalNetSearchParams.algodServer)
    url.searchParams.delete(temporaryLocalNetSearchParams.algodPort)
    url.searchParams.delete(temporaryLocalNetSearchParams.indexerServer)
    url.searchParams.delete(temporaryLocalNetSearchParams.indexerPort)
    url.searchParams.delete(temporaryLocalNetSearchParams.kmdServer)
    url.searchParams.delete(temporaryLocalNetSearchParams.kmdPort)

    window.history.replaceState({}, '', url)

    const defaultLocalNetConfig = defaultNetworkConfigs.localnet
    return {
      ...defaultLocalNetConfig,
      algod: {
        ...defaultLocalNetConfig.algod,
        server: algodServer ?? defaultLocalNetConfig.algod.server,
        port: algodPort ? Number(algodPort) : defaultLocalNetConfig.algod.port,
      },
      indexer: {
        ...defaultLocalNetConfig.indexer,
        server: indexerServer ?? defaultLocalNetConfig.indexer.server,
        port: indexerPort ? Number(indexerPort) : defaultLocalNetConfig.indexer.port,
      },
      kmd: {
        ...defaultLocalNetConfig.kmd,
        server: kmdServer ?? defaultLocalNetConfig.kmd!.server,
        port: kmdPort ? Number(kmdPort) : defaultLocalNetConfig.kmd!.port,
      },
    }
  }

  return undefined
})

const networkConfigsAtom = atom<Record<NetworkId, NetworkConfig>>((get) => {
  const customNetworkConfigs = get(customNetworkConfigsAtom)
  const temporaryLocalNetConfig = get(temporaryLocalNetConfigAtom)

  return {
    ...defaultNetworkConfigs,
    ...customNetworkConfigs,
    ...(temporaryLocalNetConfig ? { [localnetId]: temporaryLocalNetConfig } : undefined),
  }
})

export const useNetworkConfigs = () => {
  return useAtomValue(networkConfigsAtom, { store: settingsStore })
}

export const useSetCustomNetworkConfig = () => {
  const setCustomNetworkConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })

  return useCallback(
    (id: NetworkId, networkConfig: NetworkConfig) => {
      setCustomNetworkConfigs((prev) => ({
        ...prev,
        [id]: networkConfig,
      }))
    },
    [setCustomNetworkConfigs]
  )
}

export const useDeleteCustomNetworkConfig = () => {
  const setCustomNetworkConfigs = useSetAtom(customNetworkConfigsAtom, { store: settingsStore })
  const setTemporaryLocalNetConfig = useSetAtom(temporaryLocalNetConfigAtom, { store: settingsStore })
  return useCallback(
    (id: NetworkId) => {
      setCustomNetworkConfigs((prev) => {
        delete prev[id]
        return { ...prev }
      })
      if (id === localnetId) {
        setTemporaryLocalNetConfig(undefined)
      }
    },
    [setCustomNetworkConfigs, setTemporaryLocalNetConfig]
  )
}

const storedSelectedNetworkIdAtom = atomWithStorage('network', localnetId, createAtomStorageWithoutSubscription(), { getOnInit: true })
export const selectedNetworkAtomId = atomWithRefresh((get) => {
  const networkId = window.location.pathname.split('/')[1]
  const networkConfigs = get(networkConfigsAtom)

  if (networkId in networkConfigs) {
    return networkId
  }
  return get(storedSelectedNetworkIdAtom)
})

const networksPromptedTokensAtom = atom<Record<NetworkId, NetworkTokens>>({})

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

  let id = selectedNetworkId
  if (!(selectedNetworkId in networkConfigs)) {
    id = localnetId
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${selectedNetworkId}, fallback to ${defaultNetworkConfigs.localnet.name}`)
  }
  const config = networkConfigs[id]

  // This clears a connected mnemonic wallet after a page reload, as the mnemonic is not stored and cannot be used to sign transactions.
  if (config.walletProviders.includes(PROVIDER_ID.MNEMONIC)) {
    clearAccounts(PROVIDER_ID.MNEMONIC)
  }

  // This clears a connected KMD wallet after a page reload, as the chosen wallet isn't stored in the wallet provider state.
  // We can revisit if this is required in the future when upgrading to useWallet v3.
  if (config.walletProviders.includes(PROVIDER_ID.KMD)) {
    clearAccounts(PROVIDER_ID.KMD)
  }

  // This clears accounts for all wallet providers that are not configured
  supportedWalletProviders.forEach((providerId) => {
    if (!config.walletProviders.includes(providerId)) {
      clearAccounts(providerId)
    }
  })

  const networkTokens = id in networksPromptedTokens ? networksPromptedTokens[id] : undefined

  return {
    id,
    ...config,
    // Use prompted tokens if they have been supplied.
    // It's important we do it this way, so we don't mutate the stored network config.
    ...(networkTokens
      ? {
          algod: config.algod.promptForToken === true ? { ...config.algod, token: networkTokens.algod } : config.algod,
          indexer: config.indexer.promptForToken === true ? { ...config.indexer, token: networkTokens.indexer } : config.indexer,
          kmd: config.kmd && config.kmd.promptForToken === true ? { ...config.kmd, token: networkTokens.kmd } : config.kmd,
        }
      : undefined),
  }
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
