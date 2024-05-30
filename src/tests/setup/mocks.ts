import { vi } from 'vitest'
import algosdk from 'algosdk'
import { useWallet } from '@txnlab/use-wallet'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}))

vi.mock('@algorandfoundation/algokit-utils', async () => ({
  ...(await vi.importActual('@algorandfoundation/algokit-utils')),
  getAlgoIndexerClient: vi.fn(),
  getAlgoClient: vi.fn(),
  lookupTransactionById: vi.fn(),
}))

vi.mock('@/features/common/data', async () => {
  const original = (await vi.importActual('@/features/common/data')) satisfies { algod: algosdk.Algodv2; indexer: algosdk.Indexer }
  return {
    ...original,
    algod: {
      ...(original.algod as algosdk.Algodv2),
      disassemble: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
      getAssetByID: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
      accountInformation: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
      getApplicationByID: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
    },
    indexer: {
      ...(original.indexer as algosdk.Indexer),
      lookupBlock: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
      lookupAssetByID: vi.fn().mockReturnValue({
        includeAll: vi.fn().mockReturnValue({
          do: vi.fn().mockReturnValue({ then: vi.fn() }),
        }),
      }),
      searchForTransactions: vi.fn().mockReturnValue({
        assetID: vi.fn().mockReturnValue({
          txType: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
            address: vi.fn().mockReturnValue({
              addressRole: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  do: vi.fn().mockReturnValue({ then: vi.fn() }),
                }),
              }),
            }),
          }),
        }),
        applicationID: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
          }),
        }),
      }),
      lookupApplications: vi.fn().mockReturnValue({
        includeAll: vi.fn().mockReturnValue({
          do: vi.fn().mockReturnValue({ then: vi.fn() }),
        }),
      }),
      searchForApplicationBoxes: vi.fn().mockReturnValue({
        nextToken: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
          }),
        }),
      }),
    },
  }
})

vi.mock('@txnlab/use-wallet', async () => {
  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
  return {
    ...original,
    useWallet: vi.fn().mockImplementation(() => {
      return original.useWallet()
    }),
  }
})

vi.mock('@/features/blocks/data', async () => {
  const original = await vi.importActual('@/features/blocks/data')
  return {
    ...original,
    useSubscribeToBlocksEffect: vi.fn(),
  }
})

global.fetch = vi.fn()
window.HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillStyle: 'ok',
    fillRect: () => {},
  } as unknown as null // Hack so we don't need to implement the whole CanvasRenderingContext2D
}
