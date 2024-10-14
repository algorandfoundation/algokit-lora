import algosdk from 'algosdk'
import { BuildableTransactionType } from '@/features/transaction-wizard/models'

export function asAlgosdkABITransactionType(type: BuildableTransactionType): algosdk.ABITransactionType {
  switch (type) {
    case BuildableTransactionType.Payment:
      return algosdk.ABITransactionType.pay
    case BuildableTransactionType.AccountClose:
      return algosdk.ABITransactionType.pay
    case BuildableTransactionType.AppCall:
      return algosdk.ABITransactionType.appl
    case BuildableTransactionType.MethodCall:
      return algosdk.ABITransactionType.appl
    case BuildableTransactionType.AssetOptIn:
      return algosdk.ABITransactionType.axfer
    case BuildableTransactionType.AssetOptOut:
      return algosdk.ABITransactionType.axfer
    case BuildableTransactionType.AssetTransfer:
      return algosdk.ABITransactionType.axfer
    case BuildableTransactionType.AssetClawback:
      return algosdk.ABITransactionType.axfer
    case BuildableTransactionType.AssetCreate:
      return algosdk.ABITransactionType.acfg
    case BuildableTransactionType.AssetReconfigure:
      return algosdk.ABITransactionType.acfg
    case BuildableTransactionType.AssetDestroy:
      return algosdk.ABITransactionType.acfg
  }
}
