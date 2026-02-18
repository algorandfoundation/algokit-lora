import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'
import {
  optionalAddressFieldSchema,
  commonSchema,
  onCompleteFieldSchema,
  onCompleteOptions,
} from '@/features/transaction-wizard/data/common'
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
import { resolveTransactionSender } from '../utils/resolve-sender-address'
import { toAccessReferences, toAccessReferenceRows } from '@/features/transaction-wizard/mappers/access-reference-form'
import { AccessReferencesEditor, accessReferencesFieldSchema } from './access-references-editor'

const formData = zfd.formData({
  ...commonSchema,
  sender: optionalAddressFieldSchema,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  rejectVersion: numberSchema(z.number().int().min(0).optional()),
  extraProgramPages: numberSchema(z.number().min(0).max(3).optional()),
  accessReferences: accessReferencesFieldSchema,
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
})

type AppCallFormData = z.infer<typeof formData>

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
    async (values: AppCallFormData) => {
      const accessReferences = toAccessReferences(values.accessReferences ?? [])

      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AppCall,
        applicationId: BigInt(values.applicationId),
        sender: await resolveTransactionSender(values.sender),
        onComplete: Number(values.onComplete),
        rejectVersion: values.rejectVersion,
        extraProgramPages: values.extraProgramPages,
        accessReferences: accessReferences.length > 0 ? accessReferences : undefined,
        fee: values.fee,
        validRounds: values.validRounds,
        args: values.args.map((arg) => arg.value),
        note: values.note,
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<AppCallFormData>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        applicationId: transaction.applicationId !== undefined ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender?.autoPopulated ? undefined : transaction.sender,
        onComplete: transaction.onComplete.toString(),
        rejectVersion: transaction.rejectVersion,
        extraProgramPages: transaction.extraProgramPages,
        accessReferences: toAccessReferenceRows(transaction.accessReferences, randomGuid),
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
      onComplete: OnApplicationComplete.NoOp.toString(),
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      applicationId: _defaultValues?.applicationId !== undefined ? BigInt(_defaultValues.applicationId) : undefined,
      rejectVersion: _defaultValues?.rejectVersion,
      accessReferences: toAccessReferenceRows(_defaultValues?.accessReferences, randomGuid),
    }
  }, [mode, activeAccount, _defaultValues?.accessReferences, _defaultValues?.applicationId, _defaultValues?.rejectVersion, transaction])

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
          {helper.numberField({
            field: 'rejectVersion',
            label: 'Reject Version',
            helpText: 'Optional app version guard. Rejects when the app version is greater than or equal to this value.',
          })}
          {helper.addressField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to call from. Sends the transaction and pays the fee - optional for simulating',
          })}
          {defaultValues.applicationId === 0n &&
            helper.numberField({
              field: 'extraProgramPages',
              label: 'Extra program pages',
              helpText: 'Number of additional pages allocated to the programs. If empty this will be calculated automatically',
            })}
          <AccessReferencesEditor helper={helper} />
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
