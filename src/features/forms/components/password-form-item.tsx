import { useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Input } from '@/features/common/components/input'

export interface PasswordFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export function PasswordFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  placeholder,
  ...props
}: PasswordFormItemProps<TSchema>) {
  const { register } = useFormContext<TSchema>()

  return (
    <FormItem {...props} field={field}>
      <Input
        id={field}
        autoComplete={'off'}
        type="password"
        {...register(field, { shouldUnregister: true })}
        placeholder={placeholder}
        disabled={props.disabled}
      />
    </FormItem>
  )
}
