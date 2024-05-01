import { Config, getAlgoClient, getAlgoIndexerClient } from '@algorandfoundation/algokit-utils'
export * from './atom-with-debounce'

Config.configure({
  logger: Config.getLogger(true),
})

export const indexer = getAlgoIndexerClient({
  server: 'https://testnet-idx.algonode.cloud/',
  port: 443,
})

export const algod = getAlgoClient({
  server: 'https://testnet-api.algonode.cloud/',
  port: 443,
})
