import { ABITransactionType } from '@algorandfoundation/algokit-utils/abi'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'

export function asAlgosdkTransactionType(type: ABITransactionType): TransactionType | undefined {
  switch (type) {
    case ABITransactionType.pay:
      return TransactionType.Payment
    case ABITransactionType.keyreg:
      return TransactionType.KeyRegistration
    case ABITransactionType.acfg:
      return TransactionType.AssetConfig
    case ABITransactionType.axfer:
      return TransactionType.AssetTransfer
    case ABITransactionType.afrz:
      return TransactionType.AssetFreeze
    case ABITransactionType.appl:
      return TransactionType.ApplicationCall
    default:
      return undefined
  }
}
