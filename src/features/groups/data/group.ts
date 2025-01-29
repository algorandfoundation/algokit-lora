import { Round } from '@/features/blocks/data/types'
import { atom, useAtomValue } from 'jotai'
import { GroupId } from './types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { getGroupResultAtom } from './group-result'
import { asGroup } from '../mappers'
import { createTransactionsAtom, getTransactionResultAtoms } from '@/features/transactions/data'

const createGroupAtom = (groupId: GroupId, round: Round) => {
  return atom(async (get) => {
    const groupResult = await get(getGroupResultAtom(groupId, round))
    const transactionResults = await Promise.all(
      // Transaction IDs in the group can be the inner transaction ID
      // We need to remove the /inner/{id} part of the ID
      getTransactionResultAtoms(groupResult.transactionIds.map((id) => id.split('/')[0])).map((txn) => get(txn))
    )
    const transactions = get(createTransactionsAtom(transactionResults))
    return asGroup(groupResult, transactions)
  })
}

const useGroupAtom = (groupId: GroupId, round: Round) => {
  return useMemo(() => {
    return createGroupAtom(groupId, round)
  }, [round, groupId])
}

export const useLoadableGroup = (groupId: GroupId, round: Round) => {
  return useAtomValue(loadable(useGroupAtom(groupId, round)))
}
