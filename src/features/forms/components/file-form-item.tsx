import { Controller, FieldPath } from 'react-hook-form'
import { FormItem } from '@/features/forms/components/form-item'
import { FileInput, FileInputProps } from '@/features/forms/components/file-input'

export interface FileFormItemProps<TSchema extends Record<string, unknown>> extends Omit<FileInputProps, 'value' | 'onChange'> {
  label: string
  field: FieldPath<TSchema>
}

export function FileFormItem<TSchema extends Record<string, unknown>>({
  label,
  field,
  disabled,
  accept,
  placeholder,
}: FileFormItemProps<TSchema>) {
  return (
    <FormItem label={label} field={field} disabled={disabled}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <FileInput value={value} onChange={onChange} accept={accept} placeholder={placeholder} disabled={disabled} />
        )}
      />
    </FormItem>
  )
}
