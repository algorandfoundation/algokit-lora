import { Address } from '../data/types'

export type Account = {
  address: Address
  balance: number
  minBalance: number
  totalCreatedAssets: number
  totalCreatedApps: number
  totalAssetsOptedIn: number
  rekeyedTo?: Address
  totalHeldAssets: number
  json: string
}
