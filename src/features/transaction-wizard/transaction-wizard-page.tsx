import { PageTitle } from '../common/components/page-title'
import { TransactionsBuilder } from './components/transactions-builder'
import { BuildMethodCallTransactionResult } from './models'
import algosdk from 'algosdk'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  // TODO: NC - Remove this
  const tempTransactions = [
    {
      id: 'e959e3a0-d187-4a39-bc02-eaeecdb2eec5',
      type: 'MethodCall',
      applicationId: 709806536,
      sender: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      method: {
        name: 'test_ref_types_in_big_method',
        args: [
          {
            type: new algosdk.ABIUintType(64),
            name: 'a1',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a2',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a3',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a4',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a5',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a6',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a7',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a8',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a9',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a10',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a11',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a12',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a13',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a14',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a15',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a16',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a17',
          },
          {
            type: 'asset',
            name: 'asset',
          },
          {
            type: new algosdk.ABIUintType(64),
            name: 'a18',
          },
          {
            type: 'application',
            name: 'application',
          },
          {
            type: 'pay',
            name: 'pay',
          },
          {
            type: 'account',
            name: 'account',
          },
        ],
        returns: {
          type: '(uint64,uint64,uint64,byte[])',
        },
      } as unknown as algosdk.ABIMethod,
      methodName: 'test_ref_types_in_big_method',
      methodArgs: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        {
          id: '4fa02c64-765c-47e4-823d-11cea9bd6150',
          type: 'Payment',
          sender: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
          receiver: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
          amount: 4,
          fee: {
            setAutomatically: true,
          },
          validRounds: {
            setAutomatically: true,
          },
        },
        'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
      ],
      accounts: [],
      foreignAssets: [18],
      foreignApps: [20],
      boxes: [],
    } as BuildMethodCallTransactionResult,
  ]

  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <div className="space-y-6">
        <p>Create and send transactions to the selected network using a connected wallet.</p>
        <TransactionsBuilder title={<h2 className="pb-0">Transaction Group</h2>} transactions={tempTransactions} />
      </div>
    </div>
  )
}
