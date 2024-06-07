import { atom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { PROVIDER_ID } from '@txnlab/use-wallet'

export type NetworkConfig = {
  id: string
  name: string
  indexer: {
    server: string
    port: number
    token?: string
  }
  algod: {
    server: string
    port: number
    token?: string
  }
  walletProviders: PROVIDER_ID[]
}

const mainnetConfig: NetworkConfig = {
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
export const testnetConfig: NetworkConfig = {
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
  walletProviders: [PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC],
}

export const networksConfigs = [mainnetConfig, testnetConfig, localnetConfig]

export const selectedNetworkAtom = atomWithStorage('network', localnetConfig.id, undefined, { getOnInit: true })

export const networkConfigAtom = atom((get) => {
  const id = get(selectedNetworkAtom)
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
