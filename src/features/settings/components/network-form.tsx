import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { localnetConfig, networksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { z } from 'zod'

const networkSchema = zfd.formData({
  networkId: zfd.text(),
  name: zfd.text(),
})

export function NetworkForm() {
  const onSubmit = useCallback(async (values: z.infer<typeof networkSchema>) => {
    console.log(values)
    return Promise.resolve()
  }, [])
  const onSuccess = useCallback(() => {}, [])

  const networksOptions = useMemo(
    () =>
      networksConfigs.map((n) => ({
        value: n.id,
        label: n.name,
      })),
    []
  )

  const [selectedNetwork] = useSelectedNetwork()
  const selectedNetworkConfig = useMemo(() => networksConfigs.find((n) => n.id === selectedNetwork) ?? localnetConfig, [selectedNetwork])

  const defaultValues = useMemo(
    () => ({
      networkId: selectedNetworkConfig.id,
      name: selectedNetworkConfig.name,
    }),
    [selectedNetworkConfig]
  )

  return (
    <Form header="Network" schema={networkSchema} onSubmit={onSubmit} onSuccess={onSuccess} defaultValues={defaultValues}>
      {(helper) => (
        <div>
          {helper.selectField({
            label: 'Network',
            field: 'networkId',
            items: networksOptions,
          })}
          {helper.textField({
            label: 'Name',
            field: 'name',
          })}
          <FormActions>
            <SubmitButton>Save</SubmitButton>
          </FormActions>
        </div>
      )}
    </Form>
  )
}
