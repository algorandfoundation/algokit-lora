import algosdk from 'algosdk'

export function asAlgosdkTransactionType(type: algosdk.ABITransactionType): algosdk.TransactionType | undefined {
  switch (type) {
    case algosdk.ABITransactionType.pay:
      return algosdk.TransactionType.pay
    case algosdk.ABITransactionType.keyreg:
      return algosdk.TransactionType.keyreg
    case algosdk.ABITransactionType.acfg:
      return algosdk.TransactionType.acfg
    case algosdk.ABITransactionType.axfer:
      return algosdk.TransactionType.axfer
    case algosdk.ABITransactionType.afrz:
      return algosdk.TransactionType.afrz
    case algosdk.ABITransactionType.appl:
      return algosdk.TransactionType.appl
    default:
      return undefined
  }
}
