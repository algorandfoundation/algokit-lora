import { useCallback, useMemo, useState } from 'react'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
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
import { asAppCallTransactionParams, asMethodCallParams } from '@/features/transaction-wizard/mappers'
import { asApplicationAbiMethods } from '@/features/applications/mappers'
import { Arc32AppSpec, TemplateParamType } from '../../data/types'
import { CreateOnComplete } from '@algorandfoundation/algokit-utils/types/app-factory'
import { AppClientBareCallParams, AppClientMethodCallParams } from '@algorandfoundation/algokit-utils/types/app-client'
import { MethodDefinition } from '@/features/applications/models'
import { DescriptionList, DescriptionListItems } from '@/features/common/components/description-list'
import { base64ToBytes } from '@/utils/base64-to-bytes'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

const getTealTemplateParams = (templateParams: ReturnType<typeof useCreateAppInterfaceStateMachine>[0]['context']['templateParams']) => {
  if (!templateParams) {
    return undefined
  }

  return templateParams.reduce(
    (acc, templateParam) => {
      const type = templateParam.type
      const value = templateParam.value
      if (type === TemplateParamType.String) {
        acc[templateParam.name] = value
      }
      if (type === TemplateParamType.Number) {
        acc[templateParam.name] = Number(value)
      }
      if (type === TemplateParamType.Uint8Array) {
        acc[templateParam.name] = base64ToBytes(value)
      }
      return acc
    },
    {} as Record<string, string | number | Uint8Array>
  )
}

export function DeployApp({ machine }: Props) {
  const [state, send] = machine
  invariant(state.context.appSpec && isArc32AppSpec(state.context.appSpec), 'ARC32 app spec is required')
  const [transaction, setTransaction] = useState<BuildAppCallTransactionResult | BuildMethodCallTransactionResult | undefined>(undefined)
  const { activeAddress } = useWallet()

  const appSpec = state.context.appSpec

  const asDeployCreateParams = async (
    transaction: BuildTransactionResult
  ): Promise<(AppClientMethodCallParams & CreateOnComplete) | (AppClientBareCallParams & CreateOnComplete)> => {
    if (transaction.type === BuildableTransactionType.MethodCall) {
      const { appId: _, ...params } = await asMethodCallParams(transaction)
      return {
        ...params,
        method: params.method.name,
        onComplete: params.onComplete,
      } satisfies AppClientMethodCallParams & CreateOnComplete
    } else if (transaction.type === BuildableTransactionType.AppCall) {
      const { appId: _, ...params } = asAppCallTransactionParams(transaction)
      invariant(params.onComplete !== algosdk.OnApplicationComplete.ClearStateOC, 'Clear state is not supported for app creates')
      return {
        ...params,
        onComplete: params.onComplete,
      } satisfies AppClientBareCallParams & CreateOnComplete
    }
    throw new Error('Invalid transaction type')
  }

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Build Transaction',
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
      const appCallTransactions = transactions.filter((t) => {
        return [BuildableTransactionType.AppCall, BuildableTransactionType.MethodCall].includes(t.type)
      })
      invariant(appCallTransactions.length > 0, 'An app call transaction is required')
      const deployTransaction = appCallTransactions[appCallTransactions.length - 1]

      const appFactory = algorandClient.client.getAppFactory({
        appSpec: state.context.appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
        defaultSender: activeAddress,
        appName: state.context.name,
        version: state.context.version,
        updatable: state.context.updatable,
        deletable: state.context.deletable,
      })

      const { result } = await appFactory.deploy({
        createParams: {
          ...(await asDeployCreateParams(deployTransaction)),
          schema: {
            localInts: appSpec.state?.local.num_uints ?? 0,
            localByteSlices: appSpec.state?.local.num_byte_slices ?? 0,
            globalInts: appSpec.state?.global.num_uints ?? 0,
            globalByteSlices: appSpec.state?.global.num_byte_slices ?? 0,
          },
        },
        onUpdate: 'append',
        onSchemaBreak: 'append',
        deployTimeParams: getTealTemplateParams(state.context.templateParams),
        populateAppCallResources: true,
      })

      send({ type: 'deploymentCompleted', applicationId: Number(result.appId), roundFirstValid: result.updatedRound })
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
    async (
      type: BuildableTransactionType.AppCall | BuildableTransactionType.MethodCall,
      appSpec?: Arc32AppSpec,
      method?: MethodDefinition
    ) => {
      const createCallConfig = (method?.callConfig?.create ?? []).filter((c) => c !== algosdk.OnApplicationComplete.UpdateApplicationOC)
      const onComplete = createCallConfig.length > 0 ? (createCallConfig[0] as BuildAppCallTransactionResult['onComplete']) : undefined
      const transaction = await open({
        type,
        transaction: {
          applicationId: 0,
          ...(method && appSpec
            ? {
                method: method.abiMethod,
                appSpec,
                onComplete,
              }
            : undefined),
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

  const abiMethods = asApplicationAbiMethods(appSpec)
  const deploymentOptions = useMemo(() => {
    return abiMethods.methods
      .reduce((acc, method, index) => {
        if ((method.callConfig?.create ?? []).length > 0) {
          return [
            ...acc,
            {
              dt: method.name,
              dd: (
                <Button
                  key={index}
                  variant="default"
                  onClick={() => openDialog(BuildableTransactionType.MethodCall, appSpec, method)}
                  icon={<Parentheses size={16} />}
                >
                  Call
                </Button>
              ),
            },
          ]
        }
        return acc
      }, [] as DescriptionListItems)
      .concat({
        dt: 'Bare',
        dd: (
          <Button variant="default" onClick={() => openDialog(BuildableTransactionType.AppCall)} icon={<Parentheses size={16} />}>
            Call
          </Button>
        ),
      })
  }, [abiMethods.methods, appSpec, openDialog])

  return (
    <div className="duration-300 animate-in fade-in-20">
      {transactions.length === 0 && (
        <div className="mb-4">
          <DescriptionList items={deploymentOptions} dtClassName="self-center" />
        </div>
      )}
      <TransactionsBuilder
        key={transactions.length}
        defaultTransactions={transactions}
        onReset={reset}
        onSendTransactions={deploy}
        disableAddTransaction
        additionalActions={
          <Button type="button" variant="outline" className="w-24" onClick={back} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
        }
        sendButtonConfig={{ label: 'Deploy', icon: <Rocket size={16} /> }}
        disablePopulate={true}
      />
      {dialog}
    </div>
  )
}
