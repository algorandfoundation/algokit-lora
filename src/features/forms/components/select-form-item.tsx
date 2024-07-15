/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { Controller } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'

type SelectOption = {
  value: string
  label: string
}
export interface SelectFormItemProps<TSchema extends Record<string, any>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function SelectFormItem<TSchema extends Record<string, any>>({
  field,
  options,
  placeholder,
  className,
  ...props
}: SelectFormItemProps<TSchema>) {
  return (
    <FormItem field={field} {...props}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <Select onValueChange={onChange} value={value} disabled={props.disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={cn(className)}>
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
