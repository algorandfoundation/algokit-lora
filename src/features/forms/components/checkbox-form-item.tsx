import { Controller, FieldPath } from 'react-hook-form'
import { ValidationErrorOrHelpMessage } from '@/features/forms/components/validation-error-or-help-message'
import { Checkbox } from '@/features/common/components/checkbox'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { Label } from '@/features/common/components/label'
import { cn } from '@/features/common/utils'

export interface CheckboxFormItemProps<TSchema extends Record<string, unknown>> {
  className?: string
  field: FieldPath<TSchema>
  label: string
  disabled?: boolean
}

export function CheckboxFormItem<TSchema extends Record<string, unknown>>({
  className,
  field,
  label,
  ...rest
}: CheckboxFormItemProps<TSchema>) {
  const error = useFormFieldError(field)

  return (
    <Controller
      name={field}
      render={({ field: { value, onChange } }) => (
        <div className={cn('ml-0.5 flex items-center space-x-2', className)}>
          <Checkbox id={field} name={field} checked={value} onCheckedChange={onChange} {...rest} />
          {label && (
            <Label htmlFor={field} aria-invalid={Boolean(error)}>
              {label}
            </Label>
          )}
          <ValidationErrorOrHelpMessage errorText={error?.message} />
        </div>
      )}
    />
  )
}
