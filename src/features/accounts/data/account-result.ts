import { Getter, Setter } from 'jotai'
import { AccountResult, Address } from './types'
import { createReadOnlyAtomAndTimestamp, readOnlyAtomCache } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { applicationResultsAtom } from '@/features/applications/data'
import { algod } from '@/features/common/data/algo-client'
import { asError, is400 } from '@/utils/error'

const getAccountResult = async (address: Address): Promise<AccountResult> => {
  try {
    const result = await algod.accountInformation(address)
    return {
      ...result,
      address: result.address.toString(),
    }
  } catch (e: unknown) {
    const error = asError(e)
    if (is400(error) && error.message.toLowerCase().includes('result limit exceeded')) {
      // Exclude asset and application data, as the account exceeds the limit which prevents it from loading
      const result = await algod.accountInformation(address, { exclude: 'all' })
      return {
        ...result,
        address: result.address.toString(),
      }
    }
    throw e
  }
}

const syncAssociatedDataAndReturnAccountResult = async (get: Getter, set: Setter, address: Address) => {
  const accountResult = await getAccountResult(address)
  const assetResults = get(assetResultsAtom)
  const applicationResults = get(applicationResultsAtom)

  const assetsToAdd = (accountResult.createdAssets ?? []).filter((a) => !assetResults.has(a.id))
  if (assetsToAdd.length > 0) {
    set(assetResultsAtom, (prev) => {
      const next = new Map(prev)
      assetsToAdd.forEach((asset) => {
        if (!next.has(asset.id)) {
          next.set(asset.id, createReadOnlyAtomAndTimestamp(asset))
        }
      })
      return next
    })
  }
  const applicationsToAdd = (accountResult.createdApps ?? []).filter((a) => !applicationResults.has(a.id))
  if (applicationsToAdd.length > 0) {
    set(applicationResultsAtom, (prev) => {
      const next = new Map(prev)
      applicationsToAdd.forEach((application) => {
        if (!next.has(application.id)) {
          next.set(application.id, createReadOnlyAtomAndTimestamp(application))
        }
      })
      return next
    })
  }
  return accountResult
}

const keySelector = (address: Address) => address

export const [accountResultsAtom, getAccountResultAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<AccountResult> | AccountResult
>(syncAssociatedDataAndReturnAccountResult, keySelector)
