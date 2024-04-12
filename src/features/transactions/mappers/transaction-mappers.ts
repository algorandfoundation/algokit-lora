import { AssetResult, TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetTransferTransactionModel,
  LogicsigModel,
  MultisigModel,
  PaymentTransactionModel,
  SignatureType,
  SinglesigModel,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'
import { Decimal } from 'decimal.js'
import { asAsset } from '@/features/assets/mappers/asset-mappers'

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  // TODO: Handle notes
  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['payment-transaction']['receiver'],
    amount: algokit.microAlgos(transaction['payment-transaction']['amount']),
    closeAmount: transaction['payment-transaction']['close-amount']
      ? algokit.microAlgos(transaction['payment-transaction']['close-amount'])
      : undefined,
    signature: transformSignature(transaction.signature),
  } satisfies PaymentTransactionModel
}

const transformSignature = (signature?: TransactionSignature) => {
  if (signature?.sig) {
    return {
      type: SignatureType.Single,
      signer: signature.sig,
    } satisfies SinglesigModel
  }

  if (signature?.multisig) {
    return {
      type: SignatureType.Multi,
      version: signature.multisig.version,
      threshold: signature.multisig.threshold,
      subsigners: signature.multisig.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
    } satisfies MultisigModel
  }

  if (signature?.logicsig) {
    return {
      type: SignatureType.Logic,
      logic: signature.logicsig.logic,
    } satisfies LogicsigModel
  }
}

export const asAssetTransferTransaction = (transaction: TransactionResult, asset: AssetResult): AssetTransferTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

  const calculateAmount = (amount: string) => {
    // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
    const decimals = asset.params.decimals.toString()
    return new Decimal(amount).div(new Decimal(10).pow(decimals)).toNumber()
  }

  // TODO: Handle notes
  return {
    id: transaction.id,
    type: TransactionType.AssetTransfer,
    asset: asAsset(asset),
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['asset-transfer-transaction'].receiver,
    amount: calculateAmount(
      transaction['asset-transfer-transaction'].amount.toString() // the amount is uint64, should be safe to be .toString()
    ),
    closeAmount: transaction['asset-transfer-transaction']['close-amount']
      ? calculateAmount(transaction['asset-transfer-transaction']['close-amount'].toString()) // the amount is uint64, should be safe to be .toString()
      : undefined,
    signature: transformSignature(transaction.signature),
  }
}
