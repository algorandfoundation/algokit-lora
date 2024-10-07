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
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
} from '@/features/transaction-wizard/models'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { TransactionsBuilder } from '@/features/transaction-wizard/components/transactions-builder'
import { AppCallTransaction, TransactionType } from '@/features/transactions/models'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { Parentheses } from 'lucide-react'
import { buildComposer } from '@/features/transaction-wizard/data/common'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { TransactionsGraph, TransactionsGraphData } from '@/features/transactions-graph'

type Props = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods
}

export function ApplicationMethodDefinitions({ abiMethods, applicationId }: Props) {
  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method method={method} key={index} applicationId={applicationId} readonly={(method.callConfig?.call ?? []).length === 0} />
      ))}
    </Accordion>
  )
}

type MethodProps = {
  method: MethodDefinition
  applicationId: ApplicationId
  readonly: boolean
}

type SendResults = {
  transactionGraph: TransactionsGraphData
  sentAppCalls: AppCallTransaction[]
}

function Method({ method, applicationId, readonly }: MethodProps) {
  const [transaction, setTransaction] = useState<BuildMethodCallTransactionResult | undefined>(undefined)
  const [sendResults, setSendResults] = useState<SendResults | undefined>(undefined)

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Create ABI Method Call Transaction',
    dialogBody: (
      props: DialogBodyProps<
        { transactionType: algosdk.ABITransactionType; transaction?: Partial<BuildTransactionResult> } | undefined,
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        mode={TransactionBuilderMode.Create}
        transactionType={props.data?.transactionType as unknown as algosdk.TransactionType}
        type={BuildableTransactionType.MethodCall}
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
        onComplete:
          method.callConfig && method.callConfig.call.length > 0
            ? (method.callConfig.call[0] as algosdk.OnApplicationComplete as BuildAppCallTransactionResult['onComplete'])
            : undefined,
      },
    })
    if (transaction && transaction.type === BuildableTransactionType.MethodCall) {
      setTransaction(transaction)
    }
  }, [applicationId, method.callConfig, method.name, open])

  const sendTransactions = useCallback(async (transactions: BuildTransactionResult[]) => {
    const composer = await buildComposer(transactions)
    const result = await composer.send()
    const sentTransactions = asTransactionFromSendResult(result)
    const transactionsGraphData = asTransactionsGraphData(sentTransactions)
    const appCallTransactions = sentTransactions.filter((txn) => txn.type === TransactionType.AppCall)
    setSendResults({
      transactionGraph: transactionsGraphData,
      sentAppCalls: appCallTransactions as unknown as AppCallTransaction[],
    })
  }, [])

  const reset = useCallback(() => {
    setTransaction(undefined)
    setSendResults(undefined)
  }, [])

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {method.description && <span className="flex">{method.description}</span>}
        <div className="space-y-2">
          <h4 className="text-primary">Arguments</h4>
          {method.arguments.length > 0 ? (
            <div className="space-y-5">
              {method.arguments.map((argument, index) => (
                <Argument key={index} index={index} argument={argument} />
              ))}
            </div>
          ) : (
            <span className="flex">No arguments.</span>
          )}
        </div>
        <Returns returns={method.returns} />
        {!readonly && (
          <div className="flex justify-end">
            {!transaction && (
              <Button variant="default" className="w-28" onClick={openDialog} icon={<Parentheses size={16} />}>
                Call
              </Button>
            )}
          </div>
        )}
        {transaction && <TransactionsBuilder defaultTransactions={[transaction]} onReset={reset} onSendTransactions={sendTransactions} />}
        {sendResults && (
          <>
            <div className="my-4 flex flex-col gap-2 text-sm">
              <h3>Result</h3>
              <h4>Transaction Visual</h4>
              <TransactionsGraph transactionsGraphData={sendResults.transactionGraph} downloadable={false} />
            </div>
            {sendResults.sentAppCalls.length > 0 && (
              <div className="mt-2 space-y-2">
                <h4>App Call Results</h4>
                <div className="space-y-4">
                  {sendResults.sentAppCalls.map((sentTransaction, index) => (
                    <RenderInlineAsyncAtom key={index} atom={sentTransaction.abiMethod}>
                      {(abiMethod) =>
                        abiMethod ? (
                          <DescriptionList
                            items={[
                              {
                                dt: transactionIdLabel,
                                dd: (
                                  <TransactionLink transactionId={sentTransaction.id} className="text-sm text-primary underline">
                                    {sentTransaction.id}
                                  </TransactionLink>
                                ),
                              },
                              {
                                dt: 'Method name',
                                dd: abiMethod.name,
                              },
                              {
                                dt: 'Return value',
                                dd: <DecodedAbiMethodReturnValue return={abiMethod.return} />,
                              },
                            ]}
                          />
                        ) : undefined
                      }
                    </RenderInlineAsyncAtom>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {dialog}
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
              dt: 'Default',
              dd: <DefaultArgument defaultArgument={argument.hint.defaultArgument} />,
            },
          ]
        : []),
    ],
    [argument.description, argument.hint, argument.name, argument.type]
  )

  return (
    <div>
      <h5 className="mb-1.5 text-primary">{`Argument ${index + 1}`}</h5>
      <DescriptionList items={items} dtClassName="w-24 truncate" />
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
    <div className="space-y-2">
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </div>
  )
}
