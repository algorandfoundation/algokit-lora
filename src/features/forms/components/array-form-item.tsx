import { Button } from '@/features/common/components/button'
import { Plus, TrashIcon } from 'lucide-react'
import React, { useCallback } from 'react'
import { FieldArray, FieldArrayWithId, FieldPath, FieldValues, Path, useFieldArray } from 'react-hook-form'
import { FormItemProps } from './form-item'

export interface ArrayFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  field: FieldPath<TSchema>
  renderChildField: (childField: FieldArrayWithId<FieldValues, Path<TSchema>, 'id'>, index: number) => React.ReactNode
  newItem: () => FieldArray<FieldValues, Path<TSchema>>
  max?: number
  addButtonLabel?: string
  noItemsLabel?: string
}

export function ArrayFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  label,
  field,
  renderChildField,
  newItem,
  max,
  addButtonLabel = 'Add',
  noItemsLabel = 'No items.',
}: ArrayFormItemProps<TSchema>) {
  const { fields, append, remove } = useFieldArray({
    name: field,
  })

  const isAtMax = Boolean(max && fields.length >= max)
  const appendItem = useCallback(() => {
    if (isAtMax) {
      return
    }
    append(newItem())
  }, [append, isAtMax, newItem])

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-2">
        <h4 className="text-primary">{label}</h4>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isAtMax}
          disabledReason="Resources are at capacity"
          onClick={appendItem}
          className={'ml-auto'}
          icon={<Plus size={16} />}
        >
          {addButtonLabel}
        </Button>
      </div>

      {fields.map((childField, index) => (
        <div key={childField.id} className="flex gap-2">
          <div className="grow">{renderChildField(childField, index)}</div>
          <Button
            type="button"
            className="mt-6"
            variant="destructive"
            size="sm"
            onClick={() => remove(index)}
            icon={<TrashIcon size={16} />}
          />
        </div>
      ))}
      {fields.length === 0 && <p className="relative ml-auto items-center pb-2 text-sm">{noItemsLabel}</p>}
    </div>
  )
}
