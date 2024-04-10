import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
}))

vi.mock('@algorandfoundation/algokit-utils', () => ({
  ...vi.importActual('@algorandfoundation/algokit-utils'),
  getAlgoIndexerClient: vi.fn(),
  lookupTransactionById: vi.fn(),
}))
