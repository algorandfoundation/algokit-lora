import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Arc3Metadata, Arc3MetadataResult, Asset } from '../models'
import { asJson } from '@/utils/as-json'
import { AssetIndex } from '../data/types'
import { resolveArc3Url } from '../utils/resolve-arc-3-url'

export const asAsset = (assetResult: AssetResult): Asset => {
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
  // TODO: check for image integrity
  const isRelative = !mediaUrl.includes(':')
  const absoluteImageUrl = !isRelative ? mediaUrl : new URL(assetMetadataUrl, mediaUrl).toString()

  return resolveArc3Url(assetIndex, absoluteImageUrl)
}
