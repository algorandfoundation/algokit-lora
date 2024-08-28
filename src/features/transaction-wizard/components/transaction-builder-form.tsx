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
    async (values: z.infer<typeof buildableTransaction.schema>) => {
      if (!activeAddress) {
        throw new Error(connectWalletMessage)
      }

      const transaction = await buildableTransaction.createTransaction(values)

      // TODO: NC - Add support to util-ts AlgorandClient for sending a single transaction, then switch this code.
      const atc = new algosdk.AtomicTransactionComposer()
      atc.addTransaction({ txn: transaction, signer })
      await algorandClient.newGroup().addAtc(atc).execute()

      toast.success('Transaction sent successfully')
    },
    [activeAddress, buildableTransaction, signer]
  )

  // TODO: NC - Get rid of the default values cast

  return (
    <Form
      schema={buildableTransaction.schema}
      defaultValues={
        {
          sender: defaultSender,
          fee: {
            setAutomatically: true,
          },
          validRounds: {
            setAutomatically: true,
          },
        } as z.infer<typeof buildableTransaction.schema>
      }
      onSubmit={sendTransaction}
      formAction={
        <FormActions>
          <Button type="button" variant="outline" onClick={() => {}}>
            Reset fields
          </Button>
          <SubmitButton disabled={!activeAddress} disabledReason={connectWalletMessage}>
            Send
          </SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <TransactionBuilderFields helper={helper} transaction={buildableTransaction} />}
    </Form>
  )
}
