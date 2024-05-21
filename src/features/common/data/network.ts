import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type NetworkConfig = {
  id: string
  name: string
  indexerConfig: {
    server: string
    port: number
  }
  algodConfig: {
    server: string
    port: number
  }
}

const mainnetConfig: NetworkConfig = {
  id: 'mainnet',
  name: 'Mainnet',
  indexerConfig: {
    server: 'https://mainnet-idx.algonode.cloud/',
    port: 443,
  },
  algodConfig: {
    server: 'https://mainnet-api.algonode.cloud/',
    port: 443,
  },
}
const testnetConfig: NetworkConfig = {
  id: 'testnet',
  name: 'Testnet',
  indexerConfig: {
    server: 'https://testnet-idx.algonode.cloud/',
    port: 443,
  },
  algodConfig: {
    server: 'https://testnet-api.algonode.cloud/',
    port: 443,
  },
}

export const networksConfig = [mainnetConfig, testnetConfig]

export const networkIdAtom = atomWithStorage('network-id', mainnetConfig.id, undefined, { getOnInit: true })

export const networkConfigAtom = atom((get) => {
  const id = get(networkIdAtom)
  const config = networksConfig.find((n) => n.id === id)

  if (!config) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown network: ${id}`)
    return mainnetConfig
  }

  return config
})
