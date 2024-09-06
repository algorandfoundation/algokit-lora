import { Button } from '@/features/common/components/button'
import { useCallback, useState } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { FieldPath, Path, PathValue, useFormContext } from 'react-hook-form'
import { Label } from '@/features/common/components/label'
import { TrashIcon } from 'lucide-react'
import { HintText } from '@/features/forms/components/hint-text'

type Props<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  description?: string
  helper: FormFieldHelper<TData>
  createChildField: (index: number) => (helper: FormFieldHelper<TData>) => JSX.Element | undefined
}

type Item = {
  id: number
  element: JSX.Element | undefined
}

// TODO: validations:
// 1. Expected array, received string
// TODO: work out why this is resetted after clicking "Send"
export function DynamicArray<TData extends Record<string, unknown>>({ field, description, helper, createChildField }: Props<TData>) {
  const { getValues, setValue, getFieldState } = useFormContext<TData>()
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

      setValue(field, newValue)
      setItems((prev) => prev.filter((_, i) => i !== index))
    },
    [field, getValues, setValue]
  )

  console.log(getValues(field))
  const error = getFieldState(field).error

  return (
    <div>
      <Label>Items</Label>
      <span className="mt-2 block">{description}</span>
      <div className="ml-4 mt-4 space-y-2">
        {items.map((item, index) => {
          return (
            <div key={item.id} className="flex w-full gap-4">
              <div className="grow">{createChildField(index)(helper)}</div>
              <Button
                className="mt-[1.375rem]"
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                icon={<TrashIcon />}
              ></Button>
            </div>
          )
        })}
      </div>
      <Button className="mt-4" type="button" onClick={() => append()}>
        Add
      </Button>
      {getFieldState(field).error && (
        <div className="mt-2">
          <HintText errorText={error?.message} />
        </div>
      )}
    </div>
  )
}
