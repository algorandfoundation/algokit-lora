/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Controller } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from './validation-error-message'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { MultiSelect, Option } from '@/features/common/components/multi-selector'

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
  const error = useFormFieldError(field)

  return (
    <FormItem field={field} {...props} className={cn('grid', className)}>
      <>
        <Controller
          name={field}
          render={({ field: { value, onChange } }) => (
            <MultiSelect
              options={options}
              defaultValue={value}
              onValueChange={(selected) => onChange(selected)}
              disabled={props.disabled}
              placeholder={placeholder}
              maxCount={10}
            />
          )}
        />
        <ValidationErrorMessage message={error?.message} />
      </>
    </FormItem>
  )
}
