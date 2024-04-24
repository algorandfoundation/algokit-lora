import { executeComponentTest } from '@/tests/test-component'
import { getAllByRole, getByRole, queryAllByRole, render, waitFor } from '@/tests/testing-library'
import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { ExplorePage } from './explore-page'
import { latestBlocksTitle } from '@/features/blocks/components/latest-blocks'
import { latestTransactionsTitle } from '@/features/transactions/components/latest-transactions'
import { blocksAtom, syncedRoundAtom } from '@/features/blocks/data/core'
import { blockResultMother } from '@/tests/object-mother/block-result'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from '@/features/blocks/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionId } from '@/features/transactions/data/types'
import { randomNumberBetween } from '@makerx/ts-dossier'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'

describe('explore-page', () => {
  describe('when no blocks are available', () => {
    const myStore = createStore()

    it('no latest blocks are displayed', () => {
      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestBlocks = getByRole(component.container, 'heading', { name: latestBlocksTitle })
            expect(latestBlocks).toBeDefined()
            return latestBlocks.parentElement!
          })
          expect(queryAllByRole(container, 'link')).toEqual([])
        }
      )
    })

    it('no latest transactions are displayed', () => {
      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestTransactions = getByRole(component.container, 'heading', { name: latestTransactionsTitle })
            expect(latestTransactions).toBeDefined()
            return latestTransactions.parentElement!
          })
          expect(queryAllByRole(container, 'link')).toEqual([])
        }
      )
    })
  })

  describe('when a small number of blocks have been processed', () => {
    const transactionResult1 = transactionResultMother.payment().withGroup('W3pIVuWVJlzmMDGvX8St0W/DPxslnpt6vKV8zoFb6rg=').build()
    const transactionResults = [transactionResult1]
    const block = blockResultMother.blockWithTransactions(transactionResults).withTimestamp('2024-02-29T06:52:01Z').build()
    const myStore = createStore()
    myStore.set(blocksAtom, new Map([[block.round, block]]))
    myStore.set(transactionResultsAtom, new Map(transactionResults.map((x) => [x.id, x])))
    myStore.set(syncedRoundAtom, block.round)

    it('the processed blocks are displayed', () => {
      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestBlocks = getByRole(component.container, 'heading', { name: latestBlocksTitle })
            expect(latestBlocks).toBeDefined()
            return latestBlocks.parentElement!
          })
          const blockCards = getAllByRole(container, 'link')
          expect(blockCards.length).toBe(1)
          const blockCard1 = blockCards[0]
          expect(getByRole(blockCard1, 'heading').textContent).toBe(block.round.toString())
          expect(blockCard1.textContent).toContain('1 transaction')
          expect(blockCard1.textContent).toContain('Thu, 29 February 2024 06:52:011')
        }
      )
    })

    it('the available transactions are displayed', () => {
      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestTransactions = getByRole(component.container, 'heading', { name: latestTransactionsTitle })
            expect(latestTransactions).toBeDefined()
            return latestTransactions.parentElement!
          })
          const transactionCards = getAllByRole(container, 'link')
          expect(transactionCards.length).toBe(transactionResults.length)
          const transactionCard1 = transactionCards[0]
          expect(getByRole(transactionCard1, 'heading').textContent).toBe(ellipseId(transactionResult1.id))
          expect(transactionCard1.textContent).toContain(`From:${ellipseAddress(transactionResult1.sender)}`)
          expect(transactionCard1.textContent).toContain(`To:${ellipseAddress(transactionResult1.receiver)}`)
          expect(transactionCards[0].textContent).toContain('Payment')
        }
      )
    })
  })

  describe('when a large number of blocks have been processed', () => {
    const data = Array.from({ length: randomNumberBetween(6, 100) }, () => {
      const transactions = Array.from({ length: randomNumberBetween(10, 100) }, () => {
        return transactionResultMother.payment().build()
      })
      const block = blockResultMother.blockWithTransactions(transactions).build()
      return [block, transactions] as const
    }).reduce(
      (acc, [block, transactions]) => {
        return {
          syncedRound: block.round > acc.syncedRound ? block.round : acc.syncedRound,
          blocks: new Map([...acc.blocks, [block.round, block]]),
          transactions: new Map([...acc.transactions, ...transactions.map((t) => [t.id, t] as const)]),
        }
      },
      {
        syncedRound: 0,
        blocks: new Map<Round, BlockResult>(),
        transactions: new Map<TransactionId, TransactionResult>(),
      }
    )

    it('only the latest 5 blocks are displayed', () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, data.transactions)
      myStore.set(blocksAtom, data.blocks)
      myStore.set(syncedRoundAtom, data.syncedRound)

      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestBlocks = getByRole(component.container, 'heading', { name: latestBlocksTitle })
            expect(latestBlocks).toBeDefined()
            return latestBlocks.parentElement!
          })
          expect(data.blocks.size).toBeGreaterThan(5)
          const blockCards = getAllByRole(container, 'link')
          expect(blockCards.length).toBe(5)
        }
      )
    })

    it('the latest 50 transactions are displayed', () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, data.transactions)
      myStore.set(blocksAtom, data.blocks)
      myStore.set(syncedRoundAtom, data.syncedRound)

      return executeComponentTest(
        () => render(<ExplorePage />, undefined, myStore),
        async (component) => {
          const container = await waitFor(() => {
            const latestTransactions = getByRole(component.container, 'heading', { name: latestTransactionsTitle })
            expect(latestTransactions).toBeDefined()
            return latestTransactions.parentElement!
          })
          expect(data.transactions.size).toBeGreaterThan(50)
          const transactionCards = getAllByRole(container, 'link')
          expect(transactionCards.length).toBe(50)
        }
      )
    })
  })
})
