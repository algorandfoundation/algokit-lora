import { Controller, FieldPath } from 'react-hook-form'
import { forwardRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { cn } from '@/features/common/utils'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'

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
