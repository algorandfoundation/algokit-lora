import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '../data/types'

export type Account = {
  address: Address
  balance: AlgoAmount
  minBalance: AlgoAmount
  totalCreatedAssets: number
  totalCreatedApps: number
  totalAssetsOptedIn: number
  rekeyedTo?: Address
  totalHeldAssets: number
  json: string
}
