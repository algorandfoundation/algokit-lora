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
import {
  nextRoundLabel,
  previousRoundLabel,
  proposerLabel,
  roundLabel,
  timestampLabel,
  transactionsLabel,
} from '../components/block-details'
import { transactionResultsAtom } from '@/features/transactions/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { assetResultsAtom } from '@/features/assets/data'
import { indexer } from '@/features/common/data/algo-client'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { NO_RESULTS_TABLE_MESSAGE } from '@/features/common/constants'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    indexer: {
      lookupBlock: vi.fn().mockResolvedValue({}),
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
      vi.mocked(indexer.lookupBlock).mockRejectedValue(new HttpError('boom', 404))

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
      vi.mocked(indexer.lookupBlock).mockRejectedValue({})

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
      const block = blockResultMother.blockWithoutTransactions().withRound(12345n).withTimestamp(1719284618).build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blockResultsAtom, new Map([[block.round, createReadOnlyAtomAndTimestamp(block)]]))
        myStore.set(syncedRoundAtom, block.round + 1n)

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
                  { term: previousRoundLabel, description: (block.round - 1n).toString() },
                  { term: nextRoundLabel, description: (block.round + 1n).toString() },
                ],
              })
            )
            const transactionsRow = getAllByRole(component.container, 'row')[1]
            expect(transactionsRow.textContent).toBe(NO_RESULTS_TABLE_MESSAGE)
          }
        )
      })
    })

    describe('and has a proposer', () => {
      const block = blockResultMother.blockWithoutTransactions().withRound(1644n).withTimestamp(1724943091).build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))
        const myStore = createStore()
        myStore.set(blockResultsAtom, new Map([[block.round, createReadOnlyAtomAndTimestamp(block)]]))
        myStore.set(syncedRoundAtom, block.round + 1n)

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() =>
              descriptionListAssertion({
                container: component.container,
                items: [
                  { term: roundLabel, description: block.round.toString() },
                  { term: timestampLabel, description: 'Thu, 29 August 2024 14:51:31' },
                  { term: transactionsLabel, description: '0' },
                  { term: previousRoundLabel, description: (block.round - 1n).toString() },
                  { term: nextRoundLabel, description: (block.round + 1n).toString() },
                  { term: proposerLabel, description: block.proposer ?? '' },
                ],
              })
            )
            const transactionsRow = getAllByRole(component.container, 'row')[1]
            expect(transactionsRow.textContent).toBe(NO_RESULTS_TABLE_MESSAGE)
          }
        )
      })
    })

    describe('and has transactions', () => {
      const asset = assetResultMother['mainnet-312769']().build()
      const transactionResult1 = transactionResultMother
        .payment()
        .withGroup(base64ToBytes('W3pIVuWVJlzmMDGvX8St0W/DPxslnpt6vKV8zoFb6rg='))
        .build()
      const transactionResult2 = transactionResultMother.transfer(asset).build()
      const transactionResults = [transactionResult1, transactionResult2]
      const block = blockResultMother.blockWithTransactions(transactionResults).withTimestamp(1719284618).build()

      it('should be rendered with the correct data', () => {
        vi.mocked(useParams).mockImplementation(() => ({ round: block.round.toString() }))

        const myStore = createStore()
        myStore.set(blockResultsAtom, new Map([[block.round, createReadOnlyAtomAndTimestamp(block)]]))
        myStore.set(transactionResultsAtom, new Map(transactionResults.map((t) => [t.id, createReadOnlyAtomAndTimestamp(t)])))
        myStore.set(assetResultsAtom, new Map([[asset.id, createReadOnlyAtomAndTimestamp(asset)]]))
        myStore.set(syncedRoundAtom, block.round + 1n)

        return executeComponentTest(
          () => render(<BlockPage />, undefined, myStore),
          async (component) => {
            await waitFor(() =>
              descriptionListAssertion({
                container: component.container,
                items: [
                  { term: roundLabel, description: block.round.toString() },
                  { term: timestampLabel, description: 'Tue, 25 June 2024 03:03:38' },
                  { term: transactionsLabel, description: '2Asset Transfer=1Payment=1' },
                  { term: previousRoundLabel, description: (block.round - 1n).toString() },
                  { term: nextRoundLabel, description: (block.round + 1n).toString() },
                ],
              })
            )

            const rows = getAllByRole(component.container, 'row')
            expect(rows.length).toBe(3)

            await tableAssertion({
              container: component.container,
              rows: [
                {
                  cells: [
                    '',
                    ellipseId(transactionResult1.id),
                    ellipseId(transactionResult1.group ? uint8ArrayToBase64(transactionResult1.group) : undefined),
                    ellipseAddress(transactionResult1.sender),
                    ellipseAddress(transactionResult1.paymentTransaction?.receiver),
                    'Payment',
                    (Number(transactionResult1.paymentTransaction!.amount) / 1e6).toString(),
                  ],
                },
                {
                  cells: [
                    '',
                    ellipseId(transactionResult2.id),
                    ellipseId(transactionResult2.group ? uint8ArrayToBase64(transactionResult2.group) : undefined),
                    ellipseAddress(transactionResult2.sender),
                    ellipseAddress(transactionResult2.assetTransferTransaction?.receiver),
                    'Asset Transfer',
                    `${Number(transactionResult2.assetTransferTransaction!.amount) / 1e6}USDt`,
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
