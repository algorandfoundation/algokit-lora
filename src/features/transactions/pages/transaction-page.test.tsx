import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPage } from './transaction-page'
import { executeComponentTest } from '@/tests/test-component'
import { transactionPageConstants } from '@/features/theme/constant'
import { render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { createStore } from 'jotai'
import { transactionsAtom } from '../data'

describe('given a invalid transaction ID', () => {
  it.skip('should show "Transaction does not exist"', () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: 'invalid-id' }))

    return executeComponentTest(
      () => render(<TransactionPage />),
      async (component) => {
        expect(component.getByText(transactionPageConstants.transactionNotFound)).toBeTruthy()
      }
    )
  })
})

describe('given a payment transaction', () => {
  const paymentTransaction = transactionModelMother.simplePaymentTransaction().build()

  it('it should be rendered', async () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: paymentTransaction.id }))

    const myStore = createStore()
    myStore.set(transactionsAtom, [paymentTransaction])

    return executeComponentTest(
      () => {
        return render(<TransactionPage />, undefined, myStore)
      },
      async (component) => {
        // waitFor the loading state to be finished
        await waitFor(() => expect(getByDescriptionTerm(component.container, 'Transaction ID').textContent).toBe(paymentTransaction.id))
        expect(getByDescriptionTerm(component.container, 'Type').textContent).toBe('Payment')
        expect(getByDescriptionTerm(component.container, 'Timestamp').textContent).toBe('Thu, 29 February 2024 16:52:01')
        expect(getByDescriptionTerm(component.container, 'Block').textContent).toBe('36570178')
        expect(component.queryByText('Group')).toBeNull()
        expect(getByDescriptionTerm(component.container, 'Fee').textContent).toBe('0.001')

        expect(getByDescriptionTerm(component.container, 'Amount').textContent).toBe('236.07')
      }
    )
  })
})