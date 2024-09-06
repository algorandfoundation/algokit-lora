import { useMemo } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Label } from '@/features/common/components/label'

type Props<TData extends Record<string, unknown>> = {
  helper: FormFieldHelper<TData>
  length: number
  description?: string
  createChildField: (index: number) => (helper: FormFieldHelper<TData>) => JSX.Element | undefined
}

export function StaticArrayFormItem<TData extends Record<string, unknown>>({
  helper,
  description,
  length,
  createChildField,
}: Props<TData>) {
  const items = useMemo(
    () => Array.from({ length: length }, (_, index) => createChildField(index)(helper)),
    [createChildField, helper, length]
  )

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
