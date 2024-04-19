import { executeComponentTest } from '@/tests/test-component'
import { getAllByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BlockPage, blockFailedToLoadMessage, blockInvalidRoundMessage, blockNotFoundMessage } from './block-page'
import { indexer } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { blockResultMother } from '@/tests/object-mother/block-result'
import { createStore } from 'jotai'
import { blocksAtom } from '../data'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { nextRoundLabel, previousRoundLabel, roundLabel, timestampLabel, transactionsLabel } from '../components/block'
import { transactionsAtom } from '@/features/transactions/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { assetsAtom } from '@/features/assets/data'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'

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
      const block = blockResultMother.blockWithoutTransactions().withRound(12345).withTimestamp('2024-02-29T06:52:01Z').build()

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
      const asset = assetResultMother['mainnet-312769']().build()
      const transaction1 = transactionResultMother.payment().withGroup('W3pIVuWVJlzmMDGvX8St0W/DPxslnpt6vKV8zoFb6rg=').build()
      const transaction2 = transactionResultMother.transfer(asset).build()
      const transactions = [transaction1, transaction2]
      const block = blockResultMother.blockWithTransactions(transactions).withTimestamp('2024-02-29T06:52:01Z').build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blocksAtom, new Map([[block.round, block]]))
        myStore.set(transactionsAtom, new Map(transactions.map((x) => [x.id, x])))
        myStore.set(assetsAtom, new Map([[asset.index, asset]]))

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() => expect(getByDescriptionTerm(component.container, roundLabel).textContent).toBe(block.round.toString()))
            expect(getByDescriptionTerm(component.container, timestampLabel).textContent).toBe('Thu, 29 February 2024 06:52:01')
            expect(getByDescriptionTerm(component.container, transactionsLabel).textContent).toBe('2Payment=1Asset Transfer=1')
            expect(getByDescriptionTerm(component.container, previousRoundLabel).textContent).toBe((block.round - 1).toString())
            expect(getByDescriptionTerm(component.container, nextRoundLabel).textContent).toBe((block.round + 1).toString())

            const rows = getAllByRole(component.container, 'row')
            expect(rows.length).toBe(3)
            const transactionsRow1 = rows[1]
            const cell1 = getAllByRole(transactionsRow1, 'cell')
            expect(cell1[0].textContent).toBe(ellipseId(transaction1.id))
            expect(cell1[1].textContent).toBe(ellipseId(transaction1.group))
            expect(cell1[2].textContent).toBe(ellipseAddress(transaction1.sender))
            expect(cell1[3].textContent).toBe(ellipseAddress(transaction1['payment-transaction']!.receiver))
            expect(cell1[4].textContent).toBe('Payment')
            expect(cell1[5].textContent).toBe((transaction1['payment-transaction']!.amount / 1e6).toString())

            const transactionsRow2 = rows[2]
            const cell2 = getAllByRole(transactionsRow2, 'cell')
            expect(cell2[0].textContent).toBe(ellipseId(transaction2.id))
            expect(cell2[1].textContent).toBe(ellipseId(transaction2.group))
            expect(cell2[2].textContent).toBe(ellipseAddress(transaction2.sender))
            expect(cell2[3].textContent).toBe(ellipseAddress(transaction2['asset-transfer-transaction']!.receiver))
            expect(cell2[4].textContent).toBe('Asset Transfer')
            expect(cell2[5].textContent).toBe(`${(transaction2['asset-transfer-transaction']!.amount as number) / 1e6} USDt`)
          }
        )
      })
    })
  })
})
