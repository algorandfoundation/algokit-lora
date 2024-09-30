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
import { BuildableTransactionType, BuildMethodCallTransactionResult, BuildTransactionResult } from '@/features/transaction-wizard/models'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { TransactionsBuilder } from '@/features/transaction-wizard/components/transactions-builder'
import { AppCallTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { invariant } from '@/utils/invariant'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { Parentheses } from 'lucide-react'

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
  const [transaction, setTransaction] = useState<BuildMethodCallTransactionResult | undefined>(undefined)
  const [sentTransaction, setSentTransaction] = useState<AppCallTransaction | undefined>(undefined)

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
      },
    })
    if (transaction && transaction.type === BuildableTransactionType.MethodCall) {
      setTransaction(transaction)
    }
  }, [applicationId, method.name, open])

  const handleTransactionSent = useCallback(
    (buildTransactionResultToAlgosdkTransactionMap: Map<string, string>, transactions: Transaction[]) => {
      invariant(transaction, 'Transaction is undefined')

      const algosdkTxId = buildTransactionResultToAlgosdkTransactionMap.get(transaction.id)
      const algosdkTransaction = transactions.find((tx) => tx.id === algosdkTxId)
      invariant(algosdkTransaction, 'Algosdk transaction not found')
      invariant(algosdkTransaction.type === TransactionType.AppCall, 'Algosdk transaction is not an AppCall')

      setSentTransaction(algosdkTransaction)
    },
    [transaction]
  )

  const reset = useCallback(() => {
    setTransaction(undefined)
    setSentTransaction(undefined)
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
        <div className="flex justify-end">
          {!transaction && (
            <Button variant="default" className="w-28" onClick={openDialog} icon={<Parentheses size={16} />}>
              Call
            </Button>
          )}
        </div>
        {transaction && (
          <TransactionsBuilder
            transactions={[transaction]}
            onReset={reset}
            onTransactionSent={(map, txns) => handleTransactionSent(map, txns)}
            renderContext="app-lab"
          />
        )}
        {sentTransaction && (
          <div className="mt-2 space-y-2">
            <h4>Method Call Result</h4>
            <div>
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
                    dt: 'Return value',
                    dd: (
                      <RenderInlineAsyncAtom atom={sentTransaction.abiMethod}>
                        {(abiMethod) => (abiMethod ? <DecodedAbiMethodReturnValue return={abiMethod?.return} /> : 'void')}
                      </RenderInlineAsyncAtom>
                    ),
                  },
                ]}
              />
            </div>
          </div>
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
