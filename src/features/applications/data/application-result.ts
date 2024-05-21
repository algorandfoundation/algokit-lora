import { indexer } from '@/features/common/data'
import { ApplicationLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationId } from './types'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

const getApplicationResult = (applicationId: ApplicationId) =>
  indexer
    .lookupApplications(applicationId)
    .includeAll(true)
    .do()
    .then((result) => {
      return (result as ApplicationLookupResult).application
    })

export const [applicationResultsAtom, getApplicationResultAtom] = atomsInAtom(getApplicationResult, (applicationId) => applicationId)
