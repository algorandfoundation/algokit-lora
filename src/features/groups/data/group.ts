import { Round } from '@/features/blocks/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { GroupId } from './types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { JotaiStore } from '@/features/common/data/types'
import { getGroupResultAtom } from './group-result'
import { asGroup } from '../mappers'
import { createTransactionsAtom, getTransactionResultAtoms } from '@/features/transactions/data'

const createGroupAtom = (store: JotaiStore, groupId: GroupId, round: Round) => {
  return atom(async (get) => {
    const groupResult = await get(getGroupResultAtom(store, groupId, round))
    const transactionResults = await Promise.all(getTransactionResultAtoms(store, groupResult.transactionIds).map((txn) => get(txn)))
    const transactions = await get(createTransactionsAtom(store, transactionResults))
    return asGroup(groupResult, transactions)
  })
}

const useGroupAtom = (groupId: GroupId, round: Round) => {
  const store = useStore()
  return useMemo(() => {
    return createGroupAtom(store, groupId, round)
  }, [store, round, groupId])
}

export const useLoadableGroup = (groupId: GroupId, round: Round) => {
  return useAtomValue(loadable(useGroupAtom(groupId, round)))
}
