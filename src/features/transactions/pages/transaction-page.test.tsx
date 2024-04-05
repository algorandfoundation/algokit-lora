import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPage, getSampleTransaction } from './transaction-page'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor, within } from '@/tests/testing-library'

describe('given a payment transaction', () => {
  const paymentTransaction = transactionModelMother.paymentTransaction().build()

  it('it should be rendered', async () => {
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useParams: () => ({ transactionId: paymentTransaction.id }),
    }))

    const mock = vi.fn().mockImplementation(getSampleTransaction)
    mock.mockImplementationOnce(() => paymentTransaction)

    return executeComponentTest(
      () => render(<TransactionPage />),
      async (component) => {
        const foo = (await component.findByText('Transaction ID')).parentElement!
        const bar = await within(foo).findByText(paymentTransaction.id)
        expect(bar).toBeTruthy()
      }
    )
  })
})
