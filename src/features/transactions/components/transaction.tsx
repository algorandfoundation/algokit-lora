import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  return <div>Transaction Id {transactionId}</div>
}
