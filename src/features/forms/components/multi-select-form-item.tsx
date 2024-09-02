import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Controller } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { MultiSelect, Option } from '@/features/common/components/multi-selector'

export interface MultiSelectFormItemProps<TSchema extends Record<string, unknown>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: Option[]
  placeholder?: string
  className?: string
  newItemText?: string
  onNewItemSelected?: () => void
}

export function MultiSelectFormItem<TSchema extends Record<string, unknown>>({
  field,
  options,
  placeholder,
  className,
  ...props
}: MultiSelectFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field} className={cn(className)}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            id={field}
            options={options}
            defaultValue={value}
            onValueChange={(selected) => onChange(selected)}
            disabled={props.disabled}
            placeholder={placeholder}
            maxCount={10}
          />
        )}
      />
    </FormItem>
  )
}
