import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { fetchTransactionResultsAtomBuilder, fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { asBlock } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { blocksAtom, syncedRoundAtom } from './core'
import { BlockResult, Round } from './types'

const nextRoundAvailableAtomBuilder = (store: JotaiStore, round: Round) => {
  // This atom conditionally subscribes to updates on the syncedRoundAtom
  return atom((get) => {
    const syncedRoundSnapshot = store.get(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot && round >= syncedRoundSnapshot ? get(syncedRoundAtom) : syncedRoundSnapshot
    return syncedRound ? syncedRound > round : true
  })
}

const fetchBlockResultAtomBuilder = (round: Round) => {
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

const getBlockAtomBuilder = (store: JotaiStore, round: Round) => {
  const fetchBlockResultAtom = fetchBlockResultAtomBuilder(round)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const [blockResult, transactionResults] = await get(fetchBlockResultAtom)

        if (transactionResults && transactionResults.length > 0) {
          set(transactionResultsAtom, (prev) => {
            transactionResults.forEach((t) => {
              prev.set(t.id, t)
            })
            return prev
          })
        }

        set(blocksAtom, (prev) => {
          return prev.set(blockResult.round, blockResult)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const blocks = store.get(blocksAtom)
    const cachedBlockResult = blocks.get(round)
    const nextRoundAvailable = get(nextRoundAvailableAtomBuilder(store, round))
    if (cachedBlockResult) {
      const transactions = await get(
        fetchTransactionsAtomBuilder(store, fetchTransactionResultsAtomBuilder(store, cachedBlockResult.transactionIds))
      )
      return asBlock(cachedBlockResult, transactions, nextRoundAvailable)
    }

    get(syncEffect)

    const [blockResult, transactionResults] = await get(fetchBlockResultAtom)
    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))
    return asBlock(blockResult, transactions, nextRoundAvailable)
  })
}

const useBlockAtom = (round: Round) => {
  const store = useStore()

  return useMemo(() => {
    return getBlockAtomBuilder(store, round)
  }, [store, round])
}

export const useLoadableBlock = (round: Round) => {
  return useAtomValue(loadable(useBlockAtom(round)))
}
