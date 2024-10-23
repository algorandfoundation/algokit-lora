import { blockResultsAtom } from '@/features/blocks/data'
import { groupResultsAtom } from '@/features/groups/data'
import { latestTransactionIdsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { Getter, PrimitiveAtom, Setter, useAtom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { accountResultsAtom } from '@/features/accounts/data'
import { applicationMetadataResultsAtom } from '@/features/applications/data/application-metadata'
import { applicationResultsAtom } from '@/features/applications/data'
import { assetMetadataResultsAtom, assetResultsAtom } from '@/features/assets/data'
import { forwardNfdResultsAtom, reverseNfdsAtom } from '@/features/nfd/data'

const cleanUpIntervalMillis = 600_000 // 10 minutes
export const cachedDataExpirationMillis = 1_800_000 // 30 minutes
// Run every 10 minutes and cleanup data that hasn't been accessed in the last 30 minutes

const stateCleanupEffect = atomEffect((get, set) => {
  const cleanup = setInterval(() => {
    const expiredTimestamp = Date.now() - cachedDataExpirationMillis

    const removeExpired = createExpiredDataRemover(get, set, expiredTimestamp)
    set(latestTransactionIdsAtom, (prev) => {
      const next = prev.filter(([_, timestamp]) => timestamp > expiredTimestamp)
      if (prev.length !== next.length) {
        return next
      }
      return prev
    })
    removeExpired(blockResultsAtom)
    removeExpired(groupResultsAtom)
    removeExpired(transactionResultsAtom)
    removeExpired(accountResultsAtom)
    removeExpired(applicationMetadataResultsAtom)
    removeExpired(applicationResultsAtom)
    removeExpired(assetMetadataResultsAtom)
    removeExpired(assetResultsAtom)
    removeExpired(forwardNfdResultsAtom)
    removeExpired(reverseNfdsAtom)
  }, cleanUpIntervalMillis)

  return () => clearInterval(cleanup)
})

const createExpiredDataRemover = (get: Getter, set: Setter, expiredTimestamp: number) => {
  return <Key extends string | number, Value>(resultsAtom: PrimitiveAtom<Map<Key, readonly [Value, number]>>) => {
    const keysToRemove: Key[] = []
    const results = get(resultsAtom)
    results.forEach(([_, timestamp], key) => {
      if (timestamp > -1 && timestamp < expiredTimestamp) {
        keysToRemove.push(key)
      }
    })
    if (keysToRemove.length > 0) {
      set(resultsAtom, (prev) => {
        const next = new Map(prev)
        keysToRemove.forEach((key) => {
          next.delete(key)
        })
        return next
      })
    }
  }
}

export const useStateCleanupEffect = () => {
  useAtom(stateCleanupEffect)
}
