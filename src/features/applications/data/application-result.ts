import { ApplicationId, ApplicationResult } from './types'
import { readOnlyAtomCache } from '@/features/common/data'
import { algod, indexer } from '@/features/common/data/algo-client'
import { asError, is404 } from '@/utils/error'
import { Getter, Setter } from 'jotai/index'

const getApplicationResult = async (_: Getter, __: Setter, applicationId: ApplicationId) => {
  try {
    // Check algod first, as there can be some syncing delays to indexer
    return await algod
      .getApplicationByID(applicationId)
      .do()
      .then((result) => result as ApplicationResult)
  } catch (e: unknown) {
    if (is404(asError(e))) {
      // Handle deleted applications or applications that may not be available in algod potentially due to the node type
      return await indexer
        .lookupApplications(applicationId)
        .includeAll(true)
        .do()
        .then((result) => result.application as ApplicationResult)
    }
    throw e
  }
}

export const [applicationResultsAtom, getApplicationResultAtom] = readOnlyAtomCache(getApplicationResult, (applicationId) => applicationId)
