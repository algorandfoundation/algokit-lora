import { useCallback, useMemo } from 'react'
import { Label } from '@/features/common/components/label'
import { FieldPath } from 'react-hook-form'
import { Struct } from '@/features/app-interfaces/data/types/arc-32/application'

export type AbiTupleFormItemProps<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  prefix: string
  length: number
  description?: string
  createChildField: (label: string, index: number) => React.JSX.Element | undefined
  struct?: Struct
}

export function AbiTupleFormItem<TData extends Record<string, unknown>>({
  description,
  prefix,
  length,
  createChildField,
  struct,
}: AbiTupleFormItemProps<TData>) {
  const getLabel = useCallback(
    (index: number) => {
      if (!struct) {
        return `${prefix} ${index + 1}`
      } else {
        return struct.elements[index][0]
      }
    },
    [prefix, struct]
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
