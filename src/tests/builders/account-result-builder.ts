import { AccountResult } from '@/features/accounts/data/types'
import { AccountStatus } from '@algorandfoundation/algokit-utils/types/indexer'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class AccountResultBuilder extends DataBuilder<AccountResult> {
  constructor(initialState?: AccountResult) {
    super(
      initialState
        ? initialState
        : {
            address: randomString(52, 52),
            amount: randomNumber(),
            'amount-without-pending-rewards': randomNumber(),
            'apps-local-state': [],
            'apps-total-schema': { 'num-byte-slice': 0, 'num-uint': 0 },
            assets: [],
            'created-apps': [],
            'created-assets': [],
            'min-balance': randomNumber(),
            'pending-rewards': randomNumber(),
            'reward-base': randomNumber(),
            rewards: randomNumber(),
            round: 38851889,
            status: AccountStatus.Online,
            'total-apps-opted-in': randomNumber(),
            'total-assets-opted-in': randomNumber(),
            'total-created-apps': randomNumber(),
            'total-created-assets': randomNumber(),
          }
    )
  }
}

export const accountResultBuilder = dossierProxy<AccountResultBuilder, AccountResult>(AccountResultBuilder)
