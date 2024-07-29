import { Controller, FieldPath } from 'react-hook-form'
import { forwardRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { cn } from '@/features/common/utils'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'

type NumericFormatWithRefProps<TSchema extends Record<string, unknown> = Record<string, unknown>> = {
  decimalScale?: number
  thousandSeparator?: boolean
  placeholder?: string
  field: FieldPath<TSchema>
  className?: string
  disabled?: boolean
  ['aria-label']?: string
  value: number | undefined
  onChange: (value: number | undefined) => void
}
const NumericFormatWithRef = forwardRef<HTMLInputElement, NumericFormatWithRefProps>(
  ({ onChange, value, className, decimalScale, thousandSeparator, field, ...rest }, ref) => {
    return (
      <NumericFormat
        id={field}
        className={cn(
          'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        getInputRef={ref}
        value={value}
        thousandSeparator={thousandSeparator}
        decimalScale={decimalScale ?? 0}
        onValueChange={(target) => {
          onChange(target.floatValue ?? (null as unknown as number))
        }}
        {...rest}
      />
    )
  }
)

export interface NumberFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  decimalScale?: number
  thousandSeparator?: boolean
  placeholder?: string
}

export function NumberFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  disabled,
  ...props
}: NumberFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field} disabled={disabled}>
      <Controller
        name={field}
        render={({ field: controllerField }) => (
          <NumericFormatWithRef field={field} {...controllerField} disabled={disabled} aria-label={field} {...props} />
        )}
      />
    </FormItem>
  )
}
