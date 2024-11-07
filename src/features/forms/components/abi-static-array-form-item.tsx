import { useMemo } from 'react'
import { Label } from '@/features/common/components/label'
import { FieldPath } from 'react-hook-form'

export type AbiStaticArrayFormItemProps<TData extends Record<string, unknown>> = {
  field: FieldPath<TData>
  prefix: string
  length: number
  description?: string
  createChildField: (label: string, index: number) => React.JSX.Element | undefined
}

export function AbiStaticArrayFormItem<TData extends Record<string, unknown>>({
  description,
  prefix,
  length,
  createChildField,
}: AbiStaticArrayFormItemProps<TData>) {
  const items = useMemo(
    () => Array.from({ length: length }, (_, index) => createChildField(`${prefix} ${index + 1}`, index)),
    [createChildField, prefix, length]
  )

  return (
    <div>
      <span className="mt-2 block">{description}</span>
      <div className="mt-2 space-y-2">
        {items.map((child, index) => {
          return (
            <div key={index}>
              <Label>
                {prefix} {index + 1}
              </Label>
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
