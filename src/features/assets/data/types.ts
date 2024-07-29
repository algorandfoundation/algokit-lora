import { AssetResult as IndexerAssetResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type AssetId = number

export type AssetResult = Omit<IndexerAssetResult, 'created-at-round' | 'destroyed-at-round'>

type Arc16MetadataProperties = {
  traits?: Record<string, unknown>
  [key: string]: unknown
}

// ARC-3 and ARC-19 share the same metadata structure, which is defined in the ARC-3 spec
export type Arc3MetadataResult = {
  metadata_url?: string
  metadata: {
    name?: string
    decimals?: number
    description?: string
    image?: string
    image_integrity?: string
    image_mimetype?: string
    background_color?: string
    external_url?: string
    external_url_integrity?: string
    external_url_mimetype?: string
    animation_url?: string
    animation_url_integrity?: string
    animation_url_mimetype?: string
    properties?: Arc16MetadataProperties
    extra_metadata?: string
    [key: string]: unknown
  }
}

type Arc69Attribute = {
  trait_type: string
  value: string | number
}

export type Arc69MetadataResult = {
  metadata: {
    description?: string
    external_url?: string
    media_url?: string
    properties?: Arc16MetadataProperties
    attributes?: Arc69Attribute[] // This is deprecated in the ARC-69 spec, but can still be used
    mime_type?: string
    [key: string]: unknown
  }
}

export type AssetMetadataResult = {
  arc3?: Arc3MetadataResult
  arc69?: Arc69MetadataResult
} | null
