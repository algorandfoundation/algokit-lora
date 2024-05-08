import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { asArc3Metadata, asArc69Metadata } from './asset-summary'
import { Arc3Metadata, Arc19Metadata, Arc69Metadata, Arc3MetadataResult, Arc69MetadataResult, AssetStandard } from '../models'
import { getArc19Url } from '../utils/get-arc-19-url'
import { getArc3Url } from '../utils/get-arc-3-url'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

// This atom returns the array of ARC metadata for the asset result
// Currently, we support ARC-3, 16, 19 and 69. Their specs can be found here https://github.com/algorandfoundation/ARCs/tree/main/ARCs
// ARCs are community standard, therefore, there are edge cases
// For example:
// - An asset can follow ARC-69 and ARC-19 at the same time: https://allo.info/asset/1559471783/nft
// - An asset can follow ARC-3 and ARC-19 at the same time: https://allo.info/asset/1494117806/nft
// - ARC-19 doesn't specify the metadata format but it seems to be the same with ARC-3
export const asAssetMetadata = async (assetResult: AssetResult, potentialMetadataTransaction?: TransactionResult) => {
  // TODO: handle ARC-16
  const metadataArray: Array<Arc3Metadata | Arc19Metadata | Arc69Metadata> = []

  if (assetResult.params.url?.includes('#arc3') || assetResult.params.url?.includes('@arc3')) {
    // When the URL contains #arc3 or @arc3, it follows ARC-3
    // If the URL starts with template-ipfs://, it also follows ARC-19
    // If the asset follows both ARC-3 and ARC-19, we add both metadata to the array

    const isAlsoArc19 = assetResult.params.url.startsWith('template-ipfs://')

    const metadataUrl = isAlsoArc19
      ? getArc19Url(assetResult.params.url, assetResult.params.reserve)
      : getArc3Url(assetResult.index, assetResult.params.url)

    if (metadataUrl) {
      const response = await fetch(metadataUrl)
      const metadataResult = (await response.json()) as Arc3MetadataResult
      const metadata = asArc3Metadata(assetResult.index, assetResult.params.url, metadataResult)

      metadataArray.push({
        ...metadata,
        standard: AssetStandard.ARC3,
      })
      if (isAlsoArc19) {
        metadataArray.push({
          ...metadata,
          standard: AssetStandard.ARC19,
        })
      }
    }
  } else if (assetResult.params.url?.startsWith('template-ipfs://')) {
    // If the asset doesn't follow ARC-3, but the URL starts with template-ipfs://, it follows ARC-19
    // There is no specs for ARC-19 metadata, but it seems to be the same with ARC-3

    const metadataUrl = getArc19Url(assetResult.params.url, assetResult.params.reserve)
    if (metadataUrl) {
      const response = await fetch(metadataUrl)
      const metadataResult = (await response.json()) as Arc3MetadataResult
      const metadata = asArc3Metadata(assetResult.index, assetResult.params.url, metadataResult)

      metadataArray.push({
        ...metadata,
        standard: AssetStandard.ARC19,
      })
    }
  }

  // Check for ARC-69
  if (potentialMetadataTransaction && potentialMetadataTransaction.note) {
    const arc69Metadata = noteToArc69Metadata(potentialMetadataTransaction.note)
    if (arc69Metadata) {
      metadataArray.push(arc69Metadata)
    }
  }

  return metadataArray
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
