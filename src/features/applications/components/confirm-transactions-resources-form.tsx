import { Address } from '@/features/accounts/data/types'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { bigIntSchema } from '@/features/forms/data/common'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ApplicationId } from '../data/types'
import { randomGuid } from '@/utils/random-guid'
import { isAddress } from '@/utils/is-address'
import { AssetId } from '@/features/assets/data/types'

export type TransactionResources = {
  accounts: Address[]
  assets: AssetId[]
  applications: ApplicationId[]
  boxes: (readonly [ApplicationId, string])[]
}

type Props = {
  resources: TransactionResources
  onSubmit: (resources: TransactionResources) => void
  onCancel: () => void
}

const formSchema = zfd.formData({
  accounts: zfd.repeatable(
    z
      .array(
        z.object({
          id: z.string(),
          address: zfd.text().refine((value) => (value ? isAddress(value) : true), {
            message: 'Invalid address',
          }),
        })
      )
      .max(4)
  ),
  assets: zfd.repeatable(z.array(z.object({ id: z.string(), assetId: bigIntSchema(z.bigint().min(0n)) })).max(8)),
  applications: zfd.repeatable(z.array(z.object({ id: z.string(), applicationId: bigIntSchema(z.bigint().min(0n)) })).max(8)),
  boxes: zfd.repeatable(
    z.array(z.object({ id: z.string(), applicationId: bigIntSchema(z.bigint().min(0n)), boxName: zfd.text(z.string().optional()) })).max(8)
  ),
})

export function ConfirmTransactionsResourcesForm({ resources, onSubmit, onCancel }: Props) {
  const defaultValues = useMemo(() => {
    return {
      accounts: (resources.accounts ?? []).map((address) => ({
        id: randomGuid(),
        address: address,
      })),
      assets: (resources.assets ?? []).map((asset) => ({
        id: randomGuid(),
        assetId: asset,
      })),
      applications: (resources.applications ?? []).map((application) => ({
        id: randomGuid(),
        applicationId: application,
      })),
      boxes: (resources.boxes ?? []).map(([applicationId, boxName]) => ({
        id: randomGuid(),
        applicationId,
        boxName,
      })),
    }
  }, [resources])

  const submit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      const accounts = data.accounts.map((account) => account.address)
      const assets = data.assets.map((asset) => asset.assetId)
      const applications = data.applications.map((application) => application.applicationId)
      const boxes = data.boxes.map((box) => [box.applicationId, box.boxName ?? ''] as const)
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
            newItem: () => ({ id: randomGuid(), address: '' }),
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
            newItem: () => ({ id: randomGuid(), assetId: '' as unknown as number }),
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
            newItem: () => ({ id: randomGuid(), applicationId: '' as unknown as number }),
            max: 8,
            addButtonLabel: 'Add Application',
            noItemsLabel: 'No Applications.',
          })}
          <hr />
          {helper.arrayField({
            label: 'Boxes',
            field: `boxes`,
            deleteButtonClassName: 'mt-12',
            renderChildField: (_, index) => (
              <div className="flex flex-col gap-1">
                <span className="ml-0.5 text-sm font-medium">Box {index + 1}</span>
                <div className="flex gap-2">
                  {helper.textField({
                    label: 'Application ID',
                    field: `boxes.${index}.applicationId`,
                    className: 'w-1/4 self-start',
                  })}
                  {helper.textField({
                    label: 'Name',
                    field: `boxes.${index}.boxName`,
                    helpText: 'A Base64 encoded box name',
                    className: 'w-3/4 self-start',
                  })}
                </div>
              </div>
            ),
            newItem: () => ({ id: randomGuid(), boxName: '' }),
            max: 8,
            addButtonLabel: 'Add Box',
            noItemsLabel: 'No Boxes.',
          })}
        </div>
      )}
    </Form>
  )
}
