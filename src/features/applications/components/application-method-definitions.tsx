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
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Checkbox } from '@/features/common/components/checkbox'
import { Label } from '@/features/common/components/label'
import { ConfirmResourcesDialog, TransactionResources } from './confirm-resources-dialog'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'

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

// TODO: double scroll bar
function Method<TSchema extends z.ZodSchema>({ applicationId, method, appSpec, readonly }: MethodProps<TSchema>) {
  const { activeAddress, signer } = useWallet()
  const [sendMethodCallResult, setSendMethodCallResult] = useState<SendMethodCallResult | undefined>(undefined)
  type TData = z.infer<typeof method.schema>

  const [modalComponent, setModalComponent] = useState<JSX.Element | undefined>(undefined)
  const [transactionResources, setTransactionResources] = useState<TransactionResources[]>([])
  const [confirmResourcePacking, setConfirmResourcePacking] = useState(false)
  const [isConfirmingResources, setIsConfirmingResources] = useState(false)
  const [methodArgs, setMethodArgs] = useState<ABIAppCallArg[]>([])

  const openConfirmResourcesDialog = useCallback(
    async (data: TData) => {
      invariant(!readonly, 'Component is in readonly mode')
      invariant(appSpec, 'A compatible app spec is required when calling ABI methods')
      invariant(activeAddress, connectWalletMessage)

      const methodArgs = await Object.entries(data).reduce(
        async (asyncAcc, [path, value]) => {
          const acc = await asyncAcc
          const index = extractArgumentIndexFromFieldPath(path)
          acc[index] = await method.arguments[index].getAppCallArg(value)
          return acc
        },
        Promise.resolve([] as ABIAppCallArg[])
      )

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
          skipSending: confirmResourcePacking,
        },
      })

      if (result.transactions.length > 0) {
        setMethodArgs(methodArgs)
        // setTransactionResources(
        //   result.transactions.map((transaction) => ({
        //     id: transaction.txID(),
        //     accounts: transaction.appAccounts ?? [],
        //     assets: transaction.appForeignAssets ?? [],
        //     applications: transaction.appForeignApps ?? [],
        //   }))
        // )
        // setIsConfirmingResources(true)
        const dialogData = result.transactions.map((transaction) => ({
          id: transaction.txID(),
          accounts: transaction.appAccounts ?? [],
          assets: transaction.appForeignAssets ?? [],
          applications: transaction.appForeignApps ?? [],
        }))
        const transactionResources = await open(dialogData)
        console.log('transactionResources', transactionResources)
      }
      // TODO: handle errors
    },
    [activeAddress, appSpec, applicationId, method.arguments, method.name, readonly, signer, confirmResourcePacking]
  )

  const handleResourcesConfirmation = useCallback(
    async (transactions: TransactionResources[]) => {
      setIsConfirmingResources(false)

      invariant(!readonly, 'Component is in readonly mode')
      invariant(appSpec, 'A compatible app spec is required when calling ABI methods')
      invariant(activeAddress, connectWalletMessage)

      const client = algorandClient.client.getAppClientById({
        id: applicationId,
        app: appSpec as AppSpec,
      })

      // TODO: NC - Move to the new AlgorandClient approach when ready
      // TODO: how to handle multiple transactions?
      const result = await client.call({
        method: method.name,
        methodArgs,
        sender: {
          addr: activeAddress,
          signer,
        },
        accounts: transactions[0].accounts,
        apps: transactions[0].applications,
        assets: transactions[0].assets,
        sendParams: {
          populateAppCallResources: false,
          skipSending: confirmResourcePacking,
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
    [activeAddress, appSpec, applicationId, method.name, readonly, signer, confirmResourcePacking, methodArgs]
  )

  const sendMethodCall = useCallback(
    async (data: TData) => {
      invariant(!readonly, 'Component is in readonly mode')
      invariant(appSpec, 'A compatible app spec is required when calling ABI methods')
      invariant(activeAddress, connectWalletMessage)

      const methodArgs = await Object.entries(data).reduce(
        async (asyncAcc, [path, value]) => {
          const acc = await asyncAcc
          const index = extractArgumentIndexFromFieldPath(path)
          acc[index] = await method.arguments[index].getAppCallArg(value)
          return acc
        },
        Promise.resolve([] as ABIAppCallArg[])
      )

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
          skipSending: confirmResourcePacking,
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
    [activeAddress, appSpec, applicationId, method.arguments, method.name, readonly, signer, confirmResourcePacking]
  )

  const launchModal = useCallback((component: JSX.Element | undefined) => {
    setModalComponent(component)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: TData) => {
      if (confirmResourcePacking) {
        await openConfirmResourcesDialog(data)
      } else {
        await sendMethodCall(data)
      }
    },
    [confirmResourcePacking, openConfirmResourcesDialog, sendMethodCall]
  )
  // TODO: NC - Add the sender (to support rekeys), fee, and validRounds fields to the bottom of the form

  const { open, close, dialog } = useDialogForm({
    dialogHeader: 'Confirm Resouces',
    dialogBody: (props: DialogBodyProps<TransactionResources[], TransactionResources[]>) => (
      <ConfirmResourcesDialog transactions={props.data} onSubmit={props.onSubmit} onCancel={props.onCancel} />
    ),
  })

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
          onSubmit={handleFormSubmit}
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
                  className="w-28"
                >
                  Reset
                </Button>
                <SubmitButton disabled={!activeAddress} disabledReason={connectWalletMessage} className="w-28">
                  {confirmResourcePacking ? 'Build' : 'Send'}
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
                    <Argument key={index} index={index} argument={argument} helper={helper} readonly={readonly} launchModal={launchModal} />
                  ))
                ) : (
                  <p>No arguments</p>
                )}
              </div>
              <div className="mt-4">
                <Returns returns={method.returns} />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox
                  checked={confirmResourcePacking}
                  onCheckedChange={(checked) => setConfirmResourcePacking(checked === true)}
                  id={`${method.name}-confirm-resource-packing`}
                />
                <Label htmlFor={`${method.name}-confirm-resource-packing`}>Confirm Resource Packing</Label>
              </div>
            </>
          )}
        </Form>
        <div className="flex justify-end">
          <Dialog open={!!modalComponent} onOpenChange={(open) => !open && setModalComponent(undefined)} modal={true}>
            <DialogContent className="bg-card">
              <DialogHeader className="flex-row items-center space-y-0">
                <h2 className="pb-0">Build Transaction</h2>
              </DialogHeader>
              <MediumSizeDialogBody>{modalComponent}</MediumSizeDialogBody>
            </DialogContent>
          </Dialog>
        </div>
        {dialog}
        {/* <Dialog open={isConfirmingResources} onOpenChange={(open) => !open && setIsConfirmingResources(false)} modal={true}>
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">Confirm Resources</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <ConfirmResourcesDialog transactions={transactionResources} onSubmit={handleResourcesConfirmation} />
            </MediumSizeDialogBody>
          </DialogContent>
        </Dialog> */}
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
  launchModal: (component: JSX.Element | undefined) => void
}

function Argument<TSchema extends z.ZodSchema>({ index, argument, helper, readonly, launchModal }: ArgumentProps<TSchema>) {
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
      {!readonly && argument.createField(helper, launchModal)}
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
