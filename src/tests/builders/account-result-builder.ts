import { AccountResult } from '@/features/accounts/data/types'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class AccountResultBuilder extends DataBuilder<AccountResult> {
  constructor(initialState?: AccountResult) {
    super(
      initialState
        ? initialState
        : {
            address: randomString(52, 52),
            amount: randomNumber(),
            'min-balance': randomNumber(),
            'total-created-assets': randomNumber(),
            'total-created-apps': randomNumber(),
            'total-assets-opted-in': randomNumber(),
            'auth-addr': randomString(52, 52),
          }
    )
  }
}

export const accountResultBuilder = dossierProxy<AccountResultBuilder, AccountResult>(AccountResultBuilder)
