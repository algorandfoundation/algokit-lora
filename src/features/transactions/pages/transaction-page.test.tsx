import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPage } from './transaction-page'
import { getSampleTransaction } from './get-sample-transaction'
import { executeComponentTest } from '@/tests/test-component'
import { render, within } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
}))

vi.mock('./get-sample-transaction', () => ({
  getSampleTransaction: vi.fn(),
}))

describe('given a payment transaction', () => {
  const paymentTransaction = transactionModelMother.paymentTransaction().build()

  it('it should be rendered', async () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: paymentTransaction.id }))
    vi.mocked(getSampleTransaction).mockImplementation(() => paymentTransaction)

    return executeComponentTest(
      () => render(<TransactionPage />),
      async (component) => {
        const foo = (await component.findByText('Transaction ID')).parentElement!
        const bar = await within(foo).findByText(paymentTransaction.id)
        expect(bar).toBeTruthy()

        const foo1 = (await component.findByText('Block')).parentElement!
        const bar1 = await within(foo1).findByText(paymentTransaction.confirmedRound)
        expect(bar1).toBeTruthy()
      }
    )
  })
})
