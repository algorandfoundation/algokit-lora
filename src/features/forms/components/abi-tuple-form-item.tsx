import { useCallback, useMemo } from 'react'
import { Label } from '@/features/common/components/label'
import { FieldPath } from 'react-hook-form'
import { StructFieldDefinition } from '@/features/applications/models'

export type AbiTupleFormItemProps<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  prefix: string
  length: number
  description?: string
  createChildField: (label: string, index: number) => React.JSX.Element | undefined
  structFields?: StructFieldDefinition[]
}

export function AbiTupleFormItem<TData extends Record<string, unknown>>({
  description,
  prefix,
  length,
  createChildField,
  structFields,
}: AbiTupleFormItemProps<TData>) {
  const getLabel = useCallback(
    (index: number) => {
      if (!structFields) {
        return `${prefix} ${index + 1}`
      } else {
        return structFields[index].name
      }
    },
    [prefix, structFields]
  )

  const items = useMemo(
    () => Array.from({ length: length }, (_, index) => createChildField(getLabel(index), index)),
    [length, createChildField, getLabel]
  )

  return (
    <div>
      <span className="mt-2 block">{description}</span>
      <div className="mt-2 space-y-2">
        {items.map((child, index) => {
          return (
            <div key={index}>
              <Label>{getLabel(index)}</Label>
              <div className="mt-2 w-full border-l-2 border-dashed pl-4">
                <div className="grow">{child}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
