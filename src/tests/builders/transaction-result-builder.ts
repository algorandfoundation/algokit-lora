import { DataBuilder, dossierProxy, randomElement, randomNumber, randomString } from '@makerx/ts-dossier'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'

export class TransactionResultBuilder extends DataBuilder<TransactionResult> {
  constructor() {
    super({
      id: randomString(52, 52),
      'tx-type': randomElement(Object.values(algosdk.TransactionType)),
      'last-valid': randomNumber(),
      'first-valid': randomNumber(),
      fee: randomNumber(),
      sender: randomString(52, 52),
    })
  }
}

export const transactionResultBuilder = dossierProxy<TransactionResultBuilder, TransactionResult>(TransactionResultBuilder)
