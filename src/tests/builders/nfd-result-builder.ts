import { NfdResult } from '@/features/nfd/data/types'
import { DataBuilder, dossierProxy, randomString } from '@makerx/ts-dossier'

export class NfdResultBuilder extends DataBuilder<NfdResult> {
  constructor(initialState?: NfdResult) {
    super(
      initialState
        ? initialState
        : {
            name: randomString(5, 20),
            depositAccount: randomString(52, 52),
            caAlgo: [randomString(52, 52), randomString(52, 52)],
          }
    )
  }
}

export const nfdResultBuilder = dossierProxy<NfdResultBuilder, NfdResult>(NfdResultBuilder)
