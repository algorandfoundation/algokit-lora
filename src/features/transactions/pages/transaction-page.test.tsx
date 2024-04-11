import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it, vi } from 'vitest'
import {
  TransactionPage,
  transactionFailedToLoadMessage,
  transactionInvalidIdMessage,
  transactionNotFoundMessage,
} from './transaction-page'
import { executeComponentTest } from '@/tests/test-component'
import { getAllByRole, getByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { createStore } from 'jotai'
import { transactionsAtom } from '../data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { HttpError } from '@/tests/errors'
import { base64LogicsigTabLabel, tealLogicsigTabLabel, logicsigLabel } from '../components/logicsig'
import { algod } from '@/features/common/data'
import {
  tableTransactionDetailsTabLabel,
  transactionDetailsLabel,
  visualTransactionDetailsTabLabel,
} from '../components/payment-transaction'
import { multisigSubsignersLabel, multisigThresholdLabel, multisigVersionLabel } from '../components/multisig'
import {
  transactionBlockLabel,
  transactionFeeLabel,
  transactionGroupLabel,
  transactionIdLabel,
  transactionTimestampLabel,
  transactionTypeLabel,
} from '../components/transaction-info'
import { transactionAmountLabel, transactionReceiverLabel, transactionSenderLabel } from '../components/transaction-view-visual'

describe('transaction-page', () => {
  describe('when rendering a transaction with an invalid id', () => {
    it('should display invalid id message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: 'invalid-id' }))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionInvalidIdMessage)).toBeTruthy())
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
          await waitFor(() => expect(component.getByText(transactionNotFoundMessage)).toBeTruthy())
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
          await waitFor(() => expect(component.getByText(transactionFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a payment transaction', () => {
    const transaction = transactionModelMother
      .payment()
      .withId('FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ')
      ['withConfirmed-round'](36570178)
      ['withRound-time'](1709189521)
      .withSender('M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM')
      ['withPayment-transaction']({
        amount: 236070000,
        receiver: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
      })
      .withFee(1000)
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionsAtom, [transaction])

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBe(transaction.id))
          expect(getByDescriptionTerm(component.container, transactionTypeLabel).textContent).toBe('Payment')
          expect(getByDescriptionTerm(component.container, transactionTimestampLabel).textContent).toBe('Thu, 29 February 2024 06:52:01')
          expect(getByDescriptionTerm(component.container, transactionBlockLabel).textContent).toBe('36570178')
          expect(component.queryByText(transactionGroupLabel)).toBeNull()
          expect(getByDescriptionTerm(component.container, transactionFeeLabel).textContent).toBe('0.001')

          expect(getByDescriptionTerm(component.container, transactionSenderLabel).textContent).toBe(transaction.sender)
          expect(getByDescriptionTerm(component.container, transactionReceiverLabel).textContent).toBe(
            transaction['payment-transaction']!.receiver
          )
          expect(getByDescriptionTerm(component.container, transactionAmountLabel).textContent).toBe('236.07')

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: visualTransactionDetailsTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: tableTransactionDetailsTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: tableTransactionDetailsTabLabel })
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
    it('should show the multisig information', () => {
      const transaction = transactionModelMother.multisig().build()
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionsAtom, [transaction])

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            expect(getByDescriptionTerm(component.container, multisigThresholdLabel).textContent).toBe('3')
            expect(getByDescriptionTerm(component.container, multisigVersionLabel).textContent).toBe('1')
            expect(getByDescriptionTerm(component.container, multisigSubsignersLabel).textContent).toBe(
              'QWEQQN7CGK3W5O7GV6L3TDBIAM6BD4A5B7L3LE2QKGMJ7DT2COFI6WBPGU4QUFAFCF4IOWJXS6QJBEOKMNT7FOMEACIDDJNIUC5YYCEBY2HA27ZYJ46QIY2D3V7M55ROTKZ6N5KDQQYN7BU6KHLPWSBFREIIEV3G7IUOS4ESEUHPM4'
            )
          })
        }
      )
    })
  })
  describe('when rendering a logicsig payment transaction', () => {
    const transaction = transactionModelMother.logicsig().build()

    it('should show the logicsig base64', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionsAtom, [transaction])

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const logicsigTabList = component.getByRole('tablist', { name: logicsigLabel })
            expect(logicsigTabList).toBeTruthy()
          })

          const base64Tab = component.getByRole('tabpanel', { name: base64LogicsigTabLabel })
          expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active')
          expect(base64Tab.textContent).toBe(transaction.signature!.logicsig!.logic)
        }
      )
    })

    it('should show the logicsig teal when activated', () => {
      const teal = '\n#pragma version 8\nint 1\nreturn\n'
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      vi.mocked(algod.disassemble('').do).mockImplementation(() => Promise.resolve({ result: teal }))

      const myStore = createStore()
      myStore.set(transactionsAtom, [transaction])

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          await waitFor(async () => {
            const logicsigTabList = component.getByRole('tablist', { name: logicsigLabel })
            expect(logicsigTabList).toBeTruthy()
            await user.click(getByRole(logicsigTabList, 'tab', { name: tealLogicsigTabLabel }))
          })
          const tealTab = component.getByRole('tabpanel', { name: tealLogicsigTabLabel })
          await waitFor(() => expect(tealTab.getAttribute('data-state'), 'Teal tab should be active').toBe('active'))
          expect(tealTab.textContent).toBe(teal)
        }
      )
    })
  })
})
