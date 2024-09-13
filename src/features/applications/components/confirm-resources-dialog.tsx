import { Button } from '@/features/common/components/button'
import { Form } from '@/features/forms/components/form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { TrashIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

// TODO: validation for the numbder of accounts
// TODO: validation for the number of total resources

type Props = {
  transactions: algosdk.Transaction[]
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

export function ConfirmResourcesDialog({ transactions }: Props) {
  const defaultValues = useMemo(() => {
    return {
      transactions: transactions.map((transaction) => ({
        id: transaction.txID(),
        accounts: (transaction.appAccounts ?? []).map((address) => ({
          id: address.toString(),
          address: address.toString(),
        })),
        assets: (transaction.appForeignAssets ?? []).map((asset) => ({
          id: asset.toString(),
          assetId: asset,
        })),
        applications: (transaction.appForeignApps ?? []).map((application) => ({
          id: application.toString(),
          applicationId: application,
        })),
      })),
    }
  }, [transactions])

  return (
    <Form schema={formSchema} onSubmit={() => {}} defaultValues={defaultValues} formAction={<></>}>
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

  return fields.map((field, index) => <TransactionResourcesForm key={field.id} helper={helper} index={index} />)
}

// TODO: is there a way to make this not rely on `transaction`?
function TransactionResourcesForm({ helper, index }: { helper: FormFieldHelper<z.infer<typeof formSchema>>; index: number }) {
  const { control } = useFormContext<z.infer<typeof formSchema>>()

  const {
    fields: accounts,
    append: appendAccount,
    remove: removeAccount,
  } = useFieldArray({
    control,
    name: `transactions.${index}.accounts`,
  })

  const {
    fields: assets,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: `transactions.${index}.assets`,
  })

  const {
    fields: applications,
    append: appendApplication,
    remove: removeApplication,
  } = useFieldArray({
    control,
    name: `transactions.${index}.applications`,
  })

  // TODO: the remove buttons aren't line-up right
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3>Accounts</h3>
        {accounts.map((account, index) => {
          return (
            <div key={account.id} className="flex gap-2">
              <div className="grow">{helper.textField({ label: 'Account', field: `transactions.${index}.accounts.${index}.address` })}</div>
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
              <div className="grow">{helper.numberField({ label: 'Asset', field: `transactions.${index}.assets.${index}.assetId` })}</div>
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
        {applications.map((application, index) => {
          return (
            <div key={application.id} className="flex gap-2">
              <div className="grow">
                {helper.numberField({ label: 'Application', field: `transactions.${index}.applications.${index}.applicationId` })}
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
