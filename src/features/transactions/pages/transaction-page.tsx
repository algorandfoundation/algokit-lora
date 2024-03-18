import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { PaymentTransactionModel, TransactionType } from '../models/models'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  const sampleTransaction = getSampleTransaction(transactionId)

  return <Transaction transaction={sampleTransaction} />
}

const getSampleTransaction = (transactionId: string): PaymentTransactionModel => {
  return {
    id: transactionId,
    type: TransactionType.Payment,
    confirmedRound: 36570178,
    roundTime: new Date(1709189521),
    group: 'a7Qnfai3DEKS8JI5ZPl149O9P7RztrBqRvBwRebx/Ao=',
    fee: 1000,
    sender: 'IVCEEIH2Q32DZNRTS5XFVEFFAQGERNZHHQT6S4UPY7ORJMHIQDSTX7YM4E',
    amount: 2_456_000,
    closeAmount: 0,
    receiver: '3P3CHL4M5JTDJKEL3ARLUZRXY23BWWPX6SZDC2NIBALL3SKE7JBIFOVOAY',
    base64Note: 'base64Note',
    textNote: 'textNote',
    messagePackNode: 'messagePackNote',
  }
}
