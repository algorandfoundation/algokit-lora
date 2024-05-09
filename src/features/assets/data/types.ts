export type AssetIndex = number

// ARC-3 and ARC-19 share the same metadata structure
export type Arc3Or19MetadataResult = {
  metadata_url: string
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
  properties?: Record<string, string>
  extra_metadata?: string
}

export type Arc69MetadataResult = {
  description?: string
  external_url?: string
  media_url?: string
  properties?: Record<string, string>
  mime_type?: string
}

export type AssetMetadataResult = {
  arc3?: Arc3Or19MetadataResult
  arc19?: Arc3Or19MetadataResult
  arc69?: Arc69MetadataResult
}
