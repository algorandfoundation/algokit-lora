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
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { HttpError } from '@/tests/errors'

describe('transaction-page', () => {
  describe('when rendering a transaction with an invalid id', () => {
    it('should display invalid id message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: 'invalid-id' }))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionPageConstants.invalidIdMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a transaction that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: '8MK6WLKFBPC323ATSEKNEKUTQZ23TCCM75SJNSFAHEM65GYJ5AND' }))
      vi.mocked(lookupTransactionById).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionPageConstants.notFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a transaction that fails to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: '7MK6WLKFBPC323ATSEKNEKUTQZ23TCCM75SJNSFAHEM65GYJ5AND' }))
      vi.mocked(lookupTransactionById).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionPageConstants.failedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a payment transaction with no children', () => {
    const paymentTransaction = transactionModelMother.paymentTransactionWithNoChildren().build()

    it('should be rendered with the correct data', async () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: paymentTransaction.id }))
      const myStore = createStore()
      myStore.set(transactionsAtom, [paymentTransaction])

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() =>
            expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.transactionId).textContent).toBe(
              paymentTransaction.id
            )
          )
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.type).textContent).toBe('Payment')
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.timestamp).textContent).toBe(
            'Thu, 29 February 2024 06:52:01'
          )
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.block).textContent).toBe('36570178')
          expect(component.queryByText(transactionPageConstants.labels.group)).toBeNull()
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.fee).textContent).toBe('0.001')

          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.sender).textContent).toBe(
            'M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM'
          )
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.receiver).textContent).toBe(
            'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ'
          )
          expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.amount).textContent).toBe('236.07')

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionPageConstants.labels.viewTransaction })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: transactionPageConstants.labels.visual }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionPageConstants.labels.table }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionPageConstants.labels.table })
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

  describe('when rendering a multisig payment transaction', () => {
    it('should show the multisig information', async () => {
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
            expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.multisig.threshold).textContent).toBe('3')
            expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.multisig.version).textContent).toBe('1')
            expect(getByDescriptionTerm(component.container, transactionPageConstants.labels.multisig.subsigners).textContent).toBe(
              'QWEQQN7CGK3W5O7GV6L3TDBIAM6BD4A5B7L3LE2QKGMJ7DT2COFI6WBPGU4QUFAFCF4IOWJXS6QJBEOKMNT7FOMEACIDDJNIUC5YYCEBY2HA27ZYJ46QIY2D3V7M55ROTKZ6N5KDQQYN7BU6KHLPWSBFREIIEV3G7IUOS4ESEUHPM4'
            )
          })
        }
      )
    })
  })
})
