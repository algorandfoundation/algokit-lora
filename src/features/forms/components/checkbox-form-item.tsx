/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, FieldPath } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'
import { Checkbox } from '@/features/common/components/checkbox'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'

export interface CheckboxFormItemProps<TSchema extends Record<string, any>> {
  className?: string
  field: FieldPath<TSchema>
  label: string
  disabled?: boolean
}

export function CheckboxFormItem<TSchema extends Record<string, any>>({
  className,
  field,
  label,
  ...rest
}: CheckboxFormItemProps<TSchema>) {
  const error = useFormFieldError(field)

  // TODO: handle disabled and error class
  return (
    <div>
      <label className={cn(className)} aria-invalid={error ? 'true' : 'false'}>
        <Controller
          name={field}
          render={({ field: { value, onChange } }) => (
            <>
              <Checkbox checked={value} onCheckedChange={onChange} {...rest} />
              {label && <span>{label}</span>}
            </>
          )}
        />
      </label>
      <ValidationErrorMessage message={error?.message as string} />
    </div>
  )
}
