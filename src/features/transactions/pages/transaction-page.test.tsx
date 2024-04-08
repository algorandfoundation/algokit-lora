import { describe, it, expect, vi } from 'vitest'
import { render } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'
import { TransactionPage } from '@/features/transactions/pages/transaction-page'
import { transactionPageConstants } from '@/features/theme/constant'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({ transactionId: 'invalid-id' }),
}))

describe('transaction', () => {
  it.skip('should show "Transaction does not exist" for an invalid transaction ID', () => {
    return executeComponentTest(
      () => render(<TransactionPage />),
      async (component) => {
        expect(component.getByText(transactionPageConstants.transactionNotFound)).toBeTruthy()
      }
    )
  })
})
