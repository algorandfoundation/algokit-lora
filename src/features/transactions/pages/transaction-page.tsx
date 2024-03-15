import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction, TransactionModel, TransactionType } from '../components/transaction'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  const sampleTransaction = getSampleTransaction(transactionId)

  return <Transaction transaction={sampleTransaction} />
}

const getSampleTransaction = (transactionId: string): TransactionModel => {
  return {
    id: transactionId,
    type: TransactionType.Payment,
    confirmedRound: 36570178,
    roundTime: 1709189521,
    group: 'a7Qnfai3DEKS8JI5ZPl149O9P7RztrBqRvBwRebx/Ao=',
    fee: 1000,
  }
}
