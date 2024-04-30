export type Asset = {
  id: number
  name?: string
  total: number | bigint
  decimals: number | bigint
  unitName?: string
  defaultFrozen: boolean
  url?: string
  creator: string
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
  json: string
}

export type AssetWithMetadata = Asset & {
  metadata?: Arc3Metadata | Arc19Metadata | Arc69Metadata
}

export type Arc3Asset = Asset & {
  metadata: Arc3Metadata
}

export type Arc19Asset = Asset & {
  metadata: Arc19Metadata
}

export type Arc69Asset = Asset & {
  metadata: Arc69Metadata
}

export type Arc69Metadata = {
  standard: 'ARC-69'
  description?: string
  externalUrl?: string
  mediaUrl?: string
  properties?: Record<string, string>
  mimeType?: string
}

export type Arc3Metadata = {
  standard: 'ARC-3'
  name?: string
  decimals?: number
  description?: string
  image?: string
  imageIntegrity?: string
  imageMimetype?: string
  backgroundColor?: string
  externalUrl?: string
  externalUrlIntegrity?: string
  externalUrlMimetype?: string
  animationUrl?: string
  animationUrlIntegrity?: string
  animationUrlMimetype?: string
  properties?: Record<string, unknown>
  extraMetadata?: string
}

export type Arc19Metadata = Omit<Arc3Metadata, 'standard'> & {
  standard: 'ARC-19'
}

// ARC-3 and ARC-19 share the same metadata structure
export type Arc3MetadataResult = {
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
  properties?: Record<string, unknown>
  extra_metadata?: string
  // TODO: localization
}
