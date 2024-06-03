import { atom } from 'jotai'
import { AccountResult, Address } from './types'
import { createAtomAndTimestamp } from '@/features/common/data'
import { atomsInAtom } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { applicationResultsAtom } from '@/features/applications/data'
import { algod } from '@/features/common/data/algo-client'

const getAccountResult = (address: Address) =>
  algod
    .accountInformation(address)
    .do()
    .then((result) => {
      return result as AccountResult
    })

const syncAssociatedDataAndReturnAccountResultAtom = atom(null, async (get, set, address: Address) => {
  const accountResult = await getAccountResult(address)
  const assetResults = get(assetResultsAtom)
  const applicationResults = get(applicationResultsAtom)

  const assetsToAdd = (accountResult['created-assets'] ?? []).filter((a) => !assetResults.has(a.index))
  if (assetsToAdd.length > 0) {
    set(assetResultsAtom, (prev) => {
      const next = new Map(prev)
      assetsToAdd.forEach((asset) => {
        if (!next.has(asset.index)) {
          next.set(asset.index, createAtomAndTimestamp(asset))
        }
      })
      return next
    })
  }
  const applicationsToAdd = (accountResult['created-apps'] ?? []).filter((a) => !applicationResults.has(a.id))
  if (applicationsToAdd.length > 0) {
    set(applicationResultsAtom, (prev) => {
      const next = new Map(prev)
      applicationsToAdd.forEach((application) => {
        if (!next.has(application.id)) {
          next.set(application.id, createAtomAndTimestamp(application))
        }
      })
      return next
    })
  }
  return accountResult
})

export const [accountResultsAtom, getAccountResultAtom] = atomsInAtom(syncAssociatedDataAndReturnAccountResultAtom, (address) => address)
