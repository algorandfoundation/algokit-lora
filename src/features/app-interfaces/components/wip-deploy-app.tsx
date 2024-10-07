import { useCallback, useState } from 'react'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { Button } from '@/features/common/components/button'
import { BuildableTransactionType, BuildAppCallTransactionResult, BuildTransactionResult } from '@/features/transaction-wizard/models'
import { useWallet } from '@txnlab/use-wallet'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import algosdk from 'algosdk'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { invariant } from '@/utils/invariant'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { TransactionsBuilder } from '@/features/transaction-wizard/components/transactions-builder'
import { Parentheses } from 'lucide-react'
import { algorandClient } from '@/features/common/data/algo-client'
import { SendTransactionResults } from '@algorandfoundation/algokit-utils/types/transaction'

type Props = {
  snapshot: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function WIPDeployApp({ snapshot }: Props) {
  const [state, send] = snapshot
  const [transaction, setTransaction] = useState<BuildAppCallTransactionResult | undefined>(undefined)
  // const { getValues } = useFormContext<DeployAppFormData>()
  const { activeAddress } = useWallet()
  // const [sentAppCallTransactions, setSentAppCallTransactions] = useState<AppCallTransaction[]>([])

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Create Deployment App Call Transaction',
    dialogBody: (
      props: DialogBodyProps<
        { transactionType: algosdk.ABITransactionType; transaction?: Partial<BuildTransactionResult> } | undefined,
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        mode={TransactionBuilderMode.Create}
        transactionType={props.data?.transactionType as unknown as algosdk.TransactionType}
        type={BuildableTransactionType.AppCall}
        defaultValues={props.data?.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const deploy = useCallback(
    async (transactions: BuildTransactionResult[]) => {
      // const values = getValues()
      invariant(state.context.appSpec && 'source' in state.context.appSpec, 'Only ARC32 app spec is supported')
      invariant(state.context.appSpec.source?.approval, 'Approval program is not set')
      invariant(state.context.appSpec.source?.clear, 'Clear program is not set')
      invariant(activeAddress, 'No active wallet account is available')

      const appFactory = algorandClient.client.getAppFactory({
        appSpec: state.context.appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
        defaultSender: activeAddress,
        appName: state.context.name,
        version: state.context.version,
        // deletable: values.deletable,
        // updatable: values.updatable,
      })

      const transaction = transactions[0] as BuildAppCallTransactionResult

      invariant(transaction.onComplete !== algosdk.OnApplicationComplete.ClearStateOC, 'Clear state is not supported for app creates')

      const { result: deployAppResult } = await appFactory.deploy({
        createParams: {
          onComplete: transaction.onComplete,
          args: [],
          // onComplete: algosdk.OnApplicationComplete.NoOpOC,
          // args: [new Uint8Array()],
          // method: '',
          schema: {
            localInts: state.context.appSpec.state?.local.num_uints ?? 0,
            localByteSlices: state.context.appSpec.state?.local.num_byte_slices ?? 0,
            globalInts: state.context.appSpec.state?.global.num_uints ?? 0,
            globalByteSlices: state.context.appSpec.state?.global.num_byte_slices ?? 0,
          },
        },
        onUpdate: 'fail',
        onSchemaBreak: 'fail',
        // deployTimeParams: getTealTemplateParams(unifiedTemplateParamNames, values),
        populateAppCallResources: true,
      })

      console.log(deployAppResult.appId)

      send({ type: 'deploymentCompleted', applicationId: Number(deployAppResult.appId) })

      if (deployAppResult.operationPerformed !== 'nothing') {
        return {
          transactions: deployAppResult.transactions,
          confirmations: [deployAppResult.confirmation],
        } as SendTransactionResults
      }

      return undefined
    },
    [activeAddress, send, state.context.appSpec, state.context.name, state.context.version]
  )

  const openDialog = useCallback(async () => {
    const transaction = await open({
      transactionType: algosdk.ABITransactionType.appl,
      transaction: {
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
      },
    })
    if (transaction && transaction.type === BuildableTransactionType.AppCall) {
      setTransaction(transaction)
    }
  }, [open])

  const handleTransactionSent = useCallback((transactions: Transaction[]) => {
    const appCallTransactions = transactions.filter((txn) => txn.type === TransactionType.AppCall)

    console.log(appCallTransactions)
    // setSentAppCallTransactions(appCallTransactions as unknown as AppCallTransaction[])
  }, [])

  const reset = useCallback(() => {
    setTransaction(undefined)
    // setSentAppCallTransactions([])
  }, [])

  const transactions = transaction ? [transaction] : []

  return (
    <>
      <div className="flex justify-end">
        {!transaction && (
          <Button variant="default" className="w-28" onClick={openDialog} icon={<Parentheses size={16} />}>
            Bare Deploy
          </Button>
        )}
      </div>
      {/* <TransactionsBuilder
        key={transactions.length}
        transactions={transactions}
        onReset={reset}
        handleSend={deploy}
        onTransactionSent={(txns) => handleTransactionSent(txns)}
        renderContext="app-lab"
      /> */}
      <span>Transactions builder here {transactions.length}</span>
      {dialog}
    </>
  )
}
