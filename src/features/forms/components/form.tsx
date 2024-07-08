/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { Controller, DefaultValues, FieldPath, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { cloneElement, forwardRef, ReactElement, ReactNode, useCallback, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { cn } from '@/features/common/utils'
import { FormStateContextProvider, useFieldMetaData, useFormState } from '@/features/forms/hooks/form-state-context'
import { useFormFieldError } from '@/features/forms/hooks/use-form-field-error'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/features/common/components/button'

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

export interface ValidationErrorMessageProps {
  message?: string
}

export function ValidationErrorMessage({ message }: ValidationErrorMessageProps) {
  return message ? <p>{message}</p> : <></>
}

export interface TextFormItemProps<TSchema extends Record<string, any> = Record<string, any>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export function TextFormItem<TSchema extends Record<string, any> = Record<string, any>>({
  field,
  placeholder,
  ...props
}: TextFormItemProps<TSchema>) {
  const { register } = useFormContext<TSchema>()

  return (
    <FormItem {...props} field={field}>
      <input autoComplete={'off'} type="text" {...register(field)} placeholder={placeholder} disabled={props.disabled} />
    </FormItem>
  )
}

type InputProps = {
  decimalScale?: number
  className?: string
  placeholder?: string
  disabled?: boolean
}

export type InputNumberProps<TSchema extends Record<string, any> = Record<string, any>> = InputProps & {
  field: FieldPath<TSchema>
}

export function InputNumber<TSchema extends Record<string, any> = Record<string, any>>({ field, ...rest }: InputNumberProps<TSchema>) {
  return <Controller render={({ field }) => <NumberFormat {...field} {...rest} />} name={field} />
}

type NumberFormatProps = InputProps & {
  value: number | undefined
  onChange: (value: number | undefined) => void
}
const NumberFormat = forwardRef<HTMLInputElement, NumberFormatProps>(({ onChange, value, className, decimalScale, ...rest }, ref) => {
  return (
    <NumericFormat
      className={cn(className)}
      getInputRef={ref}
      value={value}
      thousandSeparator={true}
      decimalScale={decimalScale ?? 0}
      onValueChange={(target) => {
        onChange(target.floatValue ?? (null as unknown as number))
      }}
      {...rest}
    />
  )
})

export interface NumberFormItemProps<TSchema extends Record<string, any> = Record<string, any>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  decimalScale?: number
  placeholder?: string
}

export function NumberFormItem<TSchema extends Record<string, any> = Record<string, any>>({
  field,
  placeholder,
  decimalScale,
  disabled,
  ...props
}: NumberFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field} disabled={disabled}>
      <InputNumber field={field} placeholder={placeholder} decimalScale={decimalScale} disabled={disabled} />
    </FormItem>
  )
}

export interface ValidatedFormProps<TData, TSchema extends Record<string, any>> {
  className?: string
  children: React.ReactNode | ((helper: FormFieldHelper<TSchema>) => React.ReactNode)
  validator: z.ZodEffects<any, TSchema, any>
  defaultValues?: DefaultValues<TSchema>
  onSubmit?(values: TSchema): Promise<TData>
}

export function ValidatedForm<TData, TSchema extends Record<string, any>>({
  className,
  children,
  validator,
  defaultValues,
  onSubmit: onSubmitProp,
}: ValidatedFormProps<TData, TSchema>) {
  const [submitting, setSubmitting] = useState(false)
  const formCtx = useForm<TSchema>({
    resolver: zodResolver(validator),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = useCallback(
    async (values: TSchema) => {
      setSubmitting(true)
      try {
        await onSubmitProp?.(values)
      } finally {
        setSubmitting(false)
      }
    },
    [onSubmitProp]
  )

  const handleSubmit = onSubmit && formCtx.handleSubmit(onSubmit)

  return (
    <FormStateContextProvider
      value={{
        submitting,
        validator,
      }}
    >
      <FormProvider {...formCtx}>
        <form className={cn(className)} onSubmit={handleSubmit}>
          {typeof children === 'function' ? children(new FormFieldHelper<TSchema>()) : children}
        </form>
      </FormProvider>
    </FormStateContextProvider>
  )
}

export interface FormActionsProps {
  className?: string
  children?: ReactNode
}

export function FormActions({ className, children }: FormActionsProps) {
  return (
    <div className={cn(className)}>
      <div className={cn()}>{children}</div>
    </div>
  )
}

export interface SubmitButtonProps {
  className?: string
  icon?: ReactElement
  children?: React.ReactNode
}

export function SubmitButton({ className, children, icon }: SubmitButtonProps) {
  // const { submitting } = useFormState()
  // TODO: loading state
  return (
    <Button variant={'default'} type={'submit'} className={cn(className)} icon={icon}>
      {children}
    </Button>
  )
}
