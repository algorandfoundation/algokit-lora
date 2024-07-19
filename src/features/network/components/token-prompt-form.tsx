import { useSetNetworkPromptedTokens } from '@/features/network/data'
import { useCallback, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { NetworkConfigWithId } from '../data/types'

type Props = {
  networkConfig: NetworkConfigWithId
}

const defaultValues = {
  algod: '',
  indexer: '',
  kmd: '',
}

const maybeRequiredString = (isRequired?: boolean) => {
  return isRequired ? z.string() : z.string().optional()
}

export function TokenPromptForm({ networkConfig }: Props) {
  const setNetworkPromptedTokens = useSetNetworkPromptedTokens()
  const schema = useMemo(() => {
    return zfd.formData({
      algod: zfd.text(maybeRequiredString(networkConfig.algod.promptForToken)),
      indexer: zfd.text(maybeRequiredString(networkConfig.indexer.promptForToken)),
      kmd: zfd.text(maybeRequiredString(networkConfig.kmd?.promptForToken)),
    })
  }, [networkConfig.algod.promptForToken, networkConfig.indexer.promptForToken, networkConfig.kmd?.promptForToken])

  const saveNetworkTokens = useCallback(
    async (values: z.infer<typeof schema>) => {
      setNetworkPromptedTokens(networkConfig.id, values)
    },
    [networkConfig.id, setNetworkPromptedTokens]
  )

  return (
    <Form
      className="mt-4"
      schema={schema}
      onSubmit={saveNetworkTokens}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {networkConfig.algod.promptForToken &&
            helper.passwordField({
              label: 'Algod Token',
              field: 'algod',
            })}
          {networkConfig.indexer.promptForToken &&
            helper.passwordField({
              label: 'Indexer Token',
              field: 'indexer',
            })}
          {networkConfig.kmd?.promptForToken &&
            helper.passwordField({
              label: 'KMD Token',
              field: 'kmd',
            })}
        </>
      )}
    </Form>
  )
}
