import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsWithMetadataAtom } from './core'
import { AssetWithMetadata } from '../models'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { fetchAssetResultAtomBuilder } from './asset'
import { asAsset } from '../mappers'
import { fetchAssetTransactionResultsAtomBuilder } from './asset-transaction-results'
import { fetchAssetMetadataAtomBuilder } from './asset-metadata'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'

const getAssetWithMetadataAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(assetMetadataAtom)
        set(assetsWithMetadataAtom, (prev) => {
          return prev.set(assetIndex, assetMetadata)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetMetadataAtom = atom(async (get) => {
    const assetsWithMetadata = store.get(assetsWithMetadataAtom)

    const assetWithMetadata = assetsWithMetadata.get(assetIndex)
    if (assetWithMetadata) {
      return assetWithMetadata
    }

    get(syncEffect)

    const assetResult = await get(fetchAssetResultAtomBuilder(assetIndex))
    const assetTransactionResults = await get(fetchAssetTransactionResultsAtomBuilder(store, assetIndex))
    const assetMetadata = await get(fetchAssetMetadataAtomBuilder(assetResult, assetTransactionResults))

    const asset = asAsset(assetResult)
    const transactions = await get(fetchTransactionsAtomBuilder(store, assetTransactionResults))

    return {
      ...asset,
      transactions: transactions.sort((a, b) => b.confirmedRound - a.confirmedRound),
      metadata: assetMetadata,
    } satisfies AssetWithMetadata
  })

  return assetMetadataAtom
}

export const useAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetWithMetadataAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetWithMetadataAtom(assetIndex)))
}
