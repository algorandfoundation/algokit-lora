import { bigIntSchema } from '@/features/forms/data/common'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { randomGuid } from '@/utils/random-guid'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { FieldArrayPath, FieldPath, FieldValues, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/features/common/components/button'
import { Plus, TrashIcon } from 'lucide-react'
import { AccessReferenceFormRow, AccessReferenceFormType } from '@/features/transaction-wizard/mappers/access-reference-form'

const accessReferenceTypes = [
  { value: AccessReferenceFormType.Account, label: 'Account' },
  { value: AccessReferenceFormType.App, label: 'Application' },
  { value: AccessReferenceFormType.Asset, label: 'Asset' },
  { value: AccessReferenceFormType.Box, label: 'Box' },
  { value: AccessReferenceFormType.Holding, label: 'Holding' },
  { value: AccessReferenceFormType.Locals, label: 'Locals' },
]

export const accessReferenceSchema = z.object({
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

export const accessReferencesFieldSchema = zfd.repeatable(z.array(accessReferenceSchema).max(16))

type AccessReferencesFormData = FieldValues & {
  accessReferences: AccessReferenceFormRow[]
}

const createReferenceRow = (type: AccessReferenceFormType): AccessReferenceFormRow => {
  const base = { id: randomGuid(), type }

  switch (type) {
    case AccessReferenceFormType.Account:
      return { ...base, address: '' }
    case AccessReferenceFormType.App:
      return { ...base, appId: undefined }
    case AccessReferenceFormType.Asset:
      return { ...base, assetId: undefined }
    case AccessReferenceFormType.Box:
      return { ...base, boxAppId: undefined, boxName: '' }
    case AccessReferenceFormType.Holding:
      return { ...base, holdingAddress: '', holdingAssetId: undefined }
    case AccessReferenceFormType.Locals:
      return { ...base, localsAddress: '', localsAppId: undefined }
  }
}

function AccessReferenceFields<TFormData extends AccessReferencesFormData>({
  index,
  helper,
}: {
  index: number
  helper: FormFieldHelper<TFormData>
}) {
  const typeField = `accessReferences.${index}.type` as FieldPath<TFormData>
  const type = useWatch<TFormData>({
    name: typeField,
  }) as AccessReferenceFormType | undefined

  return (
    <div className="space-y-2">
      {helper.selectField({
        field: typeField,
        label: 'Reference Type',
        options: accessReferenceTypes,
      })}

      {type === AccessReferenceFormType.Account &&
        helper.textField({
          field: `accessReferences.${index}.address` as FieldPath<TFormData>,
          label: 'Address',
        })}

      {type === AccessReferenceFormType.App &&
        helper.numberField({
          field: `accessReferences.${index}.appId` as FieldPath<TFormData>,
          label: 'Application ID',
        })}

      {type === AccessReferenceFormType.Asset &&
        helper.numberField({
          field: `accessReferences.${index}.assetId` as FieldPath<TFormData>,
          label: 'Asset ID',
        })}

      {type === AccessReferenceFormType.Box && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.numberField({
            field: `accessReferences.${index}.boxAppId` as FieldPath<TFormData>,
            label: 'Box Application ID',
          })}
          {helper.textField({
            field: `accessReferences.${index}.boxName` as FieldPath<TFormData>,
            label: 'Box Name (base64)',
            helpText: 'Example: AQI= for bytes [1,2].',
          })}
        </div>
      )}

      {type === AccessReferenceFormType.Holding && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.textField({
            field: `accessReferences.${index}.holdingAddress` as FieldPath<TFormData>,
            label: 'Holding Address',
          })}
          {helper.numberField({
            field: `accessReferences.${index}.holdingAssetId` as FieldPath<TFormData>,
            label: 'Holding Asset ID',
          })}
        </div>
      )}

      {type === AccessReferenceFormType.Locals && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {helper.textField({
            field: `accessReferences.${index}.localsAddress` as FieldPath<TFormData>,
            label: 'Locals Address',
          })}
          {helper.numberField({
            field: `accessReferences.${index}.localsAppId` as FieldPath<TFormData>,
            label: 'Locals Application ID',
          })}
        </div>
      )}
    </div>
  )
}

export function AccessReferencesEditor<TFormData extends AccessReferencesFormData>({ helper }: { helper: FormFieldHelper<TFormData> }) {
  const { control } = useFormContext<TFormData>()
  const { fields, append, remove } = useFieldArray<TFormData, FieldArrayPath<TFormData>>({
    control,
    name: 'accessReferences' as FieldArrayPath<TFormData>,
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
            onClick={() => append(createReferenceRow(type.value) as never)}
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
            <AccessReferenceFields<TFormData> index={index} helper={helper} />
          </div>
        ))}
      </div>
    </div>
  )
}
