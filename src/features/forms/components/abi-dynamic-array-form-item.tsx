import { Button } from '@/features/common/components/button'
import { FieldArray, FieldPath, FieldValues, Path, useFieldArray } from 'react-hook-form'
import { Plus, TrashIcon } from 'lucide-react'
import { Label } from '@/features/common/components/label'

export type AbiDynamicArrayFormItemProps<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  prefix: string
  description?: string
  createChildField: (label: string, index: number) => React.JSX.Element | undefined
}

export function AbiDynamicArrayFormItem<TData extends Record<string, unknown>>({
  field,
  prefix,
  description,
  createChildField,
}: AbiDynamicArrayFormItemProps<TData>) {
  const { fields, append, remove } = useFieldArray({
    name: field,
  })

  return (
    <div>
      <span className="mt-2 block">{description}</span>
      <div className="mt-2 space-y-2">
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <div className="flex items-center gap-2">
                <Label className="!mt-0">
                  {prefix} {index + 1}
                </Label>
                <Button type="button" variant="destructive" size="xs" onClick={() => remove(index)} icon={<TrashIcon size={16} />}></Button>
              </div>
              <div className="mt-2 w-full border-l-2 border-dashed pl-4">
                <div className="grow">{createChildField(`${prefix} ${index + 1}`, index)}</div>
              </div>
            </div>
          )
        })}
        <Button
          variant="no-style"
          type="button"
          className="text-secondary"
          onClick={() =>
            append({
              id: new Date().getTime().toString(),
            } as FieldArray<FieldValues, Path<TData>>)
          }
          icon={<Plus size={16} />}
        >
          Add item
        </Button>
      </div>
    </div>
  )
}
