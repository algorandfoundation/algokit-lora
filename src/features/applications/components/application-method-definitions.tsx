import algosdk from 'algosdk'
import { ApplicationAbiMethods, ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo, useState } from 'react'
import { ApplicationId } from '../data/types'
import { Button } from '@/features/common/components/button'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { SendTransactionResult, BuildTransactionResult } from '@/features/transaction-wizard/models'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { invariant } from '@/utils/invariant'
import { useWallet } from '@txnlab/use-wallet'
import { algorandClient } from '@/features/common/data/algo-client'
import { asAlgosdkTransactions } from '@/features/transaction-wizard/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { TransactionsGraph } from '@/features/transactions-graph'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { TransactionsBuilder } from '@/features/transaction-wizard/components/transactions-builder'

type Props = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods // TODO: NC - Get the naming right
}

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions({ abiMethods, applicationId }: Props) {
  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method method={method} key={index} applicationId={applicationId} />
      ))}
    </Accordion>
  )
}

type MethodProps = {
  method: MethodDefinition
  applicationId: ApplicationId
}

function Method({ method, applicationId }: MethodProps) {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>([])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (
      props: DialogBodyProps<
        { transactionType: algosdk.ABITransactionType; transaction?: Partial<BuildTransactionResult> } | undefined,
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        mode={TransactionBuilderMode.Create}
        type={props.data?.transactionType as unknown as algosdk.TransactionType}
        defaultValues={props.data?.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const openDialog = useCallback(async () => {
    const transaction = await open({
      transactionType: algosdk.ABITransactionType.appl,
      transaction: {
        applicationId: applicationId,
        methodName: method.name,
      },
    })
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
    }
  }, [applicationId, method.name, open])

  // TODO: PD - refactor, this is the same as in transaction-wizard
  const send = useCallback(async () => {
    invariant(activeAddress, 'Please connect your wallet')

    const atc = algorandClient.setSigner(activeAddress, signer).newGroup()
    for (const transaction of transactions) {
      const txns = await asAlgosdkTransactions(transaction)
      txns.forEach((txn) => atc.addTransaction(txn))
    }
    const result = await atc.execute()
    const sentTxns = asTransactionFromSendResult(result)
    const transactionId = result.txIds[0]
    const transactionsGraphData = asTransactionsGraphData(sentTxns)

    setSendTransactionResult({
      transactionId,
      transactionsGraphData,
    })
  }, [activeAddress, signer, transactions])

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {method.description && <p className="mb-4">{method.description}</p>}
        <div>
          <h4 className="text-primary">Arguments</h4>
          {method.arguments.map((argument, index) => (
            <Argument key={index} index={index} argument={argument} />
          ))}
        </div>
        <Returns returns={method.returns} />
        <div className="flex justify-end">
          {transactions.length === 0 && (
            <Button variant="default" onClick={openDialog}>
              Call
            </Button>
          )}
        </div>
        {transactions.length > 0 && <TransactionsBuilder transactions={transactions} />}
        {dialog}
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
      </AccordionContent>
    </AccordionItem>
  )
}

type ArgumentProps = {
  index: number
  argument: ArgumentDefinition
}

function Argument({ index, argument }: ArgumentProps) {
  const items = useMemo(
    () => [
      ...(argument.name
        ? [
            {
              dt: 'Name',
              dd: argument.name,
            },
          ]
        : []),
      ...(argument.description
        ? [
            {
              dt: 'Description',
              dd: argument.description,
            },
          ]
        : []),
      {
        dt: 'Type',
        dd: argument.hint?.struct ? <Struct struct={argument.hint.struct} /> : argument.type.toString(),
      },
      ...(argument.hint?.defaultArgument
        ? [
            {
              dt: 'Default Argument',
              dd: <DefaultArgument defaultArgument={argument.hint.defaultArgument} />,
            },
          ]
        : []),
    ],
    [argument.description, argument.hint, argument.name, argument.type]
  )

  return (
    <div className="space-y-2">
      <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
      <DescriptionList items={items} />
    </div>
  )
}

function Returns({ returns }: { returns: ReturnsDefinition }) {
  const items = useMemo(
    () => [
      ...(returns.description
        ? [
            {
              dt: 'Description',
              dd: returns.description,
            },
          ]
        : []),
      {
        dt: 'Type',
        dd: returns.hint ? <Struct struct={returns.hint.struct} /> : returns.type.toString(),
      },
    ],
    [returns.description, returns.hint, returns.type]
  )
  return (
    <div>
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </div>
  )
}
