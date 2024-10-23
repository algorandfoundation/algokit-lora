import { Address } from '@/features/accounts/data/types'

export type Nfd = string

export type ForwardNfdLookup = {
  nfd: Nfd
}

export type ReverseNfdLookpup = {
  address: string
  resolveNow?: boolean
}

export type NfdLookup = ReverseNfdLookpup | ForwardNfdLookup
export type NfdResult = {
  name: Nfd
  depositAccount: Address
  caAlgo: Address[]
}
