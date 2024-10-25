import { TextFormItem, TextFormItemProps } from '@/features/forms/components/text-form-item'
import { NumberFormItem, NumberFormItemProps } from '@/features/forms/components/number-form-item'
import { SelectFormItem, SelectFormItemProps } from '@/features/forms/components/select-form-item'
import { CheckboxFormItem, CheckboxFormItemProps } from '@/features/forms/components/checkbox-form-item'
import { PasswordFormItem, PasswordFormItemProps } from '@/features/forms/components/password-form-item'
import { MultiSelectFormItem, MultiSelectFormItemProps } from '@/features/forms/components/multi-select-form-item.tsx'
import { FileFormItem, FileFormItemProps } from '@/features/forms/components/file-form-item'
import { ReadonlyFileFormItem } from '@/features/forms/components/readonly-file-form-item'
import { AbiDynamicArrayFormItem, AbiDynamicArrayFormItemProps } from '@/features/forms/components/abi-dynamic-array-form-item'
import { AbiStaticArrayFormItem, AbiStaticArrayFormItemProps } from '@/features/forms/components/abi-static-array-form-item'
import { AbiTupleFormItem, AbiTupleFormItemProps } from '@/features/forms/components/abi-tuple-form-item'
import { TransactionFormItem, TransactionFormItemProps } from './transaction-form-item'
import { ArrayFormItem, ArrayFormItemProps } from './array-form-item'
import { RadioGroupFormItem, RadioGroupFormItemProps } from './radio-group-form-item'

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

  fileField(props: FileFormItemProps<TSchema>) {
    return <FileFormItem {...this.prefixFieldProp(props)} />
  }

  readonlyFileField(props: FileFormItemProps<TSchema>) {
    return <ReadonlyFileFormItem {...this.prefixFieldProp(props)} />
  }

  abiDynamicArrayField(props: AbiDynamicArrayFormItemProps<TSchema>) {
    return <AbiDynamicArrayFormItem {...this.prefixFieldProp(props)} />
  }

  abiStaticArrayField(props: AbiStaticArrayFormItemProps<TSchema>) {
    return <AbiStaticArrayFormItem {...this.prefixFieldProp(props)} />
  }

  abiTupleField(props: AbiTupleFormItemProps<TSchema>) {
    return <AbiTupleFormItem {...this.prefixFieldProp(props)} />
  }

  transactionField(props: TransactionFormItemProps<TSchema>) {
    return <TransactionFormItem {...this.prefixFieldProp(props)} />
  }

  arrayField(props: ArrayFormItemProps<TSchema>) {
    return <ArrayFormItem {...this.prefixFieldProp(props)} />
  }

  radioGroupField(props: RadioGroupFormItemProps<TSchema>) {
    return <RadioGroupFormItem {...this.prefixFieldProp(props)} />
  }
}
