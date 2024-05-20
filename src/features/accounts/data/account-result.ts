import { atom } from 'jotai'
import { AccountResult, Address } from './types'
import { algod } from '@/features/common/data'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'
import { assetResultsAtom } from '@/features/assets/data'

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

  const assetsToAdd = (accountResult['created-assets'] ?? []).filter((a) => !assetResults.has(a.index))
  if (assetsToAdd.length > 0) {
    set(assetResultsAtom, (prev) => {
      const next = new Map(prev)
      assetsToAdd.forEach((asset) => {
        if (!next.has(asset.index)) {
          next.set(asset.index, atom(asset))
        }
      })
      return next
    })
  }

  return accountResult
})

export const [accountResultsAtom, getAccountResultAtom] = atomsInAtom(syncAssociatedDataAndReturnAccountResultAtom, (address) => address)
