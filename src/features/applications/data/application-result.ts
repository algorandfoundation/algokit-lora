import { indexer } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { atom } from 'jotai'
import { ApplicationLookupResult, ApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationId } from './types'
import { atomFam } from '@/features/common/data/atom-fam'

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

const [_applicationResultsAtom, _getApplicationResultAtom] = atomFam((id) => id, createApplicationResultAtom)

export const applicationResultsAtom = _applicationResultsAtom
export const getApplicationResultAtom = (store: JotaiStore, applicationId: ApplicationId) => _getApplicationResultAtom(store, applicationId)
