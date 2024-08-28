import { BuildableTransaction, BuildableTransactionFormFieldType } from '../models'
import { z } from 'zod'
import { Path } from 'react-hook-form'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'

type Props<TSchema extends z.ZodSchema> = {
  helper: FormFieldHelper<z.infer<TSchema>>
  transaction: BuildableTransaction<TSchema>
}

type Entries<T extends Record<string, unknown>> = { [K in keyof T]: [K, T[K]] }[keyof T][]
function entries<T extends Record<string, unknown>>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>
}

export function TransactionBuilderFields<TSchema extends z.ZodSchema>({ helper, transaction }: Props<TSchema>) {
  return (
    <>
      {entries(transaction.fields).map(([name, field], i) => {
        const path = name as Path<TSchema> // TODO: NC - Can we get rid of this?
        const common = {
          key: i,
          label: field.label,
          field: path,
          placeholder: field.placeholder,
          helpText: field.description,
        }
        switch (field.type) {
          case BuildableTransactionFormFieldType.Text:
            return helper.textField({
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
            return <TransactionBuilderFeeField key={i} helper={helper} path={path} field={field} schema={transaction.schema} />
          case BuildableTransactionFormFieldType.ValidRounds:
            return <TransactionBuilderValidRoundField key={i} helper={helper} path={path} field={field} schema={transaction.schema} />
          default:
            return undefined
        }
      })}
    </>
  )
}
