import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { asAssetSummary } from './asset-summary'
import { Arc3Or19Metadata, Arc69Metadata, Asset, AssetType } from '../models'
import { Arc3Or19MetadataResult, Arc69MetadataResult, AssetIndex, AssetMetadataResult } from '../data/types'
import { getArc3Url } from '../utils/get-arc-3-url'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'
import Decimal from 'decimal.js'
import { asJson } from '@/utils/as-json'

export const asAsset = (assetResult: AssetResult, metadataResult: AssetMetadataResult): Asset => {
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
    json: asJson(assetResult),
    metadata: {
      arc3: metadataResult.arc3 && asArc3Or19Metadata(assetResult.index, metadataResult.arc3),
      arc19: metadataResult.arc19 && asArc3Or19Metadata(assetResult.index, metadataResult.arc19),
      arc69: metadataResult.arc69 && asArc69Metadata(metadataResult.arc69),
    },
  }
}

const asType = (assetResult: AssetResult): AssetType => {
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

const asArc3Or19Metadata = (assetIndex: AssetIndex, metadata: Arc3Or19MetadataResult): Arc3Or19Metadata => {
  // ARC-3 and ARC-19 share this function because the metadata is the same

  // TODO: NC - We likely don't need everything here, we can be smarter here
  return {
    image: metadata.image ? getArc3MediaUrl(assetIndex, metadata.metadata_url, metadata.image) : undefined,
    imageIntegrity: metadata.image_integrity,
    imageMimetype: metadata.image_mimetype,
    backgroundColor: metadata.background_color,
    externalUrl: metadata.external_url,
    externalUrlIntegrity: metadata.external_url_integrity,
    externalUrlMimetype: metadata.external_url_mimetype,
    animationUrl: metadata.animation_url ? getArc3MediaUrl(assetIndex, metadata.metadata_url, metadata.animation_url) : undefined,
    animationUrlIntegrity: metadata.animation_url_integrity,
    animationUrlMimetype: metadata.animation_url_mimetype,
    properties: metadata.properties,
    extraMetadata: metadata.extra_metadata,
  }
}

const getArc3MediaUrl = (assetIndex: AssetIndex, assetMetadataUrl: string, mediaUrl: string) => {
  const isRelative = !mediaUrl.includes(':')
  const absoluteImageUrl = !isRelative ? mediaUrl : new URL(assetMetadataUrl, mediaUrl).toString()

  return getArc3Url(assetIndex, absoluteImageUrl)
}

const asArc69Metadata = (arc69MetadataResult: Arc69MetadataResult): Arc69Metadata => {
  return {
    description: arc69MetadataResult.description,
    externalUrl: arc69MetadataResult.external_url,
    mediaUrl: arc69MetadataResult.media_url ? replaceIpfsWithGatewayIfNeeded(arc69MetadataResult.media_url) : undefined,
    properties: arc69MetadataResult.properties,
    mimeType: arc69MetadataResult.mime_type,
  }
}
