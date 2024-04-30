import { indexer } from '@/features/common/data'
import { AssetResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetWithMetadataAtom } from './core'
import { Arc19Metadata, Arc3Metadata, Arc3MetadataResult, Arc69Metadata, Arc69MetadataResult, AssetWithMetadata } from '../models'
import axios from 'axios'

import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { fetchAssetResultAtomBuilder } from './asset'
import { asArc3Metadata, asArc69Metadata, asAsset } from '../mappers'
import { getArc3MetadataUrl } from '../utils/resolve-arc-3-url'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { getArc19MetadataUrl } from '../utils/get-arc-19-metadata-url'

const fetchAssetConfigTransactionResults = (assetIndex: AssetIndex) =>
  executePaginatedRequest(
    (response: TransactionSearchResults) => response.transactions,
    (nextToken) => {
      let s = indexer.searchForTransactions().txType('acfg').assetID(assetIndex)
      if (nextToken) {
        s = s.nextToken(nextToken)
      }
      return s
    }
  )

// This function get the array of ARC metadata for the asset result
// Currently, we support ARC-3, 16, 19 and 69. Their specs can be found here https://github.com/algorandfoundation/ARCs/tree/main/ARCs
// ARCs are community standard, therefore, there are edge cases
// For example:
// - An asset can follow ARC-69 and ARC-19 at the same time: https://allo.info/asset/1559471783/nft
// - An asset can follow ARC-3 and ARC-19 at the same time: https://allo.info/asset/1494117806/nft
// - ARC-19 doesn't specify the metadata format but it seems to be the same with ARC-3
const getAssetMetadata = async (assetResult: AssetResult): Promise<(Arc3Metadata | Arc19Metadata | Arc69Metadata)[]> => {
  // TODO: handle ARC-16
  const metadataArray: Array<Arc3Metadata | Arc19Metadata | Arc69Metadata> = []

  if (assetResult.params.url?.includes('#arc3') || assetResult.params.url?.includes('@arc3')) {
    // When the URL contains #arc3 or @arc3, it follows ARC-3
    // If the URL starts with template-ipfs://, it also follows ARC-19
    // If the asset follows both ARC-3 and ARC-19, we add both metadata to the array

    // TODO: for ARC3, handle Asset Metadata Hash
    const isAlsoArc19 = assetResult.params.url.startsWith('template-ipfs://')

    const metadataUrl = isAlsoArc19
      ? getArc19MetadataUrl(assetResult.params.url, assetResult.params.reserve)
      : getArc3MetadataUrl(assetResult.index, assetResult.params.url)

    if (metadataUrl) {
      const metadataResult = (await axios.get<Arc3MetadataResult>(metadataUrl)).data
      const metadata = asArc3Metadata(assetResult.index, assetResult.params.url, metadataResult)

      metadataArray.push({
        ...metadata,
        standard: 'ARC-3',
      })
      if (isAlsoArc19) {
        metadataArray.push({
          ...metadata,
          standard: 'ARC-19',
        })
      }
    }
  } else if (assetResult.params.url?.startsWith('template-ipfs://')) {
    // If the asset doesn't follow ARC-3, but the URL starts with template-ipfs://, it follows ARC-19
    // There is no specs for ARC-19 metadata, but it seems to be the same with ARC-3

    const metadataUrl = getArc19MetadataUrl(assetResult.params.url, assetResult.params.reserve)
    if (metadataUrl) {
      const metadataResult = (await axios.get<Arc3MetadataResult>(metadataUrl)).data
      const metadata = asArc3Metadata(assetResult.index, assetResult.params.url, metadataResult)

      metadataArray.push({
        ...metadata,
        standard: 'ARC-19',
      })
    }
  }
  // Check for ARC-69
  const assetConfigTransactionResults = await fetchAssetConfigTransactionResults(assetResult.index)
  const latestConfigTxn = assetConfigTransactionResults[assetConfigTransactionResults.length - 1]
  if (latestConfigTxn.note) {
    const arc69Metadata = noteToArc69Metadata(latestConfigTxn.note)
    if (arc69Metadata) {
      metadataArray.push(arc69Metadata)
    }
  }

  return metadataArray
}

const getAssetWithMetadataAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(assetMetadataAtom)
        set(assetWithMetadataAtom, (prev) => {
          return prev.set(assetIndex, assetMetadata)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetMetadataAtom = atom(async (get) => {
    const assetMetadataMap = store.get(assetWithMetadataAtom)

    const assetMetadata = assetMetadataMap.get(assetIndex)
    if (assetMetadata) {
      return assetMetadata
    }

    get(syncEffect)

    const fetchAssetResultAtom = fetchAssetResultAtomBuilder(assetIndex)
    const assetResult = await get(fetchAssetResultAtom)

    const asset = asAsset(assetResult)
    const metadata = await getAssetMetadata(assetResult)

    return {
      ...asset,
      metadata,
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

const noteToArc69Metadata = (note: string | undefined) => {
  if (!note) {
    return undefined
  }

  const json = base64ToUtf8(note)
  if (json.match(/^{/) && json.includes('arc69')) {
    const metadataResult = JSON.parse(json) as Arc69MetadataResult
    return asArc69Metadata(metadataResult)
  }
  return undefined
}
