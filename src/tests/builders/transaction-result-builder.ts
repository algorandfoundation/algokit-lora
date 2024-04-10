import {
  DataBuilder,
  dossierProxy,
  randomElement,
  randomNumber,
  randomString,
  randomDateBetween,
  randomNumberBetween,
} from '@makerx/ts-dossier'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'

export class TransactionResultBuilder extends DataBuilder<TransactionResult> {
  constructor() {
    const now = new Date()
    super({
      id: randomString(52, 52),
      'tx-type': randomElement(Object.values(algosdk.TransactionType)),
      'last-valid': randomNumber(),
      'first-valid': randomNumber(),
      fee: randomNumberBetween(1_000, 100_000),
      sender: randomString(52, 52),
      'confirmed-round': randomNumber(),
      'round-time': randomDateBetween(new Date(now.getTime() - 123456789), now).getTime() / 1000,
      signature: {
        sig: randomString(88, 88),
      },
    })
  }

  public paymentTransaction() {
    this.thing['tx-type'] = algosdk.TransactionType.pay
    this.thing['payment-transaction'] = {
      amount: randomNumberBetween(10_000, 23_6070_000),
      receiver: randomString(52, 52),
    }
    return this
  }
}

export const transactionResultBuilder = dossierProxy<TransactionResultBuilder, TransactionResult>(TransactionResultBuilder)
