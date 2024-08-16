import { Round } from '@/features/blocks/data/types'
import { Getter, Setter } from 'jotai'
import { GroupId } from './types'
import { addStateExtractedFromBlocksAtom, getBlockAndExtractData } from '@/features/blocks/data'
import { invariant } from '@/utils/invariant'
import { readOnlyAtomCache } from '@/features/common/data'

const syncAssociatedDataAndReturnGroupResult = async (_: Getter, set: Setter, groupId: GroupId, round: Round) => {
  const [blockResult, transactionResults, groupResults] = await getBlockAndExtractData(round)

  const groupIndex = groupResults.findIndex((groupResult) => groupResult.id === groupId)
  invariant(groupIndex !== -1, `Group ${groupId} does not exist in block ${round}`)
  const [group] = groupResults.splice(groupIndex, 1)

  // Don't need to sync the group (hence the splice), as it's synced by atomsInAtom, due to this atom returning the group
  set(addStateExtractedFromBlocksAtom, [blockResult], transactionResults, groupResults)

  return group
}

export const [groupResultsAtom, getGroupResultAtom] = readOnlyAtomCache(
  syncAssociatedDataAndReturnGroupResult,
  (groupId, _round) => groupId
)
