import { atom } from 'jotai'
import { AccountResult, Address } from './types'
import { algod } from '@/features/common/data'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'
import { assetResultsAtom } from '@/features/assets/data'

const createAccountResultAtom = (address: Address) =>
  atom<Promise<AccountResult> | AccountResult>(async (_get) => {
    return await algod
      .accountInformation(address)
      .do()
      .then((result) => {
        return result as AccountResult
      })
  })

const syncAssociatedData = atom(null, async (get, set, accountResultAtom: ReturnType<typeof createAccountResultAtom>) => {
  try {
    const accountResult = await get(accountResultAtom)
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
  } catch (e) {
    // Ignore any errors as there is nothing to sync
  }
})

// TODO: NC - Propagate this pattern to the places we use AtomEffects so it's more deterministic
export const [accountResultsAtom, getAccountResultAtom] = atomsInAtom(
  createAccountResultAtom,
  (address) => address,
  new Map(),
  syncAssociatedData
)
