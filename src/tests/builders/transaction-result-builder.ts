import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'

export class TransactionResultBuilder extends DataBuilder<TransactionResult> {
  constructor() {
    super({
      id: randomString(52, 52),
      'tx-type': algosdk.TransactionType.pay,
      'last-valid': randomNumber(),
      'first-valid': randomNumber(),
      fee: randomNumber(),
      sender: randomString(52, 52),
      'confirmed-round': randomNumber(),
      'round-time': randomNumber(),
      'payment-transaction': {
        amount: randomNumber(),
        receiver: randomString(52, 52),
      },
    })
  }
}

export const transactionResultBuilder = dossierProxy<TransactionResultBuilder, TransactionResult>(TransactionResultBuilder)
