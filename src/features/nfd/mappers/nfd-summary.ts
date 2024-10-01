import { NfdResult, NfdSummary } from '../data/types'

export const asNfdSummary = (nfdResult: NfdResult): NfdSummary => {
  return {
    address: nfdResult.address,
  }
}
