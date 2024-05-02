import { indexer } from '@/features/common/data'
import { AssetLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetResultsAtom } from './core'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { asAssetSummary } from '../mappers'
import { AssetIndex } from './types'

export const fetchAssetResultAtomBuilder = (assetIndex: AssetIndex) =>
  atom(async (_get) => {
    return await indexer
      .lookupAssetByID(assetIndex)
      .includeAll(true)
      .do()
      .then((result) => {
        return (result as AssetLookupResult).asset
      })
  })

export const getAssetResultAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, noCache?: boolean) => {
  const fetchAssetResultAtom = fetchAssetResultAtomBuilder(assetIndex)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetResult = await get(fetchAssetResultAtom)
        set(assetResultsAtom, (prev) => {
          return prev.set(assetResult.index, assetResult)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const assetResults = store.get(assetResultsAtom)
    const cachedAssetResult = assetResults.get(assetIndex)
    if (cachedAssetResult && !noCache) {
      return cachedAssetResult
    }

    get(syncEffect)

    const assetResult = await get(fetchAssetResultAtom)
    return assetResult
  })
}

export const getAssetSummaryAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex))
    return asAssetSummary(assetResult)
  })
}

export const getAssetSummariesAtomBuilder = (store: JotaiStore, assetIndexes: AssetIndex[]) => {
  return atom((get) => {
    return Promise.all(assetIndexes.map((assetIndex) => get(getAssetSummaryAtomBuilder(store, assetIndex))))
  })
}

export const useAssetSummaryAtom = (assetIndex: AssetIndex) => {
  const store = useStore()
  return useMemo(() => {
    return getAssetSummaryAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAssetSummary = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetSummaryAtom(assetIndex)))
}
