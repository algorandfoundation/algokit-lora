import { executeComponentTest } from '@/tests/test-component'
import { getAllByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BlockPage, blockFailedToLoadMessage, blockInvalidRoundMessage, blockNotFoundMessage } from './block-page'
import { indexer } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { blockMetadataMother } from '@/tests/object-mother/block-metadata'
import { createStore } from 'jotai'
import { blocksAtom } from '../data'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { nextRoundLabel, previousRoundLabel, roundLabel, timestampLabel, transactionsLabel } from '../components/block'
import { transactionsAtom } from '@/features/transactions/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'

describe('block-page', () => {
  describe('when rending a block using an invalid round number', () => {
    it('should display invalid round message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: 'invalid-id' }))

      return executeComponentTest(
        () => render(<BlockPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(blockInvalidRoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rending a block that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: '123456' }))
      vi.mocked(indexer.lookupBlock(0).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => render(<BlockPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(blockNotFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rending a block that fails to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: '123456' }))
      vi.mocked(indexer.lookupBlock(0).do).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<BlockPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(blockFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rending a block that exists', () => {
    describe('and has no transactions', () => {
      const block = blockMetadataMother.blockWithoutTransactions().withTimestamp('2024-02-29T06:52:01Z').build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blocksAtom, new Map([[block.round, block]]))

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() => expect(getByDescriptionTerm(component.container, roundLabel).textContent).toBe(block.round.toString()))
            expect(getByDescriptionTerm(component.container, timestampLabel).textContent).toBe('Thu, 29 February 2024 06:52:01')
            expect(getByDescriptionTerm(component.container, transactionsLabel).textContent).toBe('0')
            expect(getByDescriptionTerm(component.container, previousRoundLabel).textContent).toBe((block.round - 1).toString())
            expect(getByDescriptionTerm(component.container, nextRoundLabel).textContent).toBe((block.round + 1).toString())

            const transactionsRow = getAllByRole(component.container, 'row')[1]
            expect(transactionsRow.textContent).toBe('No results.')
          }
        )
      })
    })

    describe('and has transactions', () => {
      const transaction1 = transactionResultMother
        .payment()
        .withId('zP5UBQ5K7ZHMbJVUAKF5BpdQfwZy4PbhKsDaHMMfOvl3bQoQqrKZ')
        .withGroup('W3pIVuWVJlzmMDGvX8St0W/DPxslnpt6vKV8zoFb6rg=')
        .withSender('M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM')
        ['withPayment-transaction']({
          amount: 236070000,
          receiver: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
        })
        .build()
      const block = blockMetadataMother
        .blockWithoutTransactions()
        .withTimestamp('2024-02-29T06:52:01Z')
        .withParentTransactionCount(1)
        .withTransactionIds([transaction1.id])
        .build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blocksAtom, new Map([[block.round, block]]))
        myStore.set(transactionsAtom, new Map([[transaction1.id, transaction1]]))

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() => expect(getByDescriptionTerm(component.container, roundLabel).textContent).toBe(block.round.toString()))
            expect(getByDescriptionTerm(component.container, timestampLabel).textContent).toBe('Thu, 29 February 2024 06:52:01')
            expect(getByDescriptionTerm(component.container, transactionsLabel).textContent).toBe(block.parentTransactionCount.toString())
            expect(getByDescriptionTerm(component.container, previousRoundLabel).textContent).toBe((block.round - 1).toString())
            expect(getByDescriptionTerm(component.container, nextRoundLabel).textContent).toBe((block.round + 1).toString())

            const transactionsRow1 = getAllByRole(component.container, 'row')[1]
            expect(getAllByRole(transactionsRow1, 'cell')[0].textContent).toBe('zP5UBQ5...')
            expect(getAllByRole(transactionsRow1, 'cell')[1].textContent).toBe('W3pIVuW...')
            expect(getAllByRole(transactionsRow1, 'cell')[2].textContent).toBe('M3IA...OXXM')
            expect(getAllByRole(transactionsRow1, 'cell')[3].textContent).toBe('KIZL...U5BQ')
            expect(getAllByRole(transactionsRow1, 'cell')[4].textContent).toBe('Payment')
            expect(getAllByRole(transactionsRow1, 'cell')[5].textContent).toBe('236.07')
          }
        )
      })
    })
  })
})
