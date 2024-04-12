import { PaymentTransaction } from './payment-transaction'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import { asAssetTransferTransaction, asPaymentTransaction } from '../mappers/transaction-mappers'
import { AssetTranserTransaction } from './asset-transfer-transaction'

type Props = {
  transaction: TransactionResult
}

export function Transaction({ transaction }: Props) {
  if (transaction['tx-type'] === algosdk.TransactionType.pay) {
    return <PaymentTransaction transactionResult={transaction} />
  }
  // if (transaction['tx-type'] === algosdk.TransactionType.axfer) {
  //   return <AssetTranserTransaction transaction={asAssetTransferTransaction(transaction, a)} rawTransaction={transaction} />
  // }

  return <></>
}
