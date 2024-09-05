import { useMemo } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

type Props<TData extends Record<string, unknown>> = {
  helper: FormFieldHelper<TData>
  length: number
  createChildField: (index: number) => (helper: FormFieldHelper<TData>) => JSX.Element | undefined
}

export function StaticArray<TData extends Record<string, unknown>>({ helper, length, createChildField }: Props<TData>) {
  const items = useMemo(
    () => Array.from({ length: length }, (_, index) => createChildField(index)(helper)),
    [createChildField, helper, length]
  )

  return (
    <div>
      {items.map((child, index) => {
        return <div key={index}>{child}</div>
      })}
    </div>
  )
}
