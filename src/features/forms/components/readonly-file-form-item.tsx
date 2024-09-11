import { Controller, FieldPath } from 'react-hook-form'
import { FormItem } from '@/features/forms/components/form-item'
import { FileInputProps } from '@/features/forms/components/file-input'

export interface ReadonlyFileFormItemProps<TSchema extends Record<string, unknown>>
  extends Omit<FileInputProps, 'value' | 'onChange' | 'fieldName'> {
  label: string
  field: FieldPath<TSchema>
}

export function ReadonlyFileFormItem<TSchema extends Record<string, unknown>>({ label, field }: ReadonlyFileFormItemProps<TSchema>) {
  return (
    <FormItem label={label} field={field}>
      <Controller name={field} render={({ field: { value } }) => <span className="text-sm text-primary">{value?.name}</span>} />
    </FormItem>
  )
}
