import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithDefault, atomWithRefresh, atomWithStorage } from 'jotai/utils'
import { WalletId } from '@txnlab/use-wallet-react'
import { useCallback } from 'react'
import {
  NetworkConfig,
  NetworkConfigWithId,
  NetworkId,
  NetworkTokens,
  localnetId,
  testnetId,
  mainnetId,
  fnetId,
  betanetId,
  StoredNetworkConfig,
} from './types'
import { settingsStore } from '@/features/settings/data'
import config from '@/config'
import { createAtomStorageWithoutSubscription } from '@/features/common/data/atom-storage'
import { useDisconnectAllWallets } from '@/features/wallet/hooks/use-disconnect-all-wallets'
import { Address } from 'algosdk'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

export { localnetId, testnetId, mainnetId, fnetId } from './types'
export const localnetWalletIds = [WalletId.KMD, WalletId.MNEMONIC, WalletId.LUTE]
export const nonLocalnetWalletIds = [WalletId.DEFLY, WalletId.PERA, WalletId.EXODUS, WalletId.LUTE]
export const allWalletProviderNames: Record<WalletId, string> = {
  kmd: 'KMD',
  mnemonic: 'MNEMONIC',
  defly: 'Defly',
  'defly-web': 'Defly Web',
  pera: 'Pera',
  exodus: 'Exodus',
  lute: 'Lute',
  // The below providers aren't used
  custom: 'Custom',
  kibisis: 'Kibisis',
  walletconnect: 'Wallet Connect',
  magic: 'Magic',
  biatec: 'Biatec',
}

export const MAINNET_FEE_SINK_ADDRESS = 'Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA'
export const TESTNET_FEE_SINK_ADDRESS = 'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE'

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
    walletIds: localnetWalletIds,
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
    walletIds: [WalletId.LUTE],
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
    walletIds: [WalletId.LUTE],
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
    walletIds: nonLocalnetWalletIds,
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
    walletIds: nonLocalnetWalletIds,
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

const storedCustomNetworkConfigsAtom = atomWithStorage<Record<NetworkId, StoredNetworkConfig>>('network-configs', {}, undefined, {
  getOnInit: true,
})
const customNetworkConfigsAtom = atom<Record<NetworkId, NetworkConfig>>((get) => {
  // Handles converting any old schema stored network configs to the new schema.
  const storedCustomNetworkConfigs = get(storedCustomNetworkConfigsAtom)
  return Object.fromEntries(
    Object.entries(storedCustomNetworkConfigs).map(([id, config]) => {
      const { walletIds, walletProviders, ...rest } = config
      return [
        id,
        {
          ...rest,
          walletIds: walletIds ?? walletProviders ?? [],
        },
      ] satisfies [NetworkId, NetworkConfig]
    })
  )
})

export const fundedDiscoveryAddressAtom = atom<Promise<string | Address>>(async (get) => {
  const currentNetwork = get(networkConfigAtom)
  let executorAddress: string | Address = MAINNET_FEE_SINK_ADDRESS

  if (!currentNetwork.id) return MAINNET_FEE_SINK_ADDRESS
  if (currentNetwork.id === 'localnet') {
    const localnetClient = AlgorandClient.defaultLocalNet()
    executorAddress = await localnetClient.account.localNetDispenser()
  }
  if (currentNetwork.id === 'testnet') {
    return TESTNET_FAUCET_ADDRESS
  }

  return executorAddress
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
  const setCustomNetworkConfigs = useSetAtom(storedCustomNetworkConfigsAtom, { store: settingsStore })

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
  const setCustomNetworkConfigs = useSetAtom(storedCustomNetworkConfigsAtom, { store: settingsStore })
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

export const storedSelectedNetworkIdAtom = atomWithStorage('network', mainnetId, createAtomStorageWithoutSubscription(), {
  getOnInit: true,
})
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
    (networkConfig.algod.promptForToken === true && !networkConfig.algod.token) ||
    (networkConfig.indexer.promptForToken === true && !networkConfig.indexer.token) ||
    (networkConfig.kmd?.promptForToken === true && !networkConfig?.kmd.token)
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
    id = mainnetId
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${selectedNetworkId}, fallback to ${defaultNetworkConfigs.mainnet.name}`)
  }
  const config = networkConfigs[id]

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
  const disconnectAllWallets = useDisconnectAllWallets()
  const setStorageNetwork = useSetAtom(storedSelectedNetworkIdAtom, { store: settingsStore })

  return useCallback(
    async (selectedNetwork: string) => {
      await disconnectAllWallets()
      setStorageNetwork(selectedNetwork)
      // Refresh selected network atom value
      settingsStore.set(selectedNetworkAtomId)
    },
    [disconnectAllWallets, setStorageNetwork]
  )
}
