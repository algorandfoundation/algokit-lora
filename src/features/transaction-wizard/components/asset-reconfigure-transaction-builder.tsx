import { bigIntSchema } from '@/features/forms/data/common'
import { commonSchema, optionalAddressFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAssetReconfigureTransactionResult } from '../models'
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
import { asAddressOrNfd, asOptionalAddressOrNfd, asOptionalAddressOrNfdSchema } from '../mappers/as-address-or-nfd'

export const assetReconfigureFormSchema = z
  .object({
    ...commonSchema,
    ...senderFieldSchema,
    asset: z
      .object({
        id: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' }).min(1n)),
        decimals: z.number().optional(), // This field is used to determine if an asset has been resolved
        unitName: z.string().optional(),
        manager: z.string().optional(),
      })
      .superRefine((asset, ctx) => {
        if (asset.decimals === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset does not exist',
            path: ['id'],
          })
        } else if (asset.id && asset.decimals !== undefined && !asset.manager) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Asset cannot be reconfigured',
            path: ['id'],
          })
        }
      }),
    manager: optionalAddressFieldSchema,
    reserve: optionalAddressFieldSchema,
    freeze: optionalAddressFieldSchema,
    clawback: optionalAddressFieldSchema,
  })
  .superRefine((data, ctx) => {
    if (data.asset.manager && data.sender && data.sender.resolvedAddress && data.sender.resolvedAddress !== data.asset.manager) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be the manager account of the asset',
        path: ['sender.value'],
      })
    }
  })

const formData = zfd.formData(assetReconfigureFormSchema)

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof formData>>
  asset?: AssetSummary
}

function FormFields({ helper, asset }: FormFieldsProps) {
  return (
    <>
      {helper.numberField({
        field: 'asset.id',
        label: <span className="flex items-center gap-1.5">Asset ID {asset && asset.name ? ` (${asset.name})` : ''}</span>,
        helpText: 'The asset to be reconfigured',
      })}
      {helper.addressField({
        field: 'sender',
        label: 'Sender',
        helpText: 'The manager account of the asset. Sends the transaction and pays the fee',
        placeholder: ZERO_ADDRESS,
      })}
      {helper.addressField({
        field: 'manager',
        label: 'Manager',
        helpText: "Account that can re-configure and destroy the asset. If empty, the asset can't be re-configured",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.addressField({
        field: 'reserve',
        label: 'Reserve',
        helpText: "Account that holds the reserve units of the asset. If empty, this address can't be changed",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.addressField({
        field: 'freeze',
        label: 'Freeze',
        helpText: "Account that can freeze the asset. If empty, assets can't be frozen and this address can't be changed",
        placeholder: ZERO_ADDRESS,
      })}
      {helper.addressField({
        field: 'clawback',
        label: 'Clawback',
        helpText: "Account that can claw back the asset. If empty, assets can't be clawed back and this address can't be changed",
        placeholder: ZERO_ADDRESS,
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
  const [assetId] = useDebounce(assetIdFieldValue ? BigInt(assetIdFieldValue) : undefined, 500)

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
      // This logic prevents any default values being overridden on load when a transaction is edited
      if ((initialAssetLoad && getValues('asset.decimals') === undefined) || !initialAssetLoad) {
        setValue('asset.decimals', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.decimals : undefined)
        setValue('asset.unitName', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.unitName : undefined)
        setValue(
          'sender',
          loadableAssetSummary.state === 'hasData' ? asAddressOrNfd(loadableAssetSummary.data.manager ?? '') : asAddressOrNfd('')
        )
        setValue('asset.manager', loadableAssetSummary.state === 'hasData' ? loadableAssetSummary.data.manager : undefined)
        setValue(
          'manager',
          loadableAssetSummary.state === 'hasData'
            ? asOptionalAddressOrNfdSchema(loadableAssetSummary.data.manager)
            : asOptionalAddressOrNfdSchema(undefined)
        )
        setValue(
          'reserve',
          loadableAssetSummary.state === 'hasData'
            ? asOptionalAddressOrNfdSchema(loadableAssetSummary.data.reserve)
            : asOptionalAddressOrNfdSchema(undefined)
        )
        setValue(
          'freeze',
          loadableAssetSummary.state === 'hasData'
            ? asOptionalAddressOrNfdSchema(loadableAssetSummary.data.freeze)
            : asOptionalAddressOrNfdSchema(undefined)
        )
        setValue(
          'clawback',
          loadableAssetSummary.state === 'hasData'
            ? asOptionalAddressOrNfdSchema(loadableAssetSummary.data.clawback)
            : asOptionalAddressOrNfdSchema(undefined)
        )
        trigger()
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
  transaction?: BuildAssetReconfigureTransactionResult
  onSubmit: (transaction: BuildAssetReconfigureTransactionResult) => void
  onCancel: () => void
}

export function AssetReconfigureTransactionBuilder({ mode, transaction, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AssetReconfigure,
        asset: data.asset,
        sender: data.sender,
        manager: asOptionalAddressOrNfd(data.manager),
        reserve: asOptionalAddressOrNfd(data.reserve),
        freeze: asOptionalAddressOrNfd(data.freeze),
        clawback: asOptionalAddressOrNfd(data.clawback),
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
        manager: transaction.manager,
        reserve: transaction.reserve,
        freeze: transaction.freeze,
        clawback: transaction.clawback,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
      }
    }
    return {
      // We don't want to populate activeAddress as the sender, as the asset manager address is what's needed
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
