import algosdk from 'algosdk'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { commonSchema, onCompleteFieldSchema, onCompleteOptions, optionalSenderFieldShape } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { BuildAppCallTransactionResult, BuildableTransactionType } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { asAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import defineSenderAddress from '../utils/defineSenderAddress'
import { useNetworkConfig } from '@/features/network/data'

const formData = zfd.formData({
  ...commonSchema,
  ...optionalSenderFieldShape,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  extraProgramPages: numberSchema(z.number().min(0).max(3).optional()),
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
})

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildAppCallTransactionResult
  activeAccount?: ActiveWalletAccount
  defaultValues?: Partial<BuildAppCallTransactionResult>
  onSubmit: (transaction: BuildAppCallTransactionResult) => void
  onCancel: () => void
}

export function AppCallTransactionBuilder({ mode, transaction, activeAccount, defaultValues: _defaultValues, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AppCall,
        applicationId: BigInt(values.applicationId),
        sender: await defineSenderAddress(values.sender!, networkId),
        onComplete: Number(values.onComplete),
        extraProgramPages: values.extraProgramPages,
        fee: values.fee,
        validRounds: values.validRounds,
        args: values.args.map((arg) => arg.value),
        note: values.note,
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        applicationId: transaction.applicationId !== undefined ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        onComplete: transaction.onComplete.toString(),
        extraProgramPages: transaction.extraProgramPages,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
        args: transaction.args.map((arg) => ({
          id: randomGuid(),
          value: arg,
        })),
      }
    }
    return {
      sender: activeAccount ? asAddressOrNfd(activeAccount) : undefined,
      onComplete: algosdk.OnApplicationComplete.NoOpOC.toString(),
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      applicationId: _defaultValues?.applicationId !== undefined ? BigInt(_defaultValues.applicationId) : undefined,
    }
  }, [mode, activeAccount, _defaultValues?.applicationId, transaction])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">{mode === TransactionBuilderMode.Edit ? 'Update' : 'Add'}</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <div className="space-y-4">
          {defaultValues.applicationId !== 0n &&
            helper.numberField({
              field: 'applicationId',
              label: 'Application ID',
              helpText: 'The application to be called',
            })}
          {helper.selectField({
            field: 'onComplete',
            label: 'On complete',
            options: onCompleteOptions,
            helpText: 'Action to perform after executing the program',
          })}
          {helper.addressField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to call from. Sends the transaction and pays the fee',
          })}
          {defaultValues.applicationId === 0n &&
            helper.numberField({
              field: 'extraProgramPages',
              label: 'Extra program pages',
              helpText: 'Number of additional pages allocated to the programs. If empty this will be calculated automatically',
            })}
          {helper.arrayField({
            field: 'args',
            label: 'Arguments',
            helpText: 'Arguments that can be accessed from the program',
            addButtonLabel: 'Add Argument',
            noItemsLabel: 'No arguments.',
            newItem: () => {
              return {
                id: randomGuid(),
                value: '',
              }
            },
            renderChildField: (_, index) => {
              return helper.textField({
                field: `args.${index}.value`,
                label: `Argument ${index + 1}`,
                helpText: `A base64 encoded bytes value${index === 0 ? '. If using ABI, this should be the method selector' : ''}`,
              })
            },
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
          <TransactionBuilderNoteField />
        </div>
      )}
    </Form>
  )
}
