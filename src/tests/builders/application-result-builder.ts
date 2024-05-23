import { ApplicationResult } from '@/features/applications/data/types'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class ApplicationResultBuilder extends DataBuilder<ApplicationResult> {
  constructor(initialState?: ApplicationResult) {
    super(
      initialState
        ? initialState
        : {
            id: randomNumber(),
            params: {
              creator: randomString(52, 52),
              'approval-program': randomString(10, 100),
              'clear-state-program': randomString(10, 100),
              'global-state': [],
            },
          }
    )
  }
}

export const applicationResultBuilder = dossierProxy<ApplicationResultBuilder, ApplicationResult>(ApplicationResultBuilder)
