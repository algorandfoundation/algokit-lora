import { numberSchema } from '@/features/forms/data/common'
import { commonSchema, receiverFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useEffect, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAssetTransferTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { AssetSummary } from '@/features/assets/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import { useLoadableAssetSummaryAtom } from '@/features/assets/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AssetId } from '@/features/assets/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useDebounce } from 'use-debounce'

const formSchema = {
  ...commonSchema,
  ...senderFieldSchema,
  ...receiverFieldSchema,
  asset: z
    .object({
      id: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(1)),
      decimals: z.number().optional(),
    })
    .superRefine((asset, ctx) => {
      if (asset.decimals === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'This asset does not exist',
          path: ['id'],
        })
      }
    }),
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.000001)),
}

const formData = zfd.formData(formSchema)

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
  asset?: AssetSummary
}

function FormFields({ helper, asset }: FormFieldsProps) {
  return (
    <>
      {helper.textField({
        field: 'sender',
        label: 'Sender',
        helpText: 'Account to transfer from. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'receiver',
        label: 'Receiver',
        helpText: 'Account that receives the asset',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.numberField({
        field: 'asset.id',
        label: <span className="flex items-center gap-1.5">Asset ID {asset && asset.name ? ` (${asset.name})` : ''}</span>,
        helpText: 'The asset to be transfered',
      })}
      {helper.numberField({
        field: 'amount',
        label: <span className="flex items-center gap-1.5">Amount{asset && asset.unitName ? ` (${asset.unitName})` : ''}</span>,
        helpText: 'Amount to transfer',
        decimalScale: asset && asset.decimals ? asset.decimals : 0,
      })}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
      {helper.textField({
        field: 'note',
        label: 'Note',
        helpText: 'A note for the transaction',
      })}
    </>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
}

function FormInner({ helper }: FormInnerProps) {
  const formCtx = useFormContext<z.infer<typeof formData>>()

  const assetIdFieldValue = formCtx.watch('asset.id') // This actually comes back as a string value, so we convert below
  const [assetId] = useDebounce(assetIdFieldValue ? Number(assetIdFieldValue) : undefined, 500)

  if (assetId) {
    return <FormFieldsWithAssetInfo helper={helper} formCtx={formCtx} assetId={assetId} />
  }

  return <FormFields helper={helper} />
}

type FieldsWithAssetInfoProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
  formCtx: UseFormReturn<z.infer<typeof formData>>
  assetId: AssetId
}

function FormFieldsWithAssetInfo({ helper, formCtx, assetId }: FieldsWithAssetInfoProps) {
  const loadableAssetSummary = useLoadableAssetSummaryAtom(assetId)
  const { setValue, trigger } = formCtx

  useEffect(() => {
    if (loadableAssetSummary.state !== 'loading') {
      setValue('asset.decimals', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.decimals : undefined)
      trigger('asset')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadableAssetSummary])

  return (
    <RenderLoadable
      loadable={loadableAssetSummary}
      fallback={<FormFields helper={helper} />}
      transformError={() => {
        return <FormFields helper={helper} />
      }}
    >
      {(asset) => <FormFields helper={helper} asset={asset} />}
    </RenderLoadable>
  )
}

type Props = {
  transaction?: BuildAssetTransferTransactionResult
  onSubmit: (transaction: BuildAssetTransferTransactionResult) => void
  onCancel: () => void
}

export function AssetTransferTransactionBuilder({ transaction, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(), // TODO: NC - Why the random uuid?
        asset: data.asset,
        type: BuildableTransactionType.AssetTransfer,
        sender: data.sender,
        receiver: data.receiver,
        amount: data.amount,
        note: data.note,
        fee: {
          setAutomatically: data.fee.setAutomatically,
          value: data.fee.value,
        },
        validRounds: {
          setAutomatically: data.validRounds.setAutomatically,
          firstValid: data.validRounds.firstValid,
          lastValid: data.validRounds.lastValid,
        },
      })
    },
    [onSubmit, transaction?.id]
  )
  const defaultValues = useMemo(() => {
    if (!transaction) {
      return {
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      } satisfies Partial<z.infer<typeof formData>>
    }
    return {
      sender: transaction.sender,
      receiver: transaction.receiver,
      asset: transaction.asset,
      amount: transaction.amount,
      fee: {
        setAutomatically: transaction.fee.setAutomatically,
        value: transaction.fee.value,
      },
      validRounds: {
        setAutomatically: transaction.validRounds.setAutomatically,
        firstValid: transaction.validRounds.firstValid,
        lastValid: transaction.validRounds.lastValid,
      },
      note: transaction.note,
    } satisfies Partial<z.infer<typeof formData>>
  }, [transaction])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}
