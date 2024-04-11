import { vi } from 'vitest'
import algosdk from 'algosdk'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
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
    },
  }
})
