import { Button } from '@/features/common/components/button'
import { TrashIcon } from 'lucide-react'
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
}

export function ArrayFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  label,
  field,
  renderChildField,
  newItem,
  max,
  addButtonLabel = 'Add',
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
    <div className="space-y-2">
      <h4 className="text-primary">{label}</h4>
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
      <Button type="button" className="mt-2" disabled={isAtMax} onClick={appendItem}>
        {addButtonLabel}
      </Button>
    </div>
  )
}
