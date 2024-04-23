export type Asset = {
  id: number
  name?: string
  total: number | bigint
  decimals: number | bigint
  unitName?: string
  clawback?: string
}
