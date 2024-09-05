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
import { asTransaction } from '@/features/transactions/mappers'
import { getIndexerTransactionFromAlgodTransaction } from '@algorandfoundation/algokit-subscriber/transform'
import { assetSummaryResolver } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { BlockInnerTransaction, BlockTransaction } from '@algorandfoundation/algokit-subscriber/types/block'
import { TransactionType } from '@/features/transactions/models'
import { Atom } from 'jotai'
import { AbiMethod } from '@/features/abi-methods/models'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import algosdk from 'algosdk'

type Props<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods<TSchema> // TODO: NC - Get the naming right
}

const connectWalletMessage = 'Please connect a wallet'

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions<TSchema extends z.ZodSchema>({ applicationId, abiMethods }: Props<TSchema>) {
  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method
          applicationId={applicationId}
          method={method}
          appSpec={abiMethods.type === 'arc32' ? abiMethods.appSpec : undefined}
          key={index}
        />
      ))}
    </Accordion>
  )
}

type MethodProps<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  method: MethodDefinition<TSchema>
  appSpec?: Arc32AppSpec // TODO: NC - We don't really need to support ARC4 here, so think about this, we need to support arc56 though
}

type SendMethodCallResult = {
  transactionId: string
  abiMethod: Atom<Promise<AbiMethod | undefined>>
  transactionsGraphData: TransactionsGraphData
}

function Method<TSchema extends z.ZodSchema>({ applicationId, method, appSpec }: MethodProps<TSchema>) {
  const { activeAddress, signer } = useWallet()
  const [sendMethodCallResult, setSendMethodCallResult] = useState<SendMethodCallResult | undefined>(undefined)
  type TData = z.infer<typeof method.schema>

  const sendMethodCall = useCallback(
    async (data: TData) => {
      invariant(appSpec, 'An ARC-32 app spec is required when calling ABI methods')
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
      })

      const transactionId = result.transaction.txID()
      const confirmation = result.confirmation!

      const mapBlockTransaction = (res: algosdk.modelsv2.PendingTransactionResponse): BlockTransaction | BlockInnerTransaction => {
        return {
          txn: res.txn.txn,
          dt: {
            // We don't use gd or ld in this context, so don't need to map.
            gd: {},
            ld: {},
            lg: res.logs ?? [],
            itx: res.innerTxns?.map((inner) => mapBlockTransaction(inner)),
          },
        }
      }

      // TODO: NC - Propagate any changes here into the other places
      const transactionResult = getIndexerTransactionFromAlgodTransaction({
        blockTransaction: mapBlockTransaction(confirmation),
        roundOffset: 0,
        roundIndex: 0,
        genesisHash: confirmation.txn.txn.gh,
        genesisId: confirmation.txn.txn.gen,
        roundNumber: Number(confirmation.confirmedRound),
        roundTimestamp: Math.floor(Date.now() / 1000),
        transaction: result.transactions[0],
        logs: confirmation.logs,
      })

      const transaction = asTransaction(transactionResult, assetSummaryResolver, abiMethodResolver)
      invariant(transaction.type === TransactionType.AppCall, 'AppCall transaction expected')

      const transactionsGraphData = asTransactionsGraphData([transaction])

      setSendMethodCallResult({
        transactionId,
        abiMethod: transaction.abiMethod,
        transactionsGraphData,
      })

      toast.success('Transaction sent successfully')
    },
    [activeAddress, appSpec, applicationId, method.arguments, method.name, signer]
  )

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <Form
          schema={method.schema}
          onSubmit={sendMethodCall}
          formAction={(ctx, resetLocalState) => (
            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetLocalState()
                  ctx.reset()
                }}
              >
                Reset
              </Button>
              <SubmitButton>Send</SubmitButton>
            </FormActions>
          )}
        >
          {(helper) => (
            <>
              <div className="space-y-4">
                <h4 className="text-primary">Arguments</h4>
                {method.arguments.length > 0 ? (
                  method.arguments.map((argument, index) => <Argument key={index} index={index} argument={argument} helper={helper} />)
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
        {sendMethodCallResult && (
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
                      {(abiMethod) => (abiMethod ? <DecodedAbiMethodReturnValue methodReturn={abiMethod?.return} /> : 'void')}
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
}

function Argument<TSchema extends z.ZodSchema>({ index, argument, helper }: ArgumentProps<TSchema>) {
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
      {argument.createField(helper)}
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
