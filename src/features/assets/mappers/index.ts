import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Arc3Metadata, Arc3MetadataResult, Arc69Metadata, Arc69MetadataResult, AssetSummary, TokenType } from '../models'
import { asJson } from '@/utils/as-json'
import { AssetIndex } from '../data/types'
import { getArc3Url } from '../utils/get-arc-3-url'
import Decimal from 'decimal.js'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'

export const asAssetSummary = (assetResult: AssetResult): AssetSummary => {
  return {
    id: assetResult.index,
    name: assetResult.params.name,
    total: assetResult.params.total,
    decimals: assetResult.params.decimals,
    unitName: assetResult.params['unit-name'],
    defaultFrozen: assetResult.params['default-frozen'] ?? false,
    url: assetResult.params.url,
    creator: assetResult.params.creator,
    manager: assetResult.params.manager,
    reserve: assetResult.params.reserve,
    freeze: assetResult.params.freeze,
    clawback: assetResult.params.clawback,
    json: asJson(assetResult),
    tokenType: getTokenType(assetResult),
  }
}

export const asArc3Metadata = (
  assetIndex: AssetIndex,
  assetMetadataUrl: string,
  arc3MetadataResult: Arc3MetadataResult
): Omit<Arc3Metadata, 'standard'> => {
  // ARC-3 and ARC-19 share this function because the metadata is the same

  return {
    image: arc3MetadataResult.image ? getArc3MediaUrl(assetIndex, assetMetadataUrl, arc3MetadataResult.image) : undefined,
    imageIntegrity: arc3MetadataResult.image_integrity,
    imageMimetype: arc3MetadataResult.image_mimetype,
    backgroundColor: arc3MetadataResult.background_color,
    externalUrl: arc3MetadataResult.external_url,
    externalUrlIntegrity: arc3MetadataResult.external_url_integrity,
    externalUrlMimetype: arc3MetadataResult.external_url_mimetype,
    animationUrl: arc3MetadataResult.animation_url
      ? getArc3MediaUrl(assetIndex, assetMetadataUrl, arc3MetadataResult.animation_url)
      : undefined,
    animationUrlIntegrity: arc3MetadataResult.animation_url_integrity,
    animationUrlMimetype: arc3MetadataResult.animation_url_mimetype,
    properties: arc3MetadataResult.properties,
    extraMetadata: arc3MetadataResult.extra_metadata,
  }
}

const getArc3MediaUrl = (assetIndex: AssetIndex, assetMetadataUrl: string, mediaUrl: string) => {
  const isRelative = !mediaUrl.includes(':')
  const absoluteImageUrl = !isRelative ? mediaUrl : new URL(assetMetadataUrl, mediaUrl).toString()

  return getArc3Url(assetIndex, absoluteImageUrl)
}

export const asArc69Metadata = (arc69MetadataResult: Arc69MetadataResult): Arc69Metadata => {
  return {
    standard: 'ARC-69',
    description: arc69MetadataResult.description,
    externalUrl: arc69MetadataResult.external_url,
    mediaUrl: arc69MetadataResult.media_url ? replaceIpfsWithGatewayIfNeeded(arc69MetadataResult.media_url) : undefined,
    properties: arc69MetadataResult.properties,
    mimeType: arc69MetadataResult.mime_type,
  }
}

const getTokenType = (assetResult: AssetResult): TokenType => {
  if (assetResult.params.total === 1 && assetResult.params.decimals === 0) {
    return TokenType.PureNonFungible
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
    return TokenType.FractionalNonFungible
  }
  return TokenType.Fungible
}
