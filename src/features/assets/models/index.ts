export type AssetSummary = {
  id: number
  name?: string
  decimals: number | bigint
  unitName?: string
  clawback?: string
}

export enum AssetType {
  Fungible = 'Fungible',
  PureNonFungible = 'Pure Non-Fungible',
  FractionalNonFungible = 'Fractional Non-Fungible',
}

export type Asset = AssetSummary & {
  total: number | bigint
  defaultFrozen: boolean
  url?: string
  creator: string
  manager?: string
  reserve?: string
  freeze?: string
  json: string
  type: AssetType
  metadata: AssetMetadata
}

export type AssetMetadata = {
  arc3?: Arc3Or19Metadata
  arc19?: Arc3Or19Metadata
  arc69?: Arc69Metadata
}

export type Arc69Metadata = {
  description?: string
  externalUrl?: string
  mediaUrl?: string
  properties?: Record<string, string>
  mimeType?: string
}

export type Arc3Or19Metadata = {
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
  properties?: Record<string, string>
  extraMetadata?: string
}
