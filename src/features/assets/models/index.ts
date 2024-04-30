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

export type Arc69Metadata = {
  standard: 'ARC-69'
  description?: string
  externalUrl?: string
  mediaUrl?: string
  properties?: Record<string, string>
  mimeType?: string
}

type Arc3And19Common = {
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

export type Arc3Metadata = Arc3And19Common & {
  standard: 'ARC-3'
}

export type Arc19Metadata = Arc3And19Common & {
  standard: 'ARC-19'
}
