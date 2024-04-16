import { AssetResult, TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetTransferTransactionModel,
  AssetTransferTransactionSubType,
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
import { asAsset } from '@/features/assets/mappers/asset-mappers'

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

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
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
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

  const subType = () => {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    if (transaction['asset-transfer-transaction']['close-to']) {
      return AssetTransferTransactionSubType.OptOut
    }
    if (
      transaction.sender === transaction['asset-transfer-transaction'].receiver &&
      transaction['asset-transfer-transaction'].amount.toString() === '0'
    ) {
      return AssetTransferTransactionSubType.OptIn
    }
    if (
      transaction.sender === asset.params.clawback &&
      transaction['asset-transfer-transaction'].sender &&
      transaction['asset-transfer-transaction'].sender !== '0'
    ) {
      return AssetTransferTransactionSubType.Clawback
    }

    return AssetTransferTransactionSubType.Transaction
  }

  return {
    id: transaction.id,
    type: TransactionType.AssetTransfer,
    subType: subType(),
    asset: asAsset(asset),
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['asset-transfer-transaction'].receiver,
    amount: transaction['asset-transfer-transaction'].amount,
    closeRemainder: transaction['asset-transfer-transaction']['close-to']
      ? {
          to: transaction['asset-transfer-transaction']['close-to'],
          amount: transaction['asset-transfer-transaction']['close-amount'] ?? 0,
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    clawbackFrom: transaction['asset-transfer-transaction'].sender,
  }
}
