import { randomGuid } from '@/utils/random-guid'
import { PageTitle } from '../common/components/page-title'
import { TransactionsBuilder } from './components/transactions-builder'
import { BuildableTransactionType, BuildTransactionResult } from './models'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <TransactionsBuilder transactions={testTransactions} />
    </div>
  )
}

const testTransactions: BuildTransactionResult[] = [
  {
    id: randomGuid(),
    type: BuildableTransactionType.Payment,
    sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
    receiver: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
    amount: 2,
    fee: { setAutomatically: true },
    validRounds: { setAutomatically: true },
  },
  // {
  //   id: randomGuid(),
  //   type: BuildableTransactionType.Payment,
  //   sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //   receiver: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //   amount: 3,
  //   fee: { setAutomatically: true },
  //   validRounds: { setAutomatically: true },
  // },
  // {
  //   id: randomGuid(),
  //   type: BuildableTransactionType.AppCall,
  //   sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //   applicationId: 2792,
  //   methodName: 'get_pay_txn_amount',
  //   methodArgs: [
  //     {
  //       id: randomGuid(),
  //       type: BuildableTransactionType.Payment,
  //       sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //       receiver: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //       amount: 3,
  //       fee: { setAutomatically: true },
  //       validRounds: { setAutomatically: true },
  //     },
  //   ],
  //   fee: { setAutomatically: true },
  //   validRounds: { setAutomatically: true },
  // },
  //
  // {
  //   id: randomGuid(),
  //   type: BuildableTransactionType.AppCall,
  //   sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //   applicationId: 2792,
  //   methodName: 'get_returned_value_of_app_call_txn',
  //   methodArgs: [
  //     {
  //       id: randomGuid(),
  //       type: BuildableTransactionType.AppCall,
  //       sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //       applicationId: 2792,
  //       methodName: 'get_pay_txn_amount',
  //       methodArgs: [
  //         {
  //           id: randomGuid(),
  //           type: BuildableTransactionType.Payment,
  //           sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //           receiver: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //           amount: 3,
  //           fee: { setAutomatically: true },
  //           validRounds: { setAutomatically: true },
  //         },
  //       ],
  //       fee: { setAutomatically: true },
  //       validRounds: { setAutomatically: true },
  //     },
  //   ],
  //   fee: { setAutomatically: true },
  //   validRounds: { setAutomatically: true },
  // },
  //
  // {
  //   id: randomGuid(),
  //   type: BuildableTransactionType.MethodCall,
  //   sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //   applicationId: 2792,
  //   methodName: 'get_returned_value_of_app_call_txn',
  //   methodArgs: [
  //     {
  //       id: randomGuid(),
  //       type: BuildableTransactionType.MethodCall,
  //       sender: 'NKF2NBOYFUVTDIPRMNAQEE6DW4RCJPH6G576IJB3Y7FWLXAS5EKPJQ7RFQ',
  //       applicationId: 2793,
  //       methodName: 'add',
  //       methodArgs: [1, 2],
  //       fee: { setAutomatically: true },
  //       validRounds: { setAutomatically: true },
  //     },
  //   ],
  //   fee: { setAutomatically: true },
  //   validRounds: { setAutomatically: true },
  // },
]
//get_returned_value_of_app_call_txn
