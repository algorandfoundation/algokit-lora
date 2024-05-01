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
import { useAssetTransactionResultsAtom } from './asset-transaction-results'
import { fetchAssetMetadataAtomBuilder } from './asset-metadata'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'

const getAssetWithMetadataAtomBuilder = (
  store: JotaiStore,
  assetIndex: AssetIndex,
  assetTransactionResultsAtom: ReturnType<typeof useAssetTransactionResultsAtom>
) => {
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
    // TODO: work out how to sync with assets transaction results atom
    // get(syncedRoundAtom) 655061079
    const assetTransactionResults = await get(assetTransactionResultsAtom)
    const assetsWithMetadata = store.get(assetsWithMetadataAtom)

    console.log('im here')
    const assetWithMetadata = assetsWithMetadata.get(assetIndex)
    if (assetWithMetadata) {
      // TODO: consider performance, can we only sync if the asset has new transactions
      // TODO: update metadata, also be careful, only update ARC-19 and ARC-69
      const transactions = await get(fetchTransactionsAtomBuilder(store, assetTransactionResults))

      return {
        ...assetWithMetadata,
        transactions: transactions.sort((a, b) => b.confirmedRound - a.confirmedRound),
      }
    }

    get(syncEffect)

    const assetResult = await get(fetchAssetResultAtomBuilder(assetIndex))
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
  const assetsTransactionResultsAtom = useAssetTransactionResultsAtom(assetIndex)

  return useMemo(() => {
    return getAssetWithMetadataAtomBuilder(store, assetIndex, assetsTransactionResultsAtom)
  }, [store, assetIndex, assetsTransactionResultsAtom])
}

export const useLoadableAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetWithMetadataAtom(assetIndex)))
}
