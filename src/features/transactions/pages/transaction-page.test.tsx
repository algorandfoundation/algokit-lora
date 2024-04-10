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
  const paymentTransaction = transactionModelMother.paymentTransactionWithNoChildren().build()

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
        expect(getByDescriptionTerm(component.container, 'Timestamp').textContent).toBe('Thu, 29 February 2024 06:52:01')
        expect(getByDescriptionTerm(component.container, 'Block').textContent).toBe('36570178')
        expect(component.queryByText('Group')).toBeNull()
        expect(getByDescriptionTerm(component.container, 'Fee').textContent).toBe('0.001')

        expect(getByDescriptionTerm(component.container, 'Amount').textContent).toBe('236.07')
      }
    )
  })
})

describe('when rendering a multisig transaction', () => {
  it('it should show multisig information with a payment transaction', async () => {
    const multiSigPaymentTransaction = transactionModelMother.paymentTransactionWithNoChildren().build()
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: multiSigPaymentTransaction.id }))
    const myStore = createStore()
    myStore.set(transactionsAtom, [multiSigPaymentTransaction])

    return executeComponentTest(
      () => {
        return render(<TransactionPage />, undefined, myStore)
      },
      async (component) => {
        await waitFor(() => {
          expect(getByDescriptionTerm(component.container, 'Subsigners').textContent).toBe(
            'QWEQQN7CGK3W5O7GV6L3TDBIAM6BD4A5B7L3LE2QKGMJ7DT2COFI6WBPGU4QUFAFCF4IOWJXS6QJBEOKMNT7FOMEACIDDJNIUC5YYCEBY2HA27ZYJ46QIY2D3V7M55ROTKZ6N5KDQQYN7BU6KHLPWSBFREIIEV3G7IUOS4ESEUHPM4'
          )
          expect(getByDescriptionTerm(component.container, 'Threshold').textContent).toBe('3')
          expect(getByDescriptionTerm(component.container, 'Version').textContent).toBe('1')
        })
      }
    )
  })
})
