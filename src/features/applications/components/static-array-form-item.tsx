import { useMemo } from 'react'
import { Label } from '@/features/common/components/label'
import { FieldPath } from 'react-hook-form'

type Props<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  length: number
  description?: string
  createChildField: (index: number) => JSX.Element | undefined
}

export function StaticArrayFormItem<TData extends Record<string, unknown>>({ description, length, createChildField }: Props<TData>) {
  const items = useMemo(() => Array.from({ length: length }, (_, index) => createChildField(index)), [createChildField, length])

  // TODO: form field, reset
  return (
    <div>
      <Label>Items</Label>
      <span className="mt-2 block">{description}</span>
      <div className="ml-4 mt-4 space-y-2">
        {items.map((child, index) => {
          return <div key={index}>{child}</div>
        })}
      </div>
    </div>
  )
}
