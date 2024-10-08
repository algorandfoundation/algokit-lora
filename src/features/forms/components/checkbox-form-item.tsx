import { Controller, FieldPath } from 'react-hook-form'
import { HintText } from '@/features/forms/components/hint-text'
import { Checkbox } from '@/features/common/components/checkbox'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { Label } from '@/features/common/components/label'
import { cn } from '@/features/common/utils'

export interface CheckboxFormItemProps<TSchema extends Record<string, unknown>> {
  className?: string
  field: FieldPath<TSchema>
  label: string
  disabled?: boolean
  helpText?: string | React.ReactElement
}

export function CheckboxFormItem<TSchema extends Record<string, unknown>>({
  className,
  field,
  label,
  helpText,
  ...rest
}: CheckboxFormItemProps<TSchema>) {
  const error = useFormFieldError(field)

  return (
    <Controller
      name={field}
      render={({ field: { value, onChange } }) => (
        <div className={cn('grid', className)}>
          <div className="ml-0.5 flex items-center space-x-2">
            <Checkbox id={field} name={field} checked={value} onCheckedChange={onChange} {...rest} />
            {label && (
              <Label htmlFor={field} aria-invalid={Boolean(error)}>
                {label}
              </Label>
            )}
          </div>
          <HintText errorText={error?.message} helpText={helpText} />
        </div>
      )}
    />
  )
}
