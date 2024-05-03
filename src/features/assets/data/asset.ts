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
import { getAssetTransactionResultsAtomBuilder } from './asset-transaction-results'
import { getAssetMetadata } from '../utils/get-asset-metadata'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'

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
    const assetTransactionResults = await get(getAssetTransactionResultsAtomBuilder(store, assetIndex))
    const assets = store.get(assetsAtom)
    let noCache = false

    const cachedAsset = assets.get(assetIndex)
    if (cachedAsset) {
      if (cachedAsset.validRound === assetTransactionResults[assetTransactionResults.length - 1].confirmedRound) {
        return cachedAsset
      }

      if (assetTransactionResults.some((t) => t['confirmed-round']! > cachedAsset.validRound && t['tx-type'] === 'acfg')) {
        // If there are new asset config transactions, we need to fetch the asset again
        noCache = true
      }
    }

    get(syncEffect)

    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex, noCache))
    const assetMetadata = !cachedAsset || noCache ? await getAssetMetadata(assetResult, assetTransactionResults) : cachedAsset.metadata

    const asset = asAssetSummary(assetResult)
    const transactions = (await get(fetchTransactionsAtomBuilder(store, assetTransactionResults))).sort(
      (a, b) => b.confirmedRound - a.confirmedRound
    )

    return {
      ...asset,
      validRound: transactions[0].confirmedRound,
      transactions: transactions,
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
