import { numberSchema } from '@/features/forms/data/common'
import { addressFieldSchema, commonSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAssetFreezeTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { AssetSummary } from '@/features/assets/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import { useLoadableAssetSummaryAtom } from '@/features/assets/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AssetId } from '@/features/assets/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useDebounce } from 'use-debounce'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { freezeAssetLabel, unfreezeAssetLabel } from '../mappers'
import { asAddressOrNfd } from '../mappers/as-address-or-nfd'

const formSchema = z
  .object({
    ...commonSchema,
    ...senderFieldSchema,
    freezeTarget: addressFieldSchema,
    frozen: z.string(),
    asset: z
      .object({
        id: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(1)),
        decimals: z.number().optional(),
        unitName: z.string().optional(),
        freeze: z.string().optional(),
      })
      .superRefine((asset, ctx) => {
        if (asset.decimals === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset does not exist',
            path: ['id'],
          })
        } else if (asset.freeze === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset cannot be frozen or unfrozen',
            path: ['id'],
          })
        }
      }),
  })
  .superRefine((data, ctx) => {
    if (data.asset.freeze && data.sender && data.sender.resolvedAddress && data.sender.resolvedAddress !== data.asset.freeze) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be the freeze account of the asset',
        path: ['sender.value'],
      })
    }
  })

const formData = zfd.formData(formSchema)

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
  asset?: AssetSummary
}

const freezeOptions = [
  { value: 'true', label: freezeAssetLabel },
  { value: 'false', label: unfreezeAssetLabel },
]

function FormFields({ helper, asset }: FormFieldsProps) {
  return (
    <>
      {helper.numberField({
        field: 'asset.id',
        label: <span className="flex items-center gap-1.5">Asset ID {asset && asset.name ? ` (${asset.name})` : ''}</span>,
        helpText: 'The asset to be frozen',
      })}
      {helper.addressField({
        field: 'sender',
        label: 'Sender',
        helpText: 'The freeze account of the asset. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.addressField({
        field: 'freezeTarget',
        label: 'Freeze target',
        helpText: 'Account the asset will be frozen or unfrozen in',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.radioGroupField({
        field: 'frozen',
        label: 'Action',
        options: freezeOptions,
      })}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
      <TransactionBuilderNoteField />
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
  const { setValue, trigger, getValues } = formCtx
  const [initialAssetLoad, setInitialAssetLoad] = useState(true)

  useEffect(() => {
    if (loadableAssetSummary.state !== 'loading') {
      if ((initialAssetLoad && getValues('asset.decimals') === undefined) || !initialAssetLoad) {
        setValue('asset.decimals', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.decimals : undefined)
        setValue('asset.unitName', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.unitName : undefined)
        setValue(
          'sender',
          loadableAssetSummary.state === 'hasData' ? asAddressOrNfd(loadableAssetSummary.data.freeze ?? '') : asAddressOrNfd('')
        )
        setValue('asset.freeze', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.freeze : undefined)
        trigger('asset')
      }
      if (initialAssetLoad) {
        setInitialAssetLoad(false)
      }
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
  mode: TransactionBuilderMode
  transaction?: BuildAssetFreezeTransactionResult
  onSubmit: (transaction: BuildAssetFreezeTransactionResult) => void
  onCancel: () => void
}

export function AssetFreezeTransactionBuilder({ mode, transaction, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AssetFreeze,
        asset: data.asset,
        sender: data.sender,
        freezeTarget: data.freezeTarget,
        frozen: data.frozen === 'true' ? true : false,
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
        asset: transaction.asset,
        sender: transaction.sender,
        freezeTarget: transaction.freezeTarget,
        frozen: transaction.frozen ? 'true' : 'false',
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
      }
    }
    return {
      // We don't want to populate activeAddress as the sender, as the asset freeze address is what's needed
      frozen: 'true',
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
    }
  }, [mode, transaction])

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
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}
