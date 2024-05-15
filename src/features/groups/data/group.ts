import { Round } from '@/features/blocks/data/types'
import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { GroupId } from './types'
import { asGroup } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { getTransactionResultsAtom, createTransactionsAtom } from '@/features/transactions/data'
import { groupResultsAtom } from './core'
import { fetchBlockResultAtomBuilder, syncBlockAtomEffectBuilder } from '@/features/blocks/data'
import { invariant } from '@/utils/invariant'

const fetchGroupResultAtomBuilder = (fetchBlockResultAtom: ReturnType<typeof fetchBlockResultAtomBuilder>, groupId: GroupId) => {
  return atom(async (get) => {
    const [blockResult, transactionResults, groupResults] = await get(fetchBlockResultAtom)
    const groupResult = groupResults.get(groupId)
    invariant(groupResult, `Transaction group ${groupId} not found in round ${blockResult.round}`)
    const groupTransactions = transactionResults.filter((t) => t.group === groupResult.id)
    return [groupResult, groupTransactions] as const
  })
}

const getGroupAtomBuilder = (store: JotaiStore, round: Round, groupId: GroupId) => {
  const fetchBlockResultAtom = fetchBlockResultAtomBuilder(round)
  const fetchGroupResultAtom = fetchGroupResultAtomBuilder(fetchBlockResultAtom, groupId)
  const syncEffect = syncBlockAtomEffectBuilder(fetchBlockResultAtom)

  return atom(async (get) => {
    const groupResults = store.get(groupResultsAtom)
    const cachedGroupResult = groupResults.get(groupId)
    if (cachedGroupResult) {
      const transactions = await get(createTransactionsAtom(store, getTransactionResultsAtom(store, cachedGroupResult.transactionIds)))
      return asGroup(cachedGroupResult, transactions)
    }

    get(syncEffect)

    const [groupResult, transactionResults] = await get(fetchGroupResultAtom)
    const transactions = await get(createTransactionsAtom(store, transactionResults))
    return asGroup(groupResult, transactions)
  })
}

const useGroupAtom = (round: Round, groupId: GroupId) => {
  const store = useStore()

  return useMemo(() => {
    return getGroupAtomBuilder(store, round, groupId)
  }, [store, round, groupId])
}

export const useLoadableGroup = (round: Round, groupId: GroupId) => {
  return useAtomValue(loadable(useGroupAtom(round, groupId)))
}
