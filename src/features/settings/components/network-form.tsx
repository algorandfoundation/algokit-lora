import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { localnetConfig, networksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { z } from 'zod'

const serverSchema = z.object({
  server: zfd.text(z.string().url()),
  port: zfd.numeric(z.number().min(0).max(65535)),
  token: zfd.text(z.string().optional()),
  promptForToken: z.boolean(),
})

const networkSchema = zfd.formData({
  networkId: zfd.text(),
  name: zfd.text(),
  indexer: serverSchema,
  algod: serverSchema,
  // TODO: make fields non optional if 1 is specified
  // kmd: z.object({
  //   server: zfd.text(z.string().url().optional()),
  //   port: zfd.numeric(z.number().min(0).max(65535).optional()),
  //   token: zfd.text(z.string().optional()),
  //   promptForToken: z.boolean().optional(),
  // }),
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
      indexer: selectedNetworkConfig.indexer,
      algod: selectedNetworkConfig.algod,
      kmd: selectedNetworkConfig.kmd,
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
          <fieldset>
            <legend>Indexer</legend>
            {helper.textField({
              label: 'Server',
              field: 'indexer.server',
            })}
            {helper.numberField({
              label: 'Port',
              field: 'indexer.port',
            })}
            {helper.checkboxField({
              label: 'Prompt for Token',
              field: 'indexer.promptForToken',
            })}
            {helper.textField({
              label: 'Token',
              field: 'indexer.token',
            })}
          </fieldset>
          <fieldset>
            <legend>Algod</legend>
            {helper.textField({
              label: 'Server',
              field: 'algod.server',
            })}
            {helper.numberField({
              label: 'Port',
              field: 'algod.port',
            })}
            {/*{helper.checkboxField({*/}
            {/*  label: 'Prompt for Token',*/}
            {/*  field: 'algod.promptForToken',*/}
            {/*})}*/}
            {helper.textField({
              label: 'Token',
              field: 'algod.token',
            })}
          </fieldset>
          {/*<fieldset>*/}
          {/*  <legend>KMD</legend>*/}
          {/*  {helper.textField({*/}
          {/*    label: 'Server',*/}
          {/*    field: 'kmd.server',*/}
          {/*  })}*/}
          {/*  {helper.numberField({*/}
          {/*    label: 'Port',*/}
          {/*    field: 'kmd.port',*/}
          {/*  })}*/}
          {/*  {helper.textField({*/}
          {/*    label: 'Token',*/}
          {/*    field: 'kmd.token',*/}
          {/*  })}*/}
          {/*</fieldset>*/}
          <FormActions>
            <SubmitButton>Save</SubmitButton>
          </FormActions>
        </div>
      )}
    </Form>
  )
}
