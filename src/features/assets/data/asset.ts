import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsAtom } from './core'
import { Asset } from '../models'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { getAssetResultAtomBuilder } from './asset-summary'
import { asAssetSummary } from '../mappers'
import { getAssetAssetConfigTransactionResultsAtomBuilder } from './asset-asset-config-transaction-results'
import { getAssetMetadata } from '../utils/get-asset-metadata'

const getAssetAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const asset = await get(assetAtom)

        set(assetsAtom, (prev) => {
          return new Map([...prev, [assetIndex, asset]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetAtom = atom(async (get) => {
    // This is tricky, for asset with a lot of transactions, this takes too long
    // If we do pagination by the table, we won't be able to refresh
    const assetAssetConfigTransactionResults = await get(getAssetAssetConfigTransactionResultsAtomBuilder(assetIndex))
    const assets = store.get(assetsAtom)
    const latestRound = assetAssetConfigTransactionResults[assetAssetConfigTransactionResults.length - 1]['confirmed-round']!
    let ignoreCache = false

    const cachedAsset = assets.get(assetIndex)
    if (cachedAsset) {
      if (cachedAsset.validRound === latestRound) {
        return cachedAsset
      } else {
        // If there are new asset config transactions, we need to fetch the asset again
        ignoreCache = true
      }
    }

    get(syncEffect)

    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex, ignoreCache))
    const assetMetadata =
      !cachedAsset || ignoreCache ? await getAssetMetadata(assetResult, assetAssetConfigTransactionResults) : cachedAsset.metadata

    const asset = asAssetSummary(assetResult)

    return {
      ...asset,
      validRound: latestRound,
      metadata: assetMetadata,
    } satisfies Asset
  })

  return assetAtom
}

export const useAssetAtom = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetAtomBuilder(store, assetIndex)
  }, [assetIndex, store])
}

export const useLoadableAssetAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetAtom(assetIndex)))
}
