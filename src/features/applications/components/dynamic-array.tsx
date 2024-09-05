import { Button } from '@/features/common/components/button'
import { useCallback, useState } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

type Props<TData extends Record<string, unknown>> = {
  helper: FormFieldHelper<TData>
  createChildField: (index: number) => (helper: FormFieldHelper<TData>) => JSX.Element | undefined
}

export function DynamicArray<TData extends Record<string, unknown>>({ helper, createChildField }: Props<TData>) {
  const [items, setItems] = useState<(JSX.Element | undefined)[]>([])

  const onAdd = useCallback(() => {
    setItems((prev) => [...prev, createChildField(prev.length)(helper)])
  }, [createChildField, helper])

  const onRemove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div>
      {items.map((child, index) => {
        return (
          <div key={index}>
            {child}
            <Button onClick={() => onRemove(index)}>Remove</Button>
          </div>
        )
      })}
      <Button onClick={onAdd}>Add</Button>
    </div>
  )
}
