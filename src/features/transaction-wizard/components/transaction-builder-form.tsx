import { Button } from '@/features/common/components/button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'
import { z } from 'zod'
import { TransactionBuilderFields } from './transaction-builder-fields'
import { BuildableTransaction } from '../models'
import algosdk from 'algosdk'
import { algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'

type Props<TSchema extends z.ZodSchema> = {
  buildableTransaction: BuildableTransaction<TSchema>
  defaultSender?: string
}

const connectWalletMessage = 'Please connect a wallet'

export function TransactionBuilderForm<TSchema extends z.ZodSchema>({ buildableTransaction, defaultSender }: Props<TSchema>) {
  const { activeAddress, signer } = useWallet()

  const sendTransaction = useCallback(
    async (values: Parameters<typeof buildableTransaction.createTransaction>[0]) => {
      if (!activeAddress) {
        throw new Error(connectWalletMessage)
      }

      const transaction = await buildableTransaction.createTransaction(values)

      // This isn't amazing, we should add support to the util-ts AlgorandClient for sending a single transaction.
      const atc = new algosdk.AtomicTransactionComposer()
      atc.addTransaction({ txn: transaction, signer })
      await algorandClient.newGroup().addAtc(atc).execute()

      toast.success('Transaction sent successfully')
    },
    [activeAddress, buildableTransaction, signer]
  )

  return (
    <Form
      schema={buildableTransaction.schema}
      defaultValues={
        {
          sender: defaultSender,
          ...buildableTransaction.defaultValues,
        } as Parameters<typeof buildableTransaction.createTransaction>[0]
      }
      onSubmit={sendTransaction}
      formAction={(ctx, resetLocalState) => (
        <FormActions
          key={buildableTransaction.label}
          onInitialise={() => {
            resetLocalState()
            ctx.clearErrors()
          }}
        >
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
          <SubmitButton disabled={!activeAddress} disabledReason={connectWalletMessage}>
            Send
          </SubmitButton>
        </FormActions>
      )}
    >
      {(helper) => <TransactionBuilderFields helper={helper} transaction={buildableTransaction} />}
    </Form>
  )
}
