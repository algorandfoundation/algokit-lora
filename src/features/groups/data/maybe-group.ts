import { atom, useAtomValue } from 'jotai/index'
import { fetchGroup } from '@/features/groups/data/group'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { GroupId } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'

const createMaybeGroupDataAtom = (round: Round, groupId?: GroupId) => {
  return atom(async (get) => {
    const group = groupId ? await fetchGroup(get, groupId, round) : undefined

    return {
      group,
    }
  })
}

const useMaybeGroupDataAtom = (round: Round, groupId?: GroupId) => {
  return useMemo(() => createMaybeGroupDataAtom(round, groupId), [round, groupId])
}

export const useLoadableMaybeGroup = (round: Round, groupId?: GroupId) => {
  return useAtomValue(loadable(useMaybeGroupDataAtom(round, groupId)))
}
