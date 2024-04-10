import { vi } from 'vitest'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
}))

vi.mock('@algorandfoundation/algokit-utils', async () => {
  return {
    ...(await vi.importActual('@algorandfoundation/algokit-utils')),
    getAlgoIndexerClient: vi.fn(),
    getAlgoClient: vi.fn(),
    lookupTransactionById: vi.fn(),
  }
})
