/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, FormItemProps } from '@/features/forms/components/form-item.tsx'
import { Controller, ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import MultipleSelector, { Option } from '@/features/common/components/multi-selector.tsx'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface MultiSelectFormItemProps<TSchema extends Record<string, any>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: Option[]
  placeholder?: string
  className?: string
  newItemText?: string
  onNewItemSelected?: () => void
}

export function MultiSelectFormItem<TSchema extends Record<string, any>>({
  field,
  options,
  placeholder,
  className,
  ...props
}: MultiSelectFormItemProps<TSchema>) {
  // TODO: handle disabled and error class
  return (
    <FormItem field={field} {...props}>
      <Controller
        name={field}
        render={({ field: { value, onChange, ...rest } }) => (
          <MultipleSelector
            defaultOptions={options}
            // value={options.filter((i) => value.includes(i.value))}
            // onChange={(selected) => {
            //   console.log(selected)
            //   onChangeField(selected.map((i) => i.value))
            // }}
            // value={value}
            // onChange={(selected) => {
            //   console.log(selected)
            //   onChange(selected)
            // }}
            {...rest}
          ></MultipleSelector>
        )}
      />
    </FormItem>
  )
}

function MyTestInput<TSchema extends Record<string, any>>({ field }: { field: ControllerRenderProps<FieldValues, Path<TSchema>> }) {
  const { value, onChange } = field
  const [text, setText] = useState<string>(value)

  useEffect(() => {
    setText(value)
  }, [setText, value])
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(e.target.value)
      }}
    />
  )
}

function Foo<TSchema extends Record<string, any>>({
  field,
  options,
}: {
  field: ControllerRenderProps<FieldValues, Path<TSchema>>
  options: Option[]
}) {
  // useEffect(() => {
  //   console.log('init')
  // }, [])
  const { value, onChange: onChangeField, ...rest } = field
  // const [selected, setSelected] = useState<Option[]>(options.filter((i) => value.includes(i.value)))

  // useEffect(() => {
  //   console.log('here, useEffect')
  //   setSelectedItems(options.filter((i) => value.includes(i.value)))
  // }, [options, value])
  // console.log(options, value)

  // console.log('here', value, selected)

  // const selectedItems = useMemo(() => options.filter((i) => value.includes(i.value)), [options, value])
  // const onChange = useCallback(
  //   (selectedOptions: Option[]) => {
  //     console.log('onSelectChange', selectedOptions)
  //     setSelected(selectedOptions)
  //     onChangeField(selectedOptions.map((i) => i.value))
  //   },
  //   [onChangeField]
  // )

  return (
    <MultipleSelector
      defaultOptions={options}
      value={options.filter((i) => value.includes(i.value))}
      onChange={(selected) => {
        console.log(selected)
        onChangeField(selected.map((i) => i.value))
      }}
      {...rest}
    ></MultipleSelector>
  )
}
