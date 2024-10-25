import { commonSchema, requiredMessage, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useEffect, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildKeyRegistrationTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext } from 'react-hook-form'
import { bigIntSchema } from '@/features/forms/data/common'
import { offlineKeyRegistrationLabel, onlineKeyRegistrationLabel } from '../mappers'

const formSchema = z
  .object({
    ...commonSchema,
    ...senderFieldSchema,
    online: z.string(),
    voteKey: z.string().optional(),
    selectionKey: z.string().optional(),
    stateProofKey: z.string().optional(),
    voteFirstValid: bigIntSchema(z.bigint().min(1n).optional()),
    voteLastValid: bigIntSchema(z.bigint().min(1n).optional()),
    voteKeyDilution: bigIntSchema(z.bigint().min(1n).optional()),
  })
  .superRefine((schema, ctx) => {
    if (schema.online === 'true') {
      if (!schema.voteKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['voteKey'],
        })
      }
      if (!schema.selectionKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['selectionKey'],
        })
      }
      if (!schema.stateProofKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['stateProofKey'],
        })
      }
      if (schema.voteFirstValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['voteFirstValid'],
        })
      }
      if (schema.voteLastValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['voteLastValid'],
        })
      }
      if (schema.voteKeyDilution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ['voteKeyDilution'],
        })
      }
    }
  })
const formData = zfd.formData(formSchema)

const registrationOptions = [
  { value: 'true', label: onlineKeyRegistrationLabel },
  { value: 'false', label: offlineKeyRegistrationLabel },
]

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
}

function FormFields({ helper }: FormFieldsProps) {
  const { watch, clearErrors, setValue } = useFormContext<z.infer<typeof formData>>()
  const online = watch('online')

  useEffect(() => {
    if (online === 'false') {
      clearErrors('voteKey')
      setValue('voteKey', '')
      clearErrors('selectionKey')
      setValue('selectionKey', '')
      clearErrors('stateProofKey')
      setValue('stateProofKey', '')
      clearErrors('voteFirstValid')
      setValue('voteFirstValid', '' as unknown as bigint)
      clearErrors('voteLastValid')
      setValue('voteLastValid', '' as unknown as bigint)
      clearErrors('voteKeyDilution')
      setValue('voteKeyDilution', '' as unknown as bigint)
    }
  }, [clearErrors, online, setValue])

  return (
    <>
      {helper.textField({
        field: 'sender',
        label: 'Sender',
        helpText: 'Account to perform the key registration. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.radioGroupField({
        field: 'online',
        label: 'Registration',
        options: registrationOptions,
      })}
      {online === 'true' && (
        <>
          {helper.textField({
            field: 'voteKey',
            label: 'Voting key',
            helpText: 'The root participation public key, base64 encoded',
            required: true,
          })}
          {helper.textField({
            field: 'selectionKey',
            label: 'Selection key',
            helpText: 'The VRF public key, base64 encoded',
            required: true,
          })}
          {helper.textField({
            field: 'stateProofKey',
            label: 'State proof key',
            helpText: 'The 64 byte state proof public key commitment, base64 encoded',
          })}
          {helper.numberField({
            field: 'voteFirstValid',
            label: 'First voting round',
            helpText: 'The first round that the participation key is valid',
            required: true,
          })}
          {helper.numberField({
            field: 'voteLastValid',
            label: 'Last voting round',
            helpText: 'The last round that the participation key is valid',
            required: true,
          })}
          {helper.numberField({
            field: 'voteKeyDilution',
            label: 'Vote key dilution',
            helpText: 'The dilution for the 2-level participation key',
            required: true,
          })}
        </>
      )}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
      <TransactionBuilderNoteField />
    </>
  )
}

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildKeyRegistrationTransactionResult
  activeAddress?: string
  onSubmit: (transaction: BuildKeyRegistrationTransactionResult) => void
  onCancel: () => void
}

export function KeyRegistrationTransactionBuilder({ mode, transaction, activeAddress, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.KeyRegistration,
        sender: data.sender,
        online: data.online === 'true' ? true : false,
        voteKey: data.voteKey,
        selectionKey: data.selectionKey,
        stateProofKey: data.stateProofKey,
        voteFirstValid: data.voteFirstValid,
        voteLastValid: data.voteLastValid,
        voteKeyDilution: data.voteKeyDilution,
        fee: data.fee,
        validRounds: data.validRounds,
        note: data.note,
      })
    },
    [onSubmit, transaction?.id]
  )
  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        sender: transaction.sender,
        online: transaction.online ? 'true' : 'false',
        voteKey: transaction.voteKey,
        selectionKey: transaction.selectionKey,
        stateProofKey: transaction.stateProofKey,
        voteFirstValid: transaction.voteFirstValid,
        voteLastValid: transaction.voteLastValid,
        voteKeyDilution: transaction.voteKeyDilution,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
      }
    }

    return {
      sender: activeAddress,
      online: 'true',
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
    }
  }, [activeAddress, mode, transaction])

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
      {(helper) => <FormFields helper={helper} />}
    </Form>
  )
}
