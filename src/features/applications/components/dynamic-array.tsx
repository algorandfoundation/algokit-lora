import { Button } from '@/features/common/components/button'
import { useCallback, useState } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { FieldPath, Path, PathValue, useFormContext } from 'react-hook-form'

type Props<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  helper: FormFieldHelper<TData>
  createChildField: (index: number) => (helper: FormFieldHelper<TData>) => JSX.Element | undefined
}

type Item = {
  id: number
  element: JSX.Element | undefined
}
// TODO: work out why this is resetted after clicking "Send"
export function DynamicArray<TData extends Record<string, unknown>>({ field, helper, createChildField }: Props<TData>) {
  const { getValues, setValue } = useFormContext<TData>()
  const [items, setItems] = useState<Item[]>([])

  const append = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: new Date().getTime(),
        element: createChildField(prev.length)(helper),
      },
    ])
  }, [createChildField, helper])

  const remove = useCallback(
    (index: number) => {
      const oldValue = getValues(field) as unknown[]
      const newValue = oldValue.filter((_, i) => i !== index) as PathValue<TData, Path<TData>>
      console.log(field, oldValue, newValue)
      setValue(field, newValue)
      setItems((prev) => prev.filter((_, i) => i !== index))
    },
    [field, getValues, setValue]
  )

  return (
    <div>
      {items.map((item, index) => {
        return (
          <div key={item.id}>
            {createChildField(index)(helper)}
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        )
      })}
      <Button type="button" onClick={() => append()}>
        Add
      </Button>
    </div>
  )
}
