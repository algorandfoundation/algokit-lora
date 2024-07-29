import { TextFormItem, TextFormItemProps } from '@/features/forms/components/text-form-item'
import { NumberFormItem, NumberFormItemProps } from '@/features/forms/components/number-form-item'
import { SelectFormItem, SelectFormItemProps } from '@/features/forms/components/select-form-item'
import { CheckboxFormItem, CheckboxFormItemProps } from '@/features/forms/components/checkbox-form-item'
import { PasswordFormItem, PasswordFormItemProps } from '@/features/forms/components/password-form-item'
import { MultiSelectFormItem, MultiSelectFormItemProps } from '@/features/forms/components/multi-select-form-item.tsx'

export class FormFieldHelper<TSchema extends Record<string, unknown>> {
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

  multiSelectField(props: MultiSelectFormItemProps<TSchema>) {
    return <MultiSelectFormItem {...this.prefixFieldProp(props)} />
  }

  checkboxField(props: CheckboxFormItemProps<TSchema>) {
    return <CheckboxFormItem {...this.prefixFieldProp(props)} />
  }

  passwordField(props: PasswordFormItemProps<TSchema>) {
    return <PasswordFormItem {...this.prefixFieldProp(props)} />
  }
}
