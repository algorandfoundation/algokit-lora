import { Application } from '../models'
import { ApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'

export const asApplication = (application: ApplicationResult): Application => {
  return {
    id: application.id,
  }
}
