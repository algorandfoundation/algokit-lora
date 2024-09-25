import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod, algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph } from '@/features/transactions-graph'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import { SendTransactionResult, BuildTransactionResult, BuildableTransactionType, BuildAppCallTransactionResult } from '../models'
import { asAlgosdkTransactions } from '../mappers'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'
import { populateAppCallResources } from '@algorandfoundation/algokit-utils'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  ConfirmTransactionsResourcesForm,
  TransactionResources,
} from '@/features/applications/components/confirm-transactions-resources-form'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

type Props = {
  // TODO: PD - transactions from props can't be removed
  transactions?: BuildTransactionResult[]
}

export function TransactionsBuilder({ transactions: transactionsProp }: Props) {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(transactionsProp ?? [])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const nonDeletableTransactionIds = useMemo(() => {
    return transactionsProp?.map((t) => t.id) ?? []
  }, [transactionsProp])

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (
      props: DialogBodyProps<
        {
          type?: algosdk.TransactionType
          mode: TransactionBuilderMode
          transaction?: BuildTransactionResult
          defaultValues?: Partial<BuildTransactionResult>
        },
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        type={props.data.type}
        mode={props.data.mode}
        defaultValues={props.data.defaultValues}
        transaction={props.data.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const { open: openEditResourcesDialog, dialog: editResourcesDialog } = useDialogForm({
    dialogHeader: 'Edit Resources',
    dialogBody: (
      props: DialogBodyProps<
        {
          transaction: BuildAppCallTransactionResult
        },
        TransactionResources
      >
    ) => {
      const resources = {
        accounts: props.data.transaction.accounts ?? [],
        assets: props.data.transaction.foreignAssets ?? [],
        applications: props.data.transaction.foreignApps ?? [],
        boxes: props.data.transaction.boxes ?? [],
      }
      return <ConfirmTransactionsResourcesForm resources={resources} onSubmit={props.onSubmit} onCancel={props.onCancel} />
    },
  })
  const createTransaction = useCallback(async () => {
    const transaction = await openTransactionBuilderDialog({ mode: TransactionBuilderMode.Create })
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
    }
  }, [openTransactionBuilderDialog])

  const sendTransactions = useCallback(async () => {
    invariant(activeAddress, 'Please connect your wallet')

    const algokitComposer = algorandClient.setSigner(activeAddress, signer).newGroup()
    for (const transaction of transactions) {
      const txns = await asAlgosdkTransactions(transaction)
      txns.forEach((txn) => algokitComposer.addTransaction(txn))
    }
    const result = await algokitComposer.execute({
      populateAppCallResources: false,
    })
    const sentTxns = asTransactionFromSendResult(result)
    const transactionId = result.txIds[0]
    const transactionsGraphData = asTransactionsGraphData(sentTxns)

    setSendTransactionResult({
      transactionId,
      transactionsGraphData,
    })
  }, [activeAddress, signer, transactions])

  // TODO: PD - currently edit the app call will reset the resources
  const populateResources = useCallback(async () => {
    // TODO: PD - do we need a connected wallet here?
    invariant(activeAddress, 'Please connect your wallet')

    const algokitComposer = algorandClient.setSigner(activeAddress, signer).newGroup()
    // TODO: PD - do we need `methodCall`?
    for (const transaction of transactions) {
      const txns = await asAlgosdkTransactions(transaction)
      txns.forEach((txn) => algokitComposer.addTransaction(txn))
    }

    const { atc } = await algokitComposer.build()
    const populatedAtc = await populateAppCallResources(atc, algod)
    const transactionsWithResources = populatedAtc.buildGroup()

    // console.log('raw', transactions)
    // console.log('algokitComposer', transactionsWithSigner[0].txn)
    // console.log('populated', transactionsWithResources)

    // HACK: Assume that the order of transactions is the same
    const flattenedTransactions = flattenTransactions(transactions)
    for (let i = 0; i < flattenedTransactions.length; i++) {
      const transaction = flattenedTransactions[i]
      const transactionWithResources = transactionsWithResources[i]
      if (transaction.type === BuildableTransactionType.AppCall) {
        transaction.accounts = (transactionWithResources.txn.appAccounts ?? []).map((account) => algosdk.encodeAddress(account.publicKey))
        transaction.foreignAssets = transactionWithResources.txn.appForeignAssets ?? []
        transaction.foreignApps = transactionWithResources.txn.appForeignApps ?? []
        transaction.boxes = transactionWithResources.txn.boxes?.map((box) => uint8ArrayToBase64(box.name)) ?? []
      }
    }
  }, [transactions, activeAddress, signer])

  const editTransaction = useCallback(
    async (transaction: BuildTransactionResult) => {
      const txn = await openTransactionBuilderDialog({
        mode: TransactionBuilderMode.Edit,
        transaction: transaction,
      })
      if (txn) {
        setTransactions((prev) => prev.map((t) => (t.id === txn.id ? txn : t)))
      }
    },
    [openTransactionBuilderDialog]
  )

  const deleteTransaction = useCallback((transaction: BuildTransactionResult) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
  }, [])

  const editResources = useCallback(
    async (transaction: BuildAppCallTransactionResult) => {
      const resources = await openEditResourcesDialog({ transaction })
      if (resources) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id
              ? {
                  ...t,
                  accounts: resources.accounts,
                  foreignAssets: resources.assets,
                  foreignApps: resources.applications,
                  boxes: resources.boxes,
                }
              : t
          )
        )
      }
    },
    [openEditResourcesDialog]
  )

  // TODO: PD - spining Send button
  // TODO: PD - show the result of app call transactions
  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={createTransaction}>Create</Button>
        </div>
        <TransactionsTable
          data={transactions}
          setData={setTransactions}
          nonDeletableTransactionIds={nonDeletableTransactionIds}
          onEdit={editTransaction}
          onEditResources={editResources}
          onDelete={deleteTransaction}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={populateResources}>
            Populate Resouces
          </Button>
          <Button onClick={sendTransactions}>Send</Button>
        </div>
      </div>
      {transactionBuilderDialog}
      {editResourcesDialog}
      {sendTransactionResult && (
        <div className="my-4 flex flex-col gap-4 text-sm">
          <DescriptionList
            items={[
              {
                dt: transactionIdLabel,
                dd: (
                  <TransactionLink transactionId={sendTransactionResult.transactionId} className="text-sm text-primary underline">
                    {sendTransactionResult.transactionId}
                  </TransactionLink>
                ),
              },
            ]}
          />
          <TransactionsGraph
            transactionsGraphData={sendTransactionResult.transactionsGraphData}
            bgClassName="bg-background"
            downloadable={false}
          />
        </div>
      )}
    </div>
  )
}

const flattenTransactions = (transactions: BuildTransactionResult[]): BuildTransactionResult[] => {
  return transactions.reduce((acc, transaction) => {
    if (transaction.type === BuildableTransactionType.AppCall) {
      const methodCallArgs = transaction.methodArgs?.filter((arg) => typeof arg === 'object')
      return [...acc, ...flattenTransactions(methodCallArgs as BuildTransactionResult[])]
    }
    return [...acc, transaction]
  }, [] as BuildTransactionResult[])
}
