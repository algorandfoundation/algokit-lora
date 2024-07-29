import { atom, useAtomValue } from 'jotai/index'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { fetchGroup } from '@/features/groups/data'
import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import { getApplicationResultAtom } from '@/features/applications/data'
import { getApplicationMetadataResultAtom } from '@/features/applications/data/application-metadata'
import { asApplication } from '@/features/applications/mappers'

// TODO: rename to app spec,
// TODO: ABIContract is a better fit for this
const createArc32DataAtom = (transaction: AppCallTransaction | InnerAppCallTransaction) => {
  return atom(async (get) => {
    const group = transaction.group ? await fetchGroup(get, transaction.group, transaction.confirmedRound) : undefined
    const applicationResult = await get(getApplicationResultAtom(transaction.applicationId))
    const applicationMetadata = await get(getApplicationMetadataResultAtom(applicationResult))
    const application = asApplication(applicationResult, applicationMetadata)

    return {
      group,
      application,
    }
  })
}

const useArc32DataAtom = (transaction: AppCallTransaction | InnerAppCallTransaction) => {
  return useMemo(() => createArc32DataAtom(transaction), [transaction])
}

export const useLoadableArc32Data = (transaction: AppCallTransaction | InnerAppCallTransaction) => {
  return useAtomValue(loadable(useArc32DataAtom(transaction)))
}
