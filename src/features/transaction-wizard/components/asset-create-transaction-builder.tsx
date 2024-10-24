import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { commonSchema, optionalAddressFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAssetCreateTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'

const formSchema = {
  ...commonSchema,
  ...senderFieldSchema,
  total: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  decimals: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0).max(19)),
  assetName: zfd.text(z.string().optional()),
  unitName: zfd.text(z.string().optional()),
  url: zfd.text(z.string().optional()),
  metadataHash: zfd.text(z.string().optional()),
  defaultFrozen: z.boolean().optional(),
  manager: optionalAddressFieldSchema,
  reserve: optionalAddressFieldSchema,
  freeze: optionalAddressFieldSchema,
  clawback: optionalAddressFieldSchema,
}

const formData = zfd.formData(formSchema)

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
}

function FormFields({ helper }: FormFieldsProps) {
  return (
    <>
      {helper.textField({
        field: 'assetName',
        label: 'Asset name',
        helpText: "Name of the asset. Can't be changed after creation",
      })}
      {helper.textField({
        field: 'unitName',
        label: 'Unit name',
        helpText: "Name of a unit of the asset. Can't be changed after creation",
      })}
      {helper.numberField({
        field: 'total',
        label: 'Total',
        helpText: "Total number of units to create. Can't be changed after creation",
      })}
      {helper.numberField({
        field: 'decimals',
        label: 'Decimals',
        helpText: "Set to 0 for a non-divisible asset. Can't be changed after creation",
      })}
      {helper.textField({
        field: 'sender',
        label: 'Creator',
        helpText: 'Account that creates the asset. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'manager',
        label: 'Manager',
        helpText: "Account that can re-configure and destroy the asset. If empty, the asset can't be re-configured",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'reserve',
        label: 'Reserve',
        helpText: "Account that holds the reserve units of the asset. If empty, this address can't be changed",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'freeze',
        label: 'Freeze',
        helpText: "Account that can freeze the asset. If empty, assets can't be frozen and this address can't be changed",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'clawback',
        label: 'Clawback',
        helpText: "Account that can claw back the asset. If empty, assets can't be clawed back and this address can't be changed",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.checkboxField({
        field: 'defaultFrozen',
        label: 'Freeze holdings of this asset by default',
        helpText: "Can't be changed after creation",
      })}
      {helper.textField({
        field: 'url',
        label: 'URL',
        helpText: "URL for information about the asset. Can't be changed after creation",
      })}
      {helper.textField({
        field: 'metadataHash',
        label: 'Metadata hash',
        helpText: "Base64 encoded metadata hash. Can't be changed after creation",
      })}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
      <TransactionBuilderNoteField />
    </>
  )
}

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildAssetCreateTransactionResult
  activeAddress?: string
  onSubmit: (transaction: BuildAssetCreateTransactionResult) => void
  onCancel: () => void
}

export function AssetCreateTransactionBuilder({ mode, transaction, activeAddress, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AssetCreate,
        assetName: data.assetName,
        unitName: data.unitName,
        total: data.total,
        decimals: data.decimals,
        sender: data.sender,
        manager: data.manager,
        reserve: data.reserve,
        freeze: data.freeze,
        clawback: data.clawback,
        defaultFrozen: data.defaultFrozen ?? false,
        url: data.url,
        metadataHash: data.metadataHash,
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
        assetName: transaction.assetName,
        unitName: transaction.unitName,
        total: transaction.total,
        decimals: transaction.decimals,
        sender: transaction.sender,
        manager: transaction.manager,
        reserve: transaction.reserve,
        freeze: transaction.freeze,
        clawback: transaction.clawback,
        defaultFrozen: transaction.defaultFrozen,
        url: transaction.url,
        metadataHash: transaction.metadataHash,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
      }
    }

    return {
      sender: activeAddress,
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
