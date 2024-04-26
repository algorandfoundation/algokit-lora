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
