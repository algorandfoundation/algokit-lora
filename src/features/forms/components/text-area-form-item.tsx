import { useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { TextAreaInput } from '@/features/common/components/input'

export interface TextAreaFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export function TextAreaFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  disabled,
  placeholder,
  ...props
}: TextAreaFormItemProps<TSchema>) {
  const { register } = useFormContext<TSchema>()

  return (
    <FormItem {...props} field={field} disabled={disabled}>
      <TextAreaInput
        id={field}
        autoComplete={'off'}
        {...register(field)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={field}
      />
    </FormItem>
  )
}
