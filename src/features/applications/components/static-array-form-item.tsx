import { Fragment, useMemo } from 'react'
import { Controller, FieldPath } from 'react-hook-form'
import { FormItem } from '@/features/forms/components/form-item'

type Props<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  length: number
  description?: string
  createChildField: (index: number) => JSX.Element | undefined
}

export function StaticArrayFormItem<TData extends Record<string, unknown>>({ field, description, length, createChildField }: Props<TData>) {
  const items = useMemo(() => Array.from({ length: length }, (_, index) => createChildField(index)), [createChildField, length])

  return (
    <FormItem field={field} label="Items">
      <Controller
        name={field}
        render={() => (
          <div>
            <span className="mt-2 block">{description}</span>
            <div className="ml-4 mt-4 space-y-2">
              {items.map((child, index) => {
                return <Fragment key={index}>{child}</Fragment>
              })}
            </div>
          </div>
        )}
      />
    </FormItem>
  )
}
