import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/features/common/components/dialog'
import { Form } from '@/features/forms/components/form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { useMemo } from 'react'
import { Field, FieldPath, Path, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

type Props = {
  transactions: algosdk.Transaction[]
}

const transactionResourcesFormSchema = z.object({
  id: z.string(),
  accounts: z.array(z.object({ id: z.string(), address: z.string() })),
  assets: z.array(z.object({ id: z.string(), assetId: numberSchema(z.number().min(0)) })),
  applications: z.array(z.object({ id: z.string(), applicationId: numberSchema(z.number().min(0)) })),
})
const formSchema = zfd.formData({
  transactions: zfd.repeatableOfType(transactionResourcesFormSchema),
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
  const { fields } = useFieldArray({
    name: 'transactions',
  })

  return fields.map((field) => {
    return <TransactionResourcesForm key={field.id} helper={helper} field={field} />
  })
}

function TransactionResourcesForm({
  helper,
  field,
}: {
  helper: FormFieldHelper<z.infer<typeof formSchema>>
  field: FieldPath<typeof formSchema>
}) {
  const {
    fields: accounts,
    // append: appendAccount,
    // remove: removeAccount,
  } = useFieldArray({
    name: `${field}.accounts`,
  })
  const {
    fields: assets,
    // append: appendAsset,
    // remove: removeAsset,
  } = useFieldArray({
    name: `${field}.assets`,
  })
  const {
    fields: applications,
    // append: appendApplication,
    // remove: removeApplication,
  } = useFieldArray({
    name: `${field}.applications`,
  })

  return (
    <div>
      <div>
        <h3>Accounts</h3>
        {accounts.map((account, index) => {
          return <div key={account.id}>{helper.textField({ label: 'Account', field: `${account}.address` })}</div>
        })}
        {assets.map((asset, index) => {
          return <div key={asset.id}>{helper.numberField({ label: 'Asset', field: `${asset}.assetId` })}</div>
        })}
        {applications.map((application, index) => {
          return <div key={application.id}>{helper.numberField({ label: 'Application', field: `${application}.applicationId` })}</div>
        })}
      </div>
    </div>
  )
}
