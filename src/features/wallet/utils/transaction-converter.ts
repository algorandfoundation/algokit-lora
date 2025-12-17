import {
  decodeTransaction,
  encodeTransactionRaw,
  Transaction as UtilsTransaction,
  TransactionSigner as UtilsTransactionSigner,
} from '@algorandfoundation/algokit-utils/transact'
import algosdk from 'algosdk'

/**
 * Wraps an algosdk TransactionSigner to be compatible with algokit-utils TransactionSigner.
 *
 * This is necessary because wallet packages (use-wallet, pera, defly, etc.) provide
 * signers typed against algosdk's Transaction type, but algokit-utils now has its own
 * Transaction type.
 *
 * The wrapper converts algokit-utils Transactions to algosdk Transactions before
 * passing them to the underlying algosdk signer.
 */
export function wrapAlgosdkSigner(algosdkSigner: algosdk.TransactionSigner): UtilsTransactionSigner {
  return async (txnGroup: UtilsTransaction[], indexesToSign: number[]): Promise<Uint8Array[]> => {
    // Convert algokit-utils transactions to algosdk transactions
    const algosdkTxns = txnGroup.map((txn) => {
      const encoded = encodeTransactionRaw(txn)
      return algosdk.decodeUnsignedTransaction(encoded)
    })

    // Call the underlying algosdk signer
    return algosdkSigner(algosdkTxns, indexesToSign)
  }
}

/**
 * Wraps an algokit-utils TransactionSigner to be compatible with algosdk TransactionSigner.
 *
 * This is useful in test scenarios where we have an algokit-utils signer but need to
 * mock a function that expects an algosdk signer.
 */
export function wrapUtilsSigner(utilsSigner: UtilsTransactionSigner): algosdk.TransactionSigner {
  return async (txnGroup: algosdk.Transaction[], indexesToSign: number[]): Promise<Uint8Array[]> => {
    // Convert algosdk transactions to algokit-utils transactions
    const utilsTxns = txnGroup.map((txn) => {
      const encoded = algosdk.encodeUnsignedTransaction(txn)
      return decodeTransaction(encoded)
    })

    // Call the underlying utils signer
    return utilsSigner(utilsTxns, indexesToSign)
  }
}
