import { ApplicationAbiMethods, ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo, useState } from 'react'
import { Struct as StructType, DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { Button } from '@/features/common/components/button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { ApplicationId } from '../data/types'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { invariant } from '@/utils/invariant'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { ABIAppCallArg } from '@algorandfoundation/algokit-utils/types/app'
import { extractArgumentIndexFromFieldPath } from '../mappers'
import { toast } from 'react-toastify'
import { TransactionsGraph, TransactionsGraphData } from '@/features/transactions-graph'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { TransactionType } from '@/features/transactions/models'
import { Atom } from 'jotai'
import { AbiMethod } from '@/features/abi-methods/models'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'

type Props<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods<TSchema> // TODO: NC - Get the naming right
}

const connectWalletMessage = 'Please connect a wallet'
export const sendButtonLabel = 'Send'

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions<TSchema extends z.ZodSchema>({ applicationId, abiMethods }: Props<TSchema>) {
  const readonly = !abiMethods.appSpec

  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method applicationId={applicationId} method={method} appSpec={abiMethods.appSpec} key={index} readonly={readonly} />
      ))}
    </Accordion>
  )
}

type MethodProps<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  method: MethodDefinition<TSchema>
  appSpec?: Arc32AppSpec
  readonly: boolean
}

type SendMethodCallResult = {
  transactionId: string
  abiMethod: Atom<Promise<AbiMethod | undefined>>
  transactionsGraphData: TransactionsGraphData
}

function Method<TSchema extends z.ZodSchema>({ applicationId, method, appSpec, readonly }: MethodProps<TSchema>) {
  const { activeAddress, signer } = useWallet()
  const [sendMethodCallResult, setSendMethodCallResult] = useState<SendMethodCallResult | undefined>(undefined)
  type TData = z.infer<typeof method.schema>

  const sendMethodCall = useCallback(
    async (data: TData) => {
      invariant(!readonly, 'Component is in readonly mode')
      invariant(appSpec, 'A compatible app spec is required when calling ABI methods')
      invariant(activeAddress, connectWalletMessage)

      const methodArgs = Object.entries(data).reduce((acc, [path, value]) => {
        const index = extractArgumentIndexFromFieldPath(path)
        acc[index] = method.arguments[index].getAppCallArg(value)
        return acc
      }, [] as ABIAppCallArg[])

      const client = algorandClient.client.getAppClientById({
        id: applicationId,
        app: appSpec as AppSpec,
      })

      // TODO: NC - Move to the new AlgorandClient approach when ready
      const result = await client.call({
        method: method.name,
        methodArgs,
        sender: {
          addr: activeAddress,
          signer,
        },
        sendParams: {
          populateAppCallResources: true,
        },
      })

      const sentTxns = asTransactionFromSendResult(result)
      const methodCallTransactionId = result.transaction.txID()
      const methodCallTransaction = sentTxns.find((txn) => txn.id === methodCallTransactionId)
      invariant(methodCallTransaction && methodCallTransaction.type === TransactionType.AppCall, 'AppCall transaction is expected')
      const transactionsGraphData = asTransactionsGraphData(sentTxns)

      setSendMethodCallResult({
        transactionId: methodCallTransactionId,
        abiMethod: methodCallTransaction.abiMethod,
        transactionsGraphData,
      })

      toast.success('Transaction sent successfully')
    },
    [activeAddress, appSpec, applicationId, method.arguments, method.name, readonly, signer]
  )

  // TODO: NC - Add the sender (to support rekeys), fee, and validRounds fields to the bottom of the form

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <Form
          schema={method.schema}
          defaultValues={method.defaultValues}
          onSubmit={sendMethodCall}
          resetOnSuccess={true}
          formAction={(ctx, resetLocalState) => {
            return !readonly ? (
              <FormActions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetLocalState()
                    setSendMethodCallResult(undefined)
                    ctx.reset()
                  }}
                >
                  Reset
                </Button>
                <SubmitButton disabled={!activeAddress} disabledReason={connectWalletMessage}>
                  {sendButtonLabel}
                </SubmitButton>
              </FormActions>
            ) : undefined
          }}
        >
          {(helper) => (
            <>
              <div className="space-y-4">
                <h4 className="text-primary">Arguments</h4>
                {method.arguments.length > 0 ? (
                  method.arguments.map((argument, index) => (
                    <Argument key={index} index={index} argument={argument} helper={helper} readonly={readonly} />
                  ))
                ) : (
                  <p>No arguments</p>
                )}
              </div>
              <div className="mt-4">
                <Returns returns={method.returns} />
              </div>
            </>
          )}
        </Form>
        {!readonly && sendMethodCallResult && (
          <div className="my-4 flex flex-col gap-4 text-sm">
            <DescriptionList
              items={[
                {
                  dt: transactionIdLabel,
                  dd: (
                    <TransactionLink transactionId={sendMethodCallResult.transactionId} className="text-sm text-primary underline">
                      {sendMethodCallResult.transactionId}
                    </TransactionLink>
                  ),
                },
                {
                  dt: 'Return value',
                  dd: (
                    <RenderInlineAsyncAtom atom={sendMethodCallResult.abiMethod}>
                      {(abiMethod) => (abiMethod ? <DecodedAbiMethodReturnValue return={abiMethod?.return} /> : 'void')}
                    </RenderInlineAsyncAtom>
                  ),
                },
              ]}
            />
            <TransactionsGraph transactionsGraphData={sendMethodCallResult.transactionsGraphData} downloadable={false} />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

type ArgumentProps<TSchema extends z.ZodSchema> = {
  index: number
  argument: ArgumentDefinition<TSchema>
  helper: FormFieldHelper<z.infer<TSchema>>
  readonly: boolean
}

function Argument<TSchema extends z.ZodSchema>({ index, argument, helper, readonly }: ArgumentProps<TSchema>) {
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
      {!readonly && argument.createField(helper)}
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
    <>
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </>
  )
}

function Struct({ struct }: { struct: StructType }) {
  return (
    <div>
      <span>{struct.name}:</span>
      <ul className="pl-4">
        {struct.elements.map((element, index) => (
          <li key={index}>
            {element[0]}: {element[1]}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DefaultArgument({ defaultArgument }: { defaultArgument: DefaultArgumentType }) {
  return (
    <DescriptionList
      items={[
        {
          dt: 'Source',
          dd: defaultArgument.source,
        },
        {
          dt: 'Data',
          dd: defaultArgument.source === 'abi-method' ? defaultArgument.data.name : defaultArgument.data,
        },
      ]}
    />
  )
}
