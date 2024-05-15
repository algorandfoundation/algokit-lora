import { Round } from '@/features/blocks/data/types'
import { atom } from 'jotai'
import { GroupId, GroupResult } from './types'
import { createBlockLinkedConceptsAtom, updateBlockLinkedEntitiesAtom } from '@/features/blocks/data'
import { invariant } from '@/utils/invariant'
import { atomEffect } from 'jotai-effect'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

const createGroupResultAtom = (groupId: GroupId, round: Round) => {
  // TODO: NC - Give this a good name
  const blockLinkedConceptsAtom = createBlockLinkedConceptsAtom(round)

  // TODO: NC - Lots of duplication. Can we name this better?
  const syncLinkedConceptsEffect = atomEffect((get, set) => {
    ;(async () => {
      const [blockResult, transactionResults, _] = await get(blockLinkedConceptsAtom).catch(() => {
        // Ignore any errors as the fetch operation has failed and we have nothing to sync
        return [null, [] as TransactionResult[], [] as GroupResult[]] as const
      })

      // Don't need to sync the group, as it's synced by atomFam due to this atom returning the group
      set(updateBlockLinkedEntitiesAtom, blockResult ? [blockResult] : [], transactionResults, [])
    })()
  })

  return atom<Promise<GroupResult> | GroupResult>(async (get) => {
    get(syncLinkedConceptsEffect)
    const [_blockResult, _transactionResults, groupResults] = await get(blockLinkedConceptsAtom)
    const group = groupResults.find((groupResult) => groupResult.id === groupId)
    invariant(group, `Group ${groupId} does not exist in block ${round}`)
    return group
  })
}

export const [groupResultsAtom, getGroupResultAtom] = atomsInAtom(createGroupResultAtom, (groupId, _round) => groupId)
