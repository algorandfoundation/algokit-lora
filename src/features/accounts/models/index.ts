import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '../data/types'

export type Account = {
  address: Address
  balance: AlgoAmount
  minBalance: AlgoAmount
  totalAssetsCreated: number
  totalAssetsOptedIn: number
  totalAssetsHeld: number
  totalApplicationsCreated: number
  totalApplicationsOptedIn: number
  rekeyedTo?: Address
  json: string
}
