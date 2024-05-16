import { AccountResult } from '../data/types'
import { Account } from '../models'
import { asJson } from '@/utils/as-json'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asAccount = (accountResult: AccountResult): Account => {
  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult['min-balance']),
    totalAssetsCreated: accountResult['total-created-assets'],
    totalAssetsOptedIn: accountResult['total-assets-opted-in'],
    totalAssetsHeld: (accountResult.assets ?? []).length,
    totalApplicationsCreated: accountResult['total-created-apps'],
    totalApplicationsOptedIn: accountResult['total-apps-opted-in'],
    rekeyedTo: accountResult['auth-addr'],
    json: asJson(accountResult),
  }
}
