import { useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form'

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
