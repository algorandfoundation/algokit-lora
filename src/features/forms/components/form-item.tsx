import { cloneElement, ReactElement, ReactNode } from 'react'
import { FieldPath } from 'react-hook-form'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'
import { Label } from '@/features/common/components/label'

export interface FormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>> {
  className?: string
  children: ReactElement | ((props: { className?: string; field: FieldPath<TSchema> }) => ReactNode)
  label: string
  field: FieldPath<TSchema>
  disabled?: boolean
  fullWidth?: boolean
}

export function FormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  className,
  label,
  field,
  children,
}: FormItemProps<TSchema>) {
  const error = useFormFieldError(field)
  return (
    <div className={cn('grid', className)}>
      <Label htmlFor={field} aria-invalid={Boolean(error)} className="mb-2 ml-0.5">
        {label}
      </Label>
      {children &&
        (typeof children === 'function'
          ? children({ className, field })
          : cloneElement(children, { className: cn(children.props.className) }))}
      <ValidationErrorMessage message={error?.message} />
    </div>
  )
}
