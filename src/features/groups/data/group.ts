import { Round } from '@/features/blocks/data/types'
import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { GroupId, GroupResult } from './types'
import { asGroup } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { atomEffect } from 'jotai-effect'
import { fetchTransactionResultsAtomBuilder, fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { groupsAtom } from './core'

const fetchGroupResultAtomBuilder = (round: Round, id: GroupId) => {
  return atom(async (_get) => {
    return await indexer
      .lookupBlock(round)
      .do()
      .then((result) => {
        const transactionResults: TransactionResult[] = (result.transactions ?? []).filter((t: TransactionResult) => t.group === id)
        return [
          {
            id: id,
            round: result.round as number,
            timestamp: new Date(result.timestamp * 1000).toISOString(),
            transactionIds: transactionResults.map((t) => t.id) ?? [],
          } as GroupResult,
          transactionResults,
        ] as const
      })
  })
}

const getGroupAtomBuilder = (store: JotaiStore, round: Round, id: GroupId) => {
  const fetchGroupResultAtom = fetchGroupResultAtomBuilder(round, id)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const [groupResult, transactionResults] = await get(fetchGroupResultAtom)

        if (transactionResults.length > 0) {
          set(transactionResultsAtom, (prev) => {
            transactionResults.forEach((t) => {
              prev.set(t.id, t)
            })
            return prev
          })
        }

        set(groupsAtom, (prev) => {
          return prev.set(groupResult.id, groupResult)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const groups = store.get(groupsAtom)
    const cachedGroupResult = groups.get(id)
    if (cachedGroupResult) {
      const transactions = await get(
        fetchTransactionsAtomBuilder(store, fetchTransactionResultsAtomBuilder(store, cachedGroupResult.transactionIds))
      )
      return asGroup(cachedGroupResult, transactions)
    }

    get(syncEffect)

    const [groupResult, transactionResults] = await get(fetchGroupResultAtom)
    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))
    return asGroup(groupResult, transactions)
  })
}

const useGroupAtom = (round: Round, id: GroupId) => {
  const store = useStore()

  return useMemo(() => {
    return getGroupAtomBuilder(store, round, id)
  }, [store, round, id])
}

export const useLoadableGroup = (round: Round, id: GroupId) => {
  return useAtomValue(loadable(useGroupAtom(round, id)))
}
