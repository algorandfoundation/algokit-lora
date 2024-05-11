import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { asAssetSummary } from './asset-summary'
import { Asset, AssetMediaType, AssetStandard, AssetType } from '../models'
import { Arc3Or19MetadataResult, Arc69MetadataResult, AssetIndex, AssetMetadataResult } from '../data/types'
import { getArc3Url } from '../utils/get-arc-3-url'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'
import Decimal from 'decimal.js'
import { asJson } from '@/utils/as-json'
import { invariant } from '@/utils/invariant'
import { getArc19Url } from '../utils/get-arc-19-url'

export const asAsset = (assetResult: AssetResult, metadataResult: AssetMetadataResult): Asset => {
  const standardsUsed = asStandardsUsed(assetResult, metadataResult)
  // TODO: NC - Functions using this probably shouldn't

  return {
    ...asAssetSummary(assetResult),
    total: assetResult.params.total,
    defaultFrozen: assetResult.params['default-frozen'] ?? false,
    url: assetResult.params.url,
    creator: assetResult.params.creator,
    manager: assetResult.params.manager,
    reserve: assetResult.params.reserve,
    freeze: assetResult.params.freeze,
    type: asType(assetResult),
    standardsUsed,
    traits: asTraits(metadataResult),
    media: asMedia(assetResult, metadataResult, standardsUsed),
    metadata: asMetadata(metadataResult, standardsUsed),
    json: asJson(assetResult),
  }
}

// TODO: NC - Chat to Pat about if we should show other metadata?
// TODO: NC - What about localization? --> handle this.
const asMetadata = (metadataResult: AssetMetadataResult, standardsUsed: AssetStandard[]): Asset['metadata'] => {
  if (standardsUsed.length === 0) {
    return undefined
  }

  return {
    ...asArc3Or19Metadata(metadataResult.arc3),
    ...asArc3Or19Metadata(metadataResult.arc19),
    ...asArc69Metadata(metadataResult.arc69),
  }
}

const asTraits = (metadataResult: AssetMetadataResult): Asset['traits'] => {
  if (!metadataResult.arc3 && !metadataResult.arc19?.properties && !metadataResult.arc69?.properties) {
    return undefined
  }

  return {
    ...metadataResult.arc3?.properties,
    ...metadataResult.arc19?.properties,
    ...metadataResult.arc69?.properties,
  }
}

const asMedia = (assetResult: AssetResult, metadataResult: AssetMetadataResult, standardsUsed: AssetStandard[]): Asset['media'] => {
  if (standardsUsed.length === 0) {
    return undefined
  }

  if (
    (standardsUsed.includes(AssetStandard.ARC3) || standardsUsed.includes(AssetStandard.ARC19)) &&
    !standardsUsed.includes(AssetStandard.ARC69)
  ) {
    // If the asset follows ARC-3 or ARC-19, but not ARC-69
    // we use the media from the metadata
    const metadata = metadataResult.arc3 ? metadataResult.arc3 : metadataResult.arc19 ? metadataResult.arc19 : undefined
    invariant(metadata, 'ARC-3 or ARC-19 metadata must be present')
    const imageUrl = metadata.image && getArc3MediaUrl(assetResult.index, metadata.metadata_url, metadata.image)
    if (imageUrl) {
      return {
        url: imageUrl,
        type: AssetMediaType.Image,
      }
    }
    const videoUrl = metadata.animation_url && getArc3MediaUrl(assetResult.index, metadata.metadata_url, metadata.animation_url)
    if (videoUrl) {
      return {
        url: videoUrl,
        type: AssetMediaType.Video,
      }
    }
  }

  if (standardsUsed.includes(AssetStandard.ARC69)) {
    // If the asset follows ARC-69, we display the media from the asset URL
    // In this scenario, we also support ARC-19 format URLs
    if (!assetResult.params.url) {
      return undefined
    }

    const metadata = metadataResult.arc69
    invariant(metadata, 'ARC-69 metadata must be present')
    const url = assetResult.params.url.startsWith('template-ipfs://')
      ? getArc19Url(assetResult.params.url, assetResult.params.reserve)
      : replaceIpfsWithGatewayIfNeeded(assetResult.params.url)

    if (url) {
      return {
        type: metadata.mime_type?.startsWith('video/') ? AssetMediaType.Video : AssetMediaType.Image,
        url,
      }
    }
  }
}

const asStandardsUsed = (assetResult: AssetResult, metadataResult: AssetMetadataResult): AssetStandard[] => {
  const standardsUsed = new Set<AssetStandard>()
  if (assetResult.params.url?.includes('#arc3') || assetResult.params.url?.includes('@arc3')) {
    standardsUsed.add(AssetStandard.ARC3)
  }
  if (assetResult.params.url?.startsWith('template-ipfs://')) {
    standardsUsed.add(AssetStandard.ARC19)
  }
  if (metadataResult.arc3) {
    standardsUsed.add(AssetStandard.ARC3)
  }
  if (metadataResult.arc19) {
    standardsUsed.add(AssetStandard.ARC19)
  }
  if (metadataResult.arc69) {
    standardsUsed.add(AssetStandard.ARC69)
  }

  return Array.from(standardsUsed)
}

const asType = (assetResult: AssetResult): AssetType => {
  if (assetResult.deleted === true) {
    return AssetType.Deleted
  }

  if (assetResult.params.total === 1 && assetResult.params.decimals === 0) {
    return AssetType.PureNonFungible
  }
  // Check for fractional non-fungible
  // Definition from ARC-3
  // An ASA is said to be a fractional non-fungible token (fractional NFT) if and only if it has the following properties:
  // Total Number of Units (t) MUST be a power of 10 larger than 1: 10, 100, 1000, ...
  // Number of Digits after the Decimal Point (dc) MUST be equal to the logarithm in base 10 of total number of units.
  if (
    assetResult.params.total > 1 &&
    Decimal.log10(assetResult.params.total.toString()).toString() === assetResult.params.decimals.toString()
  ) {
    return AssetType.FractionalNonFungible
  }
  return AssetType.Fungible
}

const asArc3Or19Metadata = (metadataResult: Arc3Or19MetadataResult | undefined): Asset['metadata'] => {
  if (metadataResult) {
    const { metadata_url: _metadataUrl, properties: _properties, ...metadata } = metadataResult
    return metadata
  }
}

const getArc3MediaUrl = (assetIndex: AssetIndex, assetMetadataUrl: string, mediaUrl: string) => {
  const isRelative = !mediaUrl.includes(':')
  const absoluteMediaUrl = !isRelative ? mediaUrl : new URL(assetMetadataUrl, mediaUrl).toString()

  return getArc3Url(assetIndex, absoluteMediaUrl)
}

const asArc69Metadata = (metadataResult: Arc69MetadataResult | undefined): Asset['metadata'] => {
  if (metadataResult) {
    const { properties: _properties, ...metadata } = metadataResult
    return metadata
  }
}
