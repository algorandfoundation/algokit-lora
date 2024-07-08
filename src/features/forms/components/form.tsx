/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { DefaultValues, FieldPath } from 'react-hook-form'
import { cloneElement, ReactElement, ReactNode, useCallback } from 'react'
import { cn } from '@/features/common/utils'
import { useFieldMetaData } from '@/features/forms/hooks/form-state-context'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { ValidationErrorMessage } from '@/features/forms/components/validation-error-message'
import { TextFormItem, TextFormItemProps } from '@/features/forms/components/text-form-item'
import { NumberFormItem, NumberFormItemProps } from '@/features/forms/components/number-form-item'
import { ValidatedForm } from '@/features/forms/components/validated-form'

export interface FormProps<TData, TSchema extends Record<string, any>> {
  className?: string
  header?: string
  schema: z.ZodEffects<any, TSchema, any>
  defaultValues?: DefaultValues<TSchema>
  children: ReactNode | ((helper: FormFieldHelper<TSchema>) => ReactNode)
  onSuccess: (data: TData) => void
  onSubmit: (values: z.infer<z.ZodEffects<any, TSchema, any>>) => Promise<TData>
}

export function Form<TData, TSchema extends Record<string, any>>({
  header,
  schema,
  children,
  defaultValues,
  onSubmit: onSubmitProp,
  onSuccess,
}: FormProps<TData, TSchema>) {
  const onSubmit = useCallback(
    async (values: z.infer<z.ZodEffects<any, TSchema, any>>) => {
      const data = await onSubmitProp?.(values)
      onSuccess?.(data)
    },
    [onSubmitProp, onSuccess]
  )

  return (
    <div>
      <h1>{header}</h1>
      <ValidatedForm validator={schema} onSubmit={onSubmit} defaultValues={defaultValues}>
        {children}
      </ValidatedForm>
    </div>
  )
}

export class FormFieldHelper<TSchema extends Record<string, any>> {
  private readonly fieldPrefix: string
  constructor({ fieldPrefix }: { fieldPrefix?: string } = {}) {
    this.fieldPrefix = fieldPrefix ? `${fieldPrefix}.` : ''
  }

  private prefixFieldProp<T extends { field: string & keyof TSchema }>(props: T) {
    return {
      ...props,
      field: `${this.fieldPrefix}${props.field}`,
    }
  }

  textField(props: TextFormItemProps<TSchema>) {
    return <TextFormItem {...this.prefixFieldProp(props)} />
  }
  numberField(props: NumberFormItemProps<TSchema>) {
    return <NumberFormItem {...this.prefixFieldProp(props)} />
  }
}

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
