import { blockResultsAtom } from '@/features/blocks/data'
import { groupResultsAtom } from '@/features/groups/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { Atom, Getter, PrimitiveAtom, Setter, useAtom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { accountResultsAtom } from '@/features/accounts/data'
import { applicationMetadataResultsAtom } from '@/features/applications/data/application-metadata'
import { applicationResultsAtom } from '@/features/applications/data'
import { assetMetadataResultsAtom, assetResultsAtom } from '@/features/assets/data'

const cleanUpIntervalMillis = 60_000 // 10 minute
const expirationMillis = 3600000 // 1 hour
// Run every 10 minutes and cleanup data that hasn't been accessed in the last 1 hour

const stateCleanupEffect = atomEffect((get, set) => {
  const cleanup = setInterval(() => {
    ;(async () => {
      const expiredTimestamp = Date.now() - expirationMillis
      const clean = createStateCleaner(get, set, expiredTimestamp)
      clean('blockResultsAtom', blockResultsAtom)
      clean('groupResultsAtom', groupResultsAtom)
      clean('transactionResultsAtom', transactionResultsAtom)
      clean('accountResultsAtom', accountResultsAtom)
      clean('applicationMetadataResultsAtom', applicationMetadataResultsAtom)
      clean('applicationResultsAtom', applicationResultsAtom)
      clean('assetMetadataResultsAtom', assetMetadataResultsAtom)
      clean('assetResultsAtom', assetResultsAtom)
    })()
  }, cleanUpIntervalMillis)

  return () => clearInterval(cleanup)
})

const createStateCleaner = (get: Getter, set: Setter, expiredTimestamp: number) => {
  return <Key extends string | number, Value>(
    name: string,
    resultsAtom: PrimitiveAtom<Map<Key, readonly [Atom<Value | Promise<Value>>, number]>>
  ) => {
    const keysToRemove: Key[] = []
    const results = get(resultsAtom)
    results.forEach(([_, timestamp], key) => {
      if (timestamp > -1 && timestamp < expiredTimestamp) {
        keysToRemove.push(key)
      }
    })
    // TODO: NC - Remove
    console.log(`${name} has ${results.size}, removing ${keysToRemove.length}`)
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
