import { Controller, FieldPath } from 'react-hook-form'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'
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
    <>
      <Controller
        name={field}
        shouldUnregister={true}
        render={({ field: { value, onChange } }) => (
          <div className={cn('ml-0.5 flex items-center space-x-2', className)}>
            <Checkbox id={field} checked={value} onCheckedChange={onChange} {...rest} />
            {label && (
              <Label htmlFor={field} aria-invalid={Boolean(error)}>
                {label}
              </Label>
            )}
          </div>
        )}
      />
      <ValidationErrorMessage message={error?.message as string} />
    </>
  )
}
