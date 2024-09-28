import { numberSchema } from '@/features/forms/data/common'
import { addressFieldSchema, commonSchema, receiverFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useEffect, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAssetClawbackTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { AssetSummary } from '@/features/assets/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import { useLoadableAssetSummaryAtom } from '@/features/assets/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AssetId } from '@/features/assets/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useDebounce } from 'use-debounce'

const formSchema = z
  .object({
    ...commonSchema,
    ...senderFieldSchema,
    ...receiverFieldSchema,
    clawbackTarget: addressFieldSchema,
    asset: z
      .object({
        id: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(1)),
        decimals: z.number().optional(),
        unitName: z.string().optional(),
        clawback: z.string().optional(),
      })
      .superRefine((asset, ctx) => {
        if (asset.decimals === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset does not exist',
            path: ['id'],
          })
        } else if (asset.clawback === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset cannot be clawed back',
            path: ['id'],
          })
        }
      }),
    amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' })),
  })
  .superRefine((data, ctx) => {
    if (data.asset.clawback && data.sender && data.sender !== data.asset.clawback) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be the clawback account of the asset',
        path: ['sender'],
      })
    }
  })

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
        helpText: 'The clawback account of the asset. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'receiver',
        label: 'Receiver',
        helpText: 'Account that receives the asset',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.textField({
        field: 'clawbackTarget',
        label: 'Clawback target',
        helpText: 'Account the asset will be clawed back from',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.numberField({
        field: 'asset.id',
        label: <span className="flex items-center gap-1.5">Asset ID {asset && asset.name ? ` (${asset.name})` : ''}</span>,
        helpText: 'The asset to be clawed back',
      })}
      {helper.numberField({
        field: 'amount',
        label: <span className="flex items-center gap-1.5">Amount{asset && asset.unitName ? ` (${asset.unitName})` : ''}</span>,
        helpText: 'Amount to claw back',
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
      setValue('asset.unitName', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.unitName : undefined)
      setValue('asset.clawback', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.clawback : undefined)
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
  transaction?: BuildAssetClawbackTransactionResult
  onSubmit: (transaction: BuildAssetClawbackTransactionResult) => void
  onCancel: () => void
}

export function AssetClawbackTransactionBuilder({ transaction, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        asset: data.asset,
        type: BuildableTransactionType.AssetClawback,
        sender: data.sender,
        receiver: data.receiver,
        clawbackTarget: data.clawbackTarget,
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
      clawbackTarget: transaction.clawbackTarget,
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
