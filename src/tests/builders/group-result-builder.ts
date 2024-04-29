import { GroupResult } from '@/features/groups/data/types'
import { DataBuilder, dossierProxy, incrementedNumber, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class GroupResultBuilder extends DataBuilder<GroupResult> {
  constructor(initialState?: GroupResult) {
    super(
      initialState
        ? initialState
        : {
            id: randomString(45, 45),
            round: incrementedNumber('round'),
            timestamp: randomDate().toISOString(),
            transactionIds: Array.from({ length: randomNumberBetween(1, 1000) }, () => randomString(52, 52)),
          }
    )
  }
}

export const groupResultBuilder = dossierProxy<GroupResultBuilder, GroupResult>(GroupResultBuilder)
