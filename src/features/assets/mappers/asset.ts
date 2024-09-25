import { asAssetSummary } from './asset-summary'
import { Asset, AssetMediaType, AssetStandard, AssetType } from '../models'
import { AssetId, AssetMetadataResult, AssetResult } from '../data/types'
import { getArc3Url, isArc3Url } from '../utils/arc3'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'
import Decimal from 'decimal.js'
import { getArc19Url, isArc19Url } from '../utils/arc19'
import { isArc16Properties } from '../utils/arc16'
import { asJson } from '@/utils/as-json'

export const asAsset = (assetResult: AssetResult, metadataResult: AssetMetadataResult): Asset => {
  return {
    ...asAssetSummary(assetResult),
    total: assetResult.params.total,
    defaultFrozen: assetResult.params['default-frozen'] ?? false,
    url: assetResult.params.url,
    type: asType(assetResult),
    standardsUsed: asStandardsUsed(assetResult, metadataResult),
    traits: asTraits(metadataResult),
    media: asMedia(assetResult, metadataResult),
    metadata: asMetadata(metadataResult),
    json: asJson(assetResult),
  }
}

const asMetadata = (metadataResult: AssetMetadataResult): Asset['metadata'] => {
  if (metadataResult) {
    const { properties: _, ...arc3Metadata } = metadataResult.arc3?.metadata ?? {}
    const { properties: __, attributes: ___, ...arc69Metadata } = metadataResult.arc69?.metadata ?? {}

    return normalizeObjectForDisplay({ ...arc3Metadata, ...arc69Metadata }) as Record<string, string | number>
  }
}

const asTraits = (metadataResult: AssetMetadataResult): Asset['traits'] => {
  if (metadataResult) {
    const { arc69: _, ...arc3Properties } = metadataResult.arc3?.metadata.properties ?? {}
    const arc69Properties = metadataResult.arc69?.metadata.properties ?? {}
    const arc69Attributes = metadataResult.arc69?.metadata.attributes?.reduce(
      (acc, a) => {
        return {
          ...acc,
          [a.trait_type]: a.value,
        }
      },
      {} as Record<string, string | number>
    )

    const properties = {
      ...arc3Properties,
      ...arc69Attributes,
      ...arc69Properties,
    }

    if (isArc16Properties(properties)) {
      return normalizeObjectForDisplay(properties.traits!) as Record<string, string>
    }

    return normalizeObjectForDisplay(properties) as Record<string, string>
  }
}

const asMedia = (assetResult: AssetResult, metadataResult: AssetMetadataResult): Asset['media'] => {
  if (metadataResult?.arc3) {
    const metadata = metadataResult?.arc3.metadata
    // If the asset follows ARC-3 or ARC-19, we use the media from the metadata
    const imageUrl = metadata.image && getArc3MediaUrl(assetResult.index, metadata.image, metadataResult.arc3.metadata_url)
    if (imageUrl) {
      return {
        url: imageUrl,
        type: AssetMediaType.Image,
      }
    }
    const videoUrl = metadata.animation_url && getArc3MediaUrl(assetResult.index, metadata.animation_url, metadataResult.arc3.metadata_url)
    if (videoUrl) {
      return {
        url: videoUrl,
        type: AssetMediaType.Video,
      }
    }
  }

  if (metadataResult?.arc69) {
    // If the asset follows ARC-69, we display the media from the asset URL
    // In this scenario, we also support ARC-19 format URLs
    if (!assetResult.params.url) {
      return undefined
    }

    const url = isArc19Url(assetResult.params.url)
      ? getArc19Url(assetResult.params.url, assetResult.params.reserve)
      : assetResult.params.url

    if (url) {
      return {
        type: metadataResult.arc69.metadata.mime_type?.startsWith('video/') ? AssetMediaType.Video : AssetMediaType.Image,
        url: replaceIpfsWithGatewayIfNeeded(url),
      }
    }
  }

  if (!metadataResult && (assetResult.params.url?.startsWith('ipfs://') || assetResult.params.url?.includes('/ipfs/'))) {
    // There are a lot of NFTs which use the URL to store the ipfs image, however don't follow any standard
    return {
      url: replaceIpfsWithGatewayIfNeeded(assetResult.params.url),
      type: AssetMediaType.Image,
    }
  }
}

const asStandardsUsed = (assetResult: AssetResult, metadataResult: AssetMetadataResult): AssetStandard[] => {
  const standardsUsed = new Set<AssetStandard>()
  const [isArc3, isArc19] = assetResult.params.url
    ? ([isArc3Url(assetResult.params.url), isArc19Url(assetResult.params.url)] as const)
    : [false, false]
  if (isArc3) {
    standardsUsed.add(AssetStandard.ARC3)
  }
  if (metadataResult?.arc3?.metadata.properties && isArc16Properties(metadataResult.arc3.metadata.properties)) {
    standardsUsed.add(AssetStandard.ARC16)
  }
  if (isArc19) {
    standardsUsed.add(AssetStandard.ARC19)
  }
  if (metadataResult?.arc69) {
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

const getArc3MediaUrl = (assetId: AssetId, mediaUrl: string, assetMetadataUrl?: string) => {
  const isRelative = !mediaUrl.includes(':')
  const absoluteMediaUrl = !isRelative ? mediaUrl : assetMetadataUrl ? new URL(assetMetadataUrl, mediaUrl).toString() : ''

  return replaceIpfsWithGatewayIfNeeded(getArc3Url(assetId, absoluteMediaUrl))
}

const normalizeObjectForDisplay = (object: Record<string, unknown>) => {
  const converted = Object.entries(object).map(([key, value]) => {
    if (typeof value === 'object') {
      return [key, JSON.stringify(value)] as const
    }
    return [key, value as unknown] as const
  })

  return Object.fromEntries(converted)
}
