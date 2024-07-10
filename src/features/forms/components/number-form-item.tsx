/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, FieldPath } from 'react-hook-form'
import { forwardRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { cn } from '@/features/common/utils'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'

type InputProps = {
  decimalScale?: number
  thousandSeparator?: boolean
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
const NumberFormat = forwardRef<HTMLInputElement, NumberFormatProps>(
  ({ onChange, value, className, decimalScale, thousandSeparator, ...rest }, ref) => {
    return (
      <NumericFormat
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

export interface NumberFormItemProps<TSchema extends Record<string, any> = Record<string, any>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  decimalScale?: number
  thousandSeparator?: boolean
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
