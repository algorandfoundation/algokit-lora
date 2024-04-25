import { getBlockAtomBuilder } from '@/features/blocks/data'
import { Round } from '@/features/blocks/data/types'
import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { GroupId } from './types'
import { asGroup } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'

const groupAtomBuilder = (store: JotaiStore, round: Round, id: GroupId) => {
  return atom(async (get) => {
    const block = await get(getBlockAtomBuilder(store, round))
    return asGroup(
      id,
      block.transactions.filter((t) => t.group === id)
    )
  })
}

const useGroupAtom = (round: Round, id: GroupId) => {
  const store = useStore()

  return useMemo(() => {
    return groupAtomBuilder(store, round, id)
  }, [store, round, id])
}

export const useLoadableGroup = (round: Round, id: GroupId) => {
  return useAtomValue(loadable(useGroupAtom(round, id)))
}
