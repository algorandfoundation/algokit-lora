import { Address } from '@/features/accounts/data/types'

export type Nfd = string

export type NfdResult = {
  name: Nfd
  depositAccount: Address
  owner: Address
  caAlgo: Address
}

export type NfdSummary = {
  name: Nfd
  address: Address
}
