import { TransactionResult } from '@/features/transactions/data/types'
import { atom, Atom } from 'jotai'
import { LocalStateDelta } from '../models'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { createAppSpecAtom } from '@/features/applications/data/application-method-definitions'
import { asArc56AppSpec } from '@/features/applications/mappers'
import { asLocalStateDelta } from '../mappers/state-delta-mappers'

export const localStateDeltaResolver = (transaction: TransactionResult): Atom<Promise<LocalStateDelta[]>> => {
  return atom(async (get) => {
    if (transaction['tx-type'] !== AlgoSdkTransactionType.appl || !transaction['application-transaction']?.['application-id']) {
      return []
    }

    const appSpec = await get(createAppSpecAtom(transaction['application-transaction']?.['application-id']))
    return asLocalStateDelta(transaction['local-state-delta'], appSpec ? asArc56AppSpec(appSpec) : undefined)
  })
}
