import { Button } from '@/features/common/components/button'
import { FieldArray, FieldPath, FieldValues, Path, useFieldArray } from 'react-hook-form'
import { TrashIcon } from 'lucide-react'
import { Label } from '@/features/common/components/label'

type Props<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  description?: string
  createChildField: (index: number) => JSX.Element | undefined
}

// TODO: style the remove button
export function DynamicArrayFormItem<TData extends Record<string, unknown>>({ field, description, createChildField }: Props<TData>) {
  const { fields, append, remove } = useFieldArray({
    name: field,
  })

  return (
    <div>
      <Label>Items</Label>
      <span className="mt-2 block">{description}</span>
      <div className="ml-4 mt-4 space-y-2">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex w-full gap-4">
              <div className="grow">{createChildField(index)}</div>
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
      <Button
        className="mt-4"
        type="button"
        onClick={() =>
          append({
            id: new Date().getTime().toString(),
          } as FieldArray<FieldValues, Path<TData>>)
        }
      >
        Add
      </Button>
    </div>
  )
}
