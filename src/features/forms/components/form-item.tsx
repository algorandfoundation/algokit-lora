import { cloneElement, Key, ReactElement, ReactNode } from 'react'
import { FieldPath } from 'react-hook-form'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { cn } from '@/features/common/utils'
import { HintText } from '@/features/forms/components/hint-text'
import { Label } from '@/features/common/components/label'
import { useFieldMetadata } from '../hooks/use-field-metadata'

export interface FormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>> {
  key?: Key
  className?: string
  children: ReactElement | ((props: { className?: string; field: FieldPath<TSchema> }) => ReactNode)
  label: string | ReactElement
  field: FieldPath<TSchema>
  disabled?: boolean
  fullWidth?: boolean
  helpText?: string | ReactElement
}

export function FormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  className,
  label,
  field,
  helpText,
  children,
}: FormItemProps<TSchema>) {
  const error = useFormFieldError(field)
  const { required } = useFieldMetadata(field)

  return (
    <div className={cn('grid', className)}>
      <Label htmlFor={field} aria-invalid={Boolean(error)} className="mb-2 ml-0.5 flex">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </Label>
      {children &&
        (typeof children === 'function'
          ? children({ className, field })
          : cloneElement(children, { className: cn(children.props.className) }))}
      <HintText errorText={error?.message} helpText={helpText} />
    </div>
  )
}
