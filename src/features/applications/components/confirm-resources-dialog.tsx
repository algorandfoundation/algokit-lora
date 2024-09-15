import { Button } from '@/features/common/components/button'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { TrashIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

// TODO: validation for the numbder of accounts
// TODO: validation for the number of total resources

export type TransactionResources = {
  id: string
  accounts: algosdk.Address[]
  assets: number[]
  applications: number[]
}

type Props = {
  transactions: TransactionResources[]
  onSubmit: (transactions: TransactionResources[]) => void
}

const transactionResourcesFormSchema = z.object({
  id: z.string(),
  accounts: z.array(z.object({ id: z.string(), address: zfd.text() })),
  assets: z.array(z.object({ id: z.string(), assetId: numberSchema(z.number().min(0)) })),
  applications: z.array(z.object({ id: z.string(), applicationId: numberSchema(z.number().min(0)) })),
})
const formSchema = zfd.formData({
  transactions: zfd.repeatable(z.array(transactionResourcesFormSchema)),
})

export function ConfirmResourcesDialog({ transactions, onSubmit }: Props) {
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
        data.transactions.map((transaction) => ({
          id: transaction.id,
          accounts: transaction.accounts.map((account) => algosdk.decodeAddress(account.address)),
          assets: transaction.assets.map((asset) => asset.assetId),
          applications: transaction.applications.map((application) => application.applicationId),
        }))
      )
    },
    [onSubmit]
  )

  // TODO: consider reset?
  return (
    <Form
      schema={formSchema}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton className="w-28" onClick={() => {}} />
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

// TODO: is there a way to make this not rely on `transaction`?
function TransactionResourcesForm({
  helper,
  transactionIndex,
}: {
  helper: FormFieldHelper<z.infer<typeof formSchema>>
  transactionIndex: number
}) {
  const { control } = useFormContext<z.infer<typeof formSchema>>()

  const {
    fields: accounts,
    append: appendAccount,
    remove: removeAccount,
  } = useFieldArray({
    control,
    name: `transactions.${transactionIndex}.accounts`,
  })

  const {
    fields: assets,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: `transactions.${transactionIndex}.assets`,
  })

  const {
    fields: applications,
    append: appendApplication,
    remove: removeApplication,
  } = useFieldArray({
    control,
    name: `transactions.${transactionIndex}.applications`,
  })

  // TODO: the remove buttons aren't line-up right
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3>Accounts</h3>
        {accounts.map((account, index) => {
          return (
            <div key={account.id} className="flex gap-2">
              <div className="grow">
                {helper.textField({ label: 'Account', field: `transactions.${transactionIndex}.accounts.${index}.address` })}
              </div>
              <Button
                type="button"
                className="mt-[1.375rem]"
                variant="destructive"
                size="sm"
                onClick={() => removeAccount(index)}
                icon={<TrashIcon size={16} />}
              />
            </div>
          )
        })}
        <Button type="button" className="mt-2" onClick={() => appendAccount({ id: new Date().getTime().toString(), address: '' })}>
          Add Account
        </Button>
      </div>
      <div className="space-y-2">
        <h3>Assets</h3>
        {assets.map((asset, index) => {
          return (
            <div key={asset.id} className="flex gap-2">
              <div className="grow">
                {helper.numberField({ label: 'Asset', field: `transactions.${transactionIndex}.assets.${index}.assetId` })}
              </div>
              <Button
                type="button"
                className="mt-[1.375rem]"
                variant="destructive"
                size="sm"
                onClick={() => removeAsset(index)}
                icon={<TrashIcon size={16} />}
              />
            </div>
          )
        })}
        <Button
          type="button"
          onClick={() => appendAsset({ id: new Date().getTime().toString(), assetId: undefined as unknown as number })}
          className="mt-2"
        >
          Add Asset
        </Button>
      </div>
      <div className="space-y-2">
        <h3>Applications</h3>
        {applications.map((application, index) => {
          return (
            <div key={application.id} className="flex gap-2">
              <div className="grow">
                {helper.numberField({
                  label: 'Application',
                  field: `transactions.${transactionIndex}.applications.${index}.applicationId`,
                })}
              </div>
              <Button
                type="button"
                className="mt-[1.375rem]"
                variant="destructive"
                size="sm"
                onClick={() => removeApplication(index)}
                icon={<TrashIcon size={16} />}
              />
            </div>
          )
        })}
        <Button
          type="button"
          onClick={() => appendApplication({ id: new Date().getTime().toString(), applicationId: undefined as unknown as number })}
        >
          Add Application
        </Button>
      </div>
    </div>
  )
}
