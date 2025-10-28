import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { TransactionType } from '@algorandfoundation/algokit-utils/algokit_transact'

export function asAlgosdkTransactionType(type: algosdk.ABITransactionType): algosdk.TransactionType | undefined {
  switch (type) {
    case algosdk.ABITransactionType.pay:
      return TransactionType.Payment
    case algosdk.ABITransactionType.keyreg:
      return TransactionType.KeyRegistration
    case algosdk.ABITransactionType.acfg:
      return TransactionType.AssetConfig
    case algosdk.ABITransactionType.axfer:
      return TransactionType.AssetTransfer
    case algosdk.ABITransactionType.afrz:
      return TransactionType.AssetFreeze
    case algosdk.ABITransactionType.appl:
      return TransactionType.AppCall
    default:
      return undefined
  }
}
