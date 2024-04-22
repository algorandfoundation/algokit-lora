import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { BlockResult, Round } from './types'
import { blocksAtom, syncedRoundAtom } from '.'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { fetchTransactionsAtomBuilder, fetchTransactionsModelAtomBuilder, transactionsAtom } from '@/features/transactions/data'
import { asBlockDetails } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'

const nextRoundAvailableAtomBuilder = (store: JotaiStore, round: Round) => {
  // This atom conditionally subscribes to updates on the syncedRoundAtom
  return atom((get) => {
    const syncedRoundSnapshot = store.get(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot && round >= syncedRoundSnapshot ? get(syncedRoundAtom) : syncedRoundSnapshot
    return syncedRound ? syncedRound > round : true
  })
}

const fetchBlockAtomBuilder = (round: Round) => {
  return atom(async (_get) => {
    return await indexer
      .lookupBlock(round)
      .do()
      .then((result) => {
        return [
          {
            round: result.round as number,
            timestamp: new Date(result.timestamp * 1000).toISOString(),
            transactionIds: result.transactions?.map((t: TransactionResult) => t.id) ?? [],
          } as BlockResult,
          (result.transactions ?? []) as TransactionResult[],
        ] as const
      })
  })
}

const getBlockDetailsAtomBuilder = (store: JotaiStore, round: Round) => {
  const fetchBlockAtom = fetchBlockAtomBuilder(round)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const [block, transactions] = await get(fetchBlockAtom)

        if (transactions && transactions.length > 0) {
          set(transactionsAtom, (prev) => {
            return new Map([...prev, ...transactions.map((t: TransactionResult) => [t.id, t] as const)])
          })
        }

        set(blocksAtom, (prev) => {
          return new Map([...prev, [block.round, block]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const blocks = store.get(blocksAtom)
    const cachedBlock = blocks.get(round)
    const nextRoundAvailable = get(nextRoundAvailableAtomBuilder(store, round))
    if (cachedBlock) {
      const transactions = await get(
        fetchTransactionsModelAtomBuilder(store, fetchTransactionsAtomBuilder(store, cachedBlock.transactionIds))
      )
      return asBlockDetails(cachedBlock, transactions, nextRoundAvailable)
    }

    get(syncEffect)

    const [fetchedBlock, fetchedBlockTransactions] = await get(fetchBlockAtom)
    const transactions = await get(fetchTransactionsModelAtomBuilder(store, fetchedBlockTransactions))
    return asBlockDetails(fetchedBlock, transactions, nextRoundAvailable)
  })
}

const useBlockDetailsAtom = (round: Round) => {
  const store = useStore()

  return useMemo(() => {
    return getBlockDetailsAtomBuilder(store, round)
  }, [store, round])
}

export const useLoadableBlockDetails = (round: Round) => {
  return useAtomValue(loadable(useBlockDetailsAtom(round)))
}
