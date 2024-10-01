import { Address } from '@/features/accounts/data/types'

export type Nfd = string

export type NfdResult = {
  name: Nfd
  address: Address
}

export type NfdSummary = {
  address: Address
}
