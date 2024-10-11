import { useCallback, useState } from 'react'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { Button } from '@/features/common/components/button'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
} from '@/features/transaction-wizard/models'
import { useWallet } from '@txnlab/use-wallet'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import algosdk from 'algosdk'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { invariant } from '@/utils/invariant'
import { TransactionsBuilder } from '@/features/transaction-wizard/components/transactions-builder'
import { ArrowLeft, Parentheses, Rocket } from 'lucide-react'
import { algorandClient } from '@/features/common/data/algo-client'
import { isArc32AppSpec } from '@/features/common/utils'
import { asAppCallTransactionParams } from '@/features/transaction-wizard/mappers'
import { asApplicationAbiMethods } from '@/features/applications/mappers'
import { Arc32AppSpec } from '../data/types'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

// TODO: NC - Support populate on app calls - approvalProgram and clearStateProgram are required for application creation

export function WIPDeployApp({ machine }: Props) {
  const [state, send] = machine
  invariant(state.context.appSpec && isArc32AppSpec(state.context.appSpec), 'ARC32 app spec is required')
  const [transaction, setTransaction] = useState<BuildAppCallTransactionResult | BuildMethodCallTransactionResult | undefined>(undefined)
  const { activeAddress } = useWallet()

  const appSpec = state.context.appSpec

  const { open, dialog } = useDialogForm({
    // TODO: NC - This name needs fixing
    dialogHeader: 'Create Deployment App Call Transaction',
    dialogBody: (
      props: DialogBodyProps<
        {
          type: BuildableTransactionType.AppCall | BuildableTransactionType.MethodCall
          transaction?: Partial<BuildTransactionResult>
        },
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        mode={TransactionBuilderMode.Create}
        transactionType={algosdk.TransactionType.appl}
        type={props.data.type}
        defaultValues={props.data.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const deploy = useCallback(
    async (transactions: BuildTransactionResult[]) => {
      invariant(appSpec && 'source' in appSpec, 'Only ARC32 app spec is supported')
      invariant(appSpec.source?.approval, 'Approval program is not set')
      invariant(appSpec.source?.clear, 'Clear program is not set')
      invariant(activeAddress, 'No active wallet account is available')
      invariant(transactions.length === 1, 'Only one deploy transaction is supported')
      const deployTransaction = transactions[0] // TODO: NC - Do we need to go more complex?
      invariant(
        [BuildableTransactionType.AppCall, BuildableTransactionType.MethodCall].includes(deployTransaction.type),
        'Only app call transactions are supported'
      )
      const appFactory = algorandClient.client.getAppFactory({
        appSpec: state.context.appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
        defaultSender: activeAddress,
        appName: state.context.name,
        version: state.context.version,
        updatable: state.context.updatable,
        deletable: state.context.deletable,
      })

      // TODO: NC - App call transactions don't need an app id

      const { appId: _, ...appCallParams } =
        deployTransaction.type === BuildableTransactionType.AppCall
          ? asAppCallTransactionParams(deployTransaction)
          : { appId: 0n, onComplete: algosdk.OnApplicationComplete.NoOpOC } // TODO: NC - Fix this
      invariant(appCallParams.onComplete !== algosdk.OnApplicationComplete.ClearStateOC, 'Clear state is not supported for app creates')

      const { result } = await appFactory.deploy({
        createParams: {
          ...appCallParams,
          onComplete: appCallParams.onComplete,
          // method: '',
          schema: {
            localInts: appSpec.state?.local.num_uints ?? 0,
            localByteSlices: appSpec.state?.local.num_byte_slices ?? 0,
            globalInts: appSpec.state?.global.num_uints ?? 0,
            globalByteSlices: appSpec.state?.global.num_byte_slices ?? 0,
          },
        },
        onUpdate: 'append',
        onSchemaBreak: 'append',
        deployTimeParams: state.context.templateParams,
        populateAppCallResources: true,
      })

      send({ type: 'deploymentCompleted', applicationId: Number(result.appId) })
    },
    [
      activeAddress,
      appSpec,
      send,
      state.context.appSpec,
      state.context.deletable,
      state.context.name,
      state.context.templateParams,
      state.context.updatable,
      state.context.version,
    ]
  )

  const back = useCallback(() => {
    send({ type: 'deploymentCancelled' })
  }, [send])

  const openDialog = useCallback(
    async (type: BuildableTransactionType.AppCall | BuildableTransactionType.MethodCall, appSpec?: Arc32AppSpec, methodName?: string) => {
      const transaction = await open({
        type,
        transaction: {
          applicationId: 0,
          ...(methodName && appSpec
            ? {
                methodName,
                appSpec,
              }
            : undefined),
          // onComplete: algosdk.OnApplicationComplete.NoOpOC, // TODO: NC - Set this based on the app spec info
        },
      })
      if (
        transaction &&
        (transaction.type === BuildableTransactionType.AppCall || transaction.type === BuildableTransactionType.MethodCall)
      ) {
        setTransaction(transaction)
      }
    },
    [open]
  )

  const reset = useCallback(() => {
    setTransaction(undefined)
  }, [])

  const transactions = transaction ? [transaction] : []

  // TODO: NC - Handle the transition better
  // TODO: NC - Render all the deployable ABI methods

  //

  const abiMethods = asApplicationAbiMethods(appSpec)
  const temp = abiMethods.methods.reduce((acc, method) => {
    // method.abiMethod
    // method.name
    // method.arguments
    if ((method.callConfig?.create ?? []).length > 0) {
      return [...acc, method.name]
    }
    return acc
  }, [] as string[])

  return (
    <div className="duration-300 animate-in fade-in-20">
      <div className="flex justify-end">
        {transactions.length === 0 && (
          <>
            {temp.map((method, index) => (
              <Button
                key={index}
                variant="default"
                onClick={() => openDialog(BuildableTransactionType.MethodCall, appSpec, method)}
                icon={<Parentheses size={16} />}
              >
                {method}
              </Button>
            ))}
            <Button variant="default" onClick={() => openDialog(BuildableTransactionType.AppCall)} icon={<Parentheses size={16} />}>
              Bare Deploy
            </Button>
          </>
        )}
      </div>
      <TransactionsBuilder
        key={transactions.length}
        defaultTransactions={transactions}
        onReset={reset}
        onSendTransactions={deploy}
        disableAddTransaction
        additionalActions={
          <Button onClick={back} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
        }
        sendButtonConfig={{ label: 'Deploy', icon: <Rocket size={16} /> }}
      />
      {dialog}
    </div>
  )
}
