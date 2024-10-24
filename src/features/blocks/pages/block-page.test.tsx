import { executeComponentTest } from '@/tests/test-component'
import { getAllByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BlockPage, blockFailedToLoadMessage, blockInvalidRoundMessage, blockNotFoundMessage } from './block-page'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { blockResultMother } from '@/tests/object-mother/block-result'
import { createStore } from 'jotai'
import { blockResultsAtom, syncedRoundAtom } from '../data'
import { nextRoundLabel, previousRoundLabel, roundLabel, timestampLabel, transactionsLabel } from '../components/block-details'
import { transactionResultsAtom } from '@/features/transactions/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { assetResultsAtom } from '@/features/assets/data'
import { indexer } from '@/features/common/data/algo-client'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    indexer: {
      lookupBlock: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
    },
  }
})

describe('block-page', () => {
  describe('when rendering a block using an invalid round number', () => {
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

  describe('when rendering a block that does not exist', () => {
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

  describe('when rendering a block that fails to load', () => {
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

  describe('when rendering a block that exists', () => {
    describe('and has no transactions', () => {
      const block = blockResultMother.blockWithoutTransactions().withRound(12345).withTimestamp(1719284618).build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blockResultsAtom, new Map([[block.round, createReadOnlyAtomAndTimestamp(block)]]))
        myStore.set(syncedRoundAtom, block.round + 1)

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() =>
              descriptionListAssertion({
                container: component.container,
                items: [
                  { term: roundLabel, description: block.round.toString() },
                  { term: timestampLabel, description: 'Tue, 25 June 2024 03:03:38' },
                  { term: transactionsLabel, description: '0' },
                  { term: previousRoundLabel, description: (block.round - 1).toString() },
                  { term: nextRoundLabel, description: (block.round + 1).toString() },
                ],
              })
            )
            const transactionsRow = getAllByRole(component.container, 'row')[1]
            expect(transactionsRow.textContent).toBe('No results.')
          }
        )
      })
    })

    describe('and has transactions', () => {
      const asset = assetResultMother['mainnet-312769']().build()
      const transactionResult1 = transactionResultMother.payment().withGroup('W3pIVuWVJlzmMDGvX8St0W/DPxslnpt6vKV8zoFb6rg=').build()
      const transactionResult2 = transactionResultMother.transfer(asset).build()
      const transactionResults = [transactionResult1, transactionResult2]
      const block = blockResultMother.blockWithTransactions(transactionResults).withTimestamp(1719284618).build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))

        const myStore = createStore()
        myStore.set(blockResultsAtom, new Map([[block.round, createReadOnlyAtomAndTimestamp(block)]]))
        myStore.set(transactionResultsAtom, new Map(transactionResults.map((x) => [x.id, createReadOnlyAtomAndTimestamp(x)])))
        myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))
        myStore.set(syncedRoundAtom, block.round + 1)

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() =>
              descriptionListAssertion({
                container: component.container,
                items: [
                  { term: roundLabel, description: block.round.toString() },
                  { term: timestampLabel, description: 'Tue, 25 June 2024 03:03:38' },
                  { term: transactionsLabel, description: '2Payment=1Asset Transfer=1' },
                  { term: previousRoundLabel, description: (block.round - 1).toString() },
                  { term: nextRoundLabel, description: (block.round + 1).toString() },
                ],
              })
            )

            const rows = getAllByRole(component.container, 'row')
            expect(rows.length).toBe(3)

            tableAssertion({
              container: component.container,
              rows: [
                {
                  cells: [
                    '',
                    ellipseId(transactionResult1.id),
                    ellipseId(transactionResult1.group),
                    ellipseAddress(transactionResult1.sender),
                    ellipseAddress(transactionResult1['payment-transaction']!.receiver),
                    'Payment',
                    (transactionResult1['payment-transaction']!.amount / 1e6).toString(),
                  ],
                },
                {
                  cells: [
                    '',
                    ellipseId(transactionResult2.id),
                    ellipseId(transactionResult2.group),
                    ellipseAddress(transactionResult2.sender),
                    ellipseAddress(transactionResult2['asset-transfer-transaction']!.receiver),
                    'Asset Transfer',
                    `${(transactionResult2['asset-transfer-transaction']!.amount as number) / 1e6}USDt`,
                  ],
                },
              ],
            })
          }
        )
      })
    })
  })
})
