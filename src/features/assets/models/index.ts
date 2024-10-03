export type AssetSummary = {
  id: number
  name?: string
  decimals: number
  unitName?: string
  creator: string
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
}

export enum AssetType {
  Fungible = 'Fungible',
  PureNonFungible = 'Pure Non-Fungible',
  FractionalNonFungible = 'Fractional Non-Fungible',
  Deleted = 'Deleted',
}

export enum AssetMediaType {
  Image = 'image',
  Video = 'video',
}

export type AssetMedia = {
  type: AssetMediaType
  url: string
}

export type Asset = AssetSummary & {
  total: number | bigint
  defaultFrozen: boolean
  url?: string
  type: AssetType
  standardsUsed: AssetStandard[]
  traits?: Record<string, string>
  metadata?: Record<string, string | number>
  media?: AssetMedia
  json: string
}

export enum AssetStandard {
  ARC3 = 'ARC-3',
  ARC16 = 'ARC-16',
  ARC19 = 'ARC-19',
  ARC69 = 'ARC-69',
}
