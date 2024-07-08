/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextFormItem, TextFormItemProps } from '@/features/forms/components/text-form-item'
import { NumberFormItem, NumberFormItemProps } from '@/features/forms/components/number-form-item'
import { SelectFormItem, SelectFormItemProps } from '@/features/forms/components/select-form-item'

export class FormFieldHelper<TSchema extends Record<string, any>> {
  private readonly fieldPrefix: string

  constructor({ fieldPrefix }: { fieldPrefix?: string } = {}) {
    this.fieldPrefix = fieldPrefix ? `${fieldPrefix}.` : ''
  }

  private prefixFieldProp<T extends { field: string & keyof TSchema }>(props: T) {
    return {
      ...props,
      field: `${this.fieldPrefix}${props.field}`,
    }
  }

  textField(props: TextFormItemProps<TSchema>) {
    return <TextFormItem {...this.prefixFieldProp(props)} />
  }

  numberField(props: NumberFormItemProps<TSchema>) {
    return <NumberFormItem {...this.prefixFieldProp(props)} />
  }

  selectField(props: SelectFormItemProps<TSchema>) {
    return <SelectFormItem {...this.prefixFieldProp(props)} />
  }
}
