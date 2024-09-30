import { Address } from '@/features/accounts/data/types'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { numberSchema } from '@/features/forms/data/common'
import { addressFieldSchema } from '@/features/transaction-wizard/data/common'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export type TransactionResources = {
  accounts: Address[]
  assets: number[]
  applications: number[]
  boxes: string[]
}

type Props = {
  resources: TransactionResources
  onSubmit: (resources: TransactionResources) => void
  onCancel: () => void
}

const formSchema = zfd.formData({
  accounts: zfd.repeatable(z.array(z.object({ id: z.string(), address: addressFieldSchema })).max(4)),
  assets: zfd.repeatable(z.array(z.object({ id: z.string(), assetId: numberSchema(z.number().min(0)) })).max(8)),
  applications: zfd.repeatable(z.array(z.object({ id: z.string(), applicationId: numberSchema(z.number().min(0)) })).max(8)),
  boxes: zfd.repeatable(z.array(z.object({ id: z.string(), boxName: zfd.text() })).max(8)),
})

export function ConfirmTransactionsResourcesForm({ resources, onSubmit, onCancel }: Props) {
  const defaultValues = useMemo(() => {
    return {
      accounts: (resources.accounts ?? []).map((address) => ({
        id: address,
        address: address,
      })),
      assets: (resources.assets ?? []).map((asset) => ({
        id: asset.toString(),
        assetId: asset,
      })),
      applications: (resources.applications ?? []).map((application) => ({
        id: application.toString(),
        applicationId: application,
      })),
      boxes: (resources.boxes ?? []).map((box) => ({
        id: box,
        boxName: box,
      })),
    }
  }, [resources])

  const submit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      const accounts = data.accounts.map((account) => account.address)
      const assets = data.assets.map((asset) => asset.assetId)
      const applications = data.applications.map((application) => application.applicationId)
      const boxes = data.boxes.map((box) => box.boxName)
      if (accounts.length + assets.length + applications.length + boxes.length > 8) {
        throw new Error('Total number of references cannot exceed 8')
      }

      onSubmit({
        accounts,
        assets,
        applications,
        boxes,
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
          <SubmitButton className="w-28">Update</SubmitButton>
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
            noItemsLabel: 'No accounts.',
          })}
          <hr />
          {helper.arrayField({
            label: 'Assets',
            field: `assets`,
            renderChildField: (_, index) =>
              helper.numberField({
                label: `Asset ${index + 1}`,
                field: `assets.${index}.assetId`,
              }),
            newItem: () => ({ id: new Date().getTime().toString(), assetId: '' as unknown as number }),
            max: 8,
            addButtonLabel: 'Add Asset',
            noItemsLabel: 'No assets.',
          })}
          <hr />
          {helper.arrayField({
            label: 'Applications',
            field: `applications`,
            renderChildField: (_, index) =>
              helper.numberField({
                label: `Application ${index + 1}`,
                field: `applications.${index}.applicationId`,
              }),
            newItem: () => ({ id: new Date().getTime().toString(), applicationId: '' as unknown as number }),
            max: 8,
            addButtonLabel: 'Add Application',
            noItemsLabel: 'No Applications.',
          })}
          <hr />
          {helper.arrayField({
            label: 'Boxes',
            field: `boxes`,
            renderChildField: (_, index) =>
              helper.textField({
                label: `Box ${index + 1}`,
                field: `boxes.${index}.boxName`,
                helpText: 'A Base64 encoded box name',
              }),
            newItem: () => ({ id: new Date().getTime().toString(), boxName: '' }),
            max: 8,
            addButtonLabel: 'Add Box',
            noItemsLabel: 'No Boxes.',
          })}
        </div>
      )}
    </Form>
  )
}
