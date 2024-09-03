import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { Controller } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'

type SelectOption = {
  value: string
  label: string
}
export interface SelectFormItemProps<TSchema extends Record<string, unknown>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function SelectFormItem<TSchema extends Record<string, unknown>>({
  field,
  disabled,
  options,
  placeholder,
  className,
  ...props
}: SelectFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field} disabled={disabled} className={className}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <Select onValueChange={onChange} value={value} disabled={disabled}>
            <SelectTrigger id={field}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormItem>
  )
}
