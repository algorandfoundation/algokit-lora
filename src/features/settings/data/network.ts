import { atom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'

export type NetworkConfig = {
  id: string
  name: string
  indexer: {
    server: string
    port: number
  }
  algod: {
    server: string
    port: number
    token?: string
  }
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
}
const localnetConfig: NetworkConfig = {
  id: 'localnet',
  name: 'LocalNet',
  indexer: {
    server: 'http://localhost/',
    port: 8980,
  },
  algod: {
    server: 'http://localhost/',
    port: 4001,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
}

export const networksConfigs = [mainnetConfig, testnetConfig, localnetConfig]

export const selectedNetworkAtom = atomWithStorage('network', localnetConfig.id, undefined, { getOnInit: true })

const networkConfigAtom = atom((get) => {
  const id = get(selectedNetworkAtom)
  const config = networksConfigs.find((n) => n.id === id)

  if (!config) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${id}, fallback to LocalNet`)
    return localnetConfig
  }

  return config
})

export const useNetworkConfig = () => {
  return useAtomValue(networkConfigAtom, { store: settingsStore })
}
