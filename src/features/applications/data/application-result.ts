import { ApplicationId, ApplicationResult } from './types'
import { readOnlyAtomCache } from '@/features/common/data'
import { algod, indexer } from '@/features/common/data/algo-client'
import { asError, is404 } from '@/utils/error'
import { removeEncodableMethods } from '@/utils/remove-encodable-methods'
import { Getter, Setter } from 'jotai/index'

const getApplicationResult = async (_: Getter, __: Setter, applicationId: ApplicationId) => {
  try {
    // Check algod first, as there can be some syncing delays to indexer
    const result = await algod.applicationById(applicationId)
    return removeEncodableMethods(result) as ApplicationResult
  } catch (e: unknown) {
    if (is404(asError(e))) {
      // Handle deleted applications or applications that may not be available in algod potentially due to the node type
      const result = await indexer.lookupApplicationById(applicationId, { includeAll: true })
      if (!result.application) {
        throw new Error(`Application ${applicationId} not found`)
      }
      return removeEncodableMethods(result.application) as ApplicationResult
    }
    throw e
  }
}

const keySelector = (applicationId: ApplicationId) => applicationId

export const [applicationResultsAtom, getApplicationResultAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<ApplicationResult> | ApplicationResult
>(getApplicationResult, keySelector)
