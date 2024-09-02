import { Button } from '@/features/common/components/button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { TransactionBuilderFields } from './transaction-builder-fields'
import { BuildableTransaction } from '../models'
import algosdk from 'algosdk'
import { algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransaction } from '@/features/transactions/mappers'
import { assetSummaryResolver } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { getIndexerTransactionFromAlgodTransaction } from '@algorandfoundation/algokit-subscriber/transform'
import { TransactionsGraph, TransactionsGraphData } from '@/features/transactions-graph'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'

type Props<TSchema extends z.ZodSchema> = {
  buildableTransaction: BuildableTransaction<TSchema>
  defaultSender?: string
}

const connectWalletMessage = 'Please connect a wallet'
export const sendButtonLabel = 'Send'

type SendTransactionResult = {
  transactionId: string
  transactionsGraphData: TransactionsGraphData
}

export function TransactionBuilderForm<TSchema extends z.ZodSchema>({ buildableTransaction, defaultSender }: Props<TSchema>) {
  const { activeAddress, signer } = useWallet()

  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const sendTransaction = useCallback(
    async (values: Parameters<typeof buildableTransaction.createTransaction>[0]) => {
      if (!activeAddress) {
        throw new Error(connectWalletMessage)
      }

      const transaction = await buildableTransaction.createTransaction(values)

      // This isn't amazing, we should add support to the util-ts AlgorandClient for sending a single transaction.
      const atc = new algosdk.AtomicTransactionComposer()
      atc.addTransaction({ txn: transaction, signer })
      const result = await algorandClient.newGroup().addAtc(atc).execute()

      const transactionId = result.txIds[0]
      const confirmation = result.confirmations[0]
      const transactionResult = getIndexerTransactionFromAlgodTransaction({
        blockTransaction: {
          txn: confirmation.txn.txn,
        },
        roundOffset: 0,
        roundIndex: 0,
        genesisHash: confirmation.txn.txn.gh,
        genesisId: confirmation.txn.txn.gen,
        roundNumber: Number(confirmation.confirmedRound),
        roundTimestamp: Math.floor(Date.now() / 1000),
        transaction: result.transactions[0],
      })
      const transactionsGraphData = asTransactionsGraphData([asTransaction(transactionResult, assetSummaryResolver, abiMethodResolver)])

      setSendTransactionResult({
        transactionId,
        transactionsGraphData,
      })

      toast.success('Transaction sent successfully')
    },
    [activeAddress, buildableTransaction, signer]
  )

  // NOTE: Number fields need the default value `'' as unknown as undefined` in order to be cleared.
  return (
    <>
      <Form
        schema={buildableTransaction.schema}
        defaultValues={
          {
            sender: defaultSender,
            fee: {
              setAutomatically: true,
              value: '' as unknown as undefined,
            },
            validRounds: {
              setAutomatically: true,
              firstValid: '' as unknown as undefined,
              lastValid: '' as unknown as undefined,
            },
            ...buildableTransaction.defaultValues,
          } as Parameters<typeof buildableTransaction.createTransaction>[0]
        }
        onSubmit={sendTransaction}
        resetOnSuccess={true}
        formAction={(ctx, resetLocalState) => (
          <FormActions
            key={buildableTransaction.label}
            onInit={() => {
              resetLocalState()
              setSendTransactionResult(undefined)
              ctx.clearErrors()
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetLocalState()
                setSendTransactionResult(undefined)
                ctx.reset()
              }}
            >
              Reset
            </Button>
            <SubmitButton disabled={!activeAddress} disabledReason={connectWalletMessage}>
              {sendButtonLabel}
            </SubmitButton>
          </FormActions>
        )}
      >
        {(helper) => <TransactionBuilderFields helper={helper} transaction={buildableTransaction} />}
      </Form>
      {sendTransactionResult && (
        <div className="my-4 flex flex-col gap-4 text-sm">
          <DescriptionList
            items={[
              {
                dt: transactionIdLabel,
                dd: (
                  <TransactionLink transactionId={sendTransactionResult.transactionId} className={cn('text-primary underline text-sm')}>
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
    </>
  )
}
