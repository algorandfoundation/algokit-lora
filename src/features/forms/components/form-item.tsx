/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneElement, ReactElement, ReactNode } from 'react'
import { FieldPath } from 'react-hook-form'
import { useFieldMetaData } from '@/features/forms/hooks/form-state-context'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { cn } from '@/features/common/utils'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'

export interface FormItemProps<TSchema extends Record<string, any> = Record<string, any>> {
  className?: string
  children: ReactElement | ((props: { className: string }) => ReactNode)
  label: string
  field: FieldPath<TSchema>
  disabled?: boolean
  htmlFor?: string
  fullWidth?: boolean
}

export function FormItem<TSchema extends Record<string, any> = Record<string, any>>({
  className,
  label,
  field,
  children,
  htmlFor,
}: FormItemProps<TSchema>) {
  const { required } = useFieldMetaData(field)
  const error = useFormFieldError(field)
  return (
    <div className={cn(className)}>
      <label
        htmlFor={htmlFor}
        // TODO: disabled and error class
        aria-invalid={Boolean(error)}
      >
        <span>
          {label}
          {required && ' *'}
        </span>
        {children &&
          (typeof children === 'function'
            ? children({ className: className ?? '' })
            : cloneElement(children, { className: cn(children.props.className) }))}
      </label>
      <ValidationErrorMessage message={error?.message} />
    </div>
  )
}
