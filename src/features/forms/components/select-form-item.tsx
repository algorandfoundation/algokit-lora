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
  items: SelectOption[]
  placeholder?: string
  className?: string
  newItemText?: string
  onNewItemSelected?: () => void
}

export function SelectFormItem<TSchema extends Record<string, any>>({
  field,
  items,
  placeholder,
  className,
  ...props
}: SelectFormItemProps<TSchema>) {
  // TODO: handle disabled and error class
  return (
    <FormItem field={field} {...props}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <Select onValueChange={onChange} value={value}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={cn(className)}>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormItem>
  )
}
