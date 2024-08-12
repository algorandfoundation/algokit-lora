import { atom } from 'jotai'
import { AccountResult, Address } from './types'
import { atomsInAtomV4, createPromiseAtomAndTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { applicationResultsAtom } from '@/features/applications/data'
import { algod } from '@/features/common/data/algo-client'
import { asError, is400 } from '@/utils/error'

const getAccountResult = async (address: Address) => {
  try {
    return await algod
      .accountInformation(address)
      .do()
      .then((result) => {
        return result as AccountResult
      })
  } catch (e: unknown) {
    const error = asError(e)
    if (is400(error) && error.message.toLowerCase().includes('result limit exceeded')) {
      // Exclude asset and application data, as the account exceeds the limit which prevents it from loading
      return await algod
        .accountInformation(address)
        .exclude('all')
        .do()
        .then((result) => {
          return result as AccountResult
        })
    }
    throw e
  }
}

// TODO: I think this type is wrong
const syncAssociatedDataAndReturnAccountResultAtom = atom(null, (get, set, address: Address) => {
  return atom(async () => {
    const accountResult = await getAccountResult(address)
    const assetResults = get(assetResultsAtom)
    const applicationResults = get(applicationResultsAtom)

    const assetsToAdd = (accountResult['created-assets'] ?? []).filter((a) => !assetResults.has(a.index))
    if (assetsToAdd.length > 0) {
      set(assetResultsAtom, (prev) => {
        const next = new Map(prev)
        assetsToAdd.forEach((asset) => {
          if (!next.has(asset.index)) {
            next.set(asset.index, createPromiseAtomAndTimestamp(asset))
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
            next.set(application.id, createPromiseAtomAndTimestamp(application))
          }
        })
        return next
      })
    }
    return accountResult
  })
})

export const [accountResultsAtom, getAccountResultAtom] = atomsInAtomV4(syncAssociatedDataAndReturnAccountResultAtom, (address) => address)
