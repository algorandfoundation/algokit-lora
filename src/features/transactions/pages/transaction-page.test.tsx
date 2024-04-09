import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'
import { TransactionPage } from '@/features/transactions/pages/transaction-page'
import { transactionPageConstants } from '@/features/theme/constant'
import { useParams } from 'react-router-dom'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { HttpError } from '@/tests/errors'

describe('transaction', () => {
  describe('when the transaction id is not found', () => {
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

  describe('when transaction retrieval fails', () => {
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

  describe('when the transaction id is not valid', () => {
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
})
