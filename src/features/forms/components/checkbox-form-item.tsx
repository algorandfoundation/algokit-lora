/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldPath, useFormContext } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'
import { Checkbox } from '@/features/common/components/checkbox'

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
  disabled,
  ...rest
}: CheckboxFormItemProps<TSchema>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TSchema>()

  // TODO: handle disabled and error class
  return (
    <div>
      <label className={cn(className)} aria-invalid={errors[field] ? 'true' : 'false'}>
        <input type="checkbox" {...register(field)} {...rest} disabled={disabled} />
        {label && <span>{label}</span>}
      </label>
      <ValidationErrorMessage message={errors[field]?.message as string} />
    </div>
  )
}
