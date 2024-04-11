import { PaymentTransaction } from './payment-transaction'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import { asPaymentTransaction } from '../mappers/transaction-mappers'

type Props = {
  transaction: TransactionResult
}

export function Transaction({ transaction }: Props) {
  if (transaction['tx-type'] === algosdk.TransactionType.pay) {
    return <PaymentTransaction transaction={asPaymentTransaction(transaction)} rawTransaction={transaction} />
  }

  return <></>
}
