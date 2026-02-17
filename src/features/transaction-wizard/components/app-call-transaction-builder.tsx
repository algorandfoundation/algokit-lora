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
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  AccessReferenceFormType,
  toAccessReferences,
  toAccessReferenceRows,
} from '@/features/transaction-wizard/mappers/access-reference-form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Button } from '@/features/common/components/button'
import { Plus, TrashIcon } from 'lucide-react'

const accessReferenceTypes = [
  { value: AccessReferenceFormType.Account, label: 'Account' },
  { value: AccessReferenceFormType.App, label: 'Application' },
  { value: AccessReferenceFormType.Asset, label: 'Asset' },
  { value: AccessReferenceFormType.Box, label: 'Box' },
  { value: AccessReferenceFormType.Holding, label: 'Holding' },
  { value: AccessReferenceFormType.Locals, label: 'Locals' },
]

const accessReferenceSchema = z.object({
  id: z.string(),
  type: z.enum([
    AccessReferenceFormType.Account,
    AccessReferenceFormType.App,
    AccessReferenceFormType.Asset,
    AccessReferenceFormType.Box,
    AccessReferenceFormType.Holding,
    AccessReferenceFormType.Locals,
  ]),
  address: zfd.text(z.string().optional()),
  appId: bigIntSchema(z.bigint().min(0n).optional()),
  assetId: bigIntSchema(z.bigint().min(0n).optional()),
  boxAppId: bigIntSchema(z.bigint().min(0n).optional()),
  boxName: zfd.text(z.string().optional()),
  holdingAddress: zfd.text(z.string().optional()),
  holdingAssetId: bigIntSchema(z.bigint().min(0n).optional()),
  localsAddress: zfd.text(z.string().optional()),
  localsAppId: bigIntSchema(z.bigint().min(0n).optional()),
})

const formData = zfd.formData({
  ...commonSchema,
  sender: optionalAddressFieldSchema,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  rejectVersion: numberSchema(z.number().int().min(0).optional()),
  extraProgramPages: numberSchema(z.number().min(0).max(3).optional()),
  accessReferences: zfd.repeatable(z.array(accessReferenceSchema).max(16)),
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

const createReferenceRow = (type: AccessReferenceFormType) => {
  const base = { id: randomGuid(), type }

  switch (type) {
    case AccessReferenceFormType.Account:
      return { ...base, address: '' }
    case AccessReferenceFormType.App:
      return { ...base, appId: '' as unknown as bigint }
    case AccessReferenceFormType.Asset:
      return { ...base, assetId: '' as unknown as bigint }
    case AccessReferenceFormType.Box:
      return { ...base, boxAppId: '' as unknown as bigint, boxName: '' }
    case AccessReferenceFormType.Holding:
      return { ...base, holdingAddress: '', holdingAssetId: '' as unknown as bigint }
    case AccessReferenceFormType.Locals:
      return { ...base, localsAddress: '', localsAppId: '' as unknown as bigint }
  }
}

function AccessReferenceFields({ index, helper }: { index: number; helper: FormFieldHelper<AppCallFormData> }) {
  const type = useWatch<AppCallFormData>({
    name: `accessReferences.${index}.type`,
  }) as AccessReferenceFormType | undefined

  return (
    <div className="space-y-2">
      {helper.selectField({
        field: `accessReferences.${index}.type`,
        label: 'Reference Type',
        options: accessReferenceTypes,
      })}

      {type === AccessReferenceFormType.Account &&
        helper.textField({
          field: `accessReferences.${index}.address`,
          label: 'Address',
        })}

      {type === AccessReferenceFormType.App &&
        helper.numberField({
          field: `accessReferences.${index}.appId`,
          label: 'Application ID',
        })}

      {type === AccessReferenceFormType.Asset &&
        helper.numberField({
          field: `accessReferences.${index}.assetId`,
          label: 'Asset ID',
        })}

      {type === AccessReferenceFormType.Box && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.numberField({
            field: `accessReferences.${index}.boxAppId`,
            label: 'Box Application ID',
          })}
          {helper.textField({
            field: `accessReferences.${index}.boxName`,
            label: 'Box Name (base64)',
            helpText: 'Example: AQI= for bytes [1,2].',
          })}
        </div>
      )}

      {type === AccessReferenceFormType.Holding && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.textField({
            field: `accessReferences.${index}.holdingAddress`,
            label: 'Holding Address',
          })}
          {helper.numberField({
            field: `accessReferences.${index}.holdingAssetId`,
            label: 'Holding Asset ID',
          })}
        </div>
      )}

      {type === AccessReferenceFormType.Locals && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.textField({
            field: `accessReferences.${index}.localsAddress`,
            label: 'Locals Address',
          })}
          {helper.numberField({
            field: `accessReferences.${index}.localsAppId`,
            label: 'Locals Application ID',
          })}
        </div>
      )}
    </div>
  )
}

function AccessReferencesEditor({ helper }: { helper: FormFieldHelper<AppCallFormData> }) {
  const { control } = useFormContext<AppCallFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accessReferences',
  })

  const isAtMax = fields.length >= 16

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-primary">Access References</h4>
      </div>
      <p className="text-muted-foreground text-sm">
        Add unified references directly by type. When populated, legacy account/app/asset/box lists are ignored.
      </p>
      <div className="flex flex-wrap gap-2">
        {accessReferenceTypes.map((type) => (
          <Button
            key={type.value}
            type="button"
            variant="outline-secondary"
            size="sm"
            disabled={isAtMax}
            disabledReason="Resources are at capacity"
            icon={<Plus size={14} />}
            onClick={() => append(createReferenceRow(type.value))}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {fields.length === 0 && <p className="text-sm">No access references.</p>}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-md border p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Reference {index + 1}</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => remove(index)}
                icon={<TrashIcon size={14} />}
              >
                Remove
              </Button>
            </div>
            <AccessReferenceFields index={index} helper={helper} />
          </div>
        ))}
      </div>
    </div>
  )
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
