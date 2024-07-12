/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, ControllerRenderProps, FieldValues, Path, useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Input } from '@/features/common/components/input'
import { useEffect, useState } from 'react'

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
      <Input autoComplete={'off'} type="text" {...register(field)} placeholder={placeholder} disabled={props.disabled} />
    </FormItem>
  )
}

export function MyTestFormItem<TSchema extends Record<string, any> = Record<string, any>>({
  field,
  placeholder,
  ...props
}: TextFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field}>
      <Controller name={field} render={({ field }) => <MyTestInput field={field} />} />
    </FormItem>
  )
}

function MyTestInput<TSchema extends Record<string, any>>({ field }: { field: ControllerRenderProps<FieldValues, Path<TSchema>> }) {
  const { value, onChange } = field
  const [text, setText] = useState<string>(value)

  useEffect(() => {
    console.log('here')
    setText(value)
  }, [setText, value])
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(e.target.value.toUpperCase())
      }}
    />
  )
}
