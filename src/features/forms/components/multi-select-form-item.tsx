/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItemProps } from '@/features/forms/components/form-item.tsx'
import { Controller } from 'react-hook-form'
import MultipleSelector, { Option } from '@/features/common/components/multi-selector.tsx'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from './validation-error-message'
import { useFormFieldError } from '../hooks/use-form-field-error'

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
    <div className={cn('grid', className)}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <MultipleSelector
            commandProps={{ label: props.label }}
            defaultOptions={options}
            value={options.filter((i) => value?.includes(i.value) ?? false)}
            onChange={(selected) => onChange(selected.map((i) => i.value))}
            emptyIndicator={'No results.'}
            disabled={props.disabled}
            placeholder={placeholder}
          />
        )}
      />
      <ValidationErrorMessage message={error?.message} />
    </div>
  )
}
