import { CancelButton } from '@/features/forms/components/cancel-button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export type TransactionResources = {
  id: string
  accounts: algosdk.Address[]
  assets: number[]
  applications: number[]
}

type Props = {
  transactions: TransactionResources[]
  onSubmit: (transactions: TransactionResources[]) => void
  onCancel: () => void
}

const transactionResourcesFormSchema = z.object({
  id: z.string(),
  accounts: zfd.repeatable(z.array(z.object({ id: z.string(), address: zfd.text() })).max(4)),
  assets: zfd.repeatable(z.array(z.object({ id: z.string(), assetId: numberSchema(z.number().min(0)) })).max(8)),
  applications: zfd.repeatable(z.array(z.object({ id: z.string(), applicationId: numberSchema(z.number().min(0)) })).max(8)),
})
const formSchema = zfd.formData({
  transactions: zfd.repeatable(z.array(transactionResourcesFormSchema)),
})

export function ConfirmTransactionsResourcesForm({ transactions, onSubmit, onCancel }: Props) {
  const defaultValues = useMemo(() => {
    return {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        accounts: (transaction.accounts ?? []).map((address) => ({
          id: algosdk.encodeAddress(address.publicKey),
          address: algosdk.encodeAddress(address.publicKey),
        })),
        assets: (transaction.assets ?? []).map((asset) => ({
          id: asset.toString(),
          assetId: asset,
        })),
        applications: (transaction.applications ?? []).map((application) => ({
          id: application.toString(),
          applicationId: application,
        })),
      })),
    }
  }, [transactions])

  const submit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      onSubmit(
        data.transactions.map((transaction) => {
          const accounts = transaction.accounts.map((account) => algosdk.decodeAddress(account.address))
          const assets = transaction.assets.map((asset) => asset.assetId)
          const applications = transaction.applications.map((application) => application.applicationId)
          if (accounts.length + assets.length + applications.length > 8) {
            throw new Error('Total number of accounts, assets, and applications cannot exceed 8')
          }

          return {
            id: transaction.id,
            accounts,
            assets,
            applications,
          }
        })
      )
    },
    [onSubmit]
  )

  return (
    <Form
      schema={formSchema}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton className="w-28" onClick={onCancel} />
          <SubmitButton className="w-28">Submit</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}

function FormInner({ helper }: { helper: FormFieldHelper<z.infer<typeof formSchema>> }) {
  const { control } = useFormContext<z.infer<typeof formSchema>>()
  const { fields } = useFieldArray({
    control,
    name: 'transactions',
  })

  return fields.map((field, index) => <TransactionResourcesForm key={field.id} helper={helper} transactionIndex={index} />)
}

function TransactionResourcesForm({
  helper,
  transactionIndex,
}: {
  helper: FormFieldHelper<z.infer<typeof formSchema>>
  transactionIndex: number
}) {
  return (
    <div className="space-y-4">
      {helper.arrayField({
        label: 'Accounts',
        field: `transactions.${transactionIndex}.accounts`,
        renderChildField: (_, index) =>
          helper.textField({
            label: `Account ${index + 1}`,
            field: `transactions.${transactionIndex}.accounts.${index}.address`,
          }),
        newItem: () => ({ id: new Date().getTime().toString(), address: '' }),
        max: 4,
        addButtonLabel: 'Add Account',
      })}
      {helper.arrayField({
        label: 'Assets',
        field: `transactions.${transactionIndex}.assets`,
        renderChildField: (_, index) =>
          helper.numberField({
            label: `Asset ${index + 1}`,
            field: `transactions.${transactionIndex}.assets.${index}.assetId`,
          }),
        newItem: () => ({ id: new Date().getTime().toString(), assetId: undefined as unknown as number }),
        max: 8,
        addButtonLabel: 'Add Asset',
      })}
      {helper.arrayField({
        label: 'Applications',
        field: `transactions.${transactionIndex}.applications`,
        renderChildField: (_, index) =>
          helper.numberField({
            label: `Application ${index + 1}`,
            field: `transactions.${transactionIndex}.applications.${index}.applicationId`,
          }),
        newItem: () => ({ id: new Date().getTime().toString(), applicationId: undefined as unknown as number }),
        max: 8,
        addButtonLabel: 'Add Application',
      })}
    </div>
  )
}
