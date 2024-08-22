import {
  DataBuilder,
  dossierProxy,
  randomElement,
  randomNumber,
  randomString,
  randomDateBetween,
  randomNumberBetween,
} from '@makerx/ts-dossier'
import {
  ApplicationTransactionResult,
  AssetResult,
  StateProofTransactionResult,
  TransactionResult,
} from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'

export class TransactionResultBuilder extends DataBuilder<TransactionResult> {
  constructor(initialState?: TransactionResult) {
    const now = new Date()
    super(
      initialState
        ? initialState
        : {
            id: randomString(52, 52).toUpperCase(),
            'tx-type': randomElement(Object.values(algosdk.TransactionType)),
            'last-valid': randomNumber(),
            'first-valid': randomNumber(),
            fee: randomNumberBetween(1_000, 100_000),
            sender: randomString(52, 52),
            'confirmed-round': randomNumber(),
            'round-time': Math.floor(randomDateBetween(new Date(now.getTime() - 123456789), now).getTime() / 1000),
            signature: {
              sig: randomString(88, 88),
            },
          }
    )
  }

  public paymentTransaction() {
    this.thing['tx-type'] = algosdk.TransactionType.pay
    this.thing['payment-transaction'] = {
      amount: randomNumberBetween(10_000, 23_6070_000),
      receiver: randomString(52, 52),
    }
    return this
  }

  public transferTransaction(asset: AssetResult) {
    this.thing['tx-type'] = algosdk.TransactionType.axfer
    this.thing['asset-transfer-transaction'] = {
      amount: randomNumberBetween(10_000, 23_6070_000),
      'asset-id': asset.index,
      'close-amount': 0,
      receiver: randomString(52, 52),
    }
    return this
  }

  public appCallTransaction() {
    this.thing['tx-type'] = algosdk.TransactionType.appl
    this.thing['application-transaction'] = {
      'application-id': randomNumber(),
    } as ApplicationTransactionResult
    return this
  }

  public stateProofTransaction() {
    this.thing['tx-type'] = algosdk.TransactionType.stpf
    // HACK: do this because the type StateProofTransactionResult is very big
    this.thing['state-proof-transaction'] = {} as StateProofTransactionResult
    return this
  }
}

export const transactionResultBuilder = dossierProxy<TransactionResultBuilder, TransactionResult>(TransactionResultBuilder)
