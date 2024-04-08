import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPage } from './transaction-page'
import { getSampleTransaction } from './get-sample-transaction'
import { executeComponentTest } from '@/tests/test-component'
import { render } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'

vi.mock('./get-sample-transaction', () => ({
  getSampleTransaction: vi.fn(),
}))

describe('given a payment transaction', () => {
  const paymentTransaction = transactionModelMother.simplePaymentTransaction().build()

  it('it should be rendered', async () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: paymentTransaction.id }))
    vi.mocked(getSampleTransaction).mockImplementation(() => paymentTransaction)

    return executeComponentTest(
      () => render(<TransactionPage />),
      async (component) => {
        expect(getByDescriptionTerm(component.container, 'Transaction ID').textContent).toBe(paymentTransaction.id)
        expect(getByDescriptionTerm(component.container, 'Type').textContent).toBe('Payment')
        expect(getByDescriptionTerm(component.container, 'Timestamp').textContent).toBe('Thu, 29 February 2024 16:52:01')
        expect(getByDescriptionTerm(component.container, 'Block').textContent).toBe('36570178')
        expect(component.queryByText('Group')).toBeNull()
        expect(getByDescriptionTerm(component.container, 'Fee').textContent).toBe('0.001')
      }
    )
  })
})
