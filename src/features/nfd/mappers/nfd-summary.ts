import { NfdResult, NfdSummary } from '../data/types'

export const asNfdSummary = (nfdResult: NfdResult): NfdSummary => {
  return {
    name: nfdResult.name,
    address: nfdResult.depositAccount,
  }
}
