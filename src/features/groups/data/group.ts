import { Round } from '@/features/blocks/data/types'
import { atom, Getter, useAtomValue } from 'jotai'
import { GroupId } from './types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { getGroupResultAtom } from './group-result'
import { asGroup } from '../mappers'
import { createTransactionsAtom, getTransactionResultAtoms } from '@/features/transactions/data'

export const fetchGroup = async (get: Getter, groupId: GroupId, round: Round) => {
  const groupResult = await get(getGroupResultAtom(groupId, round))
  const transactionResults = await Promise.all(getTransactionResultAtoms(groupResult.transactionIds).map((txn) => get(txn)))
  const transactions = get(createTransactionsAtom(transactionResults))
  return asGroup(groupResult, transactions)
}

const createGroupAtom = (groupId: GroupId, round: Round) => {
  return atom((get) => fetchGroup(get, groupId, round))
}

const useGroupAtom = (groupId: GroupId, round: Round) => {
  return useMemo(() => {
    return createGroupAtom(groupId, round)
  }, [round, groupId])
}

export const useLoadableGroup = (groupId: GroupId, round: Round) => {
  return useAtomValue(loadable(useGroupAtom(groupId, round)))
}
