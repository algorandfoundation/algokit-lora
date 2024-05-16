import { indexer } from '@/features/common/data'
import { atom } from 'jotai'
import { ApplicationLookupResult, ApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationId } from './types'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

const createApplicationResultAtom = (applicationId: ApplicationId) => {
  return atom<Promise<ApplicationResult> | ApplicationResult>(async (_get) => {
    return await indexer
      .lookupApplications(applicationId)
      .includeAll(true)
      .do()
      .then((result) => {
        return (result as ApplicationLookupResult).application
      })
  })
}

export const [applicationResultsAtom, getApplicationResultAtom] = atomsInAtom(createApplicationResultAtom, (applicationId) => applicationId)
