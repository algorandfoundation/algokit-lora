/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, FormItemProps } from '@/features/forms/components/form-item.tsx'
import { Controller } from 'react-hook-form'
import MultipleSelector, { Option } from '@/features/common/components/multi-selector.tsx'

export interface MultiSelectFormItemProps<TSchema extends Record<string, any>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: Option[]
  placeholder?: string
  className?: string
  newItemText?: string
  onNewItemSelected?: () => void
}

export function MultiSelectFormItem<TSchema extends Record<string, any>>({
  field,
  options,
  placeholder,
  className,
  ...props
}: MultiSelectFormItemProps<TSchema>) {
  return (
    <FormItem field={field} {...props}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <MultipleSelector
            defaultOptions={options}
            value={options.filter((i) => value?.includes(i.value) ?? false)}
            onChange={(selected) => onChange(selected.map((i) => i.value))}
            emptyIndicator={'No results.'}
            disabled={props.disabled}
          ></MultipleSelector>
        )}
      />
    </FormItem>
  )
}
