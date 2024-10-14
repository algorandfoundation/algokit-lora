import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { Button } from '@/features/common/components/button'
import { isArc32AppSpec } from '@/features/common/utils'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { bigIntSchema } from '@/features/forms/data/common'
import { invariant } from '@/utils/invariant'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const schema = zfd.formData({
  name: zfd.text(),
  roundFirstValid: bigIntSchema(z.bigint().min(1n).optional()),
  roundLastValid: bigIntSchema(z.bigint().min(1n).optional()),
})

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function WIPAppDetails({ machine }: Props) {
  const [state, send] = machine
  invariant(state.context.appSpec && isArc32AppSpec(state.context.appSpec), 'ARC32 app spec is required')

  const appSpec = state.context.appSpec

  const next = useCallback(
    (values: z.infer<typeof schema>) => {
      send({
        type: 'detailsCompleted',
        name: values.name,
        roundFirstValid: values.roundFirstValid,
        roundLastValid: values.roundLastValid,
      })
    },
    [send]
  )

  const back = useCallback(() => {
    send({ type: 'detailsCancelled' })
  }, [send])

  // TODO: NC - Ensure name is unique

  const defaultValues = useMemo(
    () => ({
      name: state.context.name ?? appSpec.contract.name,
      roundFirstValid: state.context.roundFirstValid,
      roundLastValid: state.context.roundLastValid,
    }),
    [appSpec.contract.name, state.context.name, state.context.roundFirstValid, state.context.roundLastValid]
  )

  return (
    <Form
      className="duration-300 animate-in fade-in-20"
      schema={schema}
      onSubmit={next}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <Button type="button" variant="outline" className="mr-auto w-24" onClick={back} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <SubmitButton className="w-24">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.textField({
            field: 'name',
            label: 'Name',
            helpText: 'Name of the app interface',
          })}
          {helper.numberField({
            label: 'First valid round',
            field: 'roundFirstValid',
            helpText: 'The first round the app spec is valid. Leave blank if the app has not been updated',
          })}
          {helper.numberField({
            label: 'Last valid round',
            field: 'roundLastValid',
            helpText: 'The last round the app spec is valid. Leave blank if the app has not been updated',
          })}
        </>
      )}
    </Form>
  )
}
