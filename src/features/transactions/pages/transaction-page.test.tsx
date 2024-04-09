import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPage } from './transaction-page'
import { executeComponentTest } from '@/tests/test-component'
import { transactionPageConstants } from '@/features/theme/constant'
import { getAllByRole, getByRole, render, waitFor } from '@/tests/testing-library'
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
      async (component, user) => {
        // waitFor the loading state to be finished
        await waitFor(() => expect(getByDescriptionTerm(component.container, 'Transaction ID').textContent).toBe(paymentTransaction.id))
        expect(getByDescriptionTerm(component.container, 'Type').textContent).toBe('Payment')
        expect(getByDescriptionTerm(component.container, 'Timestamp').textContent).toBe('Thu, 29 February 2024 16:52:01')
        expect(getByDescriptionTerm(component.container, 'Block').textContent).toBe('36570178')
        expect(component.queryByText('Group')).toBeNull()
        expect(getByDescriptionTerm(component.container, 'Fee').textContent).toBe('0.001')

        expect(getByDescriptionTerm(component.container, 'Sender').textContent).toBe(
          'M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM'
        )
        expect(getByDescriptionTerm(component.container, 'Receiver').textContent).toBe(
          'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ'
        )
        expect(getByDescriptionTerm(component.container, 'Amount').textContent).toBe('236.07')

        const viewTransactionTabList = component.getByRole('tablist', { name: 'View Transaction' })
        expect(viewTransactionTabList).toBeTruthy()
        expect(component.getByRole('tabpanel', { name: 'Visual' }).getAttribute('data-state'), 'Visual tab should be active').toBe('active')

        // After click on the Table tab
        await user.click(getByRole(viewTransactionTabList, 'tab', { name: 'Table' }))
        const tableViewTab = component.getByRole('tabpanel', { name: 'Table' })
        await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

        // Test the table data
        const dataRow = getAllByRole(tableViewTab, 'row')[1]
        expect(getAllByRole(dataRow, 'cell')[0].textContent).toBe('FBOR...YBBQ')
        expect(getAllByRole(dataRow, 'cell')[1].textContent).toBe('M3IA...OXXM')
        expect(getAllByRole(dataRow, 'cell')[2].textContent).toBe('KIZL...U5BQ')
        expect(getAllByRole(dataRow, 'cell')[3].textContent).toBe('Payment')
        expect(getAllByRole(dataRow, 'cell')[4].textContent).toBe('236.07')
      }
    )
  })
})
