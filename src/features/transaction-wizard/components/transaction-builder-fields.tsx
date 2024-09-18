import { BuildableTransaction, BuildableTransactionFormField, BuildableTransactionFormFieldType } from '../models'
import { z } from 'zod'
import { FieldArray, FieldValues, Path } from 'react-hook-form'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { FormItemProps } from '@/features/forms/components/form-item'

type Props<TSchema extends z.ZodSchema> = {
  helper: FormFieldHelper<z.infer<TSchema>>
  transaction: BuildableTransaction<TSchema>
}

type Fields<TSchema extends z.ZodSchema, TData = z.infer<TSchema>> = {
  [K in keyof TData]: [Path<TData>, BuildableTransactionFormField]
}[keyof TData][]
function fields<TSchema extends z.ZodSchema>(buildableTransaction: BuildableTransaction<TSchema>): Fields<TSchema> {
  return Object.entries(buildableTransaction.fields) as Fields<TSchema>
}

export function TransactionBuilderFields<TSchema extends z.ZodSchema>({ helper, transaction }: Props<TSchema>) {
  return (
    <>
      {fields(transaction).map(([path, field], i) => {
        const common = {
          key: i,
          label: field.label,
          field: path,
          placeholder: field.placeholder,
          helpText: field.description,
        } satisfies Omit<FormItemProps<z.infer<TSchema>>, 'children'> & { placeholder?: string }

        switch (field.type) {
          case BuildableTransactionFormFieldType.Text:
            return helper.textField({
              ...common,
            })
          case BuildableTransactionFormFieldType.Number:
            return helper.numberField({
              ...common,
            })
          case BuildableTransactionFormFieldType.Account:
            return helper.textField({
              ...common,
            })
          case BuildableTransactionFormFieldType.AlgoAmount:
            return helper.numberField({
              ...common,
              label: (
                <span className="flex items-center gap-1.5">
                  {field.label}
                  <SvgAlgorand className="h-auto w-3" />
                </span>
              ),
              decimalScale: 6,
              thousandSeparator: true,
            })
          case BuildableTransactionFormFieldType.Fee:
            return <TransactionBuilderFeeField key={common.key} helper={helper} path={path} field={field} />
          case BuildableTransactionFormFieldType.ValidRounds:
            return <TransactionBuilderValidRoundField key={common.key} helper={helper} path={path} field={field} />
          case BuildableTransactionFormFieldType.Array:
            return helper.arrayField({
              ...common,
              renderChildField(_, index) {
                return helper.textField({ ...common, field: `${path}.${index}.value` as Path<z.infer<TSchema>> })
              },
              // TODO: PD - can we fix this type?
              newItem: () => ({ id: new Date().getTime().toString(), value: '' }) as FieldArray<FieldValues, Path<z.infer<TSchema>>>,
            })
          default:
            return undefined
        }
      })}
    </>
  )
}
