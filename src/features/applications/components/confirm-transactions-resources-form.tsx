import { CancelButton } from '@/features/forms/components/cancel-button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

// TODO: boxes
export type TransactionResources = {
  accounts: algosdk.Address[]
  assets: number[]
  applications: number[]
}

type Props = {
  resources: TransactionResources
  onSubmit: (resources: TransactionResources) => void
  onCancel: () => void
}

const formSchema = zfd.formData({
  accounts: zfd.repeatable(z.array(z.object({ id: z.string(), address: zfd.text() })).max(4)),
  assets: zfd.repeatable(z.array(z.object({ id: z.string(), assetId: numberSchema(z.number().min(0)) })).max(8)),
  applications: zfd.repeatable(z.array(z.object({ id: z.string(), applicationId: numberSchema(z.number().min(0)) })).max(8)),
})

export function ConfirmTransactionsResourcesForm({ resources, onSubmit, onCancel }: Props) {
  const defaultValues = useMemo(() => {
    return {
      accounts: (resources.accounts ?? []).map((address) => ({
        id: algosdk.encodeAddress(address.publicKey),
        address: algosdk.encodeAddress(address.publicKey),
      })),
      assets: (resources.assets ?? []).map((asset) => ({
        id: asset.toString(),
        assetId: asset,
      })),
      applications: (resources.applications ?? []).map((application) => ({
        id: application.toString(),
        applicationId: application,
      })),
    }
  }, [resources])

  const submit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      const accounts = data.accounts.map((account) => algosdk.decodeAddress(account.address))
      const assets = data.assets.map((asset) => asset.assetId)
      const applications = data.applications.map((application) => application.applicationId)
      if (accounts.length + assets.length + applications.length > 8) {
        throw new Error('Total number of accounts, assets, and applications cannot exceed 8')
      }

      onSubmit({
        accounts,
        assets,
        applications,
      })
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
      {(helper) => (
        <div className="space-y-4">
          {helper.arrayField({
            label: 'Accounts',
            field: `accounts`,
            renderChildField: (_, index) =>
              helper.textField({
                label: `Account ${index + 1}`,
                field: `accounts.${index}.address`,
              }),
            newItem: () => ({ id: new Date().getTime().toString(), address: '' }),
            max: 4,
            addButtonLabel: 'Add Account',
          })}
          {helper.arrayField({
            label: 'Assets',
            field: `assets`,
            renderChildField: (_, index) =>
              helper.numberField({
                label: `Asset ${index + 1}`,
                field: `assets.${index}.assetId`,
              }),
            newItem: () => ({ id: new Date().getTime().toString(), assetId: undefined as unknown as number }),
            max: 8,
            addButtonLabel: 'Add Asset',
          })}
          {helper.arrayField({
            label: 'Applications',
            field: `applications`,
            renderChildField: (_, index) =>
              helper.numberField({
                label: `Application ${index + 1}`,
                field: `applications.${index}.applicationId`,
              }),
            newItem: () => ({ id: new Date().getTime().toString(), applicationId: undefined as unknown as number }),
            max: 8,
            addButtonLabel: 'Add Application',
          })}
        </div>
      )}
    </Form>
  )
}
