import { NfdResult } from '@/features/nfd/data/types'
import { NfdResultBuilder, nfdResultBuilder } from '../builders/nfd-result-builder'

export const nfdResultMother = {
  basic: () => {
    return nfdResultBuilder()
  },
  ['mainnet-datamuseum.algo']: () => {
    return new NfdResultBuilder({
      name: 'datamuseum.algo',
      depositAccount: 'DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU',
      caAlgo: ['DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU'],
    } satisfies NfdResult)
  },
}
