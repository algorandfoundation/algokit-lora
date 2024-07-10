/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Input } from '@/features/common/components/input'

export interface PasswordFormItemProps<TSchema extends Record<string, any> = Record<string, any>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export function PasswordFormItem<TSchema extends Record<string, any> = Record<string, any>>({
  field,
  placeholder,
  ...props
}: PasswordFormItemProps<TSchema>) {
  const { register } = useFormContext<TSchema>()

  return (
    <FormItem {...props} field={field}>
      <Input autoComplete={'off'} type="password" {...register(field)} placeholder={placeholder} disabled={props.disabled} />
    </FormItem>
  )
}
