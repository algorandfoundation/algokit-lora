import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { Button } from '@/features/common/components/button'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { bigIntSchema } from '@/features/forms/data/common'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { useLoadableAppInterfacesAtom } from '../../data'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

const schema = zfd.formData(
  z
    .object({
      name: zfd.text(),
      appInterfaceExists: z.boolean().optional(),
      roundFirstValid: bigIntSchema(z.bigint().min(1n).optional()),
      roundLastValid: bigIntSchema(z.bigint().min(1n).optional()),
    })
    .superRefine((schema, ctx) => {
      if (schema.appInterfaceExists === true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'App interface with this name already exists',
          path: ['name'],
        })
      }
    })
)

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof schema>>
}

function FormInner({ helper }: FormInnerProps) {
  const formCtx = useFormContext<z.infer<typeof schema>>()
  const { setValue, trigger } = formCtx
  const loadableAppInterfaces = useLoadableAppInterfacesAtom()
  const appInterfaceNameFieldValue = formCtx.watch('name')
  const [appInterfaceName] = useDebounce(appInterfaceNameFieldValue, 500)

  useEffect(() => {
    if (loadableAppInterfaces.state === 'hasData') {
      const appInterfaceExists = loadableAppInterfaces.data.some(
        (appInterface) => appInterface.name.toLowerCase() === appInterfaceName.toLowerCase()
      )
      setValue('appInterfaceExists', appInterfaceExists)
      trigger()
    }
  }, [appInterfaceName, loadableAppInterfaces, setValue, trigger])

  return (
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
  )
}

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function AppDetails({ machine }: Props) {
  const [state, send] = machine

  const appSpec = state.context.appSpec
  const contractName = appSpec ? (('name' in appSpec ? appSpec.name : appSpec.contract.name) as string) : undefined

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

  const defaultValues = useMemo(
    () => ({
      name: state.context.name ?? contractName,
      roundFirstValid: state.context.roundFirstValid,
      roundLastValid: state.context.roundLastValid,
    }),
    [contractName, state.context.name, state.context.roundFirstValid, state.context.roundLastValid]
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
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}
