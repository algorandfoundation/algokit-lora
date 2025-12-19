import { ABITransactionType } from '@algorandfoundation/algokit-utils/abi'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'

export function asAlgosdkTransactionType(type: ABITransactionType): TransactionType | undefined {
  switch (type) {
    case ABITransactionType.Payment:
      return TransactionType.Payment
    case ABITransactionType.KeyRegistration:
      return TransactionType.KeyRegistration
    case ABITransactionType.AssetConfig:
      return TransactionType.AssetConfig
    case ABITransactionType.AssetTransfer:
      return TransactionType.AssetTransfer
    case ABITransactionType.AssetFreeze:
      return TransactionType.AssetFreeze
    case ABITransactionType.AppCall:
      return TransactionType.AppCall
    default:
      return undefined
  }
}
