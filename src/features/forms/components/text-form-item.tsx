import { useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Input } from '@/features/common/components/input'

export interface TextFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export function TextFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  disabled,
  placeholder,
  ...props
}: TextFormItemProps<TSchema>) {
  const { register } = useFormContext<TSchema>()

  return (
    <FormItem {...props} field={field} disabled={disabled}>
      <Input
        id={field}
        autoComplete={'off'}
        type="text"
        {...register(field)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={field}
      />
    </FormItem>
  )
}
